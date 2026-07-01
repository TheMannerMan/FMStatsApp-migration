import { Injectable, signal } from '@angular/core';
import { FormationSlot } from '../models/formation.model';
import { Player } from '../models/player.model';

export interface BestElevenResultEntry {
  slot: FormationSlot;
  player: Player;
  role: string | null;
  score: number;
}

export type BestElevenSortColumn = 'name' | 'position' | null;
export type BestElevenSortDirection = 'asc' | 'desc';

@Injectable({ providedIn: 'root' })
export class BestElevenStateService {
  formationSlug = signal<string | null>(null);
  selectedRoles = signal<(string | null)[]>([]);
  lockedPlayers = signal<(number | null)[]>([]);
  result = signal<BestElevenResultEntry[] | null>(null);
  markedPlayerUids = signal<Set<number>>(new Set());
  positionRestriction = signal(false);
  searchQuery = signal('');
  sortColumn = signal<BestElevenSortColumn>(null);
  sortDirection = signal<BestElevenSortDirection>('asc');

  private playerUids = new Set<number>();

  useFormation(slug: string, slotCount: number, players: Player[]): void {
    const currentUids = new Set(players.map(player => player.uid));
    const formationChanged = this.formationSlug() !== slug;
    const playersChanged = this.hasPlayerSetChanged(currentUids);
    const stateShapeChanged =
      this.selectedRoles().length !== slotCount ||
      this.lockedPlayers().length !== slotCount;

    if (formationChanged || playersChanged || stateShapeChanged) {
      this.resetForFormation(slug, slotCount, currentUids);
      return;
    }

    this.playerUids = currentUids;
  }

  resetSettings(players?: Player[]): void {
    const currentUids = players
      ? new Set(players.map(player => player.uid))
      : new Set(this.playerUids);

    this.selectedRoles.set(new Array(this.selectedRoles().length).fill(null));
    this.lockedPlayers.set(new Array(this.lockedPlayers().length).fill(null));
    this.result.set(null);
    this.markedPlayerUids.set(new Set(currentUids));
    this.positionRestriction.set(false);
    this.searchQuery.set('');
    this.sortColumn.set(null);
    this.sortDirection.set('asc');
    this.playerUids = currentUids;
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

  markAll(players: Player[]): void {
    const currentUids = new Set(players.map(player => player.uid));
    this.markedPlayerUids.set(currentUids);
    this.playerUids = currentUids;
  }

  togglePositionRestriction(): void {
    this.positionRestriction.update(value => !value);
    this.result.set(null);
  }

  setRole(slotIndex: number, roleName: string | null): void {
    const roles = [...this.selectedRoles()];
    roles[slotIndex] = roleName;
    this.selectedRoles.set(roles);

    if (roleName === null && this.lockedPlayers()[slotIndex] !== null) {
      const locks = [...this.lockedPlayers()];
      locks[slotIndex] = null;
      this.lockedPlayers.set(locks);
    }

    this.result.set(null);
  }

  setLockedPlayer(slotIndex: number, playerUid: number | null): void {
    const locks = [...this.lockedPlayers()];
    locks[slotIndex] = playerUid;
    this.lockedPlayers.set(locks);
    this.result.set(null);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  toggleSort(column: Exclude<BestElevenSortColumn, null>): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(direction => (direction === 'asc' ? 'desc' : 'asc'));
      return;
    }

    this.sortColumn.set(column);
    this.sortDirection.set('asc');
  }

  private resetForFormation(slug: string, slotCount: number, playerUids: Set<number>): void {
    this.formationSlug.set(slug);
    this.selectedRoles.set(new Array(slotCount).fill(null));
    this.lockedPlayers.set(new Array(slotCount).fill(null));
    this.result.set(null);
    this.markedPlayerUids.set(new Set(playerUids));
    this.positionRestriction.set(false);
    this.searchQuery.set('');
    this.sortColumn.set(null);
    this.sortDirection.set('asc');
    this.playerUids = playerUids;
  }

  private hasPlayerSetChanged(currentUids: Set<number>): boolean {
    return currentUids.size !== this.playerUids.size ||
      [...currentUids].some(uid => !this.playerUids.has(uid));
  }
}
