import { describe, it, expect } from 'vitest';
import { getPlayerRoleScore, getBestRoleForPlayer, buildScoreMatrix, buildConstrainedScoreMatrix, applyPositionRestriction } from './score-matrix';
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

describe('getBestRoleForPlayer', () => {
  it('returns max score and winning role name', () => {
    const player = makePlayer({
      roles: [
        { roleName: 'Sweeper Keeper', shortRoleName: 'SK', position: 'GK', roleScore: 8 },
        { roleName: 'Goalkeeper', shortRoleName: 'GK', position: 'GK', roleScore: 6 },
      ],
    });

    const result = getBestRoleForPlayer(player, ['SK', 'GK']);
    expect(result.score).toBe(8);
    expect(result.role).toBe('SK');
  });

  it('returns first candidate when all scores are 0', () => {
    const player = makePlayer({ roles: [] });

    const result = getBestRoleForPlayer(player, ['SK', 'GK']);
    expect(result.score).toBe(0);
    expect(result.role).toBe('SK');
  });

  it('returns null role when candidate list is empty', () => {
    const player = makePlayer({ roles: [] });

    const result = getBestRoleForPlayer(player, []);
    expect(result.score).toBe(0);
    expect(result.role).toBeNull();
  });

  it('uses first-match tie-breaking (strict > comparison)', () => {
    const player = makePlayer({
      roles: [
        { roleName: 'Role A', shortRoleName: 'A', position: 'GK', roleScore: 7 },
        { roleName: 'Role B', shortRoleName: 'B', position: 'GK', roleScore: 7 },
      ],
    });

    const result = getBestRoleForPlayer(player, ['A', 'B']);
    expect(result.score).toBe(7);
    expect(result.role).toBe('A');
  });

  it('selects the last best if strictly greater later in the list', () => {
    const player = makePlayer({
      roles: [
        { roleName: 'Role A', shortRoleName: 'A', position: 'GK', roleScore: 5 },
        { roleName: 'Role B', shortRoleName: 'B', position: 'GK', roleScore: 9 },
      ],
    });

    const result = getBestRoleForPlayer(player, ['A', 'B']);
    expect(result.score).toBe(9);
    expect(result.role).toBe('B');
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
    const result = buildConstrainedScoreMatrix(players, slotRoles, slotRoles.map(() => []), [
      { slotIndex: 0, playerIndex: 0 },
    ]);
    expect(result.matrix).toEqual([[8], [4]]);
    expect(result.rowMap).toEqual([1, 2]);
    expect(result.colMap).toEqual([1]);
  });

  it('returns empty matrix when all slots are locked', () => {
    const result = buildConstrainedScoreMatrix(players, slotRoles, slotRoles.map(() => []), [
      { slotIndex: 0, playerIndex: 0 },
      { slotIndex: 1, playerIndex: 1 },
    ]);
    expect(result.matrix).toEqual([]);
    expect(result.rowMap).toEqual([]);
    expect(result.colMap).toEqual([]);
  });

  it('returns full matrix with identity mappings when no locks', () => {
    const result = buildConstrainedScoreMatrix(players, slotRoles, slotRoles.map(() => []), []);
    expect(result.matrix).toEqual([
      [9, 7],
      [6, 8],
      [5, 4],
    ]);
    expect(result.rowMap).toEqual([0, 1, 2]);
    expect(result.colMap).toEqual([0, 1]);
  });

  it('bestRoles mirrors slotRoles for manual slots', () => {
    const result = buildConstrainedScoreMatrix(players, slotRoles, slotRoles.map(() => []), []);
    expect(result.bestRoles[0][0]).toBe('AF');
    expect(result.bestRoles[0][1]).toBe('CF');
    expect(result.bestRoles[2][0]).toBe('AF');
  });

  describe('auto slots', () => {
    it('all-null slotRoles: each cell equals best score across candidateRoles', () => {
      // Two auto slots. Slot 0 candidates: ['AF', 'CF'], slot 1 candidates: ['AF']
      const nullRoles: (string | null)[] = [null, null];
      const candidateRoles = [['AF', 'CF'], ['AF']];

      const result = buildConstrainedScoreMatrix(players, nullRoles, candidateRoles, []);

      // Player 0 (AF=9, CF=7): best for slot0=9, best for slot1=9
      // Player 1 (AF=6, CF=8): best for slot0=8, best for slot1=6
      // Player 2 (AF=5, CF=4): best for slot0=5, best for slot1=5
      expect(result.matrix[0][0]).toBe(9); // player0, slot0: max(AF=9,CF=7)=9
      expect(result.matrix[0][1]).toBe(9); // player0, slot1: max(AF=9)=9
      expect(result.matrix[1][0]).toBe(8); // player1, slot0: max(AF=6,CF=8)=8
      expect(result.matrix[1][1]).toBe(6); // player1, slot1: max(AF=6)=6
      expect(result.matrix[2][0]).toBe(5); // player2, slot0: max(AF=5,CF=4)=5
      expect(result.matrix[2][1]).toBe(5); // player2, slot1: max(AF=5)=5
    });

    it('auto slot bestRoles stores the winning role', () => {
      const nullRoles: (string | null)[] = [null];
      const candidateRoles = [['AF', 'CF']];

      const result = buildConstrainedScoreMatrix(players, nullRoles, candidateRoles, []);

      expect(result.bestRoles[0][0]).toBe('AF'); // player0: AF=9 beats CF=7
      expect(result.bestRoles[1][0]).toBe('CF'); // player1: CF=8 beats AF=6
      expect(result.bestRoles[2][0]).toBe('AF'); // player2: AF=5 beats CF=4
    });

    it('empty candidate list for auto slot: entire column is 0 and bestRoles is null', () => {
      const nullRoles: (string | null)[] = [null];
      const candidateRoles: string[][] = [[]];

      const result = buildConstrainedScoreMatrix(players, nullRoles, candidateRoles, []);

      expect(result.matrix[0][0]).toBe(0);
      expect(result.matrix[1][0]).toBe(0);
      expect(result.matrix[2][0]).toBe(0);
      expect(result.bestRoles[0][0]).toBeNull();
      expect(result.bestRoles[1][0]).toBeNull();
      expect(result.bestRoles[2][0]).toBeNull();
    });

    it('mixed manual and auto: manual columns behave as today', () => {
      // Slot 0 = manual 'AF', slot 1 = auto with candidates ['CF']
      const mixedRoles: (string | null)[] = ['AF', null];
      const candidateRoles = [[], ['CF']];

      const result = buildConstrainedScoreMatrix(players, mixedRoles, candidateRoles, []);

      // Manual slot (AF): scores from getPlayerRoleScore
      expect(result.matrix[0][0]).toBe(9); // player0, AF=9
      expect(result.matrix[1][0]).toBe(6); // player1, AF=6
      // Auto slot (CF candidates): best score = CF score
      expect(result.matrix[0][1]).toBe(7); // player0, CF=7
      expect(result.matrix[1][1]).toBe(8); // player1, CF=8
      // bestRoles for manual = the role itself
      expect(result.bestRoles[0][0]).toBe('AF');
      // bestRoles for auto = best candidate
      expect(result.bestRoles[0][1]).toBe('CF');
    });
  });
});

