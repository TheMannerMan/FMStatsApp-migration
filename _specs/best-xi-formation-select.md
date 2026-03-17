## Specs for best-xi-formation-select

branch: claude/feature/best-xi-formation-select
created: 2026-03-17

## Summary
Add a formation selection landing page at `/best-eleven` that lets the user pick from 9 predefined formations before entering the Best XI builder. After selecting a formation, the user navigates to `/best-eleven/:formation` (e.g. `/best-eleven/4-4-2`) where the existing role-picker, player locking, and calculation logic work as today — but driven by the chosen formation's positions instead of the hardcoded 4-4-2.

## Open Questions
> These questions must be answered before implementation can begin.
- **Formation selection is not persisted** — always re-selected on each visit. The chosen formation lives in the URL (`/best-eleven/:formation`), so the URL itself is the persisted state.
- **Back-navigation loses role/lock state** — navigating back to the picker resets all selections. No formation-switching while preserving state.

## Clarifications Needed
> Resolved.
- **Formation data location**: All 9 formation arrays go in a new `formations-catalog.ts`. `formation.model.ts` keeps only the `FormationSlot` interface.
- **Dynamic formation in `BestElevenComponent`**: Read the `:formation` route param via `ActivatedRoute` and look up the slug in the catalog. No resolver needed (data is static). If the slug is unknown, redirect to `/best-eleven`.
- **`STORAGE_KEY` unchanged**: Marked players are formation-agnostic (same squad regardless of formation). No formation-scoped key needed.

## Functional Requirements
- A new `/best-eleven` route renders a formation picker page (replacing or wrapping the current redirect).
- The formation picker displays all 9 formations as selectable options:
  - 4-4-2, 4-2-3-1, 5-3-2, 4-3-3, 3-5-2, 4-1-4-1, 4-3-1-2, 4-4-1-1, 3-4-3
- Each formation option shows the formation name (e.g. "4-4-2") and is clickable.
- Clicking a formation navigates to `/best-eleven/:formation` (e.g. `/best-eleven/4-4-2`).
- The `/best-eleven/:formation` route renders the existing Best XI builder with the selected formation's slots loaded.
- All existing Best XI functionality works for every formation: role selection per slot, player locking, position restriction toggle, player roster with mark/unmark, search/sort, and Hungarian-algorithm calculation.
- All 9 formation slot definitions (positions and rows) are defined as data in the Angular frontend and match the C# `Formation` list provided in the spec.
- Navigating to `/best-eleven/:formation` with an unknown formation slug shows an error state or redirects back to the formation picker.
- The app header navigation link for Best XI points to `/best-eleven` (the picker page).

## Visual Design Notes
- Style: match the existing PrimeNG-based UI — use the same card/button styling used elsewhere in the app.
- Existing components to reuse: `AppHeaderComponent`, PrimeNG `ButtonModule` or `CardModule` for formation cards.
- The formation picker should display formations in a grid or list layout — each card shows the formation name prominently.
- Responsive behavior: formation cards should reflow gracefully on smaller screens.

## Possible Edge Cases
- User navigates directly to `/best-eleven/3-5-2` without going through the picker — must load correctly.
- Formation slug in the URL uses a different casing or encoding (e.g. `4-4-2` vs `442`) — URL must be canonical and validated.
- Players loaded from a previous squad upload: marked-player state in localStorage references UIDs that may not exist if a new file is uploaded — existing behaviour already handles this via UID intersection, but must work per-formation.
- A formation has duplicate positions (e.g. two DC slots) — slot ordering and row assignment must be deterministic and stable.
- Result state from a previous calculation is stale when the formation changes — result must be cleared on formation change.

## Acceptance Criteria
- Visiting `/best-eleven` shows the formation picker with 9 named options.
- Clicking "4-3-3" navigates to `/best-eleven/4-3-3` and renders a pitch layout with the correct 11 slots (GK, DL, DC, DC, DR, MC, MC, MC, AML, AMR, ST).
- All 9 formations render the correct position slots as defined in the spec.
- Role picker, player picker, position restriction toggle, mark/unmark, search, sort, and calculate all work correctly for every formation.
- Visiting `/best-eleven/unknown-formation` does not crash — shows an error message or redirects to `/best-eleven`.
- The app header "Best XI" link navigates to `/best-eleven` (the picker).
- Switching formation (via back navigation and re-selection) resets role and lock selections.

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in ./tests for:
- Unit test: all 9 `FormationSlot[]` definitions have exactly 11 slots each.
- Unit test: each formation's slot set contains exactly one GK slot.
- Unit test: `BestElevenComponent` initialises `selectedRoles` and `lockedPlayers` arrays to the correct length when given a non-442 formation via route param.
- Component test: navigating to `/best-eleven/4-2-3-1` renders 11 slot buttons with the correct position labels.
- Component test: navigating to `/best-eleven/invalid` redirects to `/best-eleven` or shows an error element.
