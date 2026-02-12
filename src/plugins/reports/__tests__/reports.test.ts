import { vi } from 'vitest';
/* eslint-disable max-lines-per-function */
/* eslint-disable dot-notation */
import { MenuMode } from '@app/engine/core/interfaces';
import { ReportsPlugin } from '@app/plugins/reports/reports';
import { SelectSatManager } from '@app/plugins/select-sat-manager/select-sat-manager';
import { setupStandardEnvironment } from '@test/environment/standard-env';
import { standardPluginMenuButtonTests, standardPluginSuite, websiteInit } from '@test/generic-tests';

describe('ReportsPlugin_class', () => {
  beforeEach(() => {
    setupStandardEnvironment([SelectSatManager]);
  });

  standardPluginSuite(ReportsPlugin, 'ReportsPlugin');
  standardPluginMenuButtonTests(ReportsPlugin, 'ReportsPlugin');

  describe('Configuration methods', () => {
    it('should return correct bottom icon config', () => {
      const plugin = new ReportsPlugin();
      const config = plugin.getBottomIconConfig();

      expect(config.elementName).toBe('reports-bottom-icon');
      expect(config.image).toBeDefined();
      expect(config.menuMode).toContain(MenuMode.ANALYSIS);
      expect(config.menuMode).toContain(MenuMode.ALL);
      expect(config.isDisabledOnLoad).toBe(true);
    });

    it('should return correct side menu config', () => {
      const plugin = new ReportsPlugin();
      const config = plugin.getSideMenuConfig();

      expect(config.elementName).toBe('reports-menu');
      expect(config.title).toBeDefined();
      expect(config.dragOptions?.isDraggable).toBe(false);
      expect(config.dragOptions?.minWidth).toBe(320);
    });

    it('should return correct help config', () => {
      const plugin = new ReportsPlugin();
      const helpConfig = plugin.getHelpConfig();

      expect(helpConfig.title).toBeDefined();
      expect(helpConfig.body).toBeDefined();
    });

    it('should return command palette commands for all reports', () => {
      const plugin = new ReportsPlugin();
      const commands = plugin.getCommandPaletteCommands();

      // 1 open command + 6 built-in report commands
      expect(commands.length).toBeGreaterThanOrEqual(7);
      expect(commands[0].id).toBe('ReportsPlugin.open');
      expect(commands[0].category).toBe('Analysis');

      const reportIds = commands.slice(1).map((c) => c.id);

      expect(reportIds).toContain('ReportsPlugin.aer-report');
      expect(reportIds).toContain('ReportsPlugin.lla-report');
      expect(reportIds).toContain('ReportsPlugin.eci-report');
      expect(reportIds).toContain('ReportsPlugin.coes-report');
      expect(reportIds).toContain('ReportsPlugin.visibility-windows-report');
      expect(reportIds).toContain('ReportsPlugin.sun-eclipse-report');
    });

    it('should have isAvailable on report commands', () => {
      const plugin = new ReportsPlugin();
      const commands = plugin.getCommandPaletteCommands();
      const reportCommands = commands.filter((c) => c.id !== 'ReportsPlugin.open');

      for (const cmd of reportCommands) {
        expect(cmd.isAvailable).toBeInstanceOf(Function);
        // No satellite selected, so all should be unavailable
        expect(cmd.isAvailable!()).toBe(false);
      }
    });

    it('should build side menu HTML with buttons container', () => {
      const plugin = new ReportsPlugin();
      const sideMenuHtml = plugin['buildSideMenuHtml_']();

      expect(sideMenuHtml).toContain('reports-menu');
      expect(sideMenuHtml).toContain('reports-content');
      expect(sideMenuHtml).toContain('reports-buttons');
    });
  });

  describe('bottomIconCallback bridge', () => {
    it('should call onBottomIconClick', () => {
      const plugin = new ReportsPlugin();

      websiteInit(plugin);

      const spy = vi.spyOn(plugin, 'onBottomIconClick');

      plugin.bottomIconCallback();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Report registry', () => {
    it('should have built-in reports registered', () => {
      // Constructor registers built-in reports as a side effect
      new ReportsPlugin();
      const reports = ReportsPlugin.getRegisteredReports();

      expect(reports.length).toBeGreaterThanOrEqual(6);
    });

    it('should include all expected report IDs', () => {
      new ReportsPlugin();
      const reports = ReportsPlugin.getRegisteredReports();
      const ids = reports.map((r) => r.id);

      expect(ids).toContain('aer-report');
      expect(ids).toContain('lla-report');
      expect(ids).toContain('eci-report');
      expect(ids).toContain('coes-report');
      expect(ids).toContain('visibility-windows-report');
      expect(ids).toContain('sun-eclipse-report');
    });

    it('should register and unregister custom reports', () => {
      new ReportsPlugin();
      const countBefore = ReportsPlugin.getRegisteredReports().length;

      ReportsPlugin.registerReport({
        id: 'test-report',
        name: 'Test Report',
        generate: () => ({ filename: 'test', header: '', body: '' }),
      });

      expect(ReportsPlugin.getRegisteredReports().length).toBe(countBefore + 1);

      ReportsPlugin.unregisterReport('test-report');

      expect(ReportsPlugin.getRegisteredReports().length).toBe(countBefore);
    });

    it('should mark sensor-requiring reports correctly', () => {
      new ReportsPlugin();
      const reports = ReportsPlugin.getRegisteredReports();

      const aerReport = reports.find((r) => r.id === 'aer-report');
      const llaReport = reports.find((r) => r.id === 'lla-report');

      expect(aerReport?.requiresSensor).toBe(true);
      expect(llaReport?.requiresSensor).toBe(false);
    });
  });

  describe('isRequireSatelliteSelected', () => {
    it('should require satellite selection', () => {
      const plugin = new ReportsPlugin();

      expect(plugin.isRequireSatelliteSelected).toBe(true);
    });
  });
});
