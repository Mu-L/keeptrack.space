import { GetSatType, MenuMode } from '@app/engine/core/interfaces';
import { PluginRegistry } from '@app/engine/core/plugin-registry';
import { ServiceLocator } from '@app/engine/core/service-locator';
import { KeepTrackPlugin } from '@app/engine/plugins/base-plugin';
import {
  IBottomIconConfig,
  IDragOptions,
  IHelpConfig,
  IKeyboardShortcut,
  ISideMenuConfig,
} from '@app/engine/plugins/core/plugin-capabilities';
import { html } from '@app/engine/utils/development/formatter';
import { getEl } from '@app/engine/utils/get-el';
import { t7e } from '@app/locales/keys';
import { Satellite, SpaceObjectType } from '@ootk/src/main';
import waterfall2Png from '@public/img/icons/waterfall2.png';
import * as echarts from 'echarts';
import 'echarts-gl';
import { SelectSatManager } from '../select-sat-manager/select-sat-manager';
import './inc2alt.css';

// Constellation detection patterns
const CONSTELLATION_PATTERNS: { name: string; regex: RegExp }[] = [
  { name: 'Starlink', regex: /STARLINK/iu },
  { name: 'OneWeb', regex: /ONEWEB/iu },
  { name: 'Iridium', regex: /IRIDIUM/iu },
  { name: 'Orbcomm', regex: /ORBCOMM/iu },
  { name: 'Globalstar', regex: /GLOBALSTAR/iu },
  { name: 'Planet', regex: /FLOCK|DOVE|SKYSAT|PELICAN/iu },
  { name: 'Spire', regex: /LEMUR|SPIRE/iu },
];

/**
 * Detect constellation from satellite name
 */
const detectConstellation = (name: string): string => {
  for (const pattern of CONSTELLATION_PATTERNS) {
    if (pattern.regex.test(name)) {
      return pattern.name;
    }
  }

  return 'Other';
};

/** Extended data tuple: [inclination, altitude, period, name, id, raan, eccentricity, country] */
type Inc2AltDataItem = [number, number, number, string, number, number, number, string];

interface Inc2AltConstellationData {
  name: string;
  value: Inc2AltDataItem[];
}

export class Inc2AltPlots extends KeepTrackPlugin {
  readonly id = 'Inc2AltPlots';
  dependencies_: string[] = [SelectSatManager.name];
  private readonly selectSatManager_: SelectSatManager;

  constructor() {
    super();
    this.selectSatManager_ = PluginRegistry.getPlugin(SelectSatManager) as unknown as SelectSatManager;
  }

  // =========================================================================
  // Plugin-specific properties
  // =========================================================================

  private readonly plotCanvasId_ = 'plot-analysis-chart-inc2alt';
  chart: echarts.ECharts | null = null;
  private resizeHandler_: (() => void) | null = null;

  // =========================================================================
  // Composition-based configuration methods
  // =========================================================================

  getBottomIconConfig(): IBottomIconConfig {
    return {
      elementName: 'inc2alt-plots-icon',
      label: t7e('plugins.Inc2AltPlots.bottomIconLabel'),
      image: waterfall2Png,
      menuMode: [MenuMode.ANALYSIS, MenuMode.ALL],
    };
  }

  getSideMenuConfig(): ISideMenuConfig {
    return {
      elementName: 'inc2alt-plots-menu',
      title: t7e('plugins.Inc2AltPlots.title'),
      html: this.buildSideMenuHtml_(),
      dragOptions: this.getDragOptions_(),
    };
  }

  getHelpConfig(): IHelpConfig {
    return {
      title: t7e('plugins.Inc2AltPlots.title'),
      body: t7e('plugins.Inc2AltPlots.helpBody'),
    };
  }

  getKeyboardShortcuts(): IKeyboardShortcut[] {
    return [
      {
        key: 'I',
        callback: () => this.bottomMenuClicked(),
      },
    ];
  }

  private getDragOptions_(): IDragOptions {
    return {
      isDraggable: true,
      minWidth: 650,
      maxWidth: 1200,
      onResizeComplete: () => {
        this.chart?.resize();
      },
    };
  }

