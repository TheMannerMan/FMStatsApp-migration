import { Player } from '../models/player.model';

/**
 * Returns the roleScore for a given shortRoleName on a player.
 * Returns 0 if the player has no matching role.
 */
export function getPlayerRoleScore(player: Player, shortRoleName: string): number {
  const role = player.roles.find((r) => r.shortRoleName === shortRoleName);
  return role ? role.roleScore : 0;
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
  rowMap: number[];
  colMap: number[];
}

/**
 * Builds a reduced score matrix excluding locked player/slot pairs.
 * Returns the sub-matrix plus mappings from reduced indices back to original indices.
 */
export function buildConstrainedScoreMatrix(
  players: Player[],
  slotRoles: string[],
  lockedPairs: { slotIndex: number; playerIndex: number }[]
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
    return { matrix: [], rowMap: [], colMap: [] };
  }

  const matrix = rowMap.map((pi) =>
    colMap.map((si) => getPlayerRoleScore(players[pi], slotRoles[si]))
  );

  return { matrix, rowMap, colMap };
}
