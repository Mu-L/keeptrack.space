import { SoundNames } from '@app/engine/audio/sounds';
import { MenuMode } from '@app/engine/core/interfaces';
import { KeyboardShortcutRegistry } from '@app/engine/core/keyboard-shortcut-registry';
import { PluginRegistry } from '@app/engine/core/plugin-registry';
import { ServiceLocator } from '@app/engine/core/service-locator';
import { EventBus } from '@app/engine/events/event-bus';
import { EventBusEvent } from '@app/engine/events/event-bus-events';
import { KeepTrackPlugin } from '@app/engine/plugins/base-plugin';
import { IconPlacement, UtilityGroup } from '@app/engine/plugins/core/plugin-capabilities';
import { TopMenuPlugin } from '@app/engine/plugins/top-menu-plugin';
import { getEl } from '@app/engine/utils/get-el';
import { PersistenceManager, StorageKey } from '@app/engine/utils/persistence-manager';
import { TopMenu } from '@app/plugins/top-menu/top-menu';
import { settingsManager } from '@app/settings/settings';
import './plugin-drawer.css';

interface DrawerItemData_ {
  id: string;
  pluginId?: string;
  label: string;
  imgSrc: string;
  isTopMenu: boolean;
  isDisabled?: boolean;
  isLoginRequired?: boolean;
  order: number;
  shortcutHint?: string;
}

interface DrawerGroup_ {
  label: string;
  items: DrawerItemData_[];
}

const MODE_LABELS: Record<number, string> = {
  [MenuMode.CATALOG]: 'Catalog',
  [MenuMode.SENSORS]: 'Sensors',
  [MenuMode.EVENTS]: 'Events',
  [MenuMode.CREATE]: 'Create',
  [MenuMode.ANALYSIS]: 'Analysis',
  [MenuMode.DISPLAY]: 'Display',
  [MenuMode.TOOLS]: 'Tools',
  [MenuMode.SETTINGS]: 'Settings',
  [MenuMode.EXPERIMENTAL]: 'Experimental',
};

/** Nav item IDs that should appear in the utility footer instead of Quick Actions */
const UTILITY_NAV_ITEM_IDS = new Set(['sound-btn', 'layers-menu-btn']);

export class PluginDrawer {
  private isOpen_ = false;
  private isMobileMode_ = false;
  private drawerEl_: HTMLElement | null = null;
  private overlayEl_: HTMLElement | null = null;
  private hamburgerEl_: HTMLElement | null = null;
  private groupStates_: Record<string, boolean> = {};

