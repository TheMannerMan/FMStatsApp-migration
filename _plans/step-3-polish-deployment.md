# Step 3: Polish and Deployment Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Angular + .NET app production-ready: merged single-process deployment, PrimeNG theme, better error handling, and end-to-end verification.

**Architecture:** .NET API serves the compiled Angular SPA from `wwwroot/`; all non-`/api/*` requests fall back to `index.html` so Angular handles client-side routing. Development workflow (separate ports + proxy) is unchanged.

**Tech Stack:** .NET 10 / ASP.NET Core, Angular 21, PrimeNG 21 + `@primeuix/themes`

---

## Context

Steps 1 (API) and 2 (Angular SPA) are complete and work in development mode (Angular dev server on :4200 proxied to .NET on :5215). Step 3 is about:

1. **Merged deployment** — `ng build` → `wwwroot/`, `dotnet run` serves everything on one port
2. **PrimeNG theme** — `@primeuix/themes` is installed but no theme is wired in; PrimeNG falls back to no styling
3. **Error handling** — controller has no try-catch; if the parser throws, the user sees a raw 500
4. **End-to-end verification** — confirm upload → display works with the test fixture

> **Note on HtmlParser tests:** The Step 0 memory records 3 skipped tests for column-index mismatch. These appear to have been resolved: `TestData/squad-export.html` and `HtmlParser.cs` are aligned (57 columns, [3]=Age, [4]=Wage, …, [15]=1v1). Verify with `dotnet test` before proceeding.

---

## File Map

| File | Change |
|------|--------|
| `fm-stats-angular/src/app/app.config.ts` | Add `providePrimeNG({ theme: { preset: Aura } })` |
| `fm-stats-angular/src/styles.scss` | Add `@layer primeng;` for CSS layer ordering |
| `fm-stats-angular/angular.json` | Set `outputPath` to target `wwwroot/` |
| `FMStatsApp.Api/Controllers/PlayersController.cs` | Add try-catch + 422 for 0 players |
| `FMStatsApp.Api/Program.cs` | Add `UseStaticFiles()` + `MapFallbackToFile("index.html")` |

---

## Task 1: Verify Test Baseline

**Files:** none modified

- [ ] **Step 1: Run all tests**

  ```bash
  dotnet test FMStatsApp.Core.Tests
  ```

  Expected: all pass, **0 skipped**. If any tests are skipped or failing, stop and investigate before continuing.

---

## Task 2: Apply PrimeNG Theme

**Files:**
- Modify: `fm-stats-angular/src/app/app.config.ts`
- Modify: `fm-stats-angular/src/styles.scss`

- [ ] **Step 1: Add `providePrimeNG` to app.config.ts**

  ```typescript
  import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
  import { provideRouter } from '@angular/router';
  import { provideHttpClient } from '@angular/common/http';
  import { providePrimeNG } from 'primeng/config';
  import Aura from '@primeuix/themes/aura';

  import { routes } from './app.routes';

  export const appConfig: ApplicationConfig = {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideRouter(routes),
      provideHttpClient(),
      providePrimeNG({ theme: { preset: Aura } })
    ]
  };
  ```

- [ ] **Step 2: Add CSS layer declaration to styles.scss**

  ```scss
  @layer primeng;
  ```

  This declares PrimeNG's CSS layer so browser specificity is correct.

- [ ] **Step 3: Start Angular dev server and visually verify PrimeNG table styling is applied**

  ```bash
  cd fm-stats-angular
  npm start
  ```

  Open `http://localhost:4200`, upload `TestData/squad-export.html`. The p-table should show PrimeNG Aura styling (clean bordered table, hover states, sort icons).

- [ ] **Step 4: Commit**

  ```bash
  git add fm-stats-angular/src/app/app.config.ts fm-stats-angular/src/styles.scss
  git commit -m "feat(angular): apply PrimeNG Aura theme"
  ```

---

## Task 3: Error Handling in PlayersController

**Files:**
- Modify: `FMStatsApp.Api/Controllers/PlayersController.cs`

