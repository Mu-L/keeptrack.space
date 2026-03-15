import { t7e } from '@app/locales/keys';
import { BaseObject, SpaceObjectType } from '@ootk/src/main';
import { errorManagerInstance } from '../../engine/utils/errorManager';
import { countryCodeList, getCountryMapList, launchSiteMap } from '../data/catalogs/countries';
import { manufacturerCodeMap } from '../data/catalogs/manufacturer-codes';
import { orgDataService } from '../data/catalogs/org-data-service';
import { ownerCodeMap } from '../data/catalogs/owner-codes';
import { rocketUrls } from '../data/catalogs/rocket-urls';
import { userUrls } from '../data/catalogs/user-urls';

export abstract class StringExtractor {
  /**
   * Use this to adjust which type of objects are loaded
   * TODO: Move this somewhere else!
   */
  static controlSiteTypeFilter(controlSite: BaseObject): boolean {
    switch (controlSite.type) {
      case SpaceObjectType.INTERGOVERNMENTAL_ORGANIZATION:
      case SpaceObjectType.LAUNCH_AGENCY:
      case SpaceObjectType.SUBORBITAL_PAYLOAD_OPERATOR:
      case SpaceObjectType.PAYLOAD_OWNER:
      case SpaceObjectType.METEOROLOGICAL_ROCKET_LAUNCH_AGENCY_OR_MANUFACTURER:
      case SpaceObjectType.LAUNCH_SITE:
      case SpaceObjectType.LAUNCH_POSITION:
        return true;
      /*
       * case 'Payload Manufacturer':
       * case 'Country':
       * case 'Astronomical Polity':
       * case 'Engine Manufacturer':
       * case 'Launch Vehicle Manufacturer':
       * case 'Parent Organization of Another Entry':
       * case 'Launch Cruise':
       * case 'Launch Zone':
       * case 'Suborbital Target Area':
       * case 'Organization Type Unknown':
       */
      default:
        return false;
    }
  }

  static extractCountry(countryCode: string): string {
    return getCountryMapList()[countryCode] ?? t7e('countries.TBD');
  }

  static extractLaunchSite(LS: string): { site: string; country: string, wikiUrl: string | null } {
    if (!LS || LS === '') {
      return { site: t7e('Common.unknown'), country: t7e('Common.unknown'), wikiUrl: null };
    }

    const launchSite = launchSiteMap[LS];

    if (launchSite) {
      return launchSite;
    }
    errorManagerInstance.debug(`Unknown launch site: ${LS}`);

    return { site: t7e('Common.unknown'), country: t7e('Common.unknown'), wikiUrl: null };

  }

  static extractLiftVehicle(LV?: string): string {
    if (!LV || LV === 'U' || LV === 'TBD' || LV === '') {
      return t7e('Common.unknown');
    }
    const rocketUrl = rocketUrls.filter((url) => url.rocket === LV);

    if (rocketUrl.length > 0) {
      return `<a class="iframe" href="${rocketUrl[0].url}">${LV}</a>`;
    }

    return `${LV}`;
  }

  static extractUserUrl(user: string, displayName?: string): string {
    if (!user || user === '') {
      return t7e('Common.unknown');
    }

    const label = displayName ?? user;
    const userUrl = userUrls.filter((url) => url.user === user);

    if (userUrl?.[0]?.url) {
      return `<a href="${userUrl[0].url}" target="_blank">${label}</a>`;
    }

    return label;
  }

  /**
   * Expands a GCAT owner/operator OrgCode to its full organization name.
   * Handles composite codes with "/" separator (e.g., "GSFC/NOAA").
   * Returns the raw code if no mapping is found (preserves info).
   */
  static extractOwner(ownerCode: string): string {
    if (!ownerCode || ownerCode === '') {
      return t7e('Common.unknown');
    }

    // Enhanced Catalog already has full names
    if (ownerCode.length > 12) {
      return ownerCode;
    }

    // Try R2 org data first, fall back to bundled static map
    const direct = orgDataService.resolveCode(ownerCode, ownerCodeMap);

    if (direct) {
      return direct;
    }

    // Split composite codes and look up each part
    if (ownerCode.includes('/')) {
      const parts = ownerCode.split('/');
      const expanded = parts.map((part) =>
        orgDataService.resolveCode(part.trim(), ownerCodeMap) ?? part.trim(),
      );

      return expanded.join(' / ');
    }

    return ownerCode;
  }

  /**
   * Expands a GCAT manufacturer OrgCode to its full company name.
   * Handles composite codes with "/" separator (e.g., "EADSB/THALR").
   * Returns the raw code if no mapping is found (preserves info).
   */
  static extractManufacturer(manufacturerCode: string): string {
    if (!manufacturerCode || manufacturerCode === '') {
      return t7e('Common.unknown');
    }

    // Enhanced Catalog already has full names
    if (manufacturerCode.length > 12) {
      return manufacturerCode;
    }

    // Try R2 org data first, fall back to bundled static map
    const direct = orgDataService.resolveCode(manufacturerCode, manufacturerCodeMap);

    if (direct) {
      return direct;
    }

    // Split composite codes and look up each part
    if (manufacturerCode.includes('/')) {
      const parts = manufacturerCode.split('/');
      const expanded = parts.map((part) =>
        orgDataService.resolveCode(part.trim(), manufacturerCodeMap) ?? part.trim(),
      );

      return expanded.join(' / ');
    }

    return manufacturerCode;
  }

  static getCountryCode(country?: string) {
    if (!country || country === '') {
      return '';
    }

    // Fix known typo in external data
    country = country === 'UnitedKingdom' ? 'United Kingdom' : country;
    const countryCode = countryCodeList[country];

    if (!countryCode) {
      errorManagerInstance.debug(`Unknown country: ${country}`);

      return '';
    }

    return countryCode;

  }
}
