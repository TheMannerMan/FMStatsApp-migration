# Plan: Best XI Selection Modal Search

## Context

The Best XI page currently uses compact `p-select` dropdowns for role and player selection per slot. These show only short role abbreviations (e.g. "DM") and provide no search capability, making it hard to find the right role or player. This plan replaces both dropdowns with dedicated modal dialogs: a **RolePickerModal** with a live search input and full role names, and a **PlayerPickerModal** with live search, player metadata (position + role score), and a clear option. The existing `p-select` elements are removed entirely.

---

## Architecture Overview

Two new standalone components are created and used inside `BestElevenComponent`.

```
BestElevenComponent
  ├── slot-card (×11)
  │     ├── [role button]    → opens RolePickerModalComponent
  │     └── [player button]  → opens PlayerPickerModalComponent
  ├── <app-role-picker-modal>   (once, outside grid)
  └── <app-player-picker-modal> (once, outside grid)
```

State ownership: `BestElevenComponent` owns `rolePickerSlot` and `playerPickerSlot` signals that track which slot's picker is open. The modal components are stateless pickers — they receive data via `@Input()` and emit selections via `@Output()`.

---

## New Files

### `role-picker-modal.component.ts/.html/.scss/.spec.ts`
Path: `fm-stats-angular/src/app/components/role-picker-modal/`

**Inputs / Outputs:**
```typescript
@Input() visible = false
@Output() visibleChange = new EventEmitter<boolean>()
@Input() roles: RoleInfo[] = []          // flat list for slot's position
@Input() selectedRole: string | null = null  // shortRoleName
@Output() roleSelected = new EventEmitter<string | null>()
```

**Internals:**
- `searchTerm = signal('')`
- `filteredRoles = computed(...)` — filters `roles` by `roleName` (case- and accent-insensitive via `normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()`)
- "Clear selection" button at top emits `null`
- Clicking a role emits `shortRoleName` and `visibleChange.emit(false)`
- Empty state: "No roles found"
- Uses `p-dialog` (centered, `DialogModule` from `primeng/dialog`)

### `player-picker-modal.component.ts/.html/.scss/.spec.ts`
Path: `fm-stats-angular/src/app/components/player-picker-modal/`

**Inputs / Outputs:**
```typescript
@Input() visible = false
@Output() visibleChange = new EventEmitter<boolean>()
@Input() players: Player[] = []          // eligible (marked, not locked elsewhere)
@Input() selectedRole: string | null = null   // for score display
@Input() selectedPlayerUid: number | null = null
@Output() playerSelected = new EventEmitter<number | null>()
```

**Internals:**
- `searchTerm = signal('')`
- `filteredPlayers = computed(...)` — filters by player `name` (case- and accent-insensitive)
- Each player row shows: name, position, role score (`getPlayerRoleScore(player, selectedRole)` from `utils/score-matrix.ts`) — score hidden when `selectedRole` is null
- "No lock" button at top emits `null`
- Clicking a player emits `player.uid` and `visibleChange.emit(false)`
- Empty state (no eligible): "No eligible players. Mark players in the roster panel."
- Empty state (search, no match): "No players found"
- Uses `p-dialog`

---

## Modified Files

### `best-eleven.component.ts`
**Remove:** `SelectModule`, `FormsModule` imports (no longer needed for selection).
**Add:** `RolePickerModalComponent`, `PlayerPickerModalComponent` to `imports`.
**Add:** `DialogModule` only if needed by the modals (they self-import it as standalone).

**New signals:**
```typescript
rolePickerVisible = signal(false)
rolePickerSlot    = signal<number | null>(null)
playerPickerVisible = signal(false)
playerPickerSlot    = signal<number | null>(null)
```