The existing controller already validates null file and wrong extension. Add:
- try-catch around parsing (returns 400 with `{ message }` JSON if parser throws)
- 422 if the parser returns 0 players (wrong file, not an FM export)

- [ ] **Step 1: Update PlayersController.cs**

  ```csharp
  [HttpPost("upload")]
  public async Task<ActionResult<List<Player>>> Upload(IFormFile file)
  {
      if (file == null || file.Length == 0)
          return BadRequest(new { message = "No file provided." });

      if (!file.FileName.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
          return BadRequest(new { message = "File must be an HTML file." });

      List<Player> players;
      try
      {
          using var stream = file.OpenReadStream();
          players = _htmlParser.ParsedPlayers(stream);
      }
      catch (Exception ex)
      {
          return BadRequest(new { message = $"Failed to parse file: {ex.Message}" });
      }

      if (players.Count == 0)
          return UnprocessableEntity(new { message = "No players found. Make sure you upload an FM squad HTML export." });

      await _playerRepository.SaveAsync(players);

      return Ok(players);
  }
  ```

  Note: The existing `BadRequest("No file provided.")` returns a plain string. Changing to `new { message = ... }` ensures Angular's `err.error?.message` works consistently.

- [ ] **Step 2: Verify the API still starts**

  ```bash
  dotnet run --project FMStatsApp.Api
  ```

  Expected: listening on :5215. Check `http://localhost:5215/swagger` shows the upload endpoint.

- [ ] **Step 3: Commit**

  ```bash
  git add FMStatsApp.Api/Controllers/PlayersController.cs
  git commit -m "feat(api): add structured error responses to PlayersController"
  ```

---

## Task 4: Configure Angular Build Output → wwwroot

**Files:**
- Modify: `fm-stats-angular/angular.json`

Angular 17+'s `@angular/build:application` builder supports an `outputPath` object. Setting `browser: ""` puts files directly in the base directory instead of a `browser/` subdirectory — this simplifies .NET's `UseStaticFiles()` setup.

- [ ] **Step 1: Update outputPath in angular.json**

  In `angular.json`, inside `projects.fm-stats-angular.architect.build.options`, add:

  ```json
  "outputPath": {
    "base": "../FMStatsApp.Api/wwwroot",
    "browser": ""
  }
  ```

  The full `options` block becomes:

  ```json
  "options": {
    "outputPath": {
      "base": "../FMStatsApp.Api/wwwroot",
      "browser": ""
    },
    "browser": "src/main.ts",
    "tsConfig": "tsconfig.app.json",
    "inlineStyleLanguage": "scss",
    "assets": [
      {
        "glob": "**/*",
        "input": "public"
      }
    ],
    "styles": [
      "src/styles.scss"
    ]
  }
  ```

- [ ] **Step 2: Run the Angular build**

  ```bash
  cd fm-stats-angular
  npm run build
  ```

  Expected: build succeeds, files appear in `FMStatsApp.Api/wwwroot/` (index.html, main.js, etc.).

- [ ] **Step 3: Verify wwwroot contents**

  ```bash
  ls FMStatsApp.Api/wwwroot/
  ```

  Should show: `index.html`, `*.js`, `*.css` files from the Angular build.

- [ ] **Step 4: Add wwwroot to .gitignore (do not commit build output)**

  Check `.gitignore`. If `FMStatsApp.Api/wwwroot/` is not there, add:

  ```
  FMStatsApp.Api/wwwroot/
  ```

- [ ] **Step 5: Commit angular.json and .gitignore changes**

  ```bash
  git add fm-stats-angular/angular.json .gitignore
  git commit -m "feat(angular): set build output to FMStatsApp.Api/wwwroot"
  ```

---

## Task 5: Configure .NET to Serve Angular SPA

**Files:**
- Modify: `FMStatsApp.Api/Program.cs`

The middleware order matters: Swagger → CORS → StaticFiles → Controllers → FallbackToFile.

