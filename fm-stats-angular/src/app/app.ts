import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlayerService } from './services/player.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private playerService = inject(PlayerService);

  ngOnInit(): void {
    this.playerService.loadRoles();
  }
}
