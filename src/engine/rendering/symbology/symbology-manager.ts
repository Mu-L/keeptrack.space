/**
 * /////////////////////////////////////////////////////////////////////////////
 *
 * @Copyright (C) 2025 Kruczek Labs LLC
 *
 * KeepTrack is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * KeepTrack is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with
 * KeepTrack. If not, see <http://www.gnu.org/licenses/>.
 *
 * /////////////////////////////////////////////////////////////////////////////
 */

import { ServiceLocator } from '@app/engine/core/service-locator';
import { EventBus } from '@app/engine/events/event-bus';
import { EventBusEvent } from '@app/engine/events/event-bus-events';
import { PersistenceManager, StorageKey } from '@app/engine/utils/persistence-manager';
import { Satellite } from '@ootk/src/main';
import { BaseObject } from '../../ootk/src/objects';
import {
  Affiliation,
  AffiliationRule,
  DEFAULT_SYMBOLOGY_CONFIG,
  getObjectTypeIcon,
  SatelliteAffiliationOverride,
  SymbologyConfiguration,
} from './symbology-types';

/**
 * Manages MIL-STD-2525 inspired symbology for satellite visualization.
 * Handles affiliation rule evaluation, GPU buffer management, and configuration persistence.
 *
 * This is the base manager with minimal functionality.
 * Full rule evaluation and default rules are provided by the SymbologyPlugin (pro feature).
 */
export class SymbologyManager {
  private configuration_: SymbologyConfiguration;
  private readonly affiliationCache_: Map<number, Affiliation> = new Map();
  private manualOverrides_: Map<number, SatelliteAffiliationOverride> = new Map();
  private affiliationBuffer_: Uint8Array = new Uint8Array(0);
  private objectTypeBuffer_: Uint8Array = new Uint8Array(0);
  private stalenessBuffer_: Uint8Array = new Uint8Array(0);
  private objectTypeBufferInitialized_ = false;
  private lastStalenessUpdate_ = 0;
  private gl_: WebGL2RenderingContext | null = null;
  private glBuffer_: WebGLBuffer | null = null;
  private bufferInitialized_ = false;
  private isReady_ = false;
  private sortedRules_: AffiliationRule[] = [];

  constructor() {
    // Load configuration from persistence or use empty defaults
    this.configuration_ = this.loadConfiguration_();
    this.sortRules_();

    // Initialize when catalog is ready
    EventBus.getInstance().on(EventBusEvent.onCruncherReady, () => {
      this.initializeBuffer_();
      this.isReady_ = true;
    });
  }

  /**
   * Resets buffer state so that the next onCruncherReady event
   * re-initializes everything for a new catalog.
   */
  resetForCatalogSwap(): void {
    this.affiliationCache_.clear();
    this.affiliationBuffer_ = new Uint8Array(0);
    this.objectTypeBuffer_ = new Uint8Array(0);
    this.stalenessBuffer_ = new Uint8Array(0);
    this.objectTypeBufferInitialized_ = false;
    this.lastStalenessUpdate_ = 0;
    this.bufferInitialized_ = false;
    this.isReady_ = false;
  }

  /**
   * Initialize with WebGL context
   */
  init(gl: WebGL2RenderingContext): void {
    this.gl_ = gl;
    this.glBuffer_ = gl.createBuffer();
  }

  /**
   * Check if symbology mode is enabled
   */
  get isEnabled(): boolean {
    return this.configuration_.enabled;
  }

  /**
   * Set symbology mode enabled/disabled
   */
  set isEnabled(value: boolean) {
    this.configuration_.enabled = value;
    this.saveConfiguration_();
  }

  /**
   * Get the current configuration
   */
  get configuration(): SymbologyConfiguration {
    return this.configuration_;
  }

  /**
   * Get the WebGL buffer containing affiliation data for GPU rendering
   */
  get glBuffer(): WebGLBuffer | null {
    return this.glBuffer_;
  }

  /**
   * Check if the manager is ready
   */
  get isReady(): boolean {
    return this.isReady_;
  }

