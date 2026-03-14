# Player State localStorage Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `PlayerService`'s signal-based state with `BehaviorSubject`-backed Observables that persist players and activeRoles to `localStorage`, surviving page reloads.

**Architecture:** `PlayerService` holds two `BehaviorSubject`s (players, activeRoles) that persist to a single `localStorage` key on every mutation and rehydrate in the constructor. Components convert the Observables to local signals via `toSignal()` so existing `computed()` expressions change minimally. `UploadComponent` explicitly calls `setPlayers()` after upload; `RoleFilterComponent` calls `setActiveRoles()` instead of directly mutating the signal.

**Tech Stack:** Angular 21, RxJS 7.8, Angular Signals + `toSignal` (`@angular/core/rxjs-interop`), Vitest 4 + Angular TestBed, `provideHttpClient` / `provideHttpClientTesting`

---

## Files

| Action | Path |
|--------|------|
| **Modify** | `fm-stats-angular/src/app/services/player.service.ts` |
| **Create** | `fm-stats-angular/src/app/services/player.service.spec.ts` |
| **Create** | `fm-stats-angular/src/app/components/upload/upload.component.spec.ts` |
| **Modify** | `fm-stats-angular/src/app/components/upload/upload.component.ts` |
| **Modify** | `fm-stats-angular/src/app/components/player-table/player-table.component.ts` |
| **Modify** | `fm-stats-angular/src/app/components/player-table/player-table.component.html` |
| **Modify** | `fm-stats-angular/src/app/components/role-filter/role-filter.component.ts` |
| **Modify** | `fm-stats-angular/src/app/components/role-filter/role-filter.component.html` |

---

## Chunk 1: Service Tests (TDD)

### Task 1: Write failing PlayerService tests

**Files:**
- Create: `fm-stats-angular/src/app/services/player.service.spec.ts`

- [ ] **Step 1: Create the test file**

