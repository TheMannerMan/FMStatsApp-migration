# Player Table Role Sort & State Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Plan file destination:** After approval, save this plan as `_plans/player-table-role-sort-and-state.md` in the repo (per CLAUDE.md). This file at `C:\Users\henri\.claude\plans\golden-sprouting-kahan.md` is the plan-mode draft.

**Goal:** Make the `/players` page start with no role columns selected after a fresh upload, and make role column headers fully sortable (with null scores sorted to bottom).

**Architecture:** Two surgical changes — (1) `PlayerService.setPlayers()` clears active roles instead of populating them with all roles; (2) `PlayerTableComponent` gains a `customSort` handler that PrimeNG's `p-table` calls in place of its default sort, plus visible `<p-sortIcon>` on role column headers. The custom sort routes basic-column fields to direct property lookup and role-column fields (e.g. `"ST"`) to `getRoleScore()`, with null-bottom semantics in both directions.

**Tech Stack:** Angular 21, PrimeNG 21 (`p-table` with `customSort` boolean + `sortFunction` event emitting `SortEvent` from `primeng/api`), Vitest for unit tests.

---

## Context

The `/players` page currently auto-selects every role discovered in an uploaded squad, which produces a wall of ~85 columns the moment a user uploads. Users expect to opt-in to the roles they care about. Additionally, role column headers wear `pSortableColumn` but PrimeNG's default sort tries to look up `player['ST']` (a property that doesn't exist — role scores live nested inside `player.roles[]`), so clicking those headers does nothing useful and there's no sort icon to indicate sortability.

The feature spec is at `_specs/player-table-role-sort-and-state.md`. After implementation it should be archived under `_specs/archive/` and this plan archived under `_plans/archive/`, per project convention.

---

## File Structure

**Modify:**
- `fm-stats-angular/src/app/services/player.service.ts` — `setPlayers` initializes active roles to an empty Set
- `fm-stats-angular/src/app/services/player.service.spec.ts` — invert the existing "resets to all roles" test, add coverage for the new behavior
- `fm-stats-angular/src/app/components/player-table/player-table.component.ts` — add `customSort` method, import `SortEvent`
- `fm-stats-angular/src/app/components/player-table/player-table.component.html` — wire up `[customSort]` + `(sortFunction)`, add `<p-sortIcon>` to role headers
- `fm-stats-angular/src/app/components/player-table/player-table.component.spec.ts` — tests for `customSort` covering basic columns, role columns, and null-bottom

**No new files.** All work fits inside existing components and their spec files.

---

## Existing Code Reused

- `PlayerService.setActiveRoles` (`player.service.ts:71-74`) — already persists; not touched.
- `PlayerService.persist()` (`player.service.ts:46-56`) — already serializes the empty Set correctly via `[...activeRolesSubject.value]`.
- `PlayerTableComponent.getRoleScore()` (`player-table.component.ts:42-44`) — returns `number | null`. Reused as the role-column value resolver inside `customSort`.
- `PlayerTableComponent.basicColumns` (`player-table.component.ts:25-33`) — used to discriminate basic vs. role columns inside `customSort`.
- `mockPlayer()` factory in `player.service.spec.ts:11-42` — reused in new tests.

---

## Task 1: PlayerService.setPlayers — initialize active roles to empty

**Files:**
- Modify: `fm-stats-angular/src/app/services/player.service.ts:58-63`

- [ ] **Step 1: Update the failing assertion in the existing test first (TDD)**

Open `fm-stats-angular/src/app/services/player.service.spec.ts`. Replace the test at lines 123-128:

```typescript
  it('setPlayers resets activeRoles to an empty set', async () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1)]);
    const roles = await firstValueFrom(svc.activeRoles$);
    expect(roles).toEqual(new Set<string>());
  });
```

- [ ] **Step 2: Run the test and confirm it fails**

Run from `fm-stats-angular/`:
```bash
npm test -- --run player.service.spec
```
Expected: 1 failing test — `setPlayers resets activeRoles to an empty set` — assertion `expect(new Set(['ST'])).toEqual(new Set([]))` fails.

- [ ] **Step 3: Update `setPlayers` to clear active roles**

Edit `fm-stats-angular/src/app/services/player.service.ts:58-63`. Replace the body of `setPlayers`:

