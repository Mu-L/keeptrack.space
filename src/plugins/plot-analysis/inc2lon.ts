import { MenuMode } from '@app/engine/core/interfaces';
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
import barChart4BarsPng from '@public/img/icons/bar-chart-4-bars.png';
import * as echarts from 'echarts';
import 'echarts-gl';
import { SelectSatManager } from '../select-sat-manager/select-sat-manager';
import './inc2lon.css';

/** Data tuple: [inclination, longitude, period, name, id] */
type Inc2LonDataItem = [number, number, number, string, number];

interface Inc2LonCountryData {
  name: string;
  value: Inc2LonDataItem[];
}

export class Inc2LonPlots extends KeepTrackPlugin {
  readonly id = 'Inc2LonPlots';
  dependencies_: string[] = [SelectSatManager.name];
  private readonly selectSatManager_: SelectSatManager;

  private static readonly maxEccentricity_ = 0.1;
  private static readonly minSatellitePeriod_ = 1240;
  private static readonly maxSatellitePeriod_ = 1640;
  private static readonly maxInclination_ = 17;

  constructor() {
    super();
    this.selectSatManager_ = PluginRegistry.getPlugin(SelectSatManager) as unknown as SelectSatManager;
  }

  // =========================================================================
  // Plugin-specific properties
  // =========================================================================

  private readonly plotCanvasId_ = 'plot-analysis-chart-inc2lon';
  chart: echarts.ECharts | null = null;
  private resizeHandler_: (() => void) | null = null;

  // =========================================================================
  // Composition-based configuration methods
  // =========================================================================

  getBottomIconConfig(): IBottomIconConfig {
    return {
      elementName: 'inc2lon-plots-icon',
      label: t7e('plugins.Inc2LonPlots.bottomIconLabel' as Parameters<typeof t7e>[0]),
      image: barChart4BarsPng,
      menuMode: [MenuMode.ANALYSIS, MenuMode.ALL],
    };
  }

  getSideMenuConfig(): ISideMenuConfig {
    return {
      elementName: 'inc2lon-plots-menu',
      title: t7e('plugins.Inc2LonPlots.title' as Parameters<typeof t7e>[0]),
      html: this.buildSideMenuHtml_(),
      dragOptions: this.getDragOptions_(),
    };
  }

  getHelpConfig(): IHelpConfig {
    return {
      title: t7e('plugins.Inc2LonPlots.title' as Parameters<typeof t7e>[0]),
      body: t7e('plugins.Inc2LonPlots.helpBody' as Parameters<typeof t7e>[0]),
    };
  }

  getKeyboardShortcuts(): IKeyboardShortcut[] {
    return [
      {
        key: 'G',
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
      <div id="inc2lon-plots-menu" class="side-menu-parent start-hidden text-select plot-analysis-menu-normal">
        <div id="plot-analysis-content" class="side-menu">
          <div id="${this.plotCanvasId_}" class="plot-analysis-chart plot-analysis-menu-maximized"></div>
        </div>
        <div id="inc2lon-stats">
          <div id="inc2lon-total-count">--</div>
          <div id="inc2lon-country-counts"></div>
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
    const plotData = Inc2LonPlots.getPlotData();

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

  private updateStatistics_(data: Inc2LonCountryData[]): void {
    const totalEl = getEl('inc2lon-total-count');
    const countsEl = getEl('inc2lon-country-counts');

    if (!totalEl || !countsEl) {
      return;
    }

    let total = 0;
    const counts: { name: string; count: number }[] = [];

    data.forEach((group) => {
      const count = group.value?.length || 0;

      total += count;
      if (count > 0) {
        counts.push({ name: group.name, count });
      }
    });

    counts.sort((a, b) => b.count - a.count);

    totalEl.textContent = `${t7e('plugins.Inc2LonPlots.labels.totalGeoPayloads' as Parameters<typeof t7e>[0])}: ${total}`;

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

  createPlot(data: Inc2LonCountryData[], chartDom: HTMLElement) {
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
        text: 'GEO Inclination vs Longitude Scatter Plot',
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
              <div><b>Inclination:</b> ${d.value[1].toFixed(3)}\u00B0</div>
              <div><b>Longitude:</b> ${d.value[0].toFixed(3)}\u00B0</div>
              <div><b>Period:</b> ${d.value[2].toFixed(2)} min</div>
            </div>
          `;
        },
      },
      xAxis: {
        name: 'Longitude (\u00B0)',
        type: 'value',
        position: 'bottom',
      },
      yAxis: {
        name: 'Inclination (\u00B0)',
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
          min: 1240,
          max: 1640,
          itemWidth: 30,
          itemHeight: 500,
          calculable: true,
          precision: 0.05,
          text: ['Period (minutes)'],
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
      series: data.map((country) => ({
        type: 'scatter',
        name: country.name,
        data: country.value?.map((item) => ({
          name: item[3],
          id: item[4],
          value: [item[1], item[0], item[2]],
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

  static getPlotData(): Inc2LonCountryData[] {
    const china: Inc2LonDataItem[] = [];
    const usa: Inc2LonDataItem[] = [];
    const france: Inc2LonDataItem[] = [];
    const russia: Inc2LonDataItem[] = [];
    const india: Inc2LonDataItem[] = [];
    const japan: Inc2LonDataItem[] = [];
    const other: Inc2LonDataItem[] = [];

    const catalogManager = ServiceLocator.getCatalogManager();
    const now = ServiceLocator.getTimeManager().simulationTimeObj;

    catalogManager.objectCache.forEach((obj) => {
      if (obj.type !== SpaceObjectType.PAYLOAD) {
        return;
      }
      const sat = obj as Satellite;

      // Only GEO objects
      if (sat.eccentricity > Inc2LonPlots.maxEccentricity_) {
        return;
      }
      if (sat.period < Inc2LonPlots.minSatellitePeriod_) {
        return;
      }
      if (sat.period > Inc2LonPlots.maxSatellitePeriod_) {
        return;
      }
      if (sat.inclination > Inc2LonPlots.maxInclination_) {
        return;
      }

      // Update Position
      const lla = sat.lla(now);

      if (!lla) {
        return;
      }

      switch (sat.country) {
        case 'US':
          usa.push([sat.inclination, lla.lon, sat.period, sat.name, sat.id]);

          return;
        case 'RU':
        case 'USSR':
          russia.push([sat.inclination, lla.lon, sat.period, sat.name, sat.id]);

          return;
        case 'F':
          france.push([sat.inclination, lla.lon, sat.period, sat.name, sat.id]);

          return;

        case 'CN':
          china.push([sat.inclination, lla.lon, sat.period, sat.name, sat.id]);

          return;
        case 'IN':
          india.push([sat.inclination, lla.lon, sat.period, sat.name, sat.id]);

          return;

        case 'J':
          japan.push([sat.inclination, lla.lon, sat.period, sat.name, sat.id]);

          return;
        default:
          other.push([sat.inclination, lla.lon, sat.period, sat.name, sat.id]);

      }
    });

    return [
      { name: 'France', value: france },
      { name: 'USA', value: usa },
      { name: 'Other', value: other },
      { name: 'Russia', value: russia },
      { name: 'China', value: china },
      { name: 'India', value: india },
      { name: 'Japan', value: japan },
    ];
  }
}
