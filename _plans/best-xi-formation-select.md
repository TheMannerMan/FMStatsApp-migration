# Plan: Best XI Formation Select

## Context

The Best XI builder currently hardcodes a 4-4-2 formation. This change adds a formation picker landing page at `/best-eleven` with 9 selectable formations, and makes the builder at `/best-eleven/:formation` load the chosen formation dynamically from the URL.

**Spec:** `_specs/best-xi-formation-select.md`
**Branch:** `claude/feature/best-xi-formation-select`

## Key observations

- `BestElevenComponent` uses `this.formation` as a static property (line 38) — must become a `computed` signal derived from route param. Every access needs `()` call syntax.
- `getResultForSlot` (line 412) uses object identity (`e.slot === this.formation[slotIndex]`) — works because catalog arrays are constants so the same references are returned.
- `formationRows` (line 39) is a static property — must become `computed`.
- `hasEnoughPlayers` hardcodes 11 (line 112) — all formations are 11 slots, so this is fine.
- `reset()` hardcodes `new Array(11)` (line 282) — should use `this.formation().length`.
- Existing tests use `provideRouter([])` with no route params — must provide `:formation` param.
- C# backend (`Formation.cs`) only defines 3 formations — we need all 9 in the Angular catalog.
- Header already links to `/best-eleven` (`app-header.component.html:10`) — stays correct.

## Steps

### Step 1: Create `formations-catalog.ts` + catalog tests (TDD)

**Create:** `fm-stats-angular/src/app/models/formations-catalog.spec.ts`

Tests:
- All 9 formations have exactly 11 slots
- Each formation has exactly one GK slot
- `FORMATION_SLUGS` has 9 entries
- All slugs in `FORMATIONS_CATALOG` match `FORMATION_SLUGS`

**Create:** `fm-stats-angular/src/app/models/formations-catalog.ts`

```ts
export const FORMATIONS_CATALOG: Record<string, FormationSlot[]> = { ... };
export const FORMATION_SLUGS: string[] = Object.keys(FORMATIONS_CATALOG);
```

9 formations with row assignments:

| Formation | Row 0 | Row 1 | Row 2 | Row 3 | Row 4 |
|-----------|-------|-------|-------|-------|-------|
| 4-4-2 | GK | DL,DC,DC,DR | ML,MC,MC,MR | ST,ST | |
| 4-2-3-1 | GK | DL,DC,DC,DR | DM,DM | AML,AMC,AMR | ST |
| 5-3-2 | GK | WBL,DC,DC,DC,WBR | MC,MC,MC | ST,ST | |
| 4-3-3 | GK | DL,DC,DC,DR | MC,MC,MC | AML,ST,AMR | |
| 3-5-2 | GK | DC,DC,DC | WBL,MC,MC,MC,WBR | ST,ST | |
| 4-1-4-1 | GK | DL,DC,DC,DR | DM | ML,MC,MC,MR | ST |
| 4-3-1-2 | GK | DL,DC,DC,DR | MC,MC,MC | AMC | ST,ST |
| 4-4-1-1 | GK | DL,DC,DC,DR | ML,MC,MC,MR | AMC | ST |
| 3-4-3 | GK | DC,DC,DC | WBL,MC,MC,WBR | AML,ST,AMR | |

**Modify:** `fm-stats-angular/src/app/models/formation.model.ts`
- Remove `FORMATION_442` export (keep only `FormationSlot` interface)

Run tests → green.

### Step 2: Create `FormationPickerComponent` + tests (TDD)

**Create tests first:** `fm-stats-angular/src/app/components/formation-picker/formation-picker.component.spec.ts`

Tests:
- Renders 9 formation cards
- Each card links to `/best-eleven/:slug`
- All 9 formation names visible in text

**Create component:**
- `fm-stats-angular/src/app/components/formation-picker/formation-picker.component.ts`
- `fm-stats-angular/src/app/components/formation-picker/formation-picker.component.html`
- `fm-stats-angular/src/app/components/formation-picker/formation-picker.component.scss`

Simple standalone component:
- Imports `RouterLink`, PrimeNG `ButtonModule`
- Uses `FORMATION_SLUGS` from catalog
- CSS grid of cards (3 columns), each an `<a routerLink="/best-eleven/{{slug}}">` with formation name
- Responsive reflow on smaller screens

Run tests → green.

### Step 3: Make `BestElevenComponent` formation-aware + update tests

**Modify tests first:** `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts`