  private buildSideMenuHtml_(): string {
    return html`
      <div id="inc2alt-plots-menu" class="side-menu-parent start-hidden text-select plot-analysis-menu-normal">
        <div id="plot-analysis-content" class="side-menu">
          <div id="${this.plotCanvasId_}" class="plot-analysis-chart plot-analysis-menu-maximized"></div>
        </div>
        <div id="inc2alt-stats">
          <div id="inc2alt-total-count">--</div>
          <div id="inc2alt-constellation-counts"></div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // Event handlers
  // =========================================================================

  onBottomIconClick(): void {
    if (!this.isMenuButtonActive) {
      return;
    }
    const chartDom = getEl(this.plotCanvasId_)!;
    const plotData = Inc2AltPlots.getPlotData();

    this.createPlot(plotData, chartDom);
    this.updateStatistics_(plotData);
  }

  onBottomIconDeselect(): void {
    if (this.resizeHandler_) {
      window.removeEventListener('resize', this.resizeHandler_);
      this.resizeHandler_ = null;
    }
    if (this.chart) {
      echarts.dispose(this.chart);
      this.chart = null;
    }
  }

  private updateStatistics_(data: Inc2AltConstellationData[]): void {
    const totalEl = getEl('inc2alt-total-count');
    const countsEl = getEl('inc2alt-constellation-counts');

    if (!totalEl || !countsEl) {
      return;
    }

    // Calculate total
    let total = 0;
    const counts: { name: string; count: number }[] = [];

    data.forEach((group) => {
      const count = group.value?.length || 0;

      total += count;
      if (count > 0) {
        counts.push({ name: group.name, count });
      }
    });

    // Sort by count descending
    counts.sort((a, b) => b.count - a.count);

    // Update total
    totalEl.textContent = `${t7e('plugins.Inc2AltPlots.labels.totalLeoPayloads' as Parameters<typeof t7e>[0])}: ${total}`;

    // Update constellation breakdown using DOM API
    countsEl.textContent = '';
    counts.forEach((c) => {
      const span = document.createElement('span');
      const bold = document.createElement('b');

      bold.textContent = `${c.name}:`;
      span.appendChild(bold);
      span.appendChild(document.createTextNode(` ${c.count}`));
      countsEl.appendChild(span);
    });
  }

  // Bridge for legacy event system
  bottomIconCallback = (): void => {
    this.onBottomIconClick();
  };

  // =========================================================================
  // Lifecycle methods
  // =========================================================================

  createPlot(data: Inc2AltConstellationData[], chartDom: HTMLElement) {
    // Dont Load Anything if the Chart is Closed
    if (!this.isMenuButtonActive) {
      return;
    }

    // Delete any old charts and start fresh
    if (this.chart) {
      echarts.dispose(this.chart);
    }
    this.chart = echarts.init(chartDom);
    this.chart.on('click', (event) => {
      const eventData = event.data as { id?: number };

      if (eventData?.id) {
        this.selectSatManager_.selectSat(eventData.id);
      }
    });

    // Setup resize handler
    if (this.resizeHandler_) {
      window.removeEventListener('resize', this.resizeHandler_);
    }
    this.resizeHandler_ = () => this.chart?.resize();
    window.addEventListener('resize', this.resizeHandler_);

    // Setup Chart - use notMerge to ensure colors reset properly on reopen
    this.chart.setOption({
      title: {
        text: 'Inclination vs Altitude Scatter Plot',
        textStyle: {
          fontSize: 16,
          color: '#fff',
        },
      },
      legend: {
        show: true,
        textStyle: {
          color: '#fff',
        },
      },
      tooltip: {
        formatter: (params) => {
          const d = params.data as {
            name: string;
            value: number[];
            constellation: string;
            country: string;
            raan: number;
            ecc: number;
          };

          if (!d?.value) {
            return '';
          }

          const color = params.color;

          return `
            <div style="text-align: left;">
              <div style="display: flex; align-items: center; margin-bottom: 5px;">
                <div style="width: 10px; height: 10px; background-color: ${color}; border-radius: 50%; margin-right: 5px;"></div>
                <span style="font-weight: bold;">${d.name}</span>
              </div>
              <div><b>Constellation:</b> ${d.constellation}</div>
              <div><b>Country:</b> ${d.country || 'Unknown'}</div>
              <div><b>Altitude:</b> ${d.value[0].toFixed(0)} km</div>
              <div><b>Inclination:</b> ${d.value[1].toFixed(2)}°</div>
              <div><b>Period:</b> ${d.value[2].toFixed(1)} min</div>
              <div><b>RAAN:</b> ${d.raan?.toFixed(1) ?? 'N/A'}°</div>
              <div><b>Eccentricity:</b> ${d.ecc?.toFixed(5) ?? 'N/A'}</div>
            </div>
          `;
        },
      },
      xAxis: {
        name: 'Altitude (km)',
        type: 'value',
        position: 'bottom',
      },
      yAxis: {
        name: 'Inclination (°)',
        type: 'value',
        position: 'left',
      },
      zAxis: {
        name: 'Period (min)',
        type: 'value',
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: -180,
          end: 180,
        },
        {
          type: 'slider',
          show: true,
          yAxisIndex: [0],
          left: '93%',
          start: 0,
          end: 65,
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          start: -180,
          end: 180,
        },
        {
          type: 'inside',
          yAxisIndex: [0],
          start: 0,
          end: 65,
        },
      ],
      visualMap: [
        {
          left: 'left',
          top: '10%',
          dimension: 2,
          min: 60,
          max: 250,
          itemWidth: 30,
          itemHeight: 500,
          calculable: true,
          precision: 0.05,
          text: ['Period (min)'],
          textGap: 30,
          textStyle: {
            color: '#fff',
          },
          inRange: {
            // symbolSize: [10, 70],
          },
          outOfRange: {
            // symbolSize: [10, 70],
            opacity: 0,
            symbol: 'none',
          },
          controller: {
            inRange: {
              color: ['#41577c'],
            },
            outOfRange: {
              color: ['#999'],
            },
          },
        },
      ],
      series: data.map((group) => ({
        type: 'scatter',
        name: group.name,
        data: group.value?.map((item) => ({
          name: item[3],
          id: item[4],
          value: [item[1], item[0], item[2]],
          raan: item[5],
          ecc: item[6],
          country: item[7],
          constellation: group.name,
        })),
        symbolSize: 12,
        itemStyle: {
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.8)',
        },
        emphasis: {
          itemStyle: {
            color: '#fff',
          },
        },
      })),
    }, true);
  }

  static getPlotData(): Inc2AltConstellationData[] {
    // Group by constellation instead of country
    const constellations: Record<string, Inc2AltDataItem[]> = {
      Starlink: [],
      OneWeb: [],
      Iridium: [],
      Orbcomm: [],
      Globalstar: [],
      Planet: [],
      Spire: [],
      Other: [],
    };

    const catalogManager = ServiceLocator.getCatalogManager();
    const now = ServiceLocator.getTimeManager().simulationTimeObj;

    catalogManager.objectCache.forEach((obj) => {
      if (obj.type !== SpaceObjectType.PAYLOAD) {
        return;
      }

      let sat = obj as Satellite;

      if (sat.period > 250) {
        return;
      }

      sat = catalogManager.getSat(sat.id, GetSatType.POSITION_ONLY)!;

      const alt = sat.lla(now)?.alt ?? 0;

      // Filter out decayed satellites and those beyond 3,000 (makes slider usable)
      if (alt < 70 || alt > 3000) {
        return;
      }

      const constellation = detectConstellation(sat.name);

      // [inclination, altitude, period, name, id, raan, eccentricity, country]
      constellations[constellation].push([
        sat.inclination,
        alt,
        sat.period,
        sat.name,
        sat.id,
        sat.rightAscension,
        sat.eccentricity,
        sat.country,
      ]);
    });

    // Return constellations with satellites, putting "Other" last
    return [
      { name: 'Starlink', value: constellations.Starlink },
      { name: 'OneWeb', value: constellations.OneWeb },
      { name: 'Iridium', value: constellations.Iridium },
      { name: 'Orbcomm', value: constellations.Orbcomm },
      { name: 'Globalstar', value: constellations.Globalstar },
      { name: 'Planet', value: constellations.Planet },
      { name: 'Spire', value: constellations.Spire },
      { name: 'Other', value: constellations.Other },
    ];
  }
}