```typescript
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PlayerService } from './player.service';
import { Player } from '../models/player.model';

function mockPlayer(uid = 1): Player {
  return {
    uid,
    name: 'Test Player',
    age: 25,
    club: 'FC Test',
    nationality: 'Swedish',
    secondNationality: '',
    position: 'ST',
    personality: 'Determined',
    mediaHandling: 'Reserved',
    averageRating: 7.5,
    wage: 5000,
    transferValue: 1000000,
    leftFoot: 'Strong',
    rightFoot: 'Weak',
    height: 180,
    reg: '',
    inf: '',
    oneVsOne: 14, acceleration: 15, aerialAbility: 10, aggression: 12,
    agility: 14, anticipation: 13, balance: 14, bravery: 12,
    commandOfArea: 10, concentration: 13, composure: 14, crossing: 10,
    decisions: 13, determination: 15, dribbling: 12, finishing: 14,
    firstTouch: 13, flair: 12, handling: 8, heading: 12,
    jumpingReach: 13, kicking: 8, leadership: 10, longShots: 11,
    marking: 9, offTheBall: 14, pace: 15, passing: 11,
    positioning: 13, reflexes: 9, stamina: 14, strength: 13,
    tackling: 9, teamwork: 13, technique: 13, throwing: 8,
    throwOuts: 8, vision: 12, workRate: 14, corners: 9,
    roles: [{ roleName: 'Striker', shortRoleName: 'ST', position: 'ST', roleScore: 8.5 }],
  };
}

describe('PlayerService', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(k => store[k] ?? null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => { store[k] = v; });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(k => { delete store[k]; });

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  function getService() {
    return TestBed.inject(PlayerService);
  }

  // --- Rehydration ---

  it('starts with empty player list when localStorage is empty', async () => {
    const svc = getService();
    const players = await firstValueFrom(svc.players$);
    expect(players).toEqual([]);
  });

  it('rehydrates stored players on construction', async () => {
    const p = mockPlayer();
    store['uploaded_players'] = JSON.stringify({ players: [p], activeRoles: ['ST'] });
    const svc = getService();
    const players = await firstValueFrom(svc.players$);
    expect(players).toEqual([p]);
  });

  it('rehydrates stored activeRoles on construction', async () => {
    store['uploaded_players'] = JSON.stringify({ players: [], activeRoles: ['ST', 'CM'] });
    const svc = getService();
    const roles = await firstValueFrom(svc.activeRoles$);
    expect(roles).toEqual(new Set(['ST', 'CM']));
  });

  it('starts with empty list when localStorage contains corrupt JSON', async () => {
    store['uploaded_players'] = 'not-valid-json{{';
    const svc = getService();
    expect(() => firstValueFrom(svc.players$)).not.toThrow();
    const players = await firstValueFrom(svc.players$);
    expect(players).toEqual([]);
  });

  it('starts with empty list when localStorage contains valid JSON with wrong shape', async () => {
    store['uploaded_players'] = JSON.stringify({ unexpected: true });
    const svc = getService();
    const players = await firstValueFrom(svc.players$);
    expect(players).toEqual([]);
  });

  // --- setPlayers ---

  it('setPlayers emits the new list on players$', async () => {
    const svc = getService();
    const p = mockPlayer();
    svc.setPlayers([p]);
    const players = await firstValueFrom(svc.players$);
    expect(players).toEqual([p]);
  });

  it('setPlayers persists to localStorage', () => {
    const svc = getService();
    const p = mockPlayer();
    svc.setPlayers([p]);
    const stored = JSON.parse(store['uploaded_players']);
    expect(stored.players).toEqual([p]);
  });

  it('setPlayers resets activeRoles to all roles in the uploaded list', async () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1)]);
    const roles = await firstValueFrom(svc.activeRoles$);
    expect(roles).toEqual(new Set(['ST']));
  });

  it('setPlayers replaces any previously stored players', async () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1)]);
    svc.setPlayers([mockPlayer(2)]);
    const players = await firstValueFrom(svc.players$);
    expect(players.map(p => p.uid)).toEqual([2]);
  });

  // --- removePlayer ---

  it('removePlayer with valid uid emits updated list without that player', async () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1), mockPlayer(2)]);
    svc.removePlayer(1);
    const players = await firstValueFrom(svc.players$);
    expect(players.map(p => p.uid)).toEqual([2]);
  });

  it('removePlayer with valid uid updates localStorage', () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1), mockPlayer(2)]);
    svc.removePlayer(1);
    const stored = JSON.parse(store['uploaded_players']);
    expect(stored.players.map((p: Player) => p.uid)).toEqual([2]);
  });

  it('removePlayer with unknown uid leaves list unchanged', async () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1)]);
    svc.removePlayer(999);
    const players = await firstValueFrom(svc.players$);
    expect(players.map(p => p.uid)).toEqual([1]);
  });

  // --- localStorage unavailable ---

  it('does not crash when localStorage.setItem throws QuotaExceededError', async () => {
    const svc = getService();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => svc.setPlayers([mockPlayer()])).not.toThrow();
    const players = await firstValueFrom(svc.players$);
    expect(players).toHaveLength(1);
  });

  // --- setActiveRoles ---

  it('setActiveRoles persists the new roles to localStorage', () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1)]);
    svc.setActiveRoles(new Set(['CM', 'DM']));
    const stored = JSON.parse(store['uploaded_players']);
    expect(stored.activeRoles).toEqual(expect.arrayContaining(['CM', 'DM']));
    expect(stored.activeRoles).toHaveLength(2);
  });

  // --- localStorage fully unavailable on construction ---

  it('does not crash when localStorage.getItem throws during rehydration', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    expect(() => getService()).not.toThrow();
    const players = await firstValueFrom(getService().players$);
    expect(players).toEqual([]);
  });

  // --- Last-write-wins for concurrent uploads ---

  it('second setPlayers call wins when two uploads complete in sequence', async () => {
    const svc = getService();
    svc.setPlayers([mockPlayer(1)]);
    svc.setPlayers([mockPlayer(2)]);
    const players = await firstValueFrom(svc.players$);
    expect(players.map(p => p.uid)).toEqual([2]);
  });

  // --- Upload integration ---

  it('players$ emits the returned players after uploadFile resolves and setPlayers is called', async () => {
    const svc = getService();
    const httpMock = TestBed.inject(HttpTestingController);
    const mockFile = new File(['data'], 'squad.html');
    const mockPlayers = [mockPlayer()];
    const emissions: Player[][] = [];

    svc.players$.subscribe(p => emissions.push(p));
    svc.uploadFile(mockFile).subscribe(players => svc.setPlayers(players));

    httpMock.expectOne('/api/players/upload').flush(mockPlayers);
    httpMock.verify();

    // Last emission should be the uploaded players
    expect(emissions[emissions.length - 1]).toEqual(mockPlayers);
  });
});
```

- [ ] **Step 2: Run tests to verify they all fail (service not yet updated)**

