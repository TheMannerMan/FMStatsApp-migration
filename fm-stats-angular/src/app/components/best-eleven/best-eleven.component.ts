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
import { buildScoreMatrix } from '../../utils/score-matrix';
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
  protected formationRows = [0, 1, 2, 3];

  selectedRoles = signal<(string | null)[]>(new Array(11).fill(null));
  result = signal<ResultEntry[] | null>(null);

  protected hasEnoughPlayers = computed(() => this.players().length >= 11);

  protected canCalculate = computed(() => {
    if (!this.hasEnoughPlayers()) return false;
    return this.selectedRoles().every(r => r !== null);
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

  protected getScoreClass(score: number): string {
    if (score >= 8.0) return 'score-high';
    if (score >= 6.0) return 'score-medium';
    return 'score-low';
  }

  calculate(): void {
    const players = this.players();
    const slotRoles = this.selectedRoles() as string[];
    const matrix = buildScoreMatrix(players, slotRoles);
    const assignments: Assignment[] = hungarian(matrix);

    const entries: ResultEntry[] = assignments.map(a => ({
      slot: this.formation[a.slotIndex],
      player: players[a.playerIndex],
      role: slotRoles[a.slotIndex],
      score: a.score,
    }));

    this.result.set(entries);
  }

  protected getResultForSlot(slotIndex: number): ResultEntry | undefined {
    const res = this.result();
    if (!res) return undefined;
    return res.find(e => e.slot === this.formation[slotIndex]);
  }
}
