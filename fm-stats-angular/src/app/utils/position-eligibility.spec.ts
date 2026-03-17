import { describe, it, expect } from 'vitest';
import { parsePlayerPositions, isPlayerEligibleForSlot } from './position-eligibility';
import { Player } from '../models/player.model';

const makePlayer = (position: string): Player => ({
  uid: 1,
  name: 'Test',
  position,
  roles: [],
  reg: '', inf: '', age: 25, wage: 1000, transferValue: 0,
  nationality: '', secondNationality: '',
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

describe('parsePlayerPositions', () => {
  it('parses bare GK', () => {
    expect(parsePlayerPositions('GK')).toEqual(['GK']);
  });

  it('parses single position with single side', () => {
    expect(parsePlayerPositions('D (C)')).toEqual(['DC']);
  });

  it('parses single position with two sides', () => {
    expect(parsePlayerPositions('D (LC)')).toEqual(['DL', 'DC']);
  });

  it('parses slash-combined bases with single side', () => {
    expect(parsePlayerPositions('D/WB (L)')).toEqual(['DL', 'WBL']);
  });

  it('parses multiple segments separated by comma', () => {
    expect(parsePlayerPositions('AM (R), ST (C)')).toEqual(['AMR', 'ST']);
  });

  it('parses position with three sides', () => {
    expect(parsePlayerPositions('M (RLC)')).toEqual(['MR', 'ML', 'MC']);
  });

  it('treats ST (C) as ST without appending C', () => {
    expect(parsePlayerPositions('ST (C)')).toEqual(['ST']);
  });

  it('parses bare DM with no sides', () => {
    expect(parsePlayerPositions('DM')).toEqual(['DM']);
  });
});

describe('isPlayerEligibleForSlot', () => {
  it('returns true when player position matches slot', () => {
    const player = makePlayer('AM (R), ST (C)');
    expect(isPlayerEligibleForSlot(player, 'ST')).toBe(true);
  });

  it('returns false when player position does not match slot', () => {
    const player = makePlayer('AM (R), ST (C)');
    expect(isPlayerEligibleForSlot(player, 'MC')).toBe(false);
  });

  it('returns true for partial match in multi-side position', () => {
    const player = makePlayer('D (LC)');
    expect(isPlayerEligibleForSlot(player, 'DC')).toBe(true);
  });

  it('returns false for non-matching side in multi-side position', () => {
    const player = makePlayer('D (LC)');
    expect(isPlayerEligibleForSlot(player, 'DR')).toBe(false);
  });
});
