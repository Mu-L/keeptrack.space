/** @format */

import { dateFormat } from '@app/js/lib/dateFormat.js';
import { mathValue } from '@app/js/helpers.js';
import { settingsManager } from '@app/js/keeptrack-head.js';

('use strict');
var timeManager = {};

var propFrozen = Date.now(); // for when propRate 0

// Variables pulled from timeManager.jday function to reduce garbage collection
var jDayStart;
var jDayDiff;

timeManager.dateObject = new Date();
timeManager.propTimeVar = timeManager.dateObject;

timeManager.timeTextStr = '';
timeManager.timeTextStrEmpty = '';

timeManager.now = propFrozen; // (initialized as Date.now)
timeManager.propRealTime = propFrozen; // actual time we're running it (initialized as Date.now)
timeManager.propOffset = 0.0; // offset we're propagating to, msec
timeManager.propRate = 1.0; // time rate multiplier for propagation

timeManager.updatePropTime = (propTimeVar) => {
  if (typeof propTimeVar !== 'undefined' && propTimeVar !== null) {
    timeManager.propTimeVar.setTime(propTimeVar);
    return;
  }
  if (timeManager.propRate === 0) {
    timeManager.propTimeVar.setTime(Number(timeManager.propRealTime) + timeManager.propOffset);
  } else {
    timeManager.propTimeVar.setTime(Number(timeManager.propRealTime) + timeManager.propOffset + (Number(timeManager.now) - Number(timeManager.propRealTime)) * timeManager.propRate);
  }
};

// Propagation Time Functions
timeManager.propTime = function () {
  if (timeManager.propRate === 0) {
    timeManager.propTimeVar.setTime(Number(timeManager.propRealTime) + timeManager.propOffset);
  } else {
    timeManager.propTimeVar.setTime(Number(timeManager.propRealTime) + timeManager.propOffset + (Number(timeManager.now) - Number(timeManager.propRealTime)) * timeManager.propRate);
  }
  return timeManager.propTimeVar;
};

timeManager.propTimeCheck = function (propTempOffset, propRealTime) {
  'use strict';
  var now = new Date(); // Make a time variable
  now.setTime(Number(propRealTime) + propTempOffset); // Set the time variable to the time in the future
  return now;
};

timeManager.setNow = (now) => {
  timeManager.now = now;
};

timeManager.setPropRateZero = function () {
  timeManager.propRate = 0;
  propFrozen = Date.now();
};

timeManager.setLastTime = (now) => {
  timeManager.lastTime = now;
};

timeManager.setSelectedDate = (selectedDate) => {
  timeManager.selectedDate = selectedDate;
  if (timeManager.lastTime - timeManager.propTimeVar < 300) {
    timeManager.tDS = timeManager.propTimeVar.toJSON();
    timeManager.timeTextStr = timeManager.timeTextStrEmpty;
    for (timeManager.iText = 11; timeManager.iText < 20; timeManager.iText++) {
      if (timeManager.iText > 11) timeManager.timeTextStr += timeManager.tDS[timeManager.iText - 1];
    }
    timeManager.propRate0 = timeManager.propRate;
    settingsManager.isPropRateChange = false;
  }
  document.getElementById('datetime-text').innerText = timeManager.timeTextStr;
};

timeManager.getPropOffset = function () {
  // timeManager.selectedDate = $('#datetime-text').text().substr(0, 19);
  if (!timeManager.selectedDate) return;
  // selectedDate = selectedDate.split(' ');
  // selectedDate = new Date(selectedDate[0] + 'T' + selectedDate[1] + 'Z');
  var today = new Date();
  // Not using local scope caused time to drift backwards!
  let propOffset = timeManager.selectedDate - today;
  return propOffset;
};

timeManager.dateToISOLikeButLocal = function (date) {
  var offsetMs = date.getTimezoneOffset() * 60 * 1000;
  var msLocal = date.getTime() - offsetMs;
  var dateLocal = new Date(msLocal);
  var iso = dateLocal.toISOString();
  iso = iso.replace('T', ' ');
  var isoLocal = iso.slice(0, 19) + ' ' + dateLocal.toString().slice(25, 31);
  return isoLocal;
};

timeManager.localToZulu = function (date) {
  date = dateFormat(date, 'isoDateTime', true);
  date = date.split(' ');
  date = new Date(date[0] + 'T' + date[1] + 'Z');
  return date;
};

// Get Day of Year
timeManager.getDayOfYear = function (date) {
  date = date || new Date();
  var _isLeapYear = (date) => {
    var year = date.getFullYear();
    if ((year & 3) !== 0) return false;
    return year % 100 !== 0 || year % 400 === 0;
  };

  var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  var mn = date.getMonth();
  var dn = date.getUTCDate();
  var dayOfYear = dayCount[mn] + dn;
  if (mn > 1 && _isLeapYear(date)) dayOfYear++;
  return dayOfYear;
};

timeManager.dateFromDay = function (year, day) {
  var date = new Date(year, 0); // initialize a date in `year-01-01`
  return new Date(date.setDate(day)); // add the number of days
};

timeManager.jday = function (year, mon, day, hr, minute, sec) {
  // from satellite.js
  if (!year) {
    // console.error('timeManager.jday should always have a date passed to it!');
    let now = new Date();
    jDayStart = new Date(now.getFullYear(), 0, 0);
    jDayDiff = now - jDayStart;
    return Math.floor(jDayDiff / mathValue.MILLISECONDS_PER_DAY);
  } else {
    return (
      367.0 * year - Math.floor(7 * (year + Math.floor((mon + 9) / 12.0)) * 0.25) + Math.floor((275 * mon) / 9.0) + day + 1721013.5 + ((sec / 60.0 + minute) / 60.0 + hr) / 24.0 //  ut in days
    );
  }
};
export { timeManager };