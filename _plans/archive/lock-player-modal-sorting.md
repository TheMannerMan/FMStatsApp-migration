# Lock Player Modal Sorting Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clickable sort headers (Name, Position, Rating) to `PlayerPickerModalComponent` so users can sort the player list instead of scanning unsorted results.

**Architecture:** Add `sortColumn` and `sortDirection` signals to the component; extend the existing `filteredPlayers` computed to apply sorting after filtering; add a sort-header row to the template that aligns visually with the player-list columns. No new files needed — all changes live in the existing component trio (`.ts`, `.html`, `.scss`) and the existing spec file.

**Tech Stack:** Angular 19 signals, Vitest + Jasmine syntax, PrimeNG dialog

---

## File Map

| File | Change |
|------|--------|
| `fm-stats-angular/src/app/components/player-picker-modal/player-picker-modal.component.ts` | Add sort signals, update `filteredPlayers` computed, add `setSortColumn()` method |
| `fm-stats-angular/src/app/components/player-picker-modal/player-picker-modal.component.html` | Add sort-header row above player list |
| `fm-stats-angular/src/app/components/player-picker-modal/player-picker-modal.component.scss` | Add styles for sort-header, sort-btn, sort-arrow |
| `fm-stats-angular/src/app/components/player-picker-modal/player-picker-modal.component.spec.ts` | Add sorting test cases |

---

## Chunk 1: Tests and TypeScript implementation

### Task 1: Write failing tests for sort behaviour

**Files:**
- Modify: `fm-stats-angular/src/app/components/player-picker-modal/player-picker-modal.component.spec.ts`

- [ ] **Step 1: Append the sort describe-block to the spec file**

Add the following block after the last existing `it(...)` (before the closing `});` of the outer `describe`):

```typescript
// ── Sorting ──────────────────────────────────────────────────────────────

describe('sorting', () => {
  const alpha = makePlayer(1, 'Alice', 'GK', [{ shortRoleName: 'SK', roleScore: 9 }]);
  const beta  = makePlayer(2, 'Bob',   'DC', [{ shortRoleName: 'SK', roleScore: 6 }]);
  const gamma = makePlayer(3, 'Charlie', 'AM', [{ shortRoleName: 'SK', roleScore: 7.5 }]);

  beforeEach(() => {
    // Provide in reverse alphabetical order to confirm sorting is applied
    component.players = [gamma, beta, alpha];
    fixture.detectChanges();
  });

  it('default sort is Name ascending (A→Z)', () => {
    const names = component.filteredPlayers().map(p => p.name);
    expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('Name descending sorts Z→A', () => {
    component.setSortColumn('name'); // toggle: asc → desc
    const names = component.filteredPlayers().map(p => p.name);
    expect(names).toEqual(['Charlie', 'Bob', 'Alice']);
  });

  it('Position ascending sorts A→Z by position string', () => {
    component.setSortColumn('position');
    const positions = component.filteredPlayers().map(p => p.position);
    expect(positions).toEqual(['AM', 'DC', 'GK']);
  });

  it('Position descending sorts Z→A by position string', () => {
    component.setSortColumn('position');
    component.setSortColumn('position'); // toggle: asc → desc
    const positions = component.filteredPlayers().map(p => p.position);
    expect(positions).toEqual(['GK', 'DC', 'AM']);
  });

  it('Rating descending (default) puts highest score first', () => {
    component.selectedRole = 'SK';
    component.setSortColumn('rating');
    const scores = component.filteredPlayers().map(p => component.getScore(p));
    expect(scores).toEqual([9, 7.5, 6]);
  });

  it('Rating ascending puts lowest score first', () => {
    component.selectedRole = 'SK';
    component.setSortColumn('rating');
    component.setSortColumn('rating'); // toggle: desc → asc
    const scores = component.filteredPlayers().map(p => component.getScore(p));
    expect(scores).toEqual([6, 7.5, 9]);
  });

  it('clicking Rating when selectedRole is null does not change sort state', () => {
    component.selectedRole = null;
    component.setSortColumn('rating');
    expect(component.sortColumn()).toBe('name');
    expect(component.sortDirection()).toBe('asc');
  });

  it('search filter combined with active sort: returns only matching players in sorted order', () => {
    component.searchTerm.set('a'); // matches Alice, Charlie
    const names = component.filteredPlayers().map(p => p.name);
    expect(names).toEqual(['Alice', 'Charlie']);
  });

  it('toggling the active column cycles asc → desc → asc', () => {
    expect(component.sortDirection()).toBe('asc');
    component.setSortColumn('name');
    expect(component.sortDirection()).toBe('desc');
    component.setSortColumn('name');
    expect(component.sortDirection()).toBe('asc');
  });

  it('switching to a new column resets direction to default (asc for Name/Position)', () => {
    component.setSortColumn('name'); // now desc
    component.setSortColumn('position'); // new column → resets to asc
    expect(component.sortColumn()).toBe('position');
    expect(component.sortDirection()).toBe('asc');
  });

  it('switching to Rating column defaults to descending', () => {
    component.selectedRole = 'SK';
    component.setSortColumn('rating');
    expect(component.sortColumn()).toBe('rating');
    expect(component.sortDirection()).toBe('desc');
  });

  it('players with equal position fall back to Name ascending as stable tiebreak', () => {
    component.players = [
      makePlayer(10, 'Zara', 'DC', []),
      makePlayer(11, 'Anna', 'DC', []),
    ];
    component.setSortColumn('position');
    const names = component.filteredPlayers().map(p => p.name);
    expect(names).toEqual(['Anna', 'Zara']);
  });
});
```

