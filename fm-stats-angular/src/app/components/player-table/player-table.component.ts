import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { RoleFilterComponent } from '../role-filter/role-filter.component';

@Component({
  selector: 'app-player-table',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, RoleFilterComponent],
  templateUrl: './player-table.component.html',
  styleUrl: './player-table.component.scss'
})
export class PlayerTableComponent {
  protected playerService = inject(PlayerService);
  protected players = toSignal(this.playerService.players$, { initialValue: [] as Player[] });
  protected activeRoles = toSignal(this.playerService.activeRoles$, { initialValue: new Set<string>() });

  basicColumns = [
    { field: 'name', header: 'Name' },
    { field: 'age', header: 'Age' },
    { field: 'club', header: 'Club' },
    { field: 'nationality', header: 'Nationality' },
    { field: 'position', header: 'Position' },
    { field: 'wage', header: 'Wage' },
    { field: 'transferValue', header: 'Transfer Value' },
    { field: 'averageRating', header: 'Rating' },
  ];

  roleColumns = computed(() => {
    const players = this.players();
    if (players.length === 0) return [];
    const activeRoles = this.activeRoles();
    return players[0].roles.filter(r => activeRoles.has(r.shortRoleName));
  });

  getRoleScore(player: Player, roleName: string): number {
    return player.roles.find(r => r.shortRoleName === roleName)?.roleScore ?? 0;
  }

  getRoleScoreClass(score: number): string {
    if (score >= 8.0) return 'score-high';
    if (score >= 6.0) return 'score-medium';
    return 'score-low';
  }
}
