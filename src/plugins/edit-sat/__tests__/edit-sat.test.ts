import { MenuMode } from '@app/engine/core/interfaces';
import {
  hasBottomIcon,
  hasHelp,
  hasSideMenu,
} from '@app/engine/plugins/core/plugin-capabilities';
import { EditSat } from '@app/plugins/edit-sat/edit-sat';
import { SelectSatManager } from '@app/plugins/select-sat-manager/select-sat-manager';
import { setupStandardEnvironment } from '@test/environment/standard-env';
import { standardPluginMenuButtonTests, standardPluginSuite, websiteInit } from '@test/generic-tests';
import { vi } from 'vitest';

describe('EditSat_class', () => {
  beforeEach(() => {
    setupStandardEnvironment([SelectSatManager]);
  });

  standardPluginSuite(EditSat, 'EditSat');
  standardPluginMenuButtonTests(EditSat, 'EditSat');
});

describe('EditSat_capabilities', () => {
  let plugin: EditSat;

  beforeEach(() => {
    setupStandardEnvironment([SelectSatManager]);
    plugin = new EditSat();
  });

  it('should have bottom icon capability', () => {
    expect(hasBottomIcon(plugin)).toBe(true);
    const config = plugin.getBottomIconConfig();

    expect(config.elementName).toBe('edit-satellite-bottom-icon');
    expect(config.menuMode).toContain(MenuMode.ADVANCED);
    expect(config.menuMode).toContain(MenuMode.ALL);
    expect(config.isDisabledOnLoad).toBe(true);
  });

  it('should have side menu capability', () => {
    expect(hasSideMenu(plugin)).toBe(true);
    const config = plugin.getSideMenuConfig();

    expect(config.elementName).toBe('editSat-menu');
    expect(config.dragOptions?.isDraggable).toBe(true);
    expect(config.dragOptions?.minWidth).toBe(320);
    expect(config.dragOptions?.maxWidth).toBe(500);
  });

  it('should have help capability', () => {
    expect(hasHelp(plugin)).toBe(true);
    const helpConfig = plugin.getHelpConfig();

    expect(helpConfig.title).toBeDefined();
    expect(helpConfig.body).toBeDefined();
  });

  it('should contain form fields in side menu HTML', () => {
    const config = plugin.getSideMenuConfig();

    expect(config.html).toContain('es-scc');
    expect(config.html).toContain('es-country');
    expect(config.html).toContain('es-inc');
    expect(config.html).toContain('es-rasc');
    expect(config.html).toContain('es-ecen');
    expect(config.html).toContain('es-argPe');
    expect(config.html).toContain('es-meana');
    expect(config.html).toContain('es-meanmo');
    expect(config.html).toContain('es-per');
    expect(config.html).toContain('editSat-menu-form');
  });

  it('should require satellite selected', () => {
    expect(plugin.isRequireSatelliteSelected).toBe(true);
    expect(plugin.isIconDisabled).toBe(true);
    expect(plugin.isIconDisabledOnLoad).toBe(true);
  });

  it('should have context menu properties', () => {
    expect(plugin.isRmbOnSat).toBe(true);
    expect(plugin.rmbMenuOrder).toBe(2);
    expect(plugin.rmbL1ElementName).toBe('edit-rmb');
    expect(plugin.rmbL2ElementName).toBe('edit-rmb-menu');
  });
});

describe('EditSat_bridge', () => {
  it('should call onBottomIconClick via bottomIconCallback bridge', () => {
    setupStandardEnvironment([SelectSatManager]);
    const plugin = new EditSat();

    websiteInit(plugin);

    const spy = vi.spyOn(plugin, 'onBottomIconClick');

    plugin.bottomIconCallback();

    expect(spy).toHaveBeenCalled();
  });
});
