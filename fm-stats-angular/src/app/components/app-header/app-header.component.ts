import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';
import { PlayerService } from '../../services/player.service';
import { BestElevenStateService } from '../../services/best-eleven-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
})
export class AppHeaderComponent {
  private playerService = inject(PlayerService);
  private bestElevenState = inject(BestElevenStateService);

  protected hasPlayers = toSignal(
    this.playerService.players$.pipe(map(p => p.length > 0)),
    { initialValue: false },
  );

  protected bestElevenLink = computed(() => {
    const slug = this.bestElevenState.formationSlug();
    return slug ? ['/best-eleven', slug] : ['/best-eleven'];
  });
}
