"use strict";
(self["webpackChunkkeeptrack_space"] = self["webpackChunkkeeptrack_space"] || []).push([["src_js_plugins_nextLaunch_nextLaunch_ts"],{

/***/ "./src/js/plugins/nextLaunch/nextLaunch.ts":
/*!*************************************************!*\
  !*** ./src/js/plugins/nextLaunch/nextLaunch.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getTableElement": () => (/* binding */ getTableElement),
/* harmony export */   "makeTableHeaders": () => (/* binding */ makeTableHeaders),
/* harmony export */   "initTable": () => (/* binding */ initTable),
/* harmony export */   "hideSideMenus": () => (/* binding */ hideSideMenus),
/* harmony export */   "uiManagerInit": () => (/* binding */ uiManagerInit),
/* harmony export */   "init": () => (/* binding */ init),
/* harmony export */   "bottomMenuClick": () => (/* binding */ bottomMenuClick),
/* harmony export */   "nextLaunchManager": () => (/* binding */ nextLaunchManager)
/* harmony export */ });
/* harmony import */ var _app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @app/js/api/keepTrackApi */ "./src/js/api/keepTrackApi.ts");
/* harmony import */ var _app_js_lib_external_dateFormat_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @app/js/lib/external/dateFormat.js */ "./src/js/lib/external/dateFormat.js");
/* harmony import */ var _app_js_lib_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @app/js/lib/helpers */ "./src/js/lib/helpers.ts");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _app_img_icons_calendar2_png__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @app/img/icons/calendar2.png */ "./src/img/icons/calendar2.png");





/* */
let isNextLaunchMenuOpen = false;
/**
 * @returns {HTMLTableElement | boolean} The Table Element to be modified in the UI or a false boolean to kill the parent method
 */
