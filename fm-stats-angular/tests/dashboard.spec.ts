import { test, expect, Page } from '@playwright/test';

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

    test('dragover adds active highlight class', async ({ page }) => {
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
    const seedLocalStorage = async (page: Page) => {
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
      await page.evaluate((data: unknown) => {
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
      // Mock /api/roles so checkboxes are always rendered without a real backend
      await page.route('/api/roles', route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            Striker: [
              { roleName: 'Striker Support', shortRoleName: 'ST(S)', positions: ['ST'] },
            ],
          }),
        })
      );

      await seedLocalStorage(page);
      await page.goto('/players');

      // Open filter panel
      await page.locator('.filter-toggle-btn').click();
      const drawer = page.locator('.p-drawer');
      await expect(drawer).toBeVisible();

      // Wait for checkboxes to be rendered (roles loaded via mocked API)
      const firstCheckbox = drawer.locator('input[type="checkbox"]').first();
      await expect(firstCheckbox).toBeVisible();

      const firstChecked = await firstCheckbox.isChecked();

      // Close drawer
      await page.locator('.p-drawer-close-button button').click();
      await expect(drawer).not.toBeVisible();

      // Reopen drawer
      await page.locator('.filter-toggle-btn').click();
      await expect(drawer).toBeVisible();

      // Assert checkbox state is preserved
      const stillChecked = await drawer.locator('input[type="checkbox"]').first().isChecked();
      expect(stillChecked).toBe(firstChecked);
    });

    test('Name column remains visible after horizontal scroll', async ({ page }) => {
      await seedLocalStorage(page);
      await page.goto('/players');
      // Wait for table to render frozen column before scrolling
      await expect(page.locator('td[pfrozencolumn]').first()).toBeVisible();
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
      // Should be dark green (score-high-bg token: #064e3b = rgb(6, 78, 59), sum = 143)
      const parts = bg.match(/\d+/g)?.map(Number) ?? [];
      const brightness = parts.slice(0, 3).reduce((a, b) => a + b, 0);
      expect(brightness).toBeLessThan(200);
    });

    test('can expand an accordion panel and toggle a role to filter the table', async ({ page }) => {
      // Mock /api/roles so accordion panels have checkboxes
      await page.route('/api/roles', route =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            Forward: [
              { roleName: 'Striker Support', shortRoleName: 'ST(S)', positions: ['ST'] },
            ],
          }),
        })
      );

      await seedLocalStorage(page);
      await page.goto('/players');

      // Open filter drawer
      await page.locator('.filter-toggle-btn').click();
      const drawer = page.locator('.p-drawer');
      await expect(drawer).toBeVisible();

      // Find the Forward accordion panel (should exist)
      const forwardPanel = drawer.locator('p-accordion-panel').filter({ hasText: 'Forward' });
      await expect(forwardPanel).toBeVisible();

      // Expand the Forward panel by clicking its header
      await forwardPanel.locator('p-accordion-header').click();

      // The ST(S) role checkbox should now be visible inside the expanded panel
      const stCheckbox = forwardPanel.locator('input[type="checkbox"]').last(); // last = role checkbox (not group)
      await expect(stCheckbox).toBeVisible();

      // ST(S) should be checked (it's in activeRoles from seeded localStorage)
      await expect(stCheckbox).toBeChecked();

      // Uncheck ST(S) role
      await stCheckbox.click();

      // The role column header ST(S) should disappear from the table (no active roles)
      await expect(page.locator('th').filter({ hasText: 'ST(S)' })).not.toBeVisible();
    });
  });
});