  /**
   * Evaluate the affiliation for a satellite based on configured rules.
   * Rules are evaluated in priority order (highest first).
   */
  evaluateAffiliation(obj: BaseObject): Affiliation {
    if (!obj.isSatellite()) {
      return this.configuration_.defaultAffiliation;
    }

    const sat = obj as Satellite;
    const satId = sat.id;

    // Check cache first
    if (this.affiliationCache_.has(satId)) {
      return this.affiliationCache_.get(satId)!;
    }

    // Check manual overrides
    if (this.manualOverrides_.has(satId)) {
      const override = this.manualOverrides_.get(satId)!;

      this.affiliationCache_.set(satId, override.affiliation);

      return override.affiliation;
    }

    // Evaluate rules in priority order
    for (const rule of this.sortedRules_) {
      if (rule.enabled === false) {
        continue;
      }

      if (this.matchesRule_(sat, rule)) {
        this.affiliationCache_.set(satId, rule.affiliation);

        return rule.affiliation;
      }
    }

    // Default affiliation
    const defaultAff = this.configuration_.defaultAffiliation;

    this.affiliationCache_.set(satId, defaultAff);

    return defaultAff;
  }

  /**
   * Get the affiliation buffer data (Uint8Array)
   */
  getAffiliationData(): Uint8Array {
    return this.affiliationBuffer_;
  }

  /**
   * Get the object type icon buffer data (Uint8Array).
   * Maps SpaceObjectType to ObjectTypeIcon indices for sprite atlas lookup.
   */
  getObjectTypeData(): Uint8Array {
    return this.objectTypeBuffer_;
  }

  /**
   * Get the staleness buffer data (Uint8Array).
   * Values: 0 = fresh (epoch <= 16h), 1 = stale (epoch > 16h).
   * Automatically recalculates if more than 60 seconds have elapsed.
   */
  getStalenessData(): Uint8Array {
    const now = Date.now();

    if (now - this.lastStalenessUpdate_ > 60_000) {
      this.updateStalenessBuffer();
    }

    return this.stalenessBuffer_;
  }

  /**
   * Recalculate staleness for all satellites based on TLE epoch age.
   * Objects with epoch > 16 hours old are marked as stale.
   */
  updateStalenessBuffer(): void {
    const catalogManager = ServiceLocator.getCatalogManager();

    if (!catalogManager || this.stalenessBuffer_.length === 0) {
      return;
    }

    const numObjects = catalogManager.numObjects;
    const now = ServiceLocator.getTimeManager()?.simulationTimeObj ?? new Date();
    const staleThresholdHours = 16;

    for (let i = 0; i < numObjects; i++) {
      const obj = catalogManager.getObject(i);

      if (obj instanceof Satellite && typeof obj.ageOfElset === 'function') {
        const ageHours = Math.abs(obj.ageOfElset(now, 'hours'));

        this.stalenessBuffer_[i] = ageHours > staleThresholdHours ? 1 : 0;
      } else {
        this.stalenessBuffer_[i] = 0;
      }
    }

    this.lastStalenessUpdate_ = Date.now();
  }

  /**
   * Check if object type buffer has been initialized
   */
  get isObjectTypeBufferInitialized(): boolean {
    return this.objectTypeBufferInitialized_;
  }

  /**
   * Update the object type buffer for all objects.
   * This only needs to be called once at catalog load since object types don't change.
   */
  updateObjectTypeBuffer(): void {
    const catalogManager = ServiceLocator.getCatalogManager();

    if (!catalogManager || this.objectTypeBuffer_.length === 0) {
      return;
    }

    const numObjects = catalogManager.numObjects;

    for (let i = 0; i < numObjects; i++) {
      const obj = catalogManager.getObject(i);

      if (obj) {
        this.objectTypeBuffer_[i] = getObjectTypeIcon(obj.type);
      } else {
        this.objectTypeBuffer_[i] = 0; // UNKNOWN
      }
    }

    this.objectTypeBufferInitialized_ = true;
  }

  /**
   * Update the affiliation buffer for all satellites
   */
  updateAffiliationBuffer(): void {
    const catalogManager = ServiceLocator.getCatalogManager();

    if (!catalogManager || this.affiliationBuffer_.length === 0) {
      return;
    }

    const numObjects = catalogManager.numObjects;

    for (let i = 0; i < numObjects; i++) {
      const obj = catalogManager.getObject(i);

      if (obj) {
        this.affiliationBuffer_[i] = this.evaluateAffiliation(obj);
      } else {
        this.affiliationBuffer_[i] = this.configuration_.defaultAffiliation;
      }
    }
  }

