import { test, expect } from '@playwright/test';

test.describe('FM Stats App', () => {
  test('app loads and is reachable', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FM Stats/i);
  });
});
