## Specs for modern-dark-sports-dashboard

branch: claude/feature/modern-dark-sports-dashboard
created: 2026-03-14

## Summary

Redesign the FM Stats Angular application to look and feel like a modern sports analytics dashboard. The current UI is bare-bones HTML with no visual identity. The goal is to apply the PrimeNG Aura dark theme globally, introduce a consistent CSS custom property color system, replace the upload page with a drag-and-drop experience, add a sticky application header with branding, and significantly improve the players table with a frozen Name column, better typography, and a slide-out filter panel. No new data features are added — this is purely a design and UX overhaul.

## Open Questions
> These questions must be answered before implementation can begin.

- Should the app support a light/dark theme toggle, or is dark-only acceptable for this release?
- Is there a preferred accent color or brand color (e.g. green for football, a specific hex)?
- Should the sticky header include navigation links (e.g. Upload / Players), or just branding?

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.

- The PrimeNG Aura dark preset needs to be configured in `app.config.ts` via `providePrimeNG` — confirm whether the existing PrimeNG setup (v21.1.3 + `@primeuix/themes` v2.0.3) already supports this or requires a version bump.
- Decide whether the slide-out filter panel replaces the existing sidebar or overlays it (drawer vs. permanent sidebar).
- Confirm the frozen Name column behavior on mobile/small screens — is horizontal scroll acceptable?

## Functional Requirements

- The PrimeNG Aura dark theme is applied globally via `providePrimeNG` in `app.config.ts`, replacing any default/unstyled appearance.
- A set of CSS custom properties (design tokens) is defined in `styles.scss` covering: primary background, surface/card background, accent color, text primary, text secondary, border color, success/warning/danger score colors.
- All components consume these tokens instead of hardcoded color values.
- A sticky application header component is created and rendered on all pages. It displays the app name "FM Stats" and a football-related icon or logo.
- The header contains navigation that allows switching between the Upload and Players views.
- The upload page uses a styled drag-and-drop zone instead of a native file input. Users can drag an HTML file onto the zone or click to browse.
- The drag-and-drop zone provides visual feedback on dragover (border highlight, background change).
- The upload page shows a clear call-to-action, descriptive subtitle, and an icon representing file upload.
- The players table has the Name column frozen (sticky left) so it remains visible during horizontal scroll.
- Table column headers are compact but readable, with consistent padding and font size.
- Row height and cell padding are improved so the table doesn't feel cramped.
- The role filter is presented as a slide-out drawer/panel (e.g. using PrimeNG Drawer or a custom overlay) triggered by a button, rather than a permanently visible sidebar.
- The filter panel button is accessible from the players table view at all times.
- The existing color-coded score cells (green ≥ 8.0, yellow ≥ 6.0, red < 6.0) are preserved and use the new design token colors.
- The layout is responsive at common desktop widths (1280px+); tablet/mobile is a best-effort stretch goal.

## Visual Design Notes (only if this spec affects the UI)

- Style: Dark theme sports analytics — think dark backgrounds (#0f1117 range), bright accent (e.g. emerald green or electric blue), clean sans-serif typography.
- Existing components to reuse: `p-table` (PrimeNG Table), `p-drawer` or `p-sidebar` (PrimeNG) for the filter panel, PrimeNG Button for CTAs.
- Responsive behavior: Horizontal scroll is acceptable on the player table at smaller widths. The header collapses gracefully. The upload zone scales with the viewport.

## Possible Edge Cases

- If the user navigates directly to `/players` with no data loaded, the empty-state message must still be styled and include a link back to the upload page.
- Drag-and-drop may not be supported in all browsers; fall back gracefully to click-to-browse.
- Very long player names or club names could break the frozen Name column layout — test with 30+ character strings.
- The PrimeNG Aura dark theme may conflict with existing component-level SCSS overrides — audit each component's `.scss` file during implementation.
- localStorage rehydration on startup should not cause a flash of unstyled content (FOUC) before the theme is applied.
- The slide-out filter panel must not lose checkbox state when closed and reopened.

## Acceptance Criteria

- Opening the app shows a dark-themed UI across all pages with no white/default PrimeNG styling visible.
- The upload page renders a drag-and-drop zone; dragging a file over it highlights the border and changes the background color.
- A sticky header with "FM Stats" branding is visible at the top of every page and does not scroll away.
- On the players table, scrolling horizontally keeps the Name column fixed on the left.
- Clicking the filter button opens a slide-out panel containing the role checkboxes; closing it preserves selections.
- Score cells in the table are colored using the CSS custom property tokens (green/yellow/red scheme intact).
- No hardcoded color hex values remain in component SCSS files; all colors reference CSS custom properties defined in `styles.scss`.
- The app builds without errors (`ng build`) after all changes.

## Testing Guidelines

Write tests before implementation (TDD). Create test file(s) in ./tests for:

- **UploadComponent**: test that dragover event sets the visual highlight state; test that dragleave removes it; test that drop with a valid `.html` file triggers the upload flow; test that drop with an invalid file type shows an error.
- **AppHeaderComponent** (new): test that the component renders the app title "FM Stats"; test that navigation links route to `/upload` and `/players`.
- **PlayerTableComponent**: test that the Name column has the `frozen` attribute applied; test that the filter panel toggle button exists and emits an open event.
- **RoleFilterComponent**: test that closing and reopening the panel does not reset checkbox selections.
- **CSS tokens**: smoke-test that `styles.scss` exports the expected custom property names (can be done with a simple grep/existence check in CI).
