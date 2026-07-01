import { describe, it, expect, beforeEach } from 'vitest';
import { BestElevenStateService } from './best-eleven-state.service';
import { Player } from '../models/player.model';

const makePlayer = (uid: number, name = `Player ${uid}`): Player => ({
  uid,
  name,
  roles: [],
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

const makePlayers = (count = 11, offset = 0): Player[] =>
  Array.from({ length: count }, (_, index) => makePlayer(index + 1 + offset));

describe('BestElevenStateService', () => {
  let service: BestElevenStateService;

  beforeEach(() => {
    service = new BestElevenStateService();
  });

  it('initializes clean state for the selected formation', () => {
    const players = makePlayers();

    service.useFormation('4-4-2', 11, players);

    expect(service.formationSlug()).toBe('4-4-2');
    expect(service.selectedRoles()).toEqual(new Array(11).fill(null));
    expect(service.lockedPlayers()).toEqual(new Array(11).fill(null));
    expect(service.result()).toBeNull();
    expect(service.markedPlayerUids()).toEqual(new Set(players.map(player => player.uid)));
    expect(service.positionRestriction()).toBe(false);
    expect(service.searchQuery()).toBe('');
    expect(service.sortColumn()).toBeNull();
    expect(service.sortDirection()).toBe('asc');
  });

  it('reuses state for the same formation and same players', () => {
    const players = makePlayers();
    service.useFormation('4-4-2', 11, players);
    service.setRole(0, 'SK');
    service.setLockedPlayer(0, 1);
    service.toggleMark(11);
    service.togglePositionRestriction();
    service.setSearchQuery('keeper');
    service.toggleSort('name');

    service.useFormation('4-4-2', 11, players);

    expect(service.selectedRoles()[0]).toBe('SK');
    expect(service.lockedPlayers()[0]).toBe(1);
    expect(service.markedPlayerUids().has(11)).toBe(false);
    expect(service.positionRestriction()).toBe(true);
    expect(service.searchQuery()).toBe('keeper');
    expect(service.sortColumn()).toBe('name');
  });

  it('resets state when the formation changes', () => {
    const players = makePlayers();
    service.useFormation('4-4-2', 11, players);
    service.setRole(0, 'SK');
    service.toggleMark(11);

    service.useFormation('4-3-3', 11, players);

    expect(service.formationSlug()).toBe('4-3-3');
    expect(service.selectedRoles().every(role => role === null)).toBe(true);
    expect(service.lockedPlayers().every(lock => lock === null)).toBe(true);
    expect(service.markedPlayerUids()).toEqual(new Set(players.map(player => player.uid)));
  });

  it('resets state when the uploaded squad changes to different UIDs', () => {
    const players = makePlayers();
    const newPlayers = makePlayers(11, 100);
    service.useFormation('4-4-2', 11, players);
    service.setRole(0, 'SK');
    service.toggleMark(11);

    service.useFormation('4-4-2', 11, newPlayers);

    expect(service.formationSlug()).toBe('4-4-2');
    expect(service.selectedRoles().every(role => role === null)).toBe(true);
    expect(service.markedPlayerUids()).toEqual(new Set(newPlayers.map(player => player.uid)));
  });

  it('resetSettings clears Best XI settings but keeps the current formation', () => {
    const players = makePlayers();
    service.useFormation('4-4-2', 11, players);
    service.setRole(0, 'SK');
    service.setLockedPlayer(0, 1);
    service.toggleMark(11);
    service.togglePositionRestriction();
    service.setSearchQuery('keeper');
    service.toggleSort('position');

    service.resetSettings(players);

    expect(service.formationSlug()).toBe('4-4-2');
    expect(service.selectedRoles().every(role => role === null)).toBe(true);
    expect(service.lockedPlayers().every(lock => lock === null)).toBe(true);
    expect(service.result()).toBeNull();
    expect(service.markedPlayerUids()).toEqual(new Set(players.map(player => player.uid)));
    expect(service.positionRestriction()).toBe(false);
    expect(service.searchQuery()).toBe('');
    expect(service.sortColumn()).toBeNull();
    expect(service.sortDirection()).toBe('asc');
  });
});