- Add `ActivatedRoute` mock providing `formation: '4-4-2'` param to all existing tests
- Add new tests:
  - Initializes arrays to correct length for a non-442 formation (e.g. `5-3-2`)
  - Renders correct slot labels for `4-2-3-1` (11 slots: GK,DL,DC,DC,DR,DM,DM,AML,AMC,AMR,ST)
  - Redirects to `/best-eleven` for invalid slug
  - Clears result on formation change

**Modify:** `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.ts`

Changes:
1. Replace `import { FORMATION_442 }` with `import { FORMATIONS_CATALOG }` from catalog
2. Add `import { ActivatedRoute, Router } from '@angular/router'`
3. Inject `ActivatedRoute` and `Router`
4. Convert `formation` from static property to computed signal:
   ```ts
   private route = inject(ActivatedRoute);
   private router = inject(Router);
   private paramMap = toSignal(this.route.paramMap);

   protected formation = computed(() => {
     const slug = this.paramMap()?.get('formation') ?? '';
     return FORMATIONS_CATALOG[slug] ?? null;
   });
   protected formationSlug = computed(() => this.paramMap()?.get('formation') ?? '');
   protected formationRows = computed(() =>
     [...new Set((this.formation() ?? []).map(s => s.row))].sort((a, b) => a - b)
   );
   ```
5. Add redirect effect for invalid formation:
   ```ts
   effect(() => {
     if (this.paramMap() && !this.formation()) {
       this.router.navigate(['/best-eleven']);
     }
   });
   ```
6. Add effect to reset state when formation changes:
   ```ts
   effect(() => {
     const f = this.formation();
     if (f) {
       this.selectedRoles.set(new Array(f.length).fill(null));
       this.lockedPlayers.set(new Array(f.length).fill(null));
       this.result.set(null);
     }
   });
   ```
7. Update all `this.formation` → `this.formation()` (≈8 references in TS)
8. Update `this.formationRows` → `this.formationRows()` in template
9. Update `reset()` to use `this.formation()!.length` instead of hardcoded 11
10. Add `RouterLink` to imports for back-navigation link

**Modify:** `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html`

- Update page title to show formation name + back link:
  ```html
  <h2 class="page-title">
    <a routerLink="/best-eleven" class="back-link">&larr;</a>
    Best XI — {{ formationSlug() }}
  </h2>
  ```
- `formationRows` already used via method call pattern, just needs `formationRows()` if it was a property

Run tests → green.

### Step 4: Update routes

**Modify:** `fm-stats-angular/src/app/app.routes.ts`

```ts
import { FormationPickerComponent } from './components/formation-picker/formation-picker.component';

export const routes: Routes = [
  { path: '', redirectTo: 'upload', pathMatch: 'full' },
  { path: 'upload', component: UploadComponent },
  { path: 'players', component: PlayerTableComponent },
  { path: 'best-eleven', component: FormationPickerComponent },
  { path: 'best-eleven/:formation', component: BestElevenComponent },
];
```

Header link (`/best-eleven`) already correct — no change needed in `app-header.component.html`.

### Step 5: Run full test suite and manual verification

Run `npm test` in `fm-stats-angular/` — all tests green.

## Files summary

| Action | File |
|--------|------|
| Create | `fm-stats-angular/src/app/models/formations-catalog.ts` |
| Create | `fm-stats-angular/src/app/models/formations-catalog.spec.ts` |
| Create | `fm-stats-angular/src/app/components/formation-picker/formation-picker.component.ts` |
| Create | `fm-stats-angular/src/app/components/formation-picker/formation-picker.component.html` |
| Create | `fm-stats-angular/src/app/components/formation-picker/formation-picker.component.scss` |
| Create | `fm-stats-angular/src/app/components/formation-picker/formation-picker.component.spec.ts` |
| Modify | `fm-stats-angular/src/app/models/formation.model.ts` — remove `FORMATION_442` |
| Modify | `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.ts` — formation from route param |
| Modify | `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html` — back link + slug in title |
| Modify | `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts` — add route param mock + new tests |
| Modify | `fm-stats-angular/src/app/app.routes.ts` — add picker route + parameterized route |

## Verification

1. `cd fm-stats-angular && npm test` — all tests pass
2. `npm start` → navigate to `/best-eleven` → see 9 formation cards
3. Click "4-3-3" → `/best-eleven/4-3-3` with correct 11 slots (GK, DL, DC, DC, DR, MC, MC, MC, AML, AMR, ST)
4. Navigate to `/best-eleven/invalid` → redirects to `/best-eleven`
5. Select roles, calculate, verify result — then navigate back → state resets
6. Direct URL navigation to `/best-eleven/3-5-2` loads correctly
