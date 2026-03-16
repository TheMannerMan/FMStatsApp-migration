# Plan: Best XI Player Inclusion Toggle

## Context

The Best XI page currently calculates the optimal 11-player lineup from all uploaded players. This feature adds a roster panel where users can mark/unmark players to exclude them from calculation, giving manual control over the player pool. Lock-in overrides exclusion. State persists to localStorage.

## Files to Modify

| File | Changes |
|------|---------|
| `best-eleven.component.ts` | New signals, computed, methods, localStorage persistence |
| `best-eleven.component.html` | Page layout wrapper, roster panel |
| `best-eleven.component.scss` | Side-by-side layout, roster panel styles, unmarked state |
| `best-eleven.component.spec.ts` | ~15-20 new test cases |

No changes to `PlayerService` or other files needed — all state lives in the component.

## Architecture

- **`markedPlayerUids`** — writable signal of `Set<number>`, defaults to all player UIDs
- **`eligiblePlayers`** — computed: marked players + locked players (deduped)
- **`allMarked`** — computed: `markedPlayerUids.size === players.length`
- **localStorage key**: `'best_xi_marked_players'` (separate from upload data)
- **New upload detection**: `effect()` on `players` — when UIDs change, reset all to marked

### Key integration points:
- `hasEnoughPlayers` changes from `players().length >= 11` to `eligiblePlayers().length >= 11`
- `calculate()` changes from `this.players()` to `this.eligiblePlayers()`
- `availablePlayersForSlot` keeps using `this.players()` (unmarked players stay in lock dropdowns per spec)

## TDD Implementation Steps

### Step 1: Marked state signals + toggle/markAll

**Tests first** (spec.ts):
1. All players initialized as marked when loaded
2. `toggleMark(uid)` removes player from marked set
3. `toggleMark(uid)` twice re-adds player
4. `markAll()` restores all UIDs
5. Mark All button disabled when all already marked

**Then implement** (component.ts):
- `markedPlayerUids = signal<Set<number>>(new Set())`
- `allMarked = computed(() => markedPlayerUids().size === players().length && players().length > 0)`
- `effect()` watching `players()` — sets markedPlayerUids to all UIDs on change
- `toggleMark(uid)` and `markAll()` methods

### Step 2: eligiblePlayers + updated hasEnoughPlayers

**Tests first:**
6. `eligiblePlayers` returns only marked players (no locks)
7. `eligiblePlayers` includes locked unmarked player
8. `hasEnoughPlayers` false when <11 eligible after exclusions
9. `hasEnoughPlayers` true when locked players fill the gap

**Then implement:**
- `eligiblePlayers = computed(...)` — filter players by marked OR locked
- Update `hasEnoughPlayers` to use `eligiblePlayers().length`

### Step 3: calculate() uses eligible players

**Tests first:**
10. Calculate excludes unmarked players from result
11. Calculate includes locked unmarked player at correct slot

**Then implement:**
- Change `calculate()` line: `const players = this.eligiblePlayers()`

### Step 4: localStorage persistence

**Tests first:**
12. Marked state persisted on change
13. Marked state restored on init
14. Stale UIDs from localStorage silently ignored
15. New upload resets all to marked

**Then implement:**
- Read localStorage in constructor before effect
- `effect()` on `markedPlayerUids` writes to localStorage
- Player-change effect: if UIDs differ from previous → reset to all-marked; if same → apply stored state (intersected with current UIDs)

### Step 5: Roster panel template + integration tests

**Tests first:**
16. Roster panel renders one row per player
17. Player name displayed in row
18. Clicking unmark button toggles visual state
19. Unmarked row has `.unmarked` class
20. No roster panel when no players uploaded

**Then implement** (template):
- Wrap existing content in `.page-layout` > `.formation-column`
- Add `.roster-panel` sibling with heading, Mark All button, `@for` loop of `.player-row` divs
- Each row: player name + toggle button (`pButton`, label toggles "Mark"/"Unmark")

### Step 6: SCSS styling

- `.best-eleven-page` max-width → `1200px`
- `.page-layout`: `display: flex; gap: 2rem; align-items: flex-start`
- `.formation-column`: `flex: 1; min-width: 0`
- `.roster-panel`: `width: 260px; flex-shrink: 0`, card styling (bg, border, rounded), scrollable (`max-height: 80vh; overflow-y: auto`)
- `.player-row`: flex row, name + button, bottom border
- `.player-row.unmarked`: `opacity: 0.5`, `text-decoration: line-through` on name
- `.mark-all-btn`: full width, margin-bottom
- `@media (max-width: 900px)`: `.page-layout` → column, `.roster-panel` → full width

### Step 7: Structural layout test

21. `.page-layout` contains `.formation-column` and `.roster-panel` as children

## Verification

1. `cd fm-stats-angular && ng test` — all existing + new tests pass
2. Manual: upload squad, verify roster panel appears with all players marked
3. Manual: unmark 2 players, calculate — excluded players absent from result
4. Manual: lock an unmarked player, calculate — appears in result
5. Manual: reload page — marked state persisted
6. Manual: upload new file — all reset to marked
7. Manual: resize browser — side-by-side at >=900px, stacked below

## Design Decisions

- **Player list order**: Upload order (matches `players()` array order) — no sorting needed
- **Mark All button**: Separate button in roster panel (not combined with formation Reset)
- **No PlayerService changes**: Marked state is a UI concern, not a data concern
