## Specs for best-eleven-formation-picker

branch: claude/feature/best-eleven-formation-picker

## Summary

A new page in the app where the user selects a formation (4-4-2 in this first prototype) and assigns a specific FM role to each of the 11 positional slots. Once the formation is configured, the app calculates and displays the optimal starting eleven from the uploaded player pool — one player per slot, maximizing total role score across the team using an optimal assignment algorithm.

## Open Questions
> These questions must be answered before implementation can begin.

_All open questions resolved._

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.

- Should the selected formation/roles configuration be persisted between sessions (like players are in localStorage), or is it reset on each visit? No need to save at this stage
- Should the result display show each player's role score for their assigned position, or just the player name and position? yes.
- Are players with `inf` or `reg` values treated any differently in the selection (e.g. injured players excluded)? not at this point

## Functional Requirements

- The page is accessible via a route (e.g. `/best-eleven`) and linked from the app header navigation. The nav link is only shown after players have been uploaded (i.e. the player pool is non-empty).
- The page displays the 4-4-2 formation with its 11 positional slots: GK, DL, DC, DC, DR, ML, MC, MC, MR, FC, FC.
- For each positional slot the user can select an FM role from a dropdown/picker. The available roles for each slot are scoped exclusively to roles valid for that general position, sourced from `PlayerService.roles`.
- All positional slots must have a role selected before the calculation can be triggered.
- If the uploaded player pool contains fewer than 11 players, the page displays a message stating that at least 11 players must be uploaded, and the calculate button is disabled.
- A "Calculate Best Eleven" button runs the optimal assignment.
- The algorithm evaluates every player against every positional slot using the player's `roleScore` for the assigned role. A player who does not have a matching role entry is assigned a score of 0 for that slot (not excluded).
- Each player may appear in the result at most once (one player per slot).
- The algorithm maximises the sum of role scores across all 11 slots using an optimal assignment algorithm (Hungarian Algorithm or equivalent). When multiple equally-optimal assignments exist, the first one found is used — no special tiebreaker is applied.
- The result is displayed as a visual lineup — 11 player cards arranged in a 4-4-2 layout — showing player name, assigned role, and role score.
- The page works with the existing `PlayerService.players$` stream and requires no additional backend call beyond what already exists.

## Visual Design Notes (only if this spec affects the UI)

- Style: Match the existing app style (Angular Material or whatever component library is in use). Use the same card/table aesthetic as the player-table page.
- Existing components to reuse: `app-header`, `PlayerService`, role data from `PlayerService.roles`.
- Responsive behavior: The formation layout should stack or simplify on narrow screens; the role pickers and result cards must remain usable on mobile.

## Possible Edge Cases

- Fewer than 11 players uploaded — show the message "At least 11 players must be uploaded" and disable the calculate button.
- A role chosen for a slot has no `roleScore` entry on any player (e.g. an unusual role not present in the squad) — all players score 0 for that slot; algorithm still runs but result quality is poor; consider a warning.
- Two players tied on roleScore for a slot — the first valid optimal assignment found is used; no tiebreaker applied.
- Player pool exactly equals 11 — all players must be selected regardless of score; no meaningful optimisation; algorithm still runs correctly.
- A player has `roles` array empty or undefined — treat as scoring 0 for all slots.
- User navigates away mid-configuration — no unsaved-changes warning needed in this prototype.

## Acceptance Criteria

- Navigating to `/best-eleven` shows the formation configuration page.
- The 4-4-2 formation displays exactly 11 positional slots with the correct labels (GK, DL, DC×2, DR, ML, MC×2, MR, FC×2).
- Each slot shows a role picker populated with roles valid for that position, sourced from the live `PlayerService.roles` signal.
- The "Calculate" button is disabled until all 11 slots have a role selected.
- After calculation, exactly 11 distinct players are displayed, one per slot, with no player appearing twice.
- The total role score of the displayed lineup equals the theoretical maximum achievable by any assignment of 11 players to the 11 slots (verified by a unit test against a known small dataset).
- If fewer than 11 players are loaded, the page shows "At least 11 players must be uploaded" and the calculate button remains disabled.
- All role scores used in the calculation are read directly from each player's existing `roles` array; no new API calls are made.

## Testing Guidelines

Write tests before implementation (TDD). Create test file(s) in `./tests` for:

- **Assignment algorithm unit tests:** Given a matrix of players × positions with known scores, verify the algorithm returns the assignment with the maximum total score. Test with a small 3×3 matrix where the optimal is non-greedy (greedy would pick incorrectly). Test the edge case where all scores are 0. Test where the pool has exactly 11 players.
- **Score-lookup helper:** Given a player and a role shortName, the helper returns the correct `roleScore` or 0 if not found.
- **Formation configuration component:** Verify that the calculate button is disabled when any slot has no role selected, and enabled when all slots are filled.
- **Result display component:** Given a fixed assignment result, verify 11 player cards are rendered with correct names, roles, and scores. Verify no duplicate players are rendered.
- **Integration / service test:** PlayerService supplies the player list correctly to the best-eleven page (no new service method needed, just verify the existing `players$` observable is consumed correctly).
