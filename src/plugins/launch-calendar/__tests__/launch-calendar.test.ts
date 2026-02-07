import { LaunchCalendar } from '@app/plugins/launch-calendar/launch-calendar';
import { setupDefaultHtml } from '@test/environment/standard-env';
import { standardPluginSuite, websiteInit } from '@test/generic-tests';

describe('LaunchCalendar', () => {
  let plugin: LaunchCalendar;

  beforeEach(() => {
    setupDefaultHtml();
    plugin = new LaunchCalendar();
  });

  standardPluginSuite(LaunchCalendar, 'LaunchCalendar');

  describe('getBottomIconConfig', () => {
    it('should return correct config', () => {
      const config = plugin.getBottomIconConfig();

      expect(config.elementName).toBe('launch-calendar-bottom-icon');
      expect(config.image).toBeDefined();
      expect(config.menuMode).toBeDefined();
    });
  });

  describe('getHelpConfig', () => {
    it('should return help config', () => {
      const config = plugin.getHelpConfig();

      expect(config.title).toBeDefined();
      expect(config.body).toBeDefined();
    });
  });

  describe('getCommandPaletteCommands', () => {
    it('should return commands', () => {
      const commands = plugin.getCommandPaletteCommands();

      expect(commands.length).toBe(1);
      expect(commands[0].id).toBe('LaunchCalendar.open');
      expect(commands[0].callback).toBeInstanceOf(Function);
    });
  });

  describe('onBottomIconClick', () => {
    it('should not throw when menu is not active', () => {
      websiteInit(plugin);
      plugin.isMenuButtonActive = false;

      expect(() => plugin.onBottomIconClick()).not.toThrow();
    });
  });

  describe('bottomIconCallback bridge', () => {
    it('should call onBottomIconClick', () => {
      websiteInit(plugin);
      const spy = vi.spyOn(plugin, 'onBottomIconClick');

      plugin.bottomIconCallback();

      expect(spy).toHaveBeenCalled();
    });
  });
});
