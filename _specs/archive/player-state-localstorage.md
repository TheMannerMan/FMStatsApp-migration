## Specs for player-state-localstorage

branch: claude/feature/player-state-localstorage

## Summary
Extend the existing `PlayerService` to persist the player list to `localStorage` and expose it as an `Observable`, making it the single source of truth for player state across all views. On app startup the service rehydrates from `localStorage` so the squad survives page reloads. Components never touch `localStorage` directly, keeping the storage layer swappable for an authenticated backend in a future tier.

## Open Questions
> These questions must be answered before implementation can begin.
- Should the Observable-based API **replace** the existing `signal()`-based `players` signal entirely, or should both coexist (e.g. the signal is derived from the BehaviorSubject for backwards compatibility with `PlayerTableComponent`)? Replace
- Is there an agreed `localStorage` key name (e.g. `fm_squad`, `players`, `fmstats_players`)? no, uploaded_players is a suggestion.
- When a new file is uploaded, should the previous squad be silently overwritten, or should the user be prompted to confirm before replacing it? Silently overwriten at this stage.

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.
- The `Player` model has a `uid` field — confirm this is the stable identifier to use for individual player removal (not array index). Use uid for removal
- If `localStorage` contains malformed JSON on startup, should the service silently discard it and start empty, or surface an error? silently discard it
- Should the `roles` and `activeRoles` signals (currently in `PlayerService`) also be persisted, or only the player list? Persist both players and activeRoles in localStorage. When setPlayers() is called (new file uploaded), reset activeRoles  
  back to "all roles active" and persist that too. 

## Functional Requirements
- A `PlayerStateService` (or an extended `PlayerService`) acts as the single source of truth for the player list across all components and views.
- The service exposes the player list as an `Observable<Player[]>` (e.g. via a `BehaviorSubject`) so components can subscribe and react to changes.
- The service provides a `setPlayers(players: Player[])` method that replaces the entire player list (called after a successful file upload).
- The service provides a `removePlayer(uid: number)` method that removes a single player by their `uid`.
- Every mutation (`setPlayers`, `removePlayer`) persists the updated player list to `localStorage` immediately.
- On service construction, if `localStorage` contains a valid serialised player list, the service rehydrates its internal state from it before any component renders.
- The `UploadComponent` calls `setPlayers()` with the API response instead of relying on the side-effect inside `uploadFile()`.
- No component accesses `localStorage` directly — all reads and writes go through the service.
- The `localStorage` key used by the service is defined as a single named constant inside the service file, not scattered as string literals.

## Possible Edge Cases
- `localStorage` is unavailable (private browsing mode in some browsers, storage quota exceeded) — the service must not crash; it should degrade gracefully and operate in-memory only.
- `localStorage` contains JSON that parses successfully but does not conform to the `Player` interface (e.g. data from a previous schema version) — the service should discard it and start empty.
- `removePlayer` is called with a `uid` that does not exist in the current list — the list should remain unchanged without throwing.
- A new file is uploaded while another upload is already in flight — the second response should win (last write wins), consistent with the current single-subscription model.
- Very large squads (hundreds of players with all attributes) could approach `localStorage` size limits (~5 MB) — worth noting but not blocking for now.

## Acceptance Criteria
- After uploading a file, navigating away, and refreshing the page, the player table still shows the previously uploaded squad without re-uploading.
- Calling `removePlayer` with a valid `uid` removes exactly that player from the Observable stream and from `localStorage`.
- Calling `setPlayers` with a new list replaces the previous list in both the Observable stream and `localStorage`.
- Components that subscribe to the player list Observable receive the rehydrated list immediately on page load (no additional user action required).
- No component file contains any direct `localStorage` call.
- The service handles a missing or corrupt `localStorage` entry without throwing an unhandled error, and starts with an empty player list.

## Testing Guidelines
Write tests before implementation (TDD). The project has Vitest available in `node_modules`. Prefer Vitest + Angular Testing Library or Angular's built-in `TestBed` for service tests.

Recommended test setup: use `ng test` (Karma/Jasmine) if already configured, or configure Vitest with `@analogjs/vitest-angular` / `@testing-library/angular`. Mock `localStorage` using a simple in-memory fake (`localStorage` can be replaced on `window` in jsdom/happy-dom).

Create test file(s) in `fm-stats-angular/src/app/services/` for:
- Rehydration: service initialised with a prepopulated `localStorage` entry emits the stored players on the Observable immediately.
- `setPlayers`: emits the new list, persists to `localStorage`, replaces any previous value.
- `removePlayer` with a valid `uid`: emits updated list without that player, updates `localStorage`.
- `removePlayer` with an unknown `uid`: Observable emits unchanged list, `localStorage` unchanged.
- Corrupt `localStorage` on init: service starts with empty list and does not throw.
- `localStorage` unavailable (stub `setItem` to throw `QuotaExceededError`): in-memory state still updates, no crash.
- `UploadComponent` integration: after `uploadFile` resolves, the service's Observable emits the returned players (use `TestBed` with `HttpClientTestingModule`).