```
cd fm-stats-angular && npm test -- --reporter=verbose 2>&1 | head -60
```
Expected: compilation error or test failures — `players$`, `activeRoles$`, `setPlayers`, `removePlayer`, `setActiveRoles` don't exist yet.

---

## Chunk 2: PlayerService Implementation

### Task 2: Implement the new PlayerService

**Files:**
- Modify: `fm-stats-angular/src/app/services/player.service.ts`

- [ ] **Step 1: Replace the service implementation**

Full replacement of `fm-stats-angular/src/app/services/player.service.ts`:

```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { RoleGroup } from '../models/role-group.model';

const STORAGE_KEY = 'uploaded_players';

interface StoredState {
  players: Player[];
  activeRoles: string[];
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private playersSubject = new BehaviorSubject<Player[]>([]);
  private activeRolesSubject = new BehaviorSubject<Set<string>>(new Set());

  players$ = this.playersSubject.asObservable();
  activeRoles$ = this.activeRolesSubject.asObservable();
  roles = signal<RoleGroup>({});

  constructor(private http: HttpClient) {
    this.rehydrate();
  }

  private rehydrate(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!this.isValidStoredState(parsed)) return;
      this.playersSubject.next(parsed.players);
      this.activeRolesSubject.next(new Set(parsed.activeRoles));
    } catch {
      // Silently discard corrupt or unreadable data
    }
  }

  private isValidStoredState(value: unknown): value is StoredState {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return Array.isArray(v['players']) && Array.isArray(v['activeRoles']);
  }

  private persist(): void {
    try {
      const state: StoredState = {
        players: this.playersSubject.value,
        activeRoles: [...this.activeRolesSubject.value],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Gracefully degrade (QuotaExceededError, private browsing, etc.)
    }
  }

  setPlayers(players: Player[]): void {
    const allRoles = new Set(players.flatMap(p => p.roles.map(r => r.shortRoleName)));
    this.playersSubject.next(players);
    this.activeRolesSubject.next(allRoles);
    this.persist();
  }

  removePlayer(uid: number): void {
    const updated = this.playersSubject.value.filter(p => p.uid !== uid);
    this.playersSubject.next(updated);
    this.persist();
  }

  setActiveRoles(roles: Set<string>): void {
    this.activeRolesSubject.next(roles);
    this.persist();
  }

  uploadFile(file: File): Observable<Player[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Player[]>('/api/players/upload', formData);
  }

  loadRoles(): void {
    this.http.get<RoleGroup>('/api/roles').subscribe({
      next: roles => this.roles.set(roles),
      error: err => console.error('Failed to load roles:', err),
    });
  }
}
```

> Note: `uploadFile` no longer has a `tap` side-effect. The caller (`UploadComponent`) is responsible for calling `setPlayers()`.
> Note: `loadRoles` no longer sets `activeRoles`; that is now owned by `setPlayers` / rehydration.

- [ ] **Step 2: Run the service tests**

```
cd fm-stats-angular && npm test -- --reporter=verbose 2>&1 | grep -E "(PASS|FAIL|✓|✗|×)"
```
Expected: all PlayerService tests pass.

- [ ] **Step 3: Commit**

```bash
cd fm-stats-angular
git add src/app/services/player.service.ts src/app/services/player.service.spec.ts
git commit -m "feat: replace PlayerService signals with BehaviorSubject + localStorage persistence"
```

---

## Chunk 3: Component Updates

### Task 3: Write failing UploadComponent test

**Files:**
- Create: `fm-stats-angular/src/app/components/upload/upload.component.spec.ts`

The spec requires TDD. Write a test that verifies `setPlayers` is called with the API response before updating the component.

- [ ] **Step 1: Create the test file**

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { UploadComponent } from './upload.component';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';

function mockPlayer(uid = 1): Player {
  return {
    uid, name: 'Test', age: 25, club: 'FC Test', nationality: 'Swedish',
    secondNationality: '', position: 'ST', personality: 'Determined',
    mediaHandling: 'Reserved', averageRating: 7.5, wage: 5000,
    transferValue: 1000000, leftFoot: 'Strong', rightFoot: 'Weak',
    height: 180, reg: '', inf: '',
    oneVsOne: 14, acceleration: 15, aerialAbility: 10, aggression: 12,
    agility: 14, anticipation: 13, balance: 14, bravery: 12,
    commandOfArea: 10, concentration: 13, composure: 14, crossing: 10,
    decisions: 13, determination: 15, dribbling: 12, finishing: 14,
    firstTouch: 13, flair: 12, handling: 8, heading: 12,
    jumpingReach: 13, kicking: 8, leadership: 10, longShots: 11,
    marking: 9, offTheBall: 14, pace: 15, passing: 11,
    positioning: 13, reflexes: 9, stamina: 14, strength: 13,
    tackling: 9, teamwork: 13, technique: 13, throwing: 8,
    throwOuts: 8, vision: 12, workRate: 14, corners: 9,
    roles: [{ roleName: 'Striker', shortRoleName: 'ST', position: 'ST', roleScore: 8.5 }],
  };
}

