import { NextLaunchesPlugin } from '@app/plugins/next-launches/next-launches';
import { readFileSync } from 'fs';
import { setupStandardEnvironment } from './environment/standard-env';
import { standardPluginMenuButtonTests, standardPluginSuite } from './generic-tests';
import { KeepTrack } from '@app/keeptrack';

describe('NextLaunches_class', () => {
  beforeAll(() => {
    const url = 'https://Keeptrack.space';

    vi.stubGlobal('location', {
      href: url,
      search: '',
      hash: '',
      ancestorOrigins: [],
      assign: vi.fn(),
      reload: vi.fn(),
      replace: vi.fn(),
    });

    if (window.history) {
      vi.spyOn(window.history, 'replaceState').mockImplementation(() => {
        // Do nothing
      });
    }
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });
  beforeEach(() => {
    KeepTrack.getInstance().containerRoot.innerHTML = '';
    setupStandardEnvironment();

    // eslint-disable-next-line require-await
    global.fetch = vi.fn().mockImplementation(async () => ({
      json: () => ({
        results: JSON.parse(readFileSync('./test/environment/lldev.json', 'utf8')),
      }),
    }));
  });

  standardPluginSuite(NextLaunchesPlugin);
  standardPluginMenuButtonTests(NextLaunchesPlugin);
});
