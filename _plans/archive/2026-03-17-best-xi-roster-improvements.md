# Best XI Roster Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the Best XI roster panel with search/filter, player grouping (marked first), a Positions column, sortable Name/Position headers, and minor UI cleanup.

**Architecture:** All changes are self-contained in `BestElevenComponent`. Three Angular signals (`searchQuery`, `sortColumn`, `sortDirection`) drive a `rosterPlayers` computed that filters, groups, and sorts the player list. The template iterates `rosterPlayers()` instead of `players()`. No new files needed.

**Tech Stack:** Angular 19 signals, PrimeNG (ButtonModule, InputTextModule), Vitest

---

## File Map

| File | Change |
|------|--------|
| `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.ts` | Add signals, computed, methods |
| `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html` | Search input, positions column, sort headers, button renames |
| `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.scss` | Roster panel width, search styles, header styles, position cell |
| `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts` | New tests for all new behaviour |

---

## Task 1: Rename "Mark All" → "Reset"

The "Mark All" button resets all unmarked players back to the default (included in calculation) state. Rename label and fix the existing test that asserts the text.

**Files:**
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts`
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html`

- [ ] **Step 1: Update the failing test — change label assertion**

  In `best-eleven.component.spec.ts`, update the test `'Mark All button is disabled when all players are already marked'`:

  ```typescript
  it('Reset button is disabled when all players are already marked', () => {
    playersSubject.next(make11Players());
    rolesSignal.set(makeRoles());
    fixture.detectChanges();

    const btn = element.querySelector('.mark-all-btn') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.disabled).toBe(true);
    expect(btn.textContent?.trim()).toContain('Reset');
  });
  ```

- [ ] **Step 2: Run test to verify it fails**

  Run: `cd fm-stats-angular && npx vitest run src/app/components/best-eleven/best-eleven.component.spec.ts`
  Expected: FAIL — label text does not match "Reset"

- [ ] **Step 3: Update the template label**

  In `best-eleven.component.html`, find the `.mark-all-btn` button and change `label="Mark All"` to `label="Reset"`:

  ```html
  <button
    pButton
    class="mark-all-btn"
    label="Reset"
    severity="secondary"
    [disabled]="allMarked()"
    (click)="markAll()"
  ></button>
  ```

- [ ] **Step 4: Run test to verify it passes**

  Run: `cd fm-stats-angular && npx vitest run src/app/components/best-eleven/best-eleven.component.spec.ts`
  Expected: PASS

- [ ] **Step 5: Commit**

  ```bash
  git add fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts
  git commit -m "feat: rename Mark All button to Reset in Best XI roster panel"
  ```

---

## Task 2: Subtle "Unmark" Button Styling

The "Unmark" button (when a player IS marked) should be visually muted. Using PrimeNG's `[text]="true"` makes it text-only (no border/background). The "Mark" button (when a player is NOT marked) keeps the secondary style. We use a custom CSS class `unmark-mode` to express this in tests (more reliable than asserting PrimeNG-internal classes in JSDOM).

**Files:**
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts`
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html`

- [ ] **Step 1: Write the failing test**

  In `best-eleven.component.spec.ts`, add inside `describe('BestElevenComponent', ...)`:

  ```typescript
  it('Unmark button has unmark-mode class when player is marked', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    const firstRow = element.querySelector('.player-row') as HTMLElement;
    const btn = firstRow.querySelector('.toggle-mark-btn') as HTMLElement;
    expect(btn.classList.contains('unmark-mode')).toBe(true);
  });

  it('Mark button does not have unmark-mode class when player is unmarked', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.toggleMark(1); // unmark player 1
    fixture.detectChanges();

    const firstRow = element.querySelector('.player-row') as HTMLElement;
    const btn = firstRow.querySelector('.toggle-mark-btn') as HTMLElement;
    expect(btn.classList.contains('unmark-mode')).toBe(false);
  });
  ```

- [ ] **Step 2: Run tests to verify they fail**

  Run: `cd fm-stats-angular && npx vitest run src/app/components/best-eleven/best-eleven.component.spec.ts`
  Expected: FAIL — `unmark-mode` class not present