describe('applyPositionRestriction', () => {
  const makePlayerWithPosition = (uid: number, position: string): Player =>
    makePlayer({ uid, position });

  it('zeroes out ineligible player/slot pairs', () => {
    // Player 0: GK, Player 1: ST
    // Slot 0: GK, Slot 1: ST
    // rowMap=[0,1], colMap=[0,1]
    const players = [
      makePlayerWithPosition(0, 'GK'),
      makePlayerWithPosition(1, 'ST (C)'),
    ];
    const slotPositions = ['GK', 'ST'];
    const slotRoles: (string | null)[] = ['SK', 'AF'];
    const rowMap = [0, 1];
    const colMap = [0, 1];
    const matrix = [
      [9, 5], // GK player: 9 for GK slot, 5 for ST slot
      [3, 8], // ST player: 3 for GK slot, 8 for ST slot
    ];

    applyPositionRestriction(matrix, players, slotPositions, slotRoles, rowMap, colMap);

    // GK player ineligible for ST slot → zeroed
    expect(matrix[0][1]).toBe(0);
    // ST player ineligible for GK slot → zeroed
    expect(matrix[1][0]).toBe(0);
    // Eligible pairs retain scores
    expect(matrix[0][0]).toBe(9);
    expect(matrix[1][1]).toBe(8);
  });

  it('retains scores for eligible pairs', () => {
    const players = [makePlayerWithPosition(0, 'D (LC)')];
    const slotPositions = ['DL'];
    const slotRoles: (string | null)[] = ['WB'];
    const rowMap = [0];
    const colMap = [0];
    const matrix = [[7]];

    applyPositionRestriction(matrix, players, slotPositions, slotRoles, rowMap, colMap);

    expect(matrix[0][0]).toBe(7);
  });

  it('zeroes all slots for a player with no matching positions', () => {
    const players = [makePlayerWithPosition(0, 'GK')];
    const slotPositions = ['ST', 'DC'];
    const slotRoles: (string | null)[] = ['AF', 'BPD'];
    const rowMap = [0];
    const colMap = [0, 1];
    const matrix = [[6, 4]];

    applyPositionRestriction(matrix, players, slotPositions, slotRoles, rowMap, colMap);

    expect(matrix[0][0]).toBe(0);
    expect(matrix[0][1]).toBe(0);
  });

  it('zeroes auto-role slots when player is ineligible for the position', () => {
    // Player is GK, slot is ST — auto slot (role is null), but restriction applies
    const players = [makePlayerWithPosition(0, 'GK')];
    const slotPositions = ['ST'];
    const slotRoles: (string | null)[] = [null]; // auto slot
    const rowMap = [0];
    const colMap = [0];
    const matrix = [[6]];

    applyPositionRestriction(matrix, players, slotPositions, slotRoles, rowMap, colMap);

    // Ineligible → zeroed even for auto slot
    expect(matrix[0][0]).toBe(0);
  });

  it('mixed: both manual and auto slots zeroed when player ineligible for position', () => {
    const players = [makePlayerWithPosition(0, 'GK')];
    const slotPositions = ['ST', 'DR'];
    const slotRoles: (string | null)[] = ['AF', null]; // slot0 manual, slot1 auto
    const rowMap = [0];
    const colMap = [0, 1];
    const matrix = [[5, 9]];

    applyPositionRestriction(matrix, players, slotPositions, slotRoles, rowMap, colMap);

    expect(matrix[0][0]).toBe(0); // GK player ineligible for ST manual slot → zeroed
    expect(matrix[0][1]).toBe(0); // GK player ineligible for DR auto slot → also zeroed
  });
});
