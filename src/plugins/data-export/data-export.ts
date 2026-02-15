/**
 * /////////////////////////////////////////////////////////////////////////////
 *
 * data-export.ts provides catalog and satellite data export functionality.
 *
 * https://keeptrack.space
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

import { SatMath } from '@app/app/analysis/sat-math';
import { CatalogExporter } from '@app/app/data/catalog-exporter';
import { MenuMode, ToastMsgType } from '@app/engine/core/interfaces';
import { PluginRegistry } from '@app/engine/core/plugin-registry';
import { ServiceLocator } from '@app/engine/core/service-locator';
import { EventBus } from '@app/engine/events/event-bus';
import { EventBusEvent } from '@app/engine/events/event-bus-events';
import { KeepTrackPlugin } from '@app/engine/plugins/base-plugin';
import {
  IBottomIconConfig,
  IDragOptions,
  IHelpConfig,
  ISideMenuConfig,
} from '@app/engine/plugins/core/plugin-capabilities';
import { html } from '@app/engine/utils/development/formatter';
import { getEl } from '@app/engine/utils/get-el';
import { showLoading } from '@app/engine/utils/showLoading';
import { t7e } from '@app/locales/keys';
import { BaseObject, Satellite } from '@ootk/src/main';
import { saveAs } from 'file-saver';
import folderCodePng from '@public/img/icons/folder-code.png';
import { SelectSatManager } from '../select-sat-manager/select-sat-manager';

export class DataExportPlugin extends KeepTrackPlugin {
  readonly id = 'DataExportPlugin';
  dependencies_ = [];

  // =========================================================================
  // Composition-based configuration methods
  // =========================================================================

  getBottomIconConfig(): IBottomIconConfig {
    return {
      elementName: 'data-export-icon',
      label: t7e('plugins.DataExportPlugin.bottomIconLabel' as Parameters<typeof t7e>[0]),
      image: folderCodePng,
      menuMode: [MenuMode.ANALYSIS, MenuMode.ALL],
    };
  }

  onBottomIconClick(): void {
    // No special behavior on click — menu toggles automatically
  }

  bottomIconCallback = (): void => {
    this.onBottomIconClick();
  };

  getSideMenuConfig(): ISideMenuConfig {
    return {
      elementName: 'data-export-menu',
      title: t7e('plugins.DataExportPlugin.title' as Parameters<typeof t7e>[0]),
      html: this.buildSideMenuHtml_(),
      dragOptions: this.getDragOptions_(),
    };
  }

  private getDragOptions_(): IDragOptions {
    return {
      isDraggable: true,
      minWidth: 350,
      maxWidth: 450,
    };
  }

  getHelpConfig(): IHelpConfig {
    return {
      title: t7e('plugins.DataExportPlugin.title' as Parameters<typeof t7e>[0]),
      body: t7e('plugins.DataExportPlugin.helpBody' as Parameters<typeof t7e>[0]),
    };
  }

  // =========================================================================
  // Side menu HTML
  // =========================================================================

  protected buildSideMenuHtml_(): string {
    return html`
      <div id="data-export-menu" class="side-menu-parent start-hidden text-select">
        <div class="side-menu">
          <h5 class="center-align">Catalog Exports</h5>
          <div class="divider"></div>
          <div class="row"></div>
          <div class="row">
            <center>
              <button id="de-export-tle-2a" class="btn btn-ui waves-effect waves-light">
                Export Official TLEs &#9658;
              </button>
            </center>
          </div>
          <div class="row">
            <center>
              <button id="de-export-tle-3a" class="btn btn-ui waves-effect waves-light">
                Export Official 3LEs &#9658;
              </button>
            </center>
          </div>
          <div class="row">
            <center>
              <button id="de-export-tle-2b" class="btn btn-ui waves-effect waves-light">
                Export KeepTrack TLEs &#9658;
              </button>
            </center>
          </div>
          <div class="row">
            <center>
              <button id="de-export-tle-3b" class="btn btn-ui waves-effect waves-light">
                Export KeepTrack 3LEs &#9658;
              </button>
            </center>
          </div>
          <div class="row">
            <center>
              <button id="de-export-csv" class="btn btn-ui waves-effect waves-light">
                Export Catalog CSV &#9658;
              </button>
            </center>
          </div>
          <div class="row">
            <center>
              <button id="de-export-tce" class="btn btn-ui waves-effect waves-light">
                Export STK .tce &#9658;
              </button>
            </center>
          </div>
          <div class="row">
            <center>
              <button id="de-export-fov" class="btn btn-ui waves-effect waves-light">
                Export Satellites in FOV &#9658;
              </button>
            </center>
          </div>
          <h5 class="center-align">Satellite Ephemeris</h5>
          <div class="divider"></div>
          <div class="row"></div>
          <form id="de-ephemeris-form">
            <div class="row">
              <div class="input-field col s6">
                <input value="24" id="de-ephem-span" type="text" />
                <label for="de-ephem-span" class="active">Time Span (hrs)</label>
              </div>
              <div class="input-field col s6">
                <input value="60" id="de-ephem-step" type="text" />
                <label for="de-ephem-step" class="active">Step Size (sec)</label>
              </div>
            </div>
            <div class="row">
              <center>
                <button id="de-export-ephem" class="btn btn-ui waves-effect waves-light" type="submit"
                  name="action" disabled>Select Satellite First</button>
              </center>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Lifecycle
  // =========================================================================

  addJs(): void {
    super.addJs();

    EventBus.getInstance().on(
      EventBusEvent.uiManagerFinal,
      this.uiManagerFinal_.bind(this),
    );

    EventBus.getInstance().on(EventBusEvent.selectSatData, (obj: BaseObject) => {
      this.updateEphemerisButton_(obj);
    });
  }

  protected uiManagerFinal_() {
    const objData = ServiceLocator.getCatalogManager().objectCache;

    getEl('de-export-tle-2a')?.addEventListener('click', () => {
      CatalogExporter.exportTle2Txt(objData);
    });

    getEl('de-export-tle-3a')?.addEventListener('click', () => {
      CatalogExporter.exportTle2Txt(objData, 3);
    });

    getEl('de-export-tle-2b')?.addEventListener('click', () => {
      CatalogExporter.exportTle2Txt(objData, 2, false);
    });

    getEl('de-export-tle-3b')?.addEventListener('click', () => {
      CatalogExporter.exportTle2Txt(objData, 3, false);
    });

    getEl('de-export-csv')?.addEventListener('click', () => {
      CatalogExporter.exportTle2Csv(objData);
    });

    getEl('de-export-tce')?.addEventListener('click', () => {
      CatalogExporter.exportTce(objData);
    });

    getEl('de-export-fov')?.addEventListener('click', () => {
      CatalogExporter.exportSatInFov2Csv(objData);
    });

    getEl('de-ephemeris-form')?.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      showLoading(() => this.exportEphemeris_());
    });
  }

  // =========================================================================
  // Ephemeris export (.e file)
  // =========================================================================

  protected updateEphemerisButton_(obj: BaseObject) {
    const btn = getEl('de-export-ephem') as HTMLButtonElement | null;

    if (!btn) {
      return;
    }

    if (obj?.isSatellite()) {
      btn.disabled = false;
      btn.textContent = 'Export .e Ephemeris \u25B6';
    } else {
      btn.disabled = true;
      btn.textContent = 'Select Satellite First';
    }
  }

  private exportEphemeris_() {
    const selectSatManager = PluginRegistry.getPlugin(SelectSatManager);
    const sat = selectSatManager?.getSelectedSat();

    if (!sat || !sat.isSatellite()) {
      ServiceLocator.getUiManager().toast('No satellite selected!', ToastMsgType.critical);

      return;
    }

    const satellite = sat as Satellite;
    const spanHours = parseFloat((<HTMLInputElement>getEl('de-ephem-span')).value) || 24;
    const stepSec = parseFloat((<HTMLInputElement>getEl('de-ephem-step')).value) || 60;
    const totalSeconds = spanHours * 3600;
    const numPoints = Math.floor(totalSeconds / stepSec) + 1;

    const startTime = ServiceLocator.getTimeManager().getOffsetTimeObj(0);
    const lines: string[] = [];

    for (let i = 0; i < numPoints; i++) {
      const offsetSec = i * stepSec;
      const time = new Date(startTime.getTime() + offsetSec * 1000);
      const eci = SatMath.getEci(satellite, time);

      if (!eci.position || typeof eci.position === 'boolean') {
        continue;
      }
      if (!eci.velocity || typeof eci.velocity === 'boolean') {
        continue;
      }

      const p = eci.position;
      const v = eci.velocity;

      lines.push(
        `${offsetSec.toFixed(6)}  ${p.x.toFixed(6)}  ${p.y.toFixed(6)}  ${p.z.toFixed(6)}  ${v.x.toFixed(6)}  ${v.y.toFixed(6)}  ${v.z.toFixed(6)}`,
      );
    }

    if (lines.length === 0) {
      ServiceLocator.getUiManager().toast('Failed to propagate satellite!', ToastMsgType.critical);

      return;
    }

    const epochStr = DataExportPlugin.formatStkEpoch_(startTime);

    const content = [
      'stk.v.11.0',
      'BEGIN Ephemeris',
      `NumberOfEphemerisPoints ${lines.length}`,
      `ScenarioEpoch ${epochStr}`,
      'InterpolationMethod Lagrange',
      'InterpolationOrder 7',
      'CentralBody Earth',
      'CoordinateSystem TEME',
      'DistanceUnit Kilometers',
      'EphemerisTimePosVel',
      '',
      ...lines,
      '',
      'END Ephemeris',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

    saveAs(blob, `${satellite.sccNum5}.e`);
  }

  /**
   * Format a Date as STK epoch string: "DD Mon YYYY HH:MM:SS.sss"
   */
  private static formatStkEpoch_(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getUTCDate().toString().padStart(2, '0');
    const mon = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hrs = date.getUTCHours().toString().padStart(2, '0');
    const min = date.getUTCMinutes().toString().padStart(2, '0');
    const sec = date.getUTCSeconds().toString().padStart(2, '0');
    const ms = date.getUTCMilliseconds().toString().padStart(3, '0');

    return `${day} ${mon} ${year} ${hrs}:${min}:${sec}.${ms}`;
  }
}