- [ ] **Step 3: Update the toggle button in the template**

  In `best-eleven.component.html`, update the `.toggle-mark-btn`:

  ```html
  <button
    pButton
    class="toggle-mark-btn"
    [class.unmark-mode]="markedPlayerUids().has(player.uid)"
    [label]="markedPlayerUids().has(player.uid) ? 'Unmark' : 'Mark'"
    severity="secondary"
    [text]="markedPlayerUids().has(player.uid)"
    size="small"
    (click)="toggleMark(player.uid)"
  ></button>
  ```

- [ ] **Step 4: Run tests to verify they pass**

  Run: `cd fm-stats-angular && npx vitest run src/app/components/best-eleven/best-eleven.component.spec.ts`
  Expected: PASS

- [ ] **Step 5: Commit**

  ```bash
  git add fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts
  git commit -m "feat: make Unmark button text-only for visual subtlety"
  ```

---

## Task 3: Player Grouping + Search Filter

Add a `searchQuery` signal and a `rosterPlayers` computed that:
1. Filters players by name (case-insensitive, real-time)
2. Groups: marked players first, unmarked players at the bottom

The template iterates `rosterPlayers()` instead of `players()`.

**Files:**
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts`
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.ts`
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html`
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.scss`

- [ ] **Step 1: Write the failing tests**

  Add these tests inside `describe('BestElevenComponent', ...)` in the spec file:

  ```typescript
  // ── Task 3: Grouping + Search ─────────────────────────────────────────────

  it('marked players appear before unmarked players in the roster list', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    // Unmark players 1 and 2 (first two)
    component.toggleMark(1);
    component.toggleMark(2);
    fixture.detectChanges();

    const rows = Array.from(element.querySelectorAll('.player-row'));
    const unmarkedRows = rows.filter(r => r.classList.contains('unmarked'));
    const markedRows = rows.filter(r => !r.classList.contains('unmarked'));

    expect(markedRows.length).toBe(9);
    expect(unmarkedRows.length).toBe(2);

    // All unmarked rows must appear after all marked rows in DOM order
    const firstUnmarkedIndex = rows.indexOf(unmarkedRows[0]);
    const lastMarkedIndex = rows.indexOf(markedRows[markedRows.length - 1]);
    expect(firstUnmarkedIndex).toBeGreaterThan(lastMarkedIndex);
  });

  it('search filters players by partial name match (case-insensitive)', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.searchQuery.set('keeper');
    fixture.detectChanges();

    const rows = element.querySelectorAll('.player-row');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Keeper');
  });

  it('search shows no results message when query matches nothing', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.searchQuery.set('zzznomatch');
    fixture.detectChanges();

    const rows = element.querySelectorAll('.player-row');
    expect(rows.length).toBe(0);

    const msg = element.querySelector('.roster-empty-message');
    expect(msg).toBeTruthy();
    expect(msg!.textContent).toContain('No players found');
  });

  it('search results with unmarked player remain grouped at the bottom', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    // Unmark Keeper (uid=1)
    component.toggleMark(1);
    // 'striker' matches Striker 1 (uid=10) and Striker 2 (uid=11) — both marked
    component.searchQuery.set('striker');
    fixture.detectChanges();

    // 'striker' does not match Keeper — only the 2 marked Strikers are visible
    const rows = Array.from(element.querySelectorAll('.player-row'));
    expect(rows.length).toBe(2);
    expect(rows.every(r => !r.classList.contains('unmarked'))).toBe(true);
  });

  it('search with unmarked match keeps it at the bottom', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.toggleMark(1); // unmark Keeper
    component.searchQuery.set('keeper');
    fixture.detectChanges();

    const rows = Array.from(element.querySelectorAll('.player-row'));
    expect(rows.length).toBe(1);
    expect(rows[0].classList.contains('unmarked')).toBe(true);
  });
  ```

- [ ] **Step 2: Run tests to verify they fail**

  Run: `cd fm-stats-angular && npx vitest run src/app/components/best-eleven/best-eleven.component.spec.ts`
  Expected: FAIL — `searchQuery` not defined, grouping not implemented

