import { Component, inject, computed, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { RoleInfo } from '../../models/role-group.model';
import { FORMATION_442, FormationSlot } from '../../models/formation.model';
import { getPlayerRoleScore, buildConstrainedScoreMatrix, applyPositionRestriction } from '../../utils/score-matrix';
import { isPlayerEligibleForSlot } from '../../utils/position-eligibility';
import { hungarian } from '../../utils/hungarian';
import { RolePickerModalComponent } from '../role-picker-modal/role-picker-modal.component';
import { PlayerPickerModalComponent } from '../player-picker-modal/player-picker-modal.component';

export interface ResultEntry {
  slot: FormationSlot;
  player: Player;
  role: string;
  score: number;
}

@Component({
  selector: 'app-best-eleven',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToggleSwitchModule, RolePickerModalComponent, PlayerPickerModalComponent],
  templateUrl: './best-eleven.component.html',
  styleUrl: './best-eleven.component.scss',
})
export class BestElevenComponent {
  private playerService = inject(PlayerService);
  private readonly STORAGE_KEY = 'best_xi_marked_players';

  protected players = toSignal(this.playerService.players$, { initialValue: [] as Player[] });
  protected roles = this.playerService.roles;
  protected formation = FORMATION_442;
  protected formationRows = [...new Set(FORMATION_442.map(s => s.row))].sort((a, b) => a - b);

  selectedRoles = signal<(string | null)[]>(new Array(11).fill(null));
  lockedPlayers = signal<(number | null)[]>(new Array(11).fill(null));
  result = signal<ResultEntry[] | null>(null);
  markedPlayerUids = signal<Set<number>>(new Set());
  positionRestriction = signal(false);

  // ── Modal state ──────────────────────────────────────────────────────────

  private rolePickerVisible = signal(false);
  private rolePickerSlot = signal<number | null>(null);
  private playerPickerVisible = signal(false);
  private playerPickerSlot = signal<number | null>(null);

  get rolePickerVisibleValue(): boolean { return this.rolePickerVisible(); }
  set rolePickerVisibleValue(v: boolean) { this.rolePickerVisible.set(v); }

  get playerPickerVisibleValue(): boolean { return this.playerPickerVisible(); }
  set playerPickerVisibleValue(v: boolean) { this.playerPickerVisible.set(v); }

  // ── Modal computeds ──────────────────────────────────────────────────────

  protected rolesForPickerModal = computed(() => {
    const i = this.rolePickerSlot();
    return i !== null ? (this.availableRolesForSlot()[i] ?? []) : [];
  });

  protected selectedRoleForPickerModal = computed(() => {
    const i = this.rolePickerSlot();
    return i !== null ? (this.selectedRoles()[i] ?? null) : null;
  });

  protected eligiblePlayersForModal = computed(() => {
    const i = this.playerPickerSlot();
    if (i === null) return [];
    const marked = this.markedPlayerUids();
    const locks = this.lockedPlayers();
    const lockedElsewhere = new Set(
      locks
        .map((uid, idx) => (uid !== null && idx !== i ? uid : null))
        .filter((uid): uid is number => uid !== null)
    );
    return this.players().filter(p => marked.has(p.uid) && !lockedElsewhere.has(p.uid));
  });

  protected roleForPlayerModal = computed(() => {
    const i = this.playerPickerSlot();
    return i !== null ? (this.selectedRoles()[i] ?? null) : null;
  });

  protected lockedPlayerUidForModal = computed(() => {
    const i = this.playerPickerSlot();
    return i !== null ? (this.lockedPlayers()[i] ?? null) : null;
  });

  // ── Existing computeds ───────────────────────────────────────────────────

  protected allMarked = computed(() =>
    this.markedPlayerUids().size === this.players().length && this.players().length > 0
  );

  protected eligiblePlayers = computed(() => {
    const marked = this.markedPlayerUids();
    const lockedUids = new Set(
      this.lockedPlayers().filter((uid): uid is number => uid !== null)
    );
    return this.players().filter(p => marked.has(p.uid) || lockedUids.has(p.uid));
  });

  protected hasEnoughPlayers = computed(() => this.eligiblePlayers().length >= 11);