- [ ] **Step 2: Run tests to confirm new tests fail**

```bash
cd fm-stats-angular && npx ng test --watch=false 2>&1 | tail -30
```

Expected: new sorting tests fail with `TypeError: component.setSortColumn is not a function` and `sortColumn is not a property`.

---

### Task 2: Implement sort state and sorted filteredPlayers

**Files:**
- Modify: `fm-stats-angular/src/app/components/player-picker-modal/player-picker-modal.component.ts`

- [ ] **Step 3: Replace the TypeScript file content**

Replace the full file with:

```typescript
import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Player } from '../../models/player.model';
import { getPlayerRoleScore } from '../../utils/score-matrix';

export type SortColumn = 'name' | 'position' | 'rating';
export type SortDirection = 'asc' | 'desc';

function normalizeForSearch(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

@Component({
  selector: 'app-player-picker-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './player-picker-modal.component.html',
  styleUrl: './player-picker-modal.component.scss',
})
export class PlayerPickerModalComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() selectedRole: string | null = null;
  @Input() selectedPlayerUid: number | null = null;
  @Output() playerSelected = new EventEmitter<number | null>();

  private _players = signal<Player[]>([]);

  @Input() set players(val: Player[]) {
    this._players.set(val);
  }
  get players(): Player[] {
    return this._players();
  }

  searchTerm = signal('');
  sortColumn = signal<SortColumn>('name');
  sortDirection = signal<SortDirection>('asc');

  protected hasPlayers = computed(() => this._players().length > 0);

  filteredPlayers = computed(() => {
    const term = normalizeForSearch(this.searchTerm());
    let players = this._players();
    if (term) {
      players = players.filter(p => normalizeForSearch(p.name).includes(term));
    }

    const col = this.sortColumn();
    const dir = this.sortDirection();

    return [...players].sort((a, b) => {
      let cmp = 0;
      if (col === 'name') {
        cmp = normalizeForSearch(a.name).localeCompare(normalizeForSearch(b.name));
      } else if (col === 'position') {
        cmp = a.position.toLowerCase().localeCompare(b.position.toLowerCase());
      } else {
        // rating
        cmp = this.getScore(a) - this.getScore(b);
      }
      // Stable tiebreak: fallback to name ascending
      if (cmp === 0 && col !== 'name') {
        cmp = normalizeForSearch(a.name).localeCompare(normalizeForSearch(b.name));
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  getScore(player: Player): number {
    if (!this.selectedRole) return 0;
    return getPlayerRoleScore(player, this.selectedRole);
  }

  setSortColumn(col: SortColumn): void {
    if (col === 'rating' && !this.selectedRole) return;
    if (this.sortColumn() === col) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set(col === 'rating' ? 'desc' : 'asc');
    }
  }

  selectPlayer(uid: number): void {
    this.playerSelected.emit(uid);
    this.visibleChange.emit(false);
  }

  clearLock(): void {
    this.playerSelected.emit(null);
    this.visibleChange.emit(false);
  }

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onDialogHide(): void {
    this.visibleChange.emit(false);
    this.searchTerm.set('');
    // Sort state intentionally NOT reset — persists across open/close per spec
  }
}
```

- [ ] **Step 4: Run tests — sorting tests should now pass**

```bash
cd fm-stats-angular && npx ng test --watch=false 2>&1 | tail -30
```

Expected: all tests pass (21 existing + 12 new = 33 total).

- [ ] **Step 5: Commit**

```bash
cd fm-stats-angular && git add src/app/components/player-picker-modal/player-picker-modal.component.ts src/app/components/player-picker-modal/player-picker-modal.component.spec.ts
git commit -m "feat: add sort state and sorted filteredPlayers to PlayerPickerModalComponent"
```

---

## Chunk 2: Template and styles

### Task 3: Add sort header to HTML template