describe('UploadComponent', () => {
  let setPlayersSpy: ReturnType<typeof vi.fn>;
  let uploadFileSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    setPlayersSpy = vi.fn();
    uploadFileSpy = vi.fn();

    const mockPlayerService = {
      players$: of([] as Player[]),
      activeRoles$: of(new Set<string>()),
      roles: signal({}),
      setPlayers: setPlayersSpy,
      uploadFile: uploadFileSpy,
    };

    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        { provide: PlayerService, useValue: mockPlayerService },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('calls setPlayers with the API response after a successful upload', async () => {
    const mockPlayers = [mockPlayer()];
    uploadFileSpy.mockReturnValue(of(mockPlayers));

    const fixture = TestBed.createComponent(UploadComponent);
    const component = fixture.componentInstance;
    component.selectedFile = new File(['data'], 'squad.html');
    component.onUpload();

    expect(setPlayersSpy).toHaveBeenCalledWith(mockPlayers);
  });

  it('does not call setPlayers when no file is selected', () => {
    uploadFileSpy.mockReturnValue(of([]));

    const fixture = TestBed.createComponent(UploadComponent);
    const component = fixture.componentInstance;
    component.selectedFile = null;
    component.onUpload();

    expect(setPlayersSpy).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```
cd fm-stats-angular && npm test 2>&1 | grep -E "(UploadComponent|FAIL|error)" | head -20
```
Expected: `setPlayers` not found / test failures since the component still calls the old tap-based flow.

---

### Task 4: Update UploadComponent

**Files:**
- Modify: `fm-stats-angular/src/app/components/upload/upload.component.ts`

The `onUpload` method must call `setPlayers()` with the API response instead of relying on the removed `tap` side-effect.

- [ ] **Step 1: Update `onUpload` in UploadComponent**

Full updated file:

```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  private playerService = inject(PlayerService);
  private router = inject(Router);

  selectedFile: File | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.errorMessage = null;
  }

  onUpload(): void {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.playerService.uploadFile(this.selectedFile).subscribe({
      next: (players) => {
        this.playerService.setPlayers(players);
        this.isLoading = false;
        this.router.navigate(['/players']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? 'Upload failed. Please try again.';
      }
    });
  }
}
```

- [ ] **Step 2: Run tests**

```
cd fm-stats-angular && npm test 2>&1 | tail -20
```
Expected: all tests pass including new UploadComponent tests.

---

### Task 5: Update PlayerTableComponent

**Files:**
- Modify: `fm-stats-angular/src/app/components/player-table/player-table.component.ts`
- Modify: `fm-stats-angular/src/app/components/player-table/player-table.component.html`

The component currently reads `playerService.players()` and `playerService.activeRoles()` — both will no longer exist as signals. Replace with `toSignal()` local signals.

- [ ] **Step 1: Update the TypeScript class**

```typescript
import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { RoleFilterComponent } from '../role-filter/role-filter.component';

@Component({
  selector: 'app-player-table',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, RoleFilterComponent],
  templateUrl: './player-table.component.html',
  styleUrl: './player-table.component.scss'
})
export class PlayerTableComponent {
  protected playerService = inject(PlayerService);
  protected players = toSignal(this.playerService.players$, { initialValue: [] as Player[] });
  protected activeRoles = toSignal(this.playerService.activeRoles$, { initialValue: new Set<string>() });

  basicColumns = [
    { field: 'name', header: 'Name' },
    { field: 'age', header: 'Age' },
    { field: 'club', header: 'Club' },
    { field: 'nationality', header: 'Nationality' },
    { field: 'position', header: 'Position' },
    { field: 'wage', header: 'Wage' },
    { field: 'transferValue', header: 'Transfer Value' },
    { field: 'averageRating', header: 'Rating' },
  ];

  roleColumns = computed(() => {
    const players = this.players();
    if (players.length === 0) return [];
    const activeRoles = this.activeRoles();
    return players[0].roles.filter(r => activeRoles.has(r.shortRoleName));
  });

  getRoleScore(player: Player, roleName: string): number {
    return player.roles.find(r => r.shortRoleName === roleName)?.roleScore ?? 0;
  }

  getRoleScoreClass(score: number): string {
    if (score >= 8.0) return 'score-high';
    if (score >= 6.0) return 'score-medium';
    return 'score-low';
  }
}
```

- [ ] **Step 2: Update the template**

In `player-table.component.html`, change line 6:

```html
<!-- old -->
[value]="playerService.players()"

<!-- new -->
[value]="players()"
```

- [ ] **Step 3: Run tests**

```
cd fm-stats-angular && npm test 2>&1 | tail -20
```
Expected: all tests pass.

---

### Task 6: Update RoleFilterComponent

**Files:**
- Modify: `fm-stats-angular/src/app/components/role-filter/role-filter.component.ts`
- Modify: `fm-stats-angular/src/app/components/role-filter/role-filter.component.html`

The component reads `playerService.activeRoles()` (signal call) and writes via `playerService.activeRoles.set()`. Both must change: read via `toSignal()`, write via `playerService.setActiveRoles()`.

- [ ] **Step 1: Update the TypeScript class**

```typescript
import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-role-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-filter.component.html',
  styleUrl: './role-filter.component.scss'
})
export class RoleFilterComponent {
  protected playerService = inject(PlayerService);
  protected activeRoles = toSignal(this.playerService.activeRoles$, { initialValue: new Set<string>() });

  roleGroups = computed(() => {
    const roles = this.playerService.roles();
    return Object.entries(roles).map(([groupName, roleList]) => ({
      groupName,
      roles: roleList,
      allChecked: roleList.every(r => this.activeRoles().has(r.shortRoleName)),
      indeterminate:
        roleList.some(r => this.activeRoles().has(r.shortRoleName)) &&
        !roleList.every(r => this.activeRoles().has(r.shortRoleName)),
    }));
  });

  onGroupChange(groupName: string, event: Event): void {
    this.toggleGroup(groupName, (event.target as HTMLInputElement).checked);
  }

  onRoleChange(shortRoleName: string, event: Event): void {
    this.toggleRole(shortRoleName, (event.target as HTMLInputElement).checked);
  }

  toggleGroup(groupName: string, checked: boolean): void {
    const roles = this.playerService.roles();
    const groupRoles = roles[groupName] ?? [];
    const current = new Set(this.activeRoles());

    for (const role of groupRoles) {
      if (checked) {
        current.add(role.shortRoleName);
      } else {
        current.delete(role.shortRoleName);
      }
    }

    this.playerService.setActiveRoles(current);
  }

  toggleRole(shortRoleName: string, checked: boolean): void {
    const current = new Set(this.activeRoles());
    if (checked) {
      current.add(shortRoleName);
    } else {
      current.delete(shortRoleName);
    }
    this.playerService.setActiveRoles(current);
  }
}
```

- [ ] **Step 2: Update the template**

In `role-filter.component.html`, change line 19:

```html
<!-- old -->
[checked]="playerService.activeRoles().has(role.shortRoleName)"

<!-- new -->
[checked]="activeRoles().has(role.shortRoleName)"
```

- [ ] **Step 3: Run all tests**

```
cd fm-stats-angular && npm test 2>&1 | tail -20
```
Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
cd fm-stats-angular
git add src/app/components/upload/upload.component.ts \
        src/app/components/upload/upload.component.spec.ts \
        src/app/components/player-table/player-table.component.ts \
        src/app/components/player-table/player-table.component.html \
        src/app/components/role-filter/role-filter.component.ts \
        src/app/components/role-filter/role-filter.component.html
git commit -m "feat: update components to consume PlayerService Observables via toSignal"
```

---

## Verification

1. **All tests pass:** `cd fm-stats-angular && npm test`
2. **Manual end-to-end:**
   - Start backend: `cd FMStatsApp.Api && dotnet run`
   - Start frontend: `cd fm-stats-angular && npm start`
   - Upload an FM export file → verify player table shows
   - Refresh the page → players should still be shown (rehydration from localStorage)
   - Upload a new file → previous squad replaced, role filter resets to all active
3. **No component touches localStorage:** `grep -r "localStorage" fm-stats-angular/src/app/components/` should return no results
