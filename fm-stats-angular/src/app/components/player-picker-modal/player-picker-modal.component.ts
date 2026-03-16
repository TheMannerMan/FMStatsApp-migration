import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Player } from '../../models/player.model';
import { getPlayerRoleScore } from '../../utils/score-matrix';

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
  @Input() selectedRole: string | null = null;
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

  protected hasPlayers = computed(() => this._players().length > 0);

  filteredPlayers = computed(() => {
    const term = normalizeForSearch(this.searchTerm());
    const playerList = this._players();
    if (!term) return playerList;
    return playerList.filter(p => normalizeForSearch(p.name).includes(term));
  });

  getScore(player: Player): number {
    if (!this.selectedRole) return 0;
    return getPlayerRoleScore(player, this.selectedRole);
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
  }
}
