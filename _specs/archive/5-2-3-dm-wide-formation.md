## Specs for 5-2-3 DM Wide Formation

branch: claude/feature/5-2-3-dm-wide-formation
created: 2026-04-11

## Summary
Add a new formation "5-2-3 DM Wide" to the formations catalog. The formation uses two wing-backs flanking three centre-backs, two defensive midfielders, and a front three consisting of two wide attackers and a striker.

## Open Questions
> These questions must be answered before implementation can begin.

_(none — all positions specified by the user)_

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.

- The formation uses the key `'5-2-3 DM Wide'` in `FORMATIONS_CATALOG`. Confirm whether any display logic depends on the key format (e.g. if only the numeric part before the space is shown in UI).

## Functional Requirements
- Add `'5-2-3 DM Wide'` as a new key in `FORMATIONS_CATALOG` in `fm-stats-angular/src/app/models/formations-catalog.ts`.
- The formation must have exactly 11 slots: GK + the 10 specified outfield positions.
- Slot order and rows:
  - row 0: GK
  - row 1: DC, DC, DC
  - row 2: WBL, DM, DM, WBR
  - row 3: AML, ST, AMR
- Append the new entry at the end of `FORMATIONS_CATALOG` so `FORMATION_SLUGS` includes it.
- The formation must appear in the formation picker UI automatically (no other changes needed if the picker iterates `FORMATION_SLUGS`).

## Visual Design Notes
- No new UI components needed.
- The formation picker should list the new formation alongside existing ones.
- Visual layout follows the existing row-based rendering: row 1 spans 3 DC slots, row 2 spans 4 slots (WBL, DM, DM, WBR), row 3 has 3 attacking slots (AML, ST, AMR).

## Possible Edge Cases
- Formation key contains a space (`'5-2-3 DM Wide'`); ensure any logic that uses the key as a URL segment, CSS class, or filename handles this correctly.
- The existing `formations-catalog.spec.ts` hardcodes the formation count as 9; this must be updated to 10.

## Acceptance Criteria
- `FORMATIONS_CATALOG` contains a `'5-2-3 DM Wide'` entry with exactly 11 slots.
- Slot positions match: GK, DC, DC, DC, WBL, DM, DM, WBR, AML, ST, AMR (in that order).
- Row assignments are: GK=0, DC/DC/DC=1, WBL/DM/DM/WBR=2, AML/ST/AMR=3.
- `FORMATION_SLUGS` includes `'5-2-3 DM Wide'`.
- The formation appears in the formation picker dropdown/list.
- All existing tests pass.
- The hardcoded count in `formations-catalog.spec.ts` is updated from 9 to 10.

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in `fm-stats-angular/src/app/models/` or adjacent spec files for:
- Formation count is now 10 (update existing `'has exactly 9 formations'` test to expect 10).
- `'5-2-3 DM Wide'` key is present in `FORMATIONS_CATALOG`.
- Slot count for `'5-2-3 DM Wide'` is exactly 11.
- Slot positions match the specified order: GK, DC, DC, DC, WBL, DM, DM, WBR, AML, ST, AMR.
- Row values are correct for each slot in the new formation.
