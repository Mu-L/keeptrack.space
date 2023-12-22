import { GetSatType, MissileObject, SatObject, SensorObject } from '@app/interfaces';
import { KeepTrackApiEvents, isMissileObject, isSatObject, isSensorObject, keepTrackApi } from '@app/keepTrackApi';
import { openColorbox } from '@app/lib/colorbox';
import { DEG2RAD, MINUTES_PER_DAY, RAD2DEG, cKmPerMs } from '@app/lib/constants';
import { getEl, hideEl, showEl } from '@app/lib/get-el';
import { SpaceObjectType } from '@app/lib/space-object-type';
import { getDayOfYear } from '@app/lib/transforms';
import { LineTypes, lineManagerInstance } from '@app/singletons/draw-manager/line-manager';
import { errorManagerInstance } from '@app/singletons/errorManager';
import { SearchManager } from '@app/singletons/search-manager';
import { CatalogSource } from '@app/static/catalog-loader';
import { CatalogSearch } from '@app/static/catalog-search';
import { CoordinateTransforms } from '@app/static/coordinate-transforms';
import { SatMath } from '@app/static/sat-math';
import { SensorMath, TearrData } from '@app/static/sensor-math';
import { StringExtractor } from '@app/static/string-extractor';
import addPng from '@public/img/add.png';
import removePng from '@public/img/remove.png';
import Draggabilly from 'draggabilly';
import * as Ootk from 'ootk';
import { KeepTrackPlugin } from '../KeepTrackPlugin';
import { missileManager } from '../missile/missileManager';
import { StereoMapPlugin } from '../stereo-map/stereo-map';
import { WatchlistPlugin } from '../watchlist/watchlist';
import './sat-info-box.css';
import { SelectSatManager } from './select-sat-manager';

/**
 * This class controls all the functionality of the satellite info box.
 * There are select events and update events that are registered to the keepTrackApi.
 */
export class SatInfoBox extends KeepTrackPlugin {
  static PLUGIN_NAME = 'SatInfoBox';
  dependencies: string[] = [SelectSatManager.PLUGIN_NAME];
  private selectSatManager_: SelectSatManager;

  isorbitalDataLoaded = false;
  issecondaryDataLoaded = false;
  issensorInfoLoaded = false;
  islaunchDataLoaded = false;
  issatMissionDataLoaded = false;
  isintelDataLoaded = false;

  currentTEARR = <TearrData>{
    az: 0,
    el: 0,
    rng: 0,
    objName: '',
    lat: 0,
    lon: 0,
    alt: 0,
    inView: false,
  };

  constructor() {
    super(SatInfoBox.PLUGIN_NAME);
    this.selectSatManager_ = <SelectSatManager>keepTrackApi.getPlugin(SelectSatManager);
  }

  addHtml(): void {
    super.addHtml();

    // NOTE: This has to go first.
    // Register orbital element data
    keepTrackApi.register({
      event: KeepTrackApiEvents.selectSatData,
      cbName: `${this.PLUGIN_NAME}_orbitalData`,
      cb: this.orbitalData.bind(this),
    });

    keepTrackApi.register({
      event: KeepTrackApiEvents.selectSatData,
      cbName: `${this.PLUGIN_NAME}_secondaryData`,
      cb: this.secondaryData.bind(this),
    });

    // Register sensor data
    keepTrackApi.register({
      event: KeepTrackApiEvents.selectSatData,
      cbName: `${this.PLUGIN_NAME}_sensorInfo`,
      cb: this.sensorInfo.bind(this),
    });

    // Register launch data
    keepTrackApi.register({
      event: KeepTrackApiEvents.selectSatData,
      cbName: `${this.PLUGIN_NAME}_launchData`,
      cb: this.launchData.bind(this),
    });

    // Register mission data
    keepTrackApi.register({
      event: KeepTrackApiEvents.selectSatData,
      cbName: `${this.PLUGIN_NAME}_satMissionData`,
      cb: this.satMissionData.bind(this),
    });

    // Register intel data
    keepTrackApi.register({
      event: KeepTrackApiEvents.selectSatData,
      cbName: `${this.PLUGIN_NAME}_intelData`,
      cb: this.intelData.bind(this),
    });

    // Register object data
    keepTrackApi.register({
      event: KeepTrackApiEvents.selectSatData,
      cbName: `${this.PLUGIN_NAME}_objectData`,
      cb: SatInfoBox.updateObjectData,
    });
  }

