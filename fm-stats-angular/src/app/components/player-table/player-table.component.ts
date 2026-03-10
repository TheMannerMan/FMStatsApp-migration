import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { PlayerService } from '../../services/player.service';

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

  ngOnInit(): void {
    this.playerService.loadRoles();
  }
}