const getTableElement = () => {
    const tbl = document.getElementById('nextLaunch-table'); // Identify the table to update
    if (tbl == null) {
        return false;
    }
    return tbl;
};
const makeTableHeaders = (tbl) => {
    const tr = tbl.insertRow();
    const tdT = tr.insertCell();
    tdT.appendChild(document.createTextNode('Launch Window'));
    tdT.setAttribute('style', 'text-decoration: underline; width: 120px;');
    const tdN = tr.insertCell();
    tdN.appendChild(document.createTextNode('Mission'));
    tdN.setAttribute('style', 'text-decoration: underline; width: 140px;');
    const tdL = tr.insertCell();
    tdL.appendChild(document.createTextNode('Location'));
    tdL.setAttribute('style', 'text-decoration: underline');
    const tdA = tr.insertCell();
    tdA.appendChild(document.createTextNode('Agency'));
    tdA.setAttribute('style', 'text-decoration: underline');
    const tdC = tr.insertCell();
    tdC.appendChild(document.createTextNode('Country'));
    tdC.setAttribute('style', 'text-decoration: underline');
};
const initTable = (tbl, launchList) => {
    makeTableHeaders(tbl);
    for (let i = 0; i < launchList.length; i++) {
        const tr = tbl.insertRow();
        // Time Cells
        const tdT = tr.insertCell();
        let timeText;
        if (launchList[i].windowStart.valueOf() <= Date.now() - 1000 * 60 * 60 * 24) {
            timeText = 'TBD';
        }
        else {
            timeText = (0,_app_js_lib_external_dateFormat_js__WEBPACK_IMPORTED_MODULE_1__.dateFormat)(launchList[i].windowStart, 'isoDateTime', true) + ' UTC';
        }
        tdT.appendChild(document.createTextNode(timeText));
        // Name Cells
        const tdN = tr.insertCell();
        // Mission Name Text
        const nameText = typeof launchList[i].missionName != 'undefined' ? launchList[i].missionName : 'Unknown';
        // Mission Name HTML Setup
        let nameHTML;
        if (typeof launchList[i].missionURL == 'undefined' || launchList[i].missionURL == '') {
            nameHTML = `${(0,_app_js_lib_helpers__WEBPACK_IMPORTED_MODULE_2__.truncateString)(nameText, 15)}`;
        }
        else {
            nameHTML = `<a class='iframe' href="${launchList[i].missionURL}">${(0,_app_js_lib_helpers__WEBPACK_IMPORTED_MODULE_2__.truncateString)(nameText, 15)}</a>`;
        }
        // Rocket Name HTML Setup
        let rocketHTML;
        if (typeof launchList[i].rocketURL == 'undefined') {
            rocketHTML = `${launchList[i].rocket}`;
        }
        else {
            rocketHTML = `<a class='iframe' href="${launchList[i].rocketURL}">${launchList[i].rocket}</a>`;
        }
        // Set Name and Rocket HTML
        tdN.innerHTML = `${nameHTML}<br />${rocketHTML}`;
        // Location Name HTML Setup
        let locationHTML;
        if (typeof launchList[i].locationURL == 'undefined' || launchList[i].locationURL == '') {
            locationHTML = `${(0,_app_js_lib_helpers__WEBPACK_IMPORTED_MODULE_2__.truncateString)(launchList[i].location, 25)}`;
        }
        else {
            locationHTML = `<a class='iframe' href="${launchList[i].locationURL}">${(0,_app_js_lib_helpers__WEBPACK_IMPORTED_MODULE_2__.truncateString)(launchList[i].location, 25)}</a>`;
        }
        const tdL = tr.insertCell();
        tdL.innerHTML = locationHTML;
        // Agency Name HTML Setup
        let agencyHTML;
        if (typeof launchList[i].agencyURL == 'undefined') {
            agencyHTML = `${(0,_app_js_lib_helpers__WEBPACK_IMPORTED_MODULE_2__.truncateString)(launchList[i].agency, 30)}`;
        }
        else {
            agencyHTML = `<a class='iframe' href="${launchList[i].agencyURL}">${(0,_app_js_lib_helpers__WEBPACK_IMPORTED_MODULE_2__.truncateString)(launchList[i].agency, 30)}</a>`;
        }
        const tdA = tr.insertCell();
        tdA.innerHTML = agencyHTML;
        // Country Cell
        const tdC = tr.insertCell();
        tdC.innerHTML = `<span class="badge dark-blue-badge" data-badge-caption="${launchList[i].country}"></span>`;
    }
};
const hideSideMenus = () => {
    jquery__WEBPACK_IMPORTED_MODULE_3___default()('#nextLaunch-menu').effect('slide', { direction: 'left', mode: 'hide' }, 1000);
    jquery__WEBPACK_IMPORTED_MODULE_3___default()('#menu-nextLaunch').removeClass('bmenu-item-selected');
    isNextLaunchMenuOpen = false;
};
const uiManagerInit = () => {
    // Side Menu
    jquery__WEBPACK_IMPORTED_MODULE_3___default()('#left-menus').append(_app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.html `
      <div id="nextLaunch-menu" class="side-menu-parent start-hidden text-select">
        <div id="nextLaunch-content" class="side-menu">
          <div class="row">
            <h5 class="center-align">Next Launches</h5>
            <table id="nextLaunch-table" class="center-align striped-light centered"></table>
          </div>
          <div class="row">
            <center>
              <button id="export-launch-info" class="btn btn-ui waves-effect waves-light">Export Launch Info &#9658;</button>
            </center>
          </div>
        </div>
      </div>
    `);
    // Bottom Icon
    jquery__WEBPACK_IMPORTED_MODULE_3___default()('#bottom-icons').append(_app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.html `
        <div id="menu-nextLaunch" class="bmenu-item">
          <img alt="calendar" src="" delayedsrc="${_app_img_icons_calendar2_png__WEBPACK_IMPORTED_MODULE_4__}" />
          <span class="bmenu-title">Next Launches</span>
          <div class="status-icon"></div>
        </div>
      `);
    jquery__WEBPACK_IMPORTED_MODULE_3___default()('#nextLaunch-menu').resizable({
        handles: 'e',
        stop: function () {
            jquery__WEBPACK_IMPORTED_MODULE_3___default()(this).css('height', '');
        },
        maxWidth: 650,
        minWidth: 450,
    });
    jquery__WEBPACK_IMPORTED_MODULE_3___default()('#export-launch-info').on('click', function () {
        (0,_app_js_lib_helpers__WEBPACK_IMPORTED_MODULE_2__.saveCsv)(nextLaunchManager.launchList, 'launchList');
    });
};
const init = () => {
    // Load CSS
    __webpack_require__.e(/*! import() */ "src_js_plugins_nextLaunch_nextLaunch_css").then(__webpack_require__.bind(__webpack_require__, /*! @app/js/plugins/nextLaunch/nextLaunch.css */ "./src/js/plugins/nextLaunch/nextLaunch.css")).then((resp) => resp);
    // Add HTML
    _app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.register({
        method: 'uiManagerInit',
        cbName: 'nextLaunchManager',
        cb: uiManagerInit,
    });
    // Add JavaScript
    _app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.register({
        method: 'bottomMenuClick',
        cbName: 'nextLaunch',
        cb: bottomMenuClick,
    });
    _app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.register({
        method: 'hideSideMenus',
        cbName: 'nextLaunch',
        cb: hideSideMenus,
    });
    _app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.register({
        method: 'onCruncherReady',
        cbName: 'nextLaunch',
        cb: () => {
            nextLaunchManager.init();
        },
    });
};
const bottomMenuClick = (iconName) => {
    if (iconName === 'menu-nextLaunch') {
        if (isNextLaunchMenuOpen) {
            _app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.programs.uiManager.hideSideMenus();
            isNextLaunchMenuOpen = false;
            return;
        }
        else {
            _app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.programs.uiManager.hideSideMenus();
            nextLaunchManager.showTable();
            jquery__WEBPACK_IMPORTED_MODULE_3___default()('#nextLaunch-menu').effect('slide', { direction: 'left', mode: 'show' }, 1000);
            isNextLaunchMenuOpen = true;
            jquery__WEBPACK_IMPORTED_MODULE_3___default()('#menu-nextLaunch').addClass('bmenu-item-selected');
            return;
        }
    }
};
const nextLaunchManager = {
    launchList: [],
    init: () => {
        if (settingsManager.offline)
            jquery__WEBPACK_IMPORTED_MODULE_3___default()('#menu-nextLaunch').hide();
    },
    showTable: () => {
        if (nextLaunchManager.launchList.length === 0) {
            if (window.location.hostname !== 'localhost') {
                fetch('https://ll.thespacedevs.com/2.0.0/launch/upcoming/?format=json&limit=20&mode=detailed')
                    .then((resp) => resp.json())
                    .then((data) => nextLaunchManager.processData(data))
                    .catch(() => console.debug(`https://ll.thespacedevs.com/2.0.0/ is Unavailable!`))
                    .finally(() => {
                    const tbl = getTableElement();
                    if (typeof tbl == 'boolean')
                        return;
                    // Only needs populated once
                    if (tbl.innerHTML == '') {
                        initTable(tbl, nextLaunchManager.launchList);
                        try {
                            jquery__WEBPACK_IMPORTED_MODULE_3___default()('a.iframe').colorbox({
                                iframe: true,
                                width: '80%',
                                height: '80%',
                                fastIframe: false,
                                closeButton: false,
                            });
                        }
                        catch (error) {
                            console.warn(error);
                        }
                    }
                });
            }
        }
    },
    processData: (resp) => {
        for (let i = 0; i < resp.results.length; i++) {
            /**
             * Info from launchlibrary.net
             */
            const launchLibResult = resp.results[i];
            const launchInfo = {
                name: '',
                updated: null,
                windowStart: new Date(launchLibResult.window_start),
                windowEnd: new Date(launchLibResult.window_end),
                location: '',
                locationURL: '',
                agency: '',
                agencyURL: '',
                country: '',
                mission: '',
                missionName: '',
                missionType: '',
                missionURL: '',
                rocket: '',
                rocketConfig: '',
                rocketFamily: '',
                rocketURL: '',
            };
            if (typeof launchLibResult.last_updated !== 'undefined')
                launchInfo.updated = new Date(launchLibResult.last_updated);
            launchInfo.name = typeof launchLibResult.name != 'undefined' ? launchLibResult.name : 'Unknown';
            launchInfo.location = launchLibResult.pad.location.name.split(',', 1);
            launchInfo.location = launchInfo.location[0];
            launchInfo.locationURL = launchLibResult.pad.wiki_url;
            if (typeof launchLibResult.launch_service_provider != 'undefined') {
                launchInfo.agency = typeof launchLibResult.launch_service_provider.name != 'undefined' ? launchLibResult.launch_service_provider.name : 'Unknown';
                launchInfo.country = typeof launchLibResult.launch_service_provider.country_code != 'undefined' ? launchLibResult.launch_service_provider.country_code : 'Unknown';
                if (typeof launchLibResult.launch_service_provider.wiki_url != 'undefined') {
                    launchInfo.agencyURL = launchLibResult.launch_service_provider.wiki_url;
                }
            }
            else {
                launchInfo.agency = 'Unknown';
                launchInfo.country = 'UNK';
                launchInfo.agencyURL = '';
            }
            if (launchLibResult.mission != null) {
                launchInfo.mission = launchLibResult.mission.description;
                launchInfo.missionName = launchLibResult.mission.name;
                launchInfo.missionType = launchLibResult.mission.type;
                if (typeof launchLibResult.mission.wiki_url != 'undefined') {
                    launchInfo.missionURL = launchLibResult.mission.wiki_url;
                }
            }
            launchInfo.rocket = launchLibResult.rocket.configuration.full_name;
            launchInfo.rocketConfig = launchLibResult.rocket.configuration.name;
            launchInfo.rocketFamily = launchLibResult.rocket.configuration.family;
            if (typeof launchLibResult.rocket.configuration.wiki_url != 'undefined') {
                launchInfo.rocketURL = launchLibResult.rocket.configuration.wiki_url;
            }
            nextLaunchManager.launchList[i] = launchInfo;
        }
    },
};


/***/ }),

/***/ "./src/img/icons/calendar2.png":
/*!*************************************!*\
  !*** ./src/img/icons/calendar2.png ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "6fac2e8cbe396d70215a.png";

/***/ })

}]);
//# sourceMappingURL=src_js_plugins_nextLaunch_nextLaunch_ts.62617ed7bd1eebf4663a.js.map