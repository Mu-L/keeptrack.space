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

import { SpaceObjectType } from '@ootk/src/types/types';

/**
 * MIL-STD-2525 inspired affiliation categories.
 * Values are intentionally 0-3 to pack efficiently into a single byte for GPU transmission.
 */
export enum Affiliation {
  /** Friendly - Rendered as rounded rectangle */
  FRIEND = 0,
  /** Hostile - Rendered as diamond */
  HOSTILE = 1,
  /** Neutral - Rendered as square */
  NEUTRAL = 2,
  /** Unknown - Rendered as quatrefoil (4 overlapping circles) */
  UNKNOWN = 3,
}

/**
 * Rule types for determining satellite affiliation
 */
export type AffiliationRuleType = 'country' | 'name' | 'group' | 'type';

/**
 * A single rule for determining satellite affiliation.
 * Rules are evaluated in priority order (highest first).
 */
export interface AffiliationRule {
  /** Unique identifier for this rule */
  id: string;
  /** Type of matching to perform */
  type: AffiliationRuleType;
  /** Pattern(s) to match against - country codes, regex for name, group IDs, or SpaceObjectType names */
  pattern: string | string[];
  /** Affiliation to assign when rule matches */
  affiliation: Affiliation;
  /** Priority for rule evaluation (higher = evaluated first) */
  priority: number;
  /** Optional human-readable description */
  description?: string;
  /** Whether this rule is enabled */
  enabled?: boolean;
}

/**
 * Complete symbology configuration including rules and settings.
 */
export interface SymbologyConfiguration {
  /** Whether symbology mode is enabled (shapes instead of circles) */
  enabled: boolean;
  /** Ordered list of affiliation rules */
  rules: AffiliationRule[];
  /** Default affiliation for satellites that don't match any rule */
  defaultAffiliation: Affiliation;
}

/**
 * Manual override for a specific satellite's affiliation.
 * Takes precedence over rules.
 */
export interface SatelliteAffiliationOverride {
  /** Satellite ID (catalog index) */
  satId: number;
  /** Manually assigned affiliation */
  affiliation: Affiliation;
  /** Source of the override */
  source: 'rule' | 'manual';
  /** Optional note explaining the override */
  note?: string;
}

/**
 * Default empty configuration
 */
export const DEFAULT_SYMBOLOGY_CONFIG: SymbologyConfiguration = {
  enabled: false,
  rules: [],
  defaultAffiliation: Affiliation.UNKNOWN,
};

/**
 * Object type icons for sprite sheet atlas rendering.
 * Values 0-15 map to columns in the sprite atlas (16 icons per affiliation row).
 */
export enum ObjectTypeIcon {
  /** Unknown object - Question mark */
  UNKNOWN = 0,
  /** Active satellite with solar panels */
  PAYLOAD = 1,
  /** Upper stage / cylinder */
  ROCKET_BODY = 2,
  /** Space debris fragments */
  DEBRIS = 3,
  /** Special objects - Star/asterisk */
  SPECIAL = 4,
  /** Ballistic missile silhouette */
  MISSILE = 5,
  /** Celestial star - 5-point star */
  STAR = 6,
  /** Notional/simulated - Dashed outline */
  NOTIONAL = 7,
  /** Radar ground stations - Radar dish */
  RADAR_GROUND = 8,
  /** Optical ground sensors - Telescope/lens */
  OPTICAL_GROUND = 9,
  /** Human observer - Binoculars */
  OBSERVER = 10,
  /** Launch facilities - Launchpad */
  LAUNCH_FACILITY = 11,
  /** Ground sensor station - Tower */
  GROUND_SENSOR = 12,
  /** Suborbital payload - Capsule */
  SUBORBITAL = 13,
  /** Organizations - Building/globe */
  ORGANIZATION = 14,
  /** Reserved for future use */
  RESERVED = 15,
}

/**
 * Maps SpaceObjectType enum values to ObjectTypeIcon indices for sprite atlas lookup.
 * Multiple SpaceObjectTypes may map to the same icon (consolidated ground types).
 */
