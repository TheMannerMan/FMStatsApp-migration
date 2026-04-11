import { describe, it, expect } from 'vitest';
import { FORMATIONS_CATALOG, FORMATION_SLUGS } from './formations-catalog';

describe('FORMATIONS_CATALOG', () => {
  it('has exactly 10 formations', () => {
    expect(Object.keys(FORMATIONS_CATALOG).length).toBe(10);
  });

  it('FORMATION_SLUGS has 10 entries', () => {
    expect(FORMATION_SLUGS.length).toBe(10);
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

  describe('5-2-3 DM Wide', () => {
    it('is present in the catalog', () => {
      expect('5-2-3 DM Wide' in FORMATIONS_CATALOG).toBe(true);
    });

    it('has exactly 11 slots', () => {
      expect(FORMATIONS_CATALOG['5-2-3 DM Wide'].length).toBe(11);
    });

    it('has slots in the correct position order', () => {
      const positions = FORMATIONS_CATALOG['5-2-3 DM Wide'].map(s => s.position);
      expect(positions).toEqual([
        'GK',
        'WBL', 'DC', 'DC', 'DC', 'WBR',
        'DM', 'DM',
        'AML', 'AMR', 'ST',
      ]);
    });

    it('has correct row assignments for each slot', () => {
      const slots = FORMATIONS_CATALOG['5-2-3 DM Wide'];
      expect(slots[0].row).toBe(0);   // GK
      expect(slots[1].row).toBe(1);   // WBL
      expect(slots[2].row).toBe(1);   // DC
      expect(slots[3].row).toBe(1);   // DC
      expect(slots[4].row).toBe(1);   // DC
      expect(slots[5].row).toBe(1);   // WBR
      expect(slots[6].row).toBe(2);   // DM
      expect(slots[7].row).toBe(2);   // DM
      expect(slots[8].row).toBe(3);   // AML
      expect(slots[9].row).toBe(3);   // AMR
      expect(slots[10].row).toBe(3);  // ST
    });
  });
});
