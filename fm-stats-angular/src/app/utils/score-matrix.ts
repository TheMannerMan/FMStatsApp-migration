import { Player } from '../models/player.model';
import { isPlayerEligibleForSlot } from './position-eligibility';

/**
 * Returns the roleScore for a given shortRoleName on a player.
 * Returns 0 if the player has no matching role.
 */
export function getPlayerRoleScore(player: Player, shortRoleName: string): number {
  const role = player.roles.find((r) => r.shortRoleName === shortRoleName);
  return role ? role.roleScore : 0;
}

export interface BestRoleResult {
  score: number;
  role: string | null;
}

/**
 * Returns the candidate role that maximises the player's score.
 * Tie-breaking: first candidate in input order wins (strict > comparison).
 * When candidateShortRoleNames is empty, returns { score: 0, role: null }.
 * When all candidates score 0, returns { score: 0, role: <first candidate> }.
 */
export function getBestRoleForPlayer(
  player: Player,
  candidateShortRoleNames: string[],
): BestRoleResult {
  if (candidateShortRoleNames.length === 0) return { score: 0, role: null };
  let bestScore = getPlayerRoleScore(player, candidateShortRoleNames[0]);
  let bestRole: string = candidateShortRoleNames[0];
  for (let i = 1; i < candidateShortRoleNames.length; i++) {
    const s = getPlayerRoleScore(player, candidateShortRoleNames[i]);
    if (s > bestScore) {
      bestScore = s;
      bestRole = candidateShortRoleNames[i];
    }
  }
  return { score: bestScore, role: bestRole };
}

/**
 * Builds a score matrix of dimensions players.length × slotRoles.length.
 * matrix[i][j] is the score of players[i] for slotRoles[j].
 */
export function buildScoreMatrix(players: Player[], slotRoles: string[]): number[][] {
  return players.map((player) =>
    slotRoles.map((role) => getPlayerRoleScore(player, role))
  );
}

export interface ConstrainedMatrixResult {
  matrix: number[][];
  bestRoles: (string | null)[][];
  rowMap: number[];
  colMap: number[];
}

/**
 * Builds a reduced score matrix excluding locked player/slot pairs.
 * Returns the sub-matrix, a bestRoles matrix (resolved role per cell),
 * and mappings from reduced indices back to original indices.
 *
 * For manual slots (slotRoles[j] !== null): score = getPlayerRoleScore for that role.
 * For auto slots (slotRoles[j] === null): score = best score across slotCandidateRoles[j].
 */
export function buildConstrainedScoreMatrix(
  players: Player[],
  slotRoles: (string | null)[],
  slotCandidateRoles: string[][],
  lockedPairs: { slotIndex: number; playerIndex: number }[],
): ConstrainedMatrixResult {
  const lockedPlayerIndices = new Set(lockedPairs.map((lp) => lp.playerIndex));
  const lockedSlotIndices = new Set(lockedPairs.map((lp) => lp.slotIndex));

  const rowMap = players
    .map((_, i) => i)
    .filter((i) => !lockedPlayerIndices.has(i));
  const colMap = slotRoles
    .map((_, i) => i)
    .filter((i) => !lockedSlotIndices.has(i));

  if (rowMap.length === 0 || colMap.length === 0) {
    return { matrix: [], bestRoles: [], rowMap: [], colMap: [] };
  }

  const matrix: number[][] = [];
  const bestRoles: (string | null)[][] = [];

  for (const pi of rowMap) {
    const row: number[] = [];
    const roleRow: (string | null)[] = [];
    for (const si of colMap) {
      const role = slotRoles[si];
      if (role !== null) {
        // Manual slot
        row.push(getPlayerRoleScore(players[pi], role));
        roleRow.push(role);
      } else {
        // Auto slot
        const { score, role: bestRole } = getBestRoleForPlayer(players[pi], slotCandidateRoles[si]);
        row.push(score);
        roleRow.push(bestRole);
      }
    }
    matrix.push(row);
    bestRoles.push(roleRow);
  }

  return { matrix, bestRoles, rowMap, colMap };
}

/**
 * Zeroes out matrix cells where the player (via rowMap) is not eligible
 * for the slot position (via colMap). Skips auto-role slots (slotRoles[colMap[j]] === null).
 * Modifies the matrix in-place.
 */
export function applyPositionRestriction(
  matrix: number[][],
  players: Player[],
  slotPositions: string[],
  slotRoles: (string | null)[],
  rowMap: number[],
  colMap: number[],
): void {
  for (let j = 0; j < colMap.length; j++) {
    for (let i = 0; i < rowMap.length; i++) {
      if (!isPlayerEligibleForSlot(players[rowMap[i]], slotPositions[colMap[j]])) {
        matrix[i][j] = 0;
      }
    }
  }
}
