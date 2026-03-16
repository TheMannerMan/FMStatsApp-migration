import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { BehaviorSubject } from 'rxjs';
import { AppHeaderComponent } from './app-header.component';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';

describe('AppHeaderComponent', () => {
  let fixture: ComponentFixture<AppHeaderComponent>;
  let element: HTMLElement;
  let playersSubject: BehaviorSubject<Player[]>;

  beforeEach(async () => {
    playersSubject = new BehaviorSubject<Player[]>([]);

    await TestBed.configureTestingModule({
      imports: [AppHeaderComponent],
      providers: [
        provideRouter([]),
        { provide: PlayerService, useValue: { players$: playersSubject.asObservable() } },
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
    const links = element.querySelectorAll('a[routerLink]');
    const hrefs = Array.from(links).map(a => a.getAttribute('routerLink'));
    expect(hrefs).toContain('/upload');
  });

  it('has a nav link to /players', () => {
    const links = element.querySelectorAll('a[routerLink]');
    const hrefs = Array.from(links).map(a => a.getAttribute('routerLink'));
    expect(hrefs).toContain('/players');
  });

  it('does not show Best XI link when no players are loaded', () => {
    const links = element.querySelectorAll('a[routerLink]');
    const hrefs = Array.from(links).map(a => a.getAttribute('routerLink'));
    expect(hrefs).not.toContain('/best-eleven');
  });

  it('shows Best XI link when players are loaded', () => {
    playersSubject.next([{ uid: 1, name: 'Test' } as Player]);
    fixture.detectChanges();

    const links = element.querySelectorAll('a[routerLink]');
    const hrefs = Array.from(links).map(a => a.getAttribute('routerLink'));
    expect(hrefs).toContain('/best-eleven');
  });
});
