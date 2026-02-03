import { EChartsData, GetSatType, MenuMode } from '@app/engine/core/interfaces';
import { PluginRegistry } from '@app/engine/core/plugin-registry';
import { ServiceLocator } from '@app/engine/core/service-locator';
import { KeepTrackPlugin } from '@app/engine/plugins/base-plugin';
import { IBottomIconConfig, ISideMenuConfig } from '@app/engine/plugins/core/plugin-capabilities';
import { html } from '@app/engine/utils/development/formatter';
import { getEl } from '@app/engine/utils/get-el';
import { Satellite, SpaceObjectType } from '@ootk/src/main';
import waterfall2Png from '@public/img/icons/waterfall2.png';
import * as echarts from 'echarts';
import 'echarts-gl';
import { SelectSatManager } from '../select-sat-manager/select-sat-manager';

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
  chart: echarts.ECharts;

  // =========================================================================
  // Composition-based configuration methods
  // =========================================================================

  getBottomIconConfig(): IBottomIconConfig {
    return {
      elementName: 'inc2alt-plots-icon',
      label: 'Inc vs Alt',
      image: waterfall2Png,
      menuMode: [MenuMode.ANALYSIS, MenuMode.ALL],
    };
  }

  getSideMenuConfig(): ISideMenuConfig {
    return {
      elementName: 'inc2alt-plots-menu',
      title: 'Inclination vs Altitude',
      html: this.buildSideMenuHtml_(),
    };
  }

  private buildSideMenuHtml_(): string {
    return html`
      <div id="inc2alt-plots-menu" class="side-menu-parent start-hidden text-select plot-analysis-menu-normal plot-analysis-menu-maximized">
        <div id="plot-analysis-content" class="side-menu" style="height: 80%; position: relative !important;">
          <div id="${this.plotCanvasId_}" class="plot-analysis-chart plot-analysis-menu-maximized"></div>
        </div>
        <div id="inc2alt-stats" style="padding: 10px; color: #fff; font-size: 12px;">
          <div id="inc2alt-total-count">Total LEO Payloads: --</div>
          <div id="inc2alt-constellation-counts" style="margin-top: 5px;"></div>
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

  private updateStatistics_(data: EChartsData): void {
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
    totalEl.textContent = `Total LEO Payloads: ${total}`;

    // Update constellation breakdown
    const countsHtml = counts
      .map((c) => `<span style="margin-right: 10px;"><b>${c.name}:</b> ${c.count}</span>`)
      .join('');

    countsEl.innerHTML = countsHtml;
  }

  // Bridge for legacy event system
  bottomIconCallback = (): void => {
    this.onBottomIconClick();
  };

  // =========================================================================
  // Lifecycle methods
  // =========================================================================

  addHtml(): void {
    super.addHtml();
  }

  createPlot(data: EChartsData, chartDom: HTMLElement) {
    // Dont Load Anything if the Chart is Closed
    if (!this.isMenuButtonActive) {
      return;
    }

    // Delete any old charts and start fresh
    if (!this.chart) {
      // Setup Configuration
      this.chart = echarts.init(chartDom);
      this.chart.on('click', (event) => {
        if ((event.data as unknown as { id: string })?.id) {
          this.selectSatManager_.selectSat((event.data as unknown as { id: number })?.id);
        }
      });
    }

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
        data: group.value?.map((item) => {
          const extItem = item as unknown as [number, number, number, string, number, number, number, string];

          return {
            name: extItem[3],
            id: extItem[4],
            value: [extItem[1], extItem[0], extItem[2]],
            // Extra data for enhanced tooltips
            raan: extItem[5],
            ecc: extItem[6],
            country: extItem[7],
            constellation: group.name,
          };
        }),
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

  static getPlotData(): EChartsData {
    // Group by constellation instead of country
    const constellations: Record<string, [number, number, number, string, number][]> = {
      Starlink: [],
      OneWeb: [],
      Iridium: [],
      Orbcomm: [],
      Globalstar: [],
      Planet: [],
      Spire: [],
      Other: [],
    };

    ServiceLocator.getCatalogManager().objectCache.forEach((obj) => {
      if (obj.type !== SpaceObjectType.PAYLOAD) {
        return;
      }

      let sat = obj as Satellite;

      if (sat.period > 250) {
        return;
      }

      sat = ServiceLocator.getCatalogManager().getSat(sat.id, GetSatType.POSITION_ONLY)!;
      const now = ServiceLocator.getTimeManager().simulationTimeObj;

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
      ] as unknown as [number, number, number, string, number]);
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
    ] as unknown as EChartsData;
  }
}
