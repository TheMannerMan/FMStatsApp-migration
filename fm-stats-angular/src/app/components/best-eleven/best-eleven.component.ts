import { Component, inject, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { RoleInfo } from '../../models/role-group.model';
import { FORMATION_442, FormationSlot } from '../../models/formation.model';
import { buildScoreMatrix, getPlayerRoleScore, buildConstrainedScoreMatrix } from '../../utils/score-matrix';
import { hungarian, Assignment } from '../../utils/hungarian';

export interface ResultEntry {
  slot: FormationSlot;
  player: Player;
  role: string;
  score: number;
}

@Component({
  selector: 'app-best-eleven',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, ButtonModule],
  templateUrl: './best-eleven.component.html',
  styleUrl: './best-eleven.component.scss',
})
export class BestElevenComponent {
  private playerService = inject(PlayerService);

  protected players = toSignal(this.playerService.players$, { initialValue: [] as Player[] });
  protected roles = this.playerService.roles;
  protected formation = FORMATION_442;
  protected formationRows = [...new Set(FORMATION_442.map(s => s.row))].sort((a, b) => a - b);

  selectedRoles = signal<(string | null)[]>(new Array(11).fill(null));
  lockedPlayers = signal<(number | null)[]>(new Array(11).fill(null));
  result = signal<ResultEntry[] | null>(null);

  protected hasEnoughPlayers = computed(() => this.players().length >= 11);

  protected canCalculate = computed(() => {
    if (!this.hasEnoughPlayers()) return false;
    return this.selectedRoles().every(r => r !== null);
  });

  protected availablePlayersForSlot = computed(() => {
    const allPlayers = this.players();
    const locks = this.lockedPlayers();
    return this.formation.map((_, slotIndex) => {
      const lockedUids = new Set(
        locks.filter((uid, i) => uid !== null && i !== slotIndex)
      );
      return allPlayers.filter(p => !lockedUids.has(p.uid));
    });
  });

  protected averageScore = computed(() => {
    const res = this.result();
    if (!res) return null;
    return res.reduce((sum, e) => sum + e.score, 0) / res.length;
  });

  protected availableRolesForSlot = computed(() => {
    const roleGroups = this.roles();
    const allRoles: RoleInfo[] = Object.values(roleGroups).flat();
    return this.formation.map(slot =>
      allRoles.filter(r => r.positions.includes(slot.position))
    );
  });

  protected slotsInRow(row: number): { slot: FormationSlot; index: number }[] {
    return this.formation
      .map((slot, index) => ({ slot, index }))
      .filter(s => s.slot.row === row);
  }

  protected onRoleChange(slotIndex: number, roleName: string | null): void {
    const current = [...this.selectedRoles()];
    current[slotIndex] = roleName;
    this.selectedRoles.set(current);
    this.result.set(null);
  }

  protected onLockChange(slotIndex: number, playerUid: number | null): void {
    const current = [...this.lockedPlayers()];
    current[slotIndex] = playerUid;
    this.lockedPlayers.set(current);
    this.result.set(null);
  }

  protected reset(): void {
    this.result.set(null);
    this.lockedPlayers.set(new Array(11).fill(null));
  }

  protected getScoreClass(score: number): string {
    if (score >= 8.0) return 'score-high';
    if (score >= 6.0) return 'score-medium';
    return 'score-low';
  }

  calculate(): void {
    if (!this.canCalculate()) return;
    const players = this.players();
    const slotRoles = this.selectedRoles() as string[];
    const locks = this.lockedPlayers();

    // Build locked pairs
    const lockedPairs: { slotIndex: number; playerIndex: number }[] = [];
    locks.forEach((uid, slotIndex) => {
      if (uid !== null) {
        const playerIndex = players.findIndex(p => p.uid === uid);
        if (playerIndex >= 0) {
          lockedPairs.push({ slotIndex, playerIndex });
        }
      }
    });

    // Pre-build locked entries
    const lockedEntries: ResultEntry[] = lockedPairs.map(lp => ({
      slot: this.formation[lp.slotIndex],
      player: players[lp.playerIndex],
      role: slotRoles[lp.slotIndex],
      score: getPlayerRoleScore(players[lp.playerIndex], slotRoles[lp.slotIndex]),
    }));

    // Build constrained matrix and run Hungarian on free slots
    const { matrix, rowMap, colMap } = buildConstrainedScoreMatrix(
      players, slotRoles, lockedPairs
    );

    let freeEntries: ResultEntry[] = [];
    if (matrix.length > 0 && matrix[0]?.length > 0) {
      const assignments = hungarian(matrix);
      freeEntries = assignments.map(a => ({
        slot: this.formation[colMap[a.slotIndex]],
        player: players[rowMap[a.playerIndex]],
        role: slotRoles[colMap[a.slotIndex]],
        score: a.score,
      }));
    }

    this.result.set([...lockedEntries, ...freeEntries]);
  }

  protected getResultForSlot(slotIndex: number): ResultEntry | undefined {
    const res = this.result();
    if (!res) return undefined;
    return res.find(e => e.slot === this.formation[slotIndex]);
  }
}
