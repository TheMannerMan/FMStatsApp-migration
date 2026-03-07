# FMStatsApp Migrationsplan: Razor Pages → Angular + .NET Web API

## Kontext

FMStatsApp är en webbapplikation för Football Manager 2026. Användaren laddar upp en HTML-export från spelet, applikationen parsar spelardata (57 kolumner), beräknar poäng för 85 roller med viktade attribut, och visar resultaten i en sorterbar/filtrerbar tabell.

Idag är appen byggd som en ASP.NET Core 8.0 Razor Pages-app (server-side rendering med Bootstrap, jQuery, DataTables). Målet är att migrera till **Angular frontend + .NET Web API backend** — stegvis, med möjlighet att backa vid varje steg.

**Kärnkravet:** Beräkningslogiken (ScoringCalculator + RoleCatalog) MÅSTE ge identiska resultat efter migrering.

---

## Arkitektur

### Hur Angular + .NET kopplas ihop

```
[Angular SPA]  ---HTTP/JSON--->  [.NET Web API]
   port 4200                        port 5000
```

- Angular skickar HTTP-requests till RESTful API-endpoints
- Under utveckling: Angular dev-server proxar `/api/*` till .NET-backenden
- I produktion: .NET serverar Angulars kompilerade filer från `wwwroot` (en enda deployment)
- **Stateless API** — ingen session. Backenden tar emot fil, parsar, returnerar JSON. Angular håller all data i minnet

### Projektstruktur (mono-repo)

```
FMStatsApp_migration/
├── FMStatsApp.sln
├── FMStatsApp/                  # Original Razor Pages-app (behålls för jämförelse/rollback)
├── FMStatsApp.Api/              # Ny .NET 8 Web API
│   ├── Controllers/
│   │   ├── PlayersController.cs   # POST /api/players/upload
│   │   └── RolesController.cs     # GET /api/roles
│   ├── Models/                    # Flyttas från original (oförändrad logik)
│   └── Services/                  # Flyttas från original (oförändrad logik)
├── FMStatsApp.Core.Tests/       # xUnit testprojekt
│   ├── ScoringCalculatorTests.cs
│   ├── HtmlParserTests.cs
│   └── PlayerParserTests.cs
└── fm-stats-angular/            # Angular-app
    └── src/app/
        ├── services/
        ├── models/
        └── components/
            ├── upload/
            ├── player-table/
            └── role-filter/
```

---

## Verktyg & Teknologival

| Område | Val | Motivering |
|--------|-----|------------|
| **Backend** | .NET 10 Web API med Controllers | Senaste LTS-versionen, nytt projekt byggs från grunden |
| **Frontend** | Angular 19 (senaste stabila) | Standalone components, signals, modern DX |
| **UI-komponentbibliotek** | Bestäms i Steg 2 | PrimeNG (bra tabell-komponent) eller Angular Material — vi väljer det som passar bäst när vi bygger UI |
| **State management** | Angular services + signals | Enkel app, en datamängd (spelarlistan). Inget NgRx behövs |
| **HTTP** | Angular HttpClient | Inbyggt, hanterar filuppladdning och JSON |
| **Backend-tester** | xUnit | Standard för .NET |
| **Frontend-tester** | Jasmine/Karma (Angular default) | Tillräckligt för denna appstorlek |
| **HTML-parsning** | HtmlAgilityPack (befintlig) | Fungerar bra, ingen anledning att byta |

---

## Migreringssteg

### Steg 0: Skriv tester för kärnlogiken (säkerhetsnät)

**Vad görs:**
- Skapa `FMStatsApp.Core.Tests` xUnit-projekt
- Tester för `ScoringCalculator.AddRoleScoring` — skapa Player med kända attributvärden, verifiera exakta poäng
- Tester för `PlayerParser.ParseWage` och `ParseTransferValue`
- Tester för `HtmlParser` med en liten HTML-testfil som fixture
- "Golden master": Kör nuvarande appen med en testfil, spara komplett JSON-output som referens

**Vad är oförändrat:** Allt. Ingen ändring i befintlig app.

**Verifiering:** Alla tester passerar.