  addJs(): void {
    super.addJs();
    keepTrackApi.register({
      event: KeepTrackApiEvents.updateSelectBox,
      cbName: this.PLUGIN_NAME,
      cb: (sat: SatObject | SensorObject | MissileObject) => {
        if (!keepTrackApi.isInitialized) return;

        // Ignore if it's not a satellite or a missile
        if (isSensorObject(sat)) return;
        sat = <SatObject | MissileObject>sat;

        try {
          const catalogManagerInstance = keepTrackApi.getCatalogManager();
          const timeManagerInstance = keepTrackApi.getTimeManager();
          const sensorManagerInstance = keepTrackApi.getSensorManager();

          if (typeof sat === 'undefined' || sat == null) throw new Error('satInfoBoxCoreCallback: sat is undefined');

          if (isSatObject(sat)) {
            sat = <SatObject>sat;
            if (!sat.position?.x || !sat.position?.y || !sat.position?.z || isNaN(sat.position?.x) || isNaN(sat.position?.y) || isNaN(sat.position?.z)) {
              const newPosition = SatMath.getEci(sat, timeManagerInstance.simulationTimeObj).position as { x: number; y: number; z: number };

              if (!newPosition || (newPosition?.x == 0 && newPosition?.y == 0 && newPosition?.z == 0)) {
                keepTrackApi
                  .getUiManager()
                  .toast(
                    `Satellite ${sat.sccNum} is not in orbit!<br>Sim time is ${timeManagerInstance.simulationTimeObj.toUTCString()}.<br>Be sure to check you have the right TLE.`,
                    'error',
                    true
                  );
                this.selectSatManager_.selectSat(-1);
                return;
              }
            }
            if (catalogManagerInstance.isSensorManagerLoaded) {
              SensorMath.getTearr(sat, sensorManagerInstance.currentSensors, timeManagerInstance.simulationTimeObj);
              const currentTearr = SensorMath.getTearData(timeManagerInstance.simulationTimeObj, sat.satrec, sensorManagerInstance.currentSensors, false);
              this.currentTEARR = currentTearr; // TODO: Make SatMath 100% static
            }
          } else {
            // Is Missile
            this.currentTEARR = missileManager.getMissileTEARR(<MissileObject>sat);
          }

          const lla = CoordinateTransforms.eci2lla(sat.position, timeManagerInstance.simulationTimeObj);
          if (lla.lon >= 0) {
            getEl('sat-longitude').innerHTML = lla.lon.toFixed(3) + '°E';
          } else {
            getEl('sat-longitude').innerHTML = (lla.lon * -1).toFixed(3) + '°W';
          }
          if (lla.lat >= 0) {
            getEl('sat-latitude').innerHTML = lla.lat.toFixed(3) + '°N';
          } else {
            getEl('sat-latitude').innerHTML = (lla.lat * -1).toFixed(3) + '°S';
          }

          if (
            settingsManager.plugins?.stereoMap &&
            keepTrackApi.getPlugin(StereoMapPlugin)?.isMenuButtonActive &&
            timeManagerInstance.realTime > settingsManager.lastMapUpdateTime + 30000
          ) {
            (<StereoMapPlugin>keepTrackApi.getPlugin(StereoMapPlugin)).updateMap();
            settingsManager.lastMapUpdateTime = timeManagerInstance.realTime;
          }

          if (isSatObject(sat)) {
            const { gmst } = SatMath.calculateTimeVariables(timeManagerInstance.simulationTimeObj);
            getEl('sat-altitude').innerHTML = SatMath.getAlt(sat.position, gmst).toFixed(2) + ' km';
            getEl('sat-velocity').innerHTML = sat.velocity.total.toFixed(2) + ' km/s';
          } else {
            sat = <MissileObject>sat;
            getEl('sat-altitude').innerHTML = this.currentTEARR.alt.toFixed(2) + ' km';
            if (sat.velocity.total) {
              getEl('sat-velocity').innerHTML = sat.velocity.total.toFixed(2) + ' km/s';
            } else {
              getEl('sat-velocity').innerHTML = 'Unknown';
            }
          }

          if (catalogManagerInstance.isSensorManagerLoaded) {
            if (this.currentTEARR.inView) {
              if (getEl('sat-azimuth')) getEl('sat-azimuth').innerHTML = this.currentTEARR.az.toFixed(0) + '°'; // Convert to Degrees
              if (getEl('sat-elevation')) getEl('sat-elevation').innerHTML = this.currentTEARR.el.toFixed(1) + '°';
              if (getEl('sat-range')) getEl('sat-range').innerHTML = this.currentTEARR.rng.toFixed(2) + ' km';
              const sun = keepTrackApi.getScene().sun;
              if (getEl('sat-vmag'))
                if (isMissileObject(sat)) {
                  getEl('sat-vmag').innerHTML = 'N/A';
                } else {
                  sat = <SatObject>sat;
                  getEl('sat-vmag').innerHTML = SatMath.calculateVisMag(sat, sensorManagerInstance.currentSensors[0], timeManagerInstance.simulationTimeObj, sun).toFixed(2);
                }
              const beamwidthString = sensorManagerInstance.currentSensors[0].beamwidth
                ? (this.currentTEARR.rng * Math.sin(DEG2RAD * sensorManagerInstance.currentSensors[0].beamwidth)).toFixed(2) + ' km'
                : 'Unknown';
              if (getEl('sat-beamwidth')) getEl('sat-beamwidth').innerHTML = beamwidthString;
              if (getEl('sat-maxTmx')) getEl('sat-maxTmx').innerHTML = ((this.currentTEARR.rng / cKmPerMs) * 2).toFixed(2) + ' ms'; // Time for RF to hit target and bounce back
            } else {
              if (getEl('sat-vmag')) getEl('sat-vmag').innerHTML = 'Out of FOV';
              if (getEl('sat-azimuth')) getEl('sat-azimuth').innerHTML = 'Out of FOV';
              if (getEl('sat-azimuth')) getEl('sat-azimuth').title = 'Azimuth: ' + this.currentTEARR.az.toFixed(0) + '°';

              const elevationDom = getEl('sat-elevation');
              if (elevationDom) elevationDom.innerHTML = 'Out of FOV';
              if (elevationDom) elevationDom.title = 'Elevation: ' + this.currentTEARR.el.toFixed(1) + '°';

              const rangeDom = getEl('sat-range');
              if (rangeDom) rangeDom.innerHTML = 'Out of FOV';
              if (rangeDom) rangeDom.title = 'Range: ' + this.currentTEARR.rng.toFixed(2) + ' km';
              const beamwidthString = sensorManagerInstance.currentSensors[0].beamwidth ? sensorManagerInstance.currentSensors[0].beamwidth + '°' : 'Unknown';
              if (getEl('sat-beamwidth')) getEl('sat-beamwidth').innerHTML = 'Out of FOV';
              if (getEl('sat-beamwidth')) getEl('sat-beamwidth').title = beamwidthString;
              if (getEl('sat-maxTmx')) getEl('sat-maxTmx').innerHTML = 'Out of FOV';
            }
          } else {
            if (getEl('sat-azimuth')) getEl('sat-azimuth').parentElement.style.display = 'none';
            if (getEl('sat-elevation')) getEl('sat-elevation').parentElement.style.display = 'none';
            if (getEl('sat-range')) getEl('sat-range').parentElement.style.display = 'none';
            if (getEl('sat-beamwidth')) getEl('sat-beamwidth').parentElement.style.display = 'none';
            if (getEl('sat-maxTmx')) getEl('sat-maxTmx').parentElement.style.display = 'none';
          }

          if (this.selectSatManager_.secondarySat !== -1 && getEl('secondary-sat-info')?.style?.display === 'none') {
            showEl('secondary-sat-info');
            showEl('sec-angle-link', 'flex');
          } else if (this.selectSatManager_.secondarySat === -1 && getEl('secondary-sat-info')?.style?.display !== 'none') {
            hideEl('secondary-sat-info');
            hideEl('sec-angle-link');
          }

          if (this.selectSatManager_.secondarySat !== -1 && isSatObject(sat)) {
            sat = <SatObject>sat;
            const ric = CoordinateTransforms.sat2ric(this.selectSatManager_.secondarySatObj, sat);
            const dist = SensorMath.distanceString(sat, this.selectSatManager_.secondarySatObj).split(' ')[2];
            getEl('sat-sec-dist').innerHTML = `${dist} km`;
            getEl('sat-sec-rad').innerHTML = `${ric.position[0].toFixed(2)}km`;
            getEl('sat-sec-intrack').innerHTML = `${ric.position[1].toFixed(2)}km`;
            getEl('sat-sec-crosstrack').innerHTML = `${ric.position[2].toFixed(2)}km`;
          }

          if (catalogManagerInstance.isSensorManagerLoaded) {
            if (sensorManagerInstance.isSensorSelected()) {
              const uiManagerInstance = keepTrackApi.getUiManager();

              // If we didn't just calculate next pass time for this satellite and sensor combination do it
              // TODO: Make new logic for this to allow it to be updated while selected
              if (
                (this.selectSatManager_.selectedSat !== uiManagerInstance.lastNextPassCalcSatId ||
                  sensorManagerInstance.currentSensors[0].objName !== uiManagerInstance.lastNextPassCalcSensorShortName) &&
                !isMissileObject(sat)
              ) {
                sat = <SatObject>sat;
                if (sat.perigee > sensorManagerInstance.currentSensors[0].obsmaxrange) {
                  if (getEl('sat-nextpass')) getEl('sat-nextpass').innerHTML = 'Beyond Max Range';
                } else if (getEl('sat-nextpass')) {
                  getEl('sat-nextpass').innerHTML = SensorMath.nextpass(sat, sensorManagerInstance.currentSensors, 2, 5);
                }

                // IDEA: Code isInSun()
                //sun.getXYZ();
                //lineManager.create('ref',[sun.sunvar.position.x,sun.sunvar.position.y,sun.sunvar.position.z]);
              }
              uiManagerInstance.lastNextPassCalcSatId = this.selectSatManager_.selectedSat;
              uiManagerInstance.lastNextPassCalcSensorShortName = sensorManagerInstance.currentSensors[0].objName;
            } else if (getEl('sat-nextpass')) {
              getEl('sat-nextpass').innerHTML = 'Unavailable';
            }
          } else if (getEl('sat-nextpass')) {
            getEl('sat-nextpass').parentElement.style.display = 'none';
          }
        } catch (e) {
          errorManagerInstance.debug('Error updating satellite info!');
        }
      },
    });

    keepTrackApi.register({
      event: KeepTrackApiEvents.onWatchlistUpdated,
      cbName: this.PLUGIN_NAME,
      cb: (watchlistList: number[]) => {
        let isOnList = false;
        watchlistList.forEach((satId) => {
          if (satId === this.selectSatManager_.selectedSat) {
            isOnList = true;
          }
        });

        const addRemoveWatchlistDom = getEl('sat-add-remove-watchlist');
        if (addRemoveWatchlistDom) {
          if (isOnList) {
            (<HTMLImageElement>getEl('sat-remove-watchlist')).style.display = 'block';
            (<HTMLImageElement>getEl('sat-add-watchlist')).style.display = 'none';
          } else {
            (<HTMLImageElement>getEl('sat-add-watchlist')).style.display = 'block';
            (<HTMLImageElement>getEl('sat-remove-watchlist')).style.display = 'none';
          }
        }
      },
    });
  }

