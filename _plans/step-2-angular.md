# Step 2 Plan: Create Angular App (Upload + Display)

## Context

Step 1 is complete: the .NET 10 Web API is running with two endpoints:
- `POST /api/players/upload` — accepts an HTML file, returns `List<Player>` as JSON
- `GET /api/roles` — returns all 85 roles grouped by position

Step 2 creates the Angular frontend that talks to this API. The goal is a working app where you can upload an FM export and see a sortable, filterable player table — functionally equivalent to the old Razor Pages app, but running as a modern SPA.

---

## Technology Decision: UI Component Library

**Use PrimeNG.**

Rationale: We have 85 role columns + ~15 player info columns. The table needs sorting, column toggling, and scrolling. PrimeNG's `p-table` handles this out of the box. Angular Material's table requires a lot more manual wiring for column management at this scale.

---

## Sub-steps

### 2.1 — Scaffold the Angular App

**What:** Run `ng new` to create the Angular project.

**Command:**
```bash
ng new fm-stats-angular \
  --routing=true \
  --style=scss \
  --standalone \
  --skip-git
```

- `--routing=true` → adds a router so we can have a `/upload` page and a `/players` page
- `--style=scss` → SCSS instead of plain CSS (more powerful, needed by PrimeNG themes)
- `--standalone` → Angular 19 default. Standalone components don't need `NgModule` declarations — simpler for beginners
- `--skip-git` → don't create a new git repo inside (we already have one at the root)

**Install PrimeNG:**
```bash
npm install primeng @primeuix/themes
```

**Result:** `fm-stats-angular/` directory is created and `ng serve` starts without errors on port 4200.

**Why this is its own step:** Scaffolding generates many files. Keeping it isolated makes it easy to verify before adding any code.

---

### 2.2 — Configure the Dev Proxy

**What:** Tell Angular's dev server to forward `/api/*` requests to the .NET API at `http://localhost:5000`.

**Why this is necessary:** During development, Angular runs on port 4200 and .NET runs on port 5000. Without this, browser security (CORS) would block requests — or you'd need to hardcode the full URL everywhere. The proxy makes it transparent: Angular code just calls `/api/players/upload` and the dev server routes it.

**Files to create:**

`fm-stats-angular/proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true
  }
}
```

`fm-stats-angular/angular.json` (edit `serve.options`):
```json
"proxyConfig": "proxy.conf.json"
```

**Verification:** `ng serve` still starts. No code changes needed to verify — we'll test actual requests in 2.4.

---

### 2.3 — Define TypeScript Models

**What:** Create TypeScript interfaces that mirror the C# classes from the API.

**Why:** TypeScript interfaces tell the compiler what shape our data has. When the API returns JSON, TypeScript can help catch errors like accessing `player.nonExistentField`. These are interfaces, not classes — they have no logic, just type definitions.

**Files to create:** `fm-stats-angular/src/app/models/`

`player.model.ts` — mirrors `FMStatsApp.Api/Models/Player.cs`:
```typescript
export interface Role {
  roleName: string;
  shortRoleName: string;
  position: string;
  roleScore: number;
}

export interface Player {
  name: string;
  age: number;
  club: string;
  nationality: string;
  position: string;
  wage: number;
  transferValue: number;
  // ... all 37 attributes (acceleration, finishing, etc.)
  roles: Role[];
}
```

`role-group.model.ts` — mirrors `GET /api/roles` response:
```typescript
export interface RoleInfo {
  roleName: string;
  shortRoleName: string;
  positions: string[];
}

export interface RoleGroup {
  [generalPosition: string]: RoleInfo[];
}
```

**Verification:** `ng build` compiles without TypeScript errors.

---

### 2.4 — Create PlayerService

**What:** A service that makes HTTP calls to the API and stores the player list in a signal.

**Angular concept — Services:** A service is a singleton class shared across components. It's the right place to put API calls and application state. Components ask the service for data; they don't fetch it themselves.

**Angular concept — Signals:** A signal is a reactive value. When it changes, any component reading it automatically re-renders. Simpler than the older Observable/subscription pattern for this use case.

**File to create:** `fm-stats-angular/src/app/services/player.service.ts`

Key methods:
- `uploadFile(file: File): Observable<Player[]>` — sends `FormData` to `POST /api/players/upload`
- `players = signal<Player[]>([])` — stores the parsed player list
- `roles = signal<RoleGroup>({})` — stores the role catalog
- `loadRoles(): void` — calls `GET /api/roles` on app startup

**File to create:** `fm-stats-angular/src/app/app.config.ts` (edit to add `provideHttpClient()`)

**Verification:** Service can be injected in a component. No visual verification needed yet.

---

### 2.5 — Set Up App Routing

**What:** Define URL routes so the app has two pages.

**Angular concept — Routing:** Angular apps are Single Page Applications — there's only one HTML page (`index.html`). The router swaps out components based on the URL without a real page reload.

Routes:
- `/` → Upload page (redirect or show upload component)
- `/upload` → `UploadComponent`
- `/players` → `PlayerTableComponent`

**Files to edit:** `fm-stats-angular/src/app/app.routes.ts`

**Verification:** Navigating to `http://localhost:4200/upload` shows a placeholder, navigating to `/players` shows another placeholder.

---

