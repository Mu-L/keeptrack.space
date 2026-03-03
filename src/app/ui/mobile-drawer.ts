import { SoundNames } from '@app/engine/audio/sounds';
import { MenuMode } from '@app/engine/core/interfaces';
import { PluginRegistry } from '@app/engine/core/plugin-registry';
import { ServiceLocator } from '@app/engine/core/service-locator';
import { EventBus } from '@app/engine/events/event-bus';
import { EventBusEvent } from '@app/engine/events/event-bus-events';
import { KeepTrackPlugin } from '@app/engine/plugins/base-plugin';
import { IconPlacement, UtilityGroup } from '@app/engine/plugins/core/plugin-capabilities';
import { TopMenuPlugin } from '@app/engine/plugins/top-menu-plugin';
import { getEl } from '@app/engine/utils/get-el';
import './mobile-drawer.css';

interface DrawerItemData_ {
  id: string;
  label: string;
  imgSrc: string;
  isTopMenu: boolean;
  isDisabled?: boolean;
  order: number;
}

interface DrawerGroup_ {
  label: string;
  items: DrawerItemData_[];
}

const MODE_LABELS: Record<number, string> = {
  [MenuMode.BASIC]: 'Basic',
  [MenuMode.CREATE]: 'Create',
  [MenuMode.ADVANCED]: 'Advanced',
  [MenuMode.ANALYSIS]: 'Analysis',
  [MenuMode.SETTINGS]: 'Settings',
  [MenuMode.EXPERIMENTAL]: 'Experimental',
};

export class MobileDrawer {
  private isOpen_ = false;
  private drawerEl_: HTMLElement | null = null;
  private overlayEl_: HTMLElement | null = null;
  private hamburgerEl_: HTMLElement | null = null;

  init(): void {
    if (!settingsManager.isMobileModeEnabled) {
      return;
    }

    document.body.classList.add('is-mobile-mode');

    EventBus.getInstance().on(EventBusEvent.uiManagerInit, () => {
      this.createDrawerDom_();
      this.createHamburgerButton_();
    });

    EventBus.getInstance().on(EventBusEvent.uiManagerFinal, () => {
      this.populateDrawerItems_();
      this.wireEventListeners_();
    });

    EventBus.getInstance().on(EventBusEvent.onKeepTrackReady, () => {
      this.drawerEl_?.classList.add('ready');
    });

    EventBus.getInstance().on(EventBusEvent.hideSideMenus, () => {
      this.close();
    });

    EventBus.getInstance().on(EventBusEvent.selectSatData, () => {
      this.close();
    });
  }

  open(): void {
    if (this.isOpen_) {
      return;
    }
    this.isOpen_ = true;
    this.syncActiveState_();
    this.drawerEl_?.classList.add('open');
    this.overlayEl_?.classList.add('open');
  }

  close(): void {
    if (!this.isOpen_) {
      return;
    }
    this.isOpen_ = false;
    this.drawerEl_?.classList.remove('open');
    this.overlayEl_?.classList.remove('open');
  }

  toggle(): void {
    if (this.isOpen_) {
      this.close();
    } else {
      this.open();
    }
  }

  private createHamburgerButton_(): void {
    if (!this.drawerEl_) {
      return;
    }

    const btn = document.createElement('button');

    btn.id = 'mobile-hamburger';
    btn.className = 'mobile-hamburger';
    btn.setAttribute('aria-label', 'Open menu');
    btn.innerHTML = [
      '<span class="mobile-hamburger-bar"></span>',
      '<span class="mobile-hamburger-bar"></span>',
      '<span class="mobile-hamburger-bar"></span>',
    ].join('');

    this.drawerEl_.appendChild(btn);
    this.hamburgerEl_ = btn;
  }

  private createDrawerDom_(): void {
    const root = getEl('keeptrack-root');

    if (!root) {
      return;
    }

    const overlay = document.createElement('div');

    overlay.id = 'mobile-drawer-overlay';
    overlay.className = 'mobile-drawer-overlay';

    const drawer = document.createElement('div');

    drawer.id = 'mobile-drawer';
    drawer.className = 'mobile-drawer';
    drawer.innerHTML = [
      '<div class="mobile-drawer-inner">',
      '  <div class="mobile-drawer-header">',
      `    <span class="mobile-drawer-title">KeepTrack v${__VERSION__}</span>`,
      '  </div>',
      '  <div id="mobile-drawer-content" class="mobile-drawer-content"></div>',
      '</div>',
    ].join('');

    root.appendChild(overlay);
    root.appendChild(drawer);

    this.overlayEl_ = overlay;
    this.drawerEl_ = drawer;
  }

