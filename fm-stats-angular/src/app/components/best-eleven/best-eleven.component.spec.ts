import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { BestElevenComponent } from './best-eleven.component';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { RoleGroup } from '../../models/role-group.model';
import { signal } from '@angular/core';

const makePlayer = (uid: number, name: string, roles: { shortRoleName: string; position: string; roleScore: number }[], position = ''): Player => ({
  uid,
  name,
  roles: roles.map(r => ({ roleName: r.shortRoleName, ...r })),
  reg: '', inf: '', age: 25, wage: 1000, transferValue: 0,
  nationality: '', secondNationality: '', position,
  personality: '', mediaHandling: '', averageRating: 0,
  leftFoot: '', rightFoot: '', height: 180,
  oneVsOne: 0, acceleration: 0, aerialAbility: 0, aggression: 0,
  agility: 0, anticipation: 0, balance: 0, bravery: 0,
  commandOfArea: 0, concentration: 0, composure: 0, crossing: 0,
  decisions: 0, determination: 0, dribbling: 0, finishing: 0,
  firstTouch: 0, flair: 0, handling: 0, heading: 0,
  jumpingReach: 0, kicking: 0, leadership: 0, longShots: 0,
  marking: 0, offTheBall: 0, pace: 0, passing: 0,
  positioning: 0, reflexes: 0, stamina: 0, strength: 0,
  tackling: 0, teamwork: 0, technique: 0, throwing: 0,
  throwOuts: 0, vision: 0, workRate: 0, corners: 0, club: '',
});

function make11Players(): Player[] {
  return [
    makePlayer(1, 'Keeper', [{ shortRoleName: 'SK', position: 'GK', roleScore: 9 }]),
    makePlayer(2, 'Left Back', [{ shortRoleName: 'WB', position: 'DL', roleScore: 8 }]),
    makePlayer(3, 'Centre Back 1', [{ shortRoleName: 'BPD', position: 'DC', roleScore: 8 }]),
    makePlayer(4, 'Centre Back 2', [{ shortRoleName: 'BPD', position: 'DC', roleScore: 7 }]),
    makePlayer(5, 'Right Back', [{ shortRoleName: 'WB', position: 'DR', roleScore: 7 }]),
    makePlayer(6, 'Left Mid', [{ shortRoleName: 'W', position: 'ML', roleScore: 8 }]),
    makePlayer(7, 'Centre Mid 1', [{ shortRoleName: 'BBM', position: 'MC', roleScore: 9 }]),
    makePlayer(8, 'Centre Mid 2', [{ shortRoleName: 'BBM', position: 'MC', roleScore: 7 }]),
    makePlayer(9, 'Right Mid', [{ shortRoleName: 'W', position: 'MR', roleScore: 8 }]),
    makePlayer(10, 'Striker 1', [{ shortRoleName: 'AF', position: 'ST', roleScore: 9 }]),
    makePlayer(11, 'Striker 2', [{ shortRoleName: 'AF', position: 'ST', roleScore: 8 }]),
  ];
}

function makeRoles(): RoleGroup {
  return {
    Goalkeeper: [
      { roleName: 'Sweeper Keeper', shortRoleName: 'SK', positions: ['GK'] },
    ],
    Defender: [
      { roleName: 'Ball-Playing Defender', shortRoleName: 'BPD', positions: ['DC'] },
      { roleName: 'Wing-Back', shortRoleName: 'WB', positions: ['DL', 'DR'] },
    ],
    Midfielder: [
      { roleName: 'Box-to-Box Midfielder', shortRoleName: 'BBM', positions: ['MC'] },
      { roleName: 'Winger', shortRoleName: 'W', positions: ['ML', 'MR'] },
    ],
    Attacker: [
      { roleName: 'Advanced Forward', shortRoleName: 'AF', positions: ['ST'] },
    ],
  };
}

