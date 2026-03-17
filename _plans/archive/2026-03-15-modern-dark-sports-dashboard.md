# Modern Dark Sports Dashboard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the FM Stats Angular app as a modern dark sports analytics dashboard using PrimeNG Aura dark theme, a sticky header with nav, drag-and-drop upload, frozen Name column, and a slide-out role filter drawer.

**Architecture:** PrimeNG Aura dark theme applied globally via `providePrimeNG` in `app.config.ts`; CSS custom properties (design tokens) defined in `styles.scss` and consumed by all components; no new data features — purely design/UX overhaul. Drawer toggle state lives in `PlayerTableComponent`; filter checkbox state lives in `PlayerService` (naturally persists across drawer open/close).

**Tech Stack:** Angular 21, PrimeNG 21.1.3, @primeuix/themes 2.0.3 (Aura preset), SCSS, Vitest (unit), Playwright/Firefox (E2E).

**Answers to open questions:**
- Dark-only (no toggle)
- Accent color: emerald green `#10b981`
- Header: branding + nav links (Upload / Players)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `fm-stats-angular/src/app/app.config.ts` | Add `providePrimeNG` with Aura dark |
| Modify | `fm-stats-angular/src/index.html` | Add `class="app-dark"` to `<html>` |
| Modify | `fm-stats-angular/src/styles.scss` | CSS design tokens (colors, spacing) |
| Create | `fm-stats-angular/src/app/components/app-header/app-header.component.ts` | Sticky header with nav links |
| Create | `fm-stats-angular/src/app/components/app-header/app-header.component.html` | Header template |
| Create | `fm-stats-angular/src/app/components/app-header/app-header.component.scss` | Header styles |
| Create | `fm-stats-angular/src/app/components/app-header/app-header.component.spec.ts` | Header unit tests |
| Modify | `fm-stats-angular/src/app/app.html` | Add `<app-header>` above `<router-outlet>` |
| Modify | `fm-stats-angular/src/app/app.ts` | Import `AppHeaderComponent` |
| Modify | `fm-stats-angular/src/app/app.scss` | Global layout (header height offset) |
| Modify | `fm-stats-angular/src/app/components/upload/upload.component.ts` | Add drag-and-drop state + handlers |
| Modify | `fm-stats-angular/src/app/components/upload/upload.component.html` | Drag-and-drop zone, icon, CTA |
| Modify | `fm-stats-angular/src/app/components/upload/upload.component.scss` | Dark styled upload zone |
| Modify | `fm-stats-angular/src/app/components/upload/upload.component.spec.ts` | Add drag-and-drop tests |
| Modify | `fm-stats-angular/src/app/components/role-filter/role-filter.component.html` | Remove container, style for drawer |
| Modify | `fm-stats-angular/src/app/components/role-filter/role-filter.component.scss` | Dark drawer content styles |
| Modify | `fm-stats-angular/src/app/components/player-table/player-table.component.ts` | Add drawer toggle, import DrawerModule |
| Modify | `fm-stats-angular/src/app/components/player-table/player-table.component.html` | Frozen Name col, p-drawer wrapping role-filter |
| Modify | `fm-stats-angular/src/app/components/player-table/player-table.component.scss` | Token-based score colors |
| Create | `fm-stats-angular/src/app/components/player-table/player-table.component.spec.ts` | Frozen col + drawer button tests |
| Modify | `fm-stats-angular/tests/dashboard.spec.ts` | Full E2E coverage per acceptance criteria |

---

## Chunk 1: Foundation — Theme, Tokens, Header

### Task 1: Configure PrimeNG Aura dark theme + CSS design tokens

**Files:**
- Modify: `fm-stats-angular/src/app/app.config.ts`
- Modify: `fm-stats-angular/src/index.html`
- Modify: `fm-stats-angular/src/styles.scss`

- [ ] **Step 0: Write a failing E2E test for dark theme (TDD — before implementation)**

Add to `fm-stats-angular/tests/dashboard.spec.ts` (replace existing minimal test):

```typescript
import { test, expect } from '@playwright/test';

test('app loads and has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/FM Stats/i);
});

test('body background is dark after theme is applied', async ({ page }) => {
  await page.goto('/');
  const bg = await page.evaluate(() =>
    getComputedStyle(document.body).backgroundColor
  );
  expect(bg).not.toBe('rgb(255, 255, 255)');
  const parts = bg.match(/\d+/g)?.map(Number) ?? [];
  const brightness = parts.slice(0, 3).reduce((a, b) => a + b, 0);
  expect(brightness).toBeLessThan(200);
});
```

