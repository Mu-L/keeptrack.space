import { vi } from 'vitest';
import { Calculator } from '@app/plugins/calculator/calculator';
import { setupStandardEnvironment } from '@test/environment/standard-env';
import { standardPluginMenuButtonTests, standardPluginSuite } from '@test/generic-tests';
import { KeepTrack } from '@app/keeptrack';

describe('Calculator_class', () => {
  beforeEach(() => {
    KeepTrack.getInstance().containerRoot.innerHTML = '';
    setupStandardEnvironment();
    window.M.AutoInit = vi.fn();
  });

  standardPluginSuite(Calculator);
  standardPluginMenuButtonTests(Calculator);
});