  private populateDrawerItems_(): void {
    const plugins = PluginRegistry.plugins;
    const groups: Record<string, DrawerGroup_> = {};

    // Initialize MenuMode groups
    for (const [mode, label] of Object.entries(MODE_LABELS)) {
      groups[`mode-${mode}`] = { label, items: [] };
    }

    groups['utility-camera'] = { label: 'Camera Modes', items: [] };
    groups['utility-layers'] = { label: 'Layer Toggles', items: [] };
    groups['utility-settings'] = { label: 'Settings Toggles', items: [] };
    groups['top-menu'] = { label: 'Quick Actions', items: [] };

    for (const plugin of plugins) {
      // Handle TopMenuPlugins — query their injected DOM elements for icon/label
      if (plugin instanceof TopMenuPlugin) {
        const btnEl = getEl(`${plugin.id}-btn`, true);
        const imgEl = btnEl?.querySelector('img') as HTMLImageElement | null;
        const tooltip = btnEl?.getAttribute('kt-tooltip') || plugin.id;

        if (imgEl) {
          groups['top-menu'].items.push({
            id: plugin.id,
            label: tooltip,
            imgSrc: imgEl.src || (imgEl as HTMLImageElement).getAttribute('delayedsrc') || '',
            isTopMenu: true,
            order: 0,
          });
        }
        continue;
      }

      // Handle bottom icon plugins
      if (!plugin.bottomIconElementName || !plugin.bottomIconImg) {
        continue;
      }

      const order = plugin.bottomIconOrder ?? KeepTrackPlugin.MAX_BOTTOM_ICON_ORDER;

      // Resolve the image source — it may be a webpack module or a string
      const imgSrc = this.resolveImgSrc_(plugin);

      // Put in utility group if applicable
      if (plugin.iconPlacement === IconPlacement.UTILITY_ONLY || plugin.iconPlacement === IconPlacement.BOTH) {
        const utilityKey =
          plugin.utilityGroup === UtilityGroup.CAMERA_MODE ? 'utility-camera'
            : plugin.utilityGroup === UtilityGroup.SETTINGS_TOGGLE ? 'utility-settings'
              : 'utility-layers';

        groups[utilityKey].items.push({
          id: plugin.bottomIconElementName,
          label: plugin.bottomIconLabel,
          imgSrc,
          isTopMenu: false,
          isDisabled: plugin.isIconDisabledOnLoad,
          order,
        });
      }

      // Put in first matching MenuMode group (bottom-only or both)
      if (plugin.iconPlacement !== IconPlacement.UTILITY_ONLY) {
        const primaryMode = plugin.menuMode.find((m) => m !== MenuMode.ALL) ?? MenuMode.BASIC;

        groups[`mode-${primaryMode}`]?.items.push({
          id: plugin.bottomIconElementName,
          label: plugin.bottomIconLabel,
          imgSrc,
          isTopMenu: false,
          isDisabled: plugin.isIconDisabledOnLoad,
          order,
        });
      }
    }

    // Render non-empty groups
    const contentEl = getEl('mobile-drawer-content');

    if (!contentEl) {
      return;
    }

    let html = '';

    for (const group of Object.values(groups)) {
      if (group.items.length === 0) {
        continue;
      }

      // Sort items within the group by order
      group.items.sort((a, b) => a.order - b.order);

      html += `<div class="mobile-drawer-group-header">${group.label}</div>`;

      for (const item of group.items) {
        const dataAttr = item.isTopMenu ? `data-top-menu-id="${item.id}"` : `data-plugin-id="${item.id}"`;
        const disabledClass = item.isDisabled ? ' disabled' : '';

        html += `<div class="mobile-drawer-item${disabledClass}" ${dataAttr}>`;
        html += `<img class="mobile-drawer-item-icon" src="${item.imgSrc}" alt="${item.label}" />`;
        html += `<span class="mobile-drawer-item-label">${item.label}</span>`;
        html += '</div>';
      }
    }

    contentEl.innerHTML = html;
  }

  private resolveImgSrc_(plugin: KeepTrackPlugin): string {
    // Try to get from the already-rendered bottom icon DOM element
    const iconEl = getEl(plugin.bottomIconElementName, true);
    const img = iconEl?.querySelector('img') as HTMLImageElement | null;

    if (img) {
      return img.src || img.getAttribute('delayedsrc') || String(plugin.bottomIconImg);
    }

    return String(plugin.bottomIconImg);
  }

  private wireEventListeners_(): void {
    const drawerContent = getEl('mobile-drawer-content');

    if (drawerContent) {
      drawerContent.addEventListener('click', (evt: Event) => {
        const itemEl = (evt.target as HTMLElement).closest('.mobile-drawer-item') as HTMLElement | null;

        if (!itemEl || itemEl.classList.contains('disabled')) {
          return;
        }

        const pluginId = itemEl.dataset.pluginId;
        const topMenuId = itemEl.dataset.topMenuId;

        if (pluginId) {
          ServiceLocator.getSoundManager()?.play(SoundNames.CLICK);
          // Close drawer first so the side menu can animate cleanly
          this.close();
          // Small delay to let the drawer close before emitting the event
          setTimeout(() => {
            EventBus.getInstance().emit(EventBusEvent.bottomMenuClick, pluginId);
          }, 100);
        } else if (topMenuId) {
          ServiceLocator.getSoundManager()?.play(SoundNames.CLICK);
          const btnEl = getEl(`${topMenuId}-btn`, true);

          btnEl?.click();
          this.close();
        }
      });
    }

    // Hamburger button
    this.hamburgerEl_?.addEventListener('click', () => {
      ServiceLocator.getSoundManager()?.play(SoundNames.CLICK);
      this.toggle();
    });

    // Overlay click closes drawer
    this.overlayEl_?.addEventListener('click', () => {
      this.close();
    });

    // Escape key closes drawer
    window.addEventListener('keydown', (evt: KeyboardEvent) => {
      if (evt.key === 'Escape' && this.isOpen_) {
        this.close();
      }
    });

  }

  private syncActiveState_(): void {
    const contentEl = getEl('mobile-drawer-content');

    if (!contentEl) {
      return;
    }

    contentEl.querySelectorAll('.mobile-drawer-item[data-plugin-id]').forEach((el) => {
      const pluginId = (el as HTMLElement).dataset.pluginId;
      const bottomIcon = pluginId ? getEl(pluginId, true) : null;
      const isSelected = bottomIcon?.classList.contains('bmenu-item-selected') ?? false;

      el.classList.toggle('active', isSelected);
    });
  }
}
