/**
 * /////////////////////////////////////////////////////////////////////////////
 *
 * http://keeptrack.space
 *
 * @Copyright (C) 2016-2023 Theodore Kruczek
 * @Copyright (C) 2020-2023 Heather Kruczek
 *
 * KeepTrack is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * KeepTrack is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with
 * KeepTrack. If not, see <http://www.gnu.org/licenses/>.
 *
 * /////////////////////////////////////////////////////////////////////////////
 */

import fencePng from '@app/img/icons/fence.png';
import { CatalogManager, SensorObject } from '@app/js/interfaces';
import { keepTrackApi, KeepTrackApiMethods } from '@app/js/keepTrackApi';
import { getEl } from '@app/js/lib/get-el';
import { KeepTrackPlugin } from '../KeepTrackPlugin';

declare module '@app/js/interfaces' {
  interface UserSettings {
    isSatOverflyModeOn: boolean;
    isShowSurvFence: boolean;
  }
}

export class SensorSurvFence extends KeepTrackPlugin {
  bottomIconCallback = () => {
    if (!this.isMenuButtonEnabled) return;

    const catalogManagerInstance = keepTrackApi.getCatalogManager();
    if (settingsManager.isShowSurvFence) {
      this.disableSurvView_(catalogManagerInstance);
    } else {
      this.enableSurvView_(catalogManagerInstance);
    }
  };

  bottomIconElementName = 'menu-sensor-surv-fence';
  bottomIconLabel = 'Sensor Fence';
  bottomIconImg = fencePng;
  isIconDisabledOnLoad = true;
  isIconDisabled = true;

  isRequireSensorSelected = true;

  static PLUGIN_NAME = 'Sensor Surveillance Fence';

  constructor() {
    super(SensorSurvFence.PLUGIN_NAME);
    settingsManager.isShowSurvFence = false;
  }

  private disableSurvView_(catalogManagerInstance: CatalogManager) {
    settingsManager.isShowSurvFence = false;
    getEl(this.bottomIconElementName).classList.remove(KeepTrackPlugin.iconSelectedClassString);
    catalogManagerInstance.satCruncher.postMessage({
      isShowSurvFence: 'disable',
      isShowFOVBubble: 'reset',
    });
  }

  private enableSurvView_(catalogManagerInstance: CatalogManager) {
    keepTrackApi.methods.changeSensorMarkers(this.PLUGIN_NAME);

    settingsManager.isShowSurvFence = true;
    settingsManager.isSatOverflyModeOn = false;

    getEl(this.bottomIconElementName).classList.add(KeepTrackPlugin.iconSelectedClassString);

    catalogManagerInstance.satCruncher.postMessage({
      isShowFOVBubble: 'enable',
      isShowSurvFence: 'enable',
    });
    catalogManagerInstance.satCruncher.postMessage({
      typ: 'isShowSatOverfly',
      isShowSatOverfly: 'reset',
    });
  }

  addJs(): void {
    super.addJs();

    // TODO: There are edge cases where the icon remains available when it should not be
    // It does not break anything, but it is a bug

    keepTrackApi.register({
      method: KeepTrackApiMethods.setSensor,
      cbName: this.PLUGIN_NAME,
      cb: (sensor: SensorObject): void => {
        if (sensor) {
          getEl(this.bottomIconElementName).classList.remove('bmenu-item-disabled');
          this.isIconDisabled = false;
        } else {
          getEl(this.bottomIconElementName).classList.add('bmenu-item-disabled');
          this.isIconDisabled = true;
        }
      },
    });

    keepTrackApi.register({
      method: 'changeSensorMarkers',
      cbName: this.PLUGIN_NAME,
      cb: (caller: string): void => {
        if (caller !== this.PLUGIN_NAME) {
          getEl(this.bottomIconElementName).classList.remove('bmenu-item-selected');
        }
      },
    });
  }
}

export const sensorSurvFencePlugin = new SensorSurvFence();