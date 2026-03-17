## Specs for role-filter-alphabetical-search

branch: claude/feature/role-filter-alphabetical-search

## Summary
Roles within each position accordion in the role filter sidebar are currently displayed in an unordered (API-returned) sequence. This spec covers two improvements: sorting roles alphabetically within each position group, and adding a persistent search input at the top of the filter sidebar so users can quickly find roles by name.

## Open Questions
> These questions must be answered before implementation can begin.
- Should the search match only role names, or also position group names (e.g., typing "Mid" surfaces the entire Midfielder accordion)?
- Should the search be case-insensitive (almost certainly yes, but confirm)?
- When a search term is active and a match exists inside a collapsed accordion, should that accordion automatically expand to show the match?

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.
- Should the search field be sticky/fixed within the drawer, or is it sufficient for it to simply be rendered first so it is visible before scrolling is needed?
- Should the "Select All / Clear All" group-level checkboxes still operate on the full group, or only on the currently visible (filtered) roles when a search term is active?
- Should a zero-results search state show an empty state message (e.g., "No roles match your search")?

## Functional Requirements
- Roles within each position accordion panel (Goalkeeper, Defender, Midfielder, Forward) are sorted alphabetically by `roleName` (full name).
- A text search input is rendered at the top of `RoleFilterComponent`, above the accordion panels.
- The search input is always visible when the filter drawer is open — it must not scroll out of view.
- Typing in the search input filters the displayed role checkboxes to those whose `roleName` contains the search string (case-insensitive).
- Position accordion panels that contain no matching roles are hidden or visually empty while a search is active.
- Clearing the search input restores the full alphabetically sorted list.
- The search state is local/transient — it is not persisted to localStorage and resets when the drawer is closed or the page is reloaded.
- The group-level (position) checkbox behaviour remains unchanged for visible roles.

## Visual Design Notes (only if this spec affects the UI)
- Style: The search input should follow the existing dark theme using `--color-bg-card`, `--color-text-primary`, and `--color-border` CSS variables. Match the corner radius and spacing conventions already used in the filter panel.
- Existing components to reuse: Plain `<input>` with a search icon, consistent with the project's minimal component style (no PrimeNG `InputText` required unless already used elsewhere in the filter).
- Responsive behavior: The search field should fill the full width of the drawer content area.

## Possible Edge Cases
- A role whose `roleName` is undefined or empty — guard against this in the sort and filter logic.
- All roles in every group are filtered out by the search term — show an empty state rather than an empty accordion with no panels.
- Very long role names that could overflow the search input or label area.
- Roles that share a prefix (e.g., "Central Defender" and "Central Midfielder") both appearing in search results from different position groups.
- The search field receiving focus triggers accordion toggle (event propagation issue similar to the existing checkbox `stopPropagation` pattern).

## Acceptance Criteria
- Roles within each accordion panel are rendered in ascending alphabetical order by full role name.
- A search input is visible at the top of the role filter panel without scrolling, regardless of how many accordion panels are open.
- Typing a partial role name (e.g., "wing") shows only roles whose `roleName` contains that string (case-insensitive) across all position groups.
- Clearing the input (empty string) restores all roles in alphabetical order.
- Position groups with no matching roles are not rendered while a search term is active.
- The active role selection (`activeRoles` set) is not affected by the search term — previously selected roles remain selected even if they are filtered out of view.
- All existing role filter tests continue to pass.

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in ./tests for:
- Verify roles within each position group are rendered in alphabetical order by `roleName`.
- Verify the search input is present in the DOM when the component renders.
- Verify that entering a search term reduces the displayed roles to only those whose `roleName` matches (case-insensitive).
- Verify that position accordion panels with zero matching roles are not rendered when a search is active.
- Verify that clearing the search term restores all roles in all groups.
- Verify that a role that was selected before a search remains selected (checkbox checked) even if the search hides it from view, and is still selected after the search is cleared.
- Verify empty-state handling when no roles match the search term.
