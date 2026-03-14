import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PlayerService } from './player.service';
import { Player } from '../models/player.model';

function mockPlayer(uid = 1): Player {
  return {
    uid,
    name: 'Test Player',
    age: 25,
    club: 'FC Test',
    nationality: 'Swedish',
    secondNationality: '',
    position: 'ST',
    personality: 'Determined',
    mediaHandling: 'Reserved',
    averageRating: 7.5,
    wage: 5000,
    transferValue: 1000000,
    leftFoot: 'Strong',
    rightFoot: 'Weak',
    height: 180,
    reg: '',
    inf: '',
    oneVsOne: 14, acceleration: 15, aerialAbility: 10, aggression: 12,
    agility: 14, anticipation: 13, balance: 14, bravery: 12,
    commandOfArea: 10, concentration: 13, composure: 14, crossing: 10,
    decisions: 13, determination: 15, dribbling: 12, finishing: 14,
    firstTouch: 13, flair: 12, handling: 8, heading: 12,
    jumpingReach: 13, kicking: 8, leadership: 10, longShots: 11,
    marking: 9, offTheBall: 14, pace: 15, passing: 11,
    positioning: 13, reflexes: 9, stamina: 14, strength: 13,
    tackling: 9, teamwork: 13, technique: 13, throwing: 8,
    throwOuts: 8, vision: 12, workRate: 14, corners: 9,
    roles: [{ roleName: 'Striker', shortRoleName: 'ST', position: 'ST', roleScore: 8.5 }],
  };
}

describe('PlayerService', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(k => store[k] ?? null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => { store[k] = v; });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(k => { delete store[k]; });

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  function getService() {
    return TestBed.inject(PlayerService);
  }

  // --- Rehydration ---

  it('starts with empty player list when localStorage is empty', async () => {
    const svc = getService();
    const players = await firstValueFrom(svc.players$);
    expect(players).toEqual([]);
  });

  it('rehydrates stored players on construction', async () => {
    const p = mockPlayer();
    store['uploaded_players'] = JSON.stringify({ players: [p], activeRoles: ['ST'] });
    const svc = getService();
    const players = await firstValueFrom(svc.players$);
    expect(players).toEqual([p]);
  });

  it('rehydrates stored activeRoles on construction', async () => {
    store['uploaded_players'] = JSON.stringify({ players: [], activeRoles: ['ST', 'CM'] });
    const svc = getService();
    const roles = await firstValueFrom(svc.activeRoles$);
    expect(roles).toEqual(new Set(['ST', 'CM']));
  });

  it('starts with empty list when localStorage contains corrupt JSON', async () => {
    store['uploaded_players'] = 'not-valid-json{{';
    const svc = getService();
    expect(() => firstValueFrom(svc.players$)).not.toThrow();
    const players = await firstValueFrom(svc.players$);
    expect(players).toEqual([]);
  });

  it('starts with empty list when localStorage contains valid JSON with wrong shape', async () => {
    store['uploaded_players'] = JSON.stringify({ unexpected: true });
    const svc = getService();
    const players = await firstValueFrom(svc.players$);
    expect(players).toEqual([]);
  });

  // --- setPlayers ---

  it('setPlayers emits the new list on players$', async () => {
    const svc = getService();
    const p = mockPlayer();
    svc.setPlayers([p]);
    const players = await firstValueFrom(svc.players$);
    expect(players).toEqual([p]);
  });

  it('setPlayers persists to localStorage', () => {
    const svc = getService();
    const p = mockPlayer();
    svc.setPlayers([p]);
    const stored = JSON.parse(store['uploaded_players']);
    expect(stored.players).toEqual([p]);
  });

  it('setPlayers resets activeRoles to all roles in the uploaded list', async () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1)]);
    const roles = await firstValueFrom(svc.activeRoles$);
    expect(roles).toEqual(new Set(['ST']));
  });

  it('setPlayers replaces any previously stored players', async () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1)]);
    svc.setPlayers([mockPlayer(2)]);
    const players = await firstValueFrom(svc.players$);
    expect(players.map(p => p.uid)).toEqual([2]);
  });

  // --- removePlayer ---

  it('removePlayer with valid uid emits updated list without that player', async () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1), mockPlayer(2)]);
    svc.removePlayer(1);
    const players = await firstValueFrom(svc.players$);
    expect(players.map(p => p.uid)).toEqual([2]);
  });

  it('removePlayer with valid uid updates localStorage', () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1), mockPlayer(2)]);
    svc.removePlayer(1);
    const stored = JSON.parse(store['uploaded_players']);
    expect(stored.players.map((p: Player) => p.uid)).toEqual([2]);
  });

  it('removePlayer with unknown uid leaves list unchanged', async () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1)]);
    svc.removePlayer(999);
    const players = await firstValueFrom(svc.players$);
    expect(players.map(p => p.uid)).toEqual([1]);
  });

  // --- localStorage unavailable ---

  it('does not crash when localStorage.setItem throws QuotaExceededError', async () => {
    const svc = getService();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => svc.setPlayers([mockPlayer()])).not.toThrow();
    const players = await firstValueFrom(svc.players$);
    expect(players).toHaveLength(1);
  });

  // --- setActiveRoles ---

  it('setActiveRoles persists the new roles to localStorage', () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1)]);
    svc.setActiveRoles(new Set(['CM', 'DM']));
    const stored = JSON.parse(store['uploaded_players']);
    expect(stored.activeRoles).toEqual(expect.arrayContaining(['CM', 'DM']));
    expect(stored.activeRoles).toHaveLength(2);
  });

  // --- localStorage fully unavailable on construction ---

  it('does not crash when localStorage.getItem throws during rehydration', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    expect(() => getService()).not.toThrow();
    const players = await firstValueFrom(getService().players$);
    expect(players).toEqual([]);
  });

  // --- Last-write-wins for concurrent uploads ---

  it('second setPlayers call wins when two uploads complete in sequence', async () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1)]);
    svc.setPlayers([mockPlayer(2)]);
    const players = await firstValueFrom(svc.players$);
    expect(players.map(p => p.uid)).toEqual([2]);
  });

  // --- Upload integration ---

  it('players$ emits the returned players after uploadFile resolves and setPlayers is called', async () => {
    const svc = getService();
    const httpMock = TestBed.inject(HttpTestingController);
    const mockFile = new File(['data'], 'squad.html');
    const mockPlayers = [mockPlayer()];
    const emissions: Player[][] = [];

    svc.players$.subscribe(p => emissions.push(p));
    svc.uploadFile(mockFile).subscribe(players => svc.setPlayers(players));

    httpMock.expectOne('/api/players/upload').flush(mockPlayers);
    httpMock.verify();

    // Last emission should be the uploaded players
    expect(emissions[emissions.length - 1]).toEqual(mockPlayers);
  });
});
