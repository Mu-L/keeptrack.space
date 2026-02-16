import { vi } from 'vitest';
import { MenuMode, SolarBody } from '@app/engine/core/interfaces';
import { EventBus } from '@app/engine/events/event-bus';
import { EventBusEvent } from '@app/engine/events/event-bus-events';
import { PlanetsMenuPlugin } from '@app/plugins/planets-menu/planets-menu';
import { setupDefaultHtml } from '@test/environment/standard-env';
import { standardPluginMenuButtonTests, standardPluginSuite } from '@test/generic-tests';

describe('PlanetsMenuPlugin', () => {
  beforeEach(() => {
    setupDefaultHtml();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  standardPluginSuite(PlanetsMenuPlugin, 'PlanetsMenuPlugin');
  standardPluginMenuButtonTests(PlanetsMenuPlugin, 'PlanetsMenuPlugin');

  describe('Plugin identity', () => {
    it('should have correct plugin name', () => {
      const plugin = new PlanetsMenuPlugin();

      expect(plugin.id).toBe(PlanetsMenuPlugin.name);
    });

    it('should have no dependencies', () => {
      const plugin = new PlanetsMenuPlugin();

      expect(plugin.dependencies_).toEqual([]);
    });
  });

  describe('Configuration methods', () => {
    it('should return correct bottom icon config', () => {
      const plugin = new PlanetsMenuPlugin();
      const config = plugin.getBottomIconConfig();

      expect(config.elementName).toBe('menu-planets');
      expect(config.image).toBeDefined();
      expect(config.menuMode).toContain(MenuMode.BASIC);
      expect(config.menuMode).toContain(MenuMode.ADVANCED);
      expect(config.menuMode).toContain(MenuMode.ALL);
    });

    it('should return correct side menu config', () => {
      const plugin = new PlanetsMenuPlugin();
      const config = plugin.getSideMenuConfig();

      expect(config.elementName).toBe('planets-menu');
      expect(config.dragOptions?.isDraggable).toBe(true);
      expect(config.dragOptions?.minWidth).toBe(200);
      expect(config.dragOptions?.maxWidth).toBe(400);
    });

    it('should return correct help config', () => {
      const plugin = new PlanetsMenuPlugin();
      const helpConfig = plugin.getHelpConfig();

      expect(helpConfig.title).toBeDefined();
      expect(helpConfig.body).toBeDefined();
    });

    it('should return correct context menu config', () => {
      const plugin = new PlanetsMenuPlugin();
      const config = plugin.getContextMenuConfig();

      expect(config.level1ElementName).toBe('planets-rmb');
      expect(config.level2ElementName).toBe('planets-rmb-menu');
      expect(config.order).toBe(70);
      expect(config.isVisibleOnEarth).toBe(true);
      expect(config.isVisibleOffEarth).toBe(true);
    });

    it('should return keyboard shortcuts with Home key', () => {
      const plugin = new PlanetsMenuPlugin();
      const shortcuts = plugin.getKeyboardShortcuts();

      expect(shortcuts).toHaveLength(2);
      expect(shortcuts[0].key).toBe('Home');
      expect(shortcuts[0].shift).toBe(true);
      expect(shortcuts[0].callback).toBeInstanceOf(Function);
      expect(shortcuts[1].key).toBe('Home');
      expect(shortcuts[1].shift).toBe(false);
    });

    it('should return drag options with min and max width', () => {
      const plugin = new PlanetsMenuPlugin();
      const dragOptions = plugin['getDragOptions_']();

      expect(dragOptions.isDraggable).toBe(true);
      expect(dragOptions.minWidth).toBe(320);
      expect(dragOptions.maxWidth).toBe(400);
    });
  });

  describe('Side menu HTML', () => {
    it('should contain section headers', () => {
      const plugin = new PlanetsMenuPlugin();
      const menuHtml = plugin['buildSideMenuHtml_']();

      expect(menuHtml).toContain('Planets');
      expect(menuHtml).toContain('Dwarf Planets');
      expect(menuHtml).toContain('Other Celestial Bodies');
    });

    it('should include planet entries with data-planet attributes', () => {
      const plugin = new PlanetsMenuPlugin();
      const menuHtml = plugin['buildSideMenuHtml_']();

      expect(menuHtml).toContain('data-planet="Mercury"');
      expect(menuHtml).toContain('data-planet="Venus"');
      expect(menuHtml).toContain('data-planet="Earth"');
      expect(menuHtml).toContain('data-planet="Mars"');
    });

    it('should mark unsupported moons as disabled', () => {
      const plugin = new PlanetsMenuPlugin();
      const menuHtml = plugin['buildSideMenuHtml_']();

      expect(menuHtml).toContain('planets-menu-disabled');
      expect(menuHtml).toContain('Planned for future update.');
    });
  });

  describe('Context menu HTML', () => {
    it('should build level 2 HTML with planet entries', () => {
      const plugin = new PlanetsMenuPlugin();
      const rmbHtml = plugin['buildRmbL2Html_']();

      expect(rmbHtml).toContain('planets-Mercury-rmb');
      expect(rmbHtml).toContain('planets-Earth-rmb');
      expect(rmbHtml).toContain('planets-Moon-rmb');
    });
  });

  describe('onContextMenuAction', () => {
    it('should extract planet name from rmb ID format', () => {
      const plugin = new PlanetsMenuPlugin();

      plugin.changePlanet = vi.fn();

      plugin.onContextMenuAction('planets-Mercury-rmb');
      expect(plugin.changePlanet).toHaveBeenCalledWith(SolarBody.Mercury);
    });

    it('should pass raw planet name through when not in rmb format', () => {
      const plugin = new PlanetsMenuPlugin();

      plugin.changePlanet = vi.fn();

      plugin.onContextMenuAction('Mercury');
      expect(plugin.changePlanet).toHaveBeenCalledWith(SolarBody.Mercury);
    });

    it('should be called by rmbCallback legacy bridge', () => {
      const plugin = new PlanetsMenuPlugin();

      plugin.onContextMenuAction = vi.fn();

      plugin.rmbCallback('planets-Mars-rmb');
      expect(plugin.onContextMenuAction).toHaveBeenCalledWith('planets-Mars-rmb');
    });

    it('should not call onContextMenuAction when targetId is null', () => {
      const plugin = new PlanetsMenuPlugin();

      plugin.onContextMenuAction = vi.fn();

      plugin.rmbCallback(null);
      expect(plugin.onContextMenuAction).not.toHaveBeenCalled();
    });
  });

  describe('changePlanet', () => {
    it('should reject invalid planet names', () => {
      const plugin = new PlanetsMenuPlugin();

      // Should return without error for unknown planet
      expect(() => plugin.changePlanet('InvalidPlanet' as SolarBody)).not.toThrow();
    });
  });

  describe('planetsMenuClick', () => {
    it('should delegate to onContextMenuAction', () => {
      const plugin = new PlanetsMenuPlugin();

      plugin.onContextMenuAction = vi.fn();

      plugin.planetsMenuClick('Jupiter');
      expect(plugin.onContextMenuAction).toHaveBeenCalledWith('Jupiter');
    });
  });

  describe('Lifecycle', () => {
    it('should register uiManagerFinal handler on addHtml', () => {
      const plugin = new PlanetsMenuPlugin();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uiFinalSpy = vi.spyOn(plugin as any, 'uiManagerFinal_').mockImplementation(() => undefined);
      const onSpy = vi.spyOn(EventBus.getInstance(), 'on');

      plugin.addHtml();

      expect(onSpy).toHaveBeenCalledWith(EventBusEvent.uiManagerFinal, expect.any(Function));
      expect(uiFinalSpy).not.toHaveBeenCalled();
    });

    it('should call addDeepSpaceProbesMenu_ via onBottomIconClick', () => {
      const plugin = new PlanetsMenuPlugin();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spy = vi.spyOn(plugin as any, 'addDeepSpaceProbesMenu_').mockImplementation(() => undefined);

      plugin.onBottomIconClick();
      expect(spy).toHaveBeenCalled();
    });

    it('should bridge bottomIconCallback to onBottomIconClick', () => {
      const plugin = new PlanetsMenuPlugin();

      plugin.onBottomIconClick = vi.fn();

      plugin.bottomIconCallback();
      expect(plugin.onBottomIconClick).toHaveBeenCalled();
    });
  });
});
