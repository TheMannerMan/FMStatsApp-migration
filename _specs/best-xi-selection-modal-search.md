## Specs for best-xi-selection-modal-search

branch: claude/feature/best-xi-selection-modal-search

## Summary

Replace the compact `p-select` dropdowns currently used for role and player selection on the Best XI page with a modal-based picker UI. Each slot's role selector and player selector will open a dedicated modal (or drawer) that displays full role names, organizes roles by position group, and provides a live search input — mirroring the role-filter experience on the /players page. The same modal pattern applies to player selection, also with a search input to quickly find a player by name.

## Open Questions
> These questions must be answered before implementation can begin.
- Should the role picker and player picker be two separate modals per slot, or a single multi-step modal (pick role first, then player)? Answer:Separate
- For the role picker modal, should roles be grouped by position (Goalkeeper / Defender / Midfielder / Forward) with an accordion, or displayed as a flat searchable list? Answer:Same restriction as we already have. Only a roles available for that position should be available for selection. So there is no reason for those grouping. A Midfield Central, is already a Midfielder position and only roles available for that position should be shown (as implemented right now before this spec) 
- Should the player picker show any metadata alongside the player name (e.g. position, role score for the selected role)? Answer:Yes, position and role-score is suitable.

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.
- The players page role filter uses a `p-drawer` (right-side panel). For Best XI, a centered `p-dialog` may feel more natural since selection is an explicit action per slot — verify preferred pattern. Answer: Do what you finds best for this situation.
- Should search be case-insensitive and accent-insensitive (e.g. "Bjorn" matches "Björn")? Answer: Yes
- When no role is selected for a slot yet, should the player picker be disabled/hidden? Answer: Disabled. 
- Should the selected role's full name and the selected player's name be visible on the slot card after selection (replacing the current compact dropdown labels)? Answer:Yes

## Functional Requirements
- Each formation slot on the Best XI page has a "Select Role" trigger (button or current dropdown replacement) that opens a role picker modal.
- The role picker modal displays the **full role name** (not short name) for every role available for that slot's position.
- The role picker modal contains a search input that filters the displayed roles in real-time, matching against the full role name — identical in behavior to the search in the /players page role filter component (`RoleFilterComponent`).
- Roles in the role picker are organized by position group (matching the accordion groups in `RoleFilterComponent`: Goalkeeper, Defender, Midfielder, Forward), showing only groups relevant to the slot's position.
- Selecting a role closes the modal and updates the slot's selected role.
- Each formation slot has a "Select Player" trigger that opens a player picker modal.
- The player picker modal lists all eligible players for the slot (those marked in the roster panel, filtered by role restrictions).
- The player picker modal contains a search input that filters players by name in real-time.
- Selecting a player closes the modal and locks that player to the slot.
- Both modals include a "Clear" or "None" option to deselect the current value.
- Full role name is displayed on the slot card after a role is selected (not the short name abbreviation).

## Visual Design Notes (only if this spec affects the UI)
- Style: Consistent with existing component styling — use CSS custom properties (`var(--color-*)`, `var(--spacing-*)`) already established in the project.
- Existing components to reuse: `RoleFilterComponent` search input pattern; `p-dialog` or `p-drawer` from PrimeNG (already available); `p-button` for trigger elements.
- Responsive behavior: Modal should be scrollable on small screens; search input should always remain visible at the top of the modal without scrolling.

## Possible Edge Cases
- A slot's position (e.g. `DC`) has only one available role — the modal still opens but search is arguably redundant; should still function correctly.
- Searching returns zero results — display an empty state message ("No roles found").
- A player's name contains special characters or diacritics — search should handle gracefully.
- The roster panel has zero marked players — the player picker modal opens but shows an empty state ("No eligible players. Mark players in the roster panel.").
- A role is changed after a player was already locked — the locked player may no longer be eligible; current behavior (clearing the locked player) should be preserved.
- Very long role names or player names should not overflow or break the modal layout.

## Acceptance Criteria
- Clicking the role trigger for any slot opens a modal containing a search input and a list of roles showing **full role names** (e.g. "Defensive Midfielder" not "DM").
- Typing in the role search input immediately filters the visible roles to those whose full name contains the query string (case-insensitive).
- Clicking a role in the modal selects it, closes the modal, and displays the full role name on the slot card.
- Clicking the player trigger for any slot opens a modal containing a search input and a list of eligible players.
- Typing in the player search input immediately filters the visible players by name.
- Clicking a player in the modal locks them to the slot and closes the modal.
- Both modals have a way to clear the current selection.
- No `p-select` scrollable dropdown is used for role or player selection on the Best XI page.
- The rest of the Best XI page functionality (roster panel, lock/unlock, calculate) is unaffected.

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in ./tests for:
- Role picker modal: renders full role names (not short names) for the relevant position.
- Role picker modal: search input filters roles by full name, case-insensitively.
- Role picker modal: selecting a role emits the correct role and closes the modal.
- Role picker modal: clearing selection sets role to null.
- Player picker modal: lists only eligible (marked) players.
- Player picker modal: search input filters players by name.
- Player picker modal: selecting a player emits the correct player UID and closes the modal.
- Player picker modal: shows empty state when no eligible players exist.
- Slot card: displays full role name after selection.
