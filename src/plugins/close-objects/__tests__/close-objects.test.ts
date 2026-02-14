import { hasBottomIcon, hasHelp, hasSecondaryMenu, hasSideMenu } from '@app/engine/plugins/core/plugin-capabilities';
import { CloseObjectsPlugin } from '@app/plugins/close-objects/close-objects';
import { setupStandardEnvironment } from '@test/environment/standard-env';
import { standardPluginMenuButtonTests, standardPluginSuite } from '@test/generic-tests';

describe('CloseObjectsPlugin_class', () => {
  beforeEach(() => {
    setupStandardEnvironment();
  });

  standardPluginSuite(CloseObjectsPlugin, 'CloseObjectsPlugin');
  standardPluginMenuButtonTests(CloseObjectsPlugin, 'CloseObjectsPlugin');
});

describe('CloseObjectsPlugin_capabilities', () => {
  let plugin: CloseObjectsPlugin;

  beforeEach(() => {
    setupStandardEnvironment();
    plugin = new CloseObjectsPlugin();
  });

  it('should have bottom icon capability', () => {
    expect(hasBottomIcon(plugin)).toBe(true);
    const config = plugin.getBottomIconConfig();

    expect(config.elementName).toBe('close-objects-icon');
  });

  it('should have side menu capability', () => {
    expect(hasSideMenu(plugin)).toBe(true);
    const config = plugin.getSideMenuConfig();

    expect(config.elementName).toBe('close-objects-menu');
  });

  it('should not have secondary menu capability (OSS version)', () => {
    expect(hasSecondaryMenu(plugin)).toBe(false);
  });

  it('should have help capability', () => {
    expect(hasHelp(plugin)).toBe(true);
  });

  it('should include title in side menu HTML when no secondary menu', () => {
    const config = plugin.getSideMenuConfig();

    expect(config.html).toContain('close-objects-menu');
    expect(config.html).toContain('side-menu-parent');
    expect(config.html).toContain('co-find-btn');
  });

  it('should not include description paragraph in side menu', () => {
    const config = plugin.getSideMenuConfig();

    expect(config.html).not.toContain('two-phase spatial algorithm');
    expect(config.html).not.toContain('50km');
  });
});
