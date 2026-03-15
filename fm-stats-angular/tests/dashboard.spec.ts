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
