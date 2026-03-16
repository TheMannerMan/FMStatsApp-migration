import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Player } from '../../models/player.model';
import { getPlayerRoleScore } from '../../utils/score-matrix';

export type SortColumn = 'name' | 'position' | 'rating';
export type SortDirection = 'asc' | 'desc';

function normalizeForSearch(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

@Component({
  selector: 'app-player-picker-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './player-picker-modal.component.html',
  styleUrl: './player-picker-modal.component.scss',
})
export class PlayerPickerModalComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  private _selectedRole = signal<string | null>(null);
  @Input() set selectedRole(val: string | null) { this._selectedRole.set(val); }
  get selectedRole(): string | null { return this._selectedRole(); }
  @Input() selectedPlayerUid: number | null = null;
  @Output() playerSelected = new EventEmitter<number | null>();

  private _players = signal<Player[]>([]);

  @Input() set players(val: Player[]) {
    this._players.set(val);
  }
  get players(): Player[] {
    return this._players();
  }

  searchTerm = signal('');
  sortColumn = signal<SortColumn>('name');
  sortDirection = signal<SortDirection>('asc');

  protected hasPlayers = computed(() => this._players().length > 0);

  filteredPlayers = computed(() => {
    const term = normalizeForSearch(this.searchTerm());
    let players = this._players();
    if (term) {
      players = players.filter(p => normalizeForSearch(p.name).includes(term));
    }

    const col = this.sortColumn();
    const dir = this.sortDirection();

    return [...players].sort((a, b) => {
      let cmp = 0;
      if (col === 'name') {
        cmp = normalizeForSearch(a.name).localeCompare(normalizeForSearch(b.name));
      } else if (col === 'position') {
        cmp = a.position.toLowerCase().localeCompare(b.position.toLowerCase());
      } else {
        // rating
        cmp = this.getScore(a) - this.getScore(b);
      }
      // Stable tiebreak: fallback to name ascending (always ascending, bypass dir)
      if (cmp === 0 && col !== 'name') {
        return normalizeForSearch(a.name).localeCompare(normalizeForSearch(b.name));
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  getScore(player: Player): number {
    if (!this._selectedRole()) return 0;
    return getPlayerRoleScore(player, this._selectedRole()!);
  }

  setSortColumn(col: SortColumn): void {
    if (col === 'rating' && !this._selectedRole()) return;
    if (this.sortColumn() === col) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set(col === 'rating' ? 'desc' : 'asc');
    }
  }

  selectPlayer(uid: number): void {
    this.playerSelected.emit(uid);
    this.visibleChange.emit(false);
  }

  clearLock(): void {
    this.playerSelected.emit(null);
    this.visibleChange.emit(false);
  }

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onDialogHide(): void {
    this.visibleChange.emit(false);
    this.searchTerm.set('');
    // Sort state intentionally NOT reset — persists across open/close per spec
  }
}
