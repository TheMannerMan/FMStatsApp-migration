## Specs for best-xi-auto-role

branch: claude/feature/best-xi-auto-role
created: 2026-04-11

## Summary
Allow the user to calculate the Best-XI without having to pre-select a role for every slot. When a slot has no manually chosen role, the algorithm automatically selects the role that maximises the total team score for that slot. The auto-selected role is shown in the result, and the feature works across all formations.

## Open Questions
> These questions must be answered before implementation can begin.
- None. All clarifications resolved before spec was written.

## Clarifications Needed
> Minor ambiguities that can be resolved during implementation, but worth flagging.
- When multiple roles for a position give the same maximum score for the assigned player, tie-breaking order is implementation-defined (e.g. first match in role list).

## Functional Requirements
- Role selection for a slot is optional. A slot may be in one of three states: no role selected (auto), role selected, or a player locked (which also requires a role — lock without role is not allowed and the UI must enforce this).
- The Calculate button is enabled as long as there are at least 11 marked players and no position-restriction violations, regardless of how many roles are unselected.
- `canCalculate` must no longer require all roles to be non-null. It only blocks on player count and position-restriction errors (for manually-roled slots).
- For an **auto-role slot** (no role selected):
  - The set of candidate roles is all roles whose `positions` array includes the slot's `position`.
  - The score used in the assignment matrix for a (player, auto-role-slot) cell is the maximum score that player can achieve across all candidate roles for that slot.
  - Position restriction toggle does **not** restrict player eligibility for auto-role slots — any marked player may be assigned to an auto-role slot regardless of their natural position.
  - After the Hungarian algorithm assigns a player to the slot, the displayed role for that slot is the candidate role that produced the highest score for that player. If the player has zero score for all candidate roles, the first candidate role in the list is used.
- For **manually-roled slots** (role selected), behaviour is unchanged: score is the player's score for that exact role, position restriction applies normally.
- For **locked slots** (player + role), behaviour is unchanged.
- The result display for each slot shows the role that was used — auto-selected roles are shown identically to manually-selected ones (no special label is required, but one may be added as a visual hint if trivially achievable).
- Clearing the result (e.g. changing any role or lock) resets auto-selected roles — they are not persisted between calculations.

## Visual Design Notes (only if this spec affects the UI)
- Style: match existing PrimeNG-based slot cards. No new components needed.
- Existing components to reuse: the slot card in `best-eleven.component.html` already renders role and player; it should continue to work when the displayed role comes from an auto-assignment.
- A subtle visual indicator (e.g. italic text or a small "auto" chip) on auto-role slots in the result is optional and may be deferred.
- Responsive behavior: no change from existing layout.

## Possible Edge Cases
- A slot's position has no matching roles in the role catalog — treat its candidate set as empty; assign a score of 0 for all players for that slot, display no role in the result.
- All 11 slots are auto-role — the algorithm must still produce a valid 11-player result with one role per slot.
- A locked slot has no role selected — the UI must prevent or warn about this state; it is not a valid input to the algorithm.
- A player's best auto-role ties with another role — use the first match (stable, deterministic).
- Position restriction is ON and all manually-roled slots satisfy it, but some slots are auto-role — position restriction is applied only to the manually-roled slots as before; auto-role slots are excluded from restriction checks entirely.

## Acceptance Criteria
- With zero roles selected, the Calculate button is enabled (given ≥ 11 marked players and no position-restriction errors).
- After calculating with all roles unselected, each of the 11 result slots shows a player, a role, and a score; the role is valid for the slot's position.
- A mix of manually-selected and auto-selected roles produces a result where manual roles are respected and auto roles are filled in from the candidate set.
- A locked player with no role selected cannot be used to trigger a calculation (the UI prevents this state).
- Position restriction ON: auto-role slots do not produce eligibility errors and do not block calculation; manually-roled slots with restriction violations still block calculation.
- Removing a manually-selected role from a slot mid-session (setting it back to null) clears the result and that slot enters auto-role mode for the next calculation.
- The result score shown per slot equals the player's score for the role displayed (manually or auto-selected).

## Testing Guidelines
Write tests before implementation (TDD). Create test file(s) in `fm-stats-angular/src/app` (alongside existing spec files) for:
- Unit test (`score-matrix.spec.ts` or new file): a helper that, given a player and a list of candidate role names, returns the max score and the winning role name.
- Unit test: when all roles are null, `buildAutoRoleScoreMatrix` (or equivalent) produces a matrix where each cell equals the player's best score across candidate roles for that slot's position.
- Unit test: after assigning a player to an auto-role slot, the resolved role name is the one with the highest score for that player.
- Unit test: a slot with position that has no candidate roles yields score 0 and no role in the result.
- Component test (`best-eleven.component.spec.ts`): Calculate button is enabled when all roles are null and ≥ 11 players are marked.
- Component test: result entries for auto-role slots contain a non-null role that is valid for the slot's position.
- Component test: mixing one manually-selected role with auto roles — the manual role appears unchanged in the result.