**Rollback:** Ta bort testprojektet.

---

### Steg 1: Skapa .NET Web API-projektet

**Vad görs:**
- Skapa `FMStatsApp.Api` i solutionen
- Flytta/kopiera Models och Services från Razor Pages-appen (oförändrad logik)
- Skapa `PlayersController`: `POST /api/players/upload` — tar emot fil, kör parser + scorer, returnerar `List<Player>` som JSON
- Skapa `RolesController`: `GET /api/roles` — returnerar rollkatalog grupperad per position
- Konfigurera CORS för Angular dev-server
- Peka testprojektet mot API-projektets kod

**Vad är oförändrat:** Originala Razor Pages-appen fungerar fortfarande.

**Verifiering:** Swagger UI eller curl — ladda upp HTML-fil, se JSON-svar. Jämför poäng med Razor-appen. Tester passerar fortfarande.

**Rollback:** Ta bort API-projektet.

**Nyckelfiler att flytta:**
- `FMStatsApp/Services/HtmlParser.cs`
- `FMStatsApp/Services/ScoringCalculator.cs`
- `FMStatsApp/Services/RoleService.cs`
- `FMStatsApp/Models/Player.cs`
- `FMStatsApp/Models/Role.cs`
- `FMStatsApp/Models/RoleCatalog.cs`
- `FMStatsApp/Models/Formation.cs`

---

### Steg 2: Skapa Angular-appen (uppladdning + visning)

**Vad görs:**
- Scaffolda Angular-app med `ng new`
- Bygga kärnkomponenter:
  - **Upload-komponent** — filväljare, skickar till API, navigerar till tabell
  - **Player table-komponent** — sorterbar tabell med spelardata och rollpoäng
  - **Role filter-komponent** — kryssrutor grupperade per position, styr vilka rollkolumner som visas
- Player-service som anropar API:et och håller data i en signal
- Proxy-config för utveckling (`/api/*` → .NET backend)

**Vad är oförändrat:** .NET API:et (Steg 1) oförändrat. Razor Pages-appen fungerar fortfarande.

**Verifiering:** Ladda upp samma HTML-fil i båda apparna. Jämför:
- Antal spelare
- Spelarattribut
- Rollpoäng (stickprov 5-10 spelare)
- Sortering fungerar
- Rollfiltrering visar/döljer rätt kolumner

**Rollback:** Ta bort Angular-mappen.

---

### Steg 3: Polering och produktionssättning

**Vad görs:**
- Konfigurera .NET API att serva Angulars build-output från `wwwroot`
- Felhantering på båda sidor
- Design och styling (väljs separat — behöver inte vara Bootstrap)
- Loading-indikator vid uppladdning

**Verifiering:** End-to-end-test med riktiga FM-exportfiler.

**Rollback:** Återgå till Steg 2 (separat körning).

---

### Steg 4: Städa bort legacy-projektet

**Vad görs:**
- Ta bort det gamla `FMStatsApp/` Razor Pages-projektet från solutionen och filsystemet
- Säkerställ att alla tester fortfarande pekar mot `FMStatsApp.Api` (bör redan vara fallet efter Steg 1)
- Rensa eventuella oanvända beroenden i solutionen

**Förutsättning:** Angular-appen är verifierad och ger identiska resultat som den gamla appen.

**Rollback:** Återskapa via git history.

---

### Steg 5 (framtid): Formationsfunktion och ytterligare features

Skjuts upp tills grunderna är på plats. `Formation.cs` och `RoleService.cs` finns redan i API-projektet och är redo att byggas ut.

---

## Teststrategi för beräkningskorrekthet

1. **Invariant-test:** Spelare med alla attribut = 10 → alla rollpoäng = exakt 10.0
2. **Kända värden:** Spelare med specifika attribut → manuellt beräknade förväntade poäng
3. **Golden master:** Spara komplett output från nuvarande app som JSON, jämför mot API-output fält för fält
4. **Float-precision:** API:et beräknar med `float`. Angular visar bara — räknar aldrig om. Avrundning till 1 decimal vid visning (samma som idag)
