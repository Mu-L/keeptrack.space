import { vi } from 'vitest';
import { Screenshot } from '@app/plugins/screenshot/screenshot';
import { setupDefaultHtml } from './environment/standard-env';
import { standardPluginMenuButtonTests, standardPluginRmbTests, standardPluginSuite } from './generic-tests';
import { KeepTrack } from '@app/keeptrack';

describe('Screenshot_class', () => {
  let screenshotPlugin: Screenshot;

  beforeEach(() => {
    setupDefaultHtml();
    screenshotPlugin = new Screenshot();
  });

  standardPluginSuite(Screenshot, 'Screenshot');
  standardPluginMenuButtonTests(Screenshot, 'Screenshot');
  standardPluginRmbTests(Screenshot, 'Screenshot');

  // test if the screenshot can be taken
  it('should take a screenshot', () => {
    KeepTrack.getInstance().containerRoot.appendChild = vi.fn();
    document.createElement = vi.fn(() => ({
      click: vi.fn(),
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
      })),
      toDataURL: vi.fn(() => 'data:image/png;base64,'),
      parentNode: {
        removeChild: vi.fn(),
      },
    })) as unknown as typeof document.createElement;
    expect(() => screenshotPlugin.takeScreenShot()).not.toThrow();
  });
});
