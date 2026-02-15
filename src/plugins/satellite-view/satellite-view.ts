/**
 * /////////////////////////////////////////////////////////////////////////////
 *
 * https://keeptrack.space
 *
 * @Copyright (C) 2025 Kruczek Labs LLC
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

import { SoundNames } from '@app/engine/audio/sounds';
import { CameraType } from '@app/engine/camera/camera';
import { MenuMode, ToastMsgType } from '@app/engine/core/interfaces';
import { PluginRegistry } from '@app/engine/core/plugin-registry';
import { ServiceLocator } from '@app/engine/core/service-locator';
import { EventBus } from '@app/engine/events/event-bus';
import { EventBusEvent } from '@app/engine/events/event-bus-events';
import { t7e } from '@app/locales/keys';
import { Satellite } from '@ootk/src/main';
import viewInAirPng from '@public/img/icons/view-in-air.png';
import { KeepTrackPlugin } from '../../engine/plugins/base-plugin';
import { IconPlacement, IKeyboardShortcut } from '../../engine/plugins/core/plugin-capabilities';
import { SelectSatManager } from '../select-sat-manager/select-sat-manager';

export class SatelliteViewPlugin extends KeepTrackPlugin {
  readonly id = 'SatelliteViewPlugin';
  dependencies_ = [SelectSatManager.name];
  private readonly selectSatManager_: SelectSatManager;

  constructor() {
    super();
    this.selectSatManager_ = PluginRegistry.getPlugin(SelectSatManager) as unknown as SelectSatManager; // this will be validated in KeepTrackPlugin constructor
  }

  menuMode: MenuMode[] = [MenuMode.ALL];

  isRequireSatelliteSelected = true;
  bottomIconImg = viewInAirPng;
  isIconDisabledOnLoad = true;
  iconPlacement = IconPlacement.UTILITY_ONLY;

  getKeyboardShortcuts(): IKeyboardShortcut[] {
    return [
      {
        key: '4',
        callback: () => this.bottomIconCallback(),
      },
    ];
  }

  addJs(): void {
    super.addJs();

    EventBus.getInstance().on(
      EventBusEvent.selectSatData,
      (obj) => {
        if (obj instanceof Satellite) {
          this.setBottomIconToEnabled();
        } else {
          this.setBottomIconToDisabled();
        }
      },
    );

    // Keep icon state in sync with camera type
    EventBus.getInstance().on(EventBusEvent.updateLoop, () => {
      const isSatelliteView = ServiceLocator.getMainCamera().cameraType === CameraType.SATELLITE;

      if (isSatelliteView && !this.isMenuButtonActive) {
        this.setBottomIconToSelected();
      } else if (!isSatelliteView && this.isMenuButtonActive) {
        this.setBottomIconToUnselected();
      }
    });
  }

  bottomIconCallback = (): void => {
    if (this.selectSatManager_.selectedSat === -1) {
      ServiceLocator.getUiManager().toast(t7e('errorMsgs.SelectSatelliteFirst'), ToastMsgType.serious, true);
      this.shakeBottomIcon();

      return;
    }

    ServiceLocator.getSoundManager()?.play(SoundNames.TOGGLE_ON);
    ServiceLocator.getMainCamera().cameraType = CameraType.SATELLITE;
    this.setBottomIconToSelected();
  };
}
