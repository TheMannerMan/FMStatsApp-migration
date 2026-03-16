import { describe, it, expect } from 'vitest';
import { hungarian, Assignment } from './hungarian';

describe('hungarian', () => {
  it('returns valid assignments for a 3x3 all-zeros matrix with total score 0', () => {
    const matrix = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    const assignments = hungarian(matrix);

    expect(assignments).toHaveLength(3);
    const slotIndices = assignments.map((a) => a.slotIndex).sort((a, b) => a - b);
    const playerIndices = assignments.map((a) => a.playerIndex).sort((a, b) => a - b);
    expect(slotIndices).toEqual([0, 1, 2]);
    expect(playerIndices).toEqual([0, 1, 2]);
    const totalScore = assignments.reduce((sum, a) => sum + a.score, 0);
    expect(totalScore).toBe(0);
  });

  it('finds the optimal assignment in a 3x3 non-greedy case', () => {
    // Greedy row-by-row: row0->col0(9), row1->col1(8), row2->col2(4) = 21
    // Optimal:           row0->col1(9) or row0->col0(9), row1->col2(8), row2->col0(7) = 24
    // Matrix designed so greedy (picking highest per row in order) is suboptimal:
    // row0: highest=9 at col0, row1: highest available=8 at col1, row2: highest available=4 at col2 → 21
    // Optimal: row0→col1(9), row1→col2(8), row2→col0(7) = 24
    const matrix = [
      [9, 9, 1],
      [1, 1, 8],
      [7, 1, 1],
    ];

    const assignments = hungarian(matrix);

    expect(assignments).toHaveLength(3);
    const totalScore = assignments.reduce((sum, a) => sum + a.score, 0);
    // Optimal total is 24: (row0,col1)=9 + (row1,col2)=8 + (row2,col0)=7
    expect(totalScore).toBe(24);

    // Verify it's a valid assignment (no duplicate slots or players)
    const slotIndices = assignments.map((a) => a.slotIndex).sort((a, b) => a - b);
    const playerIndices = assignments.map((a) => a.playerIndex).sort((a, b) => a - b);
    expect(slotIndices).toEqual([0, 1, 2]);
    expect(playerIndices).toEqual([0, 1, 2]);
  });

  it('assigns all 11 slots for an 11x11 matrix with no index out of bounds', () => {
    // Build a simple 11x11 identity-like matrix
    const matrix: number[][] = Array.from({ length: 11 }, (_, i) =>
      Array.from({ length: 11 }, (_, j) => (i === j ? 10 : 1)),
    );

    const assignments = hungarian(matrix);

    expect(assignments).toHaveLength(11);
    assignments.forEach((a) => {
      expect(a.slotIndex).toBeGreaterThanOrEqual(0);
      expect(a.slotIndex).toBeLessThan(11);
      expect(a.playerIndex).toBeGreaterThanOrEqual(0);
      expect(a.playerIndex).toBeLessThan(11);
    });
    const slotIndices = assignments.map((a) => a.slotIndex).sort((a, b) => a - b);
    const playerIndices = assignments.map((a) => a.playerIndex).sort((a, b) => a - b);
    expect(slotIndices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(playerIndices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('handles a rectangular 15x11 matrix, returning exactly 11 assignments', () => {
    // 15 players, 11 slots — more rows (players) than columns (slots)
    const matrix: number[][] = Array.from({ length: 15 }, (_, i) =>
      Array.from({ length: 11 }, (_, j) => ((i + j) % 10) + 1),
    );

    const assignments = hungarian(matrix);

    // Exactly one assignment per slot
    expect(assignments).toHaveLength(11);

    // All slot indices 0-10 covered
    const slotIndices = assignments.map((a) => a.slotIndex).sort((a, b) => a - b);
    expect(slotIndices).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    // No duplicate player indices
    const playerIndices = assignments.map((a) => a.playerIndex);
    const uniquePlayerIndices = new Set(playerIndices);
    expect(uniquePlayerIndices.size).toBe(11);

    // All player indices valid
    playerIndices.forEach((idx) => {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(15);
    });
  });

  it('each assignment has correct score matching the matrix cell', () => {
    const matrix = [
      [5, 3, 1],
      [2, 8, 4],
      [6, 1, 7],
    ];

    const assignments = hungarian(matrix);

    assignments.forEach((a) => {
      expect(a.score).toBe(matrix[a.playerIndex][a.slotIndex]);
    });
  });
});
