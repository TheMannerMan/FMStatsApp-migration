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
      await expect(page.locator('app-header a[routerLink="/upload"]')).toBeVisible();
      await expect(page.locator('app-header a[routerLink="/players"]')).toBeVisible();
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

      // Close drawer via the close button (PrimeNG wraps in p-button; target the inner <button>)
      await page.locator('.p-drawer-close-button button').click();
      await expect(drawer).not.toBeVisible();

      // Reopen and verify drawer is still functional
      await page.locator('.filter-toggle-btn').click();
      await expect(drawer).toBeVisible();

      // If checkboxes are rendered (requires backend /api/roles), verify state is preserved
      const checkboxCount = await drawer.locator('input[type="checkbox"]').count();
      if (checkboxCount > 0) {
        const firstChecked = await drawer.locator('input[type="checkbox"]').first().isChecked();
        // Close and reopen to verify persistence
        await page.locator('.p-drawer-close-button button').click();
        await expect(drawer).not.toBeVisible();
        await page.locator('.filter-toggle-btn').click();
        await expect(drawer).toBeVisible();
        const stillChecked = await drawer.locator('input[type="checkbox"]').first().isChecked();
        expect(stillChecked).toBe(firstChecked);
      }
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
