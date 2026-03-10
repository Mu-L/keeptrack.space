import { type Page } from '@playwright/test';

export interface AppReadyOptions {
  plugins?: Record<string, { enabled: boolean }>;
  settings?: Record<string, unknown>;
}

/**
 * Intercepts settingsOverride.js and injects E2E-friendly settings,
 * then navigates to the app and waits for it to fully initialize.
 */
export async function waitForAppReady(page: Page, options: AppReadyOptions = {}): Promise<void> {
  const overrideObj = {
    isAutoStart: true,
    noCatalogOnLoad: true,
    plugins: options.plugins ?? {},
    ...(options.settings ?? {}),
  };

  await page.route('**/settings/settingsOverride.js', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `window.settingsOverride = ${JSON.stringify(overrideObj)};`,
    });
  });

  await page.goto('/');
  await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 45_000 });

  // Wait for the app to signal it is fully ready (all plugins, drawer, etc.)
  await page.waitForFunction(() => (window as any).keepTrack?.isReady === true, { timeout: 15_000 });
}
