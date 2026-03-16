## Specs for best-xi-lock-in-average-score

branch: claude/feature/best-xi-lock-in-average-score
created: 2026-03-16

## Summary

Extend the existing Best XI feature in `BestElevenComponent` with two enhancements:

1. **Player lock-in per slot** — for each formation slot the user can optionally pin a specific player from the uploaded squad. Locked players are pre-assigned before the Hungarian algorithm runs on the remaining free slots, so the optimisation still maximises the total score across all unlocked positions.
2. **Average XI score display** — once a result is calculated, show the arithmetic mean of all 11 role scores, formatted to one decimal place (e.g. `8.4`).
3. **Consistent score formatting** — all individual role scores (on player cards and in the average field) must be displayed with exactly one decimal place.

## Open Questions
> These questions must be answered before implementation can begin.
- Should locking a player to a slot also lock the role, or should the role remain selectable independently while only the player assignment is fixed? The role should not be locked after locking a player.
- If a player is locked into slot A, should they still appear as an option in the lock-in dropdowns for other slots, or be hidden to prevent double-assignment? Hidden.

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.
- Should the lock-in selections persist after clicking "Reset", or reset together with the result? Right now, reset everything
- Visual placement of the lock-in dropdown: below the role selector inside the same slot card, or a separate row? Below
- Should the average score be hidden until a result is computed, or show a placeholder (e.g. `—`) before calculation? Placeholder is fine

## Functional Requirements
- Each of the 11 formation slot cards shows an optional player lock-in dropdown populated with all uploaded players.
- The lock-in dropdown is independent of the role selector and visible both before and after calculation.
- When the user selects a player in a slot's lock-in dropdown, that player is guaranteed to appear in that slot in the result (regardless of what the Hungarian algorithm would otherwise choose).
- A player locked into one slot must not be assignable to another slot — either hide them in other dropdowns or prevent the lock from being applied.
- The `calculate()` function respects all locked slots: it pre-assigns locked players, removes them from the candidate pool, runs the Hungarian algorithm only on the remaining players and slots, then merges the results.
- After a result is computed, a clearly labelled "Average XI Score" field is shown, displaying the mean of all 11 `ResultEntry.score` values to one decimal place.
- All `ResultEntry.score` values rendered in slot cards use exactly one decimal place (e.g. `8.4`, `10.0`).
- Lock-in selections do not affect the `canCalculate` guard — it still requires every slot to have a role selected and at least 11 players uploaded.

## Visual Design Notes (only if this spec affects the UI)
- Style: follow the existing PrimeNG `p-select` style used for the role selector; use the same component for the lock-in dropdown with a "Lock player (optional)" placeholder.
- Existing components to reuse: `p-select` (PrimeNG SelectModule), `FormsModule` ngModel binding, existing `slot-card` CSS class.
- Responsive behavior: lock-in dropdown stacks below the role selector inside the slot card, inheriting `width: 100%`.

## Possible Edge Cases
- Fewer than 11 players uploaded — existing guard (`hasEnoughPlayers`) already blocks calculation; lock-in dropdowns can still be shown but calculate remains disabled.
- All 11 players locked in — the Hungarian algorithm runs on an empty set; the result is fully determined by the lock-in selections and their role scores.
- The same player locked into multiple slots — must be prevented; if enforcement is via hiding already-locked players, the UI must reactively update all dropdowns when a lock changes.
- A locked player has a score of 0 for the chosen role (e.g. wrong position type) — this is valid; the result should display the 0.0 score without special handling.
- Player list changes (re-upload) while locks are set — locks referencing players no longer in the list should be cleared automatically.
- Average score when all scores are 0 — displays `0.0`.

## Acceptance Criteria
- Selecting a player in a slot's lock-in dropdown and clicking "Calculate Best XI" always places that player in that slot in the result.
- A player locked to one slot does not appear as a selectable lock-in option in any other slot.
- The Average XI Score field appears below (or adjacent to) the formation grid after a result is computed, showing the correct mean to one decimal.
- All displayed role scores in result cards use exactly one decimal place.
- Removing all lock-in selections and recalculating produces the same result as the current (no-lock) algorithm.
- Clicking "Reset" clears the result; lock-in selections either persist or reset consistently as decided in Open Questions.
- All existing Best XI tests continue to pass after the changes.

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in ./tests for:
- Unit test for a new `buildConstrainedScoreMatrix` (or equivalent) utility: given a set of pre-locked `(slotIndex, playerIndex)` pairs, the function removes locked players from the candidate rows and locked slots from the candidate columns, returning a reduced matrix plus a mapping back to original indices.
- Unit test: when all 11 slots are locked, the function returns an empty matrix and the result is assembled entirely from the lock-in entries.
- Unit test: average score calculation — given an array of `ResultEntry` values, the computed average equals `sum(scores) / 11` rounded to one decimal.
- Component test for `BestElevenComponent`: locking player X into slot 2 and calling `calculate()` results in `result()[2].player === playerX`.
- Component test: a player locked in slot 0 does not appear in `availableLockedPlayersForSlot(1)` (or equivalent computed property).
- Existing `best-eleven.component.spec.ts` tests must remain green.