  /**
   * Send affiliation buffer to GPU
   */
  sendBufferToGpu(): void {
    if (!this.gl_ || !this.glBuffer_) {
      return;
    }

    this.gl_.bindBuffer(this.gl_.ARRAY_BUFFER, this.glBuffer_);

    if (!this.bufferInitialized_) {
      this.gl_.bufferData(this.gl_.ARRAY_BUFFER, this.affiliationBuffer_, this.gl_.DYNAMIC_DRAW);
      this.bufferInitialized_ = true;
    } else {
      this.gl_.bufferSubData(this.gl_.ARRAY_BUFFER, 0, this.affiliationBuffer_);
    }
  }

  /**
   * Set the complete configuration
   */
  setConfiguration(config: SymbologyConfiguration): void {
    this.configuration_ = config;
    this.sortRules_();
    this.clearCache_();
    this.saveConfiguration_();
    this.updateAffiliationBuffer();
  }

  /**
   * Add a new affiliation rule
   */
  addRule(rule: AffiliationRule): void {
    this.configuration_.rules.push(rule);
    this.sortRules_();
    this.clearCache_();
    this.saveConfiguration_();
    this.updateAffiliationBuffer();
  }

  /**
   * Remove a rule by ID
   */
  removeRule(ruleId: string): void {
    this.configuration_.rules = this.configuration_.rules.filter((r) => r.id !== ruleId);
    this.sortRules_();
    this.clearCache_();
    this.saveConfiguration_();
    this.updateAffiliationBuffer();
  }

  /**
   * Update an existing rule
   */
  updateRule(ruleId: string, updates: Partial<AffiliationRule>): void {
    const ruleIndex = this.configuration_.rules.findIndex((r) => r.id === ruleId);

    if (ruleIndex >= 0) {
      this.configuration_.rules[ruleIndex] = { ...this.configuration_.rules[ruleIndex], ...updates };
      this.sortRules_();
      this.clearCache_();
      this.saveConfiguration_();
      this.updateAffiliationBuffer();
    }
  }

  /**
   * Set manual override for a specific satellite
   */
  setManualOverride(satId: number, affiliation: Affiliation, note?: string): void {
    this.manualOverrides_.set(satId, {
      satId,
      affiliation,
      source: 'manual',
      note,
    });
    this.affiliationCache_.delete(satId);
    this.updateAffiliationBuffer();
  }

  /**
   * Remove manual override for a satellite
   */
  removeManualOverride(satId: number): void {
    this.manualOverrides_.delete(satId);
    this.affiliationCache_.delete(satId);
    this.updateAffiliationBuffer();
  }

  /**
   * Batch set affiliation for all satellites matching a country
   */
  setAffiliationForCountry(country: string, affiliation: Affiliation): void {
    const ruleId = `batch-country-${country.toLowerCase().replace(/\s+/gu, '-')}`;

    // Remove existing rule for this country if any
    this.configuration_.rules = this.configuration_.rules.filter((r) => r.id !== ruleId);

    // Add new rule with high priority
    this.addRule({
      id: ruleId,
      type: 'country',
      pattern: country,
      affiliation,
      priority: 150, // High priority to override defaults
      description: `Batch assignment for ${country}`,
    });
  }

  /**
   * Export configuration as JSON string
   */
  exportConfiguration(): string {
    return JSON.stringify({
      configuration: this.configuration_,
      overrides: Array.from(this.manualOverrides_.entries()),
    }, null, 2);
  }

  /**
   * Import configuration from JSON string
   */
  importConfiguration(json: string): void {
    try {
      const data = JSON.parse(json);

      if (data.configuration) {
        this.setConfiguration(data.configuration);
      }
      if (data.overrides && Array.isArray(data.overrides)) {
        this.manualOverrides_ = new Map(data.overrides);
        this.clearCache_();
        this.updateAffiliationBuffer();
      }
    } catch (e) {
      console.error('Failed to import symbology configuration:', e);
      throw new Error('Invalid symbology configuration JSON');
    }
  }

  /**
   * Reset to default configuration (empty rules - pro plugin will inject defaults)
   */
  resetToDefaults(): void {
    this.configuration_ = { ...DEFAULT_SYMBOLOGY_CONFIG };
    this.manualOverrides_.clear();
    this.sortRules_();
    this.clearCache_();
    this.saveConfiguration_();
    this.updateAffiliationBuffer();
  }