  orbitalData(sat: SatObject): void {
    // Only show orbital data if it is available
    if (sat === null || typeof sat === 'undefined') return;

    if (!this.isorbitalDataLoaded) {
      SatInfoBox.createOrbitalData();
      this.isorbitalDataLoaded = true;

      // Give the DOM time load and then redo
      setTimeout(() => {
        this.orbitalData(sat);
      }, 500);
    }

    this.updateOrbitData(sat);
  }

  private nearObjectsLinkClick(distance: number = 100): void {
    const catalogManagerInstance = keepTrackApi.getCatalogManager();

    if (this.selectSatManager_.selectedSat === -1) {
      return;
    }
    const sat = this.selectSatManager_.selectedSat;
    const SCCs = [];
    let pos = catalogManagerInstance.getSat(sat, GetSatType.POSITION_ONLY).position;
    const posXmin = pos.x - distance;
    const posXmax = pos.x + distance;
    const posYmin = pos.y - distance;
    const posYmax = pos.y + distance;
    const posZmin = pos.z - distance;
    const posZmax = pos.z + distance;
    (<HTMLInputElement>getEl('search')).value = '';
    for (let i = 0; i < catalogManagerInstance.numSats; i++) {
      pos = catalogManagerInstance.getSat(i, GetSatType.POSITION_ONLY).position;
      if (pos.x < posXmax && pos.x > posXmin && pos.y < posYmax && pos.y > posYmin && pos.z < posZmax && pos.z > posZmin) {
        SCCs.push(catalogManagerInstance.getSat(i, GetSatType.EXTRA_ONLY).sccNum);
      }
    }

    for (let i = 0; i < SCCs.length; i++) {
      (<HTMLInputElement>getEl('search')).value += i < SCCs.length - 1 ? SCCs[i] + ',' : SCCs[i];
    }

    keepTrackApi.getUiManager().doSearch((<HTMLInputElement>getEl('search')).value.toString());
  }

  private nearOrbitsLink() {
    const catalogManagerInstance = keepTrackApi.getCatalogManager();
    const nearbyObjects = CatalogSearch.findObjsByOrbit(catalogManagerInstance.getSatsFromSatData(), catalogManagerInstance.getSat(this.selectSatManager_.selectedSat));
    const searchStr = SearchManager.doArraySearch(catalogManagerInstance, nearbyObjects);
    keepTrackApi.getUiManager().searchManager.doSearch(searchStr, false);
  }

  private allObjectsLink(): void {
    const catalogManagerInstance = keepTrackApi.getCatalogManager();

    if (this.selectSatManager_.selectedSat === -1) {
      return;
    }
    const intldes = catalogManagerInstance.getSat(this.selectSatManager_.selectedSat, GetSatType.EXTRA_ONLY).intlDes;
    const searchStr = intldes.slice(0, 8);
    keepTrackApi.getUiManager().doSearch(searchStr);
    (<HTMLInputElement>getEl('search')).value = searchStr;
  }

  private drawLineToSun() {
    const sun = keepTrackApi.getScene().sun;
    lineManagerInstance.create(LineTypes.REF_TO_SAT, [this.selectSatManager_.selectedSat, sun.position[0], sun.position[1], sun.position[2]], 'o');
  }

  private drawLineToEarth() {
    lineManagerInstance.create(LineTypes.CENTER_OF_EARTH_TO_SAT, [this.selectSatManager_.selectedSat], 'p');
  }

  private drawLineToSat() {
    if (this.selectSatManager_.secondarySat == -1) keepTrackApi.getUiManager().toast('No Secondary Satellite Selected', 'caution');
    lineManagerInstance.create(LineTypes.SENSOR_TO_SAT, [this.selectSatManager_.selectedSat, this.selectSatManager_.secondarySat], 'b');
  }

  private updateOrbitData = (sat: SatObject): void => {
    if (!sat.missile && typeof sat.staticNum === 'undefined') {
      getEl('sat-apogee').innerHTML = sat.apogee.toFixed(0) + ' km';
      getEl('sat-perigee').innerHTML = sat.perigee.toFixed(0) + ' km';
      getEl('sat-inclination').innerHTML = (sat.inclination * RAD2DEG).toFixed(2) + '°';
      getEl('sat-eccentricity').innerHTML = sat.eccentricity.toFixed(3);
      getEl('sat-raan').innerHTML = (sat.raan * RAD2DEG).toFixed(2) + '°';
      getEl('sat-argPe').innerHTML = (sat.argPe * RAD2DEG).toFixed(2) + '°';

      const periodDom = getEl('sat-period');
      periodDom.innerHTML = sat.period.toFixed(2) + ' min';
      periodDom.dataset.position = 'left';
      periodDom.dataset.delay = '50';
      periodDom.dataset.tooltip = 'Mean Motion: ' + (MINUTES_PER_DAY / sat.period).toFixed(2);

      // TODO: Error checking on Iframe
      let now: Date | number | string = new Date();
      const jday = getDayOfYear(now);
      now = now.getUTCFullYear();
      now = now.toString().substr(2, 2);
      let daysold: number;
      if (sat.TLE1.substr(18, 2) === now) {
        daysold = jday - parseInt(sat.TLE1.substr(20, 3));
      } else {
        daysold = jday + parseInt(now) * 365 - (parseInt(sat.TLE1.substr(18, 2)) * 365 + parseInt(sat.TLE1.substr(20, 3)));
      }

      const elsetAgeDom = getEl('sat-elset-age');

      if (elsetAgeDom) {
        elsetAgeDom.innerHTML = `${daysold} Days`;
      }

      SatInfoBox.updateConfidenceDom(sat);

      elsetAgeDom.dataset.position = 'left';
      elsetAgeDom.dataset.delay = '50';
      elsetAgeDom.dataset.tooltip = 'Epoch Year: ' + sat.TLE1.substr(18, 2).toString() + ' Day: ' + sat.TLE1.substr(20, 8).toString();
    }

    if (!this.isTopLinkEventListenersAdded) {
      getEl('sat-add-watchlist')?.addEventListener('click', this.addRemoveWatchlist.bind(this));
      getEl('sat-remove-watchlist')?.addEventListener('click', this.addRemoveWatchlist.bind(this));
      getEl('all-objects-link')?.addEventListener('click', this.allObjectsLink.bind(this));
      getEl('near-orbits-link')?.addEventListener('click', this.nearOrbitsLink.bind(this));
      getEl('near-objects-link1')?.addEventListener('click', () => this.nearObjectsLinkClick(100));
      getEl('near-objects-link2')?.addEventListener('click', () => this.nearObjectsLinkClick(200));
      getEl('near-objects-link4')?.addEventListener('click', () => this.nearObjectsLinkClick(400));
      getEl('sun-angle-link')?.addEventListener('click', this.drawLineToSun.bind(this));
      getEl('nadir-angle-link')?.addEventListener('click', this.drawLineToEarth.bind(this));
      getEl('sec-angle-link')?.addEventListener('click', this.drawLineToSat.bind(this));
      this.isTopLinkEventListenersAdded = true;
    }
  };

