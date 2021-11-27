import { TimeManager } from '@app/types/types';
import $ from 'jquery';
import { keepTrackApi } from '../api/externalApi';
import { getDayOfYear } from './transforms';

export const changePropRate = (propRate: number) => {
  if (timeManager.propRate === propRate) return; // no change

  timeManager.staticOffset = timeManager.calculateSimulationTime() - timeManager.realTime;

  // Changing propRate or dynamicOffsetEpoch before calculating the staticOffset will give incorrect results
  timeManager.dynamicOffsetEpoch = Date.now();
  timeManager.propRate = propRate;
  console.debug('changePropRate', propRate);
  synchronize();
};

export const synchronize = () => {
  const { satSet, orbitManager } = keepTrackApi.programs;
  const message = {
    typ: 'offset',
    staticOffset: timeManager.staticOffset,
    dynamicOffsetEpoch: timeManager.dynamicOffsetEpoch,
    propRate: timeManager.propRate,
  };
  satSet.satCruncher.postMessage(message);

  // OrbitWorker starts later than the satCruncher so it might not be
  // ready yet.
  if (orbitManager.orbitWorker) {
    orbitManager.orbitWorker.postMessage(message);
  }
};

export const changeStaticOffset = (staticOffset: number) => {
  timeManager.dynamicOffsetEpoch = Date.now();
  timeManager.staticOffset = staticOffset;
  console.debug('changeStaticOffset', staticOffset);
  synchronize();
};

export const timeManager: TimeManager = {
  dateObject: null,
  datetimeInputDOM: null,
  timeTextStr: null,
  timeTextStrEmpty: null,
  propRate: null,
  dt: null,
  drawDt: null,
  setNow: null,
  setLastTime: null,
  setSelectedDate: null,
  lastTime: null,
  selectedDate: null,
  tDS: null,
  iText: null,
  propRate0: null,
  dateDOM: null,
  getPropOffset: null,
  getDayOfYear: getDayOfYear,
  propFrozen: 0,
  changePropRate: changePropRate,
  changeStaticOffset: changeStaticOffset,
  synchronize: synchronize,
  init: () => {
    timeManager.dateObject = new Date();
    timeManager.simulationTimeObj = timeManager.dateObject;
    timeManager.datetimeInputDOM = $('#datetime-input-tb');

    timeManager.timeTextStr = '';
    timeManager.timeTextStrEmpty = '';

    timeManager.propFrozen = Date.now(); // for when propRate 0
    timeManager.realTime = timeManager.propFrozen; // (initialized as Date.now)
    timeManager.propRate = 1.0; // time rate multiplier for propagation
    timeManager.dt = 0;
    timeManager.drawDt = 0;

    // Propagation Time Functions
    timeManager.calculateSimulationTime = (newSimulationTime?: Date): Date => {
      if (typeof newSimulationTime !== 'undefined' && newSimulationTime !== null) {
        timeManager.simulationTimeObj.setTime(newSimulationTime);
        return timeManager.simulationTimeObj;
      }

      // simulationTime: The time in the simulation
      // realTime: The time in the real world
      // staticOffset: The time offset ignoring propRate (ex. New Launch)
      // dynamicOffset: The time offset that is impacted by propRate
      // dynamicOffsetEpoch: The time taken when dynamicOffset or propRate changes
      // propRate: The rate of change applied to the dynamicOffset
      //
      // dynamicOffset = realTime - dynamicOffsetEpoch;
      // simulationTime = realTime + staticOffset + dynamicOffset * propRate;

      if (timeManager.propRate === 0) {
        const simulationTime = timeManager.dynamicOffsetEpoch + timeManager.staticOffset;
        timeManager.simulationTimeObj.setTime(simulationTime);
      } else {
        const dynamicOffset = timeManager.realTime - timeManager.dynamicOffsetEpoch;
        const simulationTime = timeManager.realTime + timeManager.staticOffset + dynamicOffset * timeManager.propRate;
        timeManager.simulationTimeObj.setTime(simulationTime);
      }

      return timeManager.simulationTimeObj;
    };

    timeManager.getOffsetTimeObj = (offset: number, timeObj: Date) => {
      const now = new Date(); // Make a time variable
      now.setTime(timeObj.getTime() + offset); // Set the time variable to the time in the future
      return now;
    };

    timeManager.setNow = (now, dt) => {
      timeManager.realTime = now;
      timeManager.dt = dt;

      timeManager.setLastTime(timeManager.simulationTimeObj);
      timeManager.calculateSimulationTime();
      timeManager.setSelectedDate(timeManager.simulationTimeObj);

      // Passing datetimeInput eliminates needing jQuery in main module
      if (timeManager.lastTime - timeManager.simulationTimeObj.getTime() < 300 && (settingsManager.isEditTime || !settingsManager.cruncherReady)) {
        if (settingsManager.plugins.datetime) {
          timeManager.datetimeInputDOM.val(timeManager.selectedDate.toISOString().slice(0, 10) + ' ' + timeManager.selectedDate.toISOString().slice(11, 19));
        }
      }
    };

    timeManager.setLastTime = (now) => {
      timeManager.lastTime = now;
    };

    timeManager.setSelectedDate = (selectedDate) => {
      timeManager.selectedDate = selectedDate;

      // This function only applies when datetime plugin is enabled
      if (settingsManager.plugins.datetime) {
        if (timeManager.lastTime - timeManager.simulationTimeObj < 300) {
          timeManager.tDS = timeManager.simulationTimeObj.toJSON();
          timeManager.timeTextStr = timeManager.timeTextStrEmpty;
          for (timeManager.iText = 11; timeManager.iText < 20; timeManager.iText++) {
            if (timeManager.iText > 11) timeManager.timeTextStr += timeManager.tDS[timeManager.iText - 1];
          }
          timeManager.propRate0 = timeManager.propRate;
          settingsManager.isPropRateChange = false;
        }
        // textContent doesn't remove the Node! No unecessary DOM changes everytime time updates.
        if (timeManager.dateDOM == null) timeManager.dateDOM = window.document.getElementById('datetime-text');
        if (timeManager.dateDOM == null) {
          console.debug('Cant find datetime-text!');
          return;
        }
        timeManager.dateDOM.textContent = timeManager.timeTextStr;

        // Load the current JDAY
        const jday = timeManager.getDayOfYear(timeManager.calculateSimulationTime());
        $('#jday').html(jday);
      }
    };

    timeManager.getPropOffset = (): number => {
      // timeManager.selectedDate = $('#datetime-text').text().substr(0, 19);
      if (!timeManager.selectedDate) {
        // console.debug(timeManager);
        return 0;
      }
      // selectedDate = selectedDate.split(' ');
      // selectedDate = new Date(selectedDate[0] + 'T' + selectedDate[1] + 'Z');
      const today = new Date();
      // Not using local scope caused time to drift backwards!
      const propOffset = timeManager.selectedDate - today.getTime();
      return propOffset;
    };

    // Initialize
    timeManager.calculateSimulationTime();
    timeManager.setSelectedDate(timeManager.simulationTimeObj);
  },
  dynamicOffsetEpoch: Date.now(),
  realTime: 0,
  staticOffset: 0,
  simulationTimeObj: null,
  calculateSimulationTime: null,
  getOffsetTimeObj: null,
};