Run to confirm the dark-theme test fails (app is currently unstyled):

```bash
cd fm-stats-angular && npm run e2e -- --grep "dark" 2>&1 | tail -20
```

Expected: FAIL — body background is white (rgb(255, 255, 255)).

- [ ] **Step 1: Add `class="app-dark"` to `<html>` in index.html**

```html
<!doctype html>
<html lang="en" class="app-dark">
<head>
  <meta charset="utf-8">
  <title>FM Stats</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

- [ ] **Step 2: Configure PrimeNG with Aura dark preset in app.config.ts**

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
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
  ],
};
```

- [ ] **Step 3: Define CSS design tokens in styles.scss**

```scss
/* FM Stats Design Tokens */
:root {
  --color-bg-primary: #0f1117;
  --color-bg-surface: #1a1d27;
  --color-bg-card: #1e2130;
  --color-accent: #10b981;
  --color-accent-hover: #059669;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-border: #2d3148;
  --color-score-high-bg: #064e3b;
  --color-score-high-text: #6ee7b7;
  --color-score-medium-bg: #78350f;
  --color-score-medium-text: #fcd34d;
  --color-score-low-bg: #7f1d1d;
  --color-score-low-text: #fca5a5;
  --header-height: 60px;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

- [ ] **Step 4: Verify the app compiles**

```bash
cd fm-stats-angular && ng build --configuration development 2>&1 | tail -20
```

Expected: Build succeeds (no errors). Warnings about budget are fine.

- [ ] **Step 5: Commit**

```bash
git add src/app/app.config.ts src/index.html src/styles.scss
git commit -m "feat: configure PrimeNG Aura dark theme and CSS design tokens"
```

---

### Task 2: AppHeaderComponent (TDD)

**Files:**
- Create: `fm-stats-angular/src/app/components/app-header/app-header.component.spec.ts`
- Create: `fm-stats-angular/src/app/components/app-header/app-header.component.ts`
- Create: `fm-stats-angular/src/app/components/app-header/app-header.component.html`
- Create: `fm-stats-angular/src/app/components/app-header/app-header.component.scss`
- Modify: `fm-stats-angular/src/app/app.html`
- Modify: `fm-stats-angular/src/app/app.ts`
- Modify: `fm-stats-angular/src/app/app.scss`

- [ ] **Step 1: Write failing unit tests for AppHeaderComponent**

Create `fm-stats-angular/src/app/components/app-header/app-header.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { AppHeaderComponent } from './app-header.component';

describe('AppHeaderComponent', () => {
  let fixture: ComponentFixture<AppHeaderComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(AppHeaderComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders the app title "FM Stats"', () => {
    expect(element.textContent).toContain('FM Stats');
  });

  it('has a nav link to /upload', () => {
    const links = element.querySelectorAll('a[href]');
    const hrefs = Array.from(links).map(a => a.getAttribute('href'));
    expect(hrefs).toContain('/upload');
  });

  it('has a nav link to /players', () => {
    const links = element.querySelectorAll('a[href]');
    const hrefs = Array.from(links).map(a => a.getAttribute('href'));
    expect(hrefs).toContain('/players');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd fm-stats-angular && ng test --include="**/app-header/**" 2>&1 | tail -20
```

Expected: FAIL — AppHeaderComponent not found.

- [ ] **Step 3: Implement AppHeaderComponent**

Create `fm-stats-angular/src/app/components/app-header/app-header.component.ts`:

```typescript
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
})
export class AppHeaderComponent {}
```

Create `fm-stats-angular/src/app/components/app-header/app-header.component.html`:

```html
<header class="app-header">
  <div class="app-header__brand">
    <span class="app-header__icon">⚽</span>
    <span class="app-header__title">FM Stats</span>
  </div>
  <nav class="app-header__nav">
    <a href="/upload" routerLink="/upload" routerLinkActive="active">Upload</a>
    <a href="/players" routerLink="/players" routerLinkActive="active">Players</a>
  </nav>
</header>
```

Create `fm-stats-angular/src/app/components/app-header/app-header.component.scss`:

```scss
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  z-index: 100;

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &__icon {
    font-size: 1.4rem;
  }

  &__title {
    letter-spacing: 0.03em;
  }

  &__nav {
    display: flex;
    gap: 0.25rem;

    a {
      color: var(--color-text-secondary);
      text-decoration: none;
      padding: 0.4rem 0.9rem;
      border-radius: 6px;
      font-size: 0.9rem;
      transition: color 0.15s, background-color 0.15s;

      &:hover {
        color: var(--color-text-primary);
        background-color: var(--color-bg-card);
      }

      &.active {
        color: var(--color-accent);
        background-color: rgba(16, 185, 129, 0.1);
      }
    }
  }
}
```

- [ ] **Step 4: Wire AppHeaderComponent into the app shell**

Edit `fm-stats-angular/src/app/app.ts`:

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlayerService } from './services/player.service';
import { AppHeaderComponent } from './components/app-header/app-header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private playerService = inject(PlayerService);

  ngOnInit(): void {
    this.playerService.loadRoles();
  }
}
```