```typescript
  setPlayers(players: Player[]): void {
    this.playersSubject.next(players);
    this.activeRolesSubject.next(new Set<string>());
    this.persist();
  }
```

(Removes the `const allRoles = ...` line that flat-mapped role short names.)

- [ ] **Step 4: Re-run the spec and confirm it passes**

```bash
npm test -- --run player.service.spec
```
Expected: all `PlayerService` tests pass.

- [ ] **Step 5: Commit**

```bash
git add fm-stats-angular/src/app/services/player.service.ts fm-stats-angular/src/app/services/player.service.spec.ts
git commit -m "feat(players): start with no active roles after upload"
```

---

## Task 2: Add coverage for empty-roles persistence

**Files:**
- Modify: `fm-stats-angular/src/app/services/player.service.spec.ts`

The existing test `rehydrates stored activeRoles on construction` at lines 83-88 already covers the spec's "previously persisted non-empty selection from prior session must still be respected" edge case — no new test needed for that. We only need one additional test: the wipe behavior on `setPlayers`.

- [ ] **Step 1: Add a failing test asserting `setPlayers` wipes any previously stored activeRoles**

Insert after the test you edited in Task 1 (around line 128):

```typescript
  it('setPlayers wipes any previously persisted activeRoles in localStorage', () => {
    const svc = getService();
    svc.setActiveRoles(new Set(['ST', 'CM']));
    svc.setPlayers([mockPlayer(1)]);
    const stored = JSON.parse(store['uploaded_players']);
    expect(stored.activeRoles).toEqual([]);
  });
```

- [ ] **Step 2: Run the spec and confirm the new test passes**

```bash
npm test -- --run player.service.spec
```
Expected: the new test passes (Task 1 already implemented the empty-Set behavior, so this becomes a regression guard documenting the wipe contract). All `PlayerService` tests green.

- [ ] **Step 3: Commit**

```bash
git add fm-stats-angular/src/app/services/player.service.spec.ts
git commit -m "test(players): guard that setPlayers wipes persisted activeRoles"
```

---

## Task 3: Add `customSort` handler to PlayerTableComponent

**Files:**
- Modify: `fm-stats-angular/src/app/components/player-table/player-table.component.ts`

- [ ] **Step 1: Write failing tests first**

Open `fm-stats-angular/src/app/components/player-table/player-table.component.spec.ts`. Add these tests inside the existing `describe('PlayerTableComponent', ...)` block, after the `toggles filterDrawerVisible...` test (after line 49):

```typescript
  describe('customSort', () => {
    function row(name: string, age: number, scores: Record<string, number | null>) {
      return {
        name,
        age,
        roles: Object.entries(scores)
          .filter(([, v]) => v !== null)
          .map(([shortRoleName, roleScore]) => ({
            roleName: shortRoleName,
            shortRoleName,
            position: shortRoleName,
            roleScore: roleScore as number,
          })),
      };
    }

    it('sorts by a basic column ascending', () => {
      const data = [row('B', 30, {}), row('A', 20, {}), row('C', 25, {})];
      component.customSort({ data, field: 'age', order: 1 });
      expect(data.map(p => p.name)).toEqual(['A', 'C', 'B']);
    });

    it('sorts by a basic column descending', () => {
      const data = [row('B', 30, {}), row('A', 20, {}), row('C', 25, {})];
      component.customSort({ data, field: 'age', order: -1 });
      expect(data.map(p => p.name)).toEqual(['B', 'C', 'A']);
    });

    it('sorts by a role column ascending using role score', () => {
      const data = [
        row('A', 25, { ST: 5.5 }),
        row('B', 25, { ST: 8.5 }),
        row('C', 25, { ST: 7.0 }),
      ];
      component.customSort({ data, field: 'ST', order: 1 });
      expect(data.map(p => p.name)).toEqual(['A', 'C', 'B']);
    });

    it('sorts by a role column descending using role score', () => {
      const data = [
        row('A', 25, { ST: 5.5 }),
        row('B', 25, { ST: 8.5 }),
        row('C', 25, { ST: 7.0 }),
      ];
      component.customSort({ data, field: 'ST', order: -1 });
      expect(data.map(p => p.name)).toEqual(['B', 'C', 'A']);
    });

    it('sorts players with null role scores to the bottom on ascending sort', () => {
      const data = [
        row('A', 25, { ST: 5.5 }),
        row('B', 25, { ST: null }),
        row('C', 25, { ST: 8.5 }),
      ];
      component.customSort({ data, field: 'ST', order: 1 });
      expect(data.map(p => p.name)).toEqual(['A', 'C', 'B']);
    });

    it('sorts players with null role scores to the bottom on descending sort', () => {
      const data = [
        row('A', 25, { ST: 5.5 }),
        row('B', 25, { ST: null }),
        row('C', 25, { ST: 8.5 }),
      ];
      component.customSort({ data, field: 'ST', order: -1 });
      expect(data.map(p => p.name)).toEqual(['C', 'A', 'B']);
    });

    it('is a no-op when all role scores for the column are null', () => {
      const data = [
        row('A', 25, { ST: null }),
        row('B', 25, { ST: null }),
        row('C', 25, { ST: null }),
      ];
      component.customSort({ data, field: 'ST', order: 1 });
      expect(data.map(p => p.name)).toEqual(['A', 'B', 'C']);
    });
  });
```

