"use strict";
(self["webpackChunkkeeptrack_space"] = self["webpackChunkkeeptrack_space"] || []).push([["src_js_plugins_topMenu_topMenu_ts"],{

/***/ "./src/js/plugins/topMenu/topMenu.ts":
/*!*******************************************!*\
  !*** ./src/js/plugins/topMenu/topMenu.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "init": () => (/* binding */ init)
/* harmony export */ });
/* harmony import */ var _app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @app/js/api/keepTrackApi */ "./src/js/api/keepTrackApi.ts");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


const init = () => {
    // Add HTML
    _app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.register({
        method: 'uiManagerInit',
        cbName: 'topMenu',
        cb: () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Bottom Icon
                jquery__WEBPACK_IMPORTED_MODULE_1___default()('#header').append(_app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.html `
          <nav>
            <div id="nav-wrapper" class="nav-wrapper">
              <a id="share-icon" class="top-menu-icons"><img src="img/share-icon.png" alt="" /></a>
              <ul id="nav-mobile2" class="right">
                <li>
                  <a id="geolocation-btn" class="start-hidden" href="#!"><i class="material-icons">location_on</i></a>
                </li>
                <li>
                  <a id="legend-menu" class="top-menu-btns">
                    <!-- <span>Legend &#x25BC;</span> -->
                    <div id="legend-icon" class="top-menu-icons">
                      <img src="img/layers-icon.png" alt="" />
                    </div>
                  </a>
                </li>
                <li>
                  <a id="tutorial-btn" class="top-menu-btns">
                    <div id="tutorial-icon" class="top-menu-icons">
                      <img src="img/help.png" alt="" />
                    </div>
                  </a>
                </li>
                <li>
                  <a id="fullscreen-icon" class="top-menu-icons"><img src="img/fullscreen-icon.png" alt="" /></a>
                </li>
                <li>
                  <a id="search-icon" class="top-menu-icons">
                    <img
                      alt="search-icon"
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAQAAABIkb+zAAAC/UlEQVR4Ae3ZAWSUYRjA8WdmWVQg2CZV1RoNKmrdUtUFqBoKLQISGQKUoVrAKthi0QBAwQJWVFvbGmbbKIMVTRpyOxszs7P7F4L38bVu933PexfvD4Dj/fO47/W8EgRBEARBEBSLHbTRxUuGmGGFJb7ygZd00UadlDcO0cEU65mkg8NSjmhmjEKN0SzlhD30sVF97JRyQCUdrFKMFTqolNKihlHiGKVGSocmMsSVoUlKg1ZyJCFHq/jH8XUmP0M3Z2mklmqqqeEgabrI8jerHBe/2EWWaP20UCURqKKFfqJl2S3+UMUUUd78e545wRuiTKlsSzxGgxxXpEBcjxy/J+IHR8mjZUnJBnCCLFqeo2KPCqbRFtgvG8R+FtCmqRBrXETLc06KwDnyaBfFGgNo7VIk2tHeiy3q0SYkBsbRGsQSnWhNEgMptE6xxByuVxITr3D9EDscQDstMXHG4xBxE9c8FQn8LWdw3RIrPMP1XBJAL64escIgrlZJAFdxDYoVvuE6KQngJK5ZsUIWV73Jt2VerJDHtVUSwFZca2KFVVxbJAFswZX730doUawwi+uUJIBTuL6LFd7jupbQdsM1IFbowdVr8iHr9XeVyFCZwGpyHtcNsUIDWlpiIo12UOzw0/w6PSeWeISWirld1brFEg1o4xIDE2hHxBZv0e5KkbiLNiLWuJDYWiVNHu28j8XW50QWW/tYQBsWHziWwGoxFblaPCJ+8ATQcoVfLLhGDtCeii9sYpIorwtYrzfTT5QvbPP7sFrMA8cl3hFtmQb/D9vrPzGlaaSOzVRTSyNpulWyDjgvvulJTsg98YcUGeJaZA3XHfGHOkaIY5Z6WqCUCZU8YIVi5Ohhu/wGvhMUdtLHRr1mn/wBpUhQaGaSQn3kqvNbSpWgcJiHTLGeT7SzVxTulzZBoY42unjBEDMsAbDMMJ1cplYUswT/QkLphQRrIeF2SIghJISEkBASrAPsE+yPb59gf3z7BKsrhX2C/fHtE8r++EEQBEEQBEHwCzxeS6g0gBDHAAAAAElFTkSuQmCC"
                    />
                  </a>
                </li>
                <div id="search-holder" class="menu-item search-slide-up">
                  <input id="search" type="search" name="search" placeholder="Search.." required />
                </div>
              </ul>
            </div>
            <div id="social-alt" class="left">
              <div id="share-icon-container">
                <a id="github-share" class="share-up share-icons" rel="noreferrer" href="https://github.com/thkruz/keeptrack.space/" target="_blank">
                  <img
                    alt="github"
                    width="32"
                    height="32"
                    src="data:image/png;base64,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"
                  />
                </a>
                <a id="twitter-share" class="share-up share-icons" rel="noreferrer" href="https://twitter.com/intent/tweet?text=http://keeptrack.space" target="_blank">
                  <img
                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTI4IDguNTU3YTkuOTEzIDkuOTEzIDAgMCAxLTIuODI4Ljc3NSA0LjkzIDQuOTMgMCAwIDAgMi4xNjYtMi43MjUgOS43MzggOS43MzggMCAwIDEtMy4xMyAxLjE5NCA0LjkyIDQuOTIgMCAwIDAtMy41OTMtMS41NSA0LjkyNCA0LjkyNCAwIDAgMC00Ljc5NCA2LjA0OWMtNC4wOS0uMjEtNy43Mi0yLjE3LTEwLjE1LTUuMTVhNC45NDIgNC45NDIgMCAwIDAtLjY2NSAyLjQ3N2MwIDEuNzEuODcgMy4yMTQgMi4xOSA0LjFhNC45NjggNC45NjggMCAwIDEtMi4yMy0uNjE2di4wNmMwIDIuMzkgMS43IDQuMzggMy45NTIgNC44My0uNDE0LjExNS0uODUuMTc0LTEuMjk3LjE3NC0uMzE4IDAtLjYyNi0uMDMtLjkyOC0uMDg2YTQuOTM1IDQuOTM1IDAgMCAwIDQuNiAzLjQyIDkuODkzIDkuODkzIDAgMCAxLTYuMTE0IDIuMTA3Yy0uMzk4IDAtLjc5LS4wMjMtMS4xNzUtLjA2OGExMy45NTMgMTMuOTUzIDAgMCAwIDcuNTUgMi4yMTNjOS4wNTYgMCAxNC4wMS03LjUwNyAxNC4wMS0xNC4wMTMgMC0uMjEzLS4wMDUtLjQyNi0uMDE1LS42MzcuOTYtLjY5NSAxLjc5NS0xLjU2IDIuNDU1LTIuNTV6Ii8+PC9zdmc+"
                    width="32"
                    height="32"
                  />
                </a>
              </div>
            </div>
          </nav>        
        `);
                jquery__WEBPACK_IMPORTED_MODULE_1___default()('#main-container').append(_app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.html `
          <div id="help-screen" class="valign-wrapper">
            <div id="help-inner-container" class="valign">
              <p>
                <span id="help-header" class="logo-font">TITLE</span>
                <span id="help-close">X</span>
              </p>
              <span id="help-text">ADVICE</span>
            </div>
          </div>
        `);
                yield Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! @app/js/uiManager/adviceManager */ "./src/js/uiManager/adviceManager.ts")).then((mod) => {
                    mod.init();
                    _app_js_api_keepTrackApi__WEBPACK_IMPORTED_MODULE_0__.keepTrackApi.programs.uiManager.menuController();
                });
            }
            catch (e) {
                /* istanbul ignore next */
                console.debug(e);
            }
        }),
    });
};


/***/ })

}]);
//# sourceMappingURL=src_js_plugins_topMenu_topMenu_ts.040c1dd5efcff06487a6.js.map