- [ ] **Step 3: Add signals and computed to the component**

  In `best-eleven.component.ts`, add after `positionRestriction = signal(false);`:

  ```typescript
  searchQuery = signal('');
  sortColumn = signal<'name' | 'position' | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');
  ```

  Add this computed after `availableRolesForSlot`:

  ```typescript
  protected rosterPlayers = computed(() => {
    const allPlayers = this.players();
    const marked = this.markedPlayerUids();
    const query = this.searchQuery().toLowerCase().trim();
    const col = this.sortColumn();
    const dir = this.sortDirection();

    const filtered = query
      ? allPlayers.filter(p => p.name.toLowerCase().includes(query))
      : allPlayers;

    const markedGroup = filtered.filter(p => marked.has(p.uid));
    const unmarkedGroup = filtered.filter(p => !marked.has(p.uid));

    const sortFn = (a: Player, b: Player): number => {
      if (col === 'name') {
        const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        return dir === 'asc' ? cmp : -cmp;
      }
      if (col === 'position') {
        const cmp = this.comparePositions(a.position, b.position);
        return dir === 'asc' ? cmp : -cmp;
      }
      return 0;
    };

    return [...markedGroup.sort(sortFn), ...unmarkedGroup.sort(sortFn)];
  });
  ```

  Add these private helpers inside the class:

  ```typescript
  private readonly POSITION_GROUP_ORDER: Record<string, number> = {
    GK: 0, WB: 1, D: 2, DM: 3, M: 4, AM: 5, ST: 6, F: 7,
  };

  private getPositionOrder(position: string): number {
    const firstPos = position.split(',')[0].trim();
    const prefix = firstPos.split(' ')[0];
    return this.POSITION_GROUP_ORDER[prefix] ?? 99;
  }

  private comparePositions(a: string, b: string): number {
    const orderA = this.getPositionOrder(a);
    const orderB = this.getPositionOrder(b);
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  toggleSort(col: 'name' | 'position'): void {
    if (this.sortColumn() === col) {
      this.sortDirection.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    }
  }
  ```

  Add `InputTextModule` to imports in the `@Component` decorator:

  ```typescript
  import { InputTextModule } from 'primeng/inputtext';
  // ...
  imports: [CommonModule, FormsModule, ButtonModule, ToggleSwitchModule, InputTextModule, RolePickerModalComponent, PlayerPickerModalComponent],
  ```

- [ ] **Step 4: Update the roster panel template to use rosterPlayers and add search**

  Replace the `<div class="roster-panel">` block in `best-eleven.component.html` with:

  ```html
  @if (players().length > 0) {
    <div class="roster-panel">
      <h3 class="roster-heading">Squad</h3>
      <button
        pButton
        class="mark-all-btn"
        label="Reset"
        severity="secondary"
        [disabled]="allMarked()"
        (click)="markAll()"
      ></button>
      <input
        pInputText
        type="text"
        class="roster-search"
        placeholder="Search players..."
        (input)="onSearchInput($event)"
      />
      <div class="roster-list">
        @for (player of rosterPlayers(); track player.uid) {
          <div class="player-row" [class.unmarked]="!markedPlayerUids().has(player.uid)">
            <span class="player-row-name">{{ player.name }}</span>
            <button
              pButton
              class="toggle-mark-btn"
              [class.unmark-mode]="markedPlayerUids().has(player.uid)"
              [label]="markedPlayerUids().has(player.uid) ? 'Unmark' : 'Mark'"
              severity="secondary"
              [text]="markedPlayerUids().has(player.uid)"
              size="small"
              (click)="toggleMark(player.uid)"
            ></button>
          </div>
        }
        @if (rosterPlayers().length === 0) {
          <p class="roster-empty-message">No players found</p>
        }
      </div>
    </div>
  }
  ```

