import { expect, test } from '@playwright/test';
import { waitForAppReady } from '@test/e2e/keeptrack-fixtures';

test.describe('LookAnglesPlugin', () => {
  test('icon disabled without satellite and sensor', async ({ page }) => {
    await waitForAppReady(page, {
      plugins: { LookAnglesPlugin: { enabled: true } },
    });

    const bottomIcon = page.locator('#look-angles-bottom-icon');

    await expect(bottomIcon).toBeAttached();
    await expect(bottomIcon).toHaveClass(/bmenu-item-disabled/u);

    // Side menu elements should exist in DOM even when disabled
    await expect(page.locator('#look-angles-menu')).toBeAttached();
  });
});
