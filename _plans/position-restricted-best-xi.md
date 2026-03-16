# Plan: Position-Restricted Best XI

## Context

The Best XI page currently assigns any player to any formation slot using the Hungarian algorithm to maximize total score. This can produce unrealistic results — e.g., a GK assigned to a striker slot. The feature adds a toggle that, when ON, restricts each slot to only players whose FM position includes that slot's position code.

**Spec:** `_specs/position-restricted-best-xi.md`
**Branch:** `claude/feature/position-restricted-best-xi`

## Open Question Answer: Position Format

FM exports use format like `"AM (R), ST (C)"`, `"D (LC)"`, `"GK"`, `"D/WB (L)"`.

The backend `Position` enum (`FMStatsApp/Models/Formation.cs:4-13`) defines valid codes:
`GK, DL, DC, DR, WBL, WBR, DM, ML, MC, MR, AML, AMC, AMR, ST`

**Parsing rule:** Split on `, ` → for each group parse `BASE (SIDES)` → expand to position codes:
- `D (LC)` → `["DL", "DC"]`
- `AM (R)` → `["AMR"]`
- `ST (C)` → `["ST"]` (C is implicit for ST)
- `GK` → `["GK"]` (no sides)
- `DM` → `["DM"]` (no sides)
- `D/WB (L)` → `["DL", "WBL"]` (slash = multiple bases)

**Matching:** A player is eligible for a slot if any of their expanded position codes matches `FormationSlot.position` exactly.

## Clarification Decisions (from spec suggestions)

- Locked players **bypass** position restriction (explicit user override)
- Toggle state does **not** persist (default OFF on load)
- Locked player in ineligible slot when restriction ON → show warning, block calculation

---

## Step 1: Position eligibility utility

**New file:** `fm-stats-angular/src/app/utils/position-eligibility.ts`

```typescript
export function parsePlayerPositions(positionString: string): string[]
// "AM (R), ST (C)" → ["AMR", "ST"]
// "D/WB (LC)" → ["DL", "DC", "WBL"]
// "GK" → ["GK"]

export function isPlayerEligibleForSlot(player: Player, slotPosition: string): boolean
// parsePlayerPositions(player.position).includes(slotPosition)
```

Parsing steps:
1. Split input on `, ` → segments
2. For each segment, regex: `^([A-Z/]+)(?:\s*\(([LCRL]+)\))?$`
3. Split bases on `/`, expand each base × each side character
4. Special case: `ST` + `C` → `ST` (not `STC`); bare base (no parens) → just the base

**Test file:** `fm-stats-angular/src/app/utils/position-eligibility.spec.ts`

Tests for `parsePlayerPositions`:
- `"GK"` → `["GK"]`
- `"D (C)"` → `["DC"]`
- `"D (LC)"` → `["DL", "DC"]`
- `"D/WB (L)"` → `["DL", "WBL"]`
- `"AM (R), ST (C)"` → `["AMR", "ST"]`
- `"M (RLC)"` → `["MR", "ML", "MC"]`
- `"ST (C)"` → `["ST"]`
- `"DM"` → `["DM"]`

Tests for `isPlayerEligibleForSlot`:
- Player with `"AM (R), ST (C)"` eligible for ST slot → true
- Same player eligible for MC slot → false
- Player with `"D (LC)"` eligible for DC slot → true
- Player with `"D (LC)"` eligible for DR slot → false

## Step 2: Position-restricted score matrix

**Modify:** `fm-stats-angular/src/app/utils/score-matrix.ts`

Add function:
```typescript
export function applyPositionRestriction(
  matrix: number[][],
  players: Player[],
  slotPositions: string[],
  rowMap: number[],
  colMap: number[]
): void
// Zero out matrix[i][j] where players[rowMap[i]] is not eligible for slotPositions[colMap[j]]
```

This is called after `buildConstrainedScoreMatrix` when restriction is ON. It modifies the matrix in-place, setting ineligible cells to 0. The Hungarian algorithm will then naturally avoid those assignments (they have the worst score).

**Test file:** `fm-stats-angular/src/app/utils/score-matrix.spec.ts` (extend existing)

- Test that with restriction ON, ineligible player/slot pairs have score 0
- Test that eligible pairs retain their original scores

## Step 3: Component changes

**Modify:** `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.ts`

Add:
1. `positionRestriction = signal(false)` — toggle state
2. `positionRestrictionErrors = computed(() => ...)` — for each free slot, check if any eligible player's position matches; return list of slot positions with zero eligible players
3. Update `canCalculate`:
   - When restriction ON and `positionRestrictionErrors().length > 0` → return false
   - When restriction ON and a locked player violates position → return false
4. Update `calculate()`:
   - After `buildConstrainedScoreMatrix`, if restriction ON, call `applyPositionRestriction()`
5. `onToggleRestriction()`:
   - Toggle signal
   - Clear `result` (same as other invalidation paths)

**Modify:** `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html`

Add near the calculate button:
```html
<div class="restriction-toggle">
  <p-toggleswitch [(ngModel)]="..." (onChange)="onToggleRestriction()" />
  <label>Position Restriction</label>
</div>
```

Add error message (reuse `.warning-message` class):
```html
@if (positionRestrictionErrors().length > 0) {
  <p class="warning-message">
    No eligible players for: {{ positionRestrictionErrors().join(', ') }}
  </p>
}
```

**Check PrimeNG availability:** PrimeNG `ToggleSwitch` may need import. If not available, use a simple checkbox input styled as toggle — matches existing pattern of native inputs in the project.

## Step 4: Component tests

**Modify:** `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts`

Add test cases:
- Toggle OFF → `canCalculate` behaves as before
- Toggle ON, all slots have eligible players → `canCalculate` true, result respects positions
- Toggle ON, a slot has no eligible players → `canCalculate` false, error message rendered
- Toggling restriction while result exists → result cleared
- Locked player bypasses position restriction
- Locked player in ineligible slot with restriction ON → error shown, `canCalculate` false

---

## Files to modify/create

| File | Action |
|------|--------|
| `fm-stats-angular/src/app/utils/position-eligibility.ts` | **Create** — parse + match logic |
| `fm-stats-angular/src/app/utils/position-eligibility.spec.ts` | **Create** — unit tests |
| `fm-stats-angular/src/app/utils/score-matrix.ts` | **Modify** — add `applyPositionRestriction` |
| `fm-stats-angular/src/app/utils/score-matrix.spec.ts` | **Modify** — add restriction tests |
| `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.ts` | **Modify** — toggle signal, errors computed, calculate changes |
| `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html` | **Modify** — toggle UI, error message |
| `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts` | **Modify** — add restriction test cases |

## Build sequence

1. Write `position-eligibility.ts` + tests → run tests
2. Add `applyPositionRestriction` to `score-matrix.ts` + tests → run tests
3. Add toggle + error logic to component TS → update template → run tests
4. Add component tests → run all tests

## Verification

```bash
cd fm-stats-angular && npx ng test --watch=false
```

All existing tests must pass. New tests must cover the cases listed in the spec's Testing Guidelines section.
