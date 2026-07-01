import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { BehaviorSubject } from 'rxjs';
import { AppHeaderComponent } from './app-header.component';
import { PlayerService } from '../../services/player.service';
import { BestElevenStateService } from '../../services/best-eleven-state.service';
import { Player } from '../../models/player.model';

describe('AppHeaderComponent', () => {
  let fixture: ComponentFixture<AppHeaderComponent>;
  let element: HTMLElement;
  let playersSubject: BehaviorSubject<Player[]>;
  let bestElevenState: BestElevenStateService;

  beforeEach(async () => {
    playersSubject = new BehaviorSubject<Player[]>([]);
    bestElevenState = new BestElevenStateService();

    await TestBed.configureTestingModule({
      imports: [AppHeaderComponent],
      providers: [
        provideRouter([]),
        { provide: PlayerService, useValue: { players$: playersSubject.asObservable() } },
        { provide: BestElevenStateService, useValue: bestElevenState },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AppHeaderComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders the app title "FM Stats"', () => {
    expect(element.textContent).toContain('FM Stats');
  });

  it('has a nav link to /upload', () => {
    const links = element.querySelectorAll('a');
    const hrefs = Array.from(links).map(a => a.getAttribute('href'));
    expect(hrefs).toContain('/upload');
  });

  it('has a nav link to /players', () => {
    const links = element.querySelectorAll('a');
    const hrefs = Array.from(links).map(a => a.getAttribute('href'));
    expect(hrefs).toContain('/players');
  });

  it('does not show Best XI link when no players are loaded', () => {
    const links = element.querySelectorAll('a');
    const hrefs = Array.from(links).map(a => a.getAttribute('href'));
    expect(hrefs).not.toContain('/best-eleven');
  });

  it('links Best XI to formation picker when players are loaded and no formation is saved', () => {
    playersSubject.next([{ uid: 1, name: 'Test' } as Player]);
    fixture.detectChanges();

    const links = element.querySelectorAll('a');
    const hrefs = Array.from(links).map(a => a.getAttribute('href'));
    expect(hrefs).toContain('/best-eleven');
  });

  it('links Best XI to the saved formation when one exists', () => {
    playersSubject.next([{ uid: 1, name: 'Test' } as Player]);
    bestElevenState.useFormation('4-4-2', 11, [{ uid: 1, name: 'Test' } as Player]);
    fixture.detectChanges();

    const bestXiLink = Array.from(element.querySelectorAll('a'))
      .find(link => link.textContent?.trim() === 'Best XI');
    expect(bestXiLink?.getAttribute('href')).toBe('/best-eleven/4-4-2');
  });
});
