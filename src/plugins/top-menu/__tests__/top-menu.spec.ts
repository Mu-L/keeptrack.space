import { test, expect } from '@playwright/test';
import { waitForAppReady } from '@test/e2e/keeptrack-fixtures';

test.describe('TopMenu', () => {
  test('nav elements render correctly', async ({ page }) => {
    await waitForAppReady(page, {
      plugins: { TopMenu: { enabled: true } },
    });

    // Core nav elements should be visible
    await expect(page.locator('#nav-wrapper')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('#search')).toBeAttached();
    await expect(page.locator('#search-results')).toBeAttached();
    await expect(page.locator('#fullscreen-icon')).toBeAttached();
  });
});