  isTopLinkEventListenersAdded = false;

  secondaryData = (sat: SatObject): void => {
    if (sat === null || typeof sat === 'undefined') return;

    if (!this.issecondaryDataLoaded) {
      SatInfoBox.createSecondaryData();
      this.issecondaryDataLoaded = true;
    }
  };

  private addRemoveWatchlist() {
    const watchlistPlugin = <WatchlistPlugin>keepTrackApi.getPlugin(WatchlistPlugin);
    if (watchlistPlugin) {
      const id = this.selectSatManager_.selectedSat;

      if (watchlistPlugin.isOnWatchlist(id)) {
        watchlistPlugin.removeSat(id);
      } else {
        watchlistPlugin.addSat(id);
      }
    }
  }

  private static updateConfidenceDom(sat: SatObject) {
    let color = '';
    let text = '';

    const confidenceDom = getEl('sat-confidence');
    if (confidenceDom) {
      let confidenceScore = parseInt(sat.TLE1.substring(64, 65)) || 0;

      if (confidenceScore >= 7) {
        text = `High (${confidenceScore})`;
        color = 'green';
      } else if (confidenceScore >= 4) {
        text = `Medium (${confidenceScore})`;
        color = 'orange';
      } else {
        text = `Low (${confidenceScore})`;
        color = 'red';
      }

      confidenceDom.innerHTML = text;
      confidenceDom.style.color = color;
    }
  }

  launchData(sat: SatObject): void {
    if (sat === null || typeof sat === 'undefined') return;

    if (!this.islaunchDataLoaded) {
      SatInfoBox.createLaunchData();
      this.islaunchDataLoaded = true;
    }

    SatInfoBox.updateLaunchData(sat);
  }

  static updateObjectData = (sat: SatObject): void => {
    if (sat === null || typeof sat === 'undefined') return;
    if (sat.static || sat.staticNum >= 0) return;

    const isHasAltName = sat?.altName && sat.altName !== '';
    getEl('sat-info-title-name').innerHTML = sat.name;
    getEl('sat-alt-name').innerHTML = isHasAltName ? sat.altName : 'N/A';

    const watchlistPlugin = <WatchlistPlugin>keepTrackApi.getPlugin(WatchlistPlugin);
    if (watchlistPlugin) {
      if (watchlistPlugin.isOnWatchlist(sat.id)) {
        getEl('sat-remove-watchlist').style.display = 'block';
        getEl('sat-add-watchlist').style.display = 'none';
      } else {
        getEl('sat-add-watchlist').style.display = 'block';
        getEl('sat-remove-watchlist').style.display = 'none';
      }
    } else {
      getEl('sat-add-watchlist').style.display = 'none';
      getEl('sat-remove-watchlist').style.display = 'none';
    }

    SatInfoBox.updateSatType(sat);

    // TODO:
    // getEl('edit-satinfo-link').innerHTML = "<a class='iframe' href='editor.htm?scc=" + sat.sccNum + "&popup=true'>Edit Satellite Info</a>";

    if (sat.missile) {
      getEl('sat-intl-des').innerHTML = 'N/A';
      getEl('sat-objnum').innerHTML = 'N/A';
      getEl('sat-altid').innerHTML = 'N/A';
      getEl('sat-source').innerHTML = 'N/A';
    } else {
      getEl('sat-intl-des').innerHTML = sat.intlDes === 'none' ? 'N/A' : sat.intlDes;
      if (sat.source && sat.source === CatalogSource.VIMPEL) {
        getEl('sat-objnum').innerHTML = 'N/A';
        getEl('sat-intl-des').innerHTML = 'N/A';
      } else {
        const satObjNumDom = getEl('sat-objnum');
        satObjNumDom.innerHTML = sat.sccNum;
        // satObjNumDom.setAttribute('data-tooltip', `${FormatTle.convert6DigitToA5(sat.sccNum)}`);
      }

      getEl('sat-altid').innerHTML = sat.altId || 'N/A';
      getEl('sat-source').innerHTML = sat.source || CatalogSource.USSF;
    }

    SatInfoBox.updateRcsData(sat);
  };

  private static updateLaunchData(sat: SatObject) {
    SatInfoBox.updateCountryCorrelationTable(sat);
    let { missileLV, satLvString }: { missileLV: string; satLvString: string } = SatInfoBox.updateLaunchSiteCorrelationTable(sat);
    SatInfoBox.updateLaunchVehicleCorrelationTable(sat, missileLV, satLvString);

    getEl('sat-configuration').innerHTML = sat.configuration !== '' ? sat.configuration : 'Unknown';
  }

  private static updateLaunchVehicleCorrelationTable(sat: SatObject, missileLV: string, satLvString: string) {
    let satVehicleDom = getEl('sat-vehicle');
    // Remove any existing event listeners
    const tempEl = satVehicleDom.cloneNode(true);
    satVehicleDom.parentNode.replaceChild(tempEl, satVehicleDom);
    // Update links
    satVehicleDom = getEl('sat-vehicle');

    if (sat.missile) {
      sat.launchVehicle = missileLV;
      satVehicleDom.innerHTML = sat.launchVehicle;
    } else {
      satVehicleDom.innerHTML = sat.launchVehicle; // Set to JSON record
      if (sat.launchVehicle === 'U') {
        satVehicleDom.innerHTML = 'Unknown';
      } // Replace with Unknown if necessary
      satLvString = StringExtractor.extractLiftVehicle(sat.launchVehicle); // Replace with link if available
      satVehicleDom.innerHTML = satLvString;

      if (satLvString.includes('http')) {
        satVehicleDom.classList.add('menu-selectable');
        satVehicleDom.addEventListener('click', (e) => {
          e.preventDefault();
          openColorbox((<HTMLAnchorElement>satVehicleDom.firstChild).href);
        });
      } else {
        satVehicleDom.classList.remove('menu-selectable');
      }
    }
    return satLvString;
  }

  private static updateLaunchSiteCorrelationTable(sat: SatObject) {
    let siteArr = [];
    let site = {} as any;
    let missileLV: any;
    let missileOrigin: any;
    let satLvString: any;
    if (sat.missile) {
      siteArr = sat.desc.split('(');
      missileOrigin = siteArr[0].substr(0, siteArr[0].length - 1);
      missileLV = sat.desc.split('(')[1].split(')')[0]; // Remove the () from the booster type

      site.site = missileOrigin;
      site.sitec = sat.country;
    } else {
      site = StringExtractor.extractLaunchSite(sat.launchSite);
    }

    getEl('sat-site').innerHTML = site.site;
    getEl('sat-sitec').innerHTML = site.sitec;
    return { missileLV, satLvString };
  }

  private static updateCountryCorrelationTable(sat: SatObject) {
    if (sat.country?.length > 4) {
      getEl('sat-country').innerHTML = sat.country;
    } else {
      const country = StringExtractor.extractCountry(sat.country);
      getEl('sat-country').innerHTML = country;
    }
  }

