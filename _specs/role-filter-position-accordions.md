## Specs for role-filter-position-accordions

branch: claude/feature/role-filter-position-accordions

## Summary

Replace the current flat role-filter UI with an accordion-based layout organized by the four general positions (Goalkeeper, Defender, Midfielder, Forward). Each accordion panel lists the roles belonging to that position as checkboxes. Each role belongs to exactly one general position, so there is no cross-accordion synchronization needed.

## Open Questions
> These questions must be answered before implementation can begin.
- Should the accordions be open by default, or collapsed by default? (e.g. all collapsed, all open, or only the first open) Answer: collapsed
- Should the four general positions always appear even if no roles belong to them in the current data set? Yes
- Is the preferred accordion component PrimeNG's `p-accordion`, or should a custom CSS-only accordion be used to keep the bundle lean? Make it modern 

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.
- The API already groups roles by `GeneralPosition` key (Goalkeeper/Defender/Midfielder/Forward) — the frontend `RoleGroup` shape maps directly to accordion sections; no extra mapping needed.
- The group-level "select all" checkbox is preserved inside each accordion panel (confirmed).
- All roles always come with a general position, so no fallback "Other" group is needed.

## Functional Requirements
- The role-filter panel displays exactly four accordion sections: Goalkeeper, Defender, Midfielder, Forward — in that order.
- Each accordion section can be expanded or collapsed independently by clicking its header.
- When an accordion section is expanded, it shows the individual role checkboxes that belong to that general position.
- Each accordion header includes a group checkbox (checked/indeterminate/unchecked) that selects or deselects all roles in that position at once.
- Each role appears in exactly one accordion section matching its general position.
- The existing `PlayerService.setActiveRoles()` mechanism remains the sole way to mutate the active roles state — no local component state for checked/unchecked.
- The filter behaviour for the player table must be unaffected: the table still filters by `activeRoles`.

## Visual Design Notes (only if this spec affects the UI)
- Style: Follow the existing dark-sports-dashboard visual language (dark backgrounds, accent colors from current SCSS variables).
- Existing components to reuse: `RoleFilterComponent` — this is the component to refactor, not replace. PrimeNG `p-accordion` / `p-accordion-panel` (PrimeNG 21 is already a project dependency).
- Responsive behavior: The accordion should stack vertically and remain usable at narrow widths without horizontal overflow.

## Possible Edge Cases
- All roles for a position are already active — accordion header checkbox should show fully checked state.
- Some but not all roles for a position are active — accordion header checkbox should show indeterminate state.
- `PlayerService.roles` signal is empty on first render (API not yet resolved) — accordion must render without errors and update reactively once roles arrive.
- User opens accordion, selects a role, then a new file is uploaded which resets `activeRoles` — all checkboxes must reflect the new state automatically.

## Acceptance Criteria
- Four accordion panels are rendered for Goalkeeper, Defender, Midfielder, and Forward in that order.
- Each panel can be individually expanded and collapsed.
- Each role appears in exactly one panel matching its general position.
- The group checkbox in each panel header correctly shows checked, indeterminate, or unchecked based on the active state of its roles.
- Checking the group checkbox in a panel header activates all roles in that position; unchecking deactivates them all.
- The player table continues to filter correctly after any role checkbox interaction via the accordion.
- The component renders without errors when `PlayerService.roles` is an empty object.

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in ./tests for:
- `RoleFilterComponent` unit tests: verify that `roleGroups` computed signal groups roles under the correct general positions when roles have single and multiple positions.
- `RoleFilterComponent` unit tests: group checkbox state (allChecked / indeterminate / none) is computed correctly for each accordion panel.
- `RoleFilterComponent` unit tests: component renders without errors when `roles` signal returns an empty object.
- E2E / integration test: expand a position accordion, toggle a role, verify the player table filters correctly.