  init(): void {
    this.isMobileMode_ = settingsManager.isMobileModeEnabled;

    document.body.classList.add('drawer-mode');
    if (this.isMobileMode_) {
      document.body.classList.add('is-mobile-mode');
    }

    this.loadGroupStates_();

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
      this.syncDisabledState_();
    });

    EventBus.getInstance().on(EventBusEvent.setSensor, () => {
      this.syncDisabledState_();
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
    this.hamburgerEl_?.classList.add('open');
  }

  close(): void {
    if (!this.isOpen_) {
      return;
    }
    this.isOpen_ = false;
    this.drawerEl_?.classList.remove('open');
    this.overlayEl_?.classList.remove('open');
    this.hamburgerEl_?.classList.remove('open');
  }

  toggle(): void {
    if (this.isOpen_) {
      this.close();
    } else {
      this.open();
    }
  }

  private createHamburgerButton_(): void {
    const btn = document.createElement('div');

    btn.id = 'drawer-hamburger';
    btn.className = 'drawer-hamburger';
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-label', 'Open plugin menu');
    btn.innerHTML = [
      '<span class="drawer-hamburger-bar"></span>',
      '<span class="drawer-hamburger-bar"></span>',
      '<span class="drawer-hamburger-bar"></span>',
    ].join('');

    const logoEl = settingsManager.navBarLogoUrl
      ? document.createElement('a')
      : document.createElement('div');

    logoEl.id = 'nav-logo';
    logoEl.className = 'nav-logo';
    if (settingsManager.navBarLogoUrl && logoEl instanceof HTMLAnchorElement) {
      logoEl.href = 'https://keeptrack.space';
      logoEl.target = '_blank';
      logoEl.rel = 'noopener noreferrer';
      logoEl.innerHTML = `<img src="${settingsManager.navBarLogoUrl}" alt="KeepTrack" />`;
    }

    const navWrapper = getEl('nav-wrapper', true);

    if (this.isMobileMode_) {
      // Mobile: hamburger inside the drawer, logo in the nav bar
      this.drawerEl_?.appendChild(btn);
      navWrapper?.prepend(logoEl);
    } else {
      // Desktop: hamburger + logo in the nav bar (top-left)
      navWrapper?.prepend(logoEl);
      navWrapper?.prepend(btn);
    }

    this.hamburgerEl_ = btn;
  }

  private createDrawerDom_(): void {
    const root = getEl('keeptrack-root', true);

    if (!root) {
      return;
    }

    const modeClass = this.isMobileMode_ ? 'mobile-mode' : 'desktop-mode';

    const overlay = document.createElement('div');

    overlay.id = 'drawer-overlay';
    overlay.className = 'drawer-overlay';

    const drawer = document.createElement('div');

    drawer.id = 'plugin-drawer';
    drawer.className = `plugin-drawer ${modeClass}`;
    drawer.innerHTML = [
      '<div class="drawer-inner">',
      // '  <div class="drawer-header">',
      // `    <span class="drawer-title">KeepTrack v${__VERSION__}</span>`,
      // '  </div>',
      '  <div id="drawer-content" class="drawer-content"></div>',
      '</div>',
      '<div id="drawer-user-account" class="drawer-user-account"></div>',
    ].join('');

    // Utility footer inside ui-wrapper so it shares the same stacking context as side menus
    const utilityFooter = document.createElement('div');

    utilityFooter.id = 'drawer-utility-footer';
    utilityFooter.className = 'drawer-utility-footer';

    root.appendChild(overlay);
    root.appendChild(drawer);

    const uiWrapper = getEl('ui-wrapper', true);

    (uiWrapper ?? root).appendChild(utilityFooter);

    this.overlayEl_ = overlay;
    this.drawerEl_ = drawer;
  }

  private populateDrawerItems_(): void {
    const plugins = PluginRegistry.plugins;
    const menuGroups: Record<string, DrawerGroup_> = {};
    const utilityGroups: Record<string, DrawerGroup_> = {};

    // Initialize MenuMode groups (scrollable content)
    for (const [mode, label] of Object.entries(MODE_LABELS)) {
      menuGroups[`mode-${mode}`] = { label, items: [] };
    }

    // Initialize utility groups (pinned footer)
    utilityGroups['utility-camera'] = { label: 'Camera Modes', items: [] };
    utilityGroups['utility-layers'] = { label: 'Layer Toggles', items: [] };
    utilityGroups['utility-settings'] = { label: 'Settings Toggles', items: [] };

    // About group for TopMenuPlugin instances (e.g., GithubLink)
    menuGroups.about = { label: 'About', items: [] };

    for (const plugin of plugins) {
      // Handle TopMenuPlugins — put in About group
      if (plugin instanceof TopMenuPlugin) {
        const btnEl = getEl(`${plugin.id}-btn`, true);
        const imgEl = btnEl?.querySelector('img') as HTMLImageElement | null;
        const tooltip = btnEl?.getAttribute('kt-tooltip') || plugin.id;

        if (imgEl) {
          menuGroups.about.items.push({
            id: plugin.id,
            label: tooltip,
            imgSrc: imgEl.src || imgEl.getAttribute('delayedsrc') || '',
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
        let utilityKey: string;

        if (plugin.utilityGroup === UtilityGroup.CAMERA_MODE) {
          utilityKey = 'utility-camera';
        } else if (plugin.utilityGroup === UtilityGroup.SETTINGS_TOGGLE) {
          utilityKey = 'utility-settings';
        } else {
          utilityKey = 'utility-layers';
        }

        const isProGated = plugin.isLoginRequired && !settingsManager.isDisableLoginGate;

        utilityGroups[utilityKey].items.push({
          id: plugin.bottomIconElementName,
          pluginId: plugin.id,
          label: plugin.bottomIconLabel,
          imgSrc,
          isTopMenu: false,
          isDisabled: plugin.isIconDisabledOnLoad,
          isLoginRequired: isProGated,
          order,
        });
      }

      // Put in first matching MenuMode group (only if not in the utility footer)
      if (plugin.iconPlacement === IconPlacement.BOTTOM_ONLY) {
        const isProGated = plugin.isLoginRequired && !settingsManager.isDisableLoginGate;
        const primaryMode = plugin.menuMode.find((m) => m !== MenuMode.ALL) ?? MenuMode.CATALOG;

        menuGroups[`mode-${primaryMode}`]?.items.push({
          id: plugin.bottomIconElementName,
          label: plugin.bottomIconLabel,
          imgSrc,
          isTopMenu: false,
          isDisabled: plugin.isIconDisabledOnLoad,
          isLoginRequired: isProGated,
          order,
          shortcutHint: PluginDrawer.getShortcutHint_(plugin.id),
        });
      }
    }

    // Add TopMenu navItems (sound, layers, tutorial, etc.) to appropriate groups
    const topMenu = PluginRegistry.getPlugin(TopMenu);

    if (topMenu) {
      for (const navItem of topMenu.navItems) {
        const btnEl = getEl(navItem.id, true);
        const imgEl = btnEl?.querySelector('img') as HTMLImageElement | null;
        const imgSrc = imgEl?.src || imgEl?.getAttribute('delayedsrc') || String(navItem.icon);
        const tooltip = btnEl?.getAttribute('kt-tooltip') || navItem.tooltip || navItem.id;
        const isDisabled = btnEl?.classList.contains('bmenu-item-disabled') ?? false;

        const item: DrawerItemData_ = {
          id: navItem.id,
          label: tooltip,
          imgSrc,
          isTopMenu: true,
          isDisabled,
          order: navItem.order,
        };

        if (UTILITY_NAV_ITEM_IDS.has(navItem.id)) {
          utilityGroups['utility-settings'].items.push(item);
        }
      }
    }

    this.renderMenuGroups_(menuGroups);
    this.renderUtilityFooter_(utilityGroups);
    this.syncInitialUtilityState_();
    PluginDrawer.updateBottomMenuCssVars_();
  }

  private renderMenuGroups_(groups: Record<string, DrawerGroup_>): void {
    const contentEl = getEl('drawer-content', true);

    if (!contentEl) {
      return;
    }

    let html = '';

    for (const [key, group] of Object.entries(groups)) {
      if (group.items.length === 0) {
        continue;
      }

      group.items.sort((a, b) => a.order - b.order);

      const isExpanded = this.groupStates_[key] !== false;
      const collapsedClass = isExpanded ? '' : ' collapsed';

      html += `<div class="drawer-group${collapsedClass}" data-group-key="${key}">`;
      html += '<div class="drawer-group-header">';
      html += `<span class="drawer-group-label">${group.label}</span>`;
      html += '<span class="drawer-group-chevron">&#x25BE;</span>';
      html += '</div>';
      html += '<div class="drawer-group-items">';

      for (const item of group.items) {
        const dataAttr = item.isTopMenu ? `data-top-menu-id="${item.id}"` : `data-plugin-id="${item.id}"`;
        const disabledClass = item.isDisabled ? ' disabled' : '';
        const proClass = item.isLoginRequired ? ' bmenu-item-pro' : '';
        const proAttr = item.isLoginRequired ? ' data-pro-gated' : '';
        const tabIdx = item.isDisabled ? '' : ' tabindex="0"';
        const shortcutBadge = item.shortcutHint ? `<span class="drawer-item-shortcut">${item.shortcutHint}</span>` : '';

        html += `<div class="drawer-item${disabledClass}${proClass}" ${dataAttr}${proAttr}${tabIdx} role="button">`;
        html += `<img class="drawer-item-icon" src="${item.imgSrc}" alt="${item.label}" />`;
        html += `<span class="drawer-item-label">${item.label}</span>`;
        html += shortcutBadge;
        html += '</div>';
      }

      html += '</div>';
      html += '</div>';
    }

    contentEl.innerHTML = html;

    // Wire group header click handlers for collapsible behavior
    contentEl.querySelectorAll('.drawer-group-header').forEach((header) => {
      header.addEventListener('click', () => {
        const groupEl = header.parentElement;

        groupEl?.classList.toggle('collapsed');
        const key = groupEl?.getAttribute('data-group-key');

        if (key) {
          this.groupStates_[key] = !groupEl?.classList.contains('collapsed');
          this.saveGroupStates_();
        }
      });
    });
  }

  private renderUtilityFooter_(groups: Record<string, DrawerGroup_>): void {
    const footerEl = getEl('drawer-utility-footer', true);

    if (!footerEl) {
      return;
    }

    let html = '';

    for (const [, group] of Object.entries(groups)) {
      if (group.items.length === 0) {
        continue;
      }

      group.items.sort((a, b) => a.order - b.order);

      html += '<div class="drawer-utility-section">';
      html += `<div class="drawer-utility-section-label">${group.label}</div>`;
      html += '<div class="drawer-utility-icons">';

      for (const item of group.items) {
        const disabledClass = item.isDisabled ? ' bmenu-item-disabled' : '';
        const proClass = item.isLoginRequired ? ' bmenu-item-pro' : '';
        const proAttr = item.isLoginRequired ? ' data-pro-gated' : '';
        const dataAttr = item.isTopMenu ? `data-top-menu-id="${item.id}"` : `data-plugin-id="${item.id}"`;
        const idAttr = item.pluginId ? ` id="${item.pluginId}-utility-icon"` : '';

        html += `<div class="drawer-utility-icon${disabledClass}${proClass}"${idAttr} ${dataAttr}${proAttr} kt-tooltip="${item.label}">`;
        html += `<img src="${item.imgSrc}" alt="${item.label}" />`;
        html += '</div>';
      }

      html += '</div>';
      html += '</div>';
    }

    footerEl.innerHTML = html;
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
    const drawerContent = getEl('drawer-content', true);

    if (drawerContent) {
      drawerContent.addEventListener('click', (evt: Event) => {
        const itemEl = (evt.target as HTMLElement).closest('.drawer-item') as HTMLElement | null;

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

      // Keyboard activation (Enter/Space) for drawer items
      drawerContent.addEventListener('keydown', (evt: KeyboardEvent) => {
        if (evt.key !== 'Enter' && evt.key !== ' ') {
          return;
        }
        const itemEl = evt.target as HTMLElement;

        if (!itemEl.classList.contains('drawer-item') || itemEl.classList.contains('disabled')) {
          return;
        }
        evt.preventDefault();
        itemEl.click();
      });
    }

    // Utility footer click handler
    const utilityFooter = getEl('drawer-utility-footer', true);

    if (utilityFooter) {
      utilityFooter.addEventListener('click', (evt: Event) => {
        const iconEl = (evt.target as HTMLElement).closest('.drawer-utility-icon') as HTMLElement | null;

        if (!iconEl || iconEl.classList.contains('disabled')) {
          return;
        }

        const pluginId = iconEl.dataset.pluginId;
        const topMenuId = iconEl.dataset.topMenuId;

        if (pluginId) {
          ServiceLocator.getSoundManager()?.play(SoundNames.CLICK);
          EventBus.getInstance().emit(EventBusEvent.bottomMenuClick, pluginId);
        } else if (topMenuId) {
          ServiceLocator.getSoundManager()?.play(SoundNames.CLICK);
          const btnEl = getEl(topMenuId, true);

          btnEl?.click();
          iconEl.classList.toggle('bmenu-item-selected');
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

    // Escape key closes drawer, Tab key toggles drawer
    window.addEventListener('keydown', (evt: KeyboardEvent) => {
      if (evt.key === 'Escape' && this.isOpen_) {
        this.close();
      }

      if (evt.key === 'Tab') {
        // Don't toggle if user is typing in an input/textarea
        const activeEl = document.activeElement;

        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) {
          return;
        }

        evt.preventDefault();
        this.toggle();
      }
    });
  }

  private syncActiveState_(): void {
    // Sync menu items (both selected and disabled state)
    const contentEl = getEl('drawer-content', true);

    contentEl?.querySelectorAll('.drawer-item[data-plugin-id]').forEach((el) => {
      const pluginId = (el as HTMLElement).dataset.pluginId;
      const bottomIcon = pluginId ? getEl(pluginId, true) : null;
      const isSelected = bottomIcon?.classList.contains('bmenu-item-selected') ?? false;
      const isDisabled = bottomIcon?.classList.contains('bmenu-item-disabled') ?? false;

      el.classList.toggle('active', isSelected);
      el.classList.toggle('disabled', isDisabled);
    });

    this.syncUtilityFooterState_();
  }

  private syncUtilityFooterState_(): void {
    const footerEl = getEl('drawer-utility-footer', true);

    footerEl?.querySelectorAll('.drawer-utility-icon[data-plugin-id]').forEach((el) => {
      const pluginId = (el as HTMLElement).dataset.pluginId;
      const bottomIcon = pluginId ? getEl(pluginId, true) : null;

      // UTILITY_ONLY plugins have no bottom bar icon element — their utility
      // icon state is managed directly by setBottomIconToSelected/Unselected
      if (!bottomIcon) {
        return;
      }
      const isSelected = bottomIcon.classList.contains('bmenu-item-selected');

      el.classList.toggle('bmenu-item-selected', isSelected);
    });

    footerEl?.querySelectorAll('.drawer-utility-icon[data-top-menu-id]').forEach((el) => {
      const topMenuId = (el as HTMLElement).dataset.topMenuId;
      const navBtn = topMenuId ? getEl(topMenuId, true) : null;
      const isSelected = navBtn?.classList.contains('bmenu-item-selected') ?? false;
      const isDisabled = navBtn?.classList.contains('bmenu-item-disabled') ?? false;

      el.classList.toggle('bmenu-item-selected', isSelected);
      el.classList.toggle('bmenu-item-disabled', isDisabled);
    });
  }

  /**
   * Syncs initial selected/disabled state from plugin objects to newly-created drawer utility icons.
   * Needed because plugins may call setBottomIconToSelected() before the drawer creates its icons.
   */
  private syncInitialUtilityState_(): void {
    // Sync plugin-based utility icons from plugin state
    for (const plugin of PluginRegistry.plugins) {
      const utilityIcon = getEl(`${plugin.id}-utility-icon`, true);

      if (!utilityIcon) {
        continue;
      }
      if (plugin.isMenuButtonActive) {
        utilityIcon.classList.add('bmenu-item-selected');
      }
      if (plugin.isIconDisabled) {
        utilityIcon.classList.add('bmenu-item-disabled');
      }
    }

    // Sync top-menu-based utility icons from nav button DOM
    const footerEl = getEl('drawer-utility-footer', true);

    footerEl?.querySelectorAll('.drawer-utility-icon[data-top-menu-id]').forEach((el) => {
      const topMenuId = (el as HTMLElement).dataset.topMenuId;
      const navBtn = topMenuId ? getEl(topMenuId, true) : null;
      // At init time, check both the element and its inner container (classInner)
      const isSelected = navBtn?.classList.contains('bmenu-item-selected') ||
        !!navBtn?.querySelector('.bmenu-item-selected');

      el.classList.toggle('bmenu-item-selected', !!isSelected);
    });
  }

  private syncDisabledState_(): void {
    const contentEl = getEl('drawer-content', true);

    contentEl?.querySelectorAll('.drawer-item[data-plugin-id]').forEach((el) => {
      const pluginId = (el as HTMLElement).dataset.pluginId;
      const bottomIcon = pluginId ? getEl(pluginId, true) : null;
      const isDisabled = bottomIcon?.classList.contains('bmenu-item-disabled') ?? false;

      el.classList.toggle('disabled', isDisabled);
    });

    this.syncUtilityFooterState_();
  }

  private static updateBottomMenuCssVars_(): void {
    // const footerEl = getEl('drawer-utility-footer', true);
    // const height = footerEl?.offsetHeight ?? 0;
    const height = 0;

    document.documentElement.style.setProperty('--bottom-menu-top', `${height}px`);
    document.documentElement.style.setProperty('--bottom-menu-height', `${height}px`);
  }

  private loadGroupStates_(): void {
    try {
      const stored = PersistenceManager.getInstance().getItem(StorageKey.DRAWER_GROUP_STATES);

      if (stored) {
        this.groupStates_ = JSON.parse(stored) as Record<string, boolean>;
      }
    } catch {
      // Ignore parse errors — use defaults (all expanded)
    }
  }

  private saveGroupStates_(): void {
    try {
      PersistenceManager.getInstance().saveItem(
        StorageKey.DRAWER_GROUP_STATES,
        JSON.stringify(this.groupStates_),
      );
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Look up the first registered keyboard shortcut for a plugin and return a display string.
   */
  private static getShortcutHint_(pluginId: string): string | undefined {
    const allShortcuts = KeyboardShortcutRegistry.getAll();

    for (const entry of allShortcuts) {
      if (entry.pluginId === pluginId) {
        return KeyboardShortcutRegistry.formatShortcut(entry.shortcut);
      }
    }

    return undefined;
  }
}