- [ ] **Step 2: Run the spec and confirm tests fail**

```bash
npm test -- --run player-table.component.spec
```
Expected: 7 failing tests (`component.customSort is not a function`).

- [ ] **Step 3: Add the `customSort` method and import**

Edit `fm-stats-angular/src/app/components/player-table/player-table.component.ts`.

At the top of the file (after line 9), add the import:

```typescript
import { SortEvent } from 'primeng/api';
```

Inside the `PlayerTableComponent` class, add the method below `getRoleScoreClass` (after line 51):

```typescript
  customSort(event: SortEvent): void {
    const data = event.data;
    if (!data || !event.field) return;
    const field = event.field;
    const order = event.order ?? 1;
    const isRoleColumn = field !== 'name' && !this.basicColumns.some(c => c.field === field);

    data.sort((a, b) => {
      const v1 = isRoleColumn
        ? this.getRoleScore(a as Player, field)
        : (a as Record<string, unknown>)[field];
      const v2 = isRoleColumn
        ? this.getRoleScore(b as Player, field)
        : (b as Record<string, unknown>)[field];

      const v1Null = v1 === null || v1 === undefined;
      const v2Null = v2 === null || v2 === undefined;
      if (v1Null && v2Null) return 0;
      if (v1Null) return 1;
      if (v2Null) return -1;

      let cmp: number;
      if (typeof v1 === 'string' && typeof v2 === 'string') {
        cmp = v1.localeCompare(v2);
      } else {
        const n1 = v1 as number;
        const n2 = v2 as number;
        cmp = n1 < n2 ? -1 : n1 > n2 ? 1 : 0;
      }
      return cmp * order;
    });
  }
```

Notes:
- The method must be **public** (no `private`/`protected`) — it's bound from the template via `(sortFunction)="customSort($event)"`, and Angular templates can only access public class members.
- Nulls always go to the bottom regardless of `order` (the spec requires this in both directions).
- `Array.prototype.sort` is stable in modern V8/all current browsers, so equal-comparator returns preserve insertion order — that satisfies the "stable no-op" requirement when all values are null.

- [ ] **Step 4: Run the spec and confirm all customSort tests pass**

```bash
npm test -- --run player-table.component.spec
```
Expected: all 10 `PlayerTableComponent` tests pass.

- [ ] **Step 5: Commit**

```bash
git add fm-stats-angular/src/app/components/player-table/player-table.component.ts fm-stats-angular/src/app/components/player-table/player-table.component.spec.ts
git commit -m "feat(player-table): add customSort handler with null-bottom for role columns"
```

---

## Task 4: Wire `customSort` into the template and add sort icons to role headers

**Files:**
- Modify: `fm-stats-angular/src/app/components/player-table/player-table.component.html:19-27`
- Modify: `fm-stats-angular/src/app/components/player-table/player-table.component.html:38-40`

- [ ] **Step 1: Wire up `[customSort]` and `(sortFunction)` on `<p-table>`**

Edit `fm-stats-angular/src/app/components/player-table/player-table.component.html`. Replace the `<p-table>` opening tag (lines 19-27):

