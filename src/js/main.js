/**
 * /*! /////////////////////////////////////////////////////////////////////////////
 *
 * main.js is the primary javascript file for keeptrack.space. It manages all user
 * interaction with the application.
 * http://keeptrack.space
 *
 * Copyright (C) 2016-2020 Theodore Kruczek
 * Copyright (C) 2020 Heather Kruczek
 * Copyright (C) 2015-2016, James Yoder
 *
 * Original source code released by James Yoder at https://github.com/jeyoder/ThingsInSpace/
 * under the MIT License. Please reference http://keeptrack.space/license/thingsinspace.txt
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * /////////////////////////////////////////////////////////////////////////////
 */

import * as $ from 'jquery';
// eslint-disable-next-line sort-imports
import 'jquery-ui-bundle';
import '@app/js/keeptrack-foot.js';
import 'materialize-css';
import * as glm from '@app/js/lib/gl-matrix.js';
import { atmosphere, earth, lineManager, moon, sun } from '@app/js/sceneManager/sceneManager.js';
import { camPitch, camYaw, cameraManager, mouseX, mouseY, screenDragPoint } from '@app/js/cameraManager.js'
import { db, settingsManager } from '@app/js/keeptrack-head.js';
import { satCruncher, satScreenPositionArray, satSet } from '@app/js/satSet.js';
import { ColorScheme } from '@app/js/color-scheme.js';
import { SunCalc } from '@app/js/lib/suncalc.js';
import { adviceList } from '@app/js/advice-module.js';
import { groups } from '@app/js/groups.js';
import { mathValue } from '@app/js/helpers.js';
import { meshManager } from '@app/modules/meshManager.js';
import { missileManager } from '@app/modules/missileManager.js';
import { mobile } from '@app/js/mobile.js';
import { objectManager } from '@app/js/objectManager.js';
import { orbitManager } from '@app/js/orbitManager.js';
import { radarDataManager } from '@app/js/radarDataManager.js';
import { sMM } from '@app/js/sideMenuManager.js';
import { satLinkManager } from '@app/modules/satLinkManager.js';
import { satellite } from '@app/js/lookangles.js';
import { searchBox } from '@app/js/search-box.js';
import { sensorManager } from '@app/modules/sensorManager.js';
import { starManager } from '@app/modules/starManager.js';
import { timeManager } from '@app/js/timeManager.js';
import { uiManager } from '@app/js/uiManager.js';
let M = window.M;

('use strict');
const canvasDOM = $('#keeptrack-canvas');
const bodyDOM = $('#bodyDOM');
const satHoverBoxNode1 = document.getElementById('sat-hoverbox1');
const satHoverBoxNode2 = document.getElementById('sat-hoverbox2');
const satHoverBoxNode3 = document.getElementById('sat-hoverbox3');
const satHoverBoxDOM = $('#sat-hoverbox');
const rightBtnMenuDOM = $('#right-btn-menu');
const rightBtnSaveDOM = $('#save-rmb');
const rightBtnViewDOM = $('#view-rmb');
const rightBtnEditDOM = $('#edit-rmb');
const rightBtnCreateDOM = $('#create-rmb');
const rightBtnDrawDOM = $('#draw-rmb');
const rightBtnColorsDOM = $('#colors-rmb');
const rightBtnEarthDOM = $('#earth-rmb');
const rightBtnSaveMenuDOM = $('#save-rmb-menu');
const rightBtnViewMenuDOM = $('#view-rmb-menu');
const rightBtnEditMenuDOM = $('#edit-rmb-menu');
const rightBtnCreateMenuDOM = $('#create-rmb-menu');
const rightBtnDrawMenuDOM = $('#draw-rmb-menu');
const rightBtnColorsMenuDOM = $('#colors-rmb-menu');
const rightBtnEarthMenuDOM = $('#earth-rmb-menu');
const satMiniBox = document.querySelector('#sat-minibox');

var gl;

var clickedSat = 0;

var maxPinchSize = Math.hypot(window.innerWidth, $(document).height());

// Menu Variables
var isEditSatMenuOpen = false;
var isDOPMenuOpen = false;
var isLookanglesMenuOpen = false;

var pickFb, pickTex;
var pMatrix = glm.mat4.create();

var updateHoverDelay = 0;
var updateHoverDelayLimit = 1;

var pickColorBuf;

var mouseTimeout = null;
var mouseSat = -1;

var dragPoint = [0, 0, 0];
var isCtrlPressed = false;
var isShiftPressed = false;

var isMouseMoving = false;
var dragHasMoved = false;

var isPinching = false;
var deltaPinchDistance = 0;
var startPinchDistance = 0;
var touchStartTime;

var isShowNextPass = false;

// updateHover
let updateHoverSatId;

// _unProject variables
let glScreenX, glScreenY, screenVec, comboPMat, invMat, worldVec;

let isHoverBoxVisible = false;
let isShowDistance = true;

// getEarthScreenPoint
let rayOrigin, ptThru, rayDir, toCenterVec, dParallel, longDir, dPerp, dSubSurf, dSurf, ptSurf;

// //////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////
//
// Start Initialization
//
// //////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////

var initializeKeepTrack = () => {
  mobile.checkMobileMode();
  // initializeGpuManager();
  webGlInit();
  sun.init();
  earth.init();
  if (!settingsManager.enableLimitedUI && !settingsManager.isDrawLess) {
    atmosphere.init();
    // Disabling Moon Until it is Fixed
    moon.init();
  }
  ColorScheme.init();
  settingsManager.loadStr('dots');
  satSet.init(function satSetInitCallBack(satData) {
    orbitManager.init();
    lineManager.init(gl, orbitManager.shader);
    groups.init();
    setTimeout(function () {
      earth.loadHiRes();
      earth.loadHiResNight();
      if (!settingsManager.offline && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register('./serviceWorker.js').then(function () {
          console.debug(`[Service Worker] Installed!`);
        });
      }
    }, 0);
    if (!settingsManager.disableUI) {
      searchBox.init(satData);
    }
    (function _checkIfEarthFinished() {
      if (earth.loaded) return;
      settingsManager.loadStr('coloring');
      setTimeout(function () {
        _checkIfEarthFinished();
      }, 250);
    })();
    let isFinalLoadingComplete = false;
    (function _finalLoadingSequence() {
      if (
        !isFinalLoadingComplete &&
        !earth.loaded
        // && settingsManager.cruncherReady
      ) {
        setTimeout(function () {
          _finalLoadingSequence();
        }, 250);
        return;
      }
      if (isFinalLoadingComplete) return;
      // NOTE:: This is called right after all the objects load on the screen.

      // Version Info Updated
      $('#version-info').html(settingsManager.versionNumber);
      $('#version-info').tooltip({
        delay: 50,
        html: settingsManager.versionDate,
        position: 'top',
      });

      // Display content when loading is complete.
      $('#canvas-holder').attr('style', 'display:block');

      mobile.checkMobileMode();

      if (settingsManager.isMobileModeEnabled) {
        // Start Button Displayed
        $('#mobile-start-button').show();
        $('#spinner').hide();
        settingsManager.loadStr('');
      } else {
        // Loading Screen Resized and Hidden
        if (settingsManager.trusatMode) {
          setTimeout(function () {
            $('#loading-screen').removeClass('full-loader');
            $('#loading-screen').addClass('mini-loader-container');
            $('#logo-inner-container').addClass('mini-loader');
            $('#logo-text').html('');
            $('#logo-trusat').hide();
            $('#loading-screen').hide();
            settingsManager.loadStr('math');
          }, 3000);
        } else {
          setTimeout(function () {
            $('#loading-screen').removeClass('full-loader');
            $('#loading-screen').addClass('mini-loader-container');
            $('#logo-inner-container').addClass('mini-loader');
            $('#logo-text').html('');
            $('#logo-trusat').hide();
            $('#loading-screen').hide();
            settingsManager.loadStr('math');
          }, 1500);
        }
      }

      satSet.setColorScheme(settingsManager.currentColorScheme); // force color recalc

      if ($(window).width() > $(window).height()) {
        settingsManager.mapHeight = $(window).width(); // Subtract 12 px for the scroll
        $('#map-image').width(settingsManager.mapHeight);
        settingsManager.mapHeight = (settingsManager.mapHeight * 3) / 4;
        $('#map-image').height(settingsManager.mapHeight);
        $('#map-menu').width($(window).width());
      } else {
        settingsManager.mapHeight = $(window).height() - 100; // Subtract 12 px for the scroll
        $('#map-image').height(settingsManager.mapHeight);
        settingsManager.mapHeight = (settingsManager.mapHeight * 4) / 3;
        $('#map-image').width(settingsManager.mapHeight);
        $('#map-menu').width($(window).width());
      }

      satLinkManager.idToSatnum();
    })();
  });
  if (settingsManager.isEnableRadarData) radarDataManager.init();
  dlManager.drawLoop(); // kick off the animationFrame()s
  if (!settingsManager.disableUI && !settingsManager.isDrawLess) {
    // Load Optional 3D models if available
    if (typeof meshManager !== 'undefined') {
      setTimeout(function () {
        meshManager.init();
      }, 0);
      settingsManager.selectedColor = [0.0, 0.0, 0.0, 0.0];
    }
  }
};

// //////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////
//
// End Initialization
// Start Main Drawing loop
//
// //////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////

var dlManager = {};
dlManager.drawDt = 0;
dlManager.setDrawDt = (dt) => {
  dlManager.drawDt = dt;
};
dlManager.drawLoopCallback = null;
dlManager.setDrawLoopCallback = (cb) => {
  dlManager.drawLoopCallback = cb;
};
dlManager.i = 0;
dlManager.drawNow;
dlManager.sat;
dlManager.demoModeSatellite = 0;
dlManager.demoModeLastTime = 0;
dlManager.time = null;
dlManager.dt = null;
dlManager.t0 = 0;
dlManager.isShowFPS = false;
dlManager.fps = 0;

dlManager.drawLoop = (preciseDt) => {
  // NOTE drawLoop has 7kb memory leak -- No Impact
  requestAnimationFrame(dlManager.drawLoop);
  dlManager.drawNow = Date.now();
  dlManager.dt = preciseDt - dlManager.t0 || 0;
  dlManager.fps = 1000 / dlManager.dt;
  if (dlManager.isShowFPS) console.log(dlManager.fps);
  dlManager.t0 = preciseDt;
  if (dlManager.fps < 30) {
    updateHoverDelayLimit = settingsManager.updateHoverDelayLimitBig;
  } else if (dlManager.fps < 50) {
    updateHoverDelayLimit = settingsManager.updateHoverDelayLimitSmall;
  } else {
    if (updateHoverDelayLimit > 1) --updateHoverDelayLimit;
  }

  dlManager.time = dlManager.drawNow;
  timeManager.setNow(dlManager.drawNow);
  
  if (objectManager.selectedSat !== -1) {
    dlManager.sat = satSet.getSat(objectManager.selectedSat);
    objectManager.lastSelectedSat(objectManager.selectedSat);
    if (!dlManager.sat.static) {
      cameraManager.camSnapToSat(dlManager.sat);

      if (dlManager.sat.missile || typeof meshManager == 'undefined') {
        settingsManager.selectedColor = [1.0, 0.0, 0.0, 1.0];
      } else {
        settingsManager.selectedColor = [0.0, 0.0, 0.0, 0.0];
      }

      // If 3D Models Available, then update their position on the screen
      if (typeof meshManager !== 'undefined' && !dlManager.sat.missile) {
        // Try to reduce some jitter
        if (
          typeof meshManager.selectedSatPosition !== 'undefined' &&
          meshManager.selectedSatPosition.x > dlManager.sat.position.x - 1.0 &&
          meshManager.selectedSatPosition.x < dlManager.sat.position.x + 1.0 &&
          meshManager.selectedSatPosition.y > dlManager.sat.position.y - 1.0 &&
          meshManager.selectedSatPosition.y < dlManager.sat.position.y + 1.0 &&
          meshManager.selectedSatPosition.z > dlManager.sat.position.z - 1.0 &&
          meshManager.selectedSatPosition.z < dlManager.sat.position.z + 1.0
        ) {
          // Lerp to smooth difference between SGP4 and position+velocity
          meshManager.lerpPosition(dlManager.sat.position, dlManager.drawDt);          
        } else {
          meshManager.updatePosition(dlManager.sat.position);
        }
      }
    }
    if (dlManager.sat.missile) orbitManager.setSelectOrbit(dlManager.sat.satId);
  }
  
  cameraManager.calculate(objectManager.selectedSat, dlManager.dt);      

  if (typeof missileManager != 'undefined' && missileManager.missileArray.length > 0) {
    for (dlManager.i = 0; dlManager.i < missileManager.missileArray.length; dlManager.i++) {
      orbitManager.updateOrbitBuffer(missileManager.missileArray[dlManager.i].id);
    }
  }  

  if (objectManager.selectedSat !== dlManager.lastSelectedSat) {
    selectSat(objectManager.selectedSat);
    if (objectManager.selectedSat !== -1 || (objectManager.selectedSat == -1 && !isselectedSatNegativeOne)) {
      lineManager.drawWhenSelected();
    }
    dlManager.lastSelectedSat = objectManager.selectedSat;
  }

  dlManager.drawScene();
  dlManager.updateHover();
  dlManager.onDrawLoopComplete(dlManager.drawLoopCallback);
  if (settingsManager.isDemoModeOn) _demoMode();  

  if (settingsManager.screenshotMode) {
    webGlInit();
    if (settingsManager.queuedScreenshot) return;

    setTimeout(function () {
      let link = document.createElement('a');
      link.download = 'keeptrack.png';

      let d = new Date();
      let n = d.getFullYear();
      let copyrightStr;
      if (!settingsManager.copyrightOveride) {
        copyrightStr = `©${n} KEEPTRACK.SPACE`;
      } else {
        copyrightStr = '';
      }

      link.href = _watermarkedDataURL(canvasDOM[0], copyrightStr);
      settingsManager.screenshotMode = false;
      settingsManager.queuedScreenshot = false;
      setTimeout(function () {
        link.click();
      }, 10);
      webGlInit();
    }, 200);
    settingsManager.queuedScreenshot = true;
  }
};

// //////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////
//
// End Main Drawing loop
//
// //////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////