  private static createLaunchData() {
    getEl('sat-infobox').insertAdjacentHTML(
      'beforeend',
      keepTrackApi.html`
            <div class="sat-info-section-header">Object Data</div>
            <div class="sat-info-row">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Type of Object">Type</div>
              <div class="sat-info-value" id="sat-type">PAYLOAD</div>
            </div>
            <div class="sat-info-row sat-only-info">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Country That Owns the Object">Country</div>
              <div class="sat-info-value" id="sat-country">COUNTRY</div>
            </div>
            <div class="sat-info-row" id="sat-site-row">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Location Where Object Launched From">Launch Site</div>
              <div class="sat-info-value">
                <div id="sat-site">SITE</div>
                <div id="sat-sitec">LAUNCH COUNTRY</div>
              </div>
              </div>
            <div class="sat-info-row">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Space Lift Vehicle That Launched Object">Rocket</div>
              <div class="sat-info-value menu-selectable" id="sat-vehicle">VEHICLE</div>
            </div>
            <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Configuration of the Rocket">
              Configuration
            </div>
            <div class="sat-info-value" id="sat-configuration">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Radar Cross Section - How reflective the object is to a radar">
              RCS
            </div>
            <div class="sat-info-value" data-position="top" data-delay="50" id="sat-rcs">NO DATA</div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Standard Magnitude - Smaller Numbers Are Brighter">
              Standard Mag
            </div>
            <div class="sat-info-value" id="sat-stdmag">
              NO DATA
            </div>
          </div>
          `
    );
  }

  private static createSecondaryData() {
    getEl('sat-infobox').insertAdjacentHTML(
      'beforeend',
      keepTrackApi.html`
          <div id="secondary-sat-info">
            <div class="sat-info-section-header">Secondary Satellite</div>
            <div class="sat-info-row">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Linear Distance from Secondary Satellite">
                Linear
              </div>
              <div class="sat-info-value" id="sat-sec-dist">xxxx km</div>
            </div>
            <div class="sat-info-row">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Radial Distance">
                Radial
              </div>
              <div class="sat-info-value" id="sat-sec-rad">XX deg</div>
            </div>
            <div class="sat-info-row">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="In-Track Distance from Secondary Satellite">
                In-Track
              </div>
              <div class="sat-info-value" id="sat-sec-intrack">XX deg</div>
            </div>
            <div class="sat-info-row">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Cross-Track Distance from Secondary Satellite">
                Cross-Track
              </div>
              <div class="sat-info-value" id="sat-sec-crosstrack">xxxx km</div>
            </div>
          </div>
          `
    );
  }

  private static createOrbitalData() {
    getEl('ui-wrapper').insertAdjacentHTML(
      'beforeend',
      keepTrackApi.html`
            <div id="sat-infobox" class="text-select satinfo-fixed start-hidden">
              <div id="sat-info-top-links">
                <div id="sat-info-title" class="center-text sat-info-section-header">
                  <img id="sat-add-watchlist" src="${addPng}"/>
                  <img id="sat-remove-watchlist" src="${removePng}"/>
                  <span id="sat-info-title-name">
                    This is a title
                  </span>
                </div>
                ${
                  getEl('search')
                    ? keepTrackApi.html`
                  <div id="all-objects-link" class="link sat-infobox-links sat-only-info" data-position="top" data-delay="50"
                  data-tooltip="Find Related Objects">Find all objects from this launch...</div>
                  <div id="near-orbits-link" class="link sat-infobox-links sat-only-info" data-position="top" data-delay="50"
                  data-tooltip="Find Objects in Orbital Plane">Find all objects near this orbit...</div>
                  <div id="near-objects-link1" class="link sat-infobox-links" data-position="top" data-delay="50"
                  data-tooltip="Find Nearby Objects">Find all objects within 100km...</div>
                  <div id="near-objects-link2" class="link sat-infobox-links" data-position="top" data-delay="50"
                  data-tooltip="Find Nearby Objects">Find all objects within 200km...</div>
                  <div id="near-objects-link4" class="link sat-infobox-links" data-position="top" data-delay="50"
                  data-tooltip="Find Nearby Objects">Find all objects within 400km...</div>`
                    : ''
                }
                <div id="sun-angle-link" class="link sat-infobox-links" data-position="top" data-delay="50"
                data-tooltip="Visualize Angle to Sun">Draw sat to sun line...</div>
                <div id="nadir-angle-link" class="link sat-infobox-links" data-position="top" data-delay="50"
                data-tooltip="Visualize Angle to Earth">Draw sat to nadir line...</div>
                <div id="sec-angle-link" class="link sat-infobox-links" data-position="top" data-delay="50"
                data-tooltip="Visualize Angle to Secondary Satellite">Draw sat to second sat line...</div>
              </div>
              <div id="sat-identifier-data">
                <div class="sat-info-section-header">Identifiers</div>
                <div class="sat-info-row sat-only-info">
                  <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="International Designator - Launch Year, Launch Number, and Piece Designator">COSPAR</div>
                  <div class="sat-info-value" id="sat-intl-des">xxxx-xxxA</div>
                </div>
                <div class="sat-info-row sat-only-info">
                  <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="USSF Catalog Number - Originally North American Air Defense (NORAD)">NORAD</div>
                  <div class="sat-info-value" id="sat-objnum" data-position="top" data-delay="50">99999</div>
                </div>
                <div class="sat-info-row sat-only-info">
                  <div class="sat-info-key">Alt Name</div>
                  <div class="sat-info-value" id="sat-alt-name">Alt Name</div>
                </div>
                <div class="sat-info-row sat-only-info">
                  <div class="sat-info-key">Alt ID</div>
                  <div class="sat-info-value" id="sat-altid">99999</div>
                </div>
                <div class="sat-info-row sat-only-info">
                  <div class="sat-info-key">Source</div>
                  <div class="sat-info-value" id="sat-source">USSF</div>
                </div>
                <div class="sat-info-row sat-only-info">
                  <div class="sat-info-key">Confidence</div>
                  <div class="sat-info-value" id="sat-confidence">High</div>
                </div>
              </div>
              <div class="sat-info-section-header">Orbit Data</div>
              <div class="sat-info-row sat-only-info">
                <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="Highest Point in the Orbit">
                  Apogee
                </div>
                <div class="sat-info-value" id="sat-apogee">xxx km</div>
              </div>
              <div class="sat-info-row sat-only-info">
                <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="Lowest Point in the Orbit">
                  Perigee
                </div>
                <div class="sat-info-value" id="sat-perigee">xxx km</div>
              </div>
              <div class="sat-info-row sat-only-info">
                <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="Angle Measured from Equator on the Ascending Node">
                  Inclination
                </div>
                <div class="sat-info-value" id="sat-inclination">xxx.xx</div>
              </div>
              <div class="sat-info-row sat-only-info">
                <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="How Circular the Orbit Is (0 is a Circle)">
                  Eccentricity
                </div>
                <div class="sat-info-value" id="sat-eccentricity">x.xx</div>
              </div>
              <div class="sat-info-row sat-only-info">
                <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="Where it Rises Above the Equator">
                  Right Asc.
                </div>
                <div class="sat-info-value" id="sat-raan">x.xx</div>
              </div>
              <div class="sat-info-row sat-only-info">
                <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="Where the Lowest Part of the Orbit Is">
                  Arg of Perigee
                </div>
                <div class="sat-info-value" id="sat-argPe">x.xx</div>
              </div>
              <div class="sat-info-row">
                <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="Current Latitude Over Earth">
                  Latitude
                </div>
                <div class="sat-info-value" id="sat-latitude">x.xx</div>
              </div>
              <div class="sat-info-row">
                <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="Current Longitude Over Earth">
                  Longitude
                </div>
                <div class="sat-info-value" id="sat-longitude">x.xx</div>
              </div>
              <div class="sat-info-row">
                <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="Current Altitude Above Sea Level">
                  Altitude
                </div>
                <div class="sat-info-value" id="sat-altitude">xxx km</div>
              </div>
              <div class="sat-info-row sat-only-info">
                <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="Time for One Complete Revolution Around Earth">
                  Period
                </div>
                <div class="sat-info-value" id="sat-period">xxx min</div>
              </div>
              <div class="sat-info-row sat-only-info">
                <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="Current Velocity of the Satellite (Higher the Closer to Earth it Is)">
                  Velocity
                </div>
                <div class="sat-info-value" id="sat-velocity">xxx km/s</div>
              </div>
              <div class="sat-info-row sat-only-info">
                <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="Time Since Official Orbit Calculated (Older ELSETs are Less Accuarate Usually)">
                  Age of ELSET
                </div>
                <div class="sat-info-value" id="sat-elset-age">xxx.xxxx</div>
              </div>
            </div>
          `
    );

    // Create a Sat Info Box Initializing Script
    if (!settingsManager.isMobileModeEnabled) {
      const draggie = new Draggabilly(getEl('sat-infobox'), {
        containment: keepTrackApi.containerRoot,
      });
      draggie.on('dragStart', () => {
        getEl('sat-infobox').style.height = '600px';
        keepTrackApi.containerRoot.style.setProperty('--search-box-bottom', `0px`);
        getEl('sat-infobox').classList.remove('satinfo-fixed');
      });
    }

    // If right click kill and reinit
    const satInfobox = getEl('sat-infobox');
    satInfobox.addEventListener('mousedown', (e: any) => {
      if (e.button === 2) {
        SatInfoBox.resetMenuLocation_(satInfobox);
      }
    });
  }

