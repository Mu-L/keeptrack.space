"use strict";
(self["webpackChunkkeeptrack_space"] = self["webpackChunkkeeptrack_space"] || []).push([["src_js_plugins_classification_classification_ts"],{

/***/ "./src/js/plugins/classification/classification.ts":
/*!*********************************************************!*\
  !*** ./src/js/plugins/classification/classification.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "init": () => (/* binding */ init)
/* harmony export */ });
/* harmony import */ var _app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @app/js/api/keepTrackApi */ "./src/js/api/keepTrackApi.ts");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);


const init = () => {
    _app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.register({
        method: 'uiManagerInit',
        cbName: 'classification',
        cb: () => {
            if (settingsManager.classificationStr !== '') {
                jquery__WEBPACK_IMPORTED_MODULE_1___default()('#main-container').prepend(_app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.html `
        <div id="classification-container">
          <span>${settingsManager.classificationStr}</span>
        </div>        
      `);
                let topMenuHeight = parseInt(document.documentElement.style.getPropertyValue('--top-menu-height').replace('px', ''));
                if (isNaN(topMenuHeight))
                    topMenuHeight = 0;
                document.documentElement.style.setProperty('--top-menu-height', topMenuHeight + 20 + 'px');
                if (settingsManager.classificationStr.slice(0, 12) === 'Unclassified') {
                    jquery__WEBPACK_IMPORTED_MODULE_1___default()('#classification-container').css({ 'background-color': 'var(--classificationUnclassifiedBackgroundColor)', 'color': 'white' });
                }
                if (settingsManager.classificationStr.slice(0, 6) === 'Secret') {
                    jquery__WEBPACK_IMPORTED_MODULE_1___default()('#classification-container').css({ 'background-color': 'var(--classificationSecretBackgroundColor)', 'color': 'white' });
                }
                if (settingsManager.classificationStr.slice(0, 10) === 'Top Secret') {
                    jquery__WEBPACK_IMPORTED_MODULE_1___default()('#classification-container').css({ 'background-color': 'var(--classificationTopSecretBackgroundColor)', 'color': 'black' });
                }
                if (settingsManager.classificationStr.slice(0, 15) === 'Top Secret//SCI') {
                    jquery__WEBPACK_IMPORTED_MODULE_1___default()('#classification-container').css({ 'background-color': 'var(--classificationTopSecretSCIBackgroundColor)', 'color': 'black' });
                }
            }
        },
    });
};


/***/ })

}]);
//# sourceMappingURL=src_js_plugins_classification_classification_ts.654b968174404e3b07f4.js.map