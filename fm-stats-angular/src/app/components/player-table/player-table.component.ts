import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { SortEvent } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { RoleFilterComponent } from '../role-filter/role-filter.component';

@Component({
  selector: 'app-player-table',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, DrawerModule, RoleFilterComponent],
  templateUrl: './player-table.component.html',
  styleUrl: './player-table.component.scss',
})
export class PlayerTableComponent {
  protected playerService = inject(PlayerService);
  protected players = toSignal(this.playerService.players$, { initialValue: [] as Player[] });
  protected activeRoles = toSignal(this.playerService.activeRoles$, { initialValue: new Set<string>() });

  filterDrawerVisible = false;

  basicColumns = [
    { field: 'age', header: 'Age' },
    { field: 'club', header: 'Club' },
    { field: 'nationality', header: 'Nat.' },
    { field: 'position', header: 'Pos.' },
    { field: 'wage', header: 'Wage' },
    { field: 'transferValue', header: 'Value' },
    { field: 'averageRating', header: 'Rating' },
  ];

  roleColumns = computed(() => {
    const players = this.players();
    if (players.length === 0) return [];
    const activeRoles = this.activeRoles();
    return players[0].roles.filter(r => activeRoles.has(r.shortRoleName));
  });

  getRoleScore(player: Player, roleName: string): number | null {
    return player.roles.find(r => r.shortRoleName === roleName)?.roleScore ?? null;
  }

  getRoleScoreClass(score: number | null): string {
    if (score === null) return '';
    if (score >= 8.0) return 'score-high';
    if (score >= 6.0) return 'score-medium';
    return 'score-low';
  }

  toggleFilterDrawer(): void {
    this.filterDrawerVisible = !this.filterDrawerVisible;
  }

  customSort(event: SortEvent): void {
    const data = event.data;
    if (!data || !event.field) return;
    const field = event.field;
    const order = event.order ?? 1;
    const isRoleColumn = field !== 'name' && !this.basicColumns.some(c => c.field === field);

    data.sort((a, b) => {
      const v1 = isRoleColumn
        ? this.getRoleScore(a as Player, field)
        : (a as Record<string, unknown>)[field];
      const v2 = isRoleColumn
        ? this.getRoleScore(b as Player, field)
        : (b as Record<string, unknown>)[field];

      const v1Null = v1 === null || v1 === undefined;
      const v2Null = v2 === null || v2 === undefined;
      if (v1Null && v2Null) return 0;
      if (v1Null) return 1;
      if (v2Null) return -1;

      let cmp: number;
      if (typeof v1 === 'string' && typeof v2 === 'string') {
        cmp = v1.localeCompare(v2);
      } else {
        const n1 = v1 as number;
        const n2 = v2 as number;
        cmp = n1 < n2 ? -1 : n1 > n2 ? 1 : 0;
      }
      return cmp * order;
    });
  }
}