**Files:**
- Modify: `fm-stats-angular/src/app/components/player-picker-modal/player-picker-modal.component.html`

- [ ] **Step 6: Replace the HTML template**

Replace the full file with:

```html
<p-dialog
  [visible]="visible"
  (visibleChange)="visibleChange.emit($event)"
  (onHide)="onDialogHide()"
  header="Lock Player"
  [modal]="true"
  [style]="{ width: '460px' }"
  [draggable]="false"
  [resizable]="false"
>
  <div class="player-picker-content">
    <input
      class="player-search-input"
      type="text"
      placeholder="Search players…"
      [value]="searchTerm()"
      (input)="onSearchInput($event)"
      autocomplete="off"
    />

    <button
      pButton
      class="no-lock-btn"
      label="No lock"
      severity="secondary"
      (click)="clearLock()"
    ></button>

    @if (!hasPlayers()) {
      <p class="empty-state">No eligible players. Mark players in the roster panel.</p>
    } @else if (filteredPlayers().length === 0) {
      <p class="empty-state">No players found</p>
    } @else {
      <div class="sort-header">
        <button
          class="sort-btn"
          [class.sort-btn--active]="sortColumn() === 'name'"
          (click)="setSortColumn('name')"
        >
          Name
          @if (sortColumn() === 'name') {
            <span class="sort-arrow">{{ sortDirection() === 'asc' ? '▲' : '▼' }}</span>
          }
        </button>
        <div class="sort-header-right">
          <button
            class="sort-btn"
            [class.sort-btn--active]="sortColumn() === 'position'"
            (click)="setSortColumn('position')"
          >
            Pos
            @if (sortColumn() === 'position') {
              <span class="sort-arrow">{{ sortDirection() === 'asc' ? '▲' : '▼' }}</span>
            }
          </button>
          <button
            class="sort-btn"
            [class.sort-btn--active]="sortColumn() === 'rating'"
            [class.sort-btn--disabled]="!selectedRole"
            [disabled]="!selectedRole"
            (click)="setSortColumn('rating')"
          >
            Rating
            @if (sortColumn() === 'rating') {
              <span class="sort-arrow">{{ sortDirection() === 'asc' ? '▲' : '▼' }}</span>
            }
          </button>
        </div>
      </div>

      <ul class="player-list">
        @for (player of filteredPlayers(); track player.uid) {
          <li
            class="player-item"
            [class.player-item--selected]="player.uid === selectedPlayerUid"
            (click)="selectPlayer(player.uid)"
          >
            <span class="player-item-name">{{ player.name }}</span>
            <span class="player-item-meta">
              <span class="player-item-position">{{ player.position }}</span>
              @if (selectedRole) {
                <span class="player-item-score">{{ getScore(player) | number:'1.1-1' }}</span>
              }
            </span>
          </li>
        }
      </ul>
    }
  </div>
</p-dialog>
```

---

### Task 4: Add SCSS for sort header

**Files:**
- Modify: `fm-stats-angular/src/app/components/player-picker-modal/player-picker-modal.component.scss`

- [ ] **Step 7: Append sort-header styles to the SCSS file**

Append the following at the end of the file (after `.empty-state { ... }`):

```scss
.sort-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.75rem 0.25rem;
  border-bottom: 1px solid var(--color-border);
}

.sort-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  padding: 0.15rem 0.25rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  border-radius: 3px;
  transition: color 0.1s;

  &:hover:not(:disabled) {
    color: var(--color-text-primary);
  }

  &--active {
    color: var(--color-text-primary);
  }

  &--disabled,
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.sort-arrow {
  font-size: 0.65rem;
  line-height: 1;
}
```

- [ ] **Step 8: Run full test suite to verify nothing broken**

```bash
cd fm-stats-angular && npx ng test --watch=false 2>&1 | tail -30
```

Expected: all tests pass.

- [ ] **Step 9: Commit**

```bash
cd fm-stats-angular && git add src/app/components/player-picker-modal/player-picker-modal.component.html src/app/components/player-picker-modal/player-picker-modal.component.scss
git commit -m "feat: add sort header UI to lock player modal"
```

---

## Verification

After both chunks are complete:

1. **Unit tests:** `cd fm-stats-angular && npx ng test --watch=false` — all pass
2. **Manual check (optional):** Start app with `npm start`, open Best XI view, click a role slot to open Lock Player modal:
   - Default list is sorted A→Z by name with ▲ on Name header
   - Clicking Name toggles ▲/▼ and reverses order
   - Clicking Pos sorts by position; clicking again reverses
   - Rating button is greyed out when no role — clicking has no effect
   - With a role selected, Rating button is active; clicking sorts by score descending
   - Typing in search box narrows list while keeping active sort order