  private static resetMenuLocation_(satInfobox: HTMLElement) {
    satInfobox.classList.remove('satinfo-fixed');
    satInfobox.removeAttribute('style');
    satInfobox.style.display = 'block';
    const searchBoxHeight = satInfobox.clientHeight;
    keepTrackApi.containerRoot.style.setProperty('--search-box-bottom', `${searchBoxHeight}px`);
  }

  private static updateSatType(sat: SatObject) {
    switch (sat.type) {
      case SpaceObjectType.UNKNOWN:
        getEl('sat-type').innerHTML = 'TBA';
        break;
      case SpaceObjectType.PAYLOAD:
        getEl('sat-type').innerHTML = 'Payload';
        break;
      case SpaceObjectType.ROCKET_BODY:
        getEl('sat-type').innerHTML = 'Rocket Body';
        break;
      case SpaceObjectType.DEBRIS:
        getEl('sat-type').innerHTML = 'Debris';
        break;
      case SpaceObjectType.SPECIAL:
        getEl('sat-type').innerHTML = 'Special';
        break;
      case SpaceObjectType.RADAR_MEASUREMENT:
        getEl('sat-type').innerHTML = 'Radar Measurement';
        break;
      case SpaceObjectType.RADAR_TRACK:
        getEl('sat-type').innerHTML = 'Radar Track';
        break;
      case SpaceObjectType.RADAR_OBJECT:
        getEl('sat-type').innerHTML = 'Radar Object';
        break;
      default:
        if (sat.missile) getEl('sat-type').innerHTML = 'Ballistic Missile';
    }
  }

  private static updateRcsData(sat: SatObject) {
    const satRcsEl = getEl('sat-rcs');
    if (sat.rcs === null || typeof sat.rcs == 'undefined' || sat.rcs === '' || sat.rcs === 'N/A') {
      const historicRcs = keepTrackApi
        .getCatalogManager()
        .getSatsFromSatData()
        .filter((sat_) => {
          if (typeof sat_.name !== 'string') return false;
          // If 85% of the characters in satellite's name matches then include it
          // Only use the first word of the name
          // character must be in the same order
          const name = sat_.name.toLowerCase().split(' ')[0];
          let satName = 'Unknown';
          if (sat.name) {
            satName = sat.name.toLowerCase().split(' ')[0];
          }
          const nameLength = name.length;
          const satNameLength = satName.length;
          const minLength = Math.min(nameLength, satNameLength);
          const maxLength = Math.max(nameLength, satNameLength);
          let matchCount = 0;
          for (let i = 0; i < minLength; i++) {
            if (name[i] === satName[i]) matchCount++;
          }
          return matchCount / maxLength > 0.85;
        })
        .map((sat_) => sat_.rcs)
        .filter((rcs) => parseFloat(rcs) > 0);
      if (historicRcs.length > 0) {
        const rcs = historicRcs.map((rcs_) => parseFloat(rcs_)).reduce((a, b) => a + b, 0) / historicRcs.length;
        satRcsEl.innerHTML = `H-Est ${rcs.toFixed(4)} m<sup>2</sup>`;
        satRcsEl.setAttribute('data-tooltip', SatMath.mag2db(rcs).toFixed(2) + ' dBsm (Historical Estimate)');
      } else if (sat.length && sat.diameter && sat.span && sat.shape) {
        const rcs = SatMath.estimateRcs(parseFloat(sat.length), parseFloat(sat.diameter), parseFloat(sat.span), sat.shape);
        satRcsEl.innerHTML = `Est ${rcs.toFixed(4)} m<sup>2</sup>`;
        satRcsEl.setAttribute('data-tooltip', `Est ${SatMath.mag2db(rcs).toFixed(2)} dBsm`);
      } else {
        satRcsEl.innerHTML = `Unknown`;
        satRcsEl.setAttribute('data-tooltip', 'Unknown');
      }
    } else {
      satRcsEl.innerHTML = `${sat.rcs} m<sup>2</sup>`;
      satRcsEl.setAttribute('data-tooltip', SatMath.mag2db(parseFloat(sat.rcs)).toFixed(2) + ' dBsm');
    }
  }

  satMissionData = (sat: SatObject): void => {
    if (sat === null || typeof sat === 'undefined') return;

    if (!this.issatMissionDataLoaded) {
      SatInfoBox.createSatMissionData();
      this.issatMissionDataLoaded = true;
    }

    SatInfoBox.updateSatMissionData(sat);
  };

  private static updateSatMissionData(sat: SatObject) {
    if (!sat.missile) {
      (<HTMLElement>keepTrackApi.containerRoot.querySelector('.sat-only-info')).style.display = 'flex';
      getEl('sat-user').innerHTML = sat?.owner && sat?.owner !== '' ? sat?.owner : 'Unknown';
      getEl('sat-purpose').innerHTML = sat?.purpose && sat?.purpose !== '' ? sat?.purpose : 'Unknown';
      getEl('sat-contractor').innerHTML = sat?.manufacturer && sat?.manufacturer !== '' ? sat?.manufacturer : 'Unknown';
      // Update with other mass options
      getEl('sat-launchMass').innerHTML = sat?.launchMass && sat?.launchMass !== '' ? sat?.launchMass + ' kg' : 'Unknown';
      getEl('sat-dryMass').innerHTML = sat?.dryMass && sat?.dryMass !== '' ? sat?.dryMass + ' kg' : 'Unknown';
      getEl('sat-lifetime').innerHTML = sat?.lifetime && sat?.lifetime !== '' ? sat?.lifetime + ' yrs' : 'Unknown';
      getEl('sat-power').innerHTML = sat?.power && sat?.power !== '' ? sat?.power + ' w' : 'Unknown';
      getEl('sat-stdmag').innerHTML = sat?.vmag && sat?.vmag?.toString() !== '' ? sat?.vmag?.toString() : 'Unknown';
      getEl('sat-bus').innerHTML = sat?.bus && sat?.bus !== '' ? sat?.bus : 'Unknown';
      getEl('sat-configuration').innerHTML = sat?.configuration && sat?.configuration !== '' ? sat?.configuration : 'Unknown';
      getEl('sat-payload').innerHTML = sat?.payload && sat?.payload !== '' ? sat?.payload : 'Unknown';
      getEl('sat-motor').innerHTML = sat?.motor && sat?.motor !== '' ? sat?.motor : 'Unknown';
      getEl('sat-length').innerHTML = sat?.length && sat?.length !== '' ? sat?.length + ' m' : 'Unknown';
      getEl('sat-diameter').innerHTML = sat?.diameter && sat?.diameter !== '' ? sat?.diameter + ' m' : 'Unknown';
      getEl('sat-span').innerHTML = sat?.span && sat?.span !== '' ? sat?.span + ' m' : 'Unknown';
      getEl('sat-shape').innerHTML = sat?.shape && sat?.shape !== '' ? sat?.shape : 'Unknown';
    } else {
      (<HTMLElement>keepTrackApi.containerRoot.querySelector('.sat-only-info')).style.display = 'none';
    }
  }

