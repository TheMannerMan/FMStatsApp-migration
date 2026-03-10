# Step 1: Create FMStatsApp.Api — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a .NET 10 Web API project with `POST /api/players/upload` and `GET /api/roles` endpoints, containing all core logic from the Razor Pages app, while keeping the original app untouched.

**Architecture:**
The API follows a three-layer structure: **Domain** (Models + RoleCatalog — pure C#, no HTTP knowledge), **Application** (Services: HtmlParser, ScoringCalculator — business logic), and **Presentation** (Controllers — thin HTTP adapters that delegate to services). A `Repositories/` layer is introduced as an abstraction for player storage — currently a no-op since the API is stateless, but designed so a database implementation can be swapped in later with zero controller changes.

**Why `IPlayerRepository` now?** The controller calls `await _playerRepository.SaveAsync(players)` today (no-op). Future: add `DbPlayerRepository : IPlayerRepository`, change one DI line in `Program.cs`, done. The controller never changes.

**Why constructor-inject `ScoringCalculator` into `HtmlParser`?** The original code does `new ScoringCalculator()` inside the method — tight coupling. Injecting via constructor makes both services independently resolvable by the DI container and individually testable.

**Why copy files (not move)?** The original Razor Pages app must still compile and run for rollback purposes. Both projects hold their own copies with identical namespaces.

**Tech Stack:** .NET 10 Web API, HtmlAgilityPack, xUnit (existing), Swagger/OpenAPI

---

## Task A — Scaffold API project

**Files:**
- Create: `FMStatsApp.Api/` (via `dotnet new`)
- Modify: `FMStatsApp.sln` (via `dotnet sln add`)

### Step 1: Create the project
```bash
dotnet new webapi --use-controllers --no-https --framework net10.0 \
  --output FMStatsApp.Api --name FMStatsApp.Api
```
Expected: `The template "ASP.NET Core Web API" was created successfully.`

`--use-controllers`: creates a controllers-based project (not minimal API — we need routing attributes).
`--no-https`: avoids dev certificate friction; HTTPS added in Step 3 polish.

### Step 2: Add HtmlAgilityPack NuGet
```bash
dotnet add FMStatsApp.Api/FMStatsApp.Api.csproj package HtmlAgilityPack
```
Required because `Role.cs` contains `using HtmlAgilityPack;` and `HtmlParser.cs` uses it.

### Step 3: Add project to solution
```bash
dotnet sln FMStatsApp.sln add FMStatsApp.Api/FMStatsApp.Api.csproj
```

### Step 4: Verify API project builds
```bash
dotnet build FMStatsApp.Api/FMStatsApp.Api.csproj
```
Expected: `Build succeeded.`

### Step 5: Verify existing tests still pass
```bash
dotnet test FMStatsApp.Core.Tests/FMStatsApp.Core.Tests.csproj
```
Expected: All tests pass (tests still reference old project — unchanged).

### Step 6: Commit
```bash
git add FMStatsApp.Api/ FMStatsApp.sln
git commit -m "feat: scaffold FMStatsApp.Api project"
```

---

## Task B — Copy models and services

**Files:**
- Create: `FMStatsApp.Api/Models/` (4 files copied)
- Create: `FMStatsApp.Api/Services/` (3 files copied, HtmlParser modified)

> Keep namespaces `FMStatsApp.Models` and `FMStatsApp.Services` identical to the original. This way zero `using` statements in tests need updating.

### Step 1: Create directories
```bash
mkdir -p FMStatsApp.Api/Models FMStatsApp.Api/Services FMStatsApp.Api/Repositories
```

### Step 2: Copy models (unchanged)
```bash
cp FMStatsApp/Models/Player.cs FMStatsApp.Api/Models/Player.cs
cp FMStatsApp/Models/Role.cs FMStatsApp.Api/Models/Role.cs
cp FMStatsApp/Models/RoleCatalog.cs FMStatsApp.Api/Models/RoleCatalog.cs
cp FMStatsApp/Models/Formation.cs FMStatsApp.Api/Models/Formation.cs
```

### Step 3: Copy ScoringCalculator and RoleService (unchanged)
```bash
cp FMStatsApp/Services/ScoringCalculator.cs FMStatsApp.Api/Services/ScoringCalculator.cs
cp FMStatsApp/Services/RoleService.cs FMStatsApp.Api/Services/RoleService.cs
```

### Step 4: Copy HtmlParser and apply constructor injection
```bash
cp FMStatsApp/Services/HtmlParser.cs FMStatsApp.Api/Services/HtmlParser.cs
```

Edit `FMStatsApp.Api/Services/HtmlParser.cs` — add a private field and constructor, remove inline instantiation:

```csharp
public class HtmlParser
{
    private readonly ScoringCalculator _scoringCalculator;

    public HtmlParser(ScoringCalculator scoringCalculator)
    {
        _scoringCalculator = scoringCalculator;
    }

    public List<Player> ParsedPlayers(Stream htmlFileStream)
    {
        // Remove: var scoringCalculator = new ScoringCalculator();
        // All calls: scoringCalculator.AddRoleScoring(player)
        //        → _scoringCalculator.AddRoleScoring(player)
```

> Do NOT edit `FMStatsApp/Services/HtmlParser.cs` (the original). Only the copied version in `FMStatsApp.Api/`.

### Step 5: Verify API project builds
```bash
dotnet build FMStatsApp.Api/FMStatsApp.Api.csproj
```
Expected: `Build succeeded.`

### Step 6: Commit
```bash
git add FMStatsApp.Api/Models/ FMStatsApp.Api/Services/
git commit -m "feat: copy models and services into FMStatsApp.Api"
```

---

## Task C — Add repository abstraction

**Files:**
- Create: `FMStatsApp.Api/Repositories/IPlayerRepository.cs`
- Create: `FMStatsApp.Api/Repositories/InMemoryPlayerRepository.cs`

> This is the extensibility point. A future `DatabasePlayerRepository : IPlayerRepository` swaps in via one DI line change. No controller changes needed.

### Step 1: Write `IPlayerRepository.cs`
```csharp
using FMStatsApp.Models;

namespace FMStatsApp.Api.Repositories;

public interface IPlayerRepository
{
    Task SaveAsync(IEnumerable<Player> players);
    Task<IEnumerable<Player>> GetAllAsync();
}
```
`Task` (not `void`) because a real DB implementation will do async I/O.

### Step 2: Write `InMemoryPlayerRepository.cs`
```csharp
using FMStatsApp.Models;

namespace FMStatsApp.Api.Repositories;

public class InMemoryPlayerRepository : IPlayerRepository
{
    // No-op: API is stateless. Data is returned directly in the upload response.
    // Future: replace with DatabasePlayerRepository to persist uploaded squads.
    public Task SaveAsync(IEnumerable<Player> players) => Task.CompletedTask;

    public Task<IEnumerable<Player>> GetAllAsync() =>
        Task.FromResult(Enumerable.Empty<Player>());
}
```

### Step 3: Verify build
```bash
dotnet build FMStatsApp.Api/FMStatsApp.Api.csproj
```

### Step 4: Commit
```bash
git add FMStatsApp.Api/Repositories/
git commit -m "feat: add IPlayerRepository with no-op in-memory implementation"
```

---

## Task D — Create controllers and configure Program.cs

**Files:**
- Delete: `FMStatsApp.Api/Controllers/WeatherForecastController.cs`
- Delete: `FMStatsApp.Api/WeatherForecast.cs`
- Create: `FMStatsApp.Api/Controllers/PlayersController.cs`
- Create: `FMStatsApp.Api/Controllers/RolesController.cs`
- Modify: `FMStatsApp.Api/Program.cs`

### Step 1: Delete template artifacts
```bash
rm FMStatsApp.Api/Controllers/WeatherForecastController.cs
rm FMStatsApp.Api/WeatherForecast.cs
```

### Step 2: Write `PlayersController.cs`
```csharp
using FMStatsApp.Api.Repositories;
using FMStatsApp.Models;
using FMStatsApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace FMStatsApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly HtmlParser _htmlParser;
    private readonly IPlayerRepository _playerRepository;

    public PlayersController(HtmlParser htmlParser, IPlayerRepository playerRepository)
    {
        _htmlParser = htmlParser;
        _playerRepository = playerRepository;
    }

    [HttpPost("upload")]
    public async Task<ActionResult<List<Player>>> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided.");

        if (!file.FileName.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
            return BadRequest("File must be an HTML file.");

        using var stream = file.OpenReadStream();
        var players = _htmlParser.ParsedPlayers(stream);

        await _playerRepository.SaveAsync(players);

        return Ok(players);
    }
}
```

`IFormFile` is the standard ASP.NET Core file upload type — Angular's `FormData` maps to it directly.
`_playerRepository.SaveAsync(players)` is a no-op today; future DB implementation persists here without any controller change.

### Step 3: Write `RolesController.cs`
```csharp
using FMStatsApp.Models;
using Microsoft.AspNetCore.Mvc;

namespace FMStatsApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    [HttpGet]
    public ActionResult<Dictionary<string, List<object>>> GetAll()
    {
        var grouped = RoleCatalog.AllRoles
            .GroupBy(r => r.GeneralPosition.ToString())
            .ToDictionary(
                g => g.Key,
                g => g.Select(r => new
                {
                    roleName = r.Name,
                    shortRoleName = r.ShortName,
                    positions = r.Positions.Select(p => p.ToString()).ToList()
                }).Cast<object>().ToList()
            );

        return Ok(grouped);
    }
}
```

Groups by `GeneralPosition` (Goalkeeper/Defender/Midfielder/Forward) — the natural grouping Angular needs for role-filter checkboxes. Returns `shortRoleName` for column headers and `positions` for filtering logic.

### Step 4: Replace `Program.cs`
```csharp
using FMStatsApp.Api.Repositories;
using FMStatsApp.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Domain services
builder.Services.AddScoped<ScoringCalculator>();
builder.Services.AddScoped<HtmlParser>();

// Repository — swap InMemoryPlayerRepository for a DB implementation here in a future step
builder.Services.AddScoped<IPlayerRepository, InMemoryPlayerRepository>();

// CORS: allow Angular dev server
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

app.UseCors("AngularDev"); // Must be before MapControllers
app.MapControllers();

app.Run();
```

`AddScoped` for services: each HTTP request gets its own instance — correct for request-scoped parsing work.
`UseCors` before `MapControllers`: middleware order matters — CORS headers must be written before the response is generated.

### Step 5: Verify build
```bash
dotnet build FMStatsApp.Api/FMStatsApp.Api.csproj
```
Expected: `Build succeeded. 0 Warning(s), 0 Error(s).`

### Step 6: Commit
```bash
git add FMStatsApp.Api/Controllers/ FMStatsApp.Api/Program.cs
git commit -m "feat: add PlayersController, RolesController and configure DI/CORS"
```

---

## Task E — Switch test project to the new API

**Files:**
- Modify: `FMStatsApp.Core.Tests/FMStatsApp.Core.Tests.csproj`
- Modify: `FMStatsApp.Core.Tests/HtmlParserTests.cs`

### Step 1: Update project reference in `.csproj`

In `FMStatsApp.Core.Tests/FMStatsApp.Core.Tests.csproj`, change:
```xml
<ProjectReference Include="..\FMStatsApp\FMStatsApp.csproj" />
```
To:
```xml
<ProjectReference Include="..\FMStatsApp.Api\FMStatsApp.Api.csproj" />
```

### Step 2: Run tests — expect compile failure in HtmlParserTests (this is the expected "red" phase)
```bash
dotnet test FMStatsApp.Core.Tests/FMStatsApp.Core.Tests.csproj
```
Expected failure:
```
error CS7036: There is no argument given that corresponds to the required
parameter 'scoringCalculator' of 'HtmlParser.HtmlParser(ScoringCalculator)'
```
`ScoringCalculatorTests` and `PlayerParserTests` will still pass — they don't touch `HtmlParser`.

### Step 3: Fix HtmlParserTests — inject ScoringCalculator

In `FMStatsApp.Core.Tests/HtmlParserTests.cs`, replace every occurrence of:
```csharp
new HtmlParser()
```
With:
```csharp
new HtmlParser(new ScoringCalculator())
```
There are 6 occurrences (one per test method). No logic changes — just constructor call.

### Step 4: Run tests — expect all green
```bash
dotnet test FMStatsApp.Core.Tests/FMStatsApp.Core.Tests.csproj --verbosity normal
```
Expected:
```
Passed! - Failed: 0, Passed: 19, Skipped: 0, Total: 19
```

### Step 5: Verify original Razor Pages app still builds
```bash
dotnet build FMStatsApp/FMStatsApp.csproj
```
Expected: `Build succeeded.` (it is completely untouched)

### Step 6: Commit
```bash
git add FMStatsApp.Core.Tests/
git commit -m "test: point test project at FMStatsApp.Api and update HtmlParser construction"
```

---

## Task F — Manual verification

### Step 1: Start the API
```bash
dotnet run --project FMStatsApp.Api/FMStatsApp.Api.csproj
```
Note the port shown in console output (e.g., `http://localhost:5000`).

### Step 2: Test GET /api/roles via Swagger
Navigate to `http://localhost:<port>/swagger`.

Expected: JSON with keys `"Goalkeeper"`, `"Defender"`, `"Midfielder"`, `"Forward"`. Total roles across all groups: 85.

### Step 3: Test POST /api/players/upload via Swagger
Upload `TestData/squad-export.html`.

Expected:
- HTTP 200
- JSON array of 9 players
- First player: `"name": "Adrian Kurd Rønning"`, `"age": 18`
- Each player has `"roles"` array with 85 entries
- GKD role score for first player matches the value verified in `HtmlParserTests`

### Step 4: Mark Step 1 complete in MIGRATION_PLAN.md
Update `MIGRATION_PLAN.md` to note Step 1 is done and add a note about the HtmlParser constructor injection change (relevant for Step 2 when Angular sends files).

---

## Files Changed Summary

| File | Action |
|------|--------|
| `FMStatsApp.Api/FMStatsApp.Api.csproj` | Created (dotnet new + HtmlAgilityPack) |
| `FMStatsApp.Api/Program.cs` | Replaced (DI, CORS, Swagger) |
| `FMStatsApp.Api/Models/Player.cs` | Copied unchanged |
| `FMStatsApp.Api/Models/Role.cs` | Copied unchanged |
| `FMStatsApp.Api/Models/RoleCatalog.cs` | Copied unchanged |
| `FMStatsApp.Api/Models/Formation.cs` | Copied unchanged |
| `FMStatsApp.Api/Services/ScoringCalculator.cs` | Copied unchanged |
| `FMStatsApp.Api/Services/RoleService.cs` | Copied unchanged |
| `FMStatsApp.Api/Services/HtmlParser.cs` | Copied + constructor injection added |
| `FMStatsApp.Api/Repositories/IPlayerRepository.cs` | Created new |
| `FMStatsApp.Api/Repositories/InMemoryPlayerRepository.cs` | Created new (no-op) |
| `FMStatsApp.Api/Controllers/PlayersController.cs` | Created new |
| `FMStatsApp.Api/Controllers/RolesController.cs` | Created new |
| `FMStatsApp.Api/Controllers/WeatherForecastController.cs` | Deleted (template) |
| `FMStatsApp.Api/WeatherForecast.cs` | Deleted (template) |
| `FMStatsApp.Core.Tests/FMStatsApp.Core.Tests.csproj` | Modified (ProjectReference) |
| `FMStatsApp.Core.Tests/HtmlParserTests.cs` | Modified (6x constructor call) |
| `FMStatsApp.sln` | Modified (dotnet sln add) |
| `MIGRATION_PLAN.md` | Updated (mark step complete) |

**Not changed:** Anything in `FMStatsApp/` (original Razor Pages app)
