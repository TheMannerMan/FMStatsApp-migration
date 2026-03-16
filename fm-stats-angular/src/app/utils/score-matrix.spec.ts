import { describe, it, expect } from 'vitest';
import { getPlayerRoleScore, buildScoreMatrix, buildConstrainedScoreMatrix } from './score-matrix';
import { Player } from '../models/player.model';

const makePlayer = (overrides: Partial<Player> = {}): Player => ({
  roles: [],
  reg: '',
  inf: '',
  name: 'Test Player',
  age: 25,
  wage: 1000,
  transferValue: 0,
  nationality: '',
  secondNationality: '',
  position: '',
  personality: '',
  mediaHandling: '',
  averageRating: 0,
  leftFoot: '',
  rightFoot: '',
  height: 180,
  oneVsOne: 0,
  acceleration: 0,
  aerialAbility: 0,
  aggression: 0,
  agility: 0,
  anticipation: 0,
  balance: 0,
  bravery: 0,
  commandOfArea: 0,
  concentration: 0,
  composure: 0,
  crossing: 0,
  decisions: 0,
  determination: 0,
  dribbling: 0,
  finishing: 0,
  firstTouch: 0,
  flair: 0,
  handling: 0,
  heading: 0,
  jumpingReach: 0,
  kicking: 0,
  leadership: 0,
  longShots: 0,
  marking: 0,
  offTheBall: 0,
  pace: 0,
  passing: 0,
  positioning: 0,
  reflexes: 0,
  stamina: 0,
  strength: 0,
  tackling: 0,
  teamwork: 0,
  technique: 0,
  throwing: 0,
  throwOuts: 0,
  vision: 0,
  workRate: 0,
  uid: 1,
  corners: 0,
  club: '',
  ...overrides,
});

describe('getPlayerRoleScore', () => {
  it('returns correct score when role exists', () => {
    const player = makePlayer({
      roles: [
        { roleName: 'Advanced Forward', shortRoleName: 'AF', position: 'ST', roleScore: 85 },
        { roleName: 'Complete Forward', shortRoleName: 'CF', position: 'ST', roleScore: 72 },
      ],
    });

    expect(getPlayerRoleScore(player, 'AF')).toBe(85);
    expect(getPlayerRoleScore(player, 'CF')).toBe(72);
  });

  it('returns 0 when role does not exist', () => {
    const player = makePlayer({
      roles: [
        { roleName: 'Advanced Forward', shortRoleName: 'AF', position: 'ST', roleScore: 85 },
      ],
    });

    expect(getPlayerRoleScore(player, 'DLF')).toBe(0);
  });

  it('returns 0 when player has empty roles array', () => {
    const player = makePlayer({ roles: [] });

    expect(getPlayerRoleScore(player, 'AF')).toBe(0);
  });
});

describe('buildScoreMatrix', () => {
  it('returns NxM number matrix with correct scores', () => {
    const players = [
      makePlayer({
        uid: 1,
        roles: [
          { roleName: 'Advanced Forward', shortRoleName: 'AF', position: 'ST', roleScore: 85 },
          { roleName: 'Complete Forward', shortRoleName: 'CF', position: 'ST', roleScore: 72 },
        ],
      }),
      makePlayer({
        uid: 2,
        roles: [
          { roleName: 'Advanced Forward', shortRoleName: 'AF', position: 'ST', roleScore: 60 },
          { roleName: 'Deep-Lying Forward', shortRoleName: 'DLF', position: 'ST', roleScore: 90 },
        ],
      }),
    ];
    const slotRoles = ['AF', 'CF', 'DLF'];

    const matrix = buildScoreMatrix(players, slotRoles);

    // Dimensions: 2 players x 3 roles
    expect(matrix.length).toBe(2);
    expect(matrix[0].length).toBe(3);
    expect(matrix[1].length).toBe(3);

    // Player 0: AF=85, CF=72, DLF=0
    expect(matrix[0]).toEqual([85, 72, 0]);

    // Player 1: AF=60, CF=0, DLF=90
    expect(matrix[1]).toEqual([60, 0, 90]);
  });
});

describe('buildConstrainedScoreMatrix', () => {
  const players = [
    makePlayer({
      uid: 1,
      roles: [
        { roleName: 'Advanced Forward', shortRoleName: 'AF', position: 'ST', roleScore: 9 },
        { roleName: 'Complete Forward', shortRoleName: 'CF', position: 'ST', roleScore: 7 },
      ],
    }),
    makePlayer({
      uid: 2,
      roles: [
        { roleName: 'Advanced Forward', shortRoleName: 'AF', position: 'ST', roleScore: 6 },
        { roleName: 'Complete Forward', shortRoleName: 'CF', position: 'ST', roleScore: 8 },
      ],
    }),
    makePlayer({
      uid: 3,
      roles: [
        { roleName: 'Advanced Forward', shortRoleName: 'AF', position: 'ST', roleScore: 5 },
        { roleName: 'Complete Forward', shortRoleName: 'CF', position: 'ST', roleScore: 4 },
      ],
    }),
  ];
  const slotRoles = ['AF', 'CF'];

  it('excludes locked player and slot from matrix, returns correct mappings', () => {
    const result = buildConstrainedScoreMatrix(players, slotRoles, [
      { slotIndex: 0, playerIndex: 0 },
    ]);
    expect(result.matrix).toEqual([[8], [4]]);
    expect(result.rowMap).toEqual([1, 2]);
    expect(result.colMap).toEqual([1]);
  });

  it('returns empty matrix when all slots are locked', () => {
    const result = buildConstrainedScoreMatrix(players, slotRoles, [
      { slotIndex: 0, playerIndex: 0 },
      { slotIndex: 1, playerIndex: 1 },
    ]);
    expect(result.matrix).toEqual([]);
    expect(result.rowMap).toEqual([]);
    expect(result.colMap).toEqual([]);
  });

  it('returns full matrix with identity mappings when no locks', () => {
    const result = buildConstrainedScoreMatrix(players, slotRoles, []);
    expect(result.matrix).toEqual([
      [9, 7],
      [6, 8],
      [5, 4],
    ]);
    expect(result.rowMap).toEqual([0, 1, 2]);
    expect(result.colMap).toEqual([0, 1]);
  });
});