- [ ] **Step 5: Add search input SCSS**

  In `best-eleven.component.scss`, add after `.mark-all-btn`:

  ```scss
  .roster-search {
    width: 100%;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }

  .roster-empty-message {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    text-align: center;
    padding: 0.75rem 0;
  }
  ```

  Also update the existing `@media (max-width: 900px)` block to add:

  ```scss
  @media (max-width: 900px) {
    .page-layout {
      flex-direction: column;
    }

    .roster-panel {
      width: 100%;
    }

    .roster-search {
      font-size: 0.8125rem;
    }
  }
  ```

- [ ] **Step 6: Run tests to verify they pass**

  Run: `cd fm-stats-angular && npx vitest run src/app/components/best-eleven/best-eleven.component.spec.ts`
  Expected: All PASS

- [ ] **Step 7: Commit**

  ```bash
  git add fm-stats-angular/src/app/components/best-eleven/
  git commit -m "feat: add search filter and marked-first grouping to Best XI roster panel"
  ```

---

## Task 4: Positions Column

Add a `player-row-position` span to each player row showing `player.position`. Expand the roster panel to accommodate it.

**Files:**
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts`
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html`
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.scss`

- [ ] **Step 1: Write failing tests**

  Add inside `describe('BestElevenComponent', ...)`:

  ```typescript
  // ── Task 4: Positions column ──────────────────────────────────────────────

  it('displays player position in each roster row', () => {
    const players = make11PlayersWithPositions(); // already defined in the spec
    playersSubject.next(players);
    fixture.detectChanges();

    const positionCells = element.querySelectorAll('.player-row-position');
    expect(positionCells.length).toBe(11);
    expect(positionCells[0].textContent?.trim()).toBe('GK');
  });

  it('shows empty position cell when player has no position data', () => {
    playersSubject.next(make11Players()); // position='' for all
    fixture.detectChanges();

    const positionCells = element.querySelectorAll('.player-row-position');
    expect(positionCells.length).toBe(11);
    positionCells.forEach(cell => expect(cell.textContent?.trim()).toBe(''));
  });
  ```

- [ ] **Step 2: Run tests to verify they fail**

  Run: `cd fm-stats-angular && npx vitest run src/app/components/best-eleven/best-eleven.component.spec.ts`
  Expected: FAIL — `.player-row-position` not found

- [ ] **Step 3: Add position span to the template**

  Update the `player-row` div in `best-eleven.component.html` to include the position:

  ```html
  <div class="player-row" [class.unmarked]="!markedPlayerUids().has(player.uid)">
    <span class="player-row-name">{{ player.name }}</span>
    <span class="player-row-position">{{ player.position }}</span>
    <button
      pButton
      class="toggle-mark-btn"
      [class.unmark-mode]="markedPlayerUids().has(player.uid)"
      [label]="markedPlayerUids().has(player.uid) ? 'Unmark' : 'Mark'"
      severity="secondary"
      [text]="markedPlayerUids().has(player.uid)"
      size="small"
      (click)="toggleMark(player.uid)"
    ></button>
  </div>
  ```

- [ ] **Step 4: Update SCSS for the positions column and wider panel**

  In `best-eleven.component.scss`:

  1. Change `.roster-panel` width from `260px` to `320px`
  2. Add `.player-row-position` style after `.player-row-name`:

  ```scss
  .roster-panel {
    width: 320px;  // was 260px
    // ... rest unchanged
  }

  .player-row-position {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    white-space: nowrap;
    min-width: 60px;
    text-align: center;
    margin-right: 0.5rem;
    flex-shrink: 0;
  }
  ```

  Also extend the existing `@media (max-width: 600px)` block with position column adjustments:

  ```scss
  @media (max-width: 600px) {
    // ... existing slot-card / formation-row rules ...

    .player-row-position {
      font-size: 0.7rem;
      min-width: 44px;
    }
  }
  ```

- [ ] **Step 5: Run tests to verify they pass**

  Run: `cd fm-stats-angular && npx vitest run src/app/components/best-eleven/best-eleven.component.spec.ts`
  Expected: All PASS

- [ ] **Step 6: Commit**

  ```bash
  git add fm-stats-angular/src/app/components/best-eleven/
  git commit -m "feat: add Positions column to Best XI roster panel"
  ```

---

## Task 5: Sortable Name and Position Column Headers

Add clickable column headers above the roster list for Name and Position. Clicking toggles asc/desc. Sort indicator (↑/↓) shows current direction. Unmarked players always remain at the bottom of their group.

**Files:**
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts`
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html`
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.scss`

