## Specs for role-filter-full-role-names

branch: claude/feature/role-filter-full-role-names

## Summary
The role filter accordion currently displays role abbreviations (e.g. "CDD", "GK", "DLP") as checkbox labels. This change replaces those abbreviations with the full role name (e.g. "Central Defender Defense", "Goalkeeper", "Deep Lying Playmaker"). The `RoleInfo` model already exposes a `roleName` field alongside `shortRoleName`, so this is a display-only change in the template.

## Open Questions
> These questions must be answered before implementation can begin.
- Should the player-table column headers (which also use `shortRoleName` as display text) be updated to full names at the same time, or only the role filter list? not right now

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.
- The `activeRoles` set is keyed by `shortRoleName` throughout the app (filter state, player scoring, column rendering). The key must remain `shortRoleName` — only the visible label changes. Confirm this is the intended scope.

## Functional Requirements
- Each role checkbox in the accordion displays the full role name (`roleName`) instead of the abbreviation (`shortRoleName`).
- The underlying filter state (the `activeRoles` set) continues to use `shortRoleName` as the identifier — no change to filter logic or data flow.
- All existing role filter behaviours (toggle individual role, toggle group, indeterminate state) continue to work correctly after the change.
- The full role name is rendered consistently across all position groups (Goalkeeper, Defender, Midfielder, Forward).

## Visual Design Notes
- Style: No style changes required. Only the text content of the label changes.
- Existing components to reuse: `RoleFilterComponent` accordion, existing `role-label` CSS class.
- Responsive behavior: No change — text wrapping behaviour may change slightly for longer names; verify labels remain readable at narrow widths.

## Possible Edge Cases
- A role whose `roleName` is empty or undefined — the label would appear blank. The data source should always populate `roleName`, but the template should degrade gracefully.
- Very long full role names may overflow the accordion label area on small screens.
- Roles shared across multiple position groups (e.g. a role appearing under both Midfielder and Defender) must display the full name correctly in both groups.

## Acceptance Criteria
- Opening the role filter accordion shows full role names as checkbox labels (not abbreviations).
- Checking or unchecking a role by its full name correctly adds or removes the corresponding `shortRoleName` from the active filter set.
- The group-level "select all" checkbox for each position group still toggles all roles in that group.
- The indeterminate state on a group header still appears when only some roles in the group are selected.
- All existing unit tests for `RoleFilterComponent` pass without modification to test logic (only template binding changes).

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in ./tests for:
- Verify that the role label rendered in the DOM matches `role.roleName` (full name), not `role.shortRoleName`.
- Verify that toggling a checkbox by full-name label still emits the correct `shortRoleName` to the filter state.
- Verify that a role with a missing or empty `roleName` does not cause a rendering error (fallback or empty string).
