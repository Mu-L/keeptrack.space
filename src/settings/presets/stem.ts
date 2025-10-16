import { BottomMenu } from '@app/app/ui/bottom-menu';
import { MenuMode } from '@app/engine/core/interfaces';
import { EventBusEvent } from '@app/engine/events/event-bus-events';
import { getEl } from '@app/engine/utils/get-el';
import { keepTrackApi } from '@app/keepTrackApi';
import { SettingsManager } from '../settings';

export const stemEnvironment = (settingsManager: SettingsManager) => {
  settingsManager.isBlockPersistence = true;

  settingsManager.disableAllPlugins();
  settingsManager.plugins.SoundManager = { enabled: true };
  settingsManager.plugins.SatInfoBoxCore = { enabled: true };
  settingsManager.plugins.SatInfoBoxObject = { enabled: true };
  settingsManager.plugins.EarthAtmosphere = { enabled: true };

  settingsManager.plugins.TopMenu = { enabled: true };

  settingsManager.plugins.CountriesMenu = { enabled: true };
  settingsManager.plugins.ColorMenu = { enabled: true };
  settingsManager.plugins.Collisions = { enabled: true };
  settingsManager.plugins.SatellitePhotos = { enabled: true };
  settingsManager.plugins.FilterMenuPlugin = { enabled: true };
  settingsManager.plugins.NextLaunchesPlugin = { enabled: true };
  settingsManager.plugins.TimeMachine = { enabled: true };
  settingsManager.plugins.StereoMap = { enabled: true };
  settingsManager.isShowSplashScreen = true;


  settingsManager.simulationTime = new Date('2025-04-01T00:00:00Z'); // Set to April 1, 2025

  settingsManager.isEnableJscCatalog = false;

  settingsManager.earthDayTextureQuality = '16k';
  settingsManager.earthNightTextureQuality = '16k';
  settingsManager.earthSpecTextureQuality = '8k';
  settingsManager.earthBumpTextureQuality = '8k';
  settingsManager.earthPoliticalTextureQuality = 'off';
  settingsManager.earthCloudTextureQuality = '8k';

  settingsManager.disableCameraControls = true;

  settingsManager.isShowLoadingHints = false; // Disable Loading Hints

  settingsManager.splashScreenList = ['epfl-1', 'epfl-2', 'thule', 'rocket', 'cubesat'];

  settingsManager.isDisableAsciiCatalog = true;
  settingsManager.defaultColorScheme = 'CelestrakColorScheme';

  settingsManager.isLoadLastMap = false;
  settingsManager.isAllowRightClick = false;
  settingsManager.isDisableSelectSat = false;

  settingsManager.isShowAgencies = false;
  settingsManager.isDisableSensors = true;
  settingsManager.isDisableControlSites = true;
  settingsManager.isDisableLaunchSites = true;
  settingsManager.isLoadLastSensor = false;

  settingsManager.isDisableExtraCatalog = false;

  keepTrackApi.on(EventBusEvent.uiManagerFinal, () => {
    BottomMenu.changeMenuMode(MenuMode.ALL);

    getEl('bottom-icons-filter')!.style.display = 'none';
    document.documentElement.style.setProperty('--bottom-filter-width', '0px');
  });
};
