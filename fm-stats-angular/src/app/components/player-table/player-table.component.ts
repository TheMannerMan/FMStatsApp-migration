import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-player-table',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule],
  templateUrl: './player-table.component.html',
  styleUrl: './player-table.component.scss'
})
export class PlayerTableComponent implements OnInit {
  playerService = inject(PlayerService);

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

  // Computed: derive role columns from the first player's roles
  roleColumns = computed(() => {
    const players = this.playerService.players();
    if (players.length === 0) return [];
    return players[0].roles;
  });

  ngOnInit(): void {
    this.playerService.loadRoles();
  }

  getRoleScore(player: Player, roleName: string): number {
    return player.roles.find(r => r.shortRoleName === roleName)?.roleScore ?? 0;
  }

  getRoleScoreClass(score: number): string {
    if (score >= 8.0) return 'score-high';
    if (score >= 6.0) return 'score-medium';
    return 'score-low';
  }
}
