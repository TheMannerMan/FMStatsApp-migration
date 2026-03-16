import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { BestElevenComponent } from './best-eleven.component';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { RoleGroup } from '../../models/role-group.model';
import { signal } from '@angular/core';

const makePlayer = (uid: number, name: string, roles: { shortRoleName: string; position: string; roleScore: number }[]): Player => ({
  uid,
  name,
  roles: roles.map(r => ({ roleName: r.shortRoleName, ...r })),
  reg: '', inf: '', age: 25, wage: 1000, transferValue: 0,
  nationality: '', secondNationality: '', position: '',
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
});
