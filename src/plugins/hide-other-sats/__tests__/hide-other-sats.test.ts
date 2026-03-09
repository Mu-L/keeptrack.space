import { vi } from 'vitest';
import { HideOtherSatellitesPlugin } from '@app/plugins/hide-other-sats/hide-other-sats';
import { setupStandardEnvironment } from '@test/environment/standard-env';
import { standardPluginSuite, websiteInit } from '@test/generic-tests';

describe('HideOtherSatellitesPlugin', () => {
  beforeEach(() => {
    setupStandardEnvironment();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  standardPluginSuite(HideOtherSatellitesPlugin, 'HideOtherSatellitesPlugin');

  describe('Configuration', () => {
    it('should have correct id', () => {
      const plugin = new HideOtherSatellitesPlugin();

      expect(plugin.id).toBe('HideOtherSatellitesPlugin');
    });

    it('should have no dependencies', () => {
      const plugin = new HideOtherSatellitesPlugin();

      expect(plugin.dependencies_).toHaveLength(0);
    });

    it('should return command palette commands', () => {
      const plugin = new HideOtherSatellitesPlugin();
      const commands = plugin.getCommandPaletteCommands();

      expect(commands).toHaveLength(1);
      expect(commands[0].id).toBe('HideOtherSatellitesPlugin.toggle');
    });
  });

  describe('toggle behavior', () => {
    it('should set transparent alpha to 0 when hiding', () => {
      const plugin = new HideOtherSatellitesPlugin();

      websiteInit(plugin);

      vi.spyOn(plugin, 'setBottomIconToSelected').mockImplementation(() => { /* Intentional no-op */ });
      plugin.hideOtherSats();

      expect(settingsManager.colors.transparent[3]).toBe(0);
    });

    it('should set transparent alpha to 0.1 when showing', () => {
      const plugin = new HideOtherSatellitesPlugin();

      websiteInit(plugin);
      settingsManager.colors.transparent = [1.0, 1.0, 1.0, 0];

      vi.spyOn(plugin, 'setBottomIconToUnselected').mockImplementation(() => { /* Intentional no-op */ });
      plugin.showOtherSats();

      expect(settingsManager.colors.transparent[3]).toBe(0.1);
    });
  });

  describe('bottomIconCallback', () => {
    it('should call onBottomIconClick', () => {
      const plugin = new HideOtherSatellitesPlugin();

      websiteInit(plugin);

      const spy = vi.spyOn(plugin, 'onBottomIconClick');

      plugin.bottomIconCallback();

      expect(spy).toHaveBeenCalled();
    });
  });
});
