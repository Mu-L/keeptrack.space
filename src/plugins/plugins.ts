import { EventBus } from '@app/engine/events/event-bus';
import { EventBusEvent } from '@app/engine/events/event-bus-events';
import { isThisNode } from '@app/engine/utils/isThisNode';
import { KeepTrackPlugin } from '../engine/plugins/base-plugin';
import { errorManagerInstance } from '../engine/utils/errorManager';
import { getEl } from '../engine/utils/get-el';
import type { KeepTrackPluginsConfiguration } from './keeptrack-plugins-configuration';
import type { PluginDescriptor } from './plugin-descriptor';
import { pluginManifest } from './plugin-manifest';

export class PluginManager {
  /**
   * Instantiate and initialize a single plugin from its descriptor.
   * Tries the pro import first when IS_PRO=true, falls back to OSS.
   */
  private static async loadPlugin_(descriptor: PluginDescriptor): Promise<void> {
    if (__IS_PRO__ && descriptor.proImport) {
      try {
        const mod = await descriptor.proImport();
        const className = descriptor.proClassName ?? descriptor.ossClassName;

        if (!className) {
          return;
        }
        const PluginClass = mod[className] as new () => KeepTrackPlugin;
        const plugin = new PluginClass();

        if (descriptor.isLoginRequired) {
          plugin.isLoginRequired = true;
        }
        plugin.init();

        return;
      } catch { /* fall through to OSS */ }
    }

    if (!descriptor.ossImport || !descriptor.ossClassName) {
      // Pro-only plugin with no OSS fallback — skip for non-pro builds
      return;
    }

    const mod = await descriptor.ossImport();
    const PluginClass = mod[descriptor.ossClassName] as new () => KeepTrackPlugin;

    new PluginClass().init();
  }

  async loadPlugins(plugins: KeepTrackPluginsConfiguration): Promise<void> {
    if (isThisNode()) {
      // Don't load plugins when running Jest in Node environment
      return;
    }

    plugins ??= <KeepTrackPluginsConfiguration>{};
    try {
      for (const descriptor of pluginManifest) {
        const config = descriptor.alwaysEnabled
          ? { enabled: true }
          : (plugins as Record<string, { enabled: boolean } | undefined>)[descriptor.configKey];

        if (config?.enabled) {
          try {
            // eslint-disable-next-line no-await-in-loop
            await PluginManager.loadPlugin_(descriptor);
          } catch (e) {
            errorManagerInstance.warn(`Error loading plugin ${descriptor.configKey}: ${(e as Error).message}`);
          }
        }
      }

      if (!plugins.TopMenu) {
        // Set --nav-bar-height of :root to 0px if topMenu is not enabled and ensure it overrides any other value
        document.documentElement.style.setProperty('--nav-bar-height', '0px');
      }

      // Load any settings from local storage after all plugins are loaded
      EventBus.getInstance().emit(EventBusEvent.loadSettings);

      EventBus.getInstance().on(
        EventBusEvent.uiManagerFinal,
        () => {
          this.uiManagerFinal_();
          KeepTrackPlugin.hideUnusedMenuModes();
        },
      );
    } catch (e) {
      errorManagerInstance.info(`Error loading core plugins: ${(e as Error).message}`);
    }
  }

  private uiManagerFinal_(): void {
    const bicDom = getEl('bottom-icons-container');

    if (bicDom) {
      const bottomHeight = bicDom.offsetHeight;

      document.documentElement.style.setProperty('--bottom-menu-height', `${bottomHeight}px`);
    } else {
      document.documentElement.style.setProperty('--bottom-menu-height', '0px');
    }
  }
}