**New computeds:**
```typescript
// Roles to show in role picker (flat list for the open slot's position)
protected rolesForPickerModal = computed(() => {
  const i = this.rolePickerSlot();
  return i !== null ? (this.availableRolesForSlot()[i] ?? []) : [];
});

// Players eligible for the open player picker slot
protected eligiblePlayersForModal = computed(() => {
  const i = this.playerPickerSlot();
  if (i === null) return [];
  const marked = this.markedPlayerUids();
  const locks = this.lockedPlayers();
  const lockedElsewhere = new Set(
    locks.map((uid, idx) => (uid !== null && idx !== i ? uid : null))
         .filter((uid): uid is number => uid !== null)
  );
  return this.players().filter(p => marked.has(p.uid) && !lockedElsewhere.has(p.uid));
});

// selectedRole for the open player picker (for score display)
protected roleForPlayerModal = computed(() => {
  const i = this.playerPickerSlot();
  return i !== null ? (this.selectedRoles()[i] ?? null) : null;
});

// Currently locked player uid for the open player picker
protected lockedPlayerUidForModal = computed(() => {
  const i = this.playerPickerSlot();
  return i !== null ? (this.lockedPlayers()[i] ?? null) : null;
});
```

**New methods:**
```typescript
protected getRoleFullName(slotIndex: number): string | null {
  const short = this.selectedRoles()[slotIndex];
  if (!short) return null;
  return this.availableRolesForSlot()[slotIndex]
    ?.find(r => r.shortRoleName === short)?.roleName ?? null;
}

protected getLockedPlayerName(slotIndex: number): string | null {
  const uid = this.lockedPlayers()[slotIndex];
  return uid !== null ? (this.players().find(p => p.uid === uid)?.name ?? null) : null;
}

protected openRolePicker(slotIndex: number): void {
  this.rolePickerSlot.set(slotIndex);
  this.rolePickerVisible.set(true);
}

protected onRolePickerSelect(shortRoleName: string | null): void {
  const i = this.rolePickerSlot();
  if (i !== null) this.onRoleChange(i, shortRoleName);
  this.rolePickerVisible.set(false);
  this.rolePickerSlot.set(null);
}

protected openPlayerPicker(slotIndex: number): void {
  this.playerPickerSlot.set(slotIndex);
  this.playerPickerVisible.set(true);
}

protected onPlayerPickerSelect(playerUid: number | null): void {
  const i = this.playerPickerSlot();
  if (i !== null) this.onLockChange(i, playerUid);
  this.playerPickerVisible.set(false);
  this.playerPickerSlot.set(null);
}
```

### `best-eleven.component.html`
Replace the two `p-select` blocks per slot with:
```html
<!-- Role button -->
<button pButton class="slot-role-btn"
  [label]="getRoleFullName(item.index) ?? 'Select Role'"
  (click)="openRolePicker(item.index)">
</button>

<!-- Player button (disabled until role selected) -->
<button pButton class="slot-player-btn"
  [label]="getLockedPlayerName(item.index) ?? 'Lock Player (optional)'"
  [disabled]="!selectedRoles()[item.index]"
  (click)="openPlayerPicker(item.index)">
</button>
```

Add modal components once, outside the formation grid (inside `.best-eleven-page`):
```html
<app-role-picker-modal
  [(visible)]="rolePickerVisibleValue"
  [roles]="rolesForPickerModal()"
  [selectedRole]="selectedRoles()[rolePickerSlot() ?? 0]"
  (roleSelected)="onRolePickerSelect($event)"
/>
<app-player-picker-modal
  [(visible)]="playerPickerVisibleValue"
  [players]="eligiblePlayersForModal()"
  [selectedRole]="roleForPlayerModal()"
  [selectedPlayerUid]="lockedPlayerUidForModal()"
  (playerSelected)="onPlayerPickerSelect($event)"
/>
```

**Note:** `[(visible)]` two-way binding requires getter/setter pattern:
```typescript
get rolePickerVisibleValue(): boolean { return this.rolePickerVisible(); }
set rolePickerVisibleValue(v: boolean) { this.rolePickerVisible.set(v); }
```

### `best-eleven.component.scss`
Add styles for `.slot-role-btn`, `.slot-player-btn` (full-width buttons, consistent with existing slot card).

---

## Implementation Steps

### Step 0 — Save plan
Write this plan to `_plans/best-xi-selection-modal-search.md` in the repo and commit it.

---

## TDD Order (tests before implementation)