```html
    <p-table
      [value]="players()"
      sortMode="single"
      [customSort]="true"
      (sortFunction)="customSort($event)"
      [scrollable]="true"
      scrollHeight="calc(100vh - var(--header-height) - 80px)"
      [virtualScroll]="true"
      [virtualScrollItemSize]="48"
      styleClass="p-datatable-sm p-datatable-gridlines"
    >
```

- [ ] **Step 2: Add `<p-sortIcon>` to role column headers**

In the same file, replace the role-column header `@for` block at lines 38-40:

```html
          @for (role of roleColumns(); track role.shortRoleName) {
            <th [pSortableColumn]="role.shortRoleName">
              {{ role.shortRoleName }} <p-sortIcon [field]="role.shortRoleName" />
            </th>
          }
```

- [ ] **Step 3: Re-run the player-table spec to confirm nothing regressed**

```bash
npm test -- --run player-table.component.spec
```
Expected: all 10 tests pass (the customSort method tests still hold; the existing 3 component-render tests still pass).

- [ ] **Step 4: Run the full Angular test suite**

```bash
npm test -- --run
```
Expected: all suites green.

- [ ] **Step 5: Commit**

```bash
git add fm-stats-angular/src/app/components/player-table/player-table.component.html
git commit -m "feat(player-table): show sort icons on role columns and route sort through customSort"
```

---

## Verification

Manual end-to-end check (run `npm start` from `fm-stats-angular/`, plus the API per the usual project workflow, and visit `/players`):

1. **Empty selection after upload:** From `/upload`, upload `TestData/squad-export.html`. Navigate to `/players`. Confirm zero role columns appear and every checkbox in the role-filter drawer is unchecked.
2. **Persistence across refresh:** Open the role-filter drawer, tick `ST` and `CM`. Reload the page. Confirm `ST` and `CM` columns are still visible and still checked in the drawer.
3. **Reset on re-upload:** Navigate back to `/upload`, upload the same file again, return to `/players`. Confirm role columns are gone and checkboxes are unchecked.
4. **Sort ascending:** Tick a role column (e.g. `ST`). Click its header. Confirm an up-arrow appears and rows are ordered by `ST` score ascending. Players with no `ST` score (e.g. goalkeepers) should appear at the bottom.
5. **Sort descending:** Click the same `ST` header again. Confirm the arrow flips to down and rows are ordered descending — but players without an `ST` score remain at the bottom.
6. **Single-column reset:** Click a different role header (e.g. `CM`). Confirm the previous column's sort indicator clears and the table re-sorts by `CM`.
7. **Basic columns still work:** Click `Age` header. Confirm basic-column sorting still functions normally (this guards the regression risk from `[customSort]="true"` taking over all sorting).

Test command:

```bash
cd fm-stats-angular
npm test -- --run
```
Expected: all suites pass, including the updated `PlayerService` tests (Task 1+2) and new `PlayerTableComponent.customSort` tests (Task 3).

---

## Acceptance Criteria Mapping

| Spec acceptance criterion | Covered by |
| --- | --- |
| After upload, no role columns / checkboxes unchecked | Task 1 (`setPlayers` → empty Set), verification step 1 |
| Selecting roles in filter shows columns | Existing behavior, verification step 4 |
| Refresh retains user selection | Task 2 (rehydration test), verification step 2 |
| New upload resets selection | Task 1 + Task 2 wipe test, verification step 3 |
| Click role header → sort ascending | Task 3 + Task 4, customSort ascending tests, verification step 4 |
| Click again → descending | Task 3 + Task 4, customSort descending tests, verification step 5 |
| Click different header → reset to that column | PrimeNG `sortMode="single"` (existing), verification step 6 |
| Null role scores at bottom in both directions | Task 3 null-bottom tests, verification steps 4–5 |
| Sort icon visible on role headers | Task 4 (`<p-sortIcon>`), verification step 4 |

---

## Cleanup (after merge)

- Move `_specs/player-table-role-sort-and-state.md` → `_specs/archive/`
- Move `_plans/player-table-role-sort-and-state.md` → `_plans/archive/`
- Per CLAUDE.md, the code becomes the source of truth.
