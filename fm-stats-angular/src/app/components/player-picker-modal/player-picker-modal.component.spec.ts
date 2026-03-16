import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PlayerPickerModalComponent } from './player-picker-modal.component';
import { Player } from '../../models/player.model';

const makePlayer = (uid: number, name: string, position: string, roles: { shortRoleName: string; roleScore: number }[] = []): Player => ({
  uid,
  name,
  position,
  roles: roles.map(r => ({ roleName: r.shortRoleName, shortRoleName: r.shortRoleName, position, roleScore: r.roleScore })),
  reg: '', inf: '', age: 25, wage: 1000, transferValue: 0,
  nationality: '', secondNationality: '',
  personality: '', mediaHandling: '', averageRating: 0,
  leftFoot: '', rightFoot: '', height: 180, club: '',
  oneVsOne: 0, acceleration: 0, aerialAbility: 0, aggression: 0,
  agility: 0, anticipation: 0, balance: 0, bravery: 0,
  commandOfArea: 0, concentration: 0, composure: 0, crossing: 0,
  decisions: 0, determination: 0, dribbling: 0, finishing: 0,
  firstTouch: 0, flair: 0, handling: 0, heading: 0,
  jumpingReach: 0, kicking: 0, leadership: 0, longShots: 0,
  marking: 0, offTheBall: 0, pace: 0, passing: 0,
  positioning: 0, reflexes: 0, stamina: 0, strength: 0,
  tackling: 0, teamwork: 0, technique: 0, throwing: 0,
  throwOuts: 0, vision: 0, workRate: 0, corners: 0,
});

describe('PlayerPickerModalComponent', () => {
  let fixture: ComponentFixture<PlayerPickerModalComponent>;
  let component: PlayerPickerModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerPickerModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerPickerModalComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  // ── filteredPlayers computed ─────────────────────────────────────────────

  it('filteredPlayers returns all players when search is empty', () => {
    component.players = [
      makePlayer(1, 'John Keeper', 'GK', [{ shortRoleName: 'SK', roleScore: 8 }]),
      makePlayer(2, 'Bob Defender', 'DC', [{ shortRoleName: 'CD', roleScore: 7 }]),
    ];
    fixture.detectChanges();

    expect(component.filteredPlayers().length).toBe(2);
  });

  it('filters players case-insensitively by name — lowercase', () => {
    component.players = [
      makePlayer(1, 'John Keeper', 'GK'),
      makePlayer(2, 'Bob Defender', 'DC'),
    ];
    component.searchTerm.set('john');
    fixture.detectChanges();

    const filtered = component.filteredPlayers();
    expect(filtered.length).toBe(1);
    expect(filtered[0].uid).toBe(1);
  });

  it('filters players case-insensitively by name — uppercase', () => {
    component.players = [
      makePlayer(1, 'John Keeper', 'GK'),
      makePlayer(2, 'Bob Defender', 'DC'),
    ];
    component.searchTerm.set('BOB');
    fixture.detectChanges();

    const filtered = component.filteredPlayers();
    expect(filtered.length).toBe(1);
    expect(filtered[0].uid).toBe(2);
  });

  it('filters players stripping accents from search term', () => {
    component.players = [
      makePlayer(1, 'Björn Larsson', 'DC'),
      makePlayer(2, 'Normal Player', 'GK'),
    ];
    component.searchTerm.set('bjorn');
    fixture.detectChanges();

    const filtered = component.filteredPlayers();
    expect(filtered.length).toBe(1);
    expect(filtered[0].uid).toBe(1);
  });

  it('filters players stripping accents from player name', () => {
    component.players = [
      makePlayer(1, 'Björn Larsson', 'DC'),
      makePlayer(2, 'Normal Player', 'GK'),
    ];
    component.searchTerm.set('Bjorn');
    fixture.detectChanges();

    const filtered = component.filteredPlayers();
    expect(filtered.length).toBe(1);
    expect(filtered[0].uid).toBe(1);
  });

  it('filteredPlayers returns empty array when no players match', () => {
    component.players = [
      makePlayer(1, 'John Keeper', 'GK'),
    ];
    component.searchTerm.set('zzznomatch');
    fixture.detectChanges();

    expect(component.filteredPlayers().length).toBe(0);
  });

  // ── Event emissions ──────────────────────────────────────────────────────

  it('selectPlayer emits player uid via playerSelected', () => {
    const emitted: (number | null)[] = [];
    component.playerSelected.subscribe(v => emitted.push(v));

    component.selectPlayer(42);

    expect(emitted).toEqual([42]);
  });

  it('selectPlayer emits false via visibleChange', () => {
    const emitted: boolean[] = [];
    component.visibleChange.subscribe(v => emitted.push(v));

    component.selectPlayer(42);

    expect(emitted).toEqual([false]);
  });

  it('clearLock emits null via playerSelected', () => {
    const emitted: (number | null)[] = [];
    component.playerSelected.subscribe(v => emitted.push(v));

    component.clearLock();

    expect(emitted).toEqual([null]);
  });

  it('clearLock emits false via visibleChange', () => {
    const emitted: boolean[] = [];
    component.visibleChange.subscribe(v => emitted.push(v));

    component.clearLock();

    expect(emitted).toEqual([false]);
  });

  // ── Role score display ───────────────────────────────────────────────────

  it('getScore returns role score for given selectedRole', () => {
    const player = makePlayer(1, 'Test', 'GK', [{ shortRoleName: 'SK', roleScore: 8.5 }]);
    component.players = [player];
    component.selectedRole = 'SK';
    fixture.detectChanges();

    expect(component.getScore(player)).toBeCloseTo(8.5);
  });

  it('getScore returns 0 when selectedRole is null', () => {
    const player = makePlayer(1, 'Test', 'GK', [{ shortRoleName: 'SK', roleScore: 8.5 }]);
    component.players = [player];
    component.selectedRole = null;
    fixture.detectChanges();

    expect(component.getScore(player)).toBe(0);
  });

  // ── DOM rendering ────────────────────────────────────────────────────────

  it('shows player name and position in DOM when visible', () => {
    component.players = [
      makePlayer(1, 'John Keeper', 'GK', [{ shortRoleName: 'SK', roleScore: 8 }]),
    ];
    component.visible = true;
    fixture.detectChanges();

    const allContent = document.body.textContent ?? '';
    expect(allContent).toContain('John Keeper');
    expect(allContent).toContain('GK');
  });

  it('shows role score in DOM when selectedRole is set and visible', () => {
    component.players = [
      makePlayer(1, 'John Keeper', 'GK', [{ shortRoleName: 'SK', roleScore: 8 }]),
    ];
    component.selectedRole = 'SK';
    component.visible = true;
    fixture.detectChanges();

    const allContent = document.body.textContent ?? '';
    expect(allContent).toContain('8');
  });

  it('shows "No eligible players" message when players array is empty and visible', () => {
    component.players = [];
    component.visible = true;
    fixture.detectChanges();

    const allContent = document.body.textContent ?? '';
    expect(allContent).toContain('No eligible players');
  });

  it('shows "No players found" when search has no results and players exist and visible', () => {
    component.players = [makePlayer(1, 'John Keeper', 'GK')];
    component.visible = true;
    component.searchTerm.set('zzznomatch');
    fixture.detectChanges();

    const allContent = document.body.textContent ?? '';
    expect(allContent).toContain('No players found');
  });
});
