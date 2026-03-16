## Specs for best-xi-player-inclusion-toggle

branch: claude/feature/best-xi-player-inclusion-toggle

## Summary
Add a player roster panel to the Best XI page showing all uploaded players by name. Each player can be toggled between "marked" (included in Best XI calculation) and "unmarked" (excluded). Unmarked state is persisted to localStorage. On wide screens, the formation/calculation area sits on the left and the roster panel on the right; on narrow screens the roster stacks below. Locking an unmarked player in the dropdown overrides their exclusion and includes them in that calculation.

## Open Questions
> These questions must be answered before implementation can begin.
- None — requirements are clear.

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.
- Should the "Reset" button (mark all players) be separate from the existing formation reset button, or the same button with dual responsibility? The spec implies it is a separate button in the player list panel.
- Should sorting in the player list be fixed (e.g. alphabetical), or should it follow the upload order?

## Functional Requirements
- The Best XI page displays a roster panel listing all uploaded players by name.
- Each player row shows only the player's name and a toggle button (mark/unmark).
- All players are marked (included) by default when first visiting the page.
- A marked player is visually distinct from an unmarked player (e.g. muted/strikethrough styling on unmarked rows).
- Clicking the toggle button on a marked player unmarks them; clicking it on an unmarked player re-marks them.
- A "Mark All" (or "Reset") button in the roster panel marks all players at once.
- The marked/unmarked state is persisted to `localStorage` and survives page reloads.
- The Best XI calculation (`calculate()`) uses only marked players, unless a player is explicitly locked in a slot dropdown, in which case that player is included regardless of their marked status.
- Unmarked players remain visible in the lock-player dropdown for each slot.
- On screens wider than a defined breakpoint (e.g. ≥900 px), the formation/calculation area is on the left and the roster panel is on the right, side by side.
- On narrower screens, the roster panel stacks below the formation area.

## Visual Design Notes (only if this spec affects the UI)
- Style: Follow existing card/border conventions from `best-eleven.component.scss` — use `var(--color-bg-card)`, `var(--color-border)`, `var(--color-text-secondary)`.
- Existing components to reuse: `pButton` from PrimeNG for the toggle and reset buttons (matching existing severity conventions).
- Unmarked players: visually muted — reduced opacity and/or strikethrough on the name, plus a different button label/icon ("Mark" instead of "Unmark").
- Responsive behavior: `display: flex; flex-wrap: wrap` or CSS Grid on the page wrapper; formation column grows, roster column has a fixed or min-width; on small screens each column takes full width.

## Possible Edge Cases
- Player is locked in a slot and then unmarked from the roster — the lock should remain and that player must still appear in the result (lock overrides exclusion).
- All players are unmarked — `calculate()` should be blocked (fewer than 11 eligible players), same as the existing `hasEnoughPlayers` guard.
- A new file is uploaded — marked state from the previous session should be cleared (new players default to marked).
- `localStorage` contains a marked-set from a previous upload session whose UIDs don't match the current player list — stale UIDs should be silently ignored; all current players default to marked.
- Player list is empty (no upload yet) — roster panel should either be hidden or show an empty state message consistent with the existing "At least 11 players must be uploaded" warning.

## Acceptance Criteria
- Visiting the Best XI page with an uploaded squad shows a roster panel with one row per player.
- All player rows are initially marked; the "mark all" button is disabled or hidden when all are already marked.
- Toggling a player to unmarked visually changes their row and excludes them from the next calculation run.
- Re-marking a player restores them to calculation eligibility.
- Reloading the page preserves marked/unmarked state.
- Locking an unmarked player in a slot dropdown causes that player to appear in the result.
- On a wide viewport the formation grid and roster panel are side by side; on a narrow viewport they are stacked.
- Pressing "Mark All" in the roster panel restores all players to marked.
- Uploading a new file resets all players to marked.

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in `./tests` (or alongside the component as `.spec.ts`) for:
- Unit: marked/unmarked state signal initialises to all-marked when players are loaded.
- Unit: toggling a player uid removes it from the marked set; toggling again restores it.
- Unit: "mark all" resets the set to include all current player uids.
- Unit: `eligiblePlayers` computed signal returns only marked players, plus any explicitly locked players (even if unmarked).
- Unit: `hasEnoughPlayers` is false when fewer than 11 eligible players exist after exclusions.
- Unit: persistence — marked state is written to localStorage on change and read back on init.
- Unit: stale UIDs in localStorage are ignored when a new player list is loaded.
- Component/integration: roster panel renders one row per player with correct mark state.
- Component/integration: clicking unmark button on a player updates the visual state and signal.
- Component/integration: layout uses side-by-side on wide viewport and stacked on narrow (CSS class or structural assertion).