(The `toggleSort`, `sortColumn`, `sortDirection` signals and `rosterPlayers` computed were already added in Task 3.)

- [ ] **Step 1: Write failing tests**

  Add inside `describe('BestElevenComponent', ...)`:

  ```typescript
  // ── Task 5: Sortable columns ──────────────────────────────────────────────

  it('clicking Name header sorts players by name ascending', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    const nameHeader = element.querySelector('.sort-header-name') as HTMLElement;
    nameHeader.click();
    fixture.detectChanges();

    expect(component.sortColumn()).toBe('name');
    expect(component.sortDirection()).toBe('asc');

    const rows = element.querySelectorAll('.player-row');
    const names = Array.from(rows)
      .filter(r => !r.classList.contains('unmarked'))
      .map(r => r.querySelector('.player-row-name')!.textContent!.trim());
    const sorted = [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    expect(names).toEqual(sorted);
  });

  it('clicking Name header twice sorts players by name descending', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    const nameHeader = element.querySelector('.sort-header-name') as HTMLElement;
    nameHeader.click();
    nameHeader.click();
    fixture.detectChanges();

    expect(component.sortColumn()).toBe('name');
    expect(component.sortDirection()).toBe('desc');
  });

  it('clicking Position header sorts players by position in formation order', () => {
    const players = make11PlayersWithPositions();
    playersSubject.next(players);
    fixture.detectChanges();

    const posHeader = element.querySelector('.sort-header-position') as HTMLElement;
    posHeader.click();
    fixture.detectChanges();

    expect(component.sortColumn()).toBe('position');
    expect(component.sortDirection()).toBe('asc');

    const rows = element.querySelectorAll('.player-row');
    const positions = Array.from(rows).map(r =>
      r.querySelector('.player-row-position')!.textContent!.trim()
    );
    // GK must come before D (L) which comes before M (C)
    const gkIndex = positions.indexOf('GK');
    const dlIndex = positions.indexOf('D (L)');
    const mcIndex = positions.indexOf('M (C)');
    expect(gkIndex).toBeLessThan(dlIndex);
    expect(dlIndex).toBeLessThan(mcIndex);
  });

  it('unmarked players remain at the bottom when sorting by Name', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.toggleMark(7); // unmark Centre Mid 1
    const nameHeader = element.querySelector('.sort-header-name') as HTMLElement;
    nameHeader.click();
    fixture.detectChanges();

    const rows = Array.from(element.querySelectorAll('.player-row'));
    const unmarkedRows = rows.filter(r => r.classList.contains('unmarked'));
    const markedRows = rows.filter(r => !r.classList.contains('unmarked'));

    const firstUnmarkedIndex = rows.indexOf(unmarkedRows[0]);
    const lastMarkedIndex = rows.indexOf(markedRows[markedRows.length - 1]);
    expect(firstUnmarkedIndex).toBeGreaterThan(lastMarkedIndex);
  });

  it('sort indicator shows ↑ when sort is ascending', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    const nameHeader = element.querySelector('.sort-header-name') as HTMLElement;
    nameHeader.click();
    fixture.detectChanges();

    expect(nameHeader.textContent).toContain('↑');
  });

  it('sort indicator shows ↓ when sort is descending', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    const nameHeader = element.querySelector('.sort-header-name') as HTMLElement;
    nameHeader.click();
    nameHeader.click();
    fixture.detectChanges();

    expect(nameHeader.textContent).toContain('↓');
  });

  it('switching to a different sort column resets direction to ascending', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    const nameHeader = element.querySelector('.sort-header-name') as HTMLElement;
    const posHeader = element.querySelector('.sort-header-position') as HTMLElement;

    nameHeader.click(); // name asc
    nameHeader.click(); // name desc
    expect(component.sortDirection()).toBe('desc');

    posHeader.click(); // switch to position — should reset to asc
    fixture.detectChanges();

    expect(component.sortColumn()).toBe('position');
    expect(component.sortDirection()).toBe('asc');
  });

  it('sorting applies within filtered search results', () => {
    playersSubject.next(make11Players());
    fixture.detectChanges();

    component.searchQuery.set('back'); // Left Back, Right Back, Centre Back 1, Centre Back 2
    fixture.detectChanges();

    const nameHeader = element.querySelector('.sort-header-name') as HTMLElement;
    nameHeader.click();
    fixture.detectChanges();

    const rows = element.querySelectorAll('.player-row');
    const names = Array.from(rows).map(r =>
      r.querySelector('.player-row-name')!.textContent!.trim()
    );
    const sorted = [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    expect(names).toEqual(sorted);
  });
  ```