Edit `fm-stats-angular/src/app/app.html`:

```html
<app-header />
<main class="app-content">
  <router-outlet />
</main>
```

Edit `fm-stats-angular/src/app/app.scss`:

```scss
.app-content {
  padding-top: var(--header-height);
  min-height: 100vh;
  background-color: var(--color-bg-primary);
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
cd fm-stats-angular && ng test --include="**/app-header/**" 2>&1 | tail -20
```

Expected: PASS — 3 tests passing.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/app-header/ src/app/app.ts src/app/app.html src/app/app.scss
git commit -m "feat: add sticky AppHeaderComponent with FM Stats branding and nav links"
```

---

## Chunk 2: Upload Redesign

### Task 3: UploadComponent drag-and-drop (TDD)

**Files:**
- Modify: `fm-stats-angular/src/app/components/upload/upload.component.spec.ts`
- Modify: `fm-stats-angular/src/app/components/upload/upload.component.ts`
- Modify: `fm-stats-angular/src/app/components/upload/upload.component.html`
- Modify: `fm-stats-angular/src/app/components/upload/upload.component.scss`

- [ ] **Step 1: Write failing tests for drag-and-drop behavior**

Replace `upload.component.spec.ts` with:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UploadComponent } from './upload.component';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';

function mockPlayer(overrides: Partial<Player> = {}): Player {
  return {
    uid: 1, name: 'Test Player', age: 25, club: 'Test FC', nationality: 'Swedish',
    position: 'MC', wage: 1000, transferValue: 500000, averageRating: 7.0,
    roles: [], reg: '', inf: '', secondNationality: '', personality: '',
    mediaHandling: '', leftFoot: 'Strong', rightFoot: 'Weak', height: 180,
    oneVsOne: 10, acceleration: 12, aerialAbility: 8, aggression: 11, agility: 13,
    anticipation: 14, balance: 12, bravery: 10, commandOfArea: 5, concentration: 13,
    composure: 12, crossing: 11, decisions: 14, determination: 15, dribbling: 12,
    finishing: 11, firstTouch: 13, flair: 10, handling: 5, heading: 9,
    jumpingReach: 11, kicking: 5, leadership: 8, longShots: 10, marking: 13,
    offTheBall: 12, pace: 13, passing: 14, positioning: 13, reflexes: 5,
    stamina: 14, strength: 11, tackling: 13, teamwork: 14, technique: 12,
    throwing: 5, throwOuts: 5, vision: 13, workRate: 14, corners: 10,
    ...overrides,
  };
}

describe('UploadComponent', () => {
  let fixture: ComponentFixture<UploadComponent>;
  let component: UploadComponent;
  let element: HTMLElement;
  let httpMock: HttpTestingController;
  let playerService: PlayerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    httpMock = TestBed.inject(HttpTestingController);
    playerService = TestBed.inject(PlayerService);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  describe('existing upload behavior', () => {
    it('calls setPlayers after successful upload', () => {
      const spy = vi.spyOn(playerService, 'setPlayers');
      // Set selectedFile directly — JSDOM does not support programmatic file input events
      component.selectedFile = new File(['<html></html>'], 'export.html', { type: 'text/html' });
      component.onUpload();

      const req = httpMock.expectOne('/api/players/upload');
      const players = [mockPlayer()];
      req.flush(players);

      expect(spy).toHaveBeenCalledWith(players);
    });

    it('does not call setPlayers when no file selected', () => {
      const spy = vi.spyOn(playerService, 'setPlayers');
      component.onUpload();
      httpMock.expectNone('/api/players/upload');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('drag-and-drop', () => {
    it('sets isDragOver to true on dragover', () => {
      const dropZone = element.querySelector('.upload-drop-zone') as HTMLElement;
      dropZone.dispatchEvent(new DragEvent('dragover', { bubbles: true }));
      expect(component.isDragOver).toBe(true);
    });

    it('sets isDragOver to false on dragleave', () => {
      component.isDragOver = true;
      const dropZone = element.querySelector('.upload-drop-zone') as HTMLElement;
      dropZone.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
      expect(component.isDragOver).toBe(false);
    });

    it('triggers upload flow on drop with a valid .html file', () => {
      const spy = vi.spyOn(playerService, 'setPlayers');
      const file = new File(['<html></html>'], 'export.html', { type: 'text/html' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const dropZone = element.querySelector('.upload-drop-zone') as HTMLElement;
      dropZone.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer }));
      fixture.detectChanges();

      const req = httpMock.expectOne('/api/players/upload');
      req.flush([mockPlayer()]);
      expect(spy).toHaveBeenCalled();
    });

    it('shows an error on drop with an invalid file type', () => {
      const file = new File(['data'], 'export.csv', { type: 'text/csv' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const dropZone = element.querySelector('.upload-drop-zone') as HTMLElement;
      dropZone.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer }));
      fixture.detectChanges();

      httpMock.expectNone('/api/players/upload');
      expect(component.errorMessage).toBeTruthy();
      expect(element.querySelector('.upload-error')).not.toBeNull();
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm drag-and-drop tests fail**

```bash
cd fm-stats-angular && ng test --include="**/upload/**" 2>&1 | tail -30
```

Expected: 2 existing tests pass, 4 new drag-and-drop tests FAIL.

- [ ] **Step 3: Update UploadComponent TS with drag-and-drop handlers**

Replace `upload.component.ts`:

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
  styleUrl: './upload.component.scss',
})
export class UploadComponent {
  private playerService = inject(PlayerService);
  private router = inject(Router);

  selectedFile: File | null = null;
  isLoading = false;
  isDragOver = false;
  errorMessage: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.errorMessage = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0] ?? null;
    if (!file) return;
    if (!file.name.endsWith('.html') && file.type !== 'text/html') {
      this.errorMessage = 'Invalid file type. Please upload an HTML export from Football Manager.';
      return;
    }
    this.selectedFile = file;
    this.errorMessage = null;
    this.onUpload();
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
      },
    });
  }
}
```

