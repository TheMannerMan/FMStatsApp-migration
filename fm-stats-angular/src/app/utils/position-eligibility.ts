import { Player } from '../models/player.model';

/**
 * Parses an FM position string like "AM (R), ST (C)" or "D/WB (L)"
 * into an array of position codes like ["AMR", "ST"] or ["DL", "WBL"].
 */
export function parsePlayerPositions(positionString: string): string[] {
  const result: string[] = [];
  const segments = positionString.split(', ');

  for (const segment of segments) {
    const match = segment.trim().match(/^([A-Z/]+)(?:\s*\(([LCRL]+)\))?$/);
    if (!match) continue;

    const bases = match[1].split('/');
    const sides = match[2] ? match[2].split('') : [];

    for (const base of bases) {
      if (sides.length === 0) {
        result.push(base);
      } else {
        for (const side of sides) {
          // ST (C) → "ST", not "STC"; similarly DM has no sides
          if (side === 'C' && base === 'ST') {
            result.push(base);
          } else if (side === 'C' && !['D', 'M', 'AM', 'WB', 'W'].includes(base)) {
            // Bare bases like DM, ST, GK don't take side suffixes
            result.push(base);
          } else {
            result.push(base + side);
          }
        }
      }
    }
  }

  return result;
}

/**
 * Returns true if any of the player's parsed positions matches the given slot position code.
 */
export function isPlayerEligibleForSlot(player: Player, slotPosition: string): boolean {
  return parsePlayerPositions(player.position).includes(slotPosition);
}
