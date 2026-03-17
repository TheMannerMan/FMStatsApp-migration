## Specs for best-xi-layout-redesign

branch: claude/feature/best-xi-layout-redesign

## Summary
Redesign the Best XI page layout so the formation/role-selection panel occupies the left side of the browser viewport and the squad roster panel occupies the right side, making better use of horizontal space. Additionally replace the verbose "Unmark" toggle button in the roster with a compact red X icon button, and widen the roster panel so player names no longer get truncated.


## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.
- What width should the roster panel be increased to? A specific pixel value is not given — any reasonable wider value (e.g. 420–480 px) that prevents name truncation should suffice.
- Should the X button show a tooltip (e.g. "Remove from squad") for accessibility? Not necessary.
- On mobile (≤900 px breakpoint), the layout already stacks vertically — should the stack order change (roster first vs. formation first)? Dont change the order.

## Functional Requirements
- The "Unmark" / "Mark" pButton in each player row is replaced with a small icon-only button that displays a red × (times / close icon) when the player is marked, and a neutral add/plus icon when unmarked — or alternatively always shows a red × to unmark and no button when already unmarked. The button must be visually small and unobtrusive compared to the current labeled button.
- The `.best-eleven-page` container no longer constrains width to a centered max-width; instead the layout spans to fill the available viewport width (with appropriate padding).
- The `.formation-column` is anchored to the left side and the `.roster-panel` is anchored to the right side using the existing flex row layout.
- The roster panel width is increased enough that full player names (including longer ones) are fully visible without `text-overflow: ellipsis` truncation under typical viewport widths.
- The formation slots / role-selection area continues to be centered within its own column.
- All existing functionality (mark/unmark, sort, search, calculate, reset, position restriction toggle) continues to work unchanged.
- The responsive breakpoint at ≤900 px stacks the panels vertically as before.

## Visual Design Notes (only if this spec affects the UI)
- Style: The X button should use a danger/destructive visual style — red colour, small size (`size="small"` PrimeNG, or a plain `<button>` styled with `color: red`). No label text, icon only.
- Existing components to reuse: PrimeNG `pButton` with `icon="pi pi-times"` and `severity="danger"` / `text="true"` for the unmark action; PrimeNG `pi pi-plus` or similar for the mark action.
- Responsive behavior: Below 900 px the panels stack vertically (formation on top, roster below), same as today. The roster width becomes 100% on mobile as before.

## Possible Edge Cases
- Very long player names that still overflow if the roster panel width is not increased enough — verify against the longest names in `TestData/squad-export.html`.
- The spacer element `.sort-header-spacer` in the column headers is sized to match the toggle button width; it must be updated to match the new X button width so columns remain aligned.
- The `mark-all-btn` ("Reset") full-width button at the top of the roster panel — its label is currently "Reset" but marks all players; no change requested, but the label discrepancy is worth noting.
- Icon-only buttons require an `aria-label` attribute for screen-reader accessibility.
- On very narrow viewports (≤600 px) the player row layout may break if the X button is wider than expected.

## Acceptance Criteria
- Opening the Best XI page on a desktop viewport (≥1200 px) shows the formation panel flush to the left and the squad panel flush to the right with no centred whitespace gap.
- Player names in the roster panel are not truncated for the players in the test squad export.
- Each marked player row shows a small red X button (icon only, no label text) instead of the "Unmark" text button.
- Each unmarked player row shows a small neutral icon button (or equivalent) instead of the "Mark" text button.
- Clicking the X/mark icon still toggles the player's marked state correctly.
- On a viewport ≤900 px wide, the layout stacks vertically (formation above roster) and the roster spans full width.
- No existing functionality (search, sort, calculate, lock player, position restriction) is broken.

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in ./tests for:
- Unit test in `best-eleven.component.spec.ts`: toggling a marked player calls `toggleMark` and the `markedPlayerUids` set updates correctly (behaviour is unchanged, but re-verify after button refactor).
- Visual / DOM test: after render, each player row contains a `button` with class or attribute matching the X icon, and no element with text content "Unmark".
- Snapshot or CSS check: `.best-eleven-page` does not apply a `max-width` constraint that would prevent full-width layout (or confirms the new wider max-width value).
- Responsive test (if using Angular CDK or manual breakpoint helpers): at 800 px viewport width, `.page-layout` flex-direction is `column`.