- [ ] **Step 4: Update upload template with drag-and-drop zone**

Replace `upload.component.html`:

```html
<div class="upload-page">
  <div class="upload-card">
    <div class="upload-card__header">
      <span class="upload-card__icon">📂</span>
      <h1 class="upload-card__title">FM Stats</h1>
      <p class="upload-card__subtitle">
        Upload your Football Manager HTML export to analyse player statistics.
      </p>
    </div>

    <div
      class="upload-drop-zone"
      [class.upload-drop-zone--active]="isDragOver"
      [class.upload-drop-zone--loading]="isLoading"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave()"
      (drop)="onDrop($event)"
      (click)="fileInput.click()"
      role="button"
      tabindex="0"
      aria-label="Click or drag an HTML file to upload"
    >
      <span class="upload-drop-zone__icon">{{ isLoading ? '⏳' : '⬆️' }}</span>
      <p class="upload-drop-zone__label">
        {{ isLoading ? 'Processing…' : 'Drag & drop your HTML export here, or click to browse' }}
      </p>
      <p *ngIf="selectedFile && !isLoading" class="upload-drop-zone__filename">
        {{ selectedFile.name }}
      </p>
    </div>

    <input
      #fileInput
      type="file"
      accept=".html"
      class="upload-file-input"
      (change)="onFileSelected($event); onUpload()"
      [disabled]="isLoading"
    />

    <div *ngIf="errorMessage" class="upload-error">
      {{ errorMessage }}
    </div>
  </div>
</div>
```

- [ ] **Step 5: Update upload styles**

Replace `upload.component.scss`:

```scss
.upload-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height));
  padding: 2rem;
}

.upload-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2.5rem;
  width: 100%;
  max-width: 520px;
  text-align: center;

  &__header {
    margin-bottom: 2rem;
  }

  &__icon {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 0.75rem;
  }

  &__title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 0.5rem;
  }

  &__subtitle {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.5;
  }
}

.upload-drop-zone {
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  padding: 2.5rem 1.5rem;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  background-color: var(--color-bg-surface);

  &:hover {
    border-color: var(--color-accent);
    background-color: rgba(16, 185, 129, 0.05);
  }

  &--active {
    border-color: var(--color-accent);
    background-color: rgba(16, 185, 129, 0.1);
  }

  &--loading {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &__icon {
    font-size: 2rem;
    display: block;
    margin-bottom: 0.75rem;
  }

  &__label {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }

  &__filename {
    color: var(--color-accent);
    font-size: 0.85rem;
    margin: 0.5rem 0 0;
  }
}

.upload-file-input {
  display: none;
}

.upload-error {
  margin-top: 1rem;
  color: var(--color-score-low-text);
  background: var(--color-score-low-bg);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}
```

