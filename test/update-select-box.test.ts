import { PluginRegistry } from '@app/engine/core/plugin-registry';
import { EventBusEvent } from '@app/engine/events/event-bus-events';
import { keepTrackApi } from '@app/keepTrackApi';
import { DateTimeManager } from '@app/plugins/date-time-manager/date-time-manager';
import { SatInfoBox } from '@app/plugins/sat-info-box/sat-info-box';
import { SelectSatManager } from '@app/plugins/select-sat-manager/select-sat-manager';
import { TopMenu } from '@app/plugins/top-menu/top-menu';
import { defaultSat, defaultSensor } from './environment/apiMocks';
import { setupStandardEnvironment } from './environment/standard-env';
import { standardPluginSuite } from './generic-tests';

describe('UpdateSatManager_class', () => {
  beforeEach(() => {
    // Mock DateTimeManager uiManagerFinal to prevent errors
    DateTimeManager.prototype.uiManagerFinal = jest.fn();
    PluginRegistry.unregisterAllPlugins();
    setupStandardEnvironment([TopMenu, SelectSatManager, DateTimeManager]);
  });

  standardPluginSuite(SatInfoBox, 'SatInfoBox');
});

describe('SatInfoBoxCore_class2', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let satinfobox: SatInfoBox;

  beforeEach(() => {
    PluginRegistry.unregisterAllPlugins();
    setupStandardEnvironment([TopMenu, SelectSatManager, DateTimeManager]);
    satinfobox = new SatInfoBox();
  });

  it('should be able to select a satellite', () => {
    keepTrackApi.getCatalogManager().objectCache = [defaultSat];
    keepTrackApi.getColorSchemeManager().colorData = Array(100).fill(0) as unknown as Float32Array;
    keepTrackApi.getDotsManager().sizeData = Array(100).fill(0) as unknown as Int8Array;
    keepTrackApi.getDotsManager().positionData = Array(100).fill(0) as unknown as Float32Array;
    keepTrackApi.isInitialized = true;
    const selectSatManager = new SelectSatManager();

    keepTrackApi.emit(EventBusEvent.uiManagerInit);
    keepTrackApi.emit(EventBusEvent.uiManagerFinal);
    keepTrackApi.emit(EventBusEvent.uiManagerOnReady);
    selectSatManager.selectSat(0);
    expect(() => keepTrackApi.emit(EventBusEvent.updateSelectBox, defaultSat)).not.toThrow();

    keepTrackApi.emit(EventBusEvent.setSensor, defaultSensor, 2);
    keepTrackApi.getCatalogManager().isSensorManagerLoaded = true;
    selectSatManager.selectSat(0);
    expect(() => keepTrackApi.emit(EventBusEvent.updateSelectBox, defaultSat)).not.toThrow();
  });
});
