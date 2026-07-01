import { Component, inject, computed, signal, effect, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { RoleInfo } from '../../models/role-group.model';
import { FormationSlot } from '../../models/formation.model';
import { FORMATIONS_CATALOG } from '../../models/formations-catalog';
import { BestElevenResultEntry, BestElevenStateService } from '../../services/best-eleven-state.service';
import { getPlayerRoleScore, buildConstrainedScoreMatrix, applyPositionRestriction } from '../../utils/score-matrix';
import { isPlayerEligibleForSlot } from '../../utils/position-eligibility';
import { hungarian } from '../../utils/hungarian';
import { RolePickerModalComponent } from '../role-picker-modal/role-picker-modal.component';
import { PlayerPickerModalComponent } from '../player-picker-modal/player-picker-modal.component';

export type ResultEntry = BestElevenResultEntry;

@Component({
  selector: 'app-best-eleven',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToggleSwitchModule, InputTextModule, RouterLink, RolePickerModalComponent, PlayerPickerModalComponent],
  templateUrl: './best-eleven.component.html',
  styleUrl: './best-eleven.component.scss',
})
export class BestElevenComponent {
  private playerService = inject(PlayerService);
  private bestElevenState = inject(BestElevenStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected players = toSignal(this.playerService.players$, { initialValue: [] as Player[] });
  protected roles = this.playerService.roles;

  private paramMap = toSignal(this.route.paramMap);

  protected formationSlug = computed(() => this.paramMap()?.get('formation') ?? '');

  protected formation = computed(() => {
    const slug = this.paramMap()?.get('formation') ?? '';
    return FORMATIONS_CATALOG[slug] ?? null;
  });

  protected formationRows = computed(() =>
    [...new Set((this.formation() ?? []).map(s => s.row))].sort((a, b) => a - b)
  );

  selectedRoles = this.bestElevenState.selectedRoles;
  lockedPlayers = this.bestElevenState.lockedPlayers;
  result = this.bestElevenState.result;
  markedPlayerUids = this.bestElevenState.markedPlayerUids;
  positionRestriction = this.bestElevenState.positionRestriction;
  searchQuery = this.bestElevenState.searchQuery;
  sortColumn = this.bestElevenState.sortColumn;
  sortDirection = this.bestElevenState.sortDirection;

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
    const formation = this.formation();
    if (!formation) return [];
    const players = this.eligiblePlayers();
    const locks = this.lockedPlayers();
    const lockedUids = new Set(locks.filter((uid): uid is number => uid !== null));

    return formation
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
    if (this.positionRestriction() && this.positionRestrictionErrors().length > 0) return false;
    return true;
  });

  protected availablePlayersForSlot = computed(() => {
    const allPlayers = this.players();
    const locks = this.lockedPlayers();
    const formation = this.formation();
    if (!formation) return [];
    return formation.map((_, slotIndex) => {
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
    const formation = this.formation();
    if (!formation) return [];
    return formation.map(slot =>
      allRoles.filter(r => r.positions.includes(slot.position))
    );
  });

  protected rosterPlayers = computed(() => {
    const allPlayers = this.players();
    const marked = this.markedPlayerUids();
    const query = this.searchQuery().toLowerCase().trim();
    const col = this.sortColumn();
    const dir = this.sortDirection();

    const filtered = query
      ? allPlayers.filter(p => p.name.toLowerCase().includes(query))
      : allPlayers;

    const markedGroup = filtered.filter(p => marked.has(p.uid));
    const unmarkedGroup = filtered.filter(p => !marked.has(p.uid));

    const sortFn = (a: Player, b: Player): number => {
      if (col === 'name') {
        const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        return dir === 'asc' ? cmp : -cmp;
      }
      if (col === 'position') {
        const cmp = this.comparePositions(a.position, b.position);
        return dir === 'asc' ? cmp : -cmp;
      }
      return 0;
    };

    const sortedMarked = [...markedGroup].sort(sortFn);
    const sortedUnmarked = [...unmarkedGroup].sort(sortFn);
    return [...sortedMarked, ...sortedUnmarked];
  });

  constructor() {
    effect(() => {
      if (this.paramMap() && !this.formation()) {
        this.router.navigate(['/best-eleven']);
      }
    });

    effect(() => {
      const f = this.formation();
      const slug = this.formationSlug();
      const players = this.players();
      if (f) {
        untracked(() => this.bestElevenState.useFormation(slug, f.length, players));
      }
    });
  }

  toggleMark(uid: number): void {
    this.bestElevenState.toggleMark(uid);
  }

  markAll(): void {
    this.bestElevenState.markAll(this.players());
  }

  protected slotsInRow(row: number): { slot: FormationSlot; index: number }[] {
    return (this.formation() ?? [])
      .map((slot, index) => ({ slot, index }))
      .filter(s => s.slot.row === row);
  }

  onToggleRestriction(): void {
    this.bestElevenState.togglePositionRestriction();
  }

  protected onRoleChange(slotIndex: number, roleName: string | null): void {
    this.bestElevenState.setRole(slotIndex, roleName);
  }

  protected onLockChange(slotIndex: number, playerUid: number | null): void {
    this.bestElevenState.setLockedPlayer(slotIndex, playerUid);
  }

  protected resetSettings(): void {
    this.bestElevenState.resetSettings(this.players());
  }

  private readonly POSITION_GROUP_ORDER: Record<string, number> = {
    GK: 0, D: 1, WB: 2, DM: 3, M: 4, AM: 5, ST: 6, F: 7,
  };

  private getPositionOrder(position: string): number {
    const firstPos = position.split(',')[0].trim();
    const prefix = firstPos.split(' ')[0];
    return this.POSITION_GROUP_ORDER[prefix] ?? 99;
  }

  private comparePositions(a: string, b: string): number {
    const orderA = this.getPositionOrder(a);
    const orderB = this.getPositionOrder(b);
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  }

  protected onSearchInput(event: Event): void {
    this.bestElevenState.setSearchQuery((event.target as HTMLInputElement).value);
  }

  protected toggleSort(col: 'name' | 'position'): void {
    this.bestElevenState.toggleSort(col);
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
    const formation = this.formation()!;
    const players = this.eligiblePlayers();
    const slotRoles = this.selectedRoles();
    const slotCandidateRoles = this.availableRolesForSlot()
      .map(rs => rs.map(r => r.shortRoleName));
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

    // Pre-build locked entries (locked slots always have a manually-selected role)
    const lockedEntries: ResultEntry[] = lockedPairs.map(lp => ({
      slot: formation[lp.slotIndex],
      player: players[lp.playerIndex],
      role: slotRoles[lp.slotIndex] as string,
      score: getPlayerRoleScore(players[lp.playerIndex], slotRoles[lp.slotIndex] as string),
    }));

    // Build constrained matrix and run Hungarian on free slots
    const { matrix, bestRoles, rowMap, colMap } = buildConstrainedScoreMatrix(
      players, slotRoles, slotCandidateRoles, lockedPairs,
    );

    if (this.positionRestriction() && matrix.length > 0) {
      applyPositionRestriction(
        matrix, players, formation.map(s => s.position), slotRoles, rowMap, colMap,
      );
    }

    let freeEntries: ResultEntry[] = [];
    if (matrix.length > 0 && matrix[0]?.length > 0) {
      const assignments = hungarian(matrix);
      freeEntries = assignments.map(a => ({
        slot: formation[colMap[a.slotIndex]],
        player: players[rowMap[a.playerIndex]],
        role: bestRoles[a.playerIndex][a.slotIndex],
        score: a.score,
      }));
    }

    this.result.set([...lockedEntries, ...freeEntries]);
  }

  protected getResultForSlot(slotIndex: number): ResultEntry | undefined {
    const res = this.result();
    const formation = this.formation();
    if (!res || !formation) return undefined;
    return res.find(e => e.slot === formation[slotIndex]);
  }
}
