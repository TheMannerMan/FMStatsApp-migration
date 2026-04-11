## Specs for player-table-role-sort-and-state

branch: claude/feature/player-table-role-sort-and-state
created: 2026-04-11

## Summary
Two related improvements to the `/players` page:
1. Role selection should default to empty after a new upload, and persist the user's selection until a new upload replaces it.
2. Each role column in the player table should be sortable (ascending/descending) by clicking its header.

## Open Questions
> These questions must be answered before implementation can begin.
- None. The feature is described with sufficient clarity.

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.
- Should sorting a role column reset any currently active sort on another column, or should multi-column sort be supported? (Assume single-column sort for now, consistent with existing `sortMode="single"` on the table.)
- When no roles are selected after upload, should the table body show a hint prompting the user to pick roles, or just render with no role columns?

## Functional Requirements

### Role Selection State
- When `setPlayers()` is called (i.e. after a successful upload), the active roles set must be initialised to an **empty set**, not all roles.
- The user's role selections are persisted in `localStorage` (already done) and must survive page navigation and browser refresh.
- When a new upload is performed, the previously persisted role selection is discarded and replaced with the empty set.
- The role-filter drawer/panel must correctly reflect the empty-selection state on first arrival to `/players` after upload.

### Sortable Role Columns
- Each role column header in the player table must support ascending and descending sort by clicking.
- A second click on the same column header reverses the sort direction.
- Clicking a different column header resets the sort to that column (single-column sort).
- Sort must operate on the numeric role score value for each player. Players without a score for the selected role (null/missing) should sort to the bottom regardless of sort direction.
- The sort icon (▲/▼) must be visible in the role column header to indicate the active sort and direction, consistent with existing basic columns.

## Visual Design Notes
- Style: role column headers must display a sort icon in the same style as the existing basic columns (already use `p-sortIcon` from PrimeNG).
- Existing components to reuse: `p-sortIcon` and `pSortableColumn` directive from PrimeNG `TableModule`, already in use on basic columns.
- Responsive behavior: no change to existing responsive/scroll behaviour.

## Possible Edge Cases
- User arrives at `/players` with a previously persisted non-empty role selection (from a prior session before this feature). After this change, only fresh uploads clear the selection — existing persisted selections must still be respected.
- All role scores for a column are null (role not applicable to any player in the list) — sort should be a no-op or stable.
- User uploads a new file while on `/players` page (via nav to `/upload` then back) — role selection must be empty on return.

## Acceptance Criteria
- [ ] After a successful upload, navigating to `/players` shows **no** role columns and the role-filter checkboxes are all unchecked.
- [ ] Selecting one or more roles in the filter drawer shows the corresponding columns in the table.
- [ ] Refreshing the `/players` page retains the user's current role selection.
- [ ] Uploading a new player file resets the role selection to empty; navigating to `/players` shows no role columns.
- [ ] Clicking a role column header sorts the table by that role's score, ascending.
- [ ] Clicking the same role column header again sorts descending.
- [ ] Clicking a different role column header resets sort to that column.
- [ ] Players with null role scores appear at the bottom in both sort directions.
- [ ] Sort icon is visible in role column headers, matching the style of basic sortable columns.

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in ./tests for:
- `PlayerService.setPlayers()` sets active roles to an empty set (not all roles).
- Active roles persist across rehydration from `localStorage` when set by the user.
- Active roles are reset to empty when `setPlayers()` is called a second time.
- Role column sort: players with higher scores rank first on ascending sort, last on descending sort.
- Players with null scores sort to the bottom in both directions.