/*
function initializeGpuManager () {
  const MINUTES_PER_DAY = 1440;
  let gM = {};
  gM.kern = {};
  gM.transforms = {};
  gM.settings = {};
  gM.settings.steps = 16;
  gM.settings.batchSize = 5;

  gM.gpu = new GPU({
    mode: settingsManager.gpujsMode
  });

  gM.transforms.satrec = (satrec) => {
    let satrecArray = [];
    let i = 0;
    for (var key in satrec) {
      if (satrec.hasOwnProperty(key)) {
        if (key == 'method') {
          let num = (satrec[key] == 'd') ? 1 : 0;
          satrecArray.push(num);
          i++;
          continue;
        }
        if (key == 'init') {
          let num = (satrec[key] == 'y') ? 1 : 0;
          satrecArray.push(num);
          i++;
          continue;
        }
        if (key == 'operationmode') {
          let num = (satrec[key] == 'i') ? 1 : 0;
          satrecArray.push(num);
          i++;
          continue;
        }
        if (key == 'satnum') {
          satrecArray.push(parseInt(satrec[key]));
          i++;
          continue;
        }
        // If None of the above
        satrecArray.push(satrec[key]);
        i++;
        continue;
      }
    }
    while (i < 100) {
      satrecArray.push(0);
      i++;
    }
    return satrecArray;
  };

  gM.getSat = (posArray, satnum) => {
    let id = satSet.sccIndex[satnum];
    let x = posArray[id*4+1][0][0];
    let y = posArray[id*4+2][0][0];
    let z = posArray[id*4+3][0][0];
    console.log(`${x}, ${y}, ${z}`);
  }

  gM.satrecSetup = (numOfSats,offset, now) => {
    now = (now) ? now : new Date();
    offset = (offset) ? offset : 0;

    var j = jday(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
    );
    j += now.getUTCMilliseconds() * 1.15741e-8; // days per millisecond

    let satData = satSet.getSatData();
    let gpuSatRecList = [];
    let timeList = [];
    let satrec;
    for (var i = offset; i < offset + numOfSats; i++) {
      satrec = satellite.twoline2satrec(satData[i].TLE1,satData[i].TLE2);
      // if (satrec.satnum == "39208") debugger
      gpuSatRecList.push(
        gM.transforms.satrec(satrec)
      );

      timeList.push((j - satrec.jdsatepoch) * MINUTES_PER_DAY);
    }
    return [gpuSatRecList,timeList];
  };

  gM.funcs = {};
  gM.funcs.sgp4 = (numOfSats,stepSize) => {
    console.time("gM.funcs.sgp4");
    let resArray = [];
    let res;
    let now = new Date();
    for (var s = 0; s < numOfSats; s=s) {
      let satStartIndex = s;
      let satBatchSize = gM.settings.batchSize;
      if (satStartIndex + gM.settings.batchSize > numOfSats) {
        satBatchSize = numOfSats - satStartIndex;
      }
      s += satBatchSize;

      [satrecList,tsinceList] = gM.satrecSetup(satBatchSize,satStartIndex, now);
      gM.kern.sgp4.setOutput([4,gM.settings.steps,satrecList.length]);
      // [j][t,x,y,z,xdot,ydot,zdot][id]
      try {
        res = gM.kern.sgp4(satrecList,tsinceList,stepSize);
      } catch (e) {
        console.log(s);
        console.debug(e);
      }
      resArray = resArray.concat(res);
    }

    console.timeEnd("gM.funcs.sgp4");
    return resArray;
    // resArray[t,x,y,z][time][batch]
  }
  gM.funcs.sgp42 = (numOfSats,propLength) => {
    // if (satrecList > 100) 'Max 100 satellites at a time!';
    // if (propLength > 60*1440*2) 'Max Two Day Propagation';
    // if (satrecList.length !== tsinceList.length) throw 'Parameters must be same length!';

    let batches = Math.floor(numOfSats / 50);
    let lastBatchSats = numOfSats % 50;
    let tArray = [];
    let xArray = [];
    let yArray = [];
    let zArray = [];
    for (var b = 0; b <= batches; b++) {
      let t = [];
      let x = [];
      let y = [];
      let z = [];
      if (b == batches) { // If Last Batch
        if (lastBatchSats == 0) break;
        [satrecList,tsinceList] = gM.satrecSetup(lastBatchSats,b*50);
      } else {
        [satrecList,tsinceList] = gM.satrecSetup(50,b*50);
      }
      gM.kern.sgp4.setOutput([satrecList.length,propLength,4]);
      // [j][t,x,y,z,xdot,ydot,zdot][id]
      // try {
        [t, x, y, z] = gM.kern.sgp4(satrecList,tsinceList);
      // } catch {
        // debugger
      // }
      tArray = tArray.concat(t);
      xArray = xArray.concat(x);
      yArray = yArray.concat(y);
      zArray = zArray.concat(z);
    }

    return xArray;
  }

  // SGP4 Of Satellites At Same Time Advanced by PropTime
  gM.kern.sgp4 = gM.gpu.createKernel( function(satrecList,tsinceList,stepSize) {
    let t = tsinceList[this.thread.z] + (stepSize * this.thread.y / 60); // per Second
    if (this.thread.x == 0) return t;

    let pi = 3.141592653589793;
    let x2o3 = 2.0 / 3.0;
    let j2 = 0.00108262998905;
    let j3 = -0.00000253215306;
    let j4 = -0.00000161098761;
    let earthRadius = 6378.137; // in km
    let twoPi = pi * 2;
    let deg2rad = pi / 180.0;
    let rad2deg = 180 / pi;
    let minutesPerDay = 1440.0;
    let mu = 398600.5; // in km3 / s2
    let xke = 60.0 / Math.sqrt((earthRadius * earthRadius * earthRadius) / mu);
    let tumin = 1.0 / xke;
    let j3oj2 = j3 / j2;

    var am = 0;
    var axnl = 0;
    var aynl = 0;
    var betal = 0;
    var cosim = 0;
    var sinim = 0;
    var cnod = 0;
    var snod = 0;
    var cos2u = 0;
    var sin2u = 0;
    var coseo1 = 0;
    var sineo1 = 0;
    var cosi = 0;
    var sini = 0;
    var cosip = 0;
    var sinip = 0;
    var cosisq = 0;
    var cossu = 0;
    var sinsu = 0;
    var cosu = 0;
    var sinu = 0;
    var delm = 0;
    var delomg = 0;
    var dndt = 0;
    var emsq = 0;
    var ecose = 0;
    var el2 = 0;
    var eo1 = 0;
    var esine = 0;
    var argpm = 0;
    var argpp = 0;
    var pl = 0;
    var rl = 0;
    var rvdot = 0;
    var rvdotl = 0;
    var su = 0;
    var t2 = 0;
    var t3 = 0;
    var t4 = 0;
    var tc = 0;
    var tem5 = 0;
    var tempvar = 0;
    var temp1 = 0;
    var temp2 = 0;
    var tempa = 0;
    var tempe = 0;
    var templ = 0;
    var u = 0;
    var ux = 0;
    var uy = 0;
    var uz = 0;
    var vx = 0;
    var vy = 0;
    var vz = 0;
    var inclm = 0;
    var mm = 0;
    var nm = 0;
    var nodem = 0;
    var xinc = 0;
    var xincp = 0;
    var xl = 0;
    var xlm = 0;
    var mp = 0;
    var xmdf = 0;
    var xmx = 0;
    var xmy = 0;
    var vnodedf = 0;
    var xnode = 0;
    var nodep = 0;
    let mrt = 0.0;
    var temp = 0;
    var r0 = 0;
    var r1 = 0;
    var r2 = 0;
    var v0 = 0;
    var v1 = 0;
    var v2 = 0;
    var aycof = satrecList[this.thread.z][18];
    var xlcof = satrecList[this.thread.z][40];
    var con41 = satrecList[this.thread.z][19];
    var x1mth2 = satrecList[this.thread.z][36];
    var x7thm1 = satrecList[this.thread.z][37];

    //  ------- update for secular gravity and atmospheric drag -----
    xmdf = satrecList[this.thread.z][10] + satrecList[this.thread.z][38] * t;
    let argpdf = satrecList[this.thread.z][9] + satrecList[this.thread.z][28] * t;
    let nodedf = satrecList[this.thread.z][7] + satrecList[this.thread.z][39] * t;
    argpm = argpdf;
    mm = xmdf;
    t2 = t * t;
    nodem = nodedf + satrecList[this.thread.z][42] * t2;
    tempa = 1.0 - satrecList[this.thread.z][20] * t;
    tempe = satrecList[this.thread.z][5] * satrecList[this.thread.z][21] * t;
    templ = satrecList[this.thread.z][32] * t2;

    if (satrecList[this.thread.z][16] !== 1) {
        delomg = satrecList[this.thread.z][29] * t;
        //  sgp4fix use mutliply for speed instead of pow
        var delmtemp = 1.0 + satrecList[this.thread.z][27] * Math.cos(xmdf);
        delm =
            satrecList[this.thread.z][41] *
            (delmtemp * delmtemp * delmtemp - satrecList[this.thread.z][26]);
        temp = delomg + delm;
        mm = xmdf + temp;
        argpm = argpdf - temp;
        t3 = t2 * t;
        t4 = t3 * t;
        tempa =
            tempa - satrecList[this.thread.z][23] * t2 - satrecList[this.thread.z][24] * t3 - satrecList[this.thread.z][25] * t4;
        tempe =
            tempe +
            satrecList[this.thread.z][5] * satrecList[this.thread.z][22] * (Math.sin(mm) - satrecList[this.thread.z][30]);
        templ =
            templ +
            satrecList[this.thread.z][33] * t3 +
            t4 * (satrecList[this.thread.z][34] + t * satrecList[this.thread.z][35]);
    }
    nm = satrecList[this.thread.z][11];
    var em = satrecList[this.thread.z][8];
    inclm = satrecList[this.thread.z][6];
    if (satrecList[this.thread.z][17] === 1) {
        tc = t;

        var irez = satrecList[this.thread.z][46];
        var d2201 = satrecList[this.thread.z][47];
        var d2211 = satrecList[this.thread.z][48];
        var d3210 = satrecList[this.thread.z][49];
        var d3222 = satrecList[this.thread.z][50];
        var d4410 = satrecList[this.thread.z][51];
        var d4422 = satrecList[this.thread.z][52];
        var d5220 = satrecList[this.thread.z][53];
        var d5232 = satrecList[this.thread.z][54];
        var d5421 = satrecList[this.thread.z][55];
        var d5433 = satrecList[this.thread.z][56];
        var dedt = satrecList[this.thread.z][57];
        var del1 = satrecList[this.thread.z][58];
        var del2 = satrecList[this.thread.z][59];
        var del3 = satrecList[this.thread.z][60];
        var didt = satrecList[this.thread.z][61];
        var dmdt = satrecList[this.thread.z][62];
        var dnodt = satrecList[this.thread.z][63];
        var domdt = satrecList[this.thread.z][64];
        var argpo = satrecList[this.thread.z][9];
        var argpdot = satrecList[this.thread.z][28];
        var gsto = satrecList[this.thread.z][45];
        var xfact = satrecList[this.thread.z][84];
        var xlamo = satrecList[this.thread.z][95];
        var no = satrecList[this.thread.z][11];
        var atime = satrecList[this.thread.z][98];
        var em = em;
        var xli = satrecList[this.thread.z][99];
        var xni = satrecList[this.thread.z][100];

        var fasx2 = 0.13130908;
        var fasx4 = 2.8843198;
        var fasx6 = 0.37448087;
        var g22 = 5.7686396;
        var g32 = 0.95240898;
        var g44 = 1.8014998;
        var g52 = 1.050833;
        var g54 = 4.4108898;
        var rptim = 4.37526908801129966e-3; // equates to 7.29211514668855e-5 rad/sec
        var stepp = 720.0;
        var stepn = -720.0;
        var step2 = 259200.0;

        //  ----------- calculate deep space resonance effects -----------
        dndt = 0.0;
        var theta = (gsto + tc * rptim) % twoPi;
        em = em + dedt * t;

        inclm = inclm + didt * t;
        argpm = argpm + domdt * t;
        nodem = nodem + dnodt * t;
        mm = mm + dmdt * t;

        var ft = 0.0;
        if (irez !== 0) {
            //  sgp4fix streamline check
            if (
                atime === 0.0 ||
                t * atime <= 0.0 ||
                Math.abs(t) < Math.abs(atime)
            ) {
                atime = 0.0;
                xni = no;
                xli = xlamo;
            }

            // sgp4fix move check outside loop
            var delt = 0;
            if (t > 0.0) {
                delt = stepp;
            } else {
                delt = stepn;
            }
            var iretn = 381; // added for do loop
            var iret = 0; // added for loop
            var xndt = 0;
            var xldot = 0;
            var xnddt = 0;
            while (iretn === 381) {
                //  ------------------- dot terms calculated -------------
                //  ----------- near - synchronous resonance terms -------
                if (irez !== 2) {
                    xndt =
                        del1 * Math.sin(xli - fasx2) +
                        del2 * Math.sin(2.0 * (xli - fasx4)) +
                        del3 * Math.sin(3.0 * (xli - fasx6));
                    xldot = xni + xfact;
                    xnddt =
                        del1 * Math.cos(xli - fasx2) +
                        2.0 * del2 * Math.cos(2.0 * (xli - fasx4)) +
                        3.0 * del3 * Math.cos(3.0 * (xli - fasx6));
                    xnddt = xnddt * xldot;
                } else {
                    // --------- near - half-day resonance terms --------
                    var xomi = argpo + argpdot * atime;
                    var x2omi = xomi + xomi;
                    var x2li = xli + xli;
                    xndt =
                        d2201 * Math.sin(x2omi + xli - g22) +
                        d2211 * Math.sin(xli - g22) +
                        d3210 * Math.sin(xomi + xli - g32) +
                        d3222 * Math.sin(-xomi + xli - g32) +
                        d4410 * Math.sin(x2omi + x2li - g44) +
                        d4422 * Math.sin(x2li - g44) +
                        d5220 * Math.sin(xomi + xli - g52) +
                        d5232 * Math.sin(-xomi + xli - g52) +
                        d5421 * Math.sin(xomi + x2li - g54) +
                        d5433 * Math.sin(-xomi + x2li - g54);
                    xldot = xni + xfact;
                    xnddt =
                        d2201 * Math.cos(x2omi + xli - g22) +
                        d2211 * Math.cos(xli - g22) +
                        d3210 * Math.cos(xomi + xli - g32) +
                        d3222 * Math.cos(-xomi + xli - g32) +
                        d5220 * Math.cos(xomi + xli - g52) +
                        d5232 * Math.cos(-xomi + xli - g52) +
                        2.0 *
                            (d4410 * Math.cos(x2omi + x2li - g44) +
                                d4422 * Math.cos(x2li - g44) +
                                d5421 * Math.cos(xomi + x2li - g54) +
                                d5433 * Math.cos(-xomi + x2li - g54));
                    xnddt = xnddt * xldot;
                }
                //  ----------------------- integrator -------------------
                //  sgp4fix move end checks to end of routine
                if (Math.abs(t - atime) >= stepp) {
                    iret = 0;
                    iretn = 381;
                } else {
                    ft = t - atime;
                    iretn = 0;
                }
                if (iretn === 381) {
                    xli = xli + xldot * delt + xndt * step2;
                    xni = xni + xndt * delt + xnddt * step2;
                    atime = atime + delt;
                }
            }
            nm = xni + xndt * ft + xnddt * ft * ft * 0.5;
            xl = xli + xldot * ft + xndt * ft * ft * 0.5;
            if (irez !== 1) {
                mm = xl - 2.0 * nodem + 2.0 * theta;
                dndt = nm - no;
            } else {
                mm = xl - nodem - argpm + theta;
                dndt = nm - no;
            }
            nm = no + dndt;
        }
    }

    if (nm <= 0.0) {
        //  printf("// error nm %f\n", nm);
        // satrecList[this.thread.z].error = 2;
        //  sgp4fix add return
        return nm;
    }
    am = Math.pow(xke / nm, x2o3) * tempa * tempa;
    nm = xke / Math.pow(am, 1.5);
    em = em - tempe;

    //  fix tolerance for error recognition
    //  sgp4fix am is fixed from the previous nm check
    if (em >= 1.0 || em < -0.001) {
        // || (am < 0.95)
        //  printf("// error em %f\n", em);
        // satrecList[this.thread.z].error = 1;
        //  sgp4fix to return if there is an error in eccentricity
        return -401;
    }
    //  sgp4fix fix tolerance to avoid a divide by zero
    if (em < 1.0e-6) {
        em = 1.0e-6;
    }
    mm = mm + satrecList[this.thread.z][11] * templ;
    xlm = mm + argpm + nodem;
    emsq = em * em;
    temp = 1.0 - emsq;

    nodem = nodem % twoPi;
    argpm = argpm % twoPi;
    xlm = xlm % twoPi;
    mm = (xlm - argpm - nodem) % twoPi;

    //  ----------------- compute extra mean quantities -------------
    sinim = Math.sin(inclm);
    cosim = Math.cos(inclm);

    //  -------------------- add lunar-solar periodics --------------
    var ep = em;
    xincp = inclm;
    argpp = argpm;
    nodep = nodem;
    mp = mm;
    sinip = sinim;
    cosip = cosim;
    if (satrecList[this.thread.z][17] === 1) {
        var init = 0;
        var opsmode = satrecList[this.thread.z][43];

        // Copy satellite attributes into local variables for convenience
        // and symmetry in writing formulae.
        var alfdp = 0;
        var betdp = 0;
        var cosop = 0;
        var sinop = 0;
        var dalf = 0;
        var dbet = 0;
        var dls = 0;
        var f2 = 0;
        var f3 = 0;
        var pe = 0;
        var pgh = 0;
        var ph = 0;
        var pinc = 0;
        var sel = 0;
        var ses = 0;
        var sghl = 0;
        var vsghs = 0;
        var vshs = 0;
        var sil = 0;
        var sinzf = 0;
        var sis = 0;
        var sll = 0;
        var sls = 0;
        var xls = 0;
        var xnoh = 0;
        var zf = 0;
        var zm = 0;
        var shll = 0;

        var e3 = satrecList[this.thread.z][65];
        var ee2 = satrecList[this.thread.z][66];
        var peo = satrecList[this.thread.z][67];
        var pgho = satrecList[this.thread.z][68];
        var pho = satrecList[this.thread.z][69];
        var pinco = satrecList[this.thread.z][70];
        var plo = satrecList[this.thread.z][71];
        var se2 = satrecList[this.thread.z][72];
        var se3 = satrecList[this.thread.z][73];
        var sgh2 = satrecList[this.thread.z][74];
        var sgh3 = satrecList[this.thread.z][75];
        var sgh4 = satrecList[this.thread.z][76];
        var sh2 = satrecList[this.thread.z][77];
        var sh3 = satrecList[this.thread.z][78];
        var si2 = satrecList[this.thread.z][79];
        var si3 = satrecList[this.thread.z][80];
        var sl2 = satrecList[this.thread.z][81];
        var sl3 = satrecList[this.thread.z][82];
        var sl4 = satrecList[this.thread.z][83];
        t = satrecList[this.thread.z][31];
        var xgh2 = satrecList[this.thread.z][85];
        var xgh3 = satrecList[this.thread.z][86];
        var xgh4 = satrecList[this.thread.z][87];
        var xh2 = satrecList[this.thread.z][88];
        var xh3 = satrecList[this.thread.z][89];
        var xi2 = satrecList[this.thread.z][90];
        var xi3 = satrecList[this.thread.z][91];
        var xl2 = satrecList[this.thread.z][92];
        var xl3 = satrecList[this.thread.z][93];
        var xl4 = satrecList[this.thread.z][94];
        var zmol = satrecList[this.thread.z][96];
        var zmos = satrecList[this.thread.z][97];

        //  ---------------------- constants -----------------------------
        var zns = 1.19459e-5;
        var zes = 0.01675;
        var znl = 1.5835218e-4;
        var zel = 0.0549;

        //  --------------- calculate time varying periodics -----------
        zm = zmos + zns * t;
        // be sure that the initial call has time set to zero
        if (init === 1) {
            zm = zmos;
        }
        zf = zm + 2.0 * zes * Math.sin(zm);
        sinzf = Math.sin(zf);
        f2 = 0.5 * sinzf * sinzf - 0.25;
        f3 = -0.5 * sinzf * Math.cos(zf);
        ses = se2 * f2 + se3 * f3;
        sis = si2 * f2 + si3 * f3;
        sls = sl2 * f2 + sl3 * f3 + sl4 * sinzf;
        var sghs = sgh2 * f2 + sgh3 * f3 + sgh4 * sinzf;
        var shs = sh2 * f2 + sh3 * f3;
        zm = zmol + znl * t;
        if (init === 1) {
            zm = zmol;
        }

        zf = zm + 2.0 * zel * Math.sin(zm);
        sinzf = Math.sin(zf);
        f2 = 0.5 * sinzf * sinzf - 0.25;
        f3 = -0.5 * sinzf * Math.cos(zf);
        sel = ee2 * f2 + e3 * f3;
        sil = xi2 * f2 + xi3 * f3;
        sll = xl2 * f2 + xl3 * f3 + xl4 * sinzf;
        sghl = xgh2 * f2 + xgh3 * f3 + xgh4 * sinzf;
        shll = xh2 * f2 + xh3 * f3;
        pe = ses + sel;
        pinc = sis + sil;
        pl = sls + sll;
        pgh = sghs + sghl;
        ph = shs + shll;

        if (init === 0) {
            pe = pe - peo;
            pinc = pinc - pinco;
            pl = pl - plo;
            pgh = pgh - pgho;
            ph = ph - pho;
            xincp = xincp + pinc;
            ep = ep + pe;
            sinip = Math.sin(xincp);
            cosip = Math.cos(xincp);

            if (xincp >= 0.2) {
                ph = ph / sinip;
                pgh = pgh - cosip * ph;
                argpp = argpp + pgh;
                nodep = nodep + ph;
                mp = mp + pl;
            } else {
                //  ---- apply periodics with lyddane modification ----
                sinop = Math.sin(nodep);
                cosop = Math.cos(nodep);
                alfdp = sinip * sinop;
                betdp = sinip * cosop;
                dalf = ph * cosop + pinc * cosip * sinop;
                dbet = -ph * sinop + pinc * cosip * cosop;
                alfdp = alfdp + dalf;
                betdp = betdp + dbet;
                nodep = nodep % twoPi;
                //  sgp4fix for afspc written intrinsic functions
                //  nodep used without a trigonometric function ahead
                if (nodep < 0.0 && opsmode === 0) {
                    nodep = nodep + twoPi;
                }
                xls = mp + argpp + cosip * nodep;
                dls = pl + pgh - pinc * nodep * sinip;
                xls = xls + dls;
                xnoh = nodep;
                nodep = Math.atan2(alfdp, betdp);
                //  sgp4fix for afspc written intrinsic functions
                //  nodep used without a trigonometric function ahead
                if (nodep < 0.0 && opsmode === 0) {
                    nodep = nodep + twoPi;
                }
                if (Math.abs(xnoh - nodep) > pi) {
                    if (nodep < xnoh) {
                        nodep = nodep + twoPi;
                    } else {
                        nodep = nodep - twoPi;
                    }
                }
                mp = mp + pl;
                argpp = xls - mp - cosip * nodep;
            }
        }

        if (xincp < 0.0) {
            xincp = -xincp;
            nodep = nodep + pi;
            argpp = argpp - pi;
        }
        if (ep < 0.0 || ep > 1.0) {
            // satrecList[this.thread.z].error = 3;
            //  sgp4fix add return
            return -402;
        }
    }
    //  -------------------- long period periodics ------------------
    if (satrecList[this.thread.z][17] === 1) {
        sinip = Math.sin(xincp);
        cosip = Math.cos(xincp);
        aycof = -0.5 * j3oj2 * sinip;
        //  sgp4fix for divide by zero for xincp = 180 deg
        if (Math.abs(cosip + 1.0) > 1.5e-12) {
            xlcof =
                (-0.25 *
                    j3oj2 *
                    sinip *
                    (3.0 + 5.0 * cosip)) /
                (1.0 + cosip);
        } else {
            xlcof =
                (-0.25 *
                    j3oj2 *
                    sinip *
                    (3.0 + 5.0 * cosip)) /
                1.5e-12;
        }
    }
    axnl = ep * Math.cos(argpp);
    temp = 1.0 / (am * (1.0 - ep * ep));
    aynl = ep * Math.sin(argpp) + temp * aycof;
    xl = mp + argpp + nodep + temp * xlcof * axnl;

    //  --------------------- solve kepler's equation ---------------
    u = (xl - nodep) % twoPi;
    eo1 = u;
    tem5 = 9999.9;
    var ktr = 1;

    //    sgp4fix for kepler iteration
    //    the following iteration needs better limits on corrections
    while (Math.abs(tem5) >= 1.0e-12 && ktr <= 10) {
        sineo1 = Math.sin(eo1);
        coseo1 = Math.cos(eo1);
        tem5 = 1.0 - coseo1 * axnl - sineo1 * aynl;
        tem5 = (u - aynl * coseo1 + axnl * sineo1 - eo1) / tem5;
        if (tem5 > 0.95) {
            tem5 = 0.95;
        } else if (tem5 < -0.95) {
            tem5 = -0.95;
        }
        eo1 = eo1 + tem5;
        ktr = ktr + 1;
    }
    //  ------------- short period preliminary quantities -----------
    ecose = axnl * coseo1 + aynl * sineo1;
    esine = axnl * sineo1 - aynl * coseo1;
    el2 = axnl * axnl + aynl * aynl;
    pl = am * (1.0 - el2);
    if (pl < 0.0) {
        // satrecList[this.thread.z].error = 4;
        //  sgp4fix add return
        return -403;
    } else {
        rl = am * (1.0 - ecose);
        var rdotl = (Math.sqrt(am) * esine) / rl;
        rvdotl = Math.sqrt(pl) / rl;
        betal = Math.sqrt(1.0 - el2);
        temp = esine / (1.0 + betal);
        sinu = (am / rl) * (sineo1 - aynl - axnl * temp);
        cosu = (am / rl) * (coseo1 - axnl + aynl * temp);
        su = Math.atan2(sinu, cosu);
        sin2u = (cosu + cosu) * sinu;
        cos2u = 1.0 - 2.0 * sinu * sinu;
        temp = 1.0 / pl;
        temp1 = 0.5 * j2 * temp;
        temp2 = temp1 * temp;

        //  -------------- update for short period periodics ------------
        if (satrecList[this.thread.z][17] === 1) {
            cosisq = cosip * cosip;
            con41 = 3.0 * cosisq - 1.0;
            x1mth2 = 1.0 - cosisq;
            x7thm1 = 7.0 * cosisq - 1.0;
        }
        mrt =
            rl * (1.0 - 1.5 * temp2 * betal * satrecList[this.thread.z][19]) +
            0.5 * temp1 * satrecList[this.thread.z][36] * cos2u;
        su = su - 0.25 * temp2 * satrecList[this.thread.z][37] * sin2u;
        xnode = nodep + 1.5 * temp2 * cosip * sin2u;
        xinc = xincp + 1.5 * temp2 * cosip * sinip * cos2u;
        var mvt =
            rdotl -
            (nm * temp1 * satrecList[this.thread.z][36] * sin2u) / xke;
        rvdot =
            rvdotl +
            (nm *
                temp1 *
                (satrecList[this.thread.z][36] * cos2u + 1.5 * satrecList[this.thread.z][19])) /
                xke;

        //  --------------------- orientation vectors -------------------
        sinsu = Math.sin(su);
        cossu = Math.cos(su);
        snod = Math.sin(xnode);
        cnod = Math.cos(xnode);
        sini = Math.sin(xinc);
        cosi = Math.cos(xinc);
        xmx = -snod * cosi;
        xmy = cnod * cosi;
        ux = xmx * sinsu + cnod * cossu;
        uy = xmy * sinsu + snod * cossu;
        uz = sini * sinsu;
        vx = xmx * cossu - cnod * sinsu;
        vy = xmy * cossu - snod * sinsu;
        vz = sini * cossu;

        //  --------- position and velocity (in km and km/sec) ----------
        r0 = mrt * ux * earthRadius;
        r1 = mrt * uy * earthRadius;
        r2 = mrt * uz * earthRadius;
        v0 = (mvt * ux + rvdot * vx) * ((earthRadius * xke) / 60.0);
        v1 = (mvt * uy + rvdot * vy) * ((earthRadius * xke) / 60.0);
        v2 = (mvt * uz + rvdot * vz) * ((earthRadius * xke) / 60.0);
    }
    //  sgp4fix for decaying satellites
    if (mrt < 1.0) {
        // satrecList[this.thread.z].error = 6;
        return -404;
    }

    // if (this.thread.y == 0) {
      if (this.thread.x == 1) return r0;
      if (this.thread.x == 2) return r1;
      if (this.thread.x == 3) return r2;
    // } else if (this.thread.y == 1) {
      if (this.thread.x == 4) return v0;
      if (this.thread.x == 5) return v1;
      if (this.thread.x == 6) return v2;
    // }
  },{
    dynamicOutput: true,
    output: [10000,7,1]
  })

  function jday(year, mon, day, hr, minute, sec) {
      'use strict';
      return (
          367.0 * year -
          Math.floor(7 * (year + Math.floor((mon + 9) / 12.0)) * 0.25) +
          Math.floor((275 * mon) / 9.0) +
          day +
          1721013.5 +
          ((sec / 60.0 + minute) / 60.0 + hr) / 24.0 //  ut in days
      );
  };

  // Export
  window.gpuManager = gM;
}
*/

