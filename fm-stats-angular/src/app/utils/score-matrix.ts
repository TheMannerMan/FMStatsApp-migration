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
