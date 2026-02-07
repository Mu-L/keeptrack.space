/* eslint-disable dot-notation */
import { Inc2LonPlots } from '@app/plugins/plot-analysis/inc2lon';
import { SelectSatManager } from '@app/plugins/select-sat-manager/select-sat-manager';
import { setupStandardEnvironment } from '@test/environment/standard-env';
import { standardPluginMenuButtonTests, standardPluginSuite, websiteInit } from '@test/generic-tests';

describe('Inc2LonPlots_class', () => {
  beforeEach(() => {
    setupStandardEnvironment([SelectSatManager]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  standardPluginSuite(Inc2LonPlots, 'Inc2LonPlots');
  standardPluginMenuButtonTests(Inc2LonPlots, 'Inc2LonPlots');

  describe('Configuration methods', () => {
    it('should return correct bottom icon config', () => {
      const plugin = new Inc2LonPlots();
      const config = plugin.getBottomIconConfig();

      expect(config.elementName).toBe('inc2lon-plots-icon');
      expect(config.image).toBeDefined();
      expect(config.menuMode).toBeDefined();
    });

    it('should return correct side menu config', () => {
      const plugin = new Inc2LonPlots();
      const config = plugin.getSideMenuConfig();

      expect(config.elementName).toBe('inc2lon-plots-menu');
      expect(config.dragOptions?.isDraggable).toBe(true);
      expect(config.dragOptions?.minWidth).toBe(650);
      expect(config.dragOptions?.maxWidth).toBe(1200);
    });

    it('should return correct help config', () => {
      const plugin = new Inc2LonPlots();
      const helpConfig = plugin.getHelpConfig();

      expect(helpConfig.title).toBeDefined();
      expect(helpConfig.body).toBeDefined();
    });

    it('should return keyboard shortcuts with G key', () => {
      const plugin = new Inc2LonPlots();
      const shortcuts = plugin.getKeyboardShortcuts();

      expect(shortcuts).toHaveLength(1);
      expect(shortcuts[0].key).toBe('G');
      expect(shortcuts[0].callback).toBeInstanceOf(Function);
    });

    it('should return correct drag options', () => {
      const plugin = new Inc2LonPlots();
      const dragOptions = plugin['getDragOptions_']();

      expect(dragOptions.isDraggable).toBe(true);
      expect(dragOptions.minWidth).toBe(650);
      expect(dragOptions.maxWidth).toBe(1200);
    });

    it('should build side menu HTML', () => {
      const plugin = new Inc2LonPlots();
      const html = plugin['buildSideMenuHtml_']();

      expect(html).toContain('inc2lon-plots-menu');
      expect(html).toContain('plot-analysis-chart-inc2lon');
      expect(html).toContain('inc2lon-stats');
    });
  });

  describe('onBottomIconClick', () => {
    it('should not create plot when menu is inactive', () => {
      const plugin = new Inc2LonPlots();

      websiteInit(plugin);
      plugin['isMenuButtonActive'] = false;

      expect(() => plugin.onBottomIconClick()).not.toThrow();
    });

    it('should call bottomIconCallback bridge', () => {
      const plugin = new Inc2LonPlots();

      websiteInit(plugin);

      const spy = vi.spyOn(plugin, 'onBottomIconClick');

      plugin.bottomIconCallback();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getPlotData', () => {
    it('should return country-grouped data', () => {
      const data = Inc2LonPlots.getPlotData();

      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(7);
      expect(data[0].name).toBe('France');
      expect(data[data.length - 1].name).toBe('Japan');
    });

    it('should have all expected country names', () => {
      const data = Inc2LonPlots.getPlotData();
      const names = data.map((d) => d.name);

      expect(names).toEqual(['France', 'USA', 'Other', 'Russia', 'China', 'India', 'Japan']);
    });
  });

  describe('onBottomIconDeselect', () => {
    it('should handle deselect when chart is null', () => {
      const plugin = new Inc2LonPlots();

      websiteInit(plugin);

      expect(plugin.chart).toBeNull();
      expect(() => plugin.onBottomIconDeselect()).not.toThrow();
      expect(plugin.chart).toBeNull();
    });
  });
});