  protected positionRestrictionErrors = computed((): string[] => {
    if (!this.positionRestriction()) return [];
    const players = this.eligiblePlayers();
    const locks = this.lockedPlayers();
    const lockedUids = new Set(locks.filter((uid): uid is number => uid !== null));

    return this.formation
      .map((slot, slotIndex) => {
        const lockedUid = locks[slotIndex];
        // Locked player bypasses restriction check for this slot
        if (lockedUid !== null) return null;
        // Check if any non-locked eligible player can play this position
        const hasEligible = players
          .filter(p => !lockedUids.has(p.uid))
          .some(p => isPlayerEligibleForSlot(p, slot.position));
        return hasEligible ? null : slot.position;
      })
      .filter((pos): pos is string => pos !== null);
  });

  protected canCalculate = computed(() => {
    if (!this.hasEnoughPlayers()) return false;
    if (!this.selectedRoles().every(r => r !== null)) return false;
    if (this.positionRestriction() && this.positionRestrictionErrors().length > 0) return false;
    return true;
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

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    let storedMarked: Set<number> | null = null;
    if (stored) {
      try {
        storedMarked = new Set(JSON.parse(stored) as number[]);
      } catch { /* ignore invalid stored data */ }
    }

    let prevPlayerUids = new Set<number>();
    let initialized = false;

    effect(() => {
      const current = this.players();
      if (current.length === 0) return;

      const currentUids = new Set(current.map(p => p.uid));

      if (!initialized) {
        initialized = true;
        if (storedMarked !== null) {
          const intersected = new Set([...storedMarked].filter(uid => currentUids.has(uid)));
          this.markedPlayerUids.set(intersected);
        } else {
          this.markedPlayerUids.set(new Set(currentUids));
        }
      } else {
        const uidsDiffer =
          currentUids.size !== prevPlayerUids.size ||
          [...currentUids].some(uid => !prevPlayerUids.has(uid));
        if (uidsDiffer) {
          this.markedPlayerUids.set(new Set(currentUids));
        }
      }

      prevPlayerUids = currentUids;
    });

    effect(() => {
      const marked = this.markedPlayerUids();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...marked]));
    });
  }

  toggleMark(uid: number): void {
    const current = new Set(this.markedPlayerUids());
    if (current.has(uid)) {
      current.delete(uid);
    } else {
      current.add(uid);
    }
    this.markedPlayerUids.set(current);
  }

  markAll(): void {
    this.markedPlayerUids.set(new Set(this.players().map(p => p.uid)));
  }

  protected slotsInRow(row: number): { slot: FormationSlot; index: number }[] {
    return this.formation
      .map((slot, index) => ({ slot, index }))
      .filter(s => s.slot.row === row);
  }

  onToggleRestriction(): void {
    this.positionRestriction.update(v => !v);
    this.result.set(null);
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

  // ── Modal helpers ────────────────────────────────────────────────────────

  protected getRoleFullName(slotIndex: number): string | null {
    const short = this.selectedRoles()[slotIndex];
    if (!short) return null;
    return this.availableRolesForSlot()[slotIndex]
      ?.find(r => r.shortRoleName === short)?.roleName ?? null;
  }

  protected getLockedPlayerName(slotIndex: number): string | null {
    const uid = this.lockedPlayers()[slotIndex];
    return uid !== null ? (this.players().find(p => p.uid === uid)?.name ?? null) : null;
  }

  protected openRolePicker(slotIndex: number): void {
    this.rolePickerSlot.set(slotIndex);
    this.rolePickerVisible.set(true);
  }

  protected onRolePickerSelect(shortRoleName: string | null): void {
    const i = this.rolePickerSlot();
    if (i !== null) this.onRoleChange(i, shortRoleName);
    this.rolePickerVisible.set(false);
    this.rolePickerSlot.set(null);
  }

  protected openPlayerPicker(slotIndex: number): void {
    this.playerPickerSlot.set(slotIndex);
    this.playerPickerVisible.set(true);
  }

  protected onPlayerPickerSelect(playerUid: number | null): void {
    const i = this.playerPickerSlot();
    if (i !== null) this.onLockChange(i, playerUid);
    this.playerPickerVisible.set(false);
    this.playerPickerSlot.set(null);
  }

  // ── Calculate ────────────────────────────────────────────────────────────

  calculate(): void {
    if (!this.canCalculate()) return;
    const players = this.eligiblePlayers();
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

    if (this.positionRestriction() && matrix.length > 0) {
      applyPositionRestriction(matrix, players, this.formation.map(s => s.position), rowMap, colMap);
    }

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
