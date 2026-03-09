# FMStatsApp Migration Plan: Razor Pages → Angular + .NET Web API

## Context

FMStatsApp is a web application for Football Manager 2026. Users upload an HTML export from the game, the application parses player data (57 columns), calculates scores for 85 roles with weighted attributes, and displays the results in a sortable/filterable table.

Today, the app is built as an ASP.NET Core 8.0 Razor Pages app (server-side rendering with Bootstrap, jQuery, DataTables). The goal is to migrate to **Angular frontend + .NET Web API backend** — incrementally, with the ability to roll back at each step.

**Core requirement:** The calculation logic (ScoringCalculator + RoleCatalog) MUST produce identical results after migration.

---

## Architecture

### How Angular + .NET are connected

```
[Angular SPA]  ---HTTP/JSON--->  [.NET Web API]
   port 4200                        port 5000
```

- Angular sends HTTP requests to RESTful API endpoints
- During development: Angular dev server proxies `/api/*` to the .NET backend
- In production: .NET serves Angular's compiled files from `wwwroot` (single deployment)
- **Stateless API** — no session. Backend receives file, parses it, returns JSON. Angular holds all data in memory

### Project structure (mono-repo)

```
FMStatsApp_migration/
├── FMStatsApp.sln
├── FMStatsApp/                  # Original Razor Pages app (kept for comparison/rollback)
├── FMStatsApp.Api/              # New .NET 10 Web API
│   ├── Controllers/
│   │   ├── PlayersController.cs   # POST /api/players/upload
│   │   └── RolesController.cs     # GET /api/roles
│   ├── Models/                    # Moved from original (unchanged logic)
│   └── Services/                  # Moved from original (unchanged logic)
├── FMStatsApp.Core.Tests/       # xUnit test project
│   ├── ScoringCalculatorTests.cs
│   ├── HtmlParserTests.cs
│   └── PlayerParserTests.cs
└── fm-stats-angular/            # Angular app
    └── src/app/
        ├── services/
        ├── models/
        └── components/
            ├── upload/
            ├── player-table/
            └── role-filter/
```

---

## Tools & Technology Choices

| Area | Choice | Rationale |
|------|--------|-----------|
| **Backend** | .NET 10 Web API with Controllers | Latest LTS version, new project built from scratch |
| **Frontend** | Angular 19 (latest stable) | Standalone components, signals, modern DX |
| **UI component library** | Determined in Step 2 | PrimeNG (good table component) or Angular Material — we choose what fits best when we build the UI |
| **State management** | Angular services + signals | Simple app, one data set (player list). No NgRx needed |
| **HTTP** | Angular HttpClient | Built-in, handles file upload and JSON |
| **Backend tests** | xUnit | Standard for .NET |
| **Frontend tests** | Jasmine/Karma (Angular default) | Sufficient for this app size |
| **HTML parsing** | HtmlAgilityPack (existing) | Works well, no reason to change |

---

## Migration Steps

### Step 0: Write tests for core logic (safety net)

**What is done:**
- Create `FMStatsApp.Core.Tests` xUnit project
- Tests for `ScoringCalculator.AddRoleScoring` — create Player with known attribute values, verify exact scores
- Tests for `PlayerParser.ParseWage` and `ParseTransferValue`
- Tests for `HtmlParser` with a small HTML test file as fixture
- "Golden master": Run current app with a test file, save complete JSON output as reference

**What is unchanged:** Everything. No changes to existing app.

**Verification:** All tests pass.

**Rollback:** Delete the test project.

---

### Step 1: Create .NET Web API project

**What is done:**
- Create `FMStatsApp.Api` in the solution
- Move/copy Models and Services from Razor Pages app (unchanged logic)
- Create `PlayersController`: `POST /api/players/upload` — receives file, runs parser + scorer, returns `List<Player>` as JSON
- Create `RolesController`: `GET /api/roles` — returns role catalog grouped by position
- Configure CORS for Angular dev server
- Point test project to API project code

**What is unchanged:** Original Razor Pages app still works.

**Verification:** Swagger UI or curl — upload HTML file, see JSON response. Compare scores with Razor app. Tests still pass.

**Rollback:** Delete the API project.

**Key files to move:**
- `FMStatsApp/Services/HtmlParser.cs`
- `FMStatsApp/Services/ScoringCalculator.cs`
- `FMStatsApp/Services/RoleService.cs`
- `FMStatsApp/Models/Player.cs`
- `FMStatsApp/Models/Role.cs`
- `FMStatsApp/Models/RoleCatalog.cs`
- `FMStatsApp/Models/Formation.cs`

---

### Step 2: Create Angular app (upload + display)

**What is done:**
- Scaffold Angular app with `ng new`
- Build core components:
  - **Upload component** — file picker, sends to API, navigates to table
  - **Player table component** — sortable table with player data and role scores
  - **Role filter component** — checkboxes grouped by position, controls which role columns are shown
- Player service that calls the API and holds data in a signal
- Proxy config for development (`/api/*` → .NET backend)

**What is unchanged:** .NET API (Step 1) unchanged. Razor Pages app still works.

**Verification:** Upload same HTML file in both apps. Compare:
- Number of players
- Player attributes
- Role scores (sample 5-10 players)
- Sorting works
- Role filtering shows/hides correct columns

**Rollback:** Delete the Angular folder.

---

### Step 3: Polish and deployment

**What is done:**
- Configure .NET API to serve Angular's build output from `wwwroot`
- Error handling on both sides
- Design and styling (chosen separately — doesn't have to be Bootstrap)
- Loading indicator during upload

**Verification:** End-to-end test with real FM export files.

**Rollback:** Return to Step 2 (separate execution).

---

### Step 4: Clean up legacy project

**What is done:**
- Remove the old `FMStatsApp/` Razor Pages project from the solution and file system
- Ensure all tests still point to `FMStatsApp.Api` (should already be the case after Step 1)
- Clean up any unused dependencies in the solution

**Prerequisite:** Angular app is verified and produces identical results as the old app.

**Rollback:** Recreate via git history.

---

### Step 5 (future): Formation feature and additional features

Postponed until the basics are in place. `Formation.cs` and `RoleService.cs` already exist in the API project and are ready to be developed.

---

## Test strategy for calculation correctness

1. **Invariant test:** Player with all attributes = 10 → all role scores = exactly 10.0
2. **Known values:** Player with specific attributes → manually calculated expected scores
3. **Golden master:** Save complete output from current app as JSON, compare against API output field by field
4. **Float precision:** API calculates with `float`. Angular displays only — never recalculates. Rounding to 1 decimal on display (same as today)
