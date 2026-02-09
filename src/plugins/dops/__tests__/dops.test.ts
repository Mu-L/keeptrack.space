import { vi } from 'vitest';
/* eslint-disable dot-notation */
import { DopsPlugin } from '@app/plugins/dops/dops';
import { getEl } from '@app/engine/utils/get-el';
import { setupStandardEnvironment } from '@test/environment/standard-env';
import { standardPluginMenuButtonTests, standardPluginRmbTests, standardPluginSuite, websiteInit } from '@test/generic-tests';

describe('DopsPlugin_class', () => {
  beforeEach(() => {
    setupStandardEnvironment();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  standardPluginSuite(DopsPlugin, 'DopsPlugin');
  standardPluginMenuButtonTests(DopsPlugin, 'DopsPlugin');
  standardPluginRmbTests(DopsPlugin, 'DopsPlugin');

  describe('sideMenuElementHtml', () => {
    it('should contain expected form elements', () => {
      const plugin = new DopsPlugin();

      expect(plugin.sideMenuElementHtml).toContain('dops-menu');
      expect(plugin.sideMenuElementHtml).toContain('dops-form');
      expect(plugin.sideMenuElementHtml).toContain('dops-lat');
      expect(plugin.sideMenuElementHtml).toContain('dops-lon');
      expect(plugin.sideMenuElementHtml).toContain('dops-alt');
      expect(plugin.sideMenuElementHtml).toContain('dops-el');
      expect(plugin.sideMenuElementHtml).toContain('dops-submit');
    });
  });

  describe('form submission', () => {
    it('should set up form submit listener', () => {
      const plugin = new DopsPlugin();

      websiteInit(plugin);

      const form = getEl('dops-form');

      expect(form).toBeDefined();
    });

    it('should not throw on form submit event', () => {
      const plugin = new DopsPlugin();

      websiteInit(plugin);

      const form = getEl('dops-form');

      expect(() => form!.dispatchEvent(new Event('submit', { cancelable: true }))).not.toThrow();
    });
  });

  describe('getGpsSats', () => {
    it('should be a static method', () => {
      expect(DopsPlugin.getGpsSats).toBeDefined();
      expect(typeof DopsPlugin.getGpsSats).toBe('function');
    });
  });

  describe('bottomIconCallback', () => {
    it('should not throw when menu is inactive', () => {
      const plugin = new DopsPlugin();

      websiteInit(plugin);
      plugin['isMenuButtonActive'] = false;

      expect(() => plugin.bottomIconCallback()).not.toThrow();
    });
  });

  describe('rmbCallback', () => {
    it('should handle unknown targetId gracefully', () => {
      const plugin = new DopsPlugin();

      websiteInit(plugin);

      expect(() => plugin.rmbCallback('unknown-id')).not.toThrow();
    });
  });
});