describe('BestElevenComponent', () => {
  let fixture: ComponentFixture<BestElevenComponent>;
  let component: BestElevenComponent;
  let element: HTMLElement;
  let playersSubject: BehaviorSubject<Player[]>;
  let rolesSignal: ReturnType<typeof signal<RoleGroup>>;

  beforeEach(async () => {
    localStorage.clear();
    playersSubject = new BehaviorSubject<Player[]>([]);
    rolesSignal = signal<RoleGroup>({});

    const mockPlayerService = {
      players$: playersSubject.asObservable(),
      roles: rolesSignal,
    };

    await TestBed.configureTestingModule({
      imports: [BestElevenComponent],
      providers: [
        provideRouter([]),
        { provide: PlayerService, useValue: mockPlayerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BestElevenComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('disables calculate button when not all roles are selected', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    const button = element.querySelector('.calculate-btn') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.disabled).toBe(true);
  });

  it('disables calculate button when fewer than 11 players', () => {
    playersSubject.next([makePlayer(1, 'Solo', [])]);
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    const button = element.querySelector('.calculate-btn') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('shows "at least 11 players" message when fewer than 11 players', () => {
    playersSubject.next([makePlayer(1, 'Solo', [])]);
    fixture.detectChanges();

    expect(element.textContent).toContain('At least 11 players must be uploaded');
  });

  it('enables calculate button when all slots filled and >= 11 players', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    // Select a role for each slot
    component.selectedRoles.set([
      'SK',  // GK
      'WB',  // DL
      'BPD', // DC
      'BPD', // DC
      'WB',  // DR
      'W',   // ML
      'BBM', // MC
      'BBM', // MC
      'W',   // MR
      'AF',  // ST
      'AF',  // ST
    ]);
    fixture.detectChanges();

    const button = element.querySelector('.calculate-btn') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it('renders 11 player cards with correct name, role, and score after calculation', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    component.selectedRoles.set([
      'SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF',
    ]);
    fixture.detectChanges();

    component.calculate();
    fixture.detectChanges();

    const cards = element.querySelectorAll('.result-card');
    expect(cards.length).toBe(11);

    // Check that player names appear
    const cardTexts = Array.from(cards).map(c => c.textContent);
    expect(cardTexts.some(t => t!.includes('Keeper'))).toBe(true);
    expect(cardTexts.some(t => t!.includes('Striker 1'))).toBe(true);
  });

  it('does not duplicate players in result', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    component.selectedRoles.set([
      'SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF',
    ]);
    fixture.detectChanges();

    component.calculate();
    fixture.detectChanges();

    const result = component.result();
    expect(result).not.toBeNull();
    const playerNames = result!.map(r => r.player.name);
    const uniqueNames = new Set(playerNames);
    expect(uniqueNames.size).toBe(11);
  });

  it('places locked player in the correct slot after calculation', () => {
    const players = make11Players();
    playersSubject.next(players);
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    // Lock "Striker 2" (uid=11) into slot 0 (GK slot)
    const locks = new Array(11).fill(null) as (number | null)[];
    locks[0] = 11; // uid of Striker 2
    component.lockedPlayers.set(locks);

    component.selectedRoles.set([
      'SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF',
    ]);
    fixture.detectChanges();

    component.calculate();
    fixture.detectChanges();

    const result = component.result()!;
    expect(result).not.toBeNull();
    const gkEntry = result.find(e => e.slot === component['formation'][0]);
    expect(gkEntry!.player.uid).toBe(11);
  });

  it('hides locked player from other slots availablePlayersForSlot', () => {
    const players = make11Players();
    playersSubject.next(players);
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    const locks = new Array(11).fill(null) as (number | null)[];
    locks[0] = 1;
    component.lockedPlayers.set(locks);
    fixture.detectChanges();

    const availableForSlot1 = component['availablePlayersForSlot']()[1];
    expect(availableForSlot1.find(p => p.uid === 1)).toBeUndefined();
  });

  it('displays average score with 1 decimal after calculation', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    component.selectedRoles.set([
      'SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF',
    ]);
    fixture.detectChanges();

    component.calculate();
    fixture.detectChanges();

    const avgEl = element.querySelector('.average-score');
    expect(avgEl).toBeTruthy();
    expect(avgEl!.textContent).toContain('8.0');
  });

  it('shows placeholder before calculation', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    const avgEl = element.querySelector('.average-score');
    expect(avgEl).toBeTruthy();
    expect(avgEl!.textContent).toContain('\u2014');
  });

  it('formats all result scores with exactly 1 decimal place', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    component.selectedRoles.set([
      'SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF',
    ]);
    fixture.detectChanges();

    component.calculate();
    fixture.detectChanges();

    const scoreEls = element.querySelectorAll('.result-score');
    expect(scoreEls.length).toBe(11);
    scoreEls.forEach(el => {
      expect(el.textContent!.trim()).toMatch(/^\d+\.\d$/);
    });
  });

  it('clears lock-in selections on reset', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    const locks = new Array(11).fill(null) as (number | null)[];
    locks[0] = 1;
    component.lockedPlayers.set(locks);

    component.selectedRoles.set([
      'SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF',
    ]);
    fixture.detectChanges();

    component.calculate();
    fixture.detectChanges();

    const resetBtn = element.querySelector('.reset-btn') as HTMLButtonElement;
    resetBtn.click();
    fixture.detectChanges();

    expect(component.result()).toBeNull();
    expect(component.lockedPlayers().every(l => l === null)).toBe(true);
  });

  it('does not affect canCalculate when lock-in is set but role is missing', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    const locks = new Array(11).fill(null) as (number | null)[];
    locks[0] = 1;
    component.lockedPlayers.set(locks);

    fixture.detectChanges();

    expect(component['canCalculate']()).toBe(false);
  });

  it('handles all 11 slots locked', () => {
    const players = make11Players();
    playersSubject.next(players);
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    const locks = players.map(p => p.uid);
    component.lockedPlayers.set(locks);

    component.selectedRoles.set([
      'SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF',
    ]);
    fixture.detectChanges();

    component.calculate();
    fixture.detectChanges();

    const result = component.result()!;
    expect(result).not.toBeNull();
    expect(result.length).toBe(11);
    result.forEach((entry, i) => {
      const expectedSlot = component['formation'][i];
      const matchingEntry = result.find(e => e.slot === expectedSlot);
      expect(matchingEntry!.player.uid).toBe(players[i].uid);
    });
  });

  // ── Step 1: Marked state signals ─────────────────────────────────────────

  it('initializes all players as marked when loaded', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    const marked = component.markedPlayerUids();
    expect(marked.size).toBe(11);
    make11Players().forEach(p => expect(marked.has(p.uid)).toBe(true));
  });

  it('toggleMark removes a player from the marked set', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.toggleMark(1);
    expect(component.markedPlayerUids().has(1)).toBe(false);
  });

  it('toggleMark twice re-adds the player to the marked set', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.toggleMark(1);
    component.toggleMark(1);
    expect(component.markedPlayerUids().has(1)).toBe(true);
  });

  it('markAll restores all player UIDs to marked set', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.toggleMark(1);
    component.toggleMark(2);
    component.markAll();

    const marked = component.markedPlayerUids();
    expect(marked.size).toBe(11);
    make11Players().forEach(p => expect(marked.has(p.uid)).toBe(true));
  });

  it('Mark All button is disabled when all players are already marked', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    const btn = element.querySelector('.mark-all-btn') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.disabled).toBe(true);
  });

  // ── Step 2: eligiblePlayers + hasEnoughPlayers ────────────────────────────

  it('eligiblePlayers returns only marked players when no locks are set', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.toggleMark(1); // unmark player 1
    fixture.detectChanges();

    const eligible = component['eligiblePlayers']();
    expect(eligible.length).toBe(10);
    expect(eligible.find(p => p.uid === 1)).toBeUndefined();
  });

  it('eligiblePlayers includes a locked player even when unmarked', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.toggleMark(1); // unmark player 1
    const locks = new Array(11).fill(null) as (number | null)[];
    locks[0] = 1; // lock player 1 into slot 0
    component.lockedPlayers.set(locks);
    fixture.detectChanges();

    const eligible = component['eligiblePlayers']();
    expect(eligible.find(p => p.uid === 1)).toBeDefined();
  });

  it('hasEnoughPlayers is false when fewer than 11 eligible after exclusions', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.toggleMark(1);
    fixture.detectChanges();

    expect(component['hasEnoughPlayers']()).toBe(false);
  });

  it('hasEnoughPlayers is true when locked players fill the gap to 11', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.toggleMark(1); // unmark player 1 → 10 marked
    const locks = new Array(11).fill(null) as (number | null)[];
    locks[0] = 1; // lock unmarked player 1 → eligible = 11
    component.lockedPlayers.set(locks);
    fixture.detectChanges();

    expect(component['hasEnoughPlayers']()).toBe(true);
  });

  // ── Step 3: calculate() uses eligiblePlayers ─────────────────────────────

  it('calculate excludes unmarked players from the result', () => {
    const players = make11Players();
    // Add a 12th player so we can unmark one and still have 11
    const player12 = makePlayer(12, 'Extra', [{ shortRoleName: 'SK', position: 'GK', roleScore: 5 }]);
    playersSubject.next([...players, player12]);
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    component.toggleMark(12); // exclude the extra player
    component.selectedRoles.set([
      'SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF',
    ]);
    fixture.detectChanges();

    component.calculate();
    fixture.detectChanges();

    const result = component.result()!;
    expect(result).not.toBeNull();
    expect(result.find(e => e.player.uid === 12)).toBeUndefined();
  });

  it('calculate includes a locked unmarked player at the correct slot', () => {
    const players = make11Players();
    const player12 = makePlayer(12, 'Extra', [{ shortRoleName: 'SK', position: 'GK', roleScore: 5 }]);
    playersSubject.next([...players, player12]);
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    component.toggleMark(12); // unmark player 12
    const locks = new Array(11).fill(null) as (number | null)[];
    locks[0] = 12; // lock unmarked player 12 into GK slot
    component.lockedPlayers.set(locks);

    component.selectedRoles.set([
      'SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF',
    ]);
    fixture.detectChanges();

    component.calculate();
    fixture.detectChanges();

    const result = component.result()!;
    const gkEntry = result.find(e => e.slot === component['formation'][0]);
    expect(gkEntry!.player.uid).toBe(12);
  });

  // ── Step 5: Roster panel template ────────────────────────────────────────

  it('roster panel renders one row per player', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    const rows = element.querySelectorAll('.player-row');
    expect(rows.length).toBe(11);
  });

  it('displays player name in each roster row', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    const rows = element.querySelectorAll('.player-row');
    const names = Array.from(rows).map(r => r.textContent);
    expect(names.some(t => t!.includes('Keeper'))).toBe(true);
    expect(names.some(t => t!.includes('Striker 1'))).toBe(true);
  });

  it('clicking the toggle button changes the mark state', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    expect(component.markedPlayerUids().has(1)).toBe(true);

    const firstToggle = element.querySelector('.player-row .toggle-mark-btn') as HTMLButtonElement;
    firstToggle.click();
    fixture.detectChanges();

    expect(component.markedPlayerUids().has(1)).toBe(false);
  });

  it('unmarked player row has the .unmarked class', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.toggleMark(1);
    fixture.detectChanges();

    const rows = element.querySelectorAll('.player-row');
    const unmarkedRows = Array.from(rows).filter(r => r.classList.contains('unmarked'));
    expect(unmarkedRows.length).toBe(1);
  });

  it('does not render roster panel when no players are uploaded', () => {
    playersSubject.next([]);
    fixture.detectChanges();

    const panel = element.querySelector('.roster-panel');
    expect(panel).toBeNull();
  });

  // ── Step 7: Structural layout ────────────────────────────────────────────

  it('.page-layout contains .formation-column and .roster-panel as children', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    const layout = element.querySelector('.page-layout');
    expect(layout).toBeTruthy();
    expect(layout!.querySelector('.formation-column')).toBeTruthy();
    expect(layout!.querySelector('.roster-panel')).toBeTruthy();
  });

  // ── Step 8: Modal slot buttons ────────────────────────────────────────────

  it('slot card shows "Select Role" button before role is selected', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    const roleBtn = element.querySelector('.slot-role-btn') as HTMLButtonElement;
    expect(roleBtn).toBeTruthy();
    expect(roleBtn.textContent).toContain('Select Role');
  });

  it('slot card shows full role name (not short name) after role is selected', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    component.selectedRoles.set(['SK', null, null, null, null, null, null, null, null, null, null]);
    fixture.detectChanges();

    const roleBtn = element.querySelector('.slot-role-btn') as HTMLButtonElement;
    expect(roleBtn).toBeTruthy();
    expect(roleBtn.textContent).toContain('Sweeper Keeper');
    expect(roleBtn.textContent).not.toContain('SK');
  });

  it('player button is disabled when no role is selected for a slot', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    const playerBtn = element.querySelector('.slot-player-btn') as HTMLButtonElement;
    expect(playerBtn).toBeTruthy();
    expect(playerBtn.disabled).toBe(true);
  });

  it('player button is enabled after role is selected for the slot', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    component.selectedRoles.set(['SK', null, null, null, null, null, null, null, null, null, null]);
    fixture.detectChanges();

    const playerBtn = element.querySelector('.slot-player-btn') as HTMLButtonElement;
    expect(playerBtn).toBeTruthy();
    expect(playerBtn.disabled).toBe(false);
  });

  // ── Position restriction ──────────────────────────────────────────────────

  function make11PlayersWithPositions(): Player[] {
    return [
      makePlayer(1,  'Keeper',        [{ shortRoleName: 'SK',  position: 'GK', roleScore: 9 }], 'GK'),
      makePlayer(2,  'Left Back',     [{ shortRoleName: 'WB',  position: 'DL', roleScore: 8 }], 'D (L)'),
      makePlayer(3,  'Centre Back 1', [{ shortRoleName: 'BPD', position: 'DC', roleScore: 8 }], 'D (C)'),
      makePlayer(4,  'Centre Back 2', [{ shortRoleName: 'BPD', position: 'DC', roleScore: 7 }], 'D (C)'),
      makePlayer(5,  'Right Back',    [{ shortRoleName: 'WB',  position: 'DR', roleScore: 7 }], 'D (R)'),
      makePlayer(6,  'Left Mid',      [{ shortRoleName: 'W',   position: 'ML', roleScore: 8 }], 'M (L)'),
      makePlayer(7,  'Centre Mid 1',  [{ shortRoleName: 'BBM', position: 'MC', roleScore: 9 }], 'M (C)'),
      makePlayer(8,  'Centre Mid 2',  [{ shortRoleName: 'BBM', position: 'MC', roleScore: 7 }], 'M (C)'),
      makePlayer(9,  'Right Mid',     [{ shortRoleName: 'W',   position: 'MR', roleScore: 8 }], 'M (R)'),
      makePlayer(10, 'Striker 1',     [{ shortRoleName: 'AF',  position: 'ST', roleScore: 9 }], 'ST (C)'),
      makePlayer(11, 'Striker 2',     [{ shortRoleName: 'AF',  position: 'ST', roleScore: 8 }], 'ST (C)'),
    ];
  }

  it('toggle is OFF by default', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    expect(component.positionRestriction()).toBe(false);
  });

  it('canCalculate with restriction OFF ignores player position field', () => {
    // make11Players() all have position:'' — restriction OFF should not care
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    component.selectedRoles.set(['SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF']);
    fixture.detectChanges();

    expect(component['canCalculate']()).toBe(true);
  });

  it('canCalculate false when restriction ON and a slot has no eligible player', () => {
    // make11Players() have position:'' → no player eligible for any slot
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    component.selectedRoles.set(['SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF']);
    component.onToggleRestriction();
    fixture.detectChanges();

    expect(component['canCalculate']()).toBe(false);
  });

  it('shows error message listing ineligible slot positions when restriction ON', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    component.selectedRoles.set(['SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF']);
    component.onToggleRestriction();
    fixture.detectChanges();

    const warning = element.querySelector('.restriction-warning');
    expect(warning).toBeTruthy();
    expect(warning!.textContent).toContain('No eligible players for:');
  });

  it('canCalculate true when restriction ON and all slots have eligible players', () => {
    playersSubject.next(make11PlayersWithPositions());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    component.selectedRoles.set(['SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF']);
    component.onToggleRestriction();
    fixture.detectChanges();

    expect(component['canCalculate']()).toBe(true);
  });

  it('toggling restriction while result exists clears the result', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    component.selectedRoles.set(['SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF']);
    fixture.detectChanges();
    component.calculate();
    fixture.detectChanges();

    expect(component.result()).not.toBeNull();

    component.onToggleRestriction();
    fixture.detectChanges();

    expect(component.result()).toBeNull();
  });

  it('locked player bypasses position restriction (locked slot not checked for position)', () => {
    // Lock player 10 (Striker, position='ST (C)') into slot 1 (DL) — ineligible for DL.
    // The locked slot itself is not checked (bypass), and all other free slots still have
    // eligible players, so canCalculate should remain true.
    const players = make11PlayersWithPositions();
    playersSubject.next(players);
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    const locks = new Array(11).fill(null) as (number | null)[];
    locks[1] = 10; // lock Striker 1 (ST) into DL slot
    component.lockedPlayers.set(locks);

    component.selectedRoles.set(['SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF']);
    component.onToggleRestriction();
    fixture.detectChanges();

    // DL slot is locked (bypasses restriction for that slot).
    // All other free slots still have eligible players (including ST covered by player 11).
    expect(component['canCalculate']()).toBe(true);
  });

  it('canCalculate false when locked player in ineligible slot and no eligible players remain for that slot', () => {
    // Use players with positions but assign the ONE ST-eligible player to a non-ST slot
    // Only 2 ST-eligible players (uids 10, 11). Lock both into non-ST slots.
    // Then with restriction ON, the 2 ST slots have no eligible unlocked players.
    const players = make11PlayersWithPositions();
    playersSubject.next(players);
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    // Lock both strikers (uids 10,11) in non-ST slots (ML=index5, MR=index8)
    const locks = new Array(11).fill(null) as (number | null)[];
    locks[5] = 10;
    locks[8] = 11;
    component.lockedPlayers.set(locks);

    component.selectedRoles.set(['SK', 'WB', 'BPD', 'BPD', 'WB', 'W', 'BBM', 'BBM', 'W', 'AF', 'AF']);
    component.onToggleRestriction();
    fixture.detectChanges();

    expect(component['canCalculate']()).toBe(false);

    const warning = element.querySelector('.restriction-warning');
    expect(warning).toBeTruthy();
  });
});