  private static createSatMissionData() {
    getEl('sat-infobox').insertAdjacentHTML(
      'beforeend',
      keepTrackApi.html`
        <div id="sat-mission-data">
          <div class="sat-info-section-header">Mission</div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Primary User of the Satellite">
              User
            </div>
            <div class="sat-info-value" id="sat-user">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Main Function of the Satellite">
              Purpose
            </div>
            <div class="sat-info-value" id="sat-purpose">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Contractor Who Built the Satellite">
              Contractor
            </div>
            <div class="sat-info-value" id="sat-contractor">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Mass at Lift Off">
              Lift Mass
            </div>
            <div class="sat-info-value" id="sat-launchMass">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50" data-tooltip="Unfueled Mass">
              Dry Mass
            </div>
            <div class="sat-info-value" id="sat-dryMass">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="How Long the Satellite was Expected to be Operational">
              Life Expectancy
            </div>
            <div class="sat-info-value" id="sat-lifetime">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Satellite Bus">
              Bus
            </div>
            <div class="sat-info-value" id="sat-bus">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Primary Payload">
              Payload
            </div>
            <div class="sat-info-value" id="sat-payload">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Primary Motor">
              Motor
            </div>
            <div class="sat-info-value" id="sat-motor">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Length in Meters">
              Length
            </div>
            <div class="sat-info-value" id="sat-length">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Diameter in Meters">
              Diameter
            </div>
            <div class="sat-info-value" id="sat-diameter">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Span in Meters">
              Span
            </div>
            <div class="sat-info-value" id="sat-span">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Description of Shape">
              Shape
            </div>
            <div class="sat-info-value" id="sat-shape">
              NO DATA
            </div>
          </div>
          <div class="sat-info-row sat-only-info">
            <div class="sat-info-key" data-position="top" data-delay="50"
              data-tooltip="Power of the Satellite">
              Power
            </div>
            <div class="sat-info-value" id="sat-power">
              NO DATA
            </div>
          </div>
        </div>
        `
    );
  }

  intelData = (sat: SatObject, satId?: number): void => {
    if (satId !== -1) {
      if (!this.isintelDataLoaded) {
        SatInfoBox.createIntelData();
        this.isintelDataLoaded = true;
        SatInfoBox.resetMenuLocation_(getEl('sat-infobox'));
      }

      SatInfoBox.updateIntelData(sat);
    }
  };

  private static updateIntelData(sat: SatObject) {
    if (typeof sat.TTP != 'undefined') {
      getEl('sat-ttp-wrapper').style.display = 'block';
      getEl('sat-ttp').innerHTML = sat.TTP;
    } else {
      getEl('sat-ttp-wrapper').style.display = 'none';
    }
    if (typeof sat.NOTES != 'undefined') {
      getEl('sat-notes-wrapper').style.display = 'block';
      getEl('sat-notes').innerHTML = sat.NOTES;
    } else {
      getEl('sat-notes-wrapper').style.display = 'none';
    }
    if (typeof sat.FMISSED != 'undefined') {
      getEl('sat-fmissed-wrapper').style.display = 'block';
      getEl('sat-fmissed').innerHTML = sat.FMISSED;
    } else {
      getEl('sat-fmissed-wrapper').style.display = 'none';
    }
    if (typeof sat.ORPO != 'undefined') {
      getEl('sat-oRPO-wrapper').style.display = 'block';
      getEl('sat-oRPO').innerHTML = sat.ORPO;
    } else {
      getEl('sat-oRPO-wrapper').style.display = 'none';
    }
    if (typeof sat.constellation != 'undefined') {
      getEl('sat-constellation-wrapper').style.display = 'block';
      getEl('sat-constellation').innerHTML = sat.constellation;
    } else {
      getEl('sat-constellation-wrapper').style.display = 'none';
    }
    if (typeof sat.maneuver != 'undefined') {
      getEl('sat-maneuver-wrapper').style.display = 'block';
      getEl('sat-maneuver').innerHTML = sat.maneuver;
    } else {
      getEl('sat-maneuver-wrapper').style.display = 'none';
    }
    if (typeof sat.associates != 'undefined') {
      getEl('sat-associates-wrapper').style.display = 'block';
      getEl('sat-associates').innerHTML = sat.associates;
    } else {
      getEl('sat-associates-wrapper').style.display = 'none';
    }

    if (
      typeof sat.TTP === 'undefined' &&
      typeof sat.NOTES === 'undefined' &&
      typeof sat.FMISSED === 'undefined' &&
      typeof sat.ORPO === 'undefined' &&
      typeof sat.constellation === 'undefined' &&
      typeof sat.maneuver === 'undefined' &&
      typeof sat.associates === 'undefined'
    ) {
      getEl('intel-data-section').style.display = 'none';
    }
  }

  private static createIntelData() {
    getEl('sat-infobox').insertAdjacentHTML(
      'beforeend',
      keepTrackApi.html`
          <div id="intel-data-section" class="sat-info-section-header">Intel Data</div>
            <div class="sat-info-row sat-only-info" id="sat-ttp-wrapper">
              <div class="sat-info-key">
                TTPs
              </div>
              <div class="sat-info-value" id="sat-ttp">
                NO DATA
              </div>
            </div>
            <div class="sat-info-row sat-only-info" id="sat-notes-wrapper">
              <div class="sat-info-key">
                Notes
              </div>
              <div class="sat-info-value" id="sat-notes">
                NO DATA
              </div>
            </div>
            <div class="sat-info-row sat-only-info" id="sat-fmissed-wrapper">
              <div class="sat-info-key">
                Freq. Missed
              </div>
              <div class="sat-info-value" id="sat-fmissed">
                NO DATA
              </div>
            </div>
            <div class="sat-info-row sat-only-info" id="sat-oRPO-wrapper">
              <div class="sat-info-key">
                Sec. Obj
              </div>
              <div class="sat-info-value" id="sat-oRPO">
                NO DATA
              </div>
            </div>
            <div class="sat-info-row sat-only-info" id="sat-constellation-wrapper">
              <div class="sat-info-key">
                Constellation
              </div>
              <div class="sat-info-value" id="sat-constellation">
                NO DATA
              </div>
            </div>
            <div class="sat-info-row sat-only-info" id="sat-maneuver-wrapper">
              <div class="sat-info-key">
                Maneuver
              </div>
              <div class="sat-info-value" id="sat-maneuver">
                NO DATA
              </div>
            </div>
            <div class="sat-info-row sat-only-info" id="sat-associates-wrapper">
              <div class="sat-info-key">
                Associates
              </div>
              <div class="sat-info-value" id="sat-associates">
                NO DATA
              </div>
            </div>
          </div>`
    );
  }

  sensorInfo(sat: SatObject): void {
    if (sat === null || typeof sat === 'undefined' || !settingsManager.plugins.sensor) return;

    if (!this.issensorInfoLoaded) {
      SatInfoBox.createSensorInfo();
      this.issensorInfoLoaded = true;
    }

    SatInfoBox.updateSensorInfo(sat);
  }