export const SPACE_OBJECT_TYPE_TO_ICON: Partial<Record<SpaceObjectType, ObjectTypeIcon>> = {
  [SpaceObjectType.UNKNOWN]: ObjectTypeIcon.UNKNOWN,
  [SpaceObjectType.PAYLOAD]: ObjectTypeIcon.PAYLOAD,
  [SpaceObjectType.ROCKET_BODY]: ObjectTypeIcon.ROCKET_BODY,
  [SpaceObjectType.DEBRIS]: ObjectTypeIcon.DEBRIS,
  [SpaceObjectType.SPECIAL]: ObjectTypeIcon.SPECIAL,
  [SpaceObjectType.BALLISTIC_MISSILE]: ObjectTypeIcon.MISSILE,
  [SpaceObjectType.STAR]: ObjectTypeIcon.STAR,
  [SpaceObjectType.NOTIONAL]: ObjectTypeIcon.NOTIONAL,
  [SpaceObjectType.FRAGMENT]: ObjectTypeIcon.DEBRIS,

  // Radar ground stations (consolidated)
  [SpaceObjectType.PHASED_ARRAY_RADAR]: ObjectTypeIcon.RADAR_GROUND,
  [SpaceObjectType.BISTATIC_RADIO_TELESCOPE]: ObjectTypeIcon.RADAR_GROUND,
  [SpaceObjectType.SHORT_TERM_FENCE]: ObjectTypeIcon.RADAR_GROUND,

  // Optical ground sensors (consolidated)
  [SpaceObjectType.OPTICAL]: ObjectTypeIcon.OPTICAL_GROUND,
  [SpaceObjectType.MECHANICAL]: ObjectTypeIcon.OPTICAL_GROUND,

  // Observer
  [SpaceObjectType.OBSERVER]: ObjectTypeIcon.OBSERVER,

  // Launch facilities (consolidated)
  [SpaceObjectType.LAUNCH_AGENCY]: ObjectTypeIcon.LAUNCH_FACILITY,
  [SpaceObjectType.LAUNCH_SITE]: ObjectTypeIcon.LAUNCH_FACILITY,
  [SpaceObjectType.LAUNCH_POSITION]: ObjectTypeIcon.LAUNCH_FACILITY,
  [SpaceObjectType.LAUNCH_FACILITY]: ObjectTypeIcon.LAUNCH_FACILITY,
  [SpaceObjectType.CONTROL_FACILITY]: ObjectTypeIcon.LAUNCH_FACILITY,

  // Ground sensor station
  [SpaceObjectType.GROUND_SENSOR_STATION]: ObjectTypeIcon.GROUND_SENSOR,
  [SpaceObjectType.DYNAMIC_GROUND_OBJECT]: ObjectTypeIcon.GROUND_SENSOR,

  // Suborbital
  [SpaceObjectType.SUBORBITAL_PAYLOAD_OPERATOR]: ObjectTypeIcon.SUBORBITAL,

  // Organizations (consolidated)
  [SpaceObjectType.INTERGOVERNMENTAL_ORGANIZATION]: ObjectTypeIcon.ORGANIZATION,
  [SpaceObjectType.PAYLOAD_OWNER]: ObjectTypeIcon.ORGANIZATION,
  [SpaceObjectType.PAYLOAD_MANUFACTURER]: ObjectTypeIcon.ORGANIZATION,
  [SpaceObjectType.METEOROLOGICAL_ROCKET_LAUNCH_AGENCY_OR_MANUFACTURER]: ObjectTypeIcon.ORGANIZATION,
  [SpaceObjectType.LAUNCH_VEHICLE_MANUFACTURER]: ObjectTypeIcon.ORGANIZATION,
  [SpaceObjectType.ENGINE_MANUFACTURER]: ObjectTypeIcon.ORGANIZATION,
  [SpaceObjectType.COUNTRY]: ObjectTypeIcon.ORGANIZATION,

  // Celestial bodies use STAR icon
  [SpaceObjectType.TERRESTRIAL_PLANET]: ObjectTypeIcon.STAR,
  [SpaceObjectType.GAS_GIANT]: ObjectTypeIcon.STAR,
  [SpaceObjectType.ICE_GIANT]: ObjectTypeIcon.STAR,
  [SpaceObjectType.DWARF_PLANET]: ObjectTypeIcon.STAR,
  [SpaceObjectType.MOON]: ObjectTypeIcon.STAR,

  // Special cases
  [SpaceObjectType.EPHEMERIS_SATELLITE]: ObjectTypeIcon.PAYLOAD,
};

/**
 * Gets the icon index for a given SpaceObjectType.
 * Returns UNKNOWN (0) for unmapped types.
 */
export function getObjectTypeIcon(type: SpaceObjectType): ObjectTypeIcon {
  return SPACE_OBJECT_TYPE_TO_ICON[type] ?? ObjectTypeIcon.UNKNOWN;
}