### 2.6 — Build the Upload Component

**What:** A page with a file input. When the user selects an `.html` file and clicks upload, it sends the file to the API and navigates to `/players`.

**Angular concept — Components:** A component = TypeScript class + HTML template + SCSS styles. The class handles logic; the template declares what to display; SCSS styles it. The `@Component` decorator wires them together.

**File to create:** `fm-stats-angular/src/app/components/upload/upload.component.ts` (+ `.html` + `.scss`)

Template features:
- `<input type="file" accept=".html">` — restricts to HTML files
- Upload button (disabled if no file selected)
- Loading spinner shown while request is in progress
- Error message shown if API returns error

Component logic:
- On file select: store the file reference
- On upload button click:
  1. Call `playerService.uploadFile(file)`
  2. On success: `router.navigate(['/players'])`
  3. On error: show message

**Verification:**
1. Start both `ng serve` (port 4200) and `dotnet run` in FMStatsApp.Api (port 5000)
2. Go to `http://localhost:4200/upload`
3. Select the test HTML file and click upload
4. Should navigate to `/players` (blank for now is fine)
5. Check browser DevTools Network tab — should see `POST /api/players/upload` returning 200 with player JSON

---

### 2.7 — Build the Player Table Component (Basic Columns)

**What:** Display players in a PrimeNG table with their basic info columns. No role scores yet.

**Why split from role scores (2.8):** The table itself is complex. Getting basic columns working first, then adding 85 role columns separately, keeps each step verifiable.

Columns for this step:
- Name, Age, Club, Nationality, Position, Wage, Transfer Value, Rating

**File to create:** `fm-stats-angular/src/app/components/player-table/player-table.component.ts` (+ `.html` + `.scss`)

PrimeNG component to use: `<p-table>` with:
- `[value]="players()"` — binds to the signal
- `[sortable]="true"` on each column header
- `[scrollable]="true"` + `scrollHeight="600px"` — fixed height, scroll within table
- `[virtualScroll]="true"` — renders only visible rows (performance with 500+ players)

**Verification:**
1. Upload the test file
2. Should see a table with player rows
3. Clicking column headers should sort

---

### 2.8 — Add Role Score Columns

**What:** Add one column per role to the player table. Show the player's score for that role.

**Why this is separate:** 85 columns is a lot. There are decisions to make: how to render column headers (use `shortRoleName`), how to format numbers (1 decimal), and performance (virtual scrolling is important here).

**Changes to player-table component:**
- Add columns dynamically from the `players[0].roles` array
- Format: `{{ role.roleScore | number:'1.1-1' }}` — Angular pipe for 1 decimal place
- Column headers show `shortRoleName` (e.g., "GK-D" instead of "Goalkeeper (Defend)")
- Color-code scores: green for high (≥8.0), yellow for medium (≥6.0), red below

**Verification:**
1. Upload test file
2. Table should show 85+ role columns after the basic columns
3. Scores should match what Swagger returned from the API directly

---

### 2.9 — Build the Role Filter Component

**What:** A sidebar/panel with checkboxes grouped by position (Goalkeeper, Defender, Midfielder, Forward). Checking/unchecking a group shows/hides those columns in the table.

**Angular concept — Component interaction:** The role filter needs to tell the player table which columns to show. We'll use a signal in `PlayerService` to hold the active column set. Both components read/write the same service signal — this is "shared state via service".

**File to create:** `fm-stats-angular/src/app/components/role-filter/role-filter.component.ts` (+ `.html` + `.scss`)

Logic:
- On init: call `GET /api/roles` to get the grouped role catalog
- Render checkboxes grouped by position
- On checkbox change: update `playerService.activeRoles` signal
- Player table filters its columns based on this signal

**Verification:**
1. Uncheck "Goalkeeper" group → GK columns disappear from table
2. Re-check → columns reappear
3. No page reload needed (reactive)

---

## Final Verification Checklist

After all sub-steps are complete:

1. Upload the same HTML file in the old Razor Pages app and the new Angular app
2. Compare player count — must be identical
3. Spot-check 5 players: verify Name, Age, Club match
4. Spot-check 3 role scores per player — must match to 1 decimal
5. Sort by a role column — verify order is correct
6. Toggle role filter groups — verify columns show/hide correctly

---

## Critical Files

**To create (Angular):**
- `fm-stats-angular/proxy.conf.json`
- `fm-stats-angular/src/app/models/player.model.ts`
- `fm-stats-angular/src/app/models/role-group.model.ts`
- `fm-stats-angular/src/app/services/player.service.ts`
- `fm-stats-angular/src/app/app.routes.ts`
- `fm-stats-angular/src/app/components/upload/upload.component.ts`
- `fm-stats-angular/src/app/components/player-table/player-table.component.ts`
- `fm-stats-angular/src/app/components/role-filter/role-filter.component.ts`

**To edit (Angular):**
- `fm-stats-angular/angular.json` — add proxyConfig
- `fm-stats-angular/src/app/app.config.ts` — add provideHttpClient()

**Reference (read-only):**
- `FMStatsApp.Api/Controllers/PlayersController.cs`
- `FMStatsApp.Api/Controllers/RolesController.cs`
- `FMStatsApp.Api/Models/Player.cs`
- `FMStatsApp.Api/Models/Role.cs`
