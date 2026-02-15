import { CameraType } from '@app/engine/camera/camera';
import { SoundNames } from '@app/engine/audio/sounds';
import { ServiceLocator } from '@app/engine/core/service-locator';
import { EventBus } from '@app/engine/events/event-bus';
import { EventBusEvent } from '@app/engine/events/event-bus-events';
import { KeepTrackPlugin } from '@app/engine/plugins/base-plugin';
import { IBottomIconConfig, ICommandPaletteCommand, IconPlacement } from '@app/engine/plugins/core/plugin-capabilities';
import globePng from '@public/img/icons/globe.png';

export class EarthCenteredView extends KeepTrackPlugin {
  readonly id = 'EarthCenteredView';
  dependencies_: string[] = [];

  getBottomIconConfig(): IBottomIconConfig {
    return {
      elementName: 'earth-centered-bottom-icon',
      label: 'Earth View',
      image: globePng,
      placement: IconPlacement.UTILITY_ONLY,
    };
  }

  getCommandPaletteCommands(): ICommandPaletteCommand[] {
    return [
      {
        id: 'EarthCenteredView.activate',
        label: 'Switch to Earth-Centered View',
        category: 'View',
        callback: () => this.bottomMenuClicked(),
      },
    ];
  }

  addJs(): void {
    super.addJs();

    // Keep icon state in sync with camera type
    EventBus.getInstance().on(EventBusEvent.updateLoop, () => {
      const isFixedToEarth = ServiceLocator.getMainCamera().cameraType === CameraType.FIXED_TO_EARTH;

      if (isFixedToEarth && !this.isMenuButtonActive) {
        this.setBottomIconToSelected();
      } else if (!isFixedToEarth && this.isMenuButtonActive) {
        this.setBottomIconToUnselected();
      }
    });
  }

  bottomIconCallback = (): void => {
    ServiceLocator.getSoundManager()?.play(SoundNames.TOGGLE_ON);
    ServiceLocator.getMainCamera().cameraType = CameraType.FIXED_TO_EARTH;
    this.setBottomIconToSelected();
  };
}