- [ ] **Step 6: Run tests to confirm all 6 upload tests pass**

```bash
cd fm-stats-angular && ng test --include="**/upload/**" 2>&1 | tail -20
```

Expected: PASS — 6 tests.

- [ ] **Step 7: Commit**

```bash
git add src/app/components/upload/
git commit -m "feat: redesign upload page with drag-and-drop zone and dark styling"
```

---

## Chunk 3: Player Table & Filter Drawer

### Task 4: RoleFilterComponent — adapt for drawer (TDD)

**Files:**
- Create: `fm-stats-angular/src/app/components/player-table/player-table.component.spec.ts`
- Modify: `fm-stats-angular/src/app/components/role-filter/role-filter.component.html`
- Modify: `fm-stats-angular/src/app/components/role-filter/role-filter.component.scss`
- Modify: `fm-stats-angular/src/app/components/player-table/player-table.component.ts`
- Modify: `fm-stats-angular/src/app/components/player-table/player-table.component.html`
- Modify: `fm-stats-angular/src/app/components/player-table/player-table.component.scss`

- [ ] **Step 1: Write failing unit tests for PlayerTableComponent**

Create `fm-stats-angular/src/app/components/player-table/player-table.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerTableComponent } from './player-table.component';

describe('PlayerTableComponent', () => {
  let fixture: ComponentFixture<PlayerTableComponent>;
  let component: PlayerTableComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerTableComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerTableComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders a filter toggle button', () => {
    const btn = element.querySelector('.filter-toggle-btn');
    expect(btn).not.toBeNull();
  });

  it('filterDrawerVisible is false initially', () => {
    expect(component.filterDrawerVisible).toBe(false);
  });

  it('toggles filterDrawerVisible when filter button is clicked', () => {
    const btn = element.querySelector('.filter-toggle-btn') as HTMLElement;
    btn.click();
    expect(component.filterDrawerVisible).toBe(true);
    btn.click();
    expect(component.filterDrawerVisible).toBe(false);
  });
});
```

> Note: Testing the frozen Name column via DOM is unreliable (PrimeNG adds CSS classes at runtime). The E2E test covers the visual frozen behavior end-to-end.

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd fm-stats-angular && ng test --include="**/player-table/**" 2>&1 | tail -20
```

Expected: FAIL — PlayerTableComponent not found / `.filter-toggle-btn` not found.

- [ ] **Step 4: Update PlayerTableComponent TS to add drawer state**

Replace `player-table.component.ts`:

```typescript
import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { RoleFilterComponent } from '../role-filter/role-filter.component';

@Component({
  selector: 'app-player-table',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, DrawerModule, ButtonModule, RoleFilterComponent],
  templateUrl: './player-table.component.html',
  styleUrl: './player-table.component.scss',
})
export class PlayerTableComponent {
  protected playerService = inject(PlayerService);
  protected players = toSignal(this.playerService.players$, { initialValue: [] as Player[] });
  protected activeRoles = toSignal(this.playerService.activeRoles$, { initialValue: new Set<string>() });

  filterDrawerVisible = false;

  basicColumns = [
    { field: 'age', header: 'Age' },
    { field: 'club', header: 'Club' },
    { field: 'nationality', header: 'Nat.' },
    { field: 'position', header: 'Pos.' },
    { field: 'wage', header: 'Wage' },
    { field: 'transferValue', header: 'Value' },
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

  toggleFilterDrawer(): void {
    this.filterDrawerVisible = !this.filterDrawerVisible;
  }
}
```

- [ ] **Step 5: Update PlayerTableComponent template**

Replace `player-table.component.html`:

```html
<div class="table-page">
  <div class="table-toolbar">
    <h2 class="table-toolbar__title">Players</h2>
    <button class="filter-toggle-btn" (click)="toggleFilterDrawer()" type="button">
      ⚙ Filter Roles
    </button>
  </div>

  <p-drawer
    [(visible)]="filterDrawerVisible"
    header="Filter Roles"
    position="right"
    styleClass="role-filter-drawer"
  >
    <app-role-filter />
  </p-drawer>