- [ ] **Step 1: Update Program.cs**

  ```csharp
  using FMStatsApp.Api.Repositories;
  using FMStatsApp.Services;

  var builder = WebApplication.CreateBuilder(args);

  builder.Services.AddControllers();
  builder.Services.AddEndpointsApiExplorer();
  builder.Services.AddSwaggerGen();

  builder.Services.AddScoped<ScoringCalculator>();
  builder.Services.AddScoped<HtmlParser>();
  builder.Services.AddScoped<IPlayerRepository, InMemoryPlayerRepository>();

  builder.Services.AddCors(options =>
  {
      options.AddPolicy("AngularDev", policy =>
      {
          policy.WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod();
      });
  });

  var app = builder.Build();

  if (app.Environment.IsDevelopment())
  {
      app.UseSwagger();
      app.UseSwaggerUI();
  }

  app.UseCors("AngularDev");
  app.UseStaticFiles();                    // Serves Angular files from wwwroot/
  app.MapControllers();                    // /api/* routes
  app.MapFallbackToFile("index.html");     // All other routes → Angular router

  app.Run();
  ```

- [ ] **Step 2: Build Angular (if not already built)**

  ```bash
  cd fm-stats-angular && npm run build
  ```

- [ ] **Step 3: Start the API and open the app**

  ```bash
  dotnet run --project FMStatsApp.Api
  ```

  Open `http://localhost:5215` in a browser. Expected: Angular upload page loads.

- [ ] **Step 4: Commit**

  ```bash
  git add FMStatsApp.Api/Program.cs
  git commit -m "feat(api): serve Angular SPA from wwwroot with fallback routing"
  ```

---

## Task 6: End-to-End Verification

**Files:** none modified

- [ ] **Step 1: Upload the test fixture via the merged app**

  With the API running on `http://localhost:5215`:
  - Navigate to `http://localhost:5215`
  - Upload `TestData/squad-export.html`
  - Expected: redirected to `/players`, table shows **9 players**, each with **85 role columns**

- [ ] **Step 2: Verify role filter**

  Uncheck "Goalkeeper" group. Expected: GKD, SKD, SKS, SKA columns disappear.

- [ ] **Step 3: Verify sorting**

  Click column header "Age". Expected: players sorted by age.

- [ ] **Step 4: Verify error handling**

  Upload a non-FM HTML file (e.g., a random `.html` file with no table). Expected: error message shown on upload page.

- [ ] **Step 5: Verify Angular routing on refresh**

  After uploading, while on `/players`, press F5. Expected: `index.html` is served, Angular rehydrates. Players will be empty (in-memory data, by design).

---

## Task 7: Update Migration Plan

- [ ] **Step 1: Mark Step 3 complete in MIGRATION_PLAN.md**

  Change `### Step 3: Polish and deployment` to `### Step 3: Polish and deployment ✅ DONE`

  Add notes:
  ```markdown
  **Notes for Step 4:**
  - Angular build output goes to `FMStatsApp.Api/wwwroot/` (gitignored). Run `npm run build` from `fm-stats-angular/` before deploying.
  - PrimeNG Aura theme configured via `providePrimeNG` in `app.config.ts` — no CSS imports needed.
  - API returns structured `{ message }` JSON on errors; Angular's `err.error?.message` reads this.
  ```

  ```bash
  git add MIGRATION_PLAN.md
  git commit -m "docs: mark step 3 complete in migration plan"
  ```

---

## Verification Summary

| Check | Command | Expected |
|-------|---------|----------|
| Tests pass | `dotnet test FMStatsApp.Core.Tests` | All green, 0 skipped |
| Angular build succeeds | `cd fm-stats-angular && npm run build` | Exit 0, files in `wwwroot/` |
| API starts with SPA | `dotnet run --project FMStatsApp.Api` | Listening on :5215 |
| Upload works | Browser: upload squad-export.html | 9 players, 85 role cols |
| Theme visible | Visual inspection | PrimeNG Aura styling on table |
| Error handling | Upload wrong file | Error message displayed |
