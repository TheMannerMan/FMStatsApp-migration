## Specs for best-xi-roster-improvements

branch: claude/feature/best-xi-roster-improvements
created: 2026-03-17

## Summary

Improve the Best XI roster list UI by enhancing search, filtering, sorting, and visual hierarchy. The squad list will be reorganized to surface marked players prominently while grouping unmarked players at the bottom. A search function will make it easy to find players, and a new Positions column will display player position information alongside names. The UI will support sorting by Name and Position with unmarked players always pinned at the bottom.

## Open Questions

> These questions must be answered before implementation can begin.
> Ask the user these questions immediately after creating this spec file.

- Should the search function filter players in real-time as the user types, or require pressing Enter to search? Answer: Real-time
- Should sorting be case-sensitive for player names? No
- When sorting by Position, should positions be sorted alphabetically or in formation order (e.g., GK, DEF, MID, FWD)? Answer:Formation order
- Should the "Reset" button (renamed from "Mark All") mark all players or unmark all players? Or should it do something different in context (e.g., undo last change)? Answer: players that are unmarked, should be reset to the default state. A unmarked players is not part of the calculation of the best XI. In the default state, they are part om the calculation. 

## Clarifications Needed

> Minor ambiguities that can be resolved during implementation, but worth flagging.

- The "Unmark" button currently uses `severity="secondary"` and `size="small"` — confirm this is subtle enough or if additional styling changes are needed
- Determine exact column width and spacing for the new Positions column so it doesn't disrupt the layout

## Functional Requirements

- **Button rename**: Change "Mark All" button label to "Reset"
- **Subtle unmark**: Reduce visual prominence of the Unmark button (use smaller size, muted styling, or icon-only variant)
- **Player grouping**: Always display marked players first, followed by unmarked players at the bottom, regardless of sorting
- **Search/filter**: Add a search input that filters the roster list by player name in real-time (case-insensitive)
- **Positions column**: Add a new column to the roster list displaying each player's position(s) from the Player model
- **Sortable columns**: Make Name and Position columns sortable in ascending/descending order
- **Stable sort**: Unmarked players must remain at the bottom even when sorting by any column
- **Responsive design**: Ensure search input and column headers are responsive on mobile and tablet viewports

## Visual Design Notes

- Style: Use the existing PrimeNG design system (ButtonModule, InputTextModule for search)
- Existing components to reuse: Reuse the `roster-list` and `player-row` styling; add search input above the list
- Responsive behavior: On mobile, search should stack above the roster; Positions column should be visible but may need condensed text
- Column headers should be clickable to trigger sort; indicate current sort direction with an icon

## Possible Edge Cases

- User searches for a player that is unmarked — the result should be grouped at the bottom per the grouping rule
- User sorts while a search is active — sorting should apply within the filtered results while maintaining marked/unmarked grouping
- Multiple positions per player — display all positions in a comma-separated list or wrapped layout
- Empty search results — show a "No players found" message
- All players marked or all players unmarked — roster should still display correctly without visual glitches

## Acceptance Criteria

- [ ] "Mark All" button is renamed to "Reset" and is visible in the roster panel heading
- [ ] Unmark button styling is visually subtle (smaller and/or muted compared to current state)
- [ ] Marked players appear first in the roster list; unmarked players always appear at the bottom
- [ ] A search input is present above the roster list that filters players by name in real-time
- [ ] A "Positions" column is displayed in the roster list showing each player's position(s)
- [ ] Clicking Name or Position column headers toggles sort order (ascending ↔ descending)
- [ ] Current sort column and direction are visually indicated (e.g., arrow icon, bold text)
- [ ] Unmarked players remain pinned at the bottom even when sorting
- [ ] Search results are filtered while maintaining marked/unmarked grouping
- [ ] Layout is responsive on mobile (480px), tablet (768px), and desktop (1024px+) viewports

## Testing Guidelines

Write tests before implementation (TDD). Create test file(s) in ./tests for:

- **Player grouping**: Verify that marked players appear before unmarked players in all scenarios (with/without sorting, with/without search)
- **Search functionality**: Test filtering by exact name match, partial match, case-insensitive matching; verify empty results display correctly
- **Sorting**: Test sorting by Name (ascending/descending) and Position (ascending/descending); verify sort stability when unmarked players are present
- **UI state**: Test that search filter and sort order persist in the UI across toggles and interactions; test that clicking a sort column multiple times alternates direction
- **Edge cases**: Test with 0 marked players, all marked players, players with multiple positions, and players with unusual name characters