  private static updateSensorInfo(sat: SatObject) {
    const sensorManagerInstance = keepTrackApi.getSensorManager();
    const catalogManagerInstance = keepTrackApi.getCatalogManager();

    // If we are using the sensor manager plugin then we should hide the sensor to satellite
    // info when there is no sensor selected
    if (settingsManager.plugins.sensor) {
      if (sensorManagerInstance.isSensorSelected()) {
        getEl('sensor-sat-info').style.display = 'block';
      } else {
        getEl('sensor-sat-info').style.display = 'none';
      }
    }

    const satOnlyInfoDom = keepTrackApi.containerRoot.querySelector<HTMLElement>('.sat-only-info');
    if (!sat.missile) {
      satOnlyInfoDom.style.display = 'flex';
    } else {
      satOnlyInfoDom.style.display = 'none';
    }

    if (!catalogManagerInstance.isSensorManagerLoaded || !sensorManagerInstance.currentSensors[0].lat) {
      const satSunDom = getEl('sat-sun');
      if (satSunDom) satSunDom.style.display = 'none';
    } else {
      const timeManagerInstance = keepTrackApi.getTimeManager();
      const now = new Date(timeManagerInstance.dynamicOffsetEpoch + timeManagerInstance.propOffset);

      let satInSun = -1;
      let sunTime;
      try {
        sunTime = Ootk.Utils.SunMath.getTimes(now, sensorManagerInstance.currentSensors[0].lat, sensorManagerInstance.currentSensors[0].lon);
        satInSun = SatMath.calculateIsInSun(sat, keepTrackApi.getScene().sun.eci);
      } catch {
        satInSun = -1;
      }

      // If No Sensor, then Ignore Sun Exclusion
      const satSunDom = getEl('sat-sun');
      if (sensorManagerInstance.currentSensors[0].lat === null) {
        if (satSunDom) satSunDom.style.display = 'none';
        return;
      } else if (satSunDom) {
        satSunDom.style.display = 'block';
      }

      // If Radar Selected, then Say the Sun Doesn't Matter
      if (sensorManagerInstance.currentSensors[0].type !== SpaceObjectType.OPTICAL && sensorManagerInstance.currentSensors[0].type !== SpaceObjectType.OBSERVER && satSunDom) {
        satSunDom.innerHTML = 'No Effect';
        // If Dawn Dusk Can be Calculated then show if the satellite is in the sun
      } else if (sunTime?.sunriseStart.getTime() - now.getTime() > 0 || (sunTime?.sunsetEnd.getTime() - now.getTime() < 0 && satSunDom)) {
        if (satInSun == 0) satSunDom.innerHTML = 'No Sunlight';
        if (satInSun == 1) satSunDom.innerHTML = 'Limited Sunlight';
        if (satInSun == 2) satSunDom.innerHTML = 'Direct Sunlight';
        // If Optical Sesnor but Dawn Dusk Can't Be Calculated, then you are at a
        // high latitude and we need to figure that out
      } else if (sunTime?.nadir != 'Invalid Date' && (sunTime?.sunriseStart == 'Invalid Date' || sunTime?.sunsetEnd == 'Invalid Date') && satSunDom) {
        // TODO: Figure out how to calculate this
        console.debug('No Dawn or Dusk');
        if (satInSun == 0) satSunDom.innerHTML = 'No Sunlight';
        if (satInSun == 1) satSunDom.innerHTML = 'Limited Sunlight';
        if (satInSun == 2) satSunDom.innerHTML = 'Direct Sunlight';
      } else if (satSunDom) {
        if (satInSun == -1) {
          satSunDom.innerHTML = 'Unable to Calculate';
        } else {
          // Unless you are in sun exclusion
          satSunDom.innerHTML = 'Sun Exclusion';
        }
      }
    }
  }

  private static createSensorInfo() {
    getEl('sat-infobox').insertAdjacentHTML(
      'beforeend',
      keepTrackApi.html`
          <div id="sensor-sat-info">
          <div class="sat-info-section-header">Sensor Data</div>
            <div class="sat-info-row">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Distance from the Sensor">
                Range
              </div>
              <div class="sat-info-value" id="sat-range">xxxx km</div>
            </div>
            <div class="sat-info-row">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Angle (Left/Right) from the Sensor">
                Azimuth
              </div>
              <div class="sat-info-value" id="sat-azimuth">XX deg</div>
            </div>
            <div class="sat-info-row">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Angle (Up/Down) from the Sensor">
                Elevation
              </div>
              <div class="sat-info-value" id="sat-elevation">XX deg</div>
            </div>
            <div class="sat-info-row">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Linear Width at Target's Range">
                Beam Width
              </div>
              <div class="sat-info-value" id="sat-beamwidth">xxxx km</div>
            </div>
            <div class="sat-info-row">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Time for RF/Light to Reach Target and Back">
                Max Tmx Time
              </div>
              <div class="sat-info-value" id="sat-maxTmx">xxxx ms</div>
            </div>
            <div class="sat-info-row sat-only-info">
              <div class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Does the Sun Impact the Sensor">
                Sun
              </div>
              <div class="sat-info-value" id="sat-sun">Sun Stuff</div>
            </div>
            <div class="sat-info-row sat-only-info">
                <div class="sat-info-key" data-position="top" data-delay="50"
                  data-tooltip="Visual Magnitude (Lower numbers are brighter)">
                  Vis Mag
                </div>
                <div class="sat-info-value" id="sat-vmag">xx.x</div>
              </div>
            <div id="sat-info-nextpass-row" class="sat-info-row sat-only-info">
              <div id="sat-info-nextpass" class="sat-info-key" data-position="top" data-delay="50"
                data-tooltip="Next Time in Coverage">
                Next Pass
              </div>
              <div id="sat-nextpass" class="sat-info-value">00:00:00z</div>
            </div>
          </div>
          `
    );
  }

  // eslint-disable-next-line class-methods-use-this
  selectSat(sat?: SatObject): void {
    if (sat) {
      if (isSatObject(sat)) {
        SatInfoBox.setSatInfoBoxSatellite_();
      } else {
        SatInfoBox.setSatInfoBoxMissile_();
      }
    }
  }

  private static setSatInfoBoxMissile_() {
    // TODO: There is an interdependency with SatCoreInfoBox and SelectSatManager.
    ['sat-apogee', 'sat-perigee', 'sat-inclination', 'sat-eccentricity', 'sat-raan', 'sat-argPe', 'sat-stdmag', 'sat-configuration', 'sat-elset-age', 'sat-period'].forEach(
      (id) => {
        const el = getEl(id, true);
        if (!el) return;
        hideEl(el.parentElement.id);
      }
    );

    const satMissionData = getEl('sat-mission-data', true);
    if (satMissionData) satMissionData.style.display = 'none';

    const satIdentifierData = getEl('sat-identifier-data', true);
    if (satIdentifierData) satIdentifierData.style.display = 'none';
  }

  private static setSatInfoBoxSatellite_() {
    // TODO: There is an interdependency with SatCoreInfoBox and SelectSatManager.
    ['sat-apogee', 'sat-perigee', 'sat-inclination', 'sat-eccentricity', 'sat-raan', 'sat-argPe', 'sat-stdmag', 'sat-configuration', 'sat-elset-age', 'sat-period'].forEach(
      (id) => {
        const el = getEl(id, true);
        if (!el) return;
        el.parentElement.style.display = 'flex';
      }
    );

    const satMissionData = getEl('sat-mission-data', true);
    if (satMissionData) satMissionData.style.display = 'block';

    const satIdentifierData = getEl('sat-identifier-data', true);
    if (satIdentifierData) satIdentifierData.style.display = 'block';
  }
}