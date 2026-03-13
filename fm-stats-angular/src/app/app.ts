import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Toolbar } from 'primeng/toolbar';
import { PlayerService } from './services/player.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Toolbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private playerService = inject(PlayerService);

  ngOnInit(): void {
    this.playerService.loadRoles();
  }
}
