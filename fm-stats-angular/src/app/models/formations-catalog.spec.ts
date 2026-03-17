import { describe, it, expect } from 'vitest';
import { FORMATIONS_CATALOG, FORMATION_SLUGS } from './formations-catalog';

describe('FORMATIONS_CATALOG', () => {
  it('has exactly 9 formations', () => {
    expect(Object.keys(FORMATIONS_CATALOG).length).toBe(9);
  });

  it('FORMATION_SLUGS has 9 entries', () => {
    expect(FORMATION_SLUGS.length).toBe(9);
  });

  it('all slugs in FORMATION_SLUGS match keys in FORMATIONS_CATALOG', () => {
    const catalogKeys = Object.keys(FORMATIONS_CATALOG);
    expect(FORMATION_SLUGS).toEqual(catalogKeys);
  });

  it('all formations have exactly 11 slots', () => {
    for (const [slug, slots] of Object.entries(FORMATIONS_CATALOG)) {
      expect(slots.length, `${slug} should have 11 slots`).toBe(11);
    }
  });

  it('each formation has exactly one GK slot', () => {
    for (const [slug, slots] of Object.entries(FORMATIONS_CATALOG)) {
      const gkCount = slots.filter(s => s.position === 'GK').length;
      expect(gkCount, `${slug} should have exactly 1 GK`).toBe(1);
    }
  });
});
