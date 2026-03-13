## Specs for modern-ui-redesign

branch: claude/feature/modern-ui-redesign
created: 2026-03-13

## Summary
The Angular application currently has a minimal, unstyled appearance — plain HTML inputs, flat buttons, and no visual hierarchy. This spec covers a modern UI redesign of all three components (upload, player-table, role-filter) using the already-installed PrimeNG 21 component library combined with a coherent design token system (color palette, typography, spacing). The goal is a polished, football-analytics-appropriate look that is fast to use and readable on large datasets.

## Open Questions
> These questions must be answered before implementation can begin.
- Should the app have a persistent app-shell (topbar/sidebar layout), or remain route-based with no shared chrome?
- Dark mode: required, optional, or out of scope?
- Should player score color bands (high/medium/low) keep the current green/yellow/red palette, or switch to something else (e.g. blue scale)?
- Is there a preferred PrimeNG theme (e.g. Aura, Lara, Material, Nora)?

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.
- The upload page navigates away after a successful upload — should a success toast/banner be shown before navigation?
- The role-filter sidebar has no collapse/expand toggle — should one be added as part of this redesign?
- Should the player table header be sticky when scrolling horizontally, or only vertically?

## Functional Requirements
- Apply a PrimeNG theme globally via `styles.scss` (replacing the empty global stylesheet).
- The upload page must present a prominent drag-and-drop zone in addition to the existing file-input button.
- The upload button must use a PrimeNG `p-button` with an icon and a loading spinner while `isLoading` is true.
- Error messages on the upload page must use a PrimeNG `p-message` or `p-inlinemessage` component.
- The player table must apply a named PrimeNG table theme class (e.g. `p-datatable-striped`, `p-datatable-gridlines`) for visual separation of rows and columns.
- Score cells (high/medium/low) must use clearly distinguishable background colours with accessible contrast ratios (WCAG AA).
- The role-filter sidebar must display group headers as styled `p-fieldset` or `p-panel` components, not plain `<strong>` text.
- Role checkboxes must use `p-checkbox` from PrimeNG for visual consistency.
- The layout must be responsive: on viewports narrower than 768 px the role-filter sidebar must collapse to a toggle-able overlay or drawer.
- All interactive elements must have visible focus indicators.

## Visual Design Notes (only if this spec affects the UI)
- Style: Clean, data-dense sports-analytics aesthetic. Dark header/topbar optional. Neutral background (off-white or very light grey). Accent colour from current `#0066cc` blue or a PrimeNG preset.
- Existing components to reuse: `p-table` (already used in player-table), PrimeNG checkbox, button, message — all available in PrimeNG 21.
- Responsive behavior: Sidebar collapses on mobile; table uses horizontal scroll on small screens (already has `overflow-x: auto`).

## Possible Edge Cases
- PrimeNG theme CSS may conflict with existing component-level SCSS — existing `.score-high`, `.score-medium`, `.score-low` class names may need to be preserved or remapped.
- The `p-table` `virtualScroll` + `scrollHeight` setup may clip or mis-render with certain PrimeNG theme overrides that change row heights.
- Drag-and-drop file zone must handle the case where the user drops a non-HTML file — show validation error rather than silently ignoring.
- The role-filter contains many checkboxes (85 roles across multiple groups) — the mobile drawer/overlay must scroll internally without breaking the page scroll.
- If PrimeNG `p-checkbox` is used, the existing `(change)` event binding must be updated to use PrimeNG's `(onChange)` output.

## Acceptance Criteria
- Opening the app in a browser shows a visually styled page — no raw browser-default form controls visible.
- The upload page has a drag-and-drop area that accepts `.html` files and populates the file-input selection.
- Uploading a valid FM export navigates to the player table without visual regressions.
- The player table renders with alternating row styles or gridlines and colour-coded score cells.
- The role-filter sidebar renders with PrimeNG-styled checkboxes and group headers; toggling a group checkbox still shows/hides the correct role columns.
- On a viewport of 375 px wide the role-filter does not render inline — a toggle button reveals it as an overlay.
- All WCAG AA contrast requirements are met for score cell colour combinations (verified with a browser tool or axe).
- No TypeScript or Angular build errors (`ng build` exits 0).

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in ./tests for:
- Upload component: test that dropping a file onto the drag-and-drop zone sets `selectedFile` (unit test with `TestBed`, simulating a `drop` event with a mock `DataTransfer`).
- Upload component: test that dropping a non-HTML file sets `errorMessage` and does not set `selectedFile`.
- Upload component: test that the upload button is disabled when `selectedFile` is null and enabled when a file is selected.
- Role-filter component: test that clicking a PrimeNG `p-checkbox` for a role emits the correct `onRoleChange` call (update binding if changed to `(onChange)`).
- Player-table component: test that a score ≥ 8.0 receives the `score-high` CSS class, 6.0–7.9 receives `score-medium`, and < 6.0 receives `score-low`.
- Visual regression (optional, stretch goal): snapshot tests for the upload and player-table components using Angular's `ComponentFixture` to assert key CSS class presence.
