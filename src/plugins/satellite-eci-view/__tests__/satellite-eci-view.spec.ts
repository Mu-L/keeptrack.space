import { test, expect } from '@playwright/test';
import { waitForAppReady } from '@test/e2e/keeptrack-fixtures';

test.describe('SatelliteEciView', () => {
  test('utility icon disabled without satellite selected', async ({ page }) => {
    await waitForAppReady(page, {
      plugins: { SatelliteEciView: { enabled: true } },
    });

    const utilityIcon = page.locator('#SatelliteEciView-utility-icon');
    await expect(utilityIcon).toBeAttached();
    await expect(utilityIcon).toHaveClass(/bmenu-item-disabled/);

    await utilityIcon.click({ force: true });
    await expect(utilityIcon).not.toHaveClass(/bmenu-item-selected/, { timeout: 2_000 });
  });
});
