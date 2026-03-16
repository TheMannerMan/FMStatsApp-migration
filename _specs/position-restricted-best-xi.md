## Specs for position-restricted-best-xi

branch: claude/feature/position-restricted-best-xi
created: 2026-03-16

## Summary
Add a toggle on the Best XI page that, when enabled, restricts player-to-slot assignment so that only players who can actually play a given position are considered for that slot. When disabled (default), the current behaviour is preserved — any player may be assigned to any slot regardless of their listed positions. This makes the Best XI calculation more realistic by respecting FM position eligibility.

## Open Questions
> These questions must be answered before implementation can begin.
- How is the `position` field formatted in the parsed player data? For example, is it `"DC/DL/DR"`, `"DC, DL, DR"`, `"GK"`, etc.? The parser needs to split this string correctly for matching against `FormationSlot.position`. Verify against `TestData/squad-export.html` and the existing `HtmlParser.cs` / Angular player service before implementing the matching logic. 
ANSWER: ** Answer: The position field is a plain string stored as-is from the HTML export (e.g. "AM (R), ST (C)"). The format is comma-separated tokens, each in the form BASE (SIDES) where SIDES is one or more letters (L, R, C). Multi-side tokens like AM (RL) represent two positions. Special cases: ST (C) maps to ST (no suffix), GK and DM appear without parentheses and map directly.

Parsing logic needed: split by ", ", then for each token extract the base and each side letter and concatenate — e.g. AM + R → AMR, AM (RL) → [AML, AMR]. Implement as ParsePositions(string): IEnumerable<Position> and cover all cases in the unit test.**

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.
- Should locked players bypass the position-restriction check (i.e., a locked player in slot X is always kept even if they can't play X)? Suggestion: yes — locking a player is an explicit user override.
- Should the toggle state persist across sessions (localStorage)? Suggestion: no, default OFF on every load to keep it simple.
- If the toggle is ON and a user has a player locked into a slot they cannot play, should a warning be shown? Suggestion: show the same "not possible" error and ask the user to turn the restriction off or change the lock.

## Functional Requirements
- A toggle control is displayed on the Best XI page, clearly labelled (e.g. "Position Restriction"). Default state is OFF.
- When the toggle is OFF the behaviour is identical to the current implementation — no changes to scoring or assignment logic.
- When the toggle is ON:
  - Each formation slot may only be filled by a player whose `position` field contains the slot's position code (e.g. a slot with `position: 'GK'` may only be filled by a player whose position string includes `GK`).
  - The score matrix passed to the Hungarian algorithm must exclude player/slot combinations that violate the position restriction (set those scores to 0 or remove entirely so the optimizer cannot pick them).
  - If, after applying the restriction, any free slot has zero eligible players, the `calculate()` function must not proceed. Instead, an informative error message is displayed telling the user which position(s) have no eligible players, and asking them to turn the restriction off.
- Changing the toggle clears any existing result (same as other controls that invalidate results).
- The `canCalculate` logic must account for the restriction: when ON, a slot for which no eligible players exist should prevent calculation.
- No changes to the HTML parsing layer are required — `Player.position` is already populated by the parser. Verify this assumption before implementing (see Open Questions).

## Visual Design Notes
- Style: Use a PrimeNG `p-toggleswitch` (or similar compact toggle) consistent with other controls on the page. Place it in the actions area near the "Calculate Best XI" button, or in a settings row above the formation grid — whichever feels least cluttered.
- Label: "Position Restriction" with sub-labels "OFF / ON" or a simple inline label. Should be visible and accessible.
- Error state: Display a concise inline message (not a modal) listing the positions that have no eligible players. Use existing warning styling (cf. the "At least 11 players must be uploaded" message) for consistency.
- Existing components to reuse: `pButton`, existing `.warning-message` CSS class, PrimeNG toggle components already in the project.
- Responsive behavior: The toggle should not break the existing two-column layout (formation + roster panel).

## Possible Edge Cases
- Player position string format is ambiguous — e.g. `"DC/DL/DR"` vs `"DC, DL"` vs `"GK (D)"`. The string-split/matching logic must handle all formats present in real FM exports.
- A player is locked into a slot they cannot play when restriction is ON — needs clear error messaging.
- All 11 players in the marked squad play the same position (e.g. all GKs) and restriction is ON — multiple slots will have zero eligible players; error must list all blocked positions.
- The player list contains fewer than 11 eligible players for a position-filtered slot even though the overall squad has 11+ players — blocked calculation rather than silent wrong result.
- Toggling restriction ON after a result is already displayed should clear the result (same behaviour as changing a role or lock).
- Formation has two DC slots and only one player eligible for DC — the optimizer would try to assign the same player twice; the position-restriction logic must still respect the one-player-one-slot constraint (already handled by the Hungarian algorithm, but verify).

## Acceptance Criteria
- Toggle is visible on the Best XI page and defaults to OFF on page load.
- With toggle OFF, existing behaviour is unchanged — any player can be assigned to any slot.
- With toggle ON, clicking "Calculate Best XI" produces a result where every assigned player's position string contains their assigned slot's position.
- With toggle ON, if any free slot has no eligible players, the calculate button does not trigger a calculation and an error message names the blocked position(s).
- Changing the toggle while a result is displayed clears the result.
- All existing Best XI tests continue to pass.

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in ./tests for:
- Unit test for the position-eligibility helper: given a player position string and a slot position code, returns true/false correctly for various formats (`"GK"`, `"DC/DL/DR"`, `"ST, AM"`).
- Unit test for the position-restricted score matrix builder: given a player list, slot roles, and restriction=ON, scores for ineligible player/slot pairs are zeroed (or filtered).
- Component test: with restriction OFF and restriction ON (all slots satisfied), `canCalculate()` behaves correctly.
- Component test: with restriction ON and at least one slot with no eligible players, `canCalculate()` returns false and the error message is rendered.
- Component test: toggling the restriction while a result exists clears the result signal.