var _watermarkedDataURL = (canvas, text) => {
  var tempCanvas = document.createElement('canvas');
  var tempCtx = tempCanvas.getContext('2d');
  var cw, ch;
  cw = tempCanvas.width = canvas.width;
  ch = tempCanvas.height = canvas.height;
  tempCtx.drawImage(canvas, 0, 0);
  tempCtx.font = '24px nasalization';
  var textWidth = tempCtx.measureText(text).width;
  tempCtx.globalAlpha = 1.0;
  tempCtx.fillStyle = 'white';
  tempCtx.fillText(text, cw - textWidth - 30, ch - 30);
  // tempCtx.fillStyle ='black'
  // tempCtx.fillText(text,cw-textWidth-10+2,ch-20+2)
  // just testing by adding tempCanvas to document
  document.body.appendChild(tempCanvas);
  let image = tempCanvas.toDataURL();
  tempCanvas.parentNode.removeChild(tempCanvas);
  return image;
};

dlManager.drawScene = () => {
  // Drawing ColorIds for Picking Satellites
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  timeManager.setLastTime(timeManager.propTimeVar);
  timeManager.updatePropTime();
  timeManager.setSelectedDate(timeManager.propTimeVar);

  // Don't update the time input unless it is currently being viewed.
  if (timeManager.lastTime - timeManager.propTimeVar < 300 && (settingsManager.isEditTime || !settingsManager.cruncherReady)) {
    $('#datetime-input-tb').val(timeManager.selectedDate.toISOString().slice(0, 10) + ' ' + timeManager.selectedDate.toISOString().slice(11, 19));
  }

  if (cameraManager.cameraType.current == cameraManager.cameraType.astronomy || cameraManager.cameraType.current == cameraManager.cameraType.planetarium) {
    dlManager.sensorPos = _calculateSensorPos(sensorManager.currentSensor);
    _showOrbitsAbove();
  } else {
    dlManager.sensorPos = null;
  }

  // Hide satMiniBoxes When Not in Use
  if (!settingsManager.isSatLabelModeOn || cameraManager.cameraType.current !== cameraManager.cameraType.planetarium) {
    if (isSatMiniBoxInUse) {
      satMiniBox.innerHTML = '';
    }
    isSatMiniBoxInUse = false;
  }

  cameraManager.update(dlManager.sat, dlManager.sensorPos);
  if (cameraManager.cameraType.current == cameraManager.cameraType.satellite) orbitManager.updateOrbitBuffer(objectManager.lastSelectedSat());

  gl.useProgram(gl.pickShaderProgram);
  gl.uniformMatrix4fv(gl.pickShaderProgram.uPMatrix, false, pMatrix);
  gl.uniformMatrix4fv(gl.pickShaderProgram.camMatrix, false, cameraManager.camMatrix);

  // Draw Scene
  // gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  earth.update();
  if (dlManager.fps > settingsManager.fpsThrottle1) {
    if (!settingsManager.enableLimitedUI && !settingsManager.isDrawLess) {
      sun.draw(pMatrix, cameraManager.camMatrix);
      // Disabling Moon Until it is Fixed
      moon.draw(pMatrix, cameraManager.camMatrix);
    }
  } else {
    console.log(dlManager.fps);
  }
  if (!settingsManager.enableLimitedUI && !settingsManager.isDrawLess && cameraManager.cameraType.current !== cameraManager.cameraType.planetarium && cameraManager.cameraType.current !== cameraManager.cameraType.astronomy) {
    atmosphere.update();
    atmosphere.draw(pMatrix, cameraManager.camMatrix);
  }
  earth.draw(pMatrix, cameraManager.camMatrix);
  satSet.draw(pMatrix, cameraManager.camMatrix);
  orbitManager.draw(pMatrix, cameraManager.camMatrix);

  lineManager.draw();
  
  if (objectManager.selectedSat !== -1 && settingsManager.enableConstantSelectedSatRedraw) {
    orbitManager.clearSelectOrbit();
    orbitManager.setSelectOrbit(objectManager.selectedSat);    
  }  

  // Draw Satellite if Selected
  if (objectManager.selectedSat !== -1 && typeof meshManager != 'undefined' && meshManager.isReady) {
    let sat = dlManager.sat;
    // If 3D Models Available, then draw them on the screen
    if (typeof meshManager !== 'undefined' && (settingsManager.modelsOnSatelliteViewOverride || cameraManager.cameraType.current !== cameraManager.cameraType.satellite)) {
      if (!sat.static) {        
        if (sat.SCC_NUM == 25544) {
          meshManager.models.iss.position = meshManager.selectedSatPosition;
          dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
          meshManager.drawObject(meshManager.models.iss, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
          return;
        }

        if (sat.OT == 1) {
          // Default Satellite
          if (sat.ON.slice(0, 5) == 'FLOCK' || sat.ON.slice(0, 5) == 'LEMUR') {
            meshManager.models.s3u.position = meshManager.selectedSatPosition;
            dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
            meshManager.drawObject(meshManager.models.s3u, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
            return;
          }
          if (sat.ON.slice(0, 8) == 'STARLINK') {
            meshManager.models.starlink.position = meshManager.selectedSatPosition;
            dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
            meshManager.drawObject(meshManager.models.starlink, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
            return;
          }

          if (sat.ON.slice(0, 10) == 'GLOBALSTAR') {
            meshManager.models.globalstar.position = meshManager.selectedSatPosition;
            dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
            meshManager.drawObject(meshManager.models.globalstar, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
            return;
          }

          if (sat.ON.slice(0, 7) == 'IRIDIUM') {
            meshManager.models.iridium.position = meshManager.selectedSatPosition;
            dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
            meshManager.drawObject(meshManager.models.iridium, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
            return;
          }

          if (sat.ON.slice(0, 7) == 'ORBCOMM') {
            meshManager.models.orbcomm.position = meshManager.selectedSatPosition;
            dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
            meshManager.drawObject(meshManager.models.orbcomm, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
            return;
          }

          if (sat.ON.slice(0, 3) == 'O3B') {
            meshManager.models.o3b.position = meshManager.selectedSatPosition;
            dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
            meshManager.drawObject(meshManager.models.o3b, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
            return;
          }

          // Is this a GPS Satellite (Called NAVSTAR)
          if (sat.ON.slice(0, 7) == 'NAVSTAR' || sat.ON.slice(10, 17) == 'NAVSTAR') {
            meshManager.models.gps.position = meshManager.selectedSatPosition;
            dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
            meshManager.drawObject(meshManager.models.gps, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
            return;
          }

          // Is this a Galileo Satellite
          if (sat.ON.slice(0, 7) == 'GALILEO') {
            meshManager.models.galileo.position = meshManager.selectedSatPosition;
            dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
            meshManager.drawObject(meshManager.models.galileo, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
            return;
          }

          // Is this a DSP Satellite?
          if (
            sat.SCC_NUM == '04630' ||
            sat.SCC_NUM == '05204' ||
            sat.SCC_NUM == '05851' ||
            sat.SCC_NUM == '06691' ||
            sat.SCC_NUM == '08482' ||
            sat.SCC_NUM == '08916' ||
            sat.SCC_NUM == '09803' ||
            sat.SCC_NUM == '11397' ||
            sat.SCC_NUM == '12339' ||
            sat.SCC_NUM == '13086' ||
            sat.SCC_NUM == '14930' ||
            sat.SCC_NUM == '15453' ||
            sat.SCC_NUM == '18583' ||
            sat.SCC_NUM == '20066' ||
            sat.SCC_NUM == '20929' ||
            sat.SCC_NUM == '21805' ||
            sat.SCC_NUM == '23435' ||
            sat.SCC_NUM == '24737' ||
            sat.SCC_NUM == '26356' ||
            sat.SCC_NUM == '26880' ||
            sat.SCC_NUM == '28158'
          ) {
            meshManager.models.dsp.position = meshManager.selectedSatPosition;
            dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
            meshManager.drawObject(meshManager.models.dsp, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
            return;
          }

          // Is this an AEHF Satellite?
          if (sat.SCC_NUM == '36868' || sat.SCC_NUM == '38254' || sat.SCC_NUM == '39256' || sat.SCC_NUM == '43651' || sat.SCC_NUM == '44481' || sat.SCC_NUM == '45465') {
            meshManager.models.aehf.position = meshManager.selectedSatPosition;
            dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
            meshManager.drawObject(meshManager.models.aehf, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
            return;
          }

          // Is this a 1U Cubesat?
          if (parseFloat(sat.R) < 0.1 && parseFloat(sat.R) > 0.04) {
            meshManager.models.s1u.position = meshManager.selectedSatPosition;
            dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
            meshManager.drawObject(meshManager.models.s1u, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
            return;
          }
          if (parseFloat(sat.R) < 0.22 && parseFloat(sat.R) >= 0.1) {
            meshManager.models.s2u.position = meshManager.selectedSatPosition;
            dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
            meshManager.drawObject(meshManager.models.s2u, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
            return;
          }
          if (parseFloat(sat.R) < 0.33 && parseFloat(sat.R) >= 0.22) {
            meshManager.models.s3u.position = meshManager.selectedSatPosition;
            dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
            meshManager.drawObject(meshManager.models.s3u, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
            return;
          }
          // Generic Model
          meshManager.models.sat2.position = meshManager.selectedSatPosition;
          dlManager.nadirYaw = cameraManager.longToYaw(sat.getTEARR().lon * mathValue.RAD2DEG, timeManager.selectedDate) + 180 * mathValue.DEG2RAD;
          meshManager.drawObject(meshManager.models.sat2, pMatrix, cameraManager.camMatrix, sat.isInSun(), dlManager.nadirYaw);
          return;
        }

        if (sat.OT == 2) {
          // Rocket Body
          meshManager.models.rocketbody.position = meshManager.selectedSatPosition;
          meshManager.drawObject(meshManager.models.rocketbody, pMatrix, cameraManager.camMatrix, sat.isInSun(), null);
          return;
        }

        if (sat.OT == 3) {
          if (sat.SCC_NUM <= 20000) {
            // Debris
            meshManager.models.debris0.position = meshManager.selectedSatPosition;
            meshManager.drawObject(meshManager.models.debris0, pMatrix, cameraManager.camMatrix, sat.isInSun(), null);
            return;
          } else if (sat.SCC_NUM <= 35000) {
            // Debris
            meshManager.models.debris1.position = meshManager.selectedSatPosition;
            meshManager.drawObject(meshManager.models.debris1, pMatrix, cameraManager.camMatrix, sat.isInSun(), null);
            return;
          } else if (sat.SCC_NUM > 35000) {
            // Debris
            meshManager.models.debris2.position = meshManager.selectedSatPosition;
            meshManager.drawObject(meshManager.models.debris2, pMatrix, cameraManager.camMatrix, sat.isInSun(), null);
            return;
          }
        }
      }
    }
  }

  /* DEBUG - show the pickbuffer on a canvas */
  // debugImageData.data = pickColorMap
  /* debugImageData.data.set(pickColorMap)
    debugContext.putImageData(debugImageData, 0, 0) */
};

var _calculateSensorPos = (sensor) => {
  var now = timeManager.propTime();
  var jday = (year, mon, day, hr, minute, sec) => 367.0 * year - Math.floor(7 * (year + Math.floor((mon + 9) / 12.0)) * 0.25) + Math.floor((275 * mon) / 9.0) + day + 1721013.5 + ((sec / 60.0 + minute) / 60.0 + hr) / 24.0; //  ut in days
  var j = jday(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );
  j += now.getUTCMilliseconds() * 1.15741e-8; // days per millisecond
  var gmst = satellite.gstime(j);

  var cosLat = Math.cos(sensor.lat * mathValue.DEG2RAD);
  var sinLat = Math.sin(sensor.lat * mathValue.DEG2RAD);
  var cosLon = Math.cos(sensor.long * mathValue.DEG2RAD + gmst);
  var sinLon = Math.sin(sensor.long * mathValue.DEG2RAD + gmst);

  let pos = {};
  pos.x = (mathValue.RADIUS_OF_EARTH + mathValue.PLANETARIUM_DIST) * cosLat * cosLon;
  pos.y = (mathValue.RADIUS_OF_EARTH + mathValue.PLANETARIUM_DIST) * cosLat * sinLon;
  pos.z = (mathValue.RADIUS_OF_EARTH + mathValue.PLANETARIUM_DIST) * sinLat;
  pos.gmst = gmst;
  pos.lat = sensor.lat;
  pos.long = sensor.long;
  return pos;
};

var satLabelModeLastTime = 0;
var isSatMiniBoxInUse = false;
var labelCount;
var hoverBoxOnSatMiniElements = [];
var satHoverMiniDOM;
var _showOrbitsAbove = () => {
  if (!settingsManager.isSatLabelModeOn || cameraManager.cameraType.current !== cameraManager.cameraType.planetarium) {
    if (isSatMiniBoxInUse) {
      $('#sat-minibox').html('');
    }
    isSatMiniBoxInUse = false;
    return;
  }

  if (sensorManager.currentSensor.lat == null) return;
  if (dlManager.drawNow - satLabelModeLastTime < settingsManager.satLabelInterval) return;

  orbitManager.clearInViewOrbit();

  var sat;
  labelCount = 0;
  isHoverBoxVisible = true;

  hoverBoxOnSatMiniElements = document.getElementById('sat-minibox');
  hoverBoxOnSatMiniElements.innerHTML = '';
  for (var i = 0; i < satSet.orbitalSats && labelCount < settingsManager.maxLabels; i++) {
    sat = satSet.getSatPosOnly(i);

    if (sat.static) continue;
    if (sat.missile) continue;
    if (sat.OT === 1 && ColorScheme.objectTypeFlags.payload === false) continue;
    if (sat.OT === 2 && ColorScheme.objectTypeFlags.rocketBody === false) continue;
    if (sat.OT === 3 && ColorScheme.objectTypeFlags.debris === false) continue;
    if (sat.inview && ColorScheme.objectTypeFlags.inFOV === false) continue;

    satSet.getScreenCoords(i, pMatrix, cameraManager.camMatrix, sat.position);
    if (satScreenPositionArray.error) continue;
    if (typeof satScreenPositionArray.x == 'undefined' || typeof satScreenPositionArray.y == 'undefined') continue;
    if (satScreenPositionArray.x > window.innerWidth || satScreenPositionArray.y > window.innerHeight) continue;

    // Draw Orbits
    if (!settingsManager.isShowSatNameNotOrbit) {
      orbitManager.addInViewOrbit(i);
    }

    // Draw Sat Labels
    // if (!settingsManager.enableHoverOverlay) continue
    satHoverMiniDOM = document.createElement('div');
    satHoverMiniDOM.id = 'sat-minibox-' + i;
    satHoverMiniDOM.textContent = sat.SCC_NUM;
    satHoverMiniDOM.setAttribute('style', 'display: block; position: absolute; left: ' + satScreenPositionArray.x + 10 + 'px; top: ' + satScreenPositionArray.y + 'px');
    hoverBoxOnSatMiniElements.appendChild(satHoverMiniDOM);
    labelCount++;
  }
  isSatMiniBoxInUse = true;
  satLabelModeLastTime = dlManager.drawNow;
};

var currentSearchSats;
dlManager.updateHover = () => {
  if (!settingsManager.disableUI && !settingsManager.lowPerf) {
    currentSearchSats = searchBox.getLastResultGroup();
    if (typeof currentSearchSats !== 'undefined') {
      currentSearchSats = currentSearchSats['sats'];
      for (dlManager.i = 0; dlManager.i < currentSearchSats.length; dlManager.i++) {
        orbitManager.updateOrbitBuffer(currentSearchSats[dlManager.i].satId);
      }
    }
  }
  if (!settingsManager.disableUI && searchBox.isHovering()) {
    updateHoverSatId = searchBox.getHoverSat();
    satSet.getScreenCoords(updateHoverSatId, pMatrix, cameraManager.camMatrix);
    // if (!_earthHitTest(satScreenPositionArray.x, satScreenPositionArray.y)) {
    try {
      _hoverBoxOnSat(updateHoverSatId, satScreenPositionArray.x, satScreenPositionArray.y);
    } catch (e) {
      // Intentionally Empty
    }
    // } else {
    //   _hoverBoxOnSat(-1, 0, 0)
    // }
  } else {
    if (!isMouseMoving || cameraManager.isDragging || settingsManager.isMobileModeEnabled) {
      return;
    }

    // gl.readPixels in getSatIdFromCoord creates a lot of jank
    // Earlier in the loop we decided how much to throttle updateHover
    // if we skip it this loop, we want to still draw the last thing
    // it was looking at

    if (++updateHoverDelay >= updateHoverDelayLimit) {
      updateHoverDelay = 0;
      mouseSat = getSatIdFromCoord(mouseX, mouseY);
    }

    if (settingsManager.enableHoverOrbits) {
      if (mouseSat !== -1) {
        orbitManager.setHoverOrbit(mouseSat);
      } else {
        orbitManager.clearHoverOrbit();
      }
      satSet.setHover(mouseSat);
    }
    if (settingsManager.enableHoverOverlay) {
      _hoverBoxOnSat(mouseSat, mouseX, mouseY);
    }
  }
  // Related to the currently disabled raycast
  // eslint-disable-next-line no-unused-vars
  var _earthHitTest = (x, y) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
    gl.readPixels(x, gl.drawingBufferHeight - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pickColorBuf);

    return pickColorBuf[0] === 0 && pickColorBuf[1] === 0 && pickColorBuf[2] === 0;
  };
};
let sat2;
var _hoverBoxOnSat = (satId, satX, satY) => {
  if (cameraManager.cameraType.current === cameraManager.cameraType.planetarium && !settingsManager.isDemoModeOn) {
    satHoverBoxDOM.css({ display: 'none' });
    if (satId === -1) {
      canvasDOM.css({ cursor: 'default' });
    } else {
      canvasDOM.css({ cursor: 'pointer' });
    }
    return;
  }
  if (satId === -1) {
    if (!isHoverBoxVisible || !settingsManager.enableHoverOverlay) return;
    if (objectManager.isStarManagerLoaded) {
      if (starManager.isConstellationVisible === true && !starManager.isAllConstellationVisible) starManager.clearConstellations();
    }
    // satHoverBoxDOM.html('(none)')
    satHoverBoxDOM.css({ display: 'none' });
    canvasDOM.css({ cursor: 'default' });
    isHoverBoxVisible = false;
  } else if (!cameraManager.isDragging && !!settingsManager.enableHoverOverlay) {
    var sat = satSet.getSatExtraOnly(satId);
    isHoverBoxVisible = true;
    if (sat.static || sat.isRadarData) {
      if (sat.type === 'Launch Facility') {
        var launchSite = objectManager.extractLaunchSite(sat.name);
        satHoverBoxNode1.textContent = launchSite.site + ', ' + launchSite.sitec;
        satHoverBoxNode2.innerHTML = sat.type + satellite.distance(sat, objectManager.selectedSatData) + '';
        satHoverBoxNode3.textContent = '';
      } else if (sat.isRadarData) {
        satHoverBoxNode1.innerHTML = 'Measurement: ' + sat.mId + '</br>Track: ' + sat.trackId + '</br>Object: ' + sat.objectId;
        if (sat.missileComplex !== -1) {
          satHoverBoxNode1.innerHTML += '</br>Missile Complex: ' + sat.missileComplex;
          satHoverBoxNode1.innerHTML += '</br>Missile Object: ' + sat.missileObject;
        }
        if (sat.satId !== -1) satHoverBoxNode1.innerHTML += '</br>Satellite: ' + sat.satId;
        if (typeof sat.rae == 'undefined' && sensorManager.currentSensor !== sensorManager.defaultSensor) {
          sat.rae = satellite.eci2Rae(sat.t, sat, sensorManager.currentSensor);
          sat.setRAE(sat.rae);
        }
        if (sensorManager.currentSensor !== sensorManager.defaultSensor) {
          let measurementDate = new Date(sat.t);
          satHoverBoxNode2.innerHTML =
            `JDAY: ${timeManager.getDayOfYear(measurementDate)} - ${measurementDate.toLocaleString('en-GB', { timeZone: 'UTC' }).slice(-8)}` +
            '</br>' +
            'R: ' +
            sat.rae.range.toFixed(2) +
            ' A: ' +
            sat.rae.az.toFixed(2) +
            ' E: ' +
            sat.rae.el.toFixed(2);
        } else {
          let measurementDate = new Date(sat.t);
          satHoverBoxNode2.innerHTML = `JDAY: ${timeManager.getDayOfYear(measurementDate)} - ${measurementDate.toLocaleString('en-GB', { timeZone: 'UTC' }).slice(-8)}`;
        }
        satHoverBoxNode3.innerHTML = 'RCS: ' + sat.rcs.toFixed(2) + ' m^2 (' + (10 ** (sat.rcs / 10)).toFixed(2) + ' dBsm)</br>Az Error: ' + sat.azError.toFixed(2) + '° El Error: ' + sat.elError.toFixed(2) + '°';
      } else if (sat.type === 'Control Facility') {
        satHoverBoxNode1.textContent = sat.name;
        satHoverBoxNode2.innerHTML = sat.typeExt + satellite.distance(sat, objectManager.selectedSatData) + '';
        satHoverBoxNode3.textContent = '';
      } else if (sat.type === 'Star') {
        if (starManager.findStarsConstellation(sat.name) !== null) {
          satHoverBoxNode1.innerHTML = sat.name + '</br>' + starManager.findStarsConstellation(sat.name);
        } else {
          satHoverBoxNode1.textContent = sat.name;
        }
        satHoverBoxNode2.innerHTML = sat.type;
        satHoverBoxNode3.innerHTML = 'RA: ' + sat.ra.toFixed(3) + ' deg </br> DEC: ' + sat.dec.toFixed(3) + ' deg';
        if (objectManager.lasthoveringSat !== satId) {
          starManager.drawConstellations(starManager.findStarsConstellation(sat.name));
        }        
      } else {
        satHoverBoxNode1.textContent = sat.name;
        satHoverBoxNode2.innerHTML = sat.type + satellite.distance(sat, objectManager.selectedSatData) + '';
        satHoverBoxNode3.textContent = '';
      }
    } else if (sat.missile) {
      satHoverBoxNode1.innerHTML = sat.ON + '<br >' + sat.desc + '';
      satHoverBoxNode2.textContent = '';
      satHoverBoxNode3.textContent = '';
    } else {
      if (!settingsManager.enableHoverOverlay) return;
      // Use this as a default if no UI
      if (settingsManager.disableUI) {
        satHoverBoxNode1.textContent = sat.ON;
        satHoverBoxNode2.textContent = sat.SCC_NUM;
        satHoverBoxNode3.textContent = objectManager.extractCountry(sat.C);
      } else {
        if (objectManager.isSensorManagerLoaded && sensorManager.currentSensor.lat != null && isShowNextPass && isShowDistance) {
          satHoverBoxNode1.textContent = sat.ON;
          satHoverBoxNode2.textContent = sat.SCC_NUM;
          satHoverBoxNode3.innerHTML = satellite.nextpass(sat) + satellite.distance(sat, satSet.getSat(objectManager.selectedSat)) + '';
        } else if (isShowDistance) {
          satHoverBoxNode1.textContent = sat.ON;
          sat2 = satSet.getSat(objectManager.selectedSat);
          satHoverBoxNode2.innerHTML = sat.SCC_NUM + satellite.distance(sat, sat2) + '';
          if (sat2 !== null && sat !== sat2) {
            satHoverBoxNode3.innerHTML =
              'X: ' +
              sat.position.x.toFixed(2) +
              ' Y: ' +
              sat.position.y.toFixed(2) +
              ' Z: ' +
              sat.position.z.toFixed(2) +
              '</br>' +
              'ΔX: ' +
              (sat.velocity.x - sat2.velocity.x).toFixed(2) +
              'km/s ΔY: ' +
              (sat.velocity.y - sat2.velocity.y).toFixed(2) +
              'km/s ΔZ: ' +
              (sat.velocity.z - sat2.velocity.z).toFixed(2) +
              'km/s';
          } else {
            satHoverBoxNode3.innerHTML =
              'X: ' +
              sat.position.x.toFixed(2) +
              ' km' +
              ' Y: ' +
              sat.position.y.toFixed(2) +
              ' km' +
              ' Z: ' +
              sat.position.z.toFixed(2) +
              ' km' +
              '</br>' +
              'XDot: ' +
              sat.velocity.x.toFixed(2) +
              ' km/s' +
              ' YDot: ' +
              sat.velocity.y.toFixed(2) +
              ' km/s' +
              ' ZDot: ' +
              sat.velocity.z.toFixed(2) +
              ' km/s';
          }
        } else if (objectManager.isSensorManagerLoaded && sensorManager.currentSensor.lat != null && isShowNextPass) {
          satHoverBoxNode1.textContent = sat.ON;
          satHoverBoxNode2.textContent = sat.SCC_NUM;
          satHoverBoxNode3.textContent = satellite.nextpass(sat);
        } else {
          satHoverBoxNode1.textContent = sat.ON;
          satHoverBoxNode2.textContent = sat.SCC_NUM;
          satHoverBoxNode3.innerHTML =
            'X: ' + sat.position.x.toFixed(2) + ' Y: ' + sat.position.y.toFixed(2) + ' Z: ' + sat.position.z.toFixed(2) + '</br>X: ' + sat.velocity.x.toFixed(2) + ' Y: ' + sat.velocity.y.toFixed(2) + ' Z: ' + sat.velocity.z.toFixed(2);
        }
      }
    }

    objectManager.setLasthoveringSat = (objectManager.hoveringSat);

    satHoverBoxDOM.css({
      'display': 'block',
      'text-align': 'center',
      'position': 'fixed',
      'left': satX + 20,
      'top': satY - 10,
    });
    canvasDOM.css({ cursor: 'pointer' });
  }
};
dlManager.onDrawLoopComplete = (cb) => {
  if (typeof cb == 'undefined') return;
  cb();
};

var demoModeLastTime = 0;
var _demoMode = () => {
  if (objectManager.isSensorManagerLoaded && sensorManager.currentSensor.lat == null) return;
  if (dlManager.drawNow - demoModeLastTime < settingsManager.demoModeInterval) return;

  dlManager.demoModeLast = dlManager.drawNow;

  if (dlManager.demoModeSatellite === satSet.getSatData().length) dlManager.demoModeSatellite = 0;
  let satData = satSet.getSatData();
  for (dlManager.i = dlManager.demoModeSatellite; dlManager.i < satData.length; dlManager.i++) {
    dlManager.sat = satData[dlManager.i];
    if (dlManager.sat.static) continue;
    if (dlManager.sat.missile) continue;
    // if (!dlManager.sat.inview) continue
    if (dlManager.sat.OT === 1 && ColorScheme.objectTypeFlags.payload === false) continue;
    if (dlManager.sat.OT === 2 && ColorScheme.objectTypeFlags.rocketBody === false) continue;
    if (dlManager.sat.OT === 3 && ColorScheme.objectTypeFlags.debris === false) continue;
    if (dlManager.sat.inview && ColorScheme.objectTypeFlags.inFOV === false) continue;
    satSet.getScreenCoords(dlManager.i, pMatrix, cameraManager.camMatrix);
    if (satScreenPositionArray.error) continue;
    if (typeof satScreenPositionArray.x == 'undefined' || typeof satScreenPositionArray.y == 'undefined') continue;
    if (satScreenPositionArray.x > window.innerWidth || satScreenPositionArray.y > window.innerHeight) continue;
    _hoverBoxOnSat(dlManager.i, satScreenPositionArray.x, satScreenPositionArray.y);
    orbitManager.setSelectOrbit(dlManager.i);
    dlManager.demoModeSatellite = dlManager.i + 1;
    return;
  }
};

// eslint-disable-next-line no-unused-vars
var _fixDpi = (canvas, dpi) => {
  //create a style object that returns width and height
  let style = {
    height() {
      return +getComputedStyle(canvas).getPropertyValue('height').slice(0, -2);
    },
    width() {
      return +getComputedStyle(canvas).getPropertyValue('width').slice(0, -2);
    },
  };
  //set the correct attributes for a crystal clear image!
  canvas.setAttribute('width', style.width() * dpi);
  canvas.setAttribute('height', style.height() * dpi);
};

// Reinitialize the canvas on mobile rotation
$(window).bind('orientationchange', function () {
  console.log('rotate');
  mobile.isRotationEvent = true;
});

cameraManager.webGlInit = () => webGlInit();
var webGlInit = () => {
  db.log('webGlInit');
  let can = canvasDOM[0];
  let dpi;
  if (typeof settingsManager.dpi != 'undefined') {
    dpi = settingsManager.dpi;
  } else {
    dpi = window.devicePixelRatio;
    settingsManager.dpi = dpi;
  }

  // Using minimum allows the canvas to be full screen without fighting with
  // scrollbars
  let cw = document.documentElement.clientWidth || 0;
  let iw = window.innerWidth || 0;
  var vw = Math.min.apply(null, [cw, iw].filter(Boolean));
  var vh = Math.min(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  // If taking a screenshot then resize no matter what to get high resolution
  if (settingsManager.screenshotMode) {
    can.width = settingsManager.hiResWidth;
    can.height = settingsManager.hiResHeight;
  } else {
    // If not autoresizing then don't do anything to the canvas
    if (settingsManager.isAutoResizeCanvas) {
      // If this is a cellphone avoid the keyboard forcing resizes but
      // always resize on rotation
      if (settingsManager.isMobileModeEnabled) {
        // Changes more than 35% of height but not due to rotation are likely
        // the keyboard! Ignore them
        if ((((vw - can.width) / can.width) * 100 < 1 && ((vh - can.height) / can.height) * 100 < 1) || mobile.isRotationEvent || mobile.forceResize) {
          can.width = vw;
          can.height = vh;
          mobile.forceResize = false;
          mobile.isRotationEvent = false;
        }
      } else {
        can.width = vw;
        can.height = vh;
      }
    }
  }

  if (settingsManager.satShader.isUseDynamicSizing) {
    settingsManager.satShader.dynamicSize = (1920 / can.width) * settingsManager.satShader.dynamicSizeScalar * settingsManager.dpi;
    settingsManager.satShader.minSize = Math.max(settingsManager.satShader.minSize, settingsManager.satShader.dynamicSize);
  }

  if (!settingsManager.disableUI) {
    gl =
      can.getContext('webgl', {
        alpha: false,
        premultipliedAlpha: false,
        desynchronized: true, // Desynchronized Fixed Jitter on Old Computer
        antialias: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
        stencil: false,
      }) || // Or...
      can.getContext('experimental-webgl', {
        alpha: false,
        premultipliedAlpha: false,
        desynchronized: true, // Desynchronized Fixed Jitter on Old Computer
        antialias: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
        stencil: false,
      });
  } else {
    gl =
      can.getContext('webgl', {
        alpha: false,
        desynchronized: true, // Desynchronized Fixed Jitter on Old Computer
      }) || // Or...
      can.getContext('experimental-webgl', {
        alpha: false,
        desynchronized: true, // Desynchronized Fixed Jitter on Old Computer
      });
  }
  if (!gl) {
    db.log('browserUnsupported');
    $('#canvas-holder').hide();
    $('#no-webgl').css('display', 'block');
  }

  gl.getExtension('EXT_frag_depth');

  gl.viewport(0, 0, can.width, can.height);

  gl.enable(gl.DEPTH_TEST);

  // Reinitialize GPU Picking Buffers
  initGPUPicking();

  window.gl = gl;
};

var pick = {};
pick.shader = {
  vert: `
        attribute vec3 aPos;
        attribute vec3 aColor;
        attribute float aPickable;

        uniform mat4 uCamMatrix;
        uniform mat4 uMvMatrix;
        uniform mat4 uPMatrix;

        varying vec3 vColor;

        void main(void) {
        float dotSize = 16.0;
        vec4 position = uPMatrix * uCamMatrix *  uMvMatrix * vec4(aPos, 1.0);
        gl_Position = position;
        gl_PointSize = dotSize * aPickable;
        vColor = aColor * aPickable;
        }
    `,
  frag: `
        precision mediump float;

        varying vec3 vColor;

        void main(void) {
            gl_FragColor = vec4(vColor, 1.0);
        }
    `,
};

var initGPUPicking = () => {
  var pFragShader = gl.createShader(gl.FRAGMENT_SHADER);
  var pFragCode = pick.shader.frag;
  gl.shaderSource(pFragShader, pFragCode);
  gl.compileShader(pFragShader);

  var pVertShader = gl.createShader(gl.VERTEX_SHADER);
  var pVertCode = pick.shader.vert;
  gl.shaderSource(pVertShader, pVertCode);
  gl.compileShader(pVertShader);

  var pickShaderProgram = gl.createProgram();
  gl.attachShader(pickShaderProgram, pVertShader);
  gl.attachShader(pickShaderProgram, pFragShader);
  gl.linkProgram(pickShaderProgram);

  pickShaderProgram.aPos = gl.getAttribLocation(pickShaderProgram, 'aPos');
  pickShaderProgram.aColor = gl.getAttribLocation(pickShaderProgram, 'aColor');
  pickShaderProgram.aPickable = gl.getAttribLocation(pickShaderProgram, 'aPickable');
  pickShaderProgram.uCamMatrix = gl.getUniformLocation(pickShaderProgram, 'uCamMatrix');
  pickShaderProgram.uMvMatrix = gl.getUniformLocation(pickShaderProgram, 'uMvMatrix');
  pickShaderProgram.uPMatrix = gl.getUniformLocation(pickShaderProgram, 'uPMatrix');

  gl.pickShaderProgram = pickShaderProgram;

  pickFb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, pickFb);

  pickTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, pickTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // makes clearing work
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  var rb = gl.createRenderbuffer(); // create RB to store the depth buffer
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickTex, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);

  gl.pickFb = pickFb;

  pickColorBuf = new Uint8Array(4);

  pMatrix = glm.mat4.create();
  glm.mat4.perspective(pMatrix, settingsManager.fieldOfView, gl.drawingBufferWidth / gl.drawingBufferHeight, settingsManager.zNear, settingsManager.zFar);
  var eciToOpenGlMat = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];
  glm.mat4.mul(pMatrix, pMatrix, eciToOpenGlMat); // pMat = pMat * ecioglMat
};

var _unProject = (mx, my) => {
  glScreenX = (mx / gl.drawingBufferWidth) * 2 - 1.0;
  glScreenY = 1.0 - (my / gl.drawingBufferHeight) * 2;
  screenVec = [glScreenX, glScreenY, -0.01, 1.0]; // gl screen coords

  comboPMat = glm.mat4.create();
  glm.mat4.mul(comboPMat, pMatrix, cameraManager.camMatrix);
  invMat = glm.mat4.create();
  glm.mat4.invert(invMat, comboPMat);
  worldVec = glm.vec4.create();
  glm.vec4.transformMat4(worldVec, screenVec, invMat);

  return [worldVec[0] / worldVec[3], worldVec[1] / worldVec[3], worldVec[2] / worldVec[3]];
};
var getSatIdFromCoord = (x, y) => {
  // OPTIMIZE: Find a way to do this without using gl.readPixels!
  gl.bindFramebuffer(gl.FRAMEBUFFER, gl.pickFb);
  gl.readPixels(x, gl.drawingBufferHeight - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pickColorBuf);
  return ((pickColorBuf[2] << 16) | (pickColorBuf[1] << 8) | pickColorBuf[0]) - 1;
};
var getEarthScreenPoint = (x, y) => {
  rayOrigin = cameraManager.getCamPos();
  ptThru = _unProject(x, y);

  rayDir = glm.vec3.create();
  glm.vec3.subtract(rayDir, ptThru, rayOrigin); // rayDir = ptThru - rayOrigin
  glm.vec3.normalize(rayDir, rayDir);

  toCenterVec = glm.vec3.create();
  glm.vec3.scale(toCenterVec, rayOrigin, -1); // toCenter is just -camera pos because center is at [0,0,0]
  dParallel = glm.vec3.dot(rayDir, toCenterVec);

  longDir = glm.vec3.create();
  glm.vec3.scale(longDir, rayDir, dParallel); // longDir = rayDir * distParallel
  glm.vec3.add(ptThru, rayOrigin, longDir); // ptThru is now on the plane going through the center of sphere
  dPerp = glm.vec3.len(ptThru);

  dSubSurf = Math.sqrt(mathValue.RADIUS_OF_EARTH * mathValue.RADIUS_OF_EARTH - dPerp * dPerp);
  dSurf = dParallel - dSubSurf;

  ptSurf = glm.vec3.create();
  glm.vec3.scale(ptSurf, rayDir, dSurf);
  glm.vec3.add(ptSurf, ptSurf, rayOrigin);

  return ptSurf;
};

var isselectedSatNegativeOne = false;
var selectSat = (satId) => {
  db.log('selectSat');
  db.log(`satId: ${satId}`, true);
  var sat;
  if (satId !== -1) {
    cameraManager.rotateEarth(false);
    sat = satSet.getSat(satId);
    if (sat.type == 'Star') return;
    if ((sat.active == false || typeof sat.active == 'undefined') && typeof sat.staticNum == 'undefined') return; // Non-Missile Non-Sensor Object
  }
  satSet.selectSat(satId);
  cameraManager.setCamSnapMode(false);

  if (satId === -1) {
    if (settingsManager.currentColorScheme === ColorScheme.group || $('#search').val().length >= 3) {
      // If group selected
      $('#menu-sat-fov').removeClass('bmenu-item-disabled');
    } else {
      $('#menu-sat-fov').removeClass('bmenu-item-selected');
      $('#menu-sat-fov').addClass('bmenu-item-disabled');
      settingsManager.isSatOverflyModeOn = false;
      satCruncher.postMessage({
        isShowSatOverfly: 'reset',
      });
    }
  }  

  if (satId === -1 && !isselectedSatNegativeOne) {
    cameraManager.fts2default();
    isselectedSatNegativeOne = true;
    $('#sat-infobox').fadeOut();
    // $('#iss-stream').html('')
    // $('#iss-stream-menu').effect('slide', { direction: 'left', mode: 'hide' }, 1000)
    orbitManager.clearSelectOrbit();
    // Remove Red Box
    $('#menu-lookanglesmultisite').removeClass('bmenu-item-selected');
    $('#menu-lookangles').removeClass('bmenu-item-selected');
    $('#menu-editSat').removeClass('bmenu-item-selected');

    $('#menu-map').removeClass('bmenu-item-selected');
    $('#menu-newLaunch').removeClass('bmenu-item-selected');
    $('#menu-breakup').removeClass('bmenu-item-selected');
    $('#menu-customSensor').removeClass('bmenu-item-selected');
    // Add Grey Out
    $('#menu-lookanglesmultisite').addClass('bmenu-item-disabled');
    $('#menu-lookangles').addClass('bmenu-item-disabled');
    $('#menu-satview').addClass('bmenu-item-disabled');
    $('#menu-editSat').addClass('bmenu-item-disabled');
    $('#menu-map').addClass('bmenu-item-disabled');
    $('#menu-newLaunch').addClass('bmenu-item-disabled');
    $('#menu-breakup').addClass('bmenu-item-disabled');
    // Remove Side Menus
    // $('#lookanglesmultisite-menu').effect('slide', { direction: 'left', mode: 'hide' }, 1000)
    // $('#lookangles-menu').effect('slide', { direction: 'left', mode: 'hide' }, 1000)
    $('#editSat-menu').effect('slide', { direction: 'left', mode: 'hide' }, 1000);
    $('#map-menu').effect('slide', { direction: 'left', mode: 'hide' }, 1000);
    $('#newLaunch-menu').effect('slide', { direction: 'left', mode: 'hide' }, 1000);
    $('#breakup-menu').effect('slide', { direction: 'left', mode: 'hide' }, 1000);
    $('#customSensor-menu').effect('slide', { direction: 'left', mode: 'hide' }, 1000);

    if ($('#search').val().length > 0) {
      $('#search-results').attr('style', 'display: block; max-height:auto');
    }

    // Toggle the side menus as closed
    isEditSatMenuOpen = false;
    isLookanglesMenuOpen = false;
    settingsManager.isMapMenuOpen = false;
    sMM.isLookanglesMultiSiteMenuOpen(false);
    sMM.isNewLaunchMenuOpen(false);
    sMM.isBreakupMenuOpen(false);
    sMM.isMissileMenuOpen(false);
    uiManager.setCustomSensorMenuOpen(false);
  } else if (satId !== -1) {
    if (cameraManager.cameraType.current == cameraManager.cameraType.default) {
      cameraManager.ecLastZoom = cameraManager.zoomLevel;
      cameraManager.cameraType.set(cameraManager.cameraType.fixedToSat);
    }
    isselectedSatNegativeOne = false;
    objectManager.setSelectedSat(satId);
    sat = satSet.getSatExtraOnly(satId);
    if (!sat) return;
    if (sat.type == 'Star') {
      return;
    }
    if (sat.static) {
      if (typeof sat.staticNum == 'undefined') return;
      adviceList.sensor();
      sat = satSet.getSat(satId);
      if (objectManager.isSensorManagerLoaded) sensorManager.setSensor(null, sat.staticNum); // Pass staticNum to identify which sensor the user clicked
      if (objectManager.isSensorManagerLoaded) sensorManager.curSensorPositon = [sat.position.x, sat.position.y, sat.position.z];
      objectManager.setSelectedSat(-1);
      $('#menu-sensor-info').removeClass('bmenu-item-disabled');
      $('#menu-fov-bubble').removeClass('bmenu-item-disabled');
      $('#menu-surveillance').removeClass('bmenu-item-disabled');
      $('#menu-planetarium').removeClass('bmenu-item-disabled');
      $('#menu-astronomy').removeClass('bmenu-item-disabled');
      if (objectManager.selectedSat !== -1) {
        $('#menu-lookangles').removeClass('bmenu-item-disabled');
      }
      return;
    }
    cameraManager.camZoomSnappedOnSat(true);
    cameraManager.camAngleSnappedOnSat(true);

    orbitManager.setSelectOrbit(satId);

    if (objectManager.isSensorManagerLoaded && sensorManager.currentSensor.lat != null) {
      $('#menu-lookangles').removeClass('bmenu-item-disabled');
    }

    $('#menu-lookanglesmultisite').removeClass('bmenu-item-disabled');
    $('#menu-satview').removeClass('bmenu-item-disabled');
    $('#menu-editSat').removeClass('bmenu-item-disabled');
    $('#menu-sat-fov').removeClass('bmenu-item-disabled');
    $('#menu-map').removeClass('bmenu-item-disabled');
    $('#menu-newLaunch').removeClass('bmenu-item-disabled');

    if ($('#search-results').css('display') === 'block') {
      if (window.innerWidth > 1000) {
        if ($('#search').val().length > 0) {
          $('#search-results').attr('style', 'display:block; max-height:27%');
        }
        if (cameraManager.cameraType.current !== cameraManager.cameraType.planetarium) {
          // Unclear why this was needed...
          // uiManager.legendMenuChange('default')
        }
      }
    } else {
      if (window.innerWidth > 1000) {
        if ($('#search').val().length > 0) {
          $('#search-results').attr('style', 'display:block; max-height:auto');
        }
        if (cameraManager.cameraType.current !== cameraManager.cameraType.planetarium) {
          // Unclear why this was needed...
          // uiManager.legendMenuChange('default')
        }
      }
    }

    if (!sat.missile) {
      $('.sat-only-info').show();
    } else {
      $('.sat-only-info').hide();
    }

    $('#sat-infobox').fadeIn();
    $('#sat-info-title').html(sat.ON);

    if (sat.URL && sat.URL !== '') {
      $('#sat-info-title').html("<a class='iframe' href='" + sat.URL + "'>" + sat.ON + '</a>');
    }

    $('#edit-satinfo-link').html("<a class='iframe' href='editor.htm?scc=" + sat.SCC_NUM + "&popup=true'>Edit Satellite Info</a>");

    $('#sat-intl-des').html(sat.intlDes);
    if (sat.OT === 'unknown') {
      $('#sat-objnum').html(1 + sat.TLE2.substr(2, 7).toString());
    } else {
      //      $('#sat-objnum').html(sat.TLE2.substr(2,7))
      $('#sat-objnum').html(sat.SCC_NUM);
      if (settingsManager.isOfficialWebsite) {
        // ga('send', 'event', 'Satellite', 'SCC: ' + sat.SCC_NUM, 'SCC Number');
      }
    }

    var objtype;
    if (sat.OT === 0) {
      objtype = 'TBA';
    }
    if (sat.OT === 1) {
      objtype = 'Payload';
    }
    if (sat.OT === 2) {
      objtype = 'Rocket Body';
    }
    if (sat.OT === 3) {
      objtype = 'Debris';
    }
    if (sat.OT === 4) {
      if (settingsManager.offline) {
        objtype = 'Special';
      } else {
        objtype = 'Amateur Sat';
      }
    }
    if (sat.OT === 5) {
      objtype = 'Measurement';
    }
    if (sat.OT === 6) {
      objtype = 'Radar Track';
    }
    if (sat.OT === 7) {
      objtype = 'Radar Object';
    }
    if (sat.missile) {
      objtype = 'Ballistic Missile';
    }
    $('#sat-type').html(objtype);

    // /////////////////////////////////////////////////////////////////////////
    // Country Correlation Table
    // /////////////////////////////////////////////////////////////////////////
    var country;
    country = objectManager.extractCountry(sat.C);
    $('#sat-country').html(country);

    // /////////////////////////////////////////////////////////////////////////
    // Launch Site Correlation Table
    // /////////////////////////////////////////////////////////////////////////
    var site = [];
    var missileLV;
    var missileOrigin;
    var satLvString;
    if (sat.missile) {
      site = sat.desc.split('(');
      missileOrigin = site[0].substr(0, site[0].length - 1);
      missileLV = sat.desc.split('(')[1].split(')')[0]; // Remove the () from the booster type

      site.site = missileOrigin;
      site.sitec = sat.C;
    } else {
      site = objectManager.extractLaunchSite(sat.LS);
    }

    $('#sat-site').html(site.site);
    $('#sat-sitec').html(site.sitec);

    if (settingsManager.isOfficialWebsite) {
      // ga('send', 'event', 'Satellite', 'Country: ' + country, 'Country');
    }
    if (settingsManager.isOfficialWebsite) {
      // ga('send', 'event', 'Satellite', 'Site: ' + site, 'Site');
    }

    // /////////////////////////////////////////////////////////////////////////
    // Launch Vehicle Correlation Table
    // /////////////////////////////////////////////////////////////////////////
    if (sat.missile) {
      sat.LV = missileLV;
      $('#sat-vehicle').html(sat.LV);
    } else {
      $('#sat-vehicle').html(sat.LV); // Set to JSON record
      if (sat.LV === 'U') {
        $('#sat-vehicle').html('Unknown');
      } // Replace with Unknown if necessary
      satLvString = objectManager.extractLiftVehicle(sat.LV); // Replace with link if available
      $('#sat-vehicle').html(satLvString);
    }

    // /////////////////////////////////////////////////////////////////////////
    // RCS Correlation Table
    // /////////////////////////////////////////////////////////////////////////
    if (sat.R === null || typeof sat.R == 'undefined') {
      $('#sat-rcs').html('Unknown');
    } else {
      var rcs;
      if (sat.R < 0.1) {
        rcs = 'Small';
      }
      if (sat.R >= 0.1) {
        rcs = 'Medium';
      }
      if (sat.R > 1) {
        rcs = 'Large';
      }
      $('#sat-rcs').html(rcs);
      $('#sat-rcs').tooltip({ delay: 50, html: sat.R, position: 'left' });
    }

    if (!sat.missile) {
      $('a.iframe').colorbox({
        iframe: true,
        width: '80%',
        height: '80%',
        fastIframe: false,
        closeButton: false,
      });
      $('#sat-apogee').html(sat.apogee.toFixed(0) + ' km');
      $('#sat-perigee').html(sat.perigee.toFixed(0) + ' km');
      $('#sat-inclination').html((sat.inclination * mathValue.RAD2DEG).toFixed(2) + '°');
      $('#sat-eccentricity').html(sat.eccentricity.toFixed(3));

      $('#sat-period').html(sat.period.toFixed(2) + ' min');
      $('#sat-period').tooltip({
        delay: 50,
        html: 'Mean Motion: ' + mathValue.MINUTES_PER_DAY / sat.period.toFixed(2),
        position: 'left',
      });

      if (typeof sat.U != 'undefined' && sat.U != '') {
        $('#sat-user').html(sat.U);
      } else {
        $('#sat-user').html('Unknown');
      }
      if (typeof sat.P != 'undefined' && sat.P != '') {
        $('#sat-purpose').html(sat.P);
      } else {
        $('#sat-purpose').html('Unknown');
      }
      if (typeof sat.Con != 'undefined' && sat.Con != '') {
        $('#sat-contractor').html(sat.Con);
      } else {
        $('#sat-contractor').html('Unknown');
      }
      if (typeof sat.LM != 'undefined' && sat.LM != '') {
        $('#sat-lmass').html(sat.LM + ' kg');
      } else {
        $('#sat-lmass').html('Unknown');
      }
      if (typeof sat.DM != 'undefined' && sat.DM != '') {
        $('#sat-dmass').html(sat.DM + ' kg');
      } else {
        $('#sat-dmass').html('Unknown');
      }
      if (typeof sat.Li != 'undefined' && sat.Li != '') {
        $('#sat-life').html(sat.Li + ' yrs');
      } else {
        $('#sat-life').html('Unknown');
      }
      if (typeof sat.Pw != 'undefined' && sat.Pw != '') {
        $('#sat-power').html(sat.Pw + ' w');
      } else {
        $('#sat-power').html('Unknown');
      }
      if (typeof sat.vmag != 'undefined' && sat.vmag != '') {
        $('#sat-vmag').html(sat.vmag);
      } else {
        $('#sat-vmag').html('Unknown');
      }
      if (typeof sat.S1 != 'undefined' && sat.S1 != '') {
        $('#sat-source1').html(`<a class="iframe" href="${sat.S1}">${sat.S1.split('//').splice(1)}</a>`);
        $('#sat-source1w').show();
      } else {
        $('#sat-source1').html('Unknown');
        $('#sat-source1w').hide();
      }
      if (typeof sat.S2 != 'undefined' && sat.S2 != '') {
        $('#sat-source2').html(`<a class="iframe" href="${sat.S2}">${sat.S2.split('//').splice(1)}</a>`);
        $('#sat-source2w').show();
      } else {
        $('#sat-source2').html('Unknown');
        $('#sat-source2w').hide();
      }
      if (typeof sat.S3 != 'undefined' && sat.S3 != '') {
        $('#sat-source3').html(`<a class="iframe" href="${sat.S3}">${sat.S3.split('//').splice(1)}</a>`);
        $('#sat-source3w').show();
      } else {
        $('#sat-source3').html('Unknown');
        $('#sat-source3w').hide();
      }
      if (typeof sat.S4 != 'undefined' && sat.S4 != '') {
        $('#sat-source4').html(`<a class="iframe" href="${sat.S4}">${sat.S4.split('//').splice(1)}</a>`);
        $('#sat-source4w').show();
      } else {
        $('#sat-source4').html('Unknown');
        $('#sat-source4w').hide();
      }
      if (typeof sat.S5 != 'undefined' && sat.S5 != '') {
        $('#sat-source5').html(`<a class="iframe" href="${sat.S5}">${sat.S5.split('//').splice(1)}</a>`);
        $('#sat-source5w').show();
      } else {
        $('#sat-source5').html('Unknown');
        $('#sat-source5w').hide();
      }
      if (typeof sat.S6 != 'undefined' && sat.S6 != '') {
        $('#sat-source6').html(`<a class="iframe" href="${sat.S6}">${sat.S6.split('//').splice(1)}</a>`);
        $('#sat-source6w').show();
      } else {
        $('#sat-source6').html('Unknown');
        $('#sat-source6w').hide();
      }
      if (typeof sat.S7 != 'undefined' && sat.S7 != '') {
        $('#sat-source7').html(`<a class="iframe" href="${sat.S7}">${sat.S7.split('//').splice(1)}</a>`);
        $('#sat-source7w').show();
      } else {
        $('#sat-source7').html('Unknown');
        $('#sat-source7w').hide();
      }
      if (typeof sat.URL != 'undefined' && sat.URL != '') {
        $('#sat-source8').html(`<a class="iframe" href="${sat.URL}">${sat.URL.split('//').splice(1)}</a>`);
        $('#sat-source8w').show();
      } else {
        $('#sat-source8').html('Unknown');
        $('#sat-source8w').hide();
      }
      $('a.iframe').colorbox({
        iframe: true,
        width: '80%',
        height: '80%',
        fastIframe: false,
        closeButton: false,
      });

      // TODO: Error checking on Iframe

      var now = new Date();
      var jday = timeManager.getDayOfYear(now);
      now = now.getFullYear();
      now = now.toString().substr(2, 2);
      var daysold;
      if (satSet.getSat(satId).TLE1.substr(18, 2) === now) {
        daysold = jday - satSet.getSat(satId).TLE1.substr(20, 3);
      } else {
        daysold = jday - satSet.getSat(satId).TLE1.substr(20, 3) + satSet.getSat(satId).TLE1.substr(17, 2) * 365;
      }
      $('#sat-elset-age').html(daysold + ' Days');
      $('#sat-elset-age').tooltip({
        delay: 50,
        html: 'Epoch Year: ' + sat.TLE1.substr(18, 2).toString() + ' Day: ' + sat.TLE1.substr(20, 8).toString(),
        position: 'left',
      });

      if (!objectManager.isSensorManagerLoaded) {
        $('#sat-sun').parent().hide();
      } else {
        now = new Date(timeManager.propRealTime + timeManager.propOffset);
        var sunTime = SunCalc.getTimes(now, sensorManager.currentSensor.lat, sensorManager.currentSensor.long);
        var satInSun = sat.isInSun;
        // If No Sensor, then Ignore Sun Exclusion
        if (sensorManager.currentSensor.lat == null) {
          if (satInSun == 0) $('#sat-sun').html('No Sunlight');
          if (satInSun == 1) $('#sat-sun').html('Limited Sunlight');
          if (satInSun == 2) $('#sat-sun').html('Direct Sunlight');
          // If Radar Selected, then Say the Sun Doesn't Matter
        } else if (sensorManager.currentSensor.type !== 'Optical' && sensorManager.currentSensor.type !== 'Observer') {
          $('#sat-sun').html('No Effect');
          // If Dawn Dusk Can be Calculated then show if the satellite is in the sun
        } else if (sunTime.dawn.getTime() - now > 0 || sunTime.dusk.getTime() - now < 0) {
          if (satInSun == 0) $('#sat-sun').html('No Sunlight');
          if (satInSun == 1) $('#sat-sun').html('Limited Sunlight');
          if (satInSun == 2) $('#sat-sun').html('Direct Sunlight');
          // If Optical Sesnor but Dawn Dusk Can't Be Calculated, then you are at a
          // high latitude and we need to figure that out
        } else if (sunTime.night != 'Invalid Date' && (sunTime.dawn == 'Invalid Date' || sunTime.dusk == 'Invalid Date')) {
          if (satInSun == 0) $('#sat-sun').html('No Sunlight');
          if (satInSun == 1) $('#sat-sun').html('Limited Sunlight');
          if (satInSun == 2) $('#sat-sun').html('Direct Sunlight');
        } else {
          // Unless you are in sun exclusion
          $('#sat-sun').html('Sun Exclusion');
        }
      }
    }
    if (objectManager.isSensorManagerLoaded && sensorManager.currentSensor.lat != null) {
      if (isLookanglesMenuOpen) {
        satellite.getlookangles(sat);
      }
      lineManager.updateLineToSat(satId, satSet.getIdFromSensorName(sensorManager.currentSensor.name));
    }
  }

  objectManager.setSelectedSat(satId);

  if (satId !== -1) {
    if (typeof sat.TTP != 'undefined') {
      $('#sat-ttp-wrapper').show();
      $('#sat-ttp').html(sat.TTP);
    } else {
      $('#sat-ttp-wrapper').hide();
    }
    if (typeof sat.NOTES != 'undefined') {
      $('#sat-notes-wrapper').show();
      $('#sat-notes').html(sat.NOTES);
    } else {
      $('#sat-notes-wrapper').hide();
    }
    if (typeof sat.FMISSED != 'undefined') {
      $('#sat-fmissed-wrapper').show();
      $('#sat-fmissed').html(sat.FMISSED);
    } else {
      $('#sat-fmissed-wrapper').hide();
    }
    if (typeof sat.ORPO != 'undefined') {
      $('#sat-oRPO-wrapper').show();
      $('#sat-oRPO').html(sat.ORPO);
    } else {
      $('#sat-oRPO-wrapper').hide();
    }
    if (typeof sat.constellation != 'undefined') {
      $('#sat-constellation-wrapper').show();
      $('#sat-constellation').html(sat.constellation);
    } else {
      $('#sat-constellation-wrapper').hide();
    }
    if (typeof sat.maneuver != 'undefined') {
      $('#sat-maneuver-wrapper').show();
      $('#sat-maneuver').html(sat.maneuver);
    } else {
      $('#sat-maneuver-wrapper').hide();
    }
    if (typeof sat.associates != 'undefined') {
      $('#sat-associates-wrapper').show();
      $('#sat-associates').html(sat.associates);
    } else {
      $('#sat-associates-wrapper').hide();
    }
    uiManager.updateMap();

    // ISS Stream Slows Down a Lot Of Computers
    // if (sat.SCC_NUM === '25544') { // ISS is Selected
    //   $('#iss-stream-menu').show()
    //   $('#iss-stream').html('<iframe src="http://www.ustream.tv/embed/17074538?html5ui=1" allowfullscreen="true" webkitallowfullscreen="true" scrolling="no" frameborder="0" style="border: 0px none transparent"></iframe><iframe src="http://www.ustream.tv/embed/9408562?html5ui=1" allowfullscreen="true" webkitallowfullscreen="true" scrolling="no" frameborder="0" style="border: 0px none transparent"></iframe><br />' +
    //                         '<iframe src="http://www.ustream.tv/embed/6540154?html5ui=1" allowfullscreen="true" webkitallowfullscreen="true" scrolling="no" frameborder="0" style="border: 0px none transparent"></iframe><iframe src="http://cdn.livestream.com/embed/spaceflightnow?layout=4&ampheight=340&ampwidth=560&ampautoplay=false" style="border:0outline:0" frameborder="0" scrolling="no"></iframe>')
    // } else {
    //   $('#iss-stream').html('')
    //   $('#iss-stream-menu').hide()
    // }
  }
};
// eslint-disable-next-line no-unused-vars
var enableSlowCPUMode = () => {
  db.log('enableSlowCPUMode');
  if (!settingsManager.cruncherReady) return;
  settingsManager.isSlowCPUModeEnabled = true;
  settingsManager.minimumSearchCharacters = 3;
  settingsManager.satLabelInterval = 500;

  satCruncher.postMessage({
    isSlowCPUModeEnabled: true,
  });
};

$(document).ready(function () {
  // Start the initialization before doing anything else. The webworkers and
  // textures needs to start loading as fast as possible.
  initializeKeepTrack();

  // 2020 Key listener
  // TODO: Migrate most things from UI to Here
  $(window).on({
    keydown: function (e) {
      if (e.ctrlKey === true || e.metaKey === true) isCtrlPressed = true;
    },
  });
  $(window).on({
    keyup: function (e) {
      if (e.ctrlKey === false && e.metaKey === false) isCtrlPressed = false;
    },
  });

  if (settingsManager.disableWindowScroll || settingsManager.disableNormalEvents) {
    window.addEventListener(
      'scroll',
      function () {
        window.scrollTo(0, 0);
        return false;
      },
      { passive: false }
    );

    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

    var preventDefault = (e) => {
      e.preventDefault();
    };

    var preventDefaultForScrollKeys = (e) => {
      if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
      }
    };

    // modern Chrome requires { passive: false } when adding event
    var supportsPassive = false;
    try {
      window.addEventListener(
        'test',
        null,
        Object.defineProperty({}, 'passive', {
          // eslint-disable-next-line getter-return
          get: function () {
            supportsPassive = true;
          },
        })
      );
    } catch (e) {
      // Intentional
    }

    var wheelOpt = supportsPassive ? { passive: false } : false;
    var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    // call this to Disable
    // eslint-disable-next-line no-unused-vars
    var disableScroll = () => {
      window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
      window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
      window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
      window.addEventListener('keydown', preventDefaultForScrollKeys, false);
    };

    // call this to Enable
    // eslint-disable-next-line no-unused-vars
    var enableScroll = () => {
      window.removeEventListener('DOMMouseScroll', preventDefault, false);
      window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
      window.removeEventListener('touchmove', preventDefault, wheelOpt);
      window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    };
  }

  if (settingsManager.disableZoomControls || settingsManager.disableNormalEvents) {
    var stopKeyZoom = (event) => {
      if (event.ctrlKey == true && (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109' || event.which == '187' || event.which == '189')) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', stopKeyZoom, { passive: false });
    window.addEventListener('mousewheel', stopWheelZoom, { passive: false });
    window.addEventListener('DOMMouseScroll', stopWheelZoom, { passive: false });

    var stopWheelZoom = (event) => {
      if (event.ctrlKey == true) {
        event.preventDefault();
      }
    };
  }

  // Needed?
  if (settingsManager.disableWindowTouchMove) {
    window.addEventListener(
      'touchmove',
      function (event) {
        event.preventDefault();
      },
      { passive: false }
    );
  }

  // Resizing Listener
  $(window).on('resize', function () {
    if (!settingsManager.disableUI) {
      uiManager.resize2DMap();
    }
    mobile.checkMobileMode();
    if (!settingsManager.disableUI) {
      if (settingsManager.screenshotMode) {
        bodyDOM.css('overflow', 'visible');
        $('#canvas-holder').css('overflow', 'visible');
        $('#canvas-holder').width = 3840;
        $('#canvas-holder').height = 2160;
        bodyDOM.width = 3840;
        bodyDOM.height = 2160;
      } else {
        bodyDOM.css('overflow', 'hidden');
        $('#canvas-holder').css('overflow', 'hidden');
      }
    }
    if (!settingsManager.isResizing) {
      window.setTimeout(function () {
        settingsManager.isResizing = false;
        webGlInit();
      }, 500);
    }
    settingsManager.isResizing = true;
  });

  $(window).mousedown(function (evt) {
    // Camera Manager Events
    {
      if (!settingsManager.disableCameraControls) {
        // Middle Mouse Button MMB
        if (evt.button === 1) {
          cameraManager.setLocalRotate(true);
          cameraManager.setLocalRotateStartPosition(cameraManager.localRotateCurrent);
          if (isShiftPressed) {
            cameraManager.setLocalRotateRoll(true);
          cameraManager.setLocalRotateYaw(false);
          } else {
            cameraManager.setLocalRotateRoll(false);
          cameraManager.setLocalRotateYaw(true);
          }
          evt.preventDefault();
        }

        // Right Mouse Button RMB
        if (evt.button === 2 && (isShiftPressed || isCtrlPressed)) {
          cameraManager.isPanning = true;
          cameraManager.panStartPosition = cameraManager.panCurrent;
          if (isShiftPressed) {
            cameraManager.isScreenPan = false;
            cameraManager.isWorldPan = true;
          } else {
            cameraManager.isScreenPan = true;
            cameraManager.isWorldPan = false;
          }
        }
      }
    }
  });

  $(window).mouseup(function (evt) {
    // Camera Manager Events
    {
      if (!settingsManager.disableCameraControls) {
        if (evt.button === 1) {
          cameraManager.setLocalRotate(false);
          cameraManager.setLocalRotateRoll(false);
          cameraManager.setLocalRotateYaw(false);
        }
        if (evt.button === 2) {
          cameraManager.isPanning = false;
          cameraManager.isScreenPan = false;
          cameraManager.isWorldPan = false;
        }
      }
    }
  });
  (function _canvasController() {
    db.log('_canvasController');
    var latLon;
    canvasDOM.on('touchmove', function (evt) {
      if (settingsManager.disableNormalEvents) {
        evt.preventDefault();
      }
      if (isPinching && typeof evt.originalEvent.touches[0] != 'undefined' && typeof evt.originalEvent.touches[1] != 'undefined') {
        var currentPinchDistance = Math.hypot(evt.originalEvent.touches[0].pageX - evt.originalEvent.touches[1].pageX, evt.originalEvent.touches[0].pageY - evt.originalEvent.touches[1].pageY);
        if (isNaN(currentPinchDistance)) return;

        deltaPinchDistance = (startPinchDistance - currentPinchDistance) / maxPinchSize;
        let zoomTarget = cameraManager.zoomTarget;
        zoomTarget += deltaPinchDistance * (settingsManager.cameraMovementSpeed / 10);
        zoomTarget = Math.min(Math.max(zoomTarget, 0.0001), 1); // Force between 0 and 1
        cameraManager.setZoomTarget(zoomTarget);
      } else {
        // Dont Move While Zooming
        cameraManager.setMouseX(evt.originalEvent.touches[0].clientX);
        cameraManager.setMouseY(evt.originalEvent.touches[0].clientY);        
        if (cameraManager.isDragging && screenDragPoint[0] !== mouseX && screenDragPoint[1] !== mouseY) {
          dragHasMoved = true;
          cameraManager.camAngleSnappedOnSat(false);
          cameraManager.camZoomSnappedOnSat(false);
        }
        isMouseMoving = true;
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(function () {
          isMouseMoving = false;
        }, 250);
      }
    });
    canvasDOM.on('mousemove', function (evt) {
      cameraManager.setMouseX(evt.clientX - (canvasDOM.position().left - window.scrollX));
      cameraManager.setMouseY(evt.clientY - (canvasDOM.position().top - window.scrollY));      
      if (cameraManager.isDragging && screenDragPoint[0] !== mouseX && screenDragPoint[1] !== mouseY) {
        dragHasMoved = true;
        cameraManager.camAngleSnappedOnSat(false);
        cameraManager.camZoomSnappedOnSat(false);
      }
      isMouseMoving = true;
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(function () {
        isMouseMoving = false;
      }, 150);
    });

    if (settingsManager.disableUI) {
      canvasDOM.on('wheel', function () {
        satHoverBoxDOM.css({
          display: 'none',
        });
      });
    }
    if (!settingsManager.disableUI) {
      canvasDOM.on('wheel', function (evt) {
        if (settingsManager.disableNormalEvents) {
          evt.preventDefault();
        }

        var delta = evt.originalEvent.deltaY;
        if (evt.originalEvent.deltaMode === 1) {
          delta *= 33.3333333;
        }

        if (delta < 0) {
          cameraManager.setZoomIn(true);
        } else {
          cameraManager.setZoomIn(false);
        }

        cameraManager.rotateEarth(false);

        if (settingsManager.isZoomStopsSnappedOnSat || objectManager.selectedSat == -1) {
          let zoomTarget = cameraManager.zoomTarget;
          zoomTarget += delta / 100 / 50 / cameraManager.speedModifier; // delta is +/- 100
          zoomTarget = Math.min(Math.max(zoomTarget, 0.001), 1); // Force between 0 and 1
          cameraManager.setZoomTarget(zoomTarget);
          cameraManager.setEcLastZoom(zoomTarget);
          cameraManager.camZoomSnappedOnSat(false);
        } else {
          if (settingsManager.camDistBuffer < 300 || settingsManager.nearZoomLevel == -1) {
            settingsManager.camDistBuffer += delta / 7.5; // delta is +/- 100
            settingsManager.camDistBuffer = Math.min(Math.max(settingsManager.camDistBuffer, 30), 300);
            settingsManager.nearZoomLevel = cameraManager.zoomLevel;
          }
          if (settingsManager.camDistBuffer >= 300) {
            let zoomTarget = cameraManager.zoomTarget;
            zoomTarget += delta / 100 / 50 / cameraManager.speedModifier; // delta is +/- 100
            zoomTarget = Math.min(Math.max(zoomTarget, 0.001), 1); // Force between 0 and 1
            cameraManager.setZoomTarget(zoomTarget);
            cameraManager.setEcLastZoom(zoomTarget);
            cameraManager.camZoomSnappedOnSat(false);
            if (zoomTarget < settingsManager.nearZoomLevel) {
              cameraManager.camZoomSnappedOnSat(true);
              settingsManager.camDistBuffer = 200;
            }
          }
        }

        if (cameraManager.cameraType.current === cameraManager.cameraType.planetarium || cameraManager.cameraType.current === cameraManager.cameraType.fps || cameraManager.cameraType.current === cameraManager.cameraType.satellite || cameraManager.cameraType.current === cameraManager.cameraType.astronomy) {
          settingsManager.fieldOfView += delta * 0.0002;
          $('#fov-text').html('FOV: ' + (settingsManager.fieldOfView * 100).toFixed(2) + ' deg');
          if (settingsManager.fieldOfView > settingsManager.fieldOfViewMax) settingsManager.fieldOfView = settingsManager.fieldOfViewMax;
          if (settingsManager.fieldOfView < settingsManager.fieldOfViewMin) settingsManager.fieldOfView = settingsManager.fieldOfViewMin;
          webGlInit();
        }
      });
      canvasDOM.on('click', function (evt) {
        if (settingsManager.disableNormalEvents) {
          evt.preventDefault();
        }
        rightBtnMenuDOM.hide();
        uiManager.clearRMBSubMenu();
        if ($('#colorbox').css('display') === 'block') {
          $.colorbox.close(); // Close colorbox if it was open
        }
      });
      canvasDOM.on('mousedown', function (evt) {
        if (settingsManager.disableNormalEvents) {
          evt.preventDefault();
        }

        if (cameraManager.speedModifier === 1) {
          settingsManager.cameraMovementSpeed = 0.003;
          settingsManager.cameraMovementSpeedMin = 0.005;
        }

        if (evt.button === 2) {
          dragPoint = getEarthScreenPoint(mouseX, mouseY);
          latLon = satellite.eci2ll(dragPoint[0], dragPoint[1], dragPoint[2]);
        }
        cameraManager.screenDragPoint([mouseX, mouseY]);
        cameraManager.setDragStartPitch(camPitch);
        cameraManager.setDragStartYaw(camYaw);        
        if (evt.button === 0) {
          cameraManager.setDragging(true);
        }
        // debugLine.set(dragPoint, getCamPos())
        cameraManager.setCamSnapMode(false);
        if (!settingsManager.disableUI) {
          cameraManager.rotateEarth(false);
        }
        rightBtnMenuDOM.hide();
        uiManager.clearRMBSubMenu();

        // TODO: Make uiManager.updateURL() a setting that is disabled by default
        uiManager.updateURL();
      });
      canvasDOM.on('touchstart', function (evt) {
        settingsManager.cameraMovementSpeed = 0.0001;
        settingsManager.cameraMovementSpeedMin = 0.0001;
        if (evt.originalEvent.touches.length > 1) {
          // Two Finger Touch
          isPinching = true;
          startPinchDistance = Math.hypot(evt.originalEvent.touches[0].pageX - evt.originalEvent.touches[1].pageX, evt.originalEvent.touches[0].pageY - evt.originalEvent.touches[1].pageY);
          // _pinchStart(evt)
        } else {
          // Single Finger Touch
          mobile.startMouseX = evt.originalEvent.touches[0].clientX;
          mobile.startMouseY = evt.originalEvent.touches[0].clientY;
          cameraManager.setMouseX(evt.originalEvent.touches[0].clientX);
          cameraManager.setMouseY(evt.originalEvent.touches[0].clientY);
          mouseSat = getSatIdFromCoord(mouseX, mouseY);
          settingsManager.cameraMovementSpeed = Math.max(0.005 * cameraManager.zoomLevel, settingsManager.cameraMovementSpeedMin);
          cameraManager.screenDragPoint([mouseX, mouseY]);
          // dragPoint = getEarthScreenPoint(x, y)
          dragPoint = screenDragPoint; // Ignore the earth on mobile
          cameraManager.setDragStartPitch(camPitch)          
          cameraManager.setDragStartYaw(camYaw);
          // debugLine.set(dragPoint, getCamPos())
          cameraManager.setDragging(true);
          touchStartTime = Date.now();
          // If you hit the canvas hide any popups
          _hidePopUps();
          cameraManager.setCamSnapMode(false);
          if (!settingsManager.disableUI) {
            cameraManager.rotateEarth(false);
          }

          // TODO: Make updateUrl() a setting that is disabled by default
          uiManager.updateURL();
        }
      });
      canvasDOM.on('mouseup', function (evt) {
        if (settingsManager.disableNormalEvents) {
          evt.preventDefault();
        }
        if (!dragHasMoved) {
          if (settingsManager.isMobileModeEnabled) {
            mouseSat = getSatIdFromCoord(mouseX, mouseY);
          }
          clickedSat = mouseSat;
          if (evt.button === 0) {
            // Left Mouse Button Clicked
            if (cameraManager.cameraType.current === cameraManager.cameraType.satellite) {
              if (clickedSat !== -1 && !satSet.getSatExtraOnly(clickedSat).static) {
                objectManager.setSelectedSat(clickedSat);
              }
            } else {
              objectManager.setSelectedSat(clickedSat);
            }
          }
          if (evt.button === 2) {
            // Right Mouse Button Clicked
            if (!isCtrlPressed && !isShiftPressed) {
              _openRmbMenu();
            }
          }
        }
        // Repaint the theme to ensure it is the right color
        settingsManager.themes.retheme();
        // Force the serach bar to get repainted because it gets overwrote a lot
        settingsManager.themes.redThemeSearch();
        dragHasMoved = false;
        cameraManager.setDragging(false);
        if (!settingsManager.disableUI) {
          cameraManager.rotateEarth(false);
        }
      });
    }

    var _openRmbMenu = () => {
      let numMenuItems = 0;
      $('#clear-lines-rmb').hide();

      // View
      $('#view-info-rmb').hide();
      $('#view-sensor-info-rmb').hide();
      $('#view-sat-info-rmb').hide();
      $('#view-related-sats-rmb').hide();
      $('#view-curdops-rmb').hide();
      $('#view-24dops-rmb').hide();

      // Edit
      $('#edit-sat-rmb').hide();

      // Create
      $('#create-observer-rmb ').hide();
      $('#create-sensor-rmb').hide();

      // Draw
      $('#line-eci-axis-rmb').hide();
      $('#line-sensor-sat-rmb').hide();
      $('#line-earth-sat-rmb').hide();
      $('#line-sat-sat-rmb').hide();

      // Earth
      $('#earth-low-rmb').hide();
      $('#earth-high-rmb').hide();
      $('#earth-vec-rmb').hide();

      // Reset Camera
      // $('#reset-camera-rmb').hide();

      // Colors Always Present

      var isViewDOM = false;
      var isCreateDOM = false;
      var isDrawDOM = false;
      var isEarthDOM = false;

      rightBtnSaveDOM.show();
      rightBtnViewDOM.hide();
      rightBtnEditDOM.hide();
      rightBtnCreateDOM.hide();
      rightBtnDrawDOM.hide();
      rightBtnEarthDOM.hide();

      if (lineManager.getLineListLen() > 0) {
        $('#clear-lines-rmb').show();
      }

      if (mouseSat !== -1) {
        if (typeof clickedSat == 'undefined') return;
        let sat = satSet.getSat(clickedSat);
        if (typeof sat == 'undefined' || sat == null) return;
        if (typeof satSet.getSat(clickedSat).type == 'undefined' || satSet.getSat(clickedSat).type !== 'Star') {
          rightBtnViewDOM.show();
          isViewDOM = true;
          numMenuItems++;
        }
        if (!satSet.getSat(clickedSat).static) {
          $('#edit-sat-rmb').show();
          rightBtnEditDOM.show();
          numMenuItems++;

          $('#view-sat-info-rmb').show();
          $('#view-related-sats-rmb').show();

          if (objectManager.isSensorManagerLoaded && sensorManager.currentSensor.lat != null && sensorManager.whichRadar !== 'CUSTOM') {
            $('#line-sensor-sat-rmb').show();
          }
          $('#line-earth-sat-rmb').show();
          $('#line-sat-sat-rmb').show();
          rightBtnDrawDOM.show();
          isDrawDOM = true;
          numMenuItems++;
        } else {
          if (satSet.getSat(clickedSat).type === 'Optical' || satSet.getSat(clickedSat).type === 'Mechanical' || satSet.getSat(clickedSat).type === 'Ground Sensor Station' || satSet.getSat(clickedSat).type === 'Phased Array Radar') {
            $('#view-sensor-info-rmb').show();
          }
        }
      } else {
        // Intentional
      }

      // Is this the Earth?
      //
      // This not the Earth

      if (typeof latLon == 'undefined' || isNaN(latLon.latitude) || isNaN(latLon.longitude)) {
        // Intentional
      } else {
        // This is the Earth
        if (!isViewDOM) {
          rightBtnViewDOM.show();
          ++numMenuItems;
        }
        $('#view-info-rmb').show();
        $('#view-curdops-rmb').show();
        $('#view-24dops-rmb').show();

        if (!isCreateDOM) {
          rightBtnCreateDOM.show();
          ++numMenuItems;
        }
        $('#create-observer-rmb ').show();
        $('#create-sensor-rmb').show();

        if (!isDrawDOM) {
          rightBtnDrawDOM.show();
          ++numMenuItems;
        }
        $('#line-eci-axis-rmb').show();

        if (!isEarthDOM) {
          rightBtnEarthDOM.show();
          ++numMenuItems;
        }

        $('#earth-nasa-rmb').show();
        $('#earth-blue-rmb').show();
        $('#earth-low-rmb').show();
        $('#earth-high-no-clouds-rmb').show();
        $('#earth-vec-rmb').show();
        if (settingsManager.nasaImages == true) $('#earth-nasa-rmb').hide();
        if (settingsManager.trusatImages == true) $('#earth-trusat-rmb').hide();
        if (settingsManager.blueImages == true) $('#earth-blue-rmb').hide();
        if (settingsManager.lowresImages == true) $('#earth-low-rmb').hide();
        if (settingsManager.hiresNoCloudsImages == true) $('#earth-high-no-clouds-rmb').hide();
        if (settingsManager.vectorImages == true) $('#earth-vec-rmb').hide();
      }

      rightBtnMenuDOM.show();
      satHoverBoxDOM.hide();
      // Might need to be adjusted if number of menus change
      var offsetX = mouseX < canvasDOM.innerWidth() / 2 ? 0 : -100;
      var offsetY = mouseY < canvasDOM.innerHeight() / 2 ? 0 : numMenuItems * -50;
      rightBtnMenuDOM.css({
        'display': 'block',
        'text-align': 'center',
        'position': 'absolute',
        'left': mouseX + offsetX,
        'top': mouseY + offsetY,
      });
    };

    canvasDOM.on('touchend', function () {
      let touchTime = Date.now() - touchStartTime;

      if (touchTime > 150 && !isPinching && Math.abs(mobile.startMouseX - mouseX) < 50 && Math.abs(mobile.startMouseY - mouseY) < 50) {
        _openRmbMenu();
        mouseSat = -1;
      }

      if (isPinching) {
        // pinchEnd(e)
        isPinching = false;
      }
      cameraManager.setMouseX(0);
      cameraManager.setMouseY(0);
      dragHasMoved = false;
      cameraManager.setDragging(false);
      if (!settingsManager.disableUI) {
        cameraManager.rotateEarth(false);
      }
    });

    $('#nav-wrapper *').on('click', function () {
      _hidePopUps();
    });
    $('#nav-wrapper').on('click', function () {
      _hidePopUps();
    });
    $('#nav-footer *').on('click', function () {
      _hidePopUps();
    });
    $('#nav-footer').on('click', function () {
      _hidePopUps();
    });
    $('#ui-wrapper *').on('click', function () {
      _hidePopUps();
    });
    var _hidePopUps = () => {
      if (settingsManager.isPreventColorboxClose == true) return;
      rightBtnMenuDOM.hide();
      uiManager.clearRMBSubMenu();
      if ($('#colorbox').css('display') === 'block') {
        $.colorbox.close(); // Close colorbox if it was open
      }
    };

    if (settingsManager.startWithFocus) {
      canvasDOM.attr('tabIndex', 0);
      canvasDOM.trigger('focus');
    }

    if (!settingsManager.disableUI) {
      bodyDOM.on('keypress', (e) => {
        uiManager.keyHandler(e);
      }); // On Key Press Event Run _keyHandler Function
      bodyDOM.on('keydown', (e) => {
        if (uiManager.isCurrentlyTyping) return;
        cameraManager.keyDownHandler(e);
      }); // On Key Press Event Run _keyHandler Function
      bodyDOM.on('keyup', (e) => {
        if (uiManager.isCurrentlyTyping) return;
        cameraManager.keyUpHandler(e);
      }); // On Key Press Event Run _keyHandler Function

      rightBtnSaveMenuDOM.on('click', function (e) {
        _rmbMenuActions(e);
      });
      rightBtnViewMenuDOM.on('click', function (e) {
        _rmbMenuActions(e);
      });
      rightBtnEditMenuDOM.on('click', function (e) {
        _rmbMenuActions(e);
      });
      rightBtnCreateMenuDOM.on('click', function (e) {
        _rmbMenuActions(e);
      });
      rightBtnDrawMenuDOM.on('click', function (e) {
        _rmbMenuActions(e);
      });
      rightBtnColorsMenuDOM.on('click', function (e) {
        _rmbMenuActions(e);
      });
      rightBtnEarthMenuDOM.on('click', function (e) {
        _rmbMenuActions(e);
      });
      $('#reset-camera-rmb').on('click', function (e) {
        _rmbMenuActions(e);
      });
      $('#clear-screen-rmb').on('click', function (e) {
        _rmbMenuActions(e);
      });
      $('#clear-lines-rmb').on('click', function (e) {
        _rmbMenuActions(e);
      });

      rightBtnSaveDOM.hover(() => {
        rightBtnSaveDOMDropdown();
      });
      rightBtnSaveDOM.click(() => {
        rightBtnSaveDOMDropdown();
      });
      rightBtnSaveMenuDOM.hover(null, function () {
        // Lost Focus
        rightBtnSaveMenuDOM.hide();
      });

      rightBtnViewDOM.hover(() => {
        rightBtnViewDOMDropdown();
      });
      rightBtnViewDOM.click(() => {
        rightBtnViewDOMDropdown();
      });
      rightBtnViewMenuDOM.hover(null, function () {
        // Lost Focus
        rightBtnViewMenuDOM.hide();
      });

      rightBtnEditDOM.hover(() => {
        rightBtnEditDOMDropdown();
      });
      rightBtnEditDOM.click(() => {
        rightBtnEditDOMDropdown();
      });
      rightBtnEditMenuDOM.hover(null, function () {
        // Lost Focus
        rightBtnEditMenuDOM.hide();
      });

      rightBtnCreateDOM.hover(() => {
        rightBtnCreateDOMDropdown();
      });
      rightBtnCreateDOM.click(() => {
        rightBtnCreateDOMDropdown();
      });
      rightBtnCreateMenuDOM.hover(null, function () {
        // Lost Focus
        rightBtnCreateMenuDOM.hide();
      });

      rightBtnDrawDOM.hover(() => {
        rightBtnDrawDOMDropdown();
      });
      rightBtnDrawDOM.click(() => {
        rightBtnDrawDOMDropdown();
      });
      rightBtnDrawMenuDOM.hover(null, function () {
        // Lost Focus
        rightBtnDrawMenuDOM.hide();
      });

      rightBtnColorsDOM.hover(() => {
        rightBtnColorsDOMDropdown();
      });
      rightBtnColorsDOM.click(() => {
        rightBtnColorsDOMDropdown();
      });
      rightBtnEarthMenuDOM.hover(null, function () {
        // Lost Focus
        rightBtnEarthMenuDOM.hide();
      });

      rightBtnEarthDOM.hover(() => {
        rightBtnEarthDOMDropdown();
      });
      rightBtnEarthDOM.click(() => {
        rightBtnEarthDOMDropdown();
      });
      rightBtnEarthMenuDOM.hover(null, function () {
        // Lost Focus
        rightBtnEarthMenuDOM.hide();
      });
    }
    var rightBtnSaveDOMDropdown = () => {
      uiManager.clearRMBSubMenu();
      var offsetX = rightBtnSaveDOM.offset().left < canvasDOM.innerWidth() / 2 ? 165 : -165;
      rightBtnSaveMenuDOM.css({
        'display': 'block',
        'text-align': 'center',
        'position': 'absolute',
        'left': rightBtnSaveDOM.offset().left + offsetX,
        'top': rightBtnSaveDOM.offset().top,
      });
      if (rightBtnSaveDOM.offset().top !== 0) {
        rightBtnSaveMenuDOM.show();
      } else {
        rightBtnSaveMenuDOM.hide();
      }
    };
    var rightBtnViewDOMDropdown = () => {
      uiManager.clearRMBSubMenu();
      var offsetX = rightBtnViewDOM.offset().left < canvasDOM.innerWidth() / 2 ? 165 : -165;
      rightBtnViewMenuDOM.css({
        'display': 'block',
        'text-align': 'center',
        'position': 'absolute',
        'left': rightBtnViewDOM.offset().left + offsetX,
        'top': rightBtnViewDOM.offset().top,
      });
      if (rightBtnViewDOM.offset().top !== 0) {
        rightBtnViewMenuDOM.show();
      } else {
        rightBtnViewMenuDOM.hide();
      }
    };
    var rightBtnEditDOMDropdown = () => {
      uiManager.clearRMBSubMenu();

      var offsetX = rightBtnEditDOM.offset().left < canvasDOM.innerWidth() / 2 ? 165 : -165;
      rightBtnEditMenuDOM.css({
        'display': 'block',
        'text-align': 'center',
        'position': 'absolute',
        'left': rightBtnEditDOM.offset().left + offsetX,
        'top': rightBtnEditDOM.offset().top,
      });
      if (rightBtnEditMenuDOM.offset().top !== 0) {
        rightBtnEditMenuDOM.show();
      } else {
        rightBtnEditMenuDOM.hide();
      }
    };
    var rightBtnCreateDOMDropdown = () => {
      uiManager.clearRMBSubMenu();

      var offsetX = rightBtnCreateDOM.offset().left < canvasDOM.innerWidth() / 2 ? 165 : -165;
      rightBtnCreateMenuDOM.css({
        'display': 'block',
        'text-align': 'center',
        'position': 'absolute',
        'left': rightBtnCreateDOM.offset().left + offsetX,
        'top': rightBtnCreateDOM.offset().top,
      });
      if (rightBtnCreateMenuDOM.offset().top !== 0) {
        rightBtnCreateMenuDOM.show();
      } else {
        rightBtnCreateMenuDOM.hide();
      }
    };
    var rightBtnDrawDOMDropdown = () => {
      uiManager.clearRMBSubMenu();
      var offsetX = rightBtnDrawDOM.offset().left < canvasDOM.innerWidth() / 2 ? 165 : -165;
      rightBtnDrawMenuDOM.css({
        'display': 'block',
        'text-align': 'center',
        'position': 'absolute',
        'left': rightBtnDrawDOM.offset().left + offsetX,
        'top': rightBtnDrawDOM.offset().top,
      });
      if (rightBtnDrawDOM.offset().top !== 0) {
        rightBtnDrawMenuDOM.show();
      } else {
        rightBtnDrawMenuDOM.hide();
      }
    };
    var rightBtnColorsDOMDropdown = () => {
      uiManager.clearRMBSubMenu();
      var offsetX = rightBtnColorsDOM.offset().left < canvasDOM.innerWidth() / 2 ? 165 : -165;
      rightBtnColorsMenuDOM.css({
        'display': 'block',
        'text-align': 'center',
        'position': 'absolute',
        'left': rightBtnColorsDOM.offset().left + offsetX,
        'top': rightBtnColorsDOM.offset().top,
      });
      if (rightBtnColorsDOM.offset().top !== 0) {
        rightBtnColorsMenuDOM.show();
      } else {
        rightBtnColorsMenuDOM.hide();
      }
    };
    var rightBtnEarthDOMDropdown = () => {
      uiManager.clearRMBSubMenu();
      var offsetX = rightBtnEarthDOM.offset().left < canvasDOM.innerWidth() / 2 ? 165 : -165;
      rightBtnEarthMenuDOM.css({
        'display': 'block',
        'text-align': 'center',
        'position': 'absolute',
        'left': rightBtnEarthDOM.offset().left + offsetX,
        'top': rightBtnEarthDOM.offset().top,
      });
      if (rightBtnEarthDOM.offset().top !== 0) {
        rightBtnEarthMenuDOM.show();
      } else {
        rightBtnEarthMenuDOM.hide();
      }
    };
    var _rmbMenuActions = (e) => {
      // No Right Click Without UI
      if (settingsManager.disableUI) return;

      var targetId = e.target.id;
      if (e.target.tagName == 'A') {
        targetId = e.target.parentNode.id;
      }
      if (e.target.tagName == 'UL') {
        targetId = e.target.firstChild.id;
      }
      switch (targetId) {
        case 'save-hd-rmb':
          uiManager.saveHiResPhoto('hd');
          break;
        case 'save-4k-rmb':
          uiManager.saveHiResPhoto('4k');
          break;
        case 'save-8k-rmb':
          uiManager.saveHiResPhoto('8k');
          break;
        case 'view-info-rmb':
          M.toast({
            html: 'Lat: ' + latLon.latitude.toFixed(3) + '<br/>Lon: ' + latLon.longitude.toFixed(3),
          });
          break;
        case 'view-sat-info-rmb':
          objectManager.setSelectedSat(clickedSat);
          break;
        case 'view-sensor-info-rmb':
          objectManager.setSelectedSat(clickedSat);
          $('#menu-sensor-info').on('click', () => {});
          break;
        case 'view-related-sats-rmb':
          var intldes = satSet.getSatExtraOnly(clickedSat).intlDes;
          var searchStr = intldes.slice(0, 8);
          uiManager.doSearch(searchStr);
          break;
        case 'view-curdops-rmb':
          var gpsDOP = satellite.getDOPs(latLon.latitude, latLon.longitude, 0);
          M.toast({
            html: 'HDOP: ' + gpsDOP.HDOP + '<br/>VDOP: ' + gpsDOP.VDOP + '<br/>PDOP: ' + gpsDOP.PDOP + '<br/>GDOP: ' + gpsDOP.GDOP + '<br/>TDOP: ' + gpsDOP.TDOP,
          });
          break;
        case 'view-24dops-rmb':
          if (!isDOPMenuOpen) {
            $('#dops-lat').val(latLon.latitude.toFixed(3));
            $('#dops-lon').val(latLon.longitude.toFixed(3));
            $('#dops-alt').val(0);
            $('#dops-el').val(settingsManager.gpsElevationMask);
            uiManager.bottomIconPress({
              currentTarget: { id: 'menu-dops' },
            });
          } else {
            uiManager.hideSideMenus();
            isDOPMenuOpen = true;
            $('#loading-screen').fadeIn(1000, function () {
              $('#dops-lat').val(latLon.latitude.toFixed(3));
              $('#dops-lon').val(latLon.longitude.toFixed(3));
              $('#dops-alt').val(0);
              $('#dops-el').val(settingsManager.gpsElevationMask);
              var lat = $('#dops-lat').val() * 1;
              var lon = $('#dops-lon').val() * 1;
              var alt = $('#dops-alt').val() * 1;
              // var el = $('#dops-el').val() * 1;
              satellite.getDOPsTable(lat, lon, alt);
              $('#menu-dops').addClass('bmenu-item-selected');
              $('#loading-screen').fadeOut('slow');
              $('#dops-menu').effect('slide', { direction: 'left', mode: 'show' }, 1000);
            });
          }
          break;
        case 'edit-sat-rmb':
          objectManager.setSelectedSat(clickedSat);
          if (!isEditSatMenuOpen) {
            uiManager.bottomIconPress({
              currentTarget: { id: 'menu-editSat' },
            });
          }
          break;
        case 'create-sensor-rmb':
          $('#customSensor-menu').effect('slide', { direction: 'left', mode: 'show' }, 1000);
          $('#menu-customSensor').addClass('bmenu-item-selected');
          sMM.isCustomSensorMenuOpen(true);
          $('#cs-telescope').on('click', () => {});
          $('#cs-lat').val(latLon.latitude);
          $('#cs-lon').val(latLon.longitude);
          $('#cs-hei').val(0);
          $('#cs-type').val('Optical');
          // $('#cs-telescope').prop('checked', false)
          $('#cs-minaz').val(0);
          $('#cs-maxaz').val(360);
          $('#cs-minel').val(10);
          $('#cs-maxel').val(90);
          $('#cs-minrange').val(0);
          $('#cs-maxrange').val(1000000);
          $('#customSensor').on('submit', () => {});
          break;
        case 'reset-camera-rmb':
          // if (cameraManager.cameraType.current == cameraManager.cameraType.fixedToSat) {
          //   // NOTE: Maybe a reset flag to move back to original position over time?
          //   camPitch = 0;
          //   camYaw = 0;
          // }
          cameraManager.panReset = true;
          cameraManager.localRotateReset = true;
          cameraManager.ftsRotateReset = true;
          break;
        case 'clear-lines-rmb':
          lineManager.clear();
          if (objectManager.isStarManagerLoaded) {
            starManager.isAllConstellationVisible = false;
          }
          break;
        case 'line-eci-axis-rmb':
          lineManager.create('ref', [10000, 0, 0], 'r');
          lineManager.create('ref', [0, 10000, 0], 'g');
          lineManager.create('ref', [0, 0, 10000], 'b');
          break;
        case 'line-earth-sat-rmb':
          lineManager.create('sat', clickedSat, 'p');
          break;
        case 'line-sensor-sat-rmb':
          // Sensor always has to be #2
          lineManager.create('sat5', [clickedSat, satSet.getIdFromSensorName(sensorManager.currentSensor.name)], 'p');
          break;
        case 'line-sat-sat-rmb':
          lineManager.create('sat3', [clickedSat, objectManager.selectedSat], 'p');
          break;
        case 'create-observer-rmb':
          $('#customSensor-menu').effect('slide', { direction: 'left', mode: 'show' }, 1000);
          $('#menu-customSensor').addClass('bmenu-item-selected');
          uiManager.setCustomSensorMenuOpen(true);
          $('#cs-lat').val(latLon.latitude);
          $('#cs-lon').val(latLon.longitude);
          $('#cs-hei').val(0);
          $('#cs-type').val('Observer');
          $('#customSensor').on('submit', () => {});
          uiManager.legendMenuChange('sunlight');
          satSet.setColorScheme(ColorScheme.sunlight, true);
          uiManager.colorSchemeChangeAlert(settingsManager.currentColorScheme);
          settingsManager.isForceColorScheme = true;
          satCruncher.postMessage({
            isSunlightView: true,
          });
          break;
        case 'colors-default-rmb':
          if (objectManager.isSensorManagerLoaded && sensorManager.currentSensor.lat != null) {
            uiManager.legendMenuChange('default');
          } else {
            uiManager.legendMenuChange('default');
          }
          satSet.setColorScheme(ColorScheme.default, true);
          uiManager.colorSchemeChangeAlert(settingsManager.currentColorScheme);
          break;
        case 'colors-sunlight-rmb':
          uiManager.legendMenuChange('sunlight');
          satSet.setColorScheme(ColorScheme.sunlight, true);
          uiManager.colorSchemeChangeAlert(settingsManager.currentColorScheme);
          settingsManager.isForceColorScheme = true;
          satCruncher.postMessage({
            isSunlightView: true,
          });
          break;
        case 'colors-country-rmb':
          uiManager.legendMenuChange('countries');
          satSet.setColorScheme(ColorScheme.countries);
          uiManager.colorSchemeChangeAlert(settingsManager.currentColorScheme);
          break;
        case 'colors-velocity-rmb':
          uiManager.legendMenuChange('velocity');
          satSet.setColorScheme(ColorScheme.velocity);
          uiManager.colorSchemeChangeAlert(settingsManager.currentColorScheme);
          break;
        case 'colors-ageOfElset-rmb':
          uiManager.legendMenuChange('ageOfElset');
          satSet.setColorScheme(ColorScheme.ageOfElset);
          uiManager.colorSchemeChangeAlert(settingsManager.currentColorScheme);
          break;
        case 'earth-blue-rmb':
          settingsManager.blueImages = true;
          settingsManager.nasaImages = false;
          settingsManager.trusatImages = false;
          settingsManager.lowresImages = false;
          settingsManager.hiresImages = false;
          settingsManager.hiresNoCloudsImages = false;
          settingsManager.vectorImages = false;
          localStorage.setItem('lastMap', 'blue');
          earth.init();
          earth.loadHiRes();
          earth.loadHiResNight();
          break;
        case 'earth-nasa-rmb':
          settingsManager.blueImages = false;
          settingsManager.nasaImages = true;
          settingsManager.trusatImages = false;
          settingsManager.lowresImages = false;
          settingsManager.hiresImages = false;
          settingsManager.hiresNoCloudsImages = false;
          settingsManager.vectorImages = false;
          localStorage.setItem('lastMap', 'nasa');
          earth.init();
          earth.loadHiRes();
          earth.loadHiResNight();
          break;
        case 'earth-trusat-rmb':
          settingsManager.blueImages = false;
          settingsManager.nasaImages = false;
          settingsManager.trusatImages = true;
          settingsManager.lowresImages = false;
          settingsManager.hiresImages = false;
          settingsManager.hiresNoCloudsImages = false;
          settingsManager.vectorImages = false;
          localStorage.setItem('lastMap', 'trusat');
          earth.init();
          earth.loadHiRes();
          earth.loadHiResNight();
          break;
        case 'earth-low-rmb':
          settingsManager.blueImages = false;
          settingsManager.nasaImages = false;
          settingsManager.trusatImages = false;
          settingsManager.lowresImages = true;
          settingsManager.hiresImages = false;
          settingsManager.hiresNoCloudsImages = false;
          settingsManager.vectorImages = false;
          localStorage.setItem('lastMap', 'low');
          earth.init();
          earth.loadHiRes();
          earth.loadHiResNight();
          break;
        case 'earth-high-rmb':
          $('#loading-screen').fadeIn(1000, function () {
            settingsManager.blueImages = false;
            settingsManager.nasaImages = false;
            settingsManager.trusatImages = false;
            settingsManager.lowresImages = false;
            settingsManager.hiresImages = true;
            settingsManager.hiresNoCloudsImages = false;
            settingsManager.vectorImages = false;
            localStorage.setItem('lastMap', 'high');
            earth.init();
            earth.loadHiRes();
            earth.loadHiResNight();
            $('#loading-screen').fadeOut('slow');
          });
          break;
        case 'earth-high-no-clouds-rmb':
          $('#loading-screen').fadeIn(1000, function () {
            settingsManager.blueImages = false;
            settingsManager.nasaImages = false;
            settingsManager.trusatImages = false;
            settingsManager.lowresImages = false;
            settingsManager.hiresImages = false;
            settingsManager.hiresNoCloudsImages = true;
            settingsManager.vectorImages = false;
            localStorage.setItem('lastMap', 'high-nc');
            earth.init();
            earth.loadHiRes();
            earth.loadHiResNight();
            $('#loading-screen').fadeOut('slow');
          });
          break;
        case 'earth-vec-rmb':
          settingsManager.blueImages = false;
          settingsManager.nasaImages = false;
          settingsManager.trusatImages = false;
          settingsManager.lowresImages = false;
          settingsManager.hiresImages = false;
          settingsManager.hiresNoCloudsImages = false;
          settingsManager.vectorImages = true;
          localStorage.setItem('lastMap', 'vec');
          earth.init();
          earth.loadHiRes();
          earth.loadHiResNight();
          break;
        case 'clear-screen-rmb':
          (function clearScreenRMB() {
            // Clear Lines first
            lineManager.clear();
            if (objectManager.isStarManagerLoaded) {
              starManager.isAllConstellationVisible = false;
            }

            // Now clear everything else
            uiManager.doSearch('');
            uiManager.searchToggle(false);
            uiManager.hideSideMenus();
            $('#menu-space-stations').removeClass('bmenu-item-selected');

            if ((!objectManager.isSensorManagerLoaded || sensorManager.currentSensor.lat != null) && cameraManager.cameraType.current !== cameraManager.cameraType.planetarium && cameraManager.cameraType.current !== cameraManager.cameraType.astronomy) {
              uiManager.legendMenuChange('default');
            }

            objectManager.setSelectedSat(-1);
          })();
          break;
      }
      rightBtnMenuDOM.hide();
      uiManager.clearRMBSubMenu();
    };
  })();
});

export { dlManager, gl };