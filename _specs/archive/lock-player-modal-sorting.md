## Specs for lock-player-modal-sorting

branch: claude/feature/lock-player-modal-sorting

## Summary
Add sortable column headers to the "Lock Player" modal (`PlayerPickerModalComponent`) in the Best XI view. Currently the player list has no sort order — users must visually scan an unsorted list. This feature lets users click column headers for Name, Position, and Rating to toggle ascending/descending sort, making it easier to find specific players.

## Open Questions
> These questions must be answered before implementation can begin.
- Should the default sort order be Name ascending, or should the list remain in the original (unsorted) order when the modal first opens? Name ascending.
- Should sorting state reset when the modal is closed and reopened, or should the last-used sort persist? Yes

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.
- "Rating" refers to the role score computed via `getScore(player)` — confirm this is the correct value (not `averageRating` from the Player model).
- The Rating column is only shown when a role is selected (`selectedRole` is non-null). Clarify whether the Rating sort option should be disabled/hidden when no role is selected.

## Functional Requirements
- The modal player list displays clickable sort headers for three columns: **Name**, **Position**, and **Rating**.
- Clicking a header that is not currently active sets it as the active sort column in ascending order.
- Clicking the currently active sort header toggles between ascending and descending order.
- **Name** sorts alphabetically (case-insensitive, diacritic-normalised, consistent with existing `normalizeForSearch` logic).
- **Position** sorts alphabetically (case-insensitive).
- **Rating** sorts numerically by the role score returned by `getScore(player)`.
- Sorting applies on top of the existing search filter — filtered results are sorted before display.
- Sort state is internal to the modal component and does not affect anything outside it.

## Visual Design Notes (only if this spec affects the UI)
- Style: follows the existing modal/list aesthetic in `player-picker-modal.component.scss` — compact, dark-themed.
- Existing components to reuse: the player list rows and meta layout (`.player-item`, `.player-item-name`, `.player-item-position`, `.player-item-score`) must remain unchanged.
- Sort headers sit above the player list, visually distinct from list rows. Active column and sort direction indicated by a small arrow icon (▲/▼) or equivalent.
- The Rating header should be visually disabled (greyed out, non-interactive) when `selectedRole` is null.
- Responsive behavior: modal is fixed-width (460px); header row should not overflow — short labels only.

## Possible Edge Cases
- **No role selected:** Rating header must not allow sorting; clicking it should be a no-op.
- **Single player in list:** Sorting should still function without errors.
- **Equal values:** Players with the same position or equal scores should have a stable secondary sort (e.g., fallback to Name ascending) to avoid jitter on re-renders.
- **Reactive update:** If the eligible player list changes while the modal is open (unlikely but possible), the sort should re-apply automatically because sort is a computed value.
- **Search + sort interaction:** After typing in the search box, the sorted order must still be applied to the newly filtered set — order of operations matters in the `filteredPlayers` computed chain.

## Acceptance Criteria
- Clicking the **Name** header once sorts the list A→Z; clicking again sorts Z→A.
- Clicking the **Position** header once sorts A→Z; clicking again sorts Z→A.
- Clicking the **Rating** header once sorts highest→lowest; clicking again sorts lowest→highest (or vice versa — consistent with the chosen default direction).
- Switching from one sort column to another resets direction to the default (ascending for Name/Position, descending for Rating).
- The active sort column and direction are visually indicated in the header row.
- When `selectedRole` is null, the Rating header is visually disabled and clicking it has no effect.
- Search filtering still works correctly when a sort is active.
- All existing unit tests for `PlayerPickerModalComponent` continue to pass.

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in ./tests for:
- Sorting by Name ascending returns players in A→Z order by normalised name.
- Sorting by Name descending returns players in Z→A order.
- Sorting by Position ascending returns players ordered alphabetically by position string.
- Sorting by Position descending returns the reverse.
- Sorting by Rating descending returns the player with the highest role score first.
- Sorting by Rating ascending returns the player with the lowest role score first.
- Clicking the Rating header when `selectedRole` is null does not change the sort state.
- Search filter combined with active sort: only matching players are returned, in sorted order.
- Toggling sort direction on the active column cycles correctly (asc → desc → asc).
- Switching to a new sort column resets direction to default.
