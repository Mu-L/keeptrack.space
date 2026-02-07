import { DateTimeManager } from '@app/plugins/date-time-manager/date-time-manager';
import { SensorListPlugin } from '@app/plugins/sensor-list/sensor-list';
import { TopMenu } from '@app/plugins/top-menu/top-menu';
import { setupStandardEnvironment } from './environment/standard-env';
import { standardClickTests, standardPluginMenuButtonTests, standardPluginSuite } from './generic-tests';

describe('SensorListPlugin_class', () => {
  beforeEach(() => {
    // Mock DateTimeManager uiManagerFinal_ to prevent errors
    (DateTimeManager.prototype as any).uiManagerFinal_ = vi.fn();
    setupStandardEnvironment([TopMenu, DateTimeManager]);
  });

  afterEach(() => {
    vi.advanceTimersByTime(1000);
  });

  standardPluginSuite(SensorListPlugin);
  standardPluginMenuButtonTests(SensorListPlugin);
  standardClickTests(SensorListPlugin);
});