  /**
   * Load default rules (called by pro plugin).
   *
   * If no rules exist, inject the provided defaults.
   * If the cached defaultRulesVersion is older than the provided version,
   * refresh default-origin rules while preserving user-added rules.
   */
  loadDefaultRules(rules: AffiliationRule[], version = 0): void {
    const cachedVersion = this.configuration_.defaultRulesVersion;

    if (this.configuration_.rules.length === 0) {
      // First time — inject all defaults
      this.configuration_.rules = rules;
      this.configuration_.defaultRulesVersion = version;
      this.applyDefaultRulesUpdate_();
    } else if (typeof cachedVersion === 'undefined') {
      // Migration: existing cache from before version tracking — stamp version, keep rules
      this.configuration_.defaultRulesVersion = version;
      this.saveConfiguration_();
    } else if (version > cachedVersion) {
      // Defaults have changed — refresh default rules, keep user-added ones
      const defaultRuleIds = new Set(rules.map((r) => r.id));
      const userRules = this.configuration_.rules.filter((r) => !defaultRuleIds.has(r.id));

      this.configuration_.rules = [...rules, ...userRules];
      this.configuration_.defaultRulesVersion = version;
      this.applyDefaultRulesUpdate_();
    }
  }

  private applyDefaultRulesUpdate_(): void {
    this.sortRules_();
    this.clearCache_();
    this.saveConfiguration_();
    if (this.isReady_) {
      this.updateAffiliationBuffer();
    }
  }

  /**
   * Get all current rules
   */
  getRules(): AffiliationRule[] {
    return [...this.configuration_.rules];
  }

  /**
   * Check if a satellite matches a rule
   */
  private matchesRule_(sat: Satellite, rule: AffiliationRule): boolean {
    const patterns = Array.isArray(rule.pattern) ? rule.pattern : [rule.pattern];

    switch (rule.type) {
      case 'country':
        return patterns.some((p) => {
          if (p === '*') {
            return true;
          }

          return sat.country?.toLowerCase() === p.toLowerCase();
        });

      case 'name':
        return patterns.some((p) => {
          const regex = new RegExp(p, 'iu');

          return regex.test(sat.name || '');
        });

      case 'group': {
        // Check if satellite is in a named group
        const groupsManager = ServiceLocator.getGroupsManager();

        if (groupsManager?.groupList) {
          return patterns.some((groupName) => {
            const group = groupsManager.groupList[groupName];

            return group?.hasObject(sat.id) ?? false;
          });
        }

        return false;
      }

      case 'type':
        return patterns.some((p) => {
          const typeNum = parseInt(p, 10);

          if (!isNaN(typeNum)) {
            return sat.type === typeNum;
          }
          // Match type name

          return sat.type.toString() === p;
        });

      default:
        return false;
    }
  }

  /**
   * Sort rules by priority (descending)
   */
  private sortRules_(): void {
    this.sortedRules_ = [...this.configuration_.rules].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Clear the affiliation cache
   */
  private clearCache_(): void {
    this.affiliationCache_.clear();
  }

  /**
   * Initialize the affiliation and object type buffers
   */
  private initializeBuffer_(): void {
    const catalogManager = ServiceLocator.getCatalogManager();

    if (!catalogManager) {
      return;
    }

    const numObjects = catalogManager.numObjects;

    this.affiliationBuffer_ = new Uint8Array(numObjects);
    this.objectTypeBuffer_ = new Uint8Array(numObjects);
    this.stalenessBuffer_ = new Uint8Array(numObjects);

    // Clear any stale cache entries before full re-evaluation
    this.clearCache_();
    this.updateAffiliationBuffer();
    this.updateObjectTypeBuffer();
    this.updateStalenessBuffer();
  }

  /**
   * Load configuration from persistence
   */
  private loadConfiguration_(): SymbologyConfiguration {
    try {
      const stored = PersistenceManager.getInstance().getItem(StorageKey.SYMBOLOGY_CONFIG);

      if (stored) {
        const config = JSON.parse(stored) as SymbologyConfiguration;

        // Validate and merge with defaults
        return {
          enabled: config.enabled ?? false,
          rules: config.rules ?? [],
          defaultAffiliation: config.defaultAffiliation ?? Affiliation.UNKNOWN,
          defaultRulesVersion: config.defaultRulesVersion,
        };
      }
    } catch (e) {
      console.warn('Failed to load symbology configuration, using defaults:', e);
    }

    // Return default empty configuration
    return { ...DEFAULT_SYMBOLOGY_CONFIG };
  }

  /**
   * Save configuration to persistence
   */
  private saveConfiguration_(): void {
    try {
      PersistenceManager.getInstance().saveItem(
        StorageKey.SYMBOLOGY_CONFIG,
        JSON.stringify(this.configuration_),
      );
    } catch (e) {
      console.error('Failed to save symbology configuration:', e);
    }
  }
}