  <div class="table-container">
    <p-table
      [value]="players()"
      sortMode="single"
      [scrollable]="true"
      scrollHeight="calc(100vh - var(--header-height) - 80px)"
      [virtualScroll]="true"
      [virtualScrollItemSize]="48"
      styleClass="p-datatable-sm p-datatable-gridlines"
    >
      <ng-template pTemplate="header">
        <tr>
          <th pFrozenColumn alignFrozen="left" class="col-name" [pSortableColumn]="'name'">
            Name <p-sortIcon field="name" />
          </th>
          @for (col of basicColumns; track col.field) {
            <th [pSortableColumn]="col.field">
              {{ col.header }} <p-sortIcon [field]="col.field" />
            </th>
          }
          @for (role of roleColumns(); track role.shortRoleName) {
            <th [pSortableColumn]="role.shortRoleName">{{ role.shortRoleName }}</th>
          }
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-player>
        <tr>
          <td pFrozenColumn alignFrozen="left" class="col-name">{{ player.name }}</td>
          @for (col of basicColumns; track col.field) {
            <td>{{ player[col.field] }}</td>
          }
          @for (role of roleColumns(); track role.shortRoleName) {
            @let score = getRoleScore(player, role.shortRoleName);
            <td [ngClass]="getRoleScoreClass(score)">{{ score | number:'1.1-1' }}</td>
          }
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="basicColumns.length + roleColumns().length + 1" class="empty-state">
            No players loaded. <a routerLink="/upload">Upload an FM export</a> to get started.
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>
</div>
```

- [ ] **Step 6: Update PlayerTableComponent styles**

Replace `player-table.component.scss`:

```scss
.table-page {
  padding: 1rem 1.5rem;
  height: calc(100vh - var(--header-height));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-shrink: 0;

  &__title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.filter-toggle-btn {
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.45rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;

  &:hover {
    border-color: var(--color-accent);
    background-color: rgba(16, 185, 129, 0.08);
  }
}

.table-container {
  flex: 1;
  overflow: hidden;
}

.col-name {
  min-width: 160px;
  font-weight: 600;
  background-color: var(--color-bg-surface);
}

.score-high {
  background-color: var(--color-score-high-bg);
  color: var(--color-score-high-text);
  font-weight: 600;
}

.score-medium {
  background-color: var(--color-score-medium-bg);
  color: var(--color-score-medium-text);
}

.score-low {
  background-color: var(--color-score-low-bg);
  color: var(--color-score-low-text);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);

  a {
    color: var(--color-accent);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
```

- [ ] **Step 7: Update RoleFilterComponent template for drawer context**

Replace `role-filter.component.html`:

```html
<div class="role-filter-content">
  @for (group of roleGroups(); track group.groupName) {
    <div class="position-group">
      <label class="group-label">
        <input
          type="checkbox"
          [checked]="group.allChecked"
          [indeterminate]="group.indeterminate"
          (change)="onGroupChange(group.groupName, $event)"
        />
        <strong>{{ group.groupName }}</strong>
      </label>
      <div class="role-list">
        @for (role of group.roles; track role.shortRoleName) {
          <label class="role-label">
            <input
              type="checkbox"
              [checked]="activeRoles().has(role.shortRoleName)"
              (change)="onRoleChange(role.shortRoleName, $event)"
            />
            {{ role.shortRoleName }}
          </label>
        }
      </div>
    </div>
  }
</div>
```

- [ ] **Step 8: Update RoleFilterComponent styles for drawer**

Replace `role-filter.component.scss`:

```scss
.role-filter-content {
  padding: 0.5rem 0;
}

.position-group {
  margin-bottom: 1.25rem;
}

.group-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);

  input[type='checkbox'] {
    accent-color: var(--color-accent);
  }
}

.role-list {
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.role-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text-secondary);

