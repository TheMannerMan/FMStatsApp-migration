# Step 0: Write Tests for Core Parsing and Scoring Logic

## Context

FMStatsApp is being migrated from Razor Pages to Angular + .NET Web API. The core parsing and scoring logic (HtmlParser, ScoringCalculator, PlayerParser) must produce identical results after migration. Step 0 establishes a test suite that locks in the **specification** of correct behavior — independently of the old Razor Pages app — so any regression during Steps 1–4 is caught immediately.

Key constraint: Tests must express what the correct output *should be* (hand-verified or mathematically provable), not just "matches what the old app produced." This means no golden master approach.

---

## What needs to be created

The test project directory exists (`FMStatsApp.Core.Tests/`) with bin/obj but has no `.csproj` and no test files. The solution file only includes the Razor Pages project.

### Files to create

1. `FMStatsApp.Core.Tests/FMStatsApp.Core.Tests.csproj`
2. `FMStatsApp.Core.Tests/ScoringCalculatorTests.cs`
3. `FMStatsApp.Core.Tests/PlayerParserTests.cs`
4. `FMStatsApp.Core.Tests/HtmlParserTests.cs`

### Files to modify

5. `FMStatsApp.sln` — add the test project reference

---

## Implementation Details

### 1. FMStatsApp.Core.Tests.csproj

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <IsPackable>false</IsPackable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="xunit" Version="2.9.*" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.8.*" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.*" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\FMStatsApp\FMStatsApp.csproj" />
  </ItemGroup>
  <ItemGroup>
    <!-- Copy TestData to output directory -->
    <Content Include="..\TestData\squad-export.html">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      <Link>TestData\squad-export.html</Link>
    </Content>
  </ItemGroup>
</Project>
```

**Note:** Target `net10.0`. References `FMStatsApp.csproj` for now — in Step 1 this will be updated to reference `FMStatsApp.Api.csproj` once the logic is moved there.

---

### 2. ScoringCalculatorTests.cs

Tests the core scoring formula: `score = sum(attributeValue * weight) / sum(weights)`

**Test cases:**

**Invariant test (mathematically provable):**
- Player with ALL integer attributes = 10 → every role score = exactly 10.0f
- Rationale: `(10 * weightSum) / weightSum = 10`

**Known-value test (hand-calculated for GKD):**
GKD weights: OneVsOne=1, AerialAbility=3, Agility=5, Anticipation=1, CommandOfArea=3, Concentration=3, Decisions=1, Handling=3, JumpingReach=0, Kicking=3, Passing=3, Positioning=5, Reflexes=5, Throwing=1 → weightSum=37

Set a player with: all attributes = 10, except Agility=15, Reflexes=14, Positioning=12.
- totalScore = 10×37 + (15−10)×5 + (14−10)×5 + (12−10)×5 = 370+25+20+10 = 425
- expectedScore = 425f / 37f ≈ 11.486...
- Assert: `Math.Abs(gkdScore - (425f/37f)) < 0.001f`

**Zero attributes test:**
- Player with all attributes = 0 → every role score = 0.0f

**Role count test:**
- Result contains exactly 85 roles (matches `RoleCatalog.AllRoles.Count`)

---

### 3. PlayerParserTests.cs

Tests `Player.PlayerParser.ParseWage(string)` and `Player.PlayerParser.ParseTransferValue(string)`.

**ParseWage:**
| Input | Expected |
|-------|----------|
| `"€11,250 p/w"` | 11250 |
| `"€1,000 p/w"` | 1000 |
| `"€500 p/w"` | 500 |
| `""` | 0 |
| `null` / whitespace | 0 |

**ParseTransferValue:**
| Input | Expected |
|-------|----------|
| `"€27M - €33M"` | 27000000 |
| `"€500K - €1M"` | 500000 |
| `"€1.5M - €2M"` | 1500000 |
| `""` | 0 |
| `"Not for sale"` | 0 |

**Known discrepancy:** `HtmlParser.cs` does NOT call `ParseWage` when parsing HTML — it uses its own inline string replacement on line 30. `ParseWage` is tested as a standalone utility only.

---

### 4. HtmlParserTests.cs

Tests `HtmlParser.ParsedPlayers(Stream)` using `TestData/squad-export.html`.

**Test cases:**

- Parse returns non-empty list
- Player count matches known row count in fixture
- Every player has `Roles != null && Roles.Count == 85`
- Spot check: known player's attributes and one hand-calculated role score
- Empty/malformed stream returns empty list (no exception)

---

## Critical files

| File | Action |
|------|--------|
| `FMStatsApp.Core.Tests/FMStatsApp.Core.Tests.csproj` | Create |
| `FMStatsApp.Core.Tests/ScoringCalculatorTests.cs` | Create |
| `FMStatsApp.Core.Tests/PlayerParserTests.cs` | Create |
| `FMStatsApp.Core.Tests/HtmlParserTests.cs` | Create |
| `FMStatsApp.sln` | Modify (add test project) |
| `TestData/squad-export.html` | Read-only fixture |

Logic tested lives in:
- `FMStatsApp/Services/ScoringCalculator.cs` — `AddRoleScoring(Player)`
- `FMStatsApp/Services/HtmlParser.cs` — `ParsedPlayers(Stream)`
- `FMStatsApp/Models/Player.cs` — `PlayerParser.ParseWage` / `ParseTransferValue`
- `FMStatsApp/Models/RoleCatalog.cs` — read-only reference data

---

## Verification

```bash
dotnet test FMStatsApp.Core.Tests/FMStatsApp.Core.Tests.csproj --verbosity normal
```

All tests must pass with 0 failures. No changes to `FMStatsApp/` (Razor Pages app stays untouched).

**Rollback:** Delete `FMStatsApp.Core.Tests/` and remove it from the solution.
