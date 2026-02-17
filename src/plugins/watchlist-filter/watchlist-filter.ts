import { SoundNames } from '@app/engine/audio/sounds';
import { MenuMode, ToastMsgType } from '@app/engine/core/interfaces';
import { PluginRegistry } from '@app/engine/core/plugin-registry';
import { ServiceLocator } from '@app/engine/core/service-locator';
import { EventBus } from '@app/engine/events/event-bus';
import { EventBusEvent } from '@app/engine/events/event-bus-events';
import { KeepTrackPlugin } from '@app/engine/plugins/base-plugin';
import { IBottomIconConfig, ICommandPaletteCommand, IKeyboardShortcut, IconPlacement } from '@app/engine/plugins/core/plugin-capabilities';
import satellitePng from '@public/img/icons/satellite.png';
import { WatchlistPlugin } from '../satellite-lists/satellite-lists';

export class WatchlistFilterPlugin extends KeepTrackPlugin {
  readonly id = 'WatchlistFilterPlugin';
  dependencies_ = [WatchlistPlugin.name];

  bottomIconCallback = (): void => {
    this.onBottomIconClick();
  };

  getBottomIconConfig(): IBottomIconConfig {
    return {
      elementName: 'watchlist-filter-icon',
      label: 'Show Watchlist Only',
      image: satellitePng,
      menuMode: [MenuMode.ADVANCED, MenuMode.ALL],
      placement: IconPlacement.UTILITY_ONLY,
    };
  }

  getKeyboardShortcuts(): IKeyboardShortcut[] {
    return [
      {
        key: 'W',
        callback: () => this.bottomMenuClicked(),
      },
    ];
  }

  getCommandPaletteCommands(): ICommandPaletteCommand[] {
    return [
      {
        id: 'WatchlistFilter.toggle',
        label: 'Show Watchlist Satellites Only',
        category: 'Display',
        shortcutHint: 'W',
        callback: () => this.bottomMenuClicked(),
      },
    ];
  }

  addJs(): void {
    super.addJs();

    // Auto-deactivate when watchlist becomes empty
    EventBus.getInstance().on(EventBusEvent.onWatchlistRemove, () => {
      const watchlistPlugin = PluginRegistry.getPlugin(WatchlistPlugin);

      if (this.isMenuButtonActive && (!watchlistPlugin || watchlistPlugin.watchlistList.length === 0)) {
        watchlistPlugin?.setFilterActive(false);
        this.setBottomIconToUnselected();
      }
    });
  }

  onBottomIconClick(): void {
    const watchlistPlugin = PluginRegistry.getPlugin(WatchlistPlugin);

    if (!watchlistPlugin || watchlistPlugin.watchlistList.length === 0) {
      this.shakeBottomIcon();
      ServiceLocator.getUiManager().toast('No satellites in watchlist', ToastMsgType.caution);

      return;
    }

    if (this.isMenuButtonActive) {
      ServiceLocator.getSoundManager()?.play(SoundNames.TOGGLE_ON);
    } else {
      ServiceLocator.getSoundManager()?.play(SoundNames.TOGGLE_OFF);
    }

    // Delegate to centralized filter management (syncs checkbox + applies/clears filter)
    watchlistPlugin.setFilterActive(this.isMenuButtonActive);
  }
}