  input[type='checkbox'] {
    accent-color: var(--color-accent);
  }
}
```

- [ ] **Step 9: Run player-table tests to confirm they pass**

```bash
cd fm-stats-angular && ng test --include="**/player-table/**" 2>&1 | tail -20
```

Expected: PASS — all tests pass.

- [ ] **Step 10: Run full unit test suite to check for regressions**

```bash
cd fm-stats-angular && ng test 2>&1 | tail -30
```

Expected: All tests pass.

- [ ] **Step 11: Commit**

```bash
git add src/app/components/player-table/ src/app/components/role-filter/
git commit -m "feat: frozen Name column, slide-out role filter drawer, dark design tokens in table"
```

---

## Chunk 4: E2E Tests

### Task 5: Playwright E2E covering all acceptance criteria

**Files:**
- Modify: `fm-stats-angular/tests/dashboard.spec.ts`

The E2E tests require a running app. Playwright auto-starts `ng serve`. The sticky header, dark theme, drag-over, and filter panel tests work without player data. The frozen column test needs seeded players — we'll use `localStorage` injection for that.

- [ ] **Step 1: Write failing E2E tests**

Replace `fm-stats-angular/tests/dashboard.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('FM Stats App', () => {
  test('app loads and has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FM Stats/i);
  });

  test.describe('dark theme', () => {
    test('body background is dark (not white)', async ({ page }) => {
      await page.goto('/');
      const bg = await page.evaluate(() =>
        getComputedStyle(document.body).backgroundColor
      );
      // Dark backgrounds start with rgb(15 or similar), not rgb(255,255,255)
      expect(bg).not.toBe('rgb(255, 255, 255)');
      // Should contain low-value RGB components (dark)
      const parts = bg.match(/\d+/g)?.map(Number) ?? [];
      const brightness = parts.slice(0, 3).reduce((a, b) => a + b, 0);
      expect(brightness).toBeLessThan(200); // Very dark backgrounds < 200 total
    });

    test('upload page has no light background elements', async ({ page }) => {
      await page.goto('/upload');
      const bodyBg = await page.evaluate(() =>
        getComputedStyle(document.body).backgroundColor
      );
      expect(bodyBg).not.toBe('rgb(255, 255, 255)');
    });
  });

  test.describe('sticky header', () => {
    test('header is visible on the upload page', async ({ page }) => {
      await page.goto('/upload');
      const header = page.locator('app-header header');
      await expect(header).toBeVisible();
      await expect(header).toContainText('FM Stats');
    });

    test('header contains nav links to Upload and Players', async ({ page }) => {
      await page.goto('/upload');
      await expect(page.locator('app-header a[href="/upload"]')).toBeVisible();
      await expect(page.locator('app-header a[href="/players"]')).toBeVisible();
    });

    test('header remains in viewport after scrolling on players page', async ({ page }) => {
      await page.goto('/players');
      await page.evaluate(() => window.scrollBy(0, 500));
      const header = page.locator('app-header header');
      const box = await header.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y).toBeLessThan(80); // Still near top of viewport
    });
  });

  test.describe('drag-and-drop upload zone', () => {
    test('drop zone is visible on upload page', async ({ page }) => {
      await page.goto('/upload');
      await expect(page.locator('.upload-drop-zone')).toBeVisible();
    });

    test('dragenter adds active highlight class', async ({ page }) => {
      await page.goto('/upload');
      const zone = page.locator('.upload-drop-zone');

      await zone.dispatchEvent('dragover', { bubbles: true });
      await expect(zone).toHaveClass(/upload-drop-zone--active/);
    });

    test('dragleave removes active highlight class', async ({ page }) => {
      await page.goto('/upload');
      const zone = page.locator('.upload-drop-zone');

      await zone.dispatchEvent('dragover', { bubbles: true });
      await expect(zone).toHaveClass(/upload-drop-zone--active/);

      await zone.dispatchEvent('dragleave', { bubbles: true });
      await expect(zone).not.toHaveClass(/upload-drop-zone--active/);
    });
  });

  test.describe('players table with seeded data', () => {
    const seedLocalStorage = async (page: any) => {
      // Seed localStorage with a minimal player dataset before navigating
      const players = Array.from({ length: 5 }, (_, i) => ({
        uid: i + 1,
        name: `Player With A Very Long Name ${i + 1}`,
        age: 25,
        club: 'Test FC',
        nationality: 'Swedish',
        position: 'MC',
        wage: 1000,
        transferValue: 500000,
        averageRating: 7.0,
        roles: [
          { roleName: 'Striker Support', shortRoleName: 'ST(S)', position: 'ST', roleScore: 8.5 },
        ],
        reg: '', inf: '', secondNationality: '', personality: '', mediaHandling: '',
        leftFoot: 'Strong', rightFoot: 'Weak', height: 180,
        oneVsOne: 10, acceleration: 12, aerialAbility: 8, aggression: 11, agility: 13,
        anticipation: 14, balance: 12, bravery: 10, commandOfArea: 5, concentration: 13,
        composure: 12, crossing: 11, decisions: 14, determination: 15, dribbling: 12,
        finishing: 11, firstTouch: 13, flair: 10, handling: 5, heading: 9,
        jumpingReach: 11, kicking: 5, leadership: 8, longShots: 10, marking: 13,
        offTheBall: 12, pace: 13, passing: 14, positioning: 13, reflexes: 5,
        stamina: 14, strength: 11, tackling: 13, teamwork: 14, technique: 12,
        throwing: 5, throwOuts: 5, vision: 13, workRate: 14, corners: 10,
      }));

      await page.goto('/');
      await page.evaluate((data: any) => {
        localStorage.setItem('uploaded_players', JSON.stringify({
          players: data,
          activeRoles: ['ST(S)'],
        }));
      }, players);
    };

    test('filter toggle button is visible', async ({ page }) => {
      await seedLocalStorage(page);
      await page.goto('/players');
      await expect(page.locator('.filter-toggle-btn')).toBeVisible();
    });

    test('filter panel opens when filter button is clicked', async ({ page }) => {
      await seedLocalStorage(page);
      await page.goto('/players');
      await page.locator('.filter-toggle-btn').click();
      // PrimeNG Drawer renders with role="complementary" or a visible panel
      await expect(page.locator('.p-drawer')).toBeVisible();
    });

    test('filter checkbox selections persist after panel close and reopen', async ({ page }) => {
      await seedLocalStorage(page);
      await page.goto('/players');

      // Open filter panel
      await page.locator('.filter-toggle-btn').click();
      const drawer = page.locator('.p-drawer');
      await expect(drawer).toBeVisible();

      // Find the ST(S) checkbox (should be checked because it's in activeRoles)
      const checkbox = drawer.locator('input[type="checkbox"]').first();
      const wasChecked = await checkbox.isChecked();

      // Close drawer via the close button (PrimeNG wraps in p-button; target the inner <button>)
      await page.locator('.p-drawer-close-button button').click();
      await expect(drawer).not.toBeVisible();

      // Reopen
      await page.locator('.filter-toggle-btn').click();
      await expect(drawer).toBeVisible();

      // Checkbox state preserved
      const isStillChecked = await drawer.locator('input[type="checkbox"]').first().isChecked();
      expect(isStillChecked).toBe(wasChecked);
    });

    test('Name column remains visible after horizontal scroll', async ({ page }) => {
      await seedLocalStorage(page);
      await page.goto('/players');
      await page.evaluate(() => {
        const wrapper = document.querySelector('.p-datatable-wrapper');
        if (wrapper) wrapper.scrollLeft = 600;
      });
      const nameCell = page.locator('td[pfrozencolumn]').first();
      const box = await nameCell.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeLessThan(200); // Still anchored to the left
    });

    test('score cells are color-coded (green for high scores)', async ({ page }) => {
      await seedLocalStorage(page);
      await page.goto('/players');
      const highScoreCell = page.locator('td.score-high').first();
      await expect(highScoreCell).toBeVisible();
      const bg = await highScoreCell.evaluate(el =>
        getComputedStyle(el).backgroundColor
      );
      // Should not be white
      expect(bg).not.toBe('rgb(255, 255, 255)');
    });
  });
});
```

- [ ] **Step 2: Run E2E tests (expect most to fail — app not yet fully wired)**

```bash
cd fm-stats-angular && npm run e2e 2>&1 | tail -40
```

Expected: Some pass (title, upload page), some fail (frozen col visual, filter drawer). This validates the test scaffolding is correct before implementation is done.

- [ ] **Step 3: Commit E2E tests**

```bash
git add tests/dashboard.spec.ts
git commit -m "test: add Playwright E2E tests covering all acceptance criteria"
```

---

## Chunk 5: Verification

### Task 6: Full verification pass

- [ ] **Step 1: Run full unit test suite**

```bash
cd fm-stats-angular && ng test 2>&1 | tail -30
```

Expected: All tests pass, 0 failures.

- [ ] **Step 2: Run E2E test suite**

```bash
cd fm-stats-angular && npm run e2e 2>&1 | tail -40
```

Expected: All E2E tests pass.

- [ ] **Step 3: Production build**

```bash
cd fm-stats-angular && ng build 2>&1 | tail -20
```

Expected: Build succeeds with no errors. Budget warnings are acceptable.

- [ ] **Step 4: Grep for hardcoded color hex values in component SCSS files**

```bash
grep -rn '#[0-9a-fA-F]\{3,6\}' fm-stats-angular/src/app/components/ --include="*.scss"
```

Expected: No results (all colors use CSS custom properties via `var(--color-*)`).

- [ ] **Step 5: Final commit if any cleanup needed**

```bash
git add -p  # Stage only relevant changes
git commit -m "chore: remove any remaining hardcoded color values"
```