// ── Step 4: localStorage persistence ─────────────────────────────────────────

describe('BestElevenComponent - localStorage', () => {
  let freshSubject: BehaviorSubject<Player[]>;
  let freshComponent: BestElevenComponent;
  let freshFixture: ComponentFixture<BestElevenComponent>;

  const createComponent = async (storedUids?: number[]) => {
    localStorage.clear();
    if (storedUids !== undefined) {
      localStorage.setItem('best_xi_marked_players', JSON.stringify(storedUids));
    }

    freshSubject = new BehaviorSubject<Player[]>([]);
    const mockService = {
      players$: freshSubject.asObservable(),
      roles: signal<RoleGroup>({}),
    };

    await TestBed.configureTestingModule({
      imports: [BestElevenComponent],
      providers: [
        provideRouter([]),
        { provide: PlayerService, useValue: mockService },
      ],
    }).compileComponents();

    freshFixture = TestBed.createComponent(BestElevenComponent);
    freshComponent = freshFixture.componentInstance;
  };

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('persists marked state to localStorage when marks change', async () => {
    await createComponent();
    freshSubject.next(make11Players());
    freshFixture.detectChanges();

    freshComponent.toggleMark(1);
    freshFixture.detectChanges();

    const stored: number[] = JSON.parse(localStorage.getItem('best_xi_marked_players') || '[]');
    expect(stored).not.toContain(1);
    // remaining 10 players should be stored
    [2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(uid => expect(stored).toContain(uid));
  });

  it('restores marked state from localStorage on init', async () => {
    await createComponent([1, 2, 3, 4, 5]);
    freshSubject.next(make11Players());
    freshFixture.detectChanges();

    const marked = freshComponent.markedPlayerUids();
    expect(marked.has(1)).toBe(true);
    expect(marked.has(5)).toBe(true);
    expect(marked.has(6)).toBe(false);
    expect(marked.has(11)).toBe(false);
  });

  it('silently ignores stale UIDs from localStorage on restore', async () => {
    await createComponent([1, 2, 3, 99]); // uid 99 does not exist in the upload
    freshSubject.next(make11Players()); // UIDs 1-11
    freshFixture.detectChanges();

    const marked = freshComponent.markedPlayerUids();
    expect(marked.has(99)).toBe(false);
    expect(marked.has(1)).toBe(true);
    expect(marked.has(3)).toBe(true);
  });

  it('resets all players to marked on new upload with different UIDs', async () => {
    await createComponent();
    freshSubject.next(make11Players());
    freshFixture.detectChanges();

    freshComponent.toggleMark(1);
    freshFixture.detectChanges();
    expect(freshComponent.markedPlayerUids().has(1)).toBe(false);

    // Upload new squad with different UIDs
    const newPlayers = make11Players().map(p => ({ ...p, uid: p.uid + 100 }));
    freshSubject.next(newPlayers);
    freshFixture.detectChanges();

    const marked = freshComponent.markedPlayerUids();
    expect(marked.size).toBe(11);
    newPlayers.forEach(p => expect(marked.has(p.uid)).toBe(true));
  });
});