Per spec: write all test files first, then implement.

**Step 1 — Write test files:**
1. `role-picker-modal.component.spec.ts` — covers all spec test cases for role picker
2. `player-picker-modal.component.spec.ts` — covers all spec test cases for player picker
3. Add tests to `best-eleven.component.spec.ts` — slot card displays full role name, player picker disabled when no role

**Step 2 — Implement:**
4. `RolePickerModalComponent` (ts + html + scss)
5. `PlayerPickerModalComponent` (ts + html + scss)
6. Modify `BestElevenComponent` (ts + html + scss)

---

## Test Coverage Plan

### `role-picker-modal.component.spec.ts`
- Renders full `roleName` (not `shortRoleName`) for each role in input
- Search input filters roles case-insensitively (`"central"` matches `"Central Defender"`)
- Search strips accents (`"bjorn"` matches `"Björn Keeper"` if such a name existed in roleName)
- Selecting a role emits `shortRoleName` via `roleSelected`
- Selecting a role emits `false` via `visibleChange`
- "Clear selection" emits `null` via `roleSelected`
- Zero search results shows empty state "No roles found"

### `player-picker-modal.component.spec.ts`
- Lists only provided `players` (eligible = marked from parent)
- Shows player name, position, and role score for each player
- Search input filters by player name case-insensitively
- Search strips accents
- Selecting a player emits `player.uid` via `playerSelected`
- Selecting a player emits `false` via `visibleChange`
- "No lock" button emits `null` via `playerSelected`
- Empty `players` input shows "No eligible players. Mark players in the roster panel."
- No search match shows "No players found"

### Additions to `best-eleven.component.spec.ts`
- After selecting a role, slot card shows full role name (not short name)
- Player button is disabled when no role selected for a slot
- Player button is enabled after role is selected

---

## Shared Utility

A `normalizeForSearch` helper (inline in each modal component, or extracted to `utils/search.ts` if reuse is likely):
```typescript
function normalizeForSearch(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
```

---

## Critical Files

| File | Action |
|------|--------|
| `components/role-picker-modal/role-picker-modal.component.ts` | **Create** |
| `components/role-picker-modal/role-picker-modal.component.html` | **Create** |
| `components/role-picker-modal/role-picker-modal.component.scss` | **Create** |
| `components/role-picker-modal/role-picker-modal.component.spec.ts` | **Create** |
| `components/player-picker-modal/player-picker-modal.component.ts` | **Create** |
| `components/player-picker-modal/player-picker-modal.component.html` | **Create** |
| `components/player-picker-modal/player-picker-modal.component.scss` | **Create** |
| `components/player-picker-modal/player-picker-modal.component.spec.ts` | **Create** |
| `components/best-eleven/best-eleven.component.ts` | **Modify** |
| `components/best-eleven/best-eleven.component.html` | **Modify** |
| `components/best-eleven/best-eleven.component.scss` | **Modify** |
| `components/best-eleven/best-eleven.component.spec.ts` | **Modify** |

All paths relative to `fm-stats-angular/src/app/`.

**Reused utilities:**
- `utils/score-matrix.ts` → `getPlayerRoleScore(player, shortRoleName)` — used in player picker for score display
- `models/role-group.model.ts` → `RoleInfo` — used in role picker inputs
- `models/player.model.ts` → `Player` — used in player picker inputs

---

## Verification

```bash
cd fm-stats-angular
ng test --watch=false
```

All existing tests must continue to pass. New spec tests must pass before marking implementation complete.

Manual smoke test:
1. Navigate to `/best-xi`
2. Confirm no `p-select` dropdowns are present on slot cards
3. Click "Select Role" on any slot → modal opens with full role names and search input
4. Type partial role name → list filters in real-time
5. Select a role → modal closes, slot card shows full role name
6. "Lock Player (optional)" button is now enabled → click it → player modal opens
7. Player list shows name, position, and role score
8. Search a player by name (including with diacritics if available)
9. Select player → modal closes, player name visible on slot card
10. Click "Reset" → clears to initial state
11. Calculate Best XI → unaffected by this change