- [ ] **Step 2: Run tests to verify they fail**

  Run: `cd fm-stats-angular && npx vitest run src/app/components/best-eleven/best-eleven.component.spec.ts`
  Expected: FAIL — `.sort-header-name` and `.sort-header-position` elements not found

- [ ] **Step 3: Add column headers to the template**

  In `best-eleven.component.html`, add a `<div class="roster-column-headers">` row just before `<div class="roster-list">`:

  ```html
  <div class="roster-column-headers">
    <span
      class="sort-header sort-header-name"
      [class.active]="sortColumn() === 'name'"
      (click)="toggleSort('name')"
    >
      Name
      @if (sortColumn() === 'name') {
        {{ sortDirection() === 'asc' ? '↑' : '↓' }}
      }
    </span>
    <span
      class="sort-header sort-header-position"
      [class.active]="sortColumn() === 'position'"
      (click)="toggleSort('position')"
    >
      Position
      @if (sortColumn() === 'position') {
        {{ sortDirection() === 'asc' ? '↑' : '↓' }}
      }
    </span>
  </div>
  ```

- [ ] **Step 4: Add column header SCSS**

  In `best-eleven.component.scss`, add after `.roster-search`:

  ```scss
  .roster-column-headers {
    display: flex;
    align-items: center;
    padding: 0 0 0.5rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 0.25rem;
    gap: 0.5rem;
  }

  .sort-header {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
    user-select: none;

    &:first-child {
      flex: 1;
    }

    &:nth-child(2) {
      min-width: 60px;
      text-align: center;
    }

    &.active {
      color: var(--color-text-primary);
    }

    &:hover {
      color: var(--color-text-primary);
    }
  }
  ```

  Also extend the existing `@media (max-width: 600px)` block with column header adjustments:

  ```scss
  @media (max-width: 600px) {
    // ... existing rules ...

    .sort-header {
      font-size: 0.6875rem;
      letter-spacing: 0.02em;
    }

    .roster-column-headers {
      gap: 0.25rem;
    }
  }
  ```

- [ ] **Step 5: Run tests to verify they pass**

  Run: `cd fm-stats-angular && npx vitest run src/app/components/best-eleven/best-eleven.component.spec.ts`
  Expected: All PASS

- [ ] **Step 6: Run the full test suite**

  Run: `cd fm-stats-angular && npx vitest run`
  Expected: All tests pass (no regressions)

- [ ] **Step 7: Commit**

  ```bash
  git add fm-stats-angular/src/app/components/best-eleven/
  git commit -m "feat: add sortable Name/Position column headers to Best XI roster panel"
  ```

---

## Acceptance Criteria Checklist

After all tasks complete, verify against the spec:

- [ ] "Mark All" → "Reset" label visible in roster panel heading
- [ ] Unmark button is visually subtle (text-only, no background)
- [ ] Marked players appear first; unmarked players pinned at bottom
- [ ] Search input present, filters in real-time (case-insensitive)
- [ ] "No players found" message shown when search matches nothing
- [ ] Positions column present in every player row
- [ ] Clicking Name or Position headers toggles sort asc↔desc
- [ ] Sort direction shown with ↑/↓ indicator; active header is bolder
- [ ] Unmarked players remain at bottom even when sorting
- [ ] Search + sort work together while maintaining grouping
- [ ] Layout functional on mobile (roster panel width 100%, search stacks above)
