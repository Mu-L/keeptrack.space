import { test, expect } from '@playwright/test';
import { waitForAppReady } from '@test/e2e/keeptrack-fixtures';

test.describe('TransponderChannelData', () => {
  test('icon disabled without satellite, menu elements in DOM', async ({ page }) => {
    await waitForAppReady(page, {
      plugins: { transponderChannelData: { enabled: true } },
    });

    const bottomIcon = page.locator('#menu-transponderChannelData');
    await expect(bottomIcon).toBeAttached();
    await expect(bottomIcon).toHaveClass(/bmenu-item-disabled/);

    // Side menu and table should exist in DOM
    await expect(page.locator('#TransponderChannelData-menu')).toBeAttached();
    await expect(page.locator('#TransponderChannelData-table')).toBeAttached();
  });
});
