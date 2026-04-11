# Plan: Best XI — Auto Role Selection

## Context

Today the Best XI builder requires the user to pick a role for every one of the 11 slots before `Calculate` is enabled. This feature lifts that requirement: a slot with no chosen role becomes an **auto-role** slot, and the algorithm picks the role (from the slot position's candidate set) that maximises the assigned player's score. The auto-selected role is displayed in the result exactly like a manually-selected one.

**Spec:** `_specs/best-xi-auto-role.md`
**Branch:** `claude/feature/best-xi-auto-role`

Slot states become: **auto** (role null), **manual** (role set), **locked** (role set + player pinned). Lock-without-role stays invalid and must be enforced by the UI.

## Key observations

- `BestElevenComponent.canCalculate` (`best-eleven.component.ts:151`) gates on `selectedRoles().every(r => r !== null)` — this must be dropped.
- `positionRestrictionErrors` (`best-eleven.component.ts:129`) walks every slot; it must skip slots where `selectedRoles()[slotIndex] === null` (auto slots are excluded from restriction per spec §42).
- `calculate()` (`best-eleven.component.ts:397`) currently assumes `slotRoles` is `string[]`. It feeds:
  - `getPlayerRoleScore(player, role)` for locked-slot score,
  - `buildConstrainedScoreMatrix(players, slotRoles, lockedPairs)`,
  - `applyPositionRestriction(matrix, players, positions, rowMap, colMap)`,
  - `hungarian(matrix)`,
  - maps each assignment back to a `ResultEntry { slot, player, role, score }` using `slotRoles[colMap[a.slotIndex]]` as the role.
  All four touchpoints must learn about auto slots.
- `availableRolesForSlot` (`best-eleven.component.ts:177`) already computes, per slot, the roles whose `positions` include the slot position — this is exactly the "candidate roles" set the auto-role algorithm needs. Reuse it; do not re-derive.
- `score-matrix.ts` exports `getPlayerRoleScore`, `buildScoreMatrix`, `buildConstrainedScoreMatrix`, `applyPositionRestriction`. Only `best-eleven.component.ts` imports `buildConstrainedScoreMatrix` / `applyPositionRestriction`, so their signatures can be extended safely (tests at `utils/score-matrix.spec.ts` will need updates).
- `RolePickerModalComponent` already supports clearing the selection (`clearSelection()` emits `null` at `role-picker-modal.component.ts:47`), and `onRolePickerSelect` → `onRoleChange` already accepts `string | null`. So the UI wiring for "unset a role" exists — only the component-level reaction needs adjusting.
- Lock-without-role forward enforcement already exists: `best-eleven.component.html:34` disables the "Lock Player" button when `!selectedRoles()[item.index]`. The **reverse** case (clearing a role on a slot that already has a lock) is not handled and must be.
- `ResultEntry.role` is typed `string`; for the empty-candidate edge case (slot position with no matching role in the catalog) the spec says "display no role". We'll widen to `string | null` and let the template render nothing when null.
- Hungarian utility returns exactly one assignment per free slot and is unchanged by this feature.
- Tests run under Vitest (`fm-stats-angular` uses `describe/it/expect` from `vitest`). New tests go alongside existing spec files per spec §54.

## Steps

### Step 1: Extend `score-matrix.ts` with auto-aware logic (TDD)

**Modify tests first:** `fm-stats-angular/src/app/utils/score-matrix.spec.ts`

Add new tests:

1. `getBestRoleForPlayer(player, candidateShortRoleNames)` — new exported helper:
   - Returns `{ score, role }` with the max score and the winning short role name.
   - When all candidates score `0`, returns `{ score: 0, role: <first candidate> }` (spec §25).
   - When `candidateShortRoleNames` is empty, returns `{ score: 0, role: null }`.
   - Tie-breaking: first candidate in input order wins (strict `>` comparison).
2. `buildConstrainedScoreMatrix` with auto slots (extended signature):
   - Given all-null `slotRoles` and non-empty `slotCandidateRoles[j]`, each cell `matrix[i][j]` equals the player's best score across `slotCandidateRoles[j]`.
   - A `bestRoles` matrix is returned mirroring `matrix` dimensions; for a manual slot `bestRoles[i][j] === slotRoles[colMap[j]]`; for an auto slot, it's the winning role (or `null` if the candidate set is empty).
   - Empty candidate list for an auto slot → entire column is `0` and `bestRoles[i][j] === null`.
   - Mixed manual + auto: manual columns behave exactly as today.
3. `applyPositionRestriction` with auto slots (extended signature takes `slotRoles`):
   - For columns where `slotRoles[colMap[j]] === null`, cells are **not** zeroed even when the player is ineligible for the slot position.
   - For manual columns, behavior is unchanged.

**Modify:** `fm-stats-angular/src/app/utils/score-matrix.ts`

```ts
export interface BestRoleResult {
  score: number;
  role: string | null;
}

export function getBestRoleForPlayer(
  player: Player,
  candidateShortRoleNames: string[],
): BestRoleResult {
  if (candidateShortRoleNames.length === 0) return { score: 0, role: null };
  let bestScore = getPlayerRoleScore(player, candidateShortRoleNames[0]);
  let bestRole: string = candidateShortRoleNames[0];
  for (let i = 1; i < candidateShortRoleNames.length; i++) {
    const s = getPlayerRoleScore(player, candidateShortRoleNames[i]);
    if (s > bestScore) {            // strict > → first-match tie break
      bestScore = s;
      bestRole = candidateShortRoleNames[i];
    }
  }
  return { score: bestScore, role: bestRole };
}

export interface ConstrainedMatrixResult {
  matrix: number[][];
  bestRoles: (string | null)[][];   // NEW: resolved role per cell
  rowMap: number[];
  colMap: number[];
}

export function buildConstrainedScoreMatrix(
  players: Player[],
  slotRoles: (string | null)[],                 // widened
  slotCandidateRoles: string[][],                // NEW, parallel to slotRoles
  lockedPairs: { slotIndex: number; playerIndex: number }[],
): ConstrainedMatrixResult {
  // rowMap/colMap filter as before
  // For each (i,j) in the reduced matrix:
  //   if slotRoles[colMap[j]] != null → score = getPlayerRoleScore(...); bestRoles[i][j] = that role
  //   else (auto)                     → { score, role } = getBestRoleForPlayer(player, slotCandidateRoles[colMap[j]])
}

export function applyPositionRestriction(
  matrix: number[][],
  players: Player[],
  slotPositions: string[],
  slotRoles: (string | null)[],                 // NEW
  rowMap: number[],
  colMap: number[],
): void {
  for (let j = 0; j < colMap.length; j++) {
    if (slotRoles[colMap[j]] === null) continue; // auto slot → skip
    // existing per-row zeroing logic
  }
}
```

Update the existing tests that call `buildConstrainedScoreMatrix` / `applyPositionRestriction` (the ones currently in `score-matrix.spec.ts`) to pass the new `slotCandidateRoles` / `slotRoles` arguments — for all-manual scenarios, pass `slotCandidateRoles = slotRoles.map(() => [])`.

Run `npm test -- score-matrix` → green.

### Step 2: Update `BestElevenComponent` (TDD)

**Modify tests first:** `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts`

Add a new `describe('auto role selection', …)` block covering spec §44–51:

1. `canCalculate` is `true` when `selectedRoles` is all-null and ≥11 players are marked.
2. Calculate button element is `disabled === false` in the same state (template wiring).
3. Calculate with all roles null produces 11 result entries, each with a non-null `role` that is one of the slot position's candidate roles; player distribution is a valid 11-player assignment (no duplicates).
4. Mix: one slot with a manual role (e.g. `'SK'` at GK), remaining 10 auto. The result entry for the GK slot has `role === 'SK'`; other entries' roles come from the candidate set for their slot positions.
5. Auto-role slot + position restriction ON: give a test squad where all 11 marked players have `position: ''` (ineligible everywhere); with `selectedRoles = [null × 11]` and restriction ON, `canCalculate` is `true`, `positionRestrictionErrors` is empty, and `calculate()` still produces 11 entries.
6. Auto-role score equals the player's best role score for that slot's position — construct a player with two candidate-role scores (e.g. `SK=6`, `GK (any other)=0`), assign to GK auto slot, expect `score === 6` and `role === 'SK'`.
7. Setting `onRoleChange(slotIndex, null)` on a previously manual slot: `result()` resets to `null`, `selectedRoles()[slotIndex] === null`, and the slot can then be included in a fresh calculation that completes successfully.
8. Clearing a role on a locked slot also clears the lock (lock-without-role enforcement): set `selectedRoles[0]='SK'`, `lockedPlayers[0]=1`, then call `onRoleChange(0, null)` → `lockedPlayers()[0] === null`.
9. Empty candidate set edge case: mock `rolesSignal` with zero roles whose `positions` include `'GK'`, leave GK slot auto, calculate → the GK result entry has `score === 0` and `role === null` (template renders no role text).

**Modify:** `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.ts`

1. Relax `canCalculate` (line 151):
   ```ts
   protected canCalculate = computed(() => {
     if (!this.hasEnoughPlayers()) return false;
     if (this.positionRestriction() && this.positionRestrictionErrors().length > 0) return false;
     return true;
   });
   ```
2. Restrict `positionRestrictionErrors` (line 129) to slots with a manually selected role:
   ```ts
   return formation
     .map((slot, slotIndex) => {
       if (this.selectedRoles()[slotIndex] === null) return null; // auto slot → not checked
       const lockedUid = locks[slotIndex];
       if (lockedUid !== null) return null;
       const hasEligible = players
         .filter(p => !lockedUids.has(p.uid))
         .some(p => isPlayerEligibleForSlot(p, slot.position));
       return hasEligible ? null : slot.position;
     })
     .filter((pos): pos is string => pos !== null);
   ```
3. Clear the lock when the role is cleared in `onRoleChange` (line 302):
   ```ts
   protected onRoleChange(slotIndex: number, roleName: string | null): void {
     const roles = [...this.selectedRoles()];
     roles[slotIndex] = roleName;
     this.selectedRoles.set(roles);
     if (roleName === null && this.lockedPlayers()[slotIndex] !== null) {
       const locks = [...this.lockedPlayers()];
       locks[slotIndex] = null;
       this.lockedPlayers.set(locks);
     }
     this.result.set(null);
   }
   ```
4. Rework `calculate()` (line 397) to flow auto-role slots through the matrix and resolve the role from the returned `bestRoles`:
   ```ts
   const slotRoles = this.selectedRoles();                 // (string | null)[]
   const slotCandidateRoles = this.availableRolesForSlot()
     .map(rs => rs.map(r => r.shortRoleName));             // string[][]

   // Locked entries: role is guaranteed non-null (UI enforcement).
   const lockedEntries: ResultEntry[] = lockedPairs.map(lp => ({
     slot: formation[lp.slotIndex],
     player: players[lp.playerIndex],
     role: slotRoles[lp.slotIndex] as string,
     score: getPlayerRoleScore(players[lp.playerIndex], slotRoles[lp.slotIndex] as string),
   }));

   const { matrix, bestRoles, rowMap, colMap } = buildConstrainedScoreMatrix(
     players, slotRoles, slotCandidateRoles, lockedPairs,
   );

   if (this.positionRestriction() && matrix.length > 0) {
     applyPositionRestriction(
       matrix, players, formation.map(s => s.position), slotRoles, rowMap, colMap,
     );
   }

   let freeEntries: ResultEntry[] = [];
   if (matrix.length > 0 && matrix[0]?.length > 0) {
     const assignments = hungarian(matrix);
     freeEntries = assignments.map(a => ({
       slot: formation[colMap[a.slotIndex]],
       player: players[rowMap[a.playerIndex]],
       role: bestRoles[a.playerIndex][a.slotIndex],  // null-safe for empty candidates
       score: a.score,
     }));
   }
   ```
5. Widen `ResultEntry.role` to `string | null` (line 23).

**Modify:** `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html`

No structural change. The existing `{{ entry.role }}` interpolation at line 41 renders an empty string for `null`, which is the desired behavior for the empty-candidate edge case. No optional "auto" visual hint is added in this scope (spec §34 marks it as deferrable).

Run `npm test` → green.

### Step 3: Manual verification

1. `cd fm-stats-angular && npm test` — full suite green.
2. `npm start`, upload a squad, navigate to `/best-eleven/4-4-2`.
3. **All-auto**: leave every slot without a role selected → Calculate button is enabled → click → 11 player cards rendered, each showing a player, a role valid for its slot position, and a score.
4. **Mix**: pick `SK` for the GK slot, leave the other 10 auto → calculate → GK shows `Sweeper Keeper`, others show auto-chosen roles.
5. **Clear a manual role on a locked slot**: pick a role, lock a player, then re-open the role picker and click "Clear Selection" → the lock on that slot is removed (player button reverts to "Lock Player (optional)" and is disabled).
6. **Position restriction + auto**: turn restriction ON with all slots auto → no ineligibility warning shown, Calculate stays enabled, result is valid.
7. **Position restriction + mixed**: with restriction ON, manually pick a role for a slot whose position has zero eligible players → warning reappears only for that slot and Calculate is blocked.
8. Repeat (3) on `/best-eleven/4-2-3-1` and `/best-eleven/5-3-2` to confirm it works across formations.

## Files summary

| Action | File |
|--------|------|
| Modify | `fm-stats-angular/src/app/utils/score-matrix.ts` — new `getBestRoleForPlayer`, widened `buildConstrainedScoreMatrix` + `applyPositionRestriction` signatures, `bestRoles` matrix |
| Modify | `fm-stats-angular/src/app/utils/score-matrix.spec.ts` — new unit tests + update existing callers to new signatures |
| Modify | `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.ts` — relax `canCalculate`, filter `positionRestrictionErrors` to manual slots, clear lock on role-clear, rewire `calculate()` for auto slots, widen `ResultEntry.role` |
| Modify | `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts` — add auto-role `describe` block per spec §54–61 |

## Verification

1. `cd fm-stats-angular && npm test` — unit + component tests green.
2. Walk through the 8 manual steps above in the running app.
3. Confirm spec §44–51 acceptance criteria pass by spot-checking the live UI (calculate button state, result roles, restriction interactions, reset-on-unset).
