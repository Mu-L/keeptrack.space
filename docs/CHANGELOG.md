### Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

#### v11.0.1

>  

- docs: :memo: add v11 "Copernicus" release notes and update CHANGELOG.md
- build: :coffin: remove old toml files
- ci: :construction_worker: set branch to 'diagram' for repo-visualizer workflow
- ci: :construction_worker: add artifact_name to repo-visualizer workflow

#### v11.0.0

>  

- Maneuver detection
- chore(deps-dev): bump @babel/core from 7.26.10 to 7.28.4
- fix: applied null safe checks
- fix: :bug: fix missing dependencies for normal build
- Develop
- fix: :bug: add warning message for satellite orbit optimization and i…
- 10.8.4
- v10.8.3
- v10.8.2
- chore: :bookmark: update subproject commit reference in plugins-pro
- chore: :bookmark: update subproject commit reference in plugins-pro
- Develop
- Develop
- 10.8.0
- Develop
- Develop
- Develop
- Develop
- Develop
- Develop
- fix: :bug: update logo image path and format URLs in installation ins…
- Develop
- Develop
- Develop
- Develop
- fix: :bug: standardize texture quality values to lowercase in MobileM…
- Develop
- fix: :bug: Improve Safari detection logic for better browser compatib…
- fix: :bug: add warning message for satellite orbit optimization and improve error handling for input validation
- feat: :sparkles: Add dwarf planet rendering class and texture support
- feat: :sparkles: Add Pluto dwarf-planet renderer and make orbit paths accept vec4 points; enable Pluto in planets menu
- refactor: :globe_with_meridians: Add localization support for splash screen and filter menu in multiple languages
- build: :fire: remove pnpm-lock
- refactor: :fire: remove auto generated locale files
- feat: :sparkles: enhance mesh loading and rendering capabilities
- feat: add Planets Menu Plugin with localization and UI integration
- test: :white_check_mark: update tests to match v11 architecture
- feat: :sparkles: add more of the solar system
- refactor: :recycle: Refactor HTML rendering in plugins to use new html utility
- refactor: :recycle: Refactor input manager and mouse input to use ServiceLocator for improved dependency management
- feat: :sparkles: add VCR plugin with playback controls and integrate into top menu
- feat: :sparkles: add alphaMap and alphaImage support in ShaderMaterial
- feat: :sparkles: add Uranus rings rendering and integrate with Uranus class
- refactor: :recycle: Replace keepTrackContainer with Container instance for improved dependency management
- feat: :sparkles: implement Saturn rings rendering and integrate with Saturn class
- refactor: :zap: enhance Godrays shader performance and add randomness to sun rendering
- feat: :sparkles: add draco encoder/decoder for future support
- refactor: :recycle: Replace keepTrackApi.glsl with glsl function for shader code formatting consistency
- feat: :sparkles: add translation generation tasks and update mergeLocales method for improved locale management
- refactor: :zap: optimize Godrays shader and improve performance
- refactor: :recycle: disable unnecessary plugins and clean up settings for improved readability
- feat: :sparkles: enhance color scheme management with enable/disable setting
- feat: :sparkles: enhance calendar input handling with text input option
- test: :white_check_mark: fix tests that were broken due to new engine updates
- test: :white_check_mark: add mobile and desktop tests for LegendManager class functionality
- refactor: :alien: update celestrak version
- feat: :sparkles: update occlusion drawing logic to handle different center bodies
- refactor: :zap: simplify shader calculations in DotsManager
- build: :recycle: replace opener with custom openFile function for cross-platform compatibility
- refactor: :recycle: Update plugin imports to use 'plugins-pro'
- fix: :bug: revert star changes and rename shader attribute from a_star to a_size for clarity
- feat: :sparkles: add low priority scene loading and event listener for KeepTrack readiness
- fix: :bug: fix setCurrentModel method to reset rotation only when model name changes
- feat: :sparkles: update celestial bodies list and enhance zoom distance settings for Sun and Earth
- fix: :bug: simplify camera distance checks and enforce minimum distance in CameraState
- fix: :bug: enable more camera distance checks for satellite shader minimum size
- fix: :bug: update layers menu icon classes for consistent styling
- fix: :bug: remove unnecessary type assertions for position and rotation arrays
- fix: :bug: add localization import and initialize early in KeepTrack class
- refactor: :recycle: clean up imports and improve jday existence check in DateTimeManager
- fix: :bug: add missing styles for colorbox title to fix layout
- fix: :bug: validate planet selection in changePlanet method to prevent invalid inputs
- fix: :bug: validate selected planet before setting zoom distances in PlanetsMenuPlugin
- chore: :recycle: move maxSize property in shader settings for improved object sizing
- test: :white_check_mark: update Jest snapshot for moon position calculation in drawManager
- fix: :bug: adjust depth test handling for Earth based on camera zoom level
- refactor: :recycle: Update Earth class to use glsl import and conditionally disable depth test
- refactor: :recycle: improve cloud densitiy
- fix: :bug: remove unnecessary whitespace in top menu item HTML structure
- chore: :heavy_minus_sign: remove unused dependencies from package.json
- build: :arrow_up: bump @types/node
- fix: :bug: update lint script to target the src directory for improved code quality checks
- feat: :sparkles: add Mars wallpaper and update splash screen image list
- chore: :heavy_minus_sign: remove path-to-regexp dependency from package.json
- feat: :sparkles: add world shift calculation for Sun in WebGLRenderer
- fix: :bug: disable VCR plugin by default for improved user experience
- fix: :bug: update draggable box background color to use CSS variable for consistency
- Merge branches 'develop' and 'develop' of https://github.com/thkruz/keeptrack.space into develop
- refactor: :truck: restructure src into app and engine folders
- refactor: :truck: restructure src into app and engine folders
- refactor: :truck: Refactor camera state management and input handling
- feat: :sparkles: improve automated building of localization files and update filter menu translations
- feat: :globe_with_meridians: Add common translations in multiple languages
- Pre main branch merge
- test: :white_check_mark: Add unit tests for various color schemes in rendering engine
- refactor: :recycle: isolate the engine from the application
- feat: :sparkles: implement draggable boxes and convert legends to layers
- chore: :globe_with_meridians: update generated localization for multiple languages
- feat: :globe_with_meridians: Add localization support for satellite orbital data in multiple languages
- refactor: :recycle: migrate from npm "ootk" to local ootk submodule and wire tooling
- refactor: :recycle: update .gitignore to exclude keys.ts and remove generated keys.ts file
- refactor: :recycle: Refactor camera state management
- refactor: :recycle: use EventBus.getInstance() instead of keepTrackApi across app
- feat: :globe_with_meridians: Add multilingual localization support for satellite info box in German, English, Spanish, French, Japanese, Korean, Russian, Ukrainian, and Chinese
- refactor: replace EventBusEvent with EventBusEvents for consistency and clarity
- test: :white_check_mark: fix all failing tests due to v11
- feat: :sparkles: add OemSatellite class and integrate OEM satellite support
- feat: :sparkles: Add OemReader plugin, register pro path, and add default OEM settings
- feat: :sparkles: implement a worldShift to allow centering on non-earth objects
- feat: :sparkles: Add ScenarioManagement plugin with UI, save/load and time-bound enforcement
- feat: :sparkles: Support J2000/TEME line rendering, segmented radial grids, and TEME↔J2000 transforms
- refactor: :recycle: Clean up CSS styles, enhance tooltip positioning, and improve top menu integration
- feat: :planet: add planetary metadata, orbit-path rendering, and hover info
- refactor: :recycle: separate projection vs world matrices and use matrixWorldInverse across renderer
- feat: :globe_with_meridians: add multilingual support for satellite info box and improve layout structure
- feat: :sparkles: implement DepthManager to enable logarithmic depth buffer
- feat: :sparkles: add planet objects, planet dots and orbit-drawing UI
- feat: :sparkles: Add Maneuver Detection plugin with UI and data integration
- refactor: :fire: remove unused plugin translations and streamline localization handling
- refactor: :globe_with_meridians: Move loading screen messages
- refactor: :recycle: Replace SocialMedia plugin with generic TopMenuPlugin and update related configurations
- refactor: :recycle: Enhance LayersManager and LayersPopupBox integration, update event handling and menu interactions
- feat: :sparkles: add engine-ui.css for draggable box styles and import in draggable-box.ts
- feat: :sparkles: Add TimeSlider plugin
- feat: :zap: async loading of textures to unblock main thread
- OrbitGuard menu with static data
- feat: :globe_with_meridians: Update localization for satellite info box in Japanese, Korean, and Ukrainian
- refactor: :truck: move datetime UI logic out of TimeManager into DateTimeManager
- refactor: :recycle: Consolidate Earth texture quality enums into a single module and update imports across the codebase
- refactor(camera/rendering): switch to earth-centered camera positions & dynamic sun sizing
- refactor: :recycle: introduce CameraZoomState class to manage zoom state in Camera
- feat: :sparkles: add size determination logic for dots based on search results and selection
- chore: :globe_with_meridians: add filter-menu translations and scenario-management locale files; bump plugins-pro submodule
- refactor(rendering): cache J2000, prevent duplicate orbit paths, and optimize orbit path updates
- feat: :sparkles: add Reentry Risk color scheme and integrate into color scheme manager
- refactor: :sparkles: Update celestial body classes to use Body type for getName and adjust RADIUS visibility
- refactor: :recycle: update time management and URL handling for improved simulation time and rate management
- feat(telemetry/build): add open-source telemetry stub, register plugin, and ensure submodules in prebuild
- feat: :sparkles: implement legend popup menu with responsive behavior and z-index adjustments
- feat: add loading screen start button translations and settings for ads and auto start
- fix: :bug: use AEHF as default OEM satellite model; refresh time-slider on staticOffsetChange and expose updateSliderPosition; add 'planets' URL param to toggle planets; bump plugins-pro submodule
- perf: :zap: performance tweaks to reduce dom interaction and utilize idlecallback
- refactor: :recycle: Update tooltip attributes and styles across multiple plugins for consistency and improved usability
- refactor: :sparkles: Introduce Milky Way texture quality settings and streamline skybox initialization
- refactor(ui): replace ISS wallpaper, normalize keyboard handling, and tidy CSS
- refactor: :recycle: split LayersPopupBox class into own file
- test: :white_check_mark: fix all failing tests
- refactor: :children_crossing: Enhance VCR plugin with improved tooltip handling and event management for play, pause, rewind, and fast forward actions
- fix: :bug: correct OEM satellite orbit segment & history positioning; always update OEM orbit data
- refactor: :recycle: cache orbit buffers, rename updateOrbitData -&gt; alignOrbitSelectedObject, and simplify GPU updates
- refactor: streamline texture loading and splash behavior
- refactor: :children_crossing: update embed settings to reflect new plugins and options
- feat: :sparkles: Add filters for vLEO and xGEO satellites, update ColorSchemeManager and WebGLRenderer integration
- refactor: :recycle: rename CameraType.DEFAULT to FIXED_TO_EARTH and update usages
- fix: :bug: Adjust maxRng values for sensors to improve range accuracy
- refactor: :truck: move the camera class to new folder to enable refactoring
- refactor: :fire: remove unused isShowDistance property
- refactor: update StarlinkColorScheme to differentiate operational and other statuses
- refactor: :label: add type definitions for various managers and update service locator methods for improved type safety
- refactor: :recycle: switch to declarative kt-tooltip and remove TooltipsPlugin usage
- refactor(oem-satellite): rename stateVectors → ephemeris, wire LagrangeInterpolator, clean imports; bump plugins-pro submodule
- feat: :sparkles: Add maneuver data handling to satellite info box
- refactor: :recycle: replace getCameraDistanceFromEarth/getCameraPosition with calcDistanceBasedOnZoom/getDistFromEarth, compute target distance directly, and make snap instantaneous when chaseSpeed_ == 1.0
- feat: :sparkles: implement deepMerge method for recursive object merging in settings management
- feat: :sparkles: Add locale file compilation method to FileSystemManager
- fix: :bug: simplify godrays occlusion drawing using planets map; keep Earth/Moon special-cases
- fix: :bug: color-schemes: handle OEM-import sats, preserve planet color, adjust zoom behavior; bump plugins-pro submodule
- refactor: :recycle: remove unused showLoading calls and improve link type assignment in SatLinkManager
- fix: update loading screen button styles and add pulsate animation for better visibility
- ci: :green_heart: make mergeLocales accept optional proDir and use for non-pro builds
- feat: :sparkles: Add LinkedInLinkPlugin to top menu and update configuration
- fix: :bug: fix J2000 vs TEME
- fix: :bug: smooth satShader.minSize scaling based on camera distance
- refactor: :children_crossing: Improve tooltip sizing and positioning logic — use maxWidth, separate vertical/horizontal direction selection, and fix placement math
- feat: :sparkles: Update satellite info box sections to be collapsed by default with a new order
- fix: :bug: use texture resolution settings independent of mobile settings
- fix: :bug: Refactor container usage in setupStandardEnvironment to use Container.getInstance for consistency
- refactor: :sparkles: Enhance celestial bodies menu with additional dwarf planets and improved tooltip handling
- feat: :sparkles: add optional radius to getAlt and new getPositionFromCenterBody helper
- fix: :bug: implement Moon.update to apply world shift and respect center/selection
- feat: :sparkles: add SatInfoBoxOrbital configuration and update default plugins for improved settings management
- feat: :sparkles: add data cleaning method to remove duplicate channel entries
- fix: :bug: refactor showLoading call to only fire if a time change happens
- feat: :sparkles: compute relativeSatPos and pass worldOffset to celestial-body shaders
- docs: :memo: minor documentation changes
- refactor: :recycle: init planets in loadScene and remove low-priority loader
- fix: :bug: Improve Safari detection logic for better browser compatibility
- fix: :bug: compute altitude for non-Earth-centered objects by resolving centerBody
- refactor: :recycle: streamline localization handling by replacing Localization instance with t7e function calls
- feat: :sparkles: add alternate nasa satellite image map originally seen on https://nadir.space
- fix: :bug: VCR plugin - use ScenarioManagementPlugin.scenario for end-time checks and handle staticOffsetChange to refresh play/pause UI
- refactor: :recycle: remove TooltipsPlugin dependency & tooltip creation; avoid auto-resuming audio context; lazily load speech voices in speak
- chore(debug): convert buffer-size validation to commented debugging block in LineManager
- refactor: :alembic: comment out Moon planet creation and assignments for now
- refactor: :recycle: remove mat4 dependency and use mainCamera.matrixWorldInverse in unProject; fix indentation for clear-lines submenu
- feat: :sparkles: Add "Draw Moon Orbit Path" button to Planets menu and wire click handler to invoke moon.drawOrbitPath()
- refactor: :recycle: update the variable names for getBufferSubDataAsync to be easier to understand
- refactor(planets-menu): normalize Home key handling; support Shift+Home vs Home
- chore: :package: add ootk engine submodule (src/engine/ootk)
- chore: :wrench: update default plugins - enable VcrPlugin, add TimeSlider, relocate TooltipsPlugin to non-menu
- refactor: :sparkles: Update tooltip handling to use dynamic tooltipTag for attribute selection
- fix: :bug: tune sound defaults — lower click volume, use SoundNames for loading/export, add volumes for beeps and menu button
- build: :green_heart: normalize __dirname for Windows/POSIX and allow reassignment
- feat: :sparkles: add Home key handler to center camera on Earth
- feat: :sparkles: enhance tooltip dimensions and support HTML content
- chore: :bookmark: update CHANGELOG for v10.8.4 with new features and fixes
- refactor(rendering/skybox): use camera position directly for worldOffset; remove unused imports and dead code
- fix: :bug: fix incorrect matrix being used for unprojection
- feat: :globe_with_meridians: Add English locale for Video Director plugin
- fix: :bug: include WebGL error code in vertex/fragment shader creation errors
- test: :white_check_mark: fix broken tests
- refactor(build/webpack-manager): only generate and push auth webpack config when isPro
- refactor: :recycle: simplify alt2zoom — remove MIN_ZOOM_LEVEL/MAX_ZOOM_LEVEL and normalize output to [0,1] with 0.5 fallback
- fix: :bug: scale sun size when zoomed out very far
- ci: :green_heart: generate translation files before build and unit tests
- feat: :sparkles: accept worldOffset in occlusion uniformSetup and use it
- feat: :sparkles: add onLinesCleared, selectedDateChange and calculateSimulationTime events to EventBus and update EngineEventMap types
- refactor: :recycle: replace Localization instance with t7e function for country label localization
- feat: :sparkles: Integrate DepthManager into ConeMesh for log depth buffer support
- fix: remove unnecessary cases from setInstallDirectory_ method for cleaner code
- chore: :construction_worker: hide unused files
- fix: :bug: eagerly initialize LayersPopupBox, simplify popup selection and move currentLayer assignment
- fix: :bug: remove keeptrack.space hostname guard so UserAccountPlugin can load on local/other hosts
- fix: :bug: clamp gl_Position.w in log-depth vertex shader to avoid NaNs/Infs for extreme coordinates
- feat: :sparkles: add FilterMenuPlugin English locale entries to filter-menu en.src.json
- fix: :bug: throttle updateURL to avoid browser hangs by debouncing history updates (skip calls within 250ms) and add lastUpdateTime_
- fix: :bug: Enable depth testing in SensorFovMesh to improve rendering accuracy
- fix: :lock: close benign security issue with cross origin of keyboard event
- refactor: :recycle: rename updatePositionBuffer -&gt; update and rebind EventBus handler
- fix: :bug: avoid forcing Earth center for OEM satellites
- refactor: :recycle: Replace SatMath.j200ToTemeMatrix with getTemeToJ2000Matrix and tidy imports
- fix: :bug: Update fieldOfView and fieldOfViewMax to use Radians for improved clarity
- fix: :bug: update icon paths in web manifest for consistency
- chore: update version to 11.0.0.0 in README, package.json, and version.js
- fix: :art: fix unnecessary br
- chore(build): add TypeScript declaration for clean-terminal-webpack-plugin
- fix: :bug: stop overwriting Sun.position with ECI (account for worldShift)
- fix: :bug: only load user-account pro plugin on keeptrack.space subdomains
- fix: :bug: avoid recalculating simulation time
- fix: :bug: remove unnecessary exports creating circular reference
- fix: :bug: update logic on how screen size changes are handled
- fix: :zap: dont load the sun texture if it will never get used
- chore: :arrow_up: update src/engine/ootk and src/plugins-pro submodule pointers
- build: :construction_worker: add user-account plugin mapping to plugin manager
- fix: :bug: fix incorrect onKeyDown handler
- fix: :bug: move SplashScreen.hideSplashScreen() to postStart_
- fix: :bug: scale screenshot watermark logo height with hiResWidth and reorder imports
- fix: :bug: add no-op calculateRelativeSatPos override to Moon class
- feat: :sparkles: include vimpel=false in generated URL when JSC catalog is disabled
- fix: :bug: initialize ScenarioManagementPlugin earlier (before TopMenu/TimeSlider) and hoist VcrPlugin import
- chore: :arrow_up: update @typescript-eslint/typescript-estree and cypress dependencies to latest versions
- refactor: :recycle: Update drag options dimensions for improved usability
- build: :hammer: update lcov script to use tsx for consistency
- fix: adjust loading screen positioning for better visibility and layout
- chore: :bookmark: update version to 10.8.4 in README and version.js
- chore: :wrench: explicitly disable OemReaderPlugin in celestrak settings
- chore: :wrench: add Volta node toolchain config (node 25.0.0) to package.json
- feat: :crescent_moon: add Moon entry to planets RMB submenu after Earth
- chore: :sparkles: add generated locale files to .gitignore
- fix: :bug: Update fragment shader code for log depth calculation to recover original gl_Position.w
- fix: :bug: Adjust z-index for sidenav-trigger to prevent popups from blocking view
- build: :label: add @types/opener dependency for TypeScript support
- feat: add adsense placeholder to loading screen for improved ad integration
- Update src/static/splash-screen.ts
- ci: :construction_worker: switch ESLint step to use `npm run lint` in build pipeline
- fix: snap camYaw instantly when chaseSpeed_ == 1.0
- refactor(scenario-management): remove BASIC from menuMode; limit plugin to ADVANCED, SETTINGS, ALL
- fix: :bug: resize renderer canvas in UiManager.postStart (add ServiceLocator import & call)
- chore: :arrow_up: update plugins-pro submodule to 95675218
- fix: :bug: use errorManager.log for external ASCII catalog processing instead of info
- chore: :arrow_up: update plugins-pro submodule to aee63320
- fix: :bug: increase drawPosition normalization divisor to 1e11 to avoid zero coords breaking mat4.targetTo
- refactor: :recycle: add radius and position to earth
- fix: :bug: refresh ScenarioManagementPlugin.scenario before time slider calculations
- feat: :sparkles: Add new icon assets (event-note, input, landscape*) and update plugins-pro submodule
- fix: :bug: adjust zoom value bounds for validation in UrlManager
- fix: :bug: disable multiline-comment-style rule in ESLint configuration
- chore: :package: update subproject commit reference in plugins-pro
- fix: :bug: correct reference to Moon position in updateVertBuf method
- ci: :green_heart: update ESLint command to target the src directory
- build: :arrow_up: update gl-matrix dependency to version 3.4.4
- chore: :arrow_up: update Node.js version in .nvmrc to 24
- chore: :arrow_up: update typescript dependency to version 5.9.3
- build: :arrow_up: update prettier-plugin-organize-imports to version 4.3.0
- chore: :arrow_up: update subproject commit reference in plugins-pro
- chore: :package: Update subproject commit reference in plugins-pro
- fix: :bug: Remove dead satellite IDs from DSCS constellation array
- fix: :bug: Add missing satellite ID to AEHF constellation array
- chore: :package: update subproject commit reference in plugins-pro
- fix: :bug: update close button markup for consistency in draggable modal
- chore: :package: update subproject commit reference
- chore: update subproject commit reference in plugins-pro
- Update src/static/splash-screen.ts
- fix: :zap: disable planets on celestrak version
- fix: :bug: enable isAutoStart in embedded settingsOverride
- chore: :heavy_minus_sign: remove ts-node dependency from package.json
- chore: :heavy_minus_sign: remove download-file dependency from package.json
- build: :fire: remove child_process
- chore: :heavy_minus_sign: remove retire dependency from package.json
- fix: :bug: add .vscode to .eslintignore to prevent linting of VS Code settings
- fix: :bug: add padding to nav for improved layout
- feat: add adsbygoogle interface to global declaration for improved type support
- chore: :art: Update Saturn & Uranus ring textures to multiple of 2
- chore: :arrow_up: update package-lock.json to reflect dependency changes
- feat: :sparkles: add high-resolution textures for celestial bodies

#### v10.8.4

>  

- chore: :bookmark: update version to 10.8.3 in README, CHANGELOG, and version.js
- feat: add new achievement and icon images; update subproject reference
- Update src/plugins/new-launch/new-launch.ts
- chore: :bookmark: update subproject commit reference in src/plugins-pro
- fix: :rotating_light: fix linter error

#### v10.8.3

>  

- fix: :bug: add validation for eccentricity, epoch year, and epoch day formats in createNominalSat_
- docs: :loud_sound: update CHANGELOG for v10.8.2 with new features and bug fixes
- fix: :bug: ensure HTML is ready before updating header data in SatInfoBox
- fix: :bug: add sensor existence check before accessing sensor info in viewSensorInfoRmb
- refactor: :recycle: replace magic numbers with constants for long audio cooldown and chatter repeat delay
- feat: :sparkles: add new achievement images for ISS and Vanguard
- chore: :bookmark: update version to 10.8.2 in README and version.js
- fix: :bug: add color scheme validation before updating last satellite color
- chore: :bookmark: update subproject commit reference in plugins-pro
- fix: :bug: adjust cloud color intensity calculation for improved visual quality

#### v10.8.2

>  

- feat: :zap: enhance audio playback using Web Audio API
- fix: :bug: handle potential null values in look angles download and improve data display
- fix: :bug: handle potential null values in filter settings saving to ensure defaults are applied
- fix: :bug: handle potential null values for primary satellite covariance matrix in SelectSatManager
- fix: :bug: handle potential null values in audio playback and error logging
- fix: :bug: improve error handling in ScreenRecorder and StreamManager to prevent crashes when media recorder is not initialized
- docs: :loud_sound: add v10.8.1 section to CHANGELOG with updates for new features and fixes
- fix: :bug: add validation for satellite data before updating DOM elements
- chore: :bookmark: update subproject commit reference in plugins-pro
- chore: :bookmark: update subproject commit reference in plugins-pro

#### v10.8.1

>  

- docs: :loud_sound: update CHANGELOG with new features, fixes, and enhancements for v10.8.0
- chore: :bookmark: update version to 10.8.0 and refine Create Satellite help description
- chore: :bookmark: update subproject commit reference in plugins-pro

#### v10.8.0

>  

- feat: :sparkles: enhance error handling by adding error event to KeepTrackApi and removing telemetry implementation
- test: :white_check_mark: add unit tests for GetVariables and parseGetVariables functions
- feat: :sparkles: update environment configuration and remove SupabaseManager; adjust plugin settings for better control
- feat: :sparkles: add Elektro-L 2 satellite image retrieval and display functionality
- feat: :sparkles: update ESLint configuration to allow process.env usage and integrate dotenv-webpack for environment variable management
- feat: :sparkles: add isWatchlistTopMenuNotification flag and update settings persistence for offline mode
- feat: :sparkles: enhance SensorManager to support offline mode and load sensor JSON
- feat: :sparkles: enhance WatchlistPlugin with top menu notifications and update StorageKey enum for better organization
- feat: :sparkles: add stem environment preset and integrate into parseGetVariables
- feat: :sparkles: add userAccountChange event and update searchUpdated event parameters
- refactor: :recycle: refactor watchlist serialization and deserialization methods for improved clarity and error handling
- feat: :sparkles: integrate SupabaseManager for environment variable handling and add Supabase dependencies
- feat: :sparkles: refactor orbit type handling to use updateOrbitType method in OrbitManager
- test: :white_check_mark: update WatchlistPlugin to conditionally enable top-menu elements
- feat: :sparkles: add HOLDARC sensor details and update coordinates for existing sensors
- refactor: :recycle: rename offline property to offlineMode
- fix: :bug: wrap file copy operations in try-catch to handle errors gracefully
- chore: :bookmark: update subproject commit reference in plugins-pro
- fix: :bug: refactor visibility logic for secondary satellite info in SatInfoBoxObject
- feat: :sparkles: enhance stem environment with BottomMenu integration and event handling
- fix: :bug: ensure open button is defined before setting onclick handler in colorbox
- fix: :bug: move auth-config.js writing logic to ensure proper file handling after directory creation
- fix: :bug: handle invalid covariance matrix in selectSatObject_ method and set default radii
- fix: :bug: use optional chaining for model mesh access to prevent runtime errors
- fix: :bug: update Electro-L 2 timestamp format and adjust time buffer for closest satellite image retrieval
- feat: :sparkles: add userLogin and userLogout events to KeepTrackApiEvents
- chore: :fire: remove wrangler configuration file as part of cleanup
- feat: :sparkles: add initial wrangler configuration for deployment setup
- feat: :sparkles: add functionality to open image in new tab from colorbox
- fix: :bug: clear styling from nav-wrapper in DateTimeManager initialization
- fix: :bug: correct plugin assignment order and enable splash screen visibility
- feat: :sparkles: add onWatchlistAdd and onWatchlistRemove events to KeepTrackApiEvents
- fix: :bug: update environment variable keys for Supabase configuration to match naming conventions
- fix: :bug: replace console warning with error logging for unregister callback not found
- test: :white_check_mark: add TopMenu import and initialization in CountriesMenu tests
- fix: :bug: use optional chaining for transparent color fallback in color schemes
- fix: :bug: update version badge to 10.7.2 and update subproject commit reference
- fix: :bug: ensure splash screen images are filtered only when splashScreenList is defined
- fix: :bug: add TopMenu as a dependency for CountriesMenu plugin
- feat: :sparkles: enhance helpBody description for Create Satellite menu with detailed usage instructions
- feat: :sparkles: add account-circle icon to public assets
- Update src/plugins/select-sat-manager/select-sat-manager.ts
- chore: :heavy_plus_sign: update subproject commit reference in plugins-pro
- fix: :bug: ensure mesh initialization only occurs if model name is defined
- fix: :bug: update color settings version check to use defaultColorSettings.version
- fix: :bug: ensure loading indicator is hidden on image and iframe load errors
- Update src/static/splash-screen.ts
- fix: :bug: update nav-wrapper style to use flexbox for better alignment
- fix: :bug: correct splash screen identifiers to use hyphens for consistency
- fix: :bug: adjust polygon offset calculation for atmosphere rendering based on camera zoom level
- fix: :bug: remove redundant updateModel call in MeshManager
- fix: :bug: remove splash screen visibility setting from loadPresetFacSat2
- feat: :sparkles: add facebook-white icon to the public image assets

#### v10.7.2

>  

- feat: :children_crossing: Add new country codes and update localization files
- chore: :bookmark: update version to 10.7.0 in README and version.js
- feat: :sparkles: add satellite info boxes to mobile settings manager
- fix: :bug: use optional chaining for sound manager calls to prevent errors
- feat: :sparkles: add version management to PersistenceManager with validation and storage
- fix: :bug: update getEl calls to include the 'true' parameter for titleSpan and optimize array initialization in tests
- fix: :bug: update default values for godraysSamples and isDrawAtmosphere settings
- fix: :bug: improve null checks for current mesh object to prevent errors during rendering
- fix: :bug: add null check for unregistering callbacks in KeepTrackApi
- chore: :bookmark: update version to 10.7.1 in README, package.json, and version.js
- fix: :bug: update version display in splash screen to reflect current version number
- fix: :bug: update settings to correctly show ECF drawing enabled by default
- fix: :bug: replace toSorted with sort for consistent array ordering in SatInfoBox
- feat: :sparkles: add new wallpaper
- test: :white_check_mark: update expected output for valid country name test to include full name
- fix: :bug: simplify null check for current mesh object in MeshManager

#### v10.7.0

>  

- fix: :bug: update hostname check for copyright notice in splash screen
- Hotfixes
- fix: :ambulance: fix outreach not loading due to new API schema
- Hotfixes
- fix: :ambulance: fix vimpel issues with R2 CORS
- Bug Fixes. Bump to 10.5.1
- fix: :ambulance: fix covariance ellipsoids breaking mobile
- fix: :bug: fix lack of variety in loading screens
- build(deps): bump uuid from 9.0.1 to 11.1.0
- build(deps): bump flag-icons from 7.2.3 to 7.3.2
- New Color Schemes and Filter Menu
- fix: :bug: fix offline mode
- Develop
- build(deps-dev): bump @types/webgl2 from 0.0.10 to 0.0.11
- Develop
- Develop
- fix: :bug: add fixes for bad colorscheme values and velocity scheme
- Develop
- fix: :ambulance: fix color schemes relying on class name that change …
- fix: :ambulance: fix color schemes relying on class name that change …
- Develop
- fix: :beers: fix k vs K
- Develop
- fix: :bug: stop using LFS for cloudflare compatibility
- fix: :ambulance: fix color scheme not loading
- fix: :ambulance: fix issue with color scheme freezing
- Develop
- Develop
- fix: :ambulance: fix missing parentheses
- Develop
- Develop
- Aldoria Additions and Other Updates
- Develop
- Develop
- Develop
- Develop
- refactor: :recycle: update tle path to use v2 of API
- Develop
- Develop
- fix: :arrow_up: bump ootk
- Develop
- Develop
- Develop
- Develop
- Develop
- fix: :zap: improve orbit finder algorithm for breakups
- Develop
- Address Issues Found on Hacker News
- Develop
- Develop
- Develop
- Develop
- Develop
- fix: :ambulance: fix error when no satellite selected
- fix: :bug: fix transponder menu being enabled incorrectly
- feat: :sparkles: add geo satellite transponder info
- Develop
- Updates to TIP Plugin
- fix: :bug: fix flickering on mobile
- Develop
- Develop
- Develop
- Develop
- fix: :ambulance: emergency fix
- fix: fix analytics on localhost
- Develop
- Develop
- Develop
- docs: :memo: fix readme links
- ci: :construction_worker: allow npm audit to fail but open an issue
- Develop
- Develop
- Develop
- Develop
- fix: :ambulance: fix one bad satellite breaking website
- Develop
- fix: :ambulance: fix new launch plugin
- fix: :bug: multiple bug fixes related to color buffer updates
- fix: :zap: fix performance bug and css issues
- test: :white_check_mark: fix broken tests
- Develop
- Develop
- Develop
- Hotfix to deprecated plot plugins impacting app even when disabled.
- KeepTrack v9.0.0
- fix: :bug: prevent triggering an error when typing in invalid custom sensor values
- fix: :bug: handle errors when processing known satellites in ASCII file
- fix: :bug: handle undefined satellite object in right button menu
- fix: :bug: handle errors when processing satellites in CatalogLoader
- fix: :bug: prevent update execution if sun model is not loaded
- refactor: :recycle: update event handling in CountriesMenu to use uiManagerFinal
- feat: :children_crossing: enhance satellite creation with input validation and formatting improvements
- fix: :bug: fix requestFullscreen failing on some browsers
- fix: :bug: fix breakup throwing uncaught error
- fix: :bug: Better handling of errors in obj-to-obj-line.ts
- fix: :bug: add validation to avoid race conditions
- fix: :bug: add validation to analytics tool before using
- fix: :bug: validate datetimeTextElement before setting date/time
- fix: :bug: add trap for race condition
- feat: :technologist: new build system
- test: :white_check_mark: add locales json build output for unit testing in github runner
- test: :white_check_mark: add jest tests to ensure this continues working as intended
- test: :white_check_mark: fix outdated snapshots
- fix: :bug: fix all open issues with rpo-calculator (now proximity-ops)
- feat: :sparkles: add additonal features to Remote Proximity Operations plugin
- feat: :technologist: add strict i18n key validation and korean support
- feat: :technologist: add strict i18n key validation and korean support
- feat: 🔥 Plotting changes to make it cleaner and refactor code to make it more readable
- feat: 🔥 Inital commit for find RPO plugin
- feat: :sparkles: implement covariance ellipsoids
- feat: 🔥Added option to take into account the weather forecast when finding observable transits for optical sensors
- refactor: :recycle: reduce unnecessary API calls, utilize enums, fix linter errors, add optimizations
- docs: :page_facing_up: transfer copyright to Kruczek Labs LLC
- feat: :children_crossing: improve layout of sensor timeline
- feat: :sparkles: new launches now use nominal satellites
- feat: :speech_balloon: add translation support for proximity ops
- build: :arrow_up: add compatibility with ootk 5
- feat: :sparkles: add OWL-Net sensors
- build: :construction_worker: remove auto version date due to merge conflicts and add version to readme
- feat: 🔥 Add changes to enable RPO plugin & add temporary icon
- fix: :pencil2: fix Collisions spelling
- fix: :pencil2: fix Collisions spelling
- perf: :stethoscope: add throttle for telemetry reporting
- fix: :art: update logo and add version/copyright information to splash screen
- fix: :ambulance: fix sensor name not resetting in top menu
- feat: :sparkles: add ability to increase number of ECF orbits drawn
- feat: :sparkles: add ability to reload last selected sensors
- fix: :children_crossing: make it clear ECF orbits only work on GEO satellites
- fix: :bug: fix satellite view not being enabled
- fix: :bug: add error catching when drawing map and context lost to canvs
- fix: :children_crossing: provide feedback when fov bubble enabled but not valid
- refactor: :children_crossing: set godrays to off by default due to reports of performance issues
- fix: :goal_net: add Safari browser support warning and redirect
- fix: :bug: fix bug where alt is null in inc2alt plots
- fix: :bug: avoid crashing production server even when there is a uniform issue in WebGl
- refactor: :recycle: change bottom menu categories
- test: :technologist: fix issue with vscode debug not working with jest
- Update src/static/gl-utils.ts
- docs: :bookmark: bump version
- test: :white_check_mark: fix broken test
- fix: :beers: used the wrong word for RPO
- build: :arrow_up: bump ootk to v5
- chore: :bookmark: bump patch version
- fix: :bug: fix race condition with soundManager loading after being called
- fix: :bug: fix issue with sound firing before initialization
- build: :arrow_up: bump ootk
- ci: :bug: fix lint-yml checking other files
- fix: :label: fix incorrect type
- fix: :bug: prevent errors when plugins are disabled
- build: :bug: add missing .gitmodules file
- fix: :ambulance: calendar incorrectly adding 1 to jday
- fix: :twisted_rightwards_arrows: fix merge issue
- fix: :twisted_rightwards_arrows: fix merge issue
- fix: :poop: remove console.log
- feat: 🔥Add openmeteo dependecy to package.json
- fix: :bug: fix broken ui icons
- Resloved conflicts between fixes and new feature branch
- feat: :sparkles: add telemetry server integration for error troubleshooting
- feat: :sparkles: add telemetry server integration for error troubleshooting
- feat: :sparkles: add OWL-Net sensors
- fix: resolve leftover conflict markers in version files
- feat: 🔥 Add changes to enable RPO plugin & add temporary icon
- refactor: :recycle: refactor to merge with celestrak changes
- fix: :bug: remove unused normalMatrix that was causing errors on init
- fix: :bug: remove unused normalMatrix that was causing errors on init
- fix: :bug: fix linter errors with telemetry
- fix: :bug: fix linter errors with telemetry
- fix: :bug: fix filters being improperly applied on mobile
- fix: :bug: fix filters being improperly applied on mobile
- feat: :sparkles: add newtab utility for future work exporting information to a new tab
- feat: :sparkles: add newtab utility for future work exporting information to a new tab
- refactor: :recycle: rename defaultColorScheme and set Celestrak to default
- refactor: :recycle: rename defaultColorScheme and set Celestrak to default
- feat: :sparkles: disable unused filters in bottom menu
- Bug: 🐛Fixed issue with plotted pass not corresponding to displayed time if the calculations were not done starting at a full hour
- refactor: :recycle: use first color scheme instead of "default" color scheme
- fix: :bug: ensure confidence levels are completely hidden if disabled
- fix: :bug: ensure confidence levels are completely hidden if disabled
- fix: :children_crossing: provide feedback when fov bubble enabled but not valid
- fix: :bug: show help button disabled until side menu is open
- fix: :bug: show help button disabled until side menu is open
- refactor: :recycle: hide altName and altId independently
- refactor: :recycle: hide altName and altId independently
- fix: :bug: force set legend menu at init
- fix: :bug: force set legend menu at init
- fix: :bug: prevent errors when plugins are disabled
- fix: :bug: ensure dots are updated on mobile
- fix: :bug: ensure dots are updated on mobile
- fix: :bug: explicitly allow tutorial button to be missing during testing
- fix: :bug: explicitly allow tutorial button to be missing during testing
- fix: :label: fix typo in filter
- test: :white_check_mark: fix test to match new logic
- fix: :label: fix typo in filter
- test: :white_check_mark: fix test to match new logic
- fix: :lipstick: fix mismatch in styling for full screen icon
- fix: :lipstick: fix mismatch in styling for full screen icon
- refactor: :recycle: hide altName and altId independently
- refactor: :recycle: rename defaultColorScheme and set Celestrak to default
- fix: :bug: default help button to disabled
- fix: :bug: ensure confidence levels are completely hidden if disabled
- fix: :bug: show help button disabled until side menu is open
- refactor: :recycle: use first color scheme instead of "default" color scheme
- fix: :bug: fix bug when surviellance plugin is disabled
- fix: :iphone: fix size of sat-info-box title
- feat: :sparkles: disable unused filters in bottom menu
- refactor: :recycle: refactor to merge with celestrak changes
- fix: :label: fix type
- test: :white_check_mark: increase test coverage
- refactor: :recycle: make colorschemes modular
- feat: :sparkles: update environment configuration files to add embed settings
- refactor: :recycle: refactor sat-info-box to be more modular and dynamic
- refactor: :recycle: rewrite sat-info-box to be more modular
- refactor: :recycle: improve typing and fix eslint errors/warnings
- refactor: :recycle: improve typing and fix eslint errors/warnings
- feat: :sparkles: update earth and sun rendering
- refactor: :recycle: convert register and runEvent to on and emit syntax
- feat: :sparkles: add new bottom menu categories
- feat: :sparkles: add new languages to localization
- chore: :sparkles: Add country translations to localization files for Korean, Russian, and Ukrainian
- refactor: :recycle: move countries to locales json files
- feat: :sparkles: add new filter menu
- feat: :closed_lock_with_key: move non-agpl code out of public repo
- refactor: :speech_balloon: Translate UI elements and help texts to other languages, add copyright notices, and update sensor-related plugin descriptions for improved clarity and localization.
- feat: Enhance keyboard input handling and add debug keyboard overlay
- feat: :sparkles: add new color schemes for orbital density
- feat: 🔥 Inital commit for find RPO plugin
- feat: :sparkles: add more translations
- feat: :sparkles: add EarthPresetsPlugin, DrawLinesPlugin, and ViewInfoRmbPlugin with context menu integration
- test: :white_check_mark: add more testing of color-scheme-manager
- feat: :sparkles: step 1 of merging celestrak version with main version
- refactor: :recycle: replace inline plugin configuration with defaultPlugins import for cleaner settings management
- feat: :sparkles: add multiple launch sites with detailed information including coordinates and country
- refactor: :goal_net: add better handling for null events
- test: :white_check_mark: increase test coverage
- test: :white_check_mark: increase test coverage
- feat: :sparkles: add embed mode support and enhance input handling for keyboard and mouse interactions
- refactor: :recycle: refactor sat-info-box to account for null better
- feat: :sparkles: add launch site management with detailed site information and update UI for launch facility selection
- refactor: :recycle: enhance settings persistence management and streamline URL parameter handling
- refactor: :recycle: implement parseGetVariables function for enhanced settings management from URL parameters
- feat: Refactor keyboard input handling to use unified event system and add new key bindings
- refactor: :recycle: cleanup create-sat code for production
- refactor: :recycle: fix linter errors
- test: :rotating_light: fix linter errors in Jest test
- feat: :sparkles: Add dark clouds and maneuver plugin translations for multiple languages
- refactor: :recycle: move keyboard events to their class instead of keyboard manager
- fix: :recycle: make color scheme changes more consistent
- feat: :sparkles: update plugin menu modes and add block persistence setting
- feat: :sparkles: add new mission color scheme
- feat: :sparkles: add earth texture quality options to graphics menu
- feat: :sparkles: add wikipedia urls to launch sites
- test: :white_check_mark: fix all tests
- feat: :sparkles: add EarthAtmosphere plugin and integrate into plugin manager
- feat: :sparkles: add color scheme for data source
- fix: :bug: remove more images from lfs
- refactor: :recycle: streamline URL parameter handling and remove unused satellite selection logic
- feat: :sparkles: reupload images
- refactor: :technologist: standardize plugin naming to PascalCase and update related configurations for consistency
- feat: :sparkles: enhance bottom menu functionality and settings management
- fix: :bug: refactor build pipeline and add Node.js setup action for improved dependency management
- feat: :sparkles: implement TooltipsPlugin with tooltip creation and positioning logic
- refactor: :recycle: move common math functions to ootk
- test: :white_check_mark: add testing foro create-sat.ts
- refactor: :recycle: split default color settings for improved visual customization
- feat: :sparkles: update bottom menu icons
- feat: :zap: optimize sound management by loading on demand
- fix: 🐛 Fixed bugs with input values and plot
- refactor: :recycle: replace custom day of year calculations with TimeManager methods and streamline related logic
- refactor: :recycle: standardize plugin naming conventions across the codebase
- ci: :construction_worker: update issue templates for better clarity and usability
- refactor: :technologist: standardize plugin names to PascalCase and update related configurations for consistency
- refactor: :recycle: update event names and streamline URL management across components
- fix: :bug: fix filtering in planetarium view
- feat: :sparkles: implement sorting of sphere geometry faces for transparency rendering
- refactor: :recycle: standardize plugin naming conventions and menu modes across multiple plugins
- fix: :bug: update styles for ui-datepicker and copyright notice, adjust mobile settings handling in SplashScreen and SettingsManager
- fix: :bug: update settings to enable JSC catalog, manage night mode display, and handle dots parameter in UrlManager
- fix: :rotating_light: fix linter error on comment style
- refactor: :rotating_light: remove linter errors
- feat: :sparkles: add legendUpdated event and update legend handling in color schemes
- fix: :bug: update build pipeline for improved YAML linting, NPM audit, and Node.js setup
- refactor: :recycle: move splash screen images to SplashScreen class
- feat: :sparkles: enable custom language files for pro users
- ci: :fire: remove old ci/cd actions
- refactor: :recycle: remove unused properties from various color scheme classes
- refactor: :recycle: refactor to merge with celestrak changes
- feat: :sparkles: add primary and secondary logo paths to configuration and update build process to handle new logos
- feat: :sparkles: update icons and improve create satellite plugin
- chore: :fire: remove Cypress configuration and test files
- fix: :bug: force new persistence cache
- refactor: :goal_net: add more defensive code to watchlist.ts
- refactor: :recycle: standardize plugin naming conventions for consistency across configuration and initialization
- refactor: :goal_net: add more defensive code to KeepTrackPlugin.ts
- refactor: :recycle: replace SatMath calculations with keepTrackApi time manager for consistency across plugins
- feat: :sparkles: enhance keyboard input handling for iframe communication and improve mouse input iframe detection
- feat: :sparkles: enhance build process with optional directory copying and remove deprecated example HTML files
- refactor: :recycle: sync dark-clouds preset with original version
- fix: :bug: fix math for age of elset calculations
- fix: :bug: cap covariance radii to prevent excessive bubble sizes, enable Jday usage in settings, and update bottom menu visibility handling
- fix: :bug: sync keyboard commands with calendar plugin
- feat: :sparkles: enhance Gaussian blur function with variable blur amount and optimize performance by early exits
- refactor: :recycle: extract is visible to sensor logic
- feat: :zap: optimize mesh management by loading on demand
- fix: :bug: update build-manager to copy examples directory and adjust settings manager for static offset handling
- refactor: :recycle: streamline watchlist creation and clear functionality in WatchlistPlugin
- feat: :sparkles: Add launch site selection functionality to NewLaunch plugin
- fix: :bug: fix time management with delayed enabling of time changes
- refactor: :recycle: typecast SelectSatManager since KeepTrackPlugin constructor validates dependencies
- feat: :sparkles: add SETTINGS mode to MenuMode enum and update related plugins for enhanced menu functionality
- fix: :bug: correct night mode toggle logic in NightToggle plugin
- fix: :bug: update cache action version and streamline SSH setup in build pipeline
- fix: :bug: add !important to nav-bar-height and refactor settings override loading in SettingsManager
- feat: :sparkles: streamline satellite selection handling and enhance settings for hover overlay and focus on satellite
- test: :white_check_mark: fix all broken tests
- refactor: :recycle: update WebpackManager to use BuildConfig and remove deprecated dotenv usage; clean up CSS filters
- feat: :sparkles: add visible field to lookangles plugin
- fix: :bug: fix issues with new color scheme system
- fix: :bug: update class method references to use optional chaining for safer DOM manipulation
- feat: :sparkles: disable unused filters in bottom menu
- feat: :sparkles: Add locale file compilation method to FileSystemManager
- fix: :bug: move SSH setup for deploy key to appropriate steps and ensure submodules are updated
- refactor: :technologist: update to use DebugMenuPlugin and SensorListPlugin for sorting
- fix: :bug: fix age of elset calculation
- feat: :sparkles: add Long Range Discrimination Radar (LRDR) sensor and fix LEOLABS enum value
- feat: :sparkles: Enhance darkClouds preset with improved camera settings and UI adjustments
- feat: :sparkles: add epfl env
- refactor: :technologist: add better control over sensor plugins
- refactor: :recycle: use first color scheme instead of "default" color scheme
- feat: :sparkles: Add ManeuverPlugin with configuration and localization support
- refactor: :rotating_light: fix sonarqube findings
- fix: :bug: remove IIFE for Safari support
- refactor: :technologist: rename watchlist to WatchlistPlugin and update related configurations for consistency
- fix: :ambulance: fix color schemes relying on class name that change during production build
- refactor: :goal_net: add more defensive code to new-launbch.ts
- refactor: :technologist: standardize plugin naming to PascalCase for consistency
- fix: :bug: night mode toggle logic in NightToggle plugin
- fix: :bug: update keyboard_ property to readonly and remove unused right-click menu elements
- fix: :bug: adjust godrays exposure value and blur kernel size for improved rendering
- fix: :bug: Remove Safari support check and redirect logic from main initialization
- refactor: :rotating_light: remove linter errors
- feat: :sparkles: add settings to enable/disable launch sites and sensors via URL parameters
- feat: :sparkles: add jsc vimpel filter
- refactor: :recycle: replace direct plugin imports with getPluginByName calls in SensorListPlugin, CustomSensorPlugin, and SensorManager
- feat: :sparkles: update satellite record handling in orbit cruncher for better ecf handling
- chore: :memo: update package number
- refactor: :rotating_light: fix linter errors in get-el.ts
- refactor: :recycle: change polar plot design
- refactor: :rotating_light: fix sonarqube findings in sun.ts
- fix: :bug: replace SSH setup script with webfactory/ssh-agent action for deploy key
- fix: :bug: update waitForCruncher parameters to skip messages and count passes for improved synchronization
- fix: :bug: fix resizing needed after start but before loading is finished
- feat: :sparkles: add TooltipsPlugin and UserAccountPlugin configurations to KeepTrackPluginsConfiguration
- refactor: :recycle: remove obsolete test files for Astronomy and Planetarium plugins
- feat: :sparkles: add sorting functionality for bottom icons in UiManager
- refactor: :recycle: refactor eruda toggle to standalone method
- refactor: :recycle: standardize error handling in slide.ts
- feat: :sparkles: add MAX_BOTTOM_ICON_ORDER constant for consistent bottom icon sorting
- fix: :bug: Improve Safari detection logic for better browser compatibility
- refactor: :rotating_light: fix sonarqube findings
- fix: :bug: remove unnecessary resizeCanvas method
- refactor: :recycle: enhance ECF settings handling and update URL parameter management
- fix: :bug: adjust dropdown content max-height and style scrollbar for better usability
- feat: :sparkles: update darkClouds preset with new longitude and settingsOverride structure
- fix: :bug: update SelectSatManager import type and adjust parseGetVariables calls in tests to include settingsManager
- fix: :bug: update sensor-selected-container display logic and reset sensor button state
- fix: :bug: fix image loading in colorbox with callback for better display control
- build: :construction_worker: Add setenv script to configure environment variables
- fix: :bug: update copyright notice handling for official website
- feat: :sparkles: add slow shrink/grow to sun geometry
- refactor: :recycle: improve audio element validation in SoundManager
- refactor: :recycle: remove unused .lftp_ignore file
- refactor: :technologist: rename aboutManager to AboutMenuPlugin for consistency across plugins
- refactor: :recycle: use getDayOfYear in ootk
- refactor: :rotating_light: fix linter errors
- refactor: :recycle: add typing and remove unnecessary checks in sunAngle
- refactor: :recycle: chane isAudioElement to private since it's only used internally within SoundManager
- feat: :art: Update texture quality settings and disable night mode in mobile manager
- fix: :lipstick: add absolute positioning to nav for improved layout
- fix: :bug: update context loss handling in WebGLRenderer and SelectSatManager for improved stability
- refactor: :recycle: improve type handling and null checks in select-sat-manager
- refactor: :recycle: improve type handling and null checks in select-sat-manager
- fix: :ambulance: fix color schemes relying on class name that change during production build
- feat: :sparkles: add keyboard event handling for elements with 'keyboard-priority' class
- fix: :bug: enhance visibility of menu items based on satellite type in ViewInfoRmbPlugin
- fix: :bug: handle null mesh cases in MeshModel and applyAttributePointers_
- feat: :sparkles: add canvas visibility toggle in settings manager
- fix: :bug: Correct texture quality string casing and standardize resolution handling
- fix: :bug: standardize earth texture quality values to lowercase
- fix: :bug: standardize texture quality values to lowercase in MobileManager
- fix: :bug: update build pipeline to set up SSH for deploy key using webfactory/ssh-agent action
- feat: :sparkles: refactor Astronomy and Planetarium plugins to extend KeepTrackPlugin and initialize dependencies
- fix: :bug: update legend HTML to correct source order and display for data sources
- fix: :bug: update event listener bindings in BottomMenu to use class method references
- fix: :bug: reorder experimental menu item to maintain consistent menu structure
- fix: :bug: remove git lfs
- fix: :bug: remove git lfs
- fix: :bug: update build pipeline to set up SSH for deploy key and remove submodule checkout
- fix: :bug: update godraysSamples values to use numeric constants instead of GodraySamples enum
- fix: :zap: prevent multiple resize events firing back to back
- fix: :bug: fix proprate label not updating when slider moved
- fix: :bug: disable eruda popping up on global error
- chore: :bookmark: update version number to 10.6.2 in package.json
- fix: :bug: Prevent Safari from bouncing by setting body overflow to hidden
- refactor: :recycle: remove unused CopyRspackPlugin from webpack configuration
- fix: :bug: add SSH setup for deploy key in build pipeline steps
- fix: :bug: update build pipeline to initialize git submodules during checkout
- fix: :bug: update loadOverridesFromUrl_ to handle query strings correctly when a hash is present
- docs: :wastebasket: remove deprecated references to github page
- fix: :white_check_mark: fix tests
- refactor: :rewind: remove Aldoria specific code from main repo
- fix: :zap: update TypeScript target version to ES2023 in tsconfig
- feat: :sparkles: add UserAccountPlugin with initialization error handling
- fix: :bug: update satellite record creation to prevent caching of old TLEs
- fix: :bug: update picking dot size and adjust draw size calculations to reduce flickering
- chore: :arrow_up: update version to 10.6.1 in package.json and splash-screen
- feat: :art: adjust night color intensity and apply diffuse factor to political and clouds textures
- feat: :sparkles: Add SpinLaunch launch site details to launchSites catalog
- refactor: :truck: rename all locale files
- fix: :bug: update texture quality settings to 'off' for better performance in embed mode
- fix: :bug: correct typo in comment and prevent search results animation in embed mode
- refactor: :recycle: remove unnecessary eslint-disable comments for class methods across multiple files
- fix: :bug: Replace throw error with console.error in pro plugin initialization methods
- fix: :bug: fix resizing not firing correctly
- build: :truck: change default port to 5544 to match CORS exception
- fix: :bug: prevent attempting to export a find result before running a find
- fix: :bug: fix Safari only error related to rgba parsing
- fix: :bug: add SSH setup and submodule update steps before installing dependencies in build pipeline
- build: :lock: fix all open npm audit findings
- feat: :sparkles: Optimize mouse satellite ID retrieval with update time check
- fix: :bug: update logo image path and format URLs in installation instructions for consistency
- fix: :bug: remove Vimpel satellites setting and replace with JSC catalog enable flag
- fix: :bug: correct YAML lint file path and enhance build summary message
- feat: :sparkles: add loading hints toggle to settings and update splash screen behavior
- fix: :bug: adjust political map rendering order to ensure correct layering with clouds and atmosphere
- fix: :bug: remove unused hideEl calls for earth-related context menus
- feat: :sparkles: add toast method to KeepTrackApi for displaying notifications
- refactor: :art: update color settings version and adjust facility color values
- feat: :sparkles: add clear method to PersistenceManager for removing all stored items
- refactor: :wastebasket: remove sensor plugin and replace with setting
- refactor: :technologist: replace height with max-height for input focus to improve layout consistency
- fix: :bug: Handle null or undefined values in saveItem method by removing the item
- fix: :rotating_light: fix linter error
- fix: :rotating_light: fix linter error
- fix: :bug: update camera position any time mouse button released
- fix: :bug: fix no sound playing on Safari
- feat: :sparkles: Update loadPlugins to support asynchronous plugin initialization
- feat: :sparkles: Add ManeuverPlugin menu and help text for satellite maneuvers
- feat: :sparkles: Add ManeuverPlugin settings and disable toast notifications
- build: :bug: update submodule configuration for src/plugins-pro
- build: :bug: remove submodule from .gitignore
- test: :white_check_mark: mock validation method to always return false in CreateSat tests
- fix: :bug: update background and theme colors in manifest.webmanifest
- chore: :arrow_up: update cypress dependency to version 13.17.0
- chore: :sparkles: add Cypress testing files to .gitignore
- fix: :truck: rename epfl wallpaper due to case-sensitive issue
- fix: :bug: Add explicit error when WebGL context lost during program creation
- docs: :memo: add README for locales JSON files
- docs: :memo: update comment to clarify settings overrides for embedded version
- fix: :bug: improve copyright notice handling for official website by using a trusted domains list
- fix: :bug: update test and build steps to initialize git submodules before execution
- fix: :bug: update UrlManager to set isSupplementExternal and disable isMissionDataEnabled for external TLEs
- chore: :arrow_up: update version to 10.6.0 in README.md and version.js
- fix: :bug: add 'start-hidden' class to keeptrack header and show it on loading screen
- refactor: :recycle: Specify array types for combinedArray and index in SphereGeometry
- fix: :bug: fix bug when surviellance plugin is disabled
- fix: :bug: fix bug when surviellance plugin is disabled
- feat: :sparkles: add ussr flag
- refactor: :recycle: update color settings version number
- fix: :bug: fix invalid locale string
- fix: :bug: hide default eruda btn
- fix: :bug: fix plugin settings menu not loading
- fix: :arrow_up: adjust isimp to work with new ootk version
- build: :arrow_up: bump ootk
- fix: :bug: fix auto rotation up/down being backwards
- fix: :bug: fix mismatch between D1 database and app
- fix: :bug: fix bug when pitch and yaw is exactly 0
- feat: :sparkles: add ops2 wallpaper to splash screen image list
- refactor: :recycle: Use DEFAULT_RESOLUTION for texture source resolution fallback
- refactor: :recycle: integrate localization for country extraction fallback
- fix: :bug: add support for Vimpel satellites in settings manager
- fix: :bug: add npm ci step for installing dependencies in build pipeline
- feat: :sparkles: add settings preservation on orbit line and ECI/ECF toggles
- fix: :ambulance: fix typo in typing breaking build
- refactor: :recycle: remove extra line
- fix: :bug: remove unnecessary sorting of atmosphere mesh faces to optimize rendering
- fix: :bug: ensure GraphicsMenuPlugin is enabled before setting texture quality defaults
- test: :white_check_mark: update snapshot to reflect changes in weather API test
- feat: :sparkles: update eruda dependency from 2.5.0 to 3.4.3
- feat: :sparkles: add USER_ACCOUNT key to StorageKey enum in PersistenceManager
- chore: :arrow_up: update version to 10.6.1 in README.md
- fix: :bug: add optional chaining to prevent errors when accessing touches length
- fix: :recycle: move register uiManagerFinal event listener in SatInfoBox constructor
- test: :white_check_mark: Skip error messages display test on loading screen
- fix: :bug: Correctly reference the second parameter in getEl function for proximity ops type select
- chore: :package: Update subproject commit reference in plugins-pro
- chore: :package: Update subproject commit reference in plugins-pro
- chore: :package: Mark subproject as dirty in plugins-pro
- chore: :package: update subproject commit reference in plugins-pro
- chore: :package: update subproject commit reference in plugins-pro
- refactor: :recycle: change zoomLevel_ to public in Camera class
- chore: :package: update subproject commit reference in plugins-pro
- chore: :package: update subproject commit reference in plugins-pro
- fix: :bug: fix broken og image
- fix: :bug: add MODE environment variable for development mode
- fix: :bug: ensure MODE is loaded from environment variables in config manager
- fix: :bug: update WebpackManager configuration to use the full config object instead of mode
- fix: :bug: update .env file header to reflect correct environment for embed.keeptrack.space
- fix: :bug: update submodule URL to use SSH instead of HTTPS
- chore: :arrow_up: bump version to 10.6.0 in package.json
- fix: :bug: update regex for TLE data source to include optional Celestrak path
- chore: :arrow_up: update subproject commit reference in plugins-pro
- chore: :package: update subproject commit reference in plugins-pro
- fix: :bug: correct textureLod parameter for political map rendering
- chore: :technologist: update subproject commit reference in plugins-pro
- fix: :bug: fix line addition logic in createRef2Ref method
- chore: :package: update subproject commit reference in plugins-pro
- fix: :bug: Hide copyright notice and version text on splash screen
- build: :bug: update subproject commit for src/plugins-pro
- fix: :bug: default help button to disabled
- fix: :bug: update earth texture dropdown after hitting reset
- fix: :bug: default help button to disabled
- fix: :bug: update earth texture dropdown after hitting reset
- fix: :label: fix type
- fix: :label: fix type
- test: :white_check_mark: update test to match new code
- docs: :memo: update readme with build tutorial
- chore: :memo: add note about issue #1018
- refactor: :recycle: link to live api server
- test: :white_check_mark: explicitly allow missing element
- build: :arrow_up: bump ootk
- build: :rotating_light: disable callback-return rule in eslint
- fix: :bug: remove unnecessary flag setting for parsed variables in UrlManager
- feat: :sparkles: add user account button image to top menu
- fix: :bug: Ensure isContextLost method returns false in glMock for accurate context state
- refactor: :art: remove empty line before the return statement for better code consistency
- fix: :bug: ensure YAML lint step continues on error for better pipeline resilience
- fix: :bug: add isUseJdayOnTopMenu setting to control Jday display in top menu
- feat: :sparkles: add attribution for collision data source in the UI
- fix: :bug: set max-width for input focus to ensure proper layout of bottom icons
- fix: :iphone: fix size of sat-info-box title
- fix: :iphone: fix size of sat-info-box title
- fix: :bug: add missing import
- fix: :bug: fix missing form element from change listener
- refactor: :recycle: remove extra empty line
- feat: :sparkles: update night and day Earth map textures for improved visuals
- feat: :sparkles: add new icon images for globe, orbit, etc
- fix: :zap: compress moonmap textures for improved performance
- feat: :sparkles: add lock and login icons to the public image assets
- feat: :sparkles: Add earthspec2k texture for enhanced visual fidelity
- refactor: :truck: fix typo
- fix: :bug: fix broken flag images
- feat: :art: reupload images
- build: :lock: fix npm security issues

#### v10.3.0

>  

- fix: :bug: fix failure when no internet connection
- ✨ updating sensor-timeline to show visibility from optical sensors
- 📈 Updated plot-analysis plugin. Added a lat2lon plot, and updated hover data
- feat: :sparkles: add graphics menu and update shaders
- feat: :sparkles: add caclulator plugin
- refactor: :rotating_light: fix linting errors
- 🛰️  New plugin to create a sat from its keplerian elements
- refactor: :recycle: move graphics settings into graphics menu
- fix: :bug: fixes to orbit-finder
- feat: :sparkles: add startalk preset
- 🏗️  Updating settings, interfaces, packages for code building
- refactor: :recycle: refactor catalog-search to move new functions to satMath class
- chore: :memo: update copyright dates
- refactor: :recycle: change Old GP colorscheme
- 🎯 Polar plot minor update
- refactor: :truck: rename clickDragOptions
- build: :building_construction: disable settings in settingsOverride by default
- feat: :sparkles: add satellite overflight feature to analysis
- refactor: :zap: eliminate loading extra satellites when using limitSat
- feat: :sparkles: add satellite status
- 🎚️  Propagation slider added to the calendar plugin
- refactor: :alien: update collisions plugin to use new KeepTrack API V2
- refactor: :recycle: move sync settings to settingsManager
- refactor: :recycle: update launch site mapping
- fix: :rotating_light: fix typescript errors
- 👀 find-sat plugin updated to add more options: search by data source, or by TLE age
- 🗺️  updating stereo-map to shwo all selected sensors
- fix: :bug: fix typescript syntax errors
- fix: :bug: fix countries menu for new cloudflare backend
- refactor: :rotating_light: fix typescript lint errors
- fix: :bug: fix issue with classification colors
- fix: :bug: fix issues with nodal precession
- fix: :bug: fix known satellites failing with ascii catalog
- 🖼️  Aldoria version first commit. Updated public/ data and folder
- fix: :bug: fix missing decimal place
- 🚀 minor updates to watchlist plugin, and classification bar
- refactor: :rotating_light: fix linting errors in moon.ts
- refactor: :recycle: refactor findObjsByOrbit
- fix: :bug: fix colors
- ⌨️  New shortcut to switch from ECI to ECF: 'E'
- fix: :pencil2: fix typo in import
- refactor: :recycle: rename ELSET to GP
- fix: :bug: add missing launch sites
- fix: :bug: update routes
- feat: :sparkles: add callback option to clickAndDragWidth
- ci: :construction_worker: update sonar-project settings
- fix: :bug: fix scrolling gamepad errors
- build: :building_construction: update husky
- refactor: :recycle: update tle path to use v2 of API
- fix: :ambulance: fix single bad TLE breaking sccIndex and cosparIndex
- fix: :poop: move mock date to test not live code
- feat: :sparkles: add gp url param option
- fix: :bug: add iss flag
- build: :building_construction: update .gitattributes to stop uploading binaries
- fix: :bug: fix bug where logo wasn't hidden with settingsManager
- docs: :memo: update changelog
- fix: :rotating_light: fix typescript linter errors
- feat: :sparkles: add compatibility with ALDORIA CONFIDENTIAL setting
- fix: :bug: use launch year data if available
- fix: :bug: ignore flag for object with no country
- ci: :construction_worker: update sonar connected-mode settings
- fix: :bug: make debug toasts standby color
- fix: :bug: fix missing cis flag
- fix: :arrow_up: bump ootk
- fix: :bug: fix bug where launch year missing 0
- fix: :zap: disable the camera widget by default since it is for a small number of users
- build: :see_no_evil: update gitignore
- fix: :bug: fix camera widget ignoring settings
- feat: :sparkles: add payload status
- feat: :sparkles: add compatibility with ALDORIA CONFIDENTIAL setting
- fix: :bug: filter out 270000 analyst satellites
- fix: :zap: smooth loading of colors during later years of time machine
- fix: :bug: fix incorrect date calculation in ootk-core dependency
- refactor: :zap: eliminate loading extra satellites when using limitSats
- test: :white_check_mark: fix test
- fix: :bug: fix bug where CIS flag shown instead of RU
- fix: :bug: fix confidence logic
- chore: :memo: update version date
- fix: :arrow_up: bump ootk to fix leap year errors
- feat: :sparkles: allow spaces in watchlist entry
- chore: :memo: add todo for creating a new setting
- refactor: :memo: update comment for bottomIconElementName
- fix: :lock: fix security issues in dependencies

#### v10.2.2

>  

- fix: :zap: improve orbit finder algorithm for breakups
- fix: :bug: fix linter and tests
- docs: :memo: update CHANGELOG

#### v10.2.1

>  

- fix: :bug: add error checking for non-xbox controllers
- fix: :bug: add verification that elements are found before accessing
- docs: :memo: update changelog
- fix: :bug: fix black earth not loading
- test: :white_check_mark: update test environment

#### v10.2.0

>  

- Sateliot
- fix: :bug: fix debris screening menu being available without a satellite selected
- feature: new sateliot satellite model
- feat: :sparkles: add localization for spanish and german
- feat: :sparkles: add collapsable sections in the sat-infobox
- feature: created a new satellite model based on a s6u with solar pannels.
- refactor: :fire: remove jquery!
- fix: :bug: fix styling issues with sat-infobox and search drop down
- feat: :sparkles: update new calendar component
- refactor: :fire: remove unused fonts
- feat: :lipstick: new ui
- feat: :heavy_minus_sign: remove jquery-ui-bundle dependencies for calendar
- refactor: :lipstick: update styling for new theme
- refactor: :recycle: rename css variables to match home page
- feat: :sparkles: add flags
- feat: :sparkles: add new camera widget in eci coordinates
- refactor: :bug: fix class name error caused by minification
- build: :green_heart: fix build hanging
- feat: :sparkles: expand features of tip plugin and fix bug with fetch source
- test: :white_check_mark: update tests to match new plugin architecture
- fix: :bug: fix type in .gitignore
- build: :fire: remove old deployment pipeline
- feat: :sparkles: add geo satellite transponder info
- fix: :lipstick: fix ui issues caused by input-field not having margin
- feat: :globe_with_meridians: add localization to calendar for es and de
- feat: :sparkles: add sateliot preset
- fix: :lipstick: fix stf menu ui
- refactor: :wastebasket: remove deprecated style code
- refactor: :recycle: migrate to storage.keeptrack.space
- feat: :sparkles: add camera reset function
- feat: :sparkles: add tv satellites to constellations plugin
- feat: :sparkles: add colorbox header
- feat: :sparkles: add links to satellite owner websites
- build: :construction_worker: remove codecov from cicd
- refactor: :recycle: remove deprecated settings and names
- feat: :sparkles: add new logo always on
- fix: :bug: fix export function of transponders plugin
- refactor: :lipstick: more color updates
- fix: :bug: fix flickering on mobile
- feat: :sparkles: update screenshot to use new logo instead of text
- feat: :sparkles: add clear message when no lookangles correctly displayed
- feat: :sparkles: add different logic for rotation reset vs full camera reset
- fix: :bug: fix bug caused by satellite that propagates into the earth
- fix: :bug: fix bug where satellite timeline only visible if watchlist sats
- refactor: :lipstick: more changes to ui color
- fix: :bug: fix color of buttons in multi-site lookangles settings
- fix: :bug: fix bug where some plugins reenable in mobile mode
- fix: :bug: fix bug in processLimitedSats_ that caused duplicated ids
- refactor: :recycle: refactor the satellite cone mesh distance from earth to settings
- build: :construction_worker: remove unnecessary artifacts
- fix: :lipstick: fix collapsing sat-infobox on mobile
- fix: :lipstick: fix duplicate shadow effect
- fix: :bug: fix bug with shift being tracked as down after window loses focus
- fix: :bug: fix missing id parameters
- build: :heavy_minus_sign: remove old dependencies
- feat: :sparkles: add new splash screens
- fix: :bug: fix new launch showing error even when it works
- refactor: :lipstick: change color of polar plot to match new theme
- feat: :lipstick: shrink sat-info-box when multiple menus are collapsed
- fix: :bug: fix dark-clouds preset
- refactor: :children_crossing: increase zoom speed
- fix: :bug: fix bug where no references availalbe for historical RCS est
- fix: :bug: fix transponder menu being enabled incorrectly
- refactor: :heavy_minus_sign: remove unused dependencies
- test: :white_check_mark: fix colorbox test
- fix: :bug: fix sensor-list side menu size
- refactor: :recycle: change default search size
- feat: :lipstick: add iss flag
- fix: :bug: fix bug where polar plot could be opened without a sensor selected
- ci: :green_heart: switch trufflehog action
- fix: :bug: fix create sensor from context menu not working
- fix: :bug: fix search bar being clipped when sat-infobox moved
- fix: :lock: fix security issue in dependencies
- fix: :bug: fix unknown countries showing up as Grenada
- refactor: :recycle: allow closer zoom on satellite models
- fix: :ambulance: fix error when no satellite selected
- fix: :bug: fix typo in locales.ts
- feat: :sparkles: update logo image
- fix: :lipstick: fix custom sensor plugin menu width
- fix: :lipstick: fix missing nav-bar-height on mobile
- feat: :sparkles: update logos
- refactor: :lock: fix security issue with dependencies

#### v10.2.0-0

#### v10.1.0

>  

- feat: :sparkles: add localization for spanish and german
- refactor: :fire: remove jquery!
- feat: :sparkles: update new calendar component
- refactor: :fire: remove unused fonts
- feat: :heavy_minus_sign: remove jquery-ui-bundle dependencies for calendar
- feat: :sparkles: add flags
- refactor: :bug: fix class name error caused by minification
- feat: :sparkles: expand features of tip plugin and fix bug with fetch source
- test: :white_check_mark: update tests to match new plugin architecture
- fix: :bug: fix type in .gitignore
- build: :fire: remove old deployment pipeline
- feat: :globe_with_meridians: add localization to calendar for es and de
- refactor: :recycle: migrate to storage.keeptrack.space
- fix: :bug: fix flickering on mobile
- fix: :bug: fix missing id parameters
- refactor: :heavy_minus_sign: remove unused dependencies
- fix: :bug: fix typo in locales.ts
- refactor: :lock: fix security issue with dependencies

#### v10.1.0-2

>  

- build: :heavy_minus_sign: remove old dependencies

#### v10.1.0-1

>  

- fix: :bug: disable husky

#### v10.1.0-0

>  

- refactor: :recycle: abstract text from plugins
- feat: :construction: first attempt at providing localization
- refactor: :recycle: refactor data out of sensorList and multisiteLookangles
- feat: :sparkles: add ability to push to npm again
- docs: :memo: update changelog
- fix: :bug: fix missing rmb items
- fix: :goal_net: add try/catch for bad plugins
- fix: :rotating_light: fix linter errors with package.json
- fix: :bug: fix rmb events firing twice
- fix: :bug: fix getSensorList logic

#### v10.0.2

>  

- chore: :card_file_box: update databases
- fix: :bug: fix external TLEs not loading
- docs: :memo: update changelog
- fix: :ambulance: emergency fix
- fix: fix analytics on localhost

#### v10.0.1

>  

- fix: :bug: add conistent hover color
- ci: :green_heart: prevent overwriting production files when deploying
- fix: :bug: fix sorting of the tracking and impact prediction plugin
- feat: :sparkles: add new TIP message plugin
- refactor: :recycle: refactor lineManager into separate classes
- fix: :bug: fix dependency checking logic for plugins
- docs: :memo: update readme and release notes
- refactor: :recycle: refactor all toast types to an enum
- chore: :card_file_box: update data
- fix: :technologist: fix linter and formatter conflict
- feat: :monocle_face: add basic telemtry to determine which features should be prioritized
- fix: :bug: fix ui issues with missile objects
- chore: :goal_net: catch and log invalid velocity
- fix: :bug: convert legacy missile sims into new missileObject class
- fix: :bug: fix missilesInUse count
- fix: :bug: fix missiles causing search errors
- fix: :bug: fix camera trying to go inside the earth
- docs: :memo: add a citation file
- fix: :zap: fix lag when selecting satellites
- build: :arrow_up: bump dependencies
- ci: :construction_worker: allow npm audit to fail but open an issue
- docs: :memo: fix readme links
- fix: :bug: fix bug with depth test when milkyway is disabled
- fix: :bug: dont draw FOV lines to missiles
- build: :arrow_up: upgrade materializecss
- fix: :bug: fix bug where search results were shown even if no results
- fix: :bug: fix duplicate listeners on search box

#### v10.0.0

>  

- feat: :sparkles: add satellite-timeline plugin
- feat: :sparkles: add timeline feature
- refactor: :recycle: abstract away common elements of sesnor-fov-mesh/factory
- feat: :sparkles: update satellite fov menu
- feat: :sparkles: add radar domes
- feat: :sparkles: add settings and download buttons to look-angles and multi-site-looks
- refactor: :fire: remove markers for sensor fov and surv
- refactor: :recycle: split methods in SensorFovMesh class
- feat: :sparkles: improve sensor management and menus to incorporate radarDomes
- feat: :construction: add cone mesh and coneFactory
- feat: :wastebasket: deprecate marker logic
- fix: :bug: fix cone mesh only hitting surface of earth
- chore: :art: update logos
- feat: :sparkles: add settings menu to multi-site looks
- chore: :card_file_box: update databases
- feat: :sparkles: add settings sub-menu to plugins
- refactor: :recycle: refactor sensor-fov-mesh-factory to remove duplication and deprecated methods
- feat: :sparkles: update keyboard shortcuts to align with kerbal
- fix: :zap: fix long loop through markers looking for satellites
- feat: :sparkles: update camera keyboard controls to match kerbal
- feat: :art: update icons and logos
- feat: :sparkles: add scc num and time to polar plots
- fix: :bug: fix cone's not lining up prefectly with a satellite
- feat: :sparkles: update look angles logic and add type column
- refactor: :truck: rename customMeshFactory to sensorFovMeshFactory
- refactor: :recycle: consolidate selectsat manager logic
- feat: :sparkles: improve radarDomes
- fix: :bug: catch edge case where some plugins not loaded
- feat: :art: replace all icons
- feat: :sparkles: update keyboard shortcuts for sensor-list
- feat: :sparkles: add math for new look angles logic
- fix: :bug: fix resizing of timeline window
- feat: :sparkles: add searching by alt name
- refactor: :coffin: disable satelliteFov until I have a working mesh solution instead of markers
- feat: :sparkles: update keyboard shortcuts for sat-info-box
- feat: :sparkles: add createRadarDome calls
- feat: :sparkles: add ctrl+b to toggle bottom menu open/close
- chore: :card_file_box: update sensors paramaters
- feat: :sparkles: add keyboard shortcut for satelltie FOV cones
- feat: :sparkles: update keyboard shortcuts for stereo map
- fix: :bug: fix polar plot overwriting canvas
- feat: :sparkles: update keyboard shortcuts for polar plot
- feat: :sparkles: update keyboard shortcuts for debug menu
- feat: :sparkles: remove markers changed cb from sensor fov and surv
- feat: :sparkles: update keyboard shortcuts for night toggle
- test: :white_check_mark: fix testing environment
- fix: :bug: fix side menu sub menu width override not working
- fix: :bug: fix keyEvents not firing
- fix: :bug: reenable satelliteFOV plugin
- refactor: :recycle: refactor camera logic out of mouse input
- feat: :sparkles: add uuid to custom and stf sensor objNames to differentiate them
- refactor: :recycle: type settingsSideMenu in multi-site-look-angles
- feat: :sparkles: update splash screens
- refactor: :art: update css to make dividers thicker
- fix: :bug: fix hide UI shortcut not working initially
- feat: :sparkles: add resize event
- fix: :bug: fix default isDraggable settings
- refactor: :truck: rename SensorFovMeshFactory filename
- fix: :bug: fix wathlist overlay being enabled incorrectly
- fix: :art: fix logo being oversized

#### v9.1.0

>  

- fix: :bug: fix issue with godrays breaking after screen resize
- fix: :bug: fix issue with godrays breaking after screen resize
- refactor: :rotating_light: migrate to eslint for formatting
- chore: :card_file_box: update database files
- fix: :zap: fix performance bug and css issues
- chore: :card_file_box: update data
- feat: :sparkles: add polar plots
- feat: :sparkles: add new quick reports
- fix: :ambulance: fix one bad satellite breaking website
- chore: :card_file_box: update databases
- chore: :card_file_box: update database
- fix: :bug: fix logic on waitForCruncher
- feat: :sparkles: add aer report
- feat: :sparkles: add sun angle to bestpass report
- fix: :bug: multiple bug fixes related to color buffer updates
- fix: :ambulance: fix new launch plugin
- refactor: :recycle: update settings methods to identify private funcs
- fix: :zap: reduce impact of godrays on performance
- fix: :bug: fix conflict between custom sensors and normal sensors
- test: :white_check_mark: fix broken tests
- feat: :sparkles: add save button to polar plots
- fix: :bug: fix reference orbits not updating correctly
- fix: :bug: fix line to sun/moon in sensor info for custom sensors
- fix: :bug: fix sun/moon line
- build: :arrow_up: bump ootk
- feat: :sparkles: add inFOV color to group color scheme
- fix: :zap: remove unnecessary color buffer update
- fix: :bug: fix how isSensorSelected works
- fix: :lipstick: fix resize cursor icon on draggable menus

#### v9.0.3

>  

- fix: :bug: fix error when sensor reset and planetarium is open
- feat: :sparkles: add responsive design
- refactor: :technologist: add version number to error handler for easier debugging
- docs: :memo: update changelog
- fix: :bug: fix canvas resizing issue on mobile
- fix: :bug: fix webgl issue with large images on small devices
- refactor: :recycle: add additional catalog sources
- build: :arrow_up: bump ootk

#### v9.0.2

>  

- fix: :ambulance: fix bug where lastPropRate not previously assigned

#### v9.0.1

>  

- fix: :ambulance: deprecate plot code that is loading out of order

#### v9.0.0

>  

- Develop
- Develop
- build(deps-dev): bump @types/webgl2 from 0.0.6 to 0.0.10
- build(deps-dev): bump cypress from 12.17.4 to 13.6.1
- build(deps-dev): bump @types/jquery from 3.5.14 to 3.5.29
- Develop
- Develop
- Develop
- Develop
- Develop
- fix: :bug: fix orbits broken when turned on after initialization
- fix: :bug: fix moon position calculation
- feat: :sparkles: improve scaling of mesh models
- feat: :sparkles: add ses satellite mesh
- chore: :fire: remove old tle files
- chore: :fire: remove unused meshes
- feat: :sparkles: ootk v4 integration
- feat: :sparkles: add glonass meshes
- chore: :card_file_box: update satellite databases
- refactor: :heavy_minus_sign: reduce dependencies
- chore: :card_file_box: update json databases
- fix: :bug: streamline and fix mesh manager
- refactor: :truck: reorganize source code
- refactor: :recycle: refactor meshes
- refactor: :truck: reorganize source code
- refactor: :recycle: refactor drawing code
- refactor: :poop: refactored to isolate plugins
- refactor: :label: improve type support
- build: :truck: update public folder
- refactor: :label: improve type support for KeepTrackApi callbacks
- refactor: :recycle: separate satellite selection from catalog management
- refactor: :recycle: condense drawing code to align with three.js
- feat: :sparkles: improved lineManager class
- fix: :bug: fix countries plugin
- feat: :sparkles: update loading screens
- fix: :bug: fix and refactor meshes
- chore: :card_file_box: update databases
- test: :white_check_mark: fix all broken tests
- test: :white_check_mark: update tests to work with ootk
- fix: :bug: refactor and fix webgl issues
- fix: :bug: fix stereo map
- refactor: :beers: merge update-select-box with satinfoboxCore
- refactor: :recycle: integrate with ootk v4
- fix: :bug: fix satinfobox issues
- refactor: :truck: refactor presets
- feat: :sparkles: switch to css only tooltip for faster ui
- refactor: :recycle: refactor sat-info-box
- refactor: :wastebasket: deprecate socrates html file
- chore: :card_file_box: update tle catalogs
- fix: :bug: align mesh, orbits, and dots positions
- refactor: :truck: reorganize source code
- refactor: :recycle: refactor select sat manager functions out of webgl-renderer
- refactor: :recycle: standardize plugins
- fix: :bug: fix lookangles/multi-site lookangles not enabling/disabling correctly
- build: :arrow_up: bump ootk
- fix: :bug: fix edit satellite plugin
- fix: :bug: fix css on mobile
- refactor: :recycle: simplify zoomlevel functions
- fix: :bug: update select sat manager
- fix: :arrow_up: integrate latest ootk version
- feat: :sparkles: add sun/moon toggle and export sats in fov
- refactor: :recycle: refactor editsat
- refactor: :recycle: remove unnecessary interfaces
- fix: :bug: fix lookangles plugin
- refactor: :recycle: remove code no handled in ootk
- refactor: :fire: remove old interfaces
- refactor: :recycle: refactor search manager functions out of ui manager
- fix: :zap: add better number only searching
- ci: :construction_worker: split cd pipeline into stage and deploy
- chore: :coffin: remove old files
- feat: :sparkles: add toggles for starlink and notional sats
- fix: :bug: fix camera key not working
- test: :bug: fix broken tests
- fix: :bug: fix bugs caused by splitting velocity updates
- fix: :bug: fix search bar toggle and slide in animations
- feat: :sparkles: add starlink toggle
- refactor: :boom: migrate to new selectsatmanager plugin
- feat: :sparkles: update socrates to json input
- refactor: :recycle: integrate with ootk v4
- fix: :bug: fix touch controls
- build: :technologist: update vscode tasks
- feat: :zap: improve standard magnitude estimates
- refactor: :truck: rename satInfoBoxCore to satInfoBox
- refactor: :recycle: make sccNum vs Id more explicit
- refactor: :recycle: cleanup collisions plugin
- feat: :sparkles: million-year presets
- refactor: :recycle: refactor enum to ootk
- build: :wastebasket: deprecate build embed
- build: :arrow_up: bump dependencies
- fix: :bug: fix watchlist with vimpel objects
- test: :white_check_mark: fix broken tests
- fix: :children_crossing: improve missile mesh orientation
- feat: :sparkles: add stf az el ext in kilometers
- fix: :coffin: hide show agencies until it is fixed
- fix: :bug: fix leo and geo color schemes
- refactor: :recycle: refactor selectsat manager
- docs: :page_facing_up: fix missing word public from license
- docs: :memo: update changelog
- fix: :bug: fix new launch plugin
- fix: :bug: fix breakup icon color in bottom menu
- fix: :bug: fix css issue on tablets
- refactor: :recycle: organize breakup plugin
- refactor: :recycle: add helpers for hide/show dom elements
- fix: :bug: fix constellations
- feat: :sparkles: add more sensor info
- test: :white_check_mark: fix broken tests
- build: :goal_net: update husky pre-commit to be more extensible
- refactor: :rotating_light: Use // @ts-expect-error over // @ts-ignore
- fix: :bug: fix missile crunching without sensor selected
- fix: :bug: fix breakup not updating satellite
- refactor: :wastebasket: deprecate stringPad class
- refactor: :recycle: use KeepTrackApiEvents instead of strings
- feat: :sparkles: add start-stop clock button to context menu
- refactor: :recycle: refactor line manager code out of selectsat manager
- fix: :bug: add callbacks for sensor dot selected
- fix: :bug: fix search logic
- feat: :sparkles: add more options to constellations plugin
- fix: :bug: fix hover not showing launch year
- fix: :bug: fix for #827
- fix: :bug: fix select sat on plugins
- test: :white_check_mark: fix broken tests
- chore: :technologist: add task to open github page
- fix: :bug: ensure consistency between constellations
- chore: :label: add typing to crunchers
- fix: :bug: fix issues with legend
- test: :white_check_mark: add test to ensure moon is in right position
- refactor: :bug: move conditional back to renderer
- fix: :bug: fix sound playing before user interacts with page
- fix: :bug: add fixes to presets
- chore: :card_file_box: update sensor information
- fix: :art: fix icon flickering when resizing bottom menu
- fix: :bug: fix switch in custom sensor
- chore: :technologist: minor tweaks to tasks.json
- refactor: :recycle: move stereo map plugin code out of select sat manager
- fix: :adhesive_bandage: add logic for when primary and secondary sat are the same
- fix: :bug: fix hover color showing on selected sats
- refactor: :rotating_light: remove use of banned type
- fix: :bug: fix edit-sat
- fix: :bug: fix short term fence and watchlist plugins
- fix: :bug: better zoom out experience
- chore: :wastebasket: cleanup vscode settings.json file
- fix: :bug: fix ISS chatter not playing
- feat: :sparkles: add setting for delay between time machine loops
- refactor: :fire: remove duplicate code
- fix: :bug: fix selected dot missing when zoomed out
- fix: :bug: fix country color scheme
- fix: :bug: fix debug menu throwing errors when disabled
- fix: :bug: fix country color scheme and legend
- fix: :bug: fix countries option in find sat plugin
- fix: :adhesive_bandage: remove unnecessary console logging
- refactor: :recycle: remove duplicate imports
- fix: :bug: fix search dropdown css
- fix: :adhesive_bandage: fix sec-angle-link showing when not usable
- ci: :bug: fix build script
- fix: :bug: fix selecting satellite dots
- fix: :bug: fix collision plugin not searching for full satid
- fix: :bug: reduce local storage saves
- feat: :sparkles: expand showEl to allow passing a display value
- build: :wastebasket: simplify build instructions
- fix: :bug: fix for velocity being 0 instead of null or an object
- fix: :bug: fix 16k skybox not loading
- chore: :rotating_light: fix linter error in settings.json
- fix: :bug: fix wrong decayed objects be deactivated
- fix: :bug: fix excessive xmlserialize calls
- fix: :bug: fix keyboard events not working
- fix: :bug: better fix to resizeCanvas
- fix: :bug: throttle multiple error requests to open github
- fix: :bug: fix uv attribute bug in godrays
- test: :white_check_mark: skip failing test for now
- docs: :bookmark: update version to 9.0.0
- refactor: :label: add readonly to plugin names
- refactor: :children_crossing: slow auto zoom and chase speeds
- perf: :zap: use RegExp#test for true/false tests
- refactor: :recycle: create larger font for altitudes presentation
- ci: :rotating_light: fix linter error
- build: :label: add more type support
- refactor: :heavy_plus_sign: add dependencies for refactored meshes
- fix: :fire: remove tooltip that blocked clock
- ci: :rotating_light: fix linter error
- ci: :green_heart: add only build for staging after approval
- fix: :bug: fix search finding land objects
- build: :arrow_up: bump serve
- fix: :bug: fix watchlist plugin
- ci: :rotating_light: update sonar ignores
- fix: :bug: fix resizeCanvas
- fix: :bug: fix broken godrays
- fix: :white_check_mark: fix broken test
- docs: :memo: add description of searchBox scene object
- build: :lock: fix security issue in dependencies

#### v8.2.0

>  

- Develop
- fix: :bug: fix typo in time-machine logic
- Develop
- fix: :bug: fix #758
- feat: :sparkles: add improvements for JSC Vimpel data
- fix: :bug: fix time machine showing vimpel objects in 1958
- feat: :sparkles: add confidence color scheme
- refactor: :recycle: rewrite of sensors
- refactor: :recycle: move all plot plugins to class based design
- refactor: :recycle: reduce dependencies by using keepTrackApi more
- refactor: :recycle: refactor analysis menu into class structure
- refactor: :recycle: move ECI and ECF plots to stand-alone plugins
- refactor: :recycle: cleanup satinfobox design
- refactor: :recycle: consolidate right click menu
- feat: :sparkles: add persistanceManager for localStorage management
- feat: :sparkles: persist settings across sessions
- fix: :rotating_light: fix sonarcloud findings
- fix: :bug: add error checking to new launch plugin
- test: :white_check_mark: fix broken tests
- fix: :bug: add fixes for multi-site lookangles plugin
- docs: :memo: update changelog
- feat: :children_crossing: update to address #803
- feat: :sparkles: add alternate names and notional TLEs
- refactor: :wastebasket: remove old keepTrackApi.programs object
- fix: :bug: add fixes to position cruncher for VIMPEL objects
- fix: :adhesive_bandage: fix minor PWA errors
- ci: :construction_worker: remove cypress for now
- fix: :bug: fix bug in demo-mode logic
- fix: :lipstick: fix incorrect icon color
- fix: :bug: fix to #809
- fix: :bug: fix bug where low resolution menu not visible
- ci: :green_heart: move sonarcloud scan to a github app instead
- ci: :construction_worker: update sonarcloud scan
- ci: :bug: fix yaml format
- fix: :bug: consolidate imports
- test: :white_check_mark: fix broken test
- ci: :construction_worker: fix sonarlint
- docs: :memo: update main.ts docs
- docs: :wastebasket: deprecate the about menu
- fix: :bug: add defensive code for missing satellite or sensor
- test: :white_check_mark: fix test environment
- fix: :fire: consolidate imports
- fix: :zap: only reinitialize impacted components for better performance
- test: :white_check_mark: fix broken test
- fix: :bug: fix for #759
- docs: :memo: explain DISCOVR differences
- fix: :bug: fix time machine showing VIMPEL
- ci: :construction_worker: migrate to automatic sonarcloud analysis
- build: :lock: fix security issue
- ci: :construction_worker: update sonarcloud scan
- Update README.md
- Update README.md
- fix: :bug: fix issue w/ 2nd gamepad but no 1st gamepad
- chore: :card_file_box: update TLE2.json
- fix: :adhesive_bandage: remove debugger
- fix: :bug: fix bug where satinfobox disappears on rmb
- fix: :lipstick: fix wrong icon color
- ci: :pencil2: remove extra line from build yml

#### v8.1.1

>  

- 772 right click create sensor here
- Develop
- Develop
- refactor: :fire: revert to google analytics
- feat: :sparkles: new splash screens
- feat: :sparkles: add searchLimit param to settings
- Develop
- feat: :sparkles: abstract camera and add dark-clouds preset
- fix: :bug: fix issue in mobile logic
- feat: :sparkles: update gamepad logic
- Develop
- fix: :bug: fixes for iframes
- feat: :sparkles: update iframe example
- Develop
- feat: :sparkles: update readme
- fix: :bug: fix illegal return
- Develop
- ci: :rotating_light: fix minor linter error
- ci: :construction_worker: expand ignore list for deploy
- ci: :construction_worker: fix ignore list for sftp
- ci: :construction_worker: fix ignore list for sftp
- ci: :construction_worker: fix sftp typo
- ci: :construction_worker: fix sftp ignore list
- ci: :construction_worker: fix sftp settings
- ci: :construction_worker: use new sftp deployer
- ci: :construction_worker: fix ci/cd increase timeout
- Develop
- ci: :pencil2: sftp to ftps
- Develop
- ci: :construction_worker: fix ci/cd sftp
- ci: :construction_worker: update ci/cd pipeline
- fix gh-pages deployment
- fix ci/cd
- ci: :construction_worker: update ci/cd pipeline
- Minor updates
- Keep Track Version 8
- refactor: :art: put catalog loader in class for more clear loading
- refactor: :recycle: refactor format-tle class for standardization
- refactor: :label: add clear difference between catalog objects and sat objects
- fix: :bug: fix custom sensor errors
- docs: :memo: update changelog
- fix: :bug: add checks for missing data in satInfoboxCore
- fix: :bug: fix position cruncher not calculating star positions
- feat: :sparkles: add hires skybox and have skybox follow camera
- fix: :bug: update year or less logic to make large fragmentation events match date it occurred
- fix: :bug: add defensive code to block infinite loops
- feat: :sparkles: add new altitudes settings and disable stars by default
- fix: :white_check_mark: fix failing catalog-loader testing
- feat: :sparkles: scale dots during auto zoom out
- refactor: :label: add better type support for catalog
- refactor: :recycle: refactor to reduce code
- fix: :bug: fix star index calculations
- feat: :sparkles: make vimpel catalog available by default
- fix: :bug: fix race condition found in #793
- fix: :green_heart: fix build error
- refactor: :wastebasket: remove debug code
- refactor: :recycle: refactor for better type support
- feat: :sparkles: allow disabling the moon
- refactor: :coffin: remove old reference
- fix: :bug: fix Right Click &gt; Create Sensor Here error #772
- refactor: :recycle: update cruncher interfaces
- fix: :bug: reduce unnecessary logging in default settings
- docs: :memo: update version date
- fix: :recycle: update texture url for hires earth
- fix: :pencil2: fix typo in star indexs
- fix: :bug: fix typo in time-machine logic
- fix: :bug: fix satinfobox appearing on first static object clicked
- fix: :white_check_mark: fix test issue caused by new settingsManager
- build: :lock: fix security issues

#### v8.1.0

>  

- fix: :bug: fix controller disconnected crash
- feat: :sparkles: add external catalog loader
- feat: :sparkles: abstract camera and add dark-clouds preset
- fix: :bug: fix mobile controls
- feat: :sparkles: update gamepad logic
- feat: :zap: improve performance on mobile
- fix: :bug: fix satinfobox crashing with missiles
- fix: :bug: fixes for iframes
- feat: :children_crossing: add improved debug menu
- feat: :children_crossing: improved camera controls
- feat: :sparkles: add video director menu
- fix: :bug: fix string extractor
- docs: :memo: update changelog
- feat: :sparkles: add support for external TLE files
- feat: :sparkles: update to setting defaults
- feat: :lipstick: update site manifest and favicons
- feat: :zap: improve notional debris logic
- feat: :sparkles: improve mobile experience
- refactor: :recycle: add skip when mesh can't be seen anyway
- refactor: :fire: revert to google analytics
- feat: :sparkles: add auto rotate pan and zoom settings
- feat: :sparkles: force presets for facsat2
- fix: :bug: fix hovermanager not available in KeepTrackApi
- feat: :sparkles: add presets for facsat2
- refactor: :label: update settings type
- test: :bug: move analytics to fix jest hanging
- fix: :bug: fix analytics error
- test: :bug: fix catalog test
- feat: :sparkles: filter out objects that appear to have reentered
- feat: :sparkles: new splash screens
- fix: :bug: fix issue in mobile logic
- test: :bug: fix failing tests
- feat: :sparkles: add iframe example
- fix: :bug: fixed notional satellites being found in search
- fix: :bug: dont use orbit manager if it isn't available
- fix: :bug: fix bug with legend menu showing empty
- test: :bug: make getEl optional for select-sat-manager tests
- fix: :zap: better camera zooming controls
- feat: :sparkles: add searchLimit param to settings
- feat: :sparkles: add iframe check
- feat: :sparkles: update readme splash screen and meta data
- fix: :bug: fix time machine not stopping correctly
- fix: :bug: better handling of prop rate on load
- feat: :sparkles: update notional debris coloring
- feat: :sparkles: update iframe example
- fix: :bug: fix search results
- fix: :zap: remove debug code
- fix: :adhesive_bandage: quick fix for TLEs without leading 0s
- fix: :bug: fix coloring issue with video-director plugin
- refactor: :recycle: use sputnik as extra satellite
- refactor: :recycle: make use of keepTrackApi
- fix: :bug: fix mesh shaders turning white
- fix: :bug: fix crash caused by sat-sun being missing
- chore: :card_file_box: update default catalog
- refactor: :coffin: hide debug only code
- refactor: :recycle: move event listener for keyboard to document level
- fix: :bug: reduce scrolling errors
- refactor: :card_file_box: update default settingsOverride
- docs: :memo: update build date
- fix: :bug: fix hover id error caused by id 0
- build: :lock: fix audit issues

#### v8.0.0

>  

- feat: :sparkles: add preset functions to settings
- ci: :construction_worker: add dev site to ci/cd pipeline
- fix: :bug: fix errors when plugins disabled
- build: :construction_worker: update dependencies
- ci: :construction_worker: use new sftp deployer
- feat: :sparkles: replace google analytics
- fix: :bug: move analytics to html
- feat: :sparkles: update readme
- ci: :construction_worker: use new sftp deployer
- ci: :pencil2: fix typo in ci/cd pipeline
- ci: :construction_worker: update ci/cd pipeline
- fix: :label: fix type issue
- ci: :construction_worker: fix sftp ignore list
- fix: :bug: fix limitsat functionality
- fix: :bug: fix issue with sun colorscheme
- ci: :construction_worker: fix ci/cd directory names
- fix: :bug: fix illegal return
- feat: :sparkles: update readme
- ci: :rotating_light: fix formatting on ci/cd pipe
- ci: :construction_worker: expand ignore list for deploy
- feat: :fire: remove old license text
- ci: :construction_worker: fix ignore list for sftp
- ci: :construction_worker: fix ignore list for sftp
- ci: :construction_worker: fix sftp typo
- ci: :construction_worker: update dependabot
- ci: :pencil2: sftp to ftps
- ci: :rotating_light: fix minor linter error
- feat: :sparkles: improve errorManager logic for easier offline testing
- fix: :bug: catch setHover errors where index is null
- test: :white_check_mark: improve tests
- ci: :construction_worker: update ci/cd pipeline
- test: :white_check_mark: fix dependency errors on tests
- ci: :construction_worker: fix sftp settings
- ci: :construction_worker: fix ci/cd sftp
- fix: :bug: fix bug in settings for new url
- ci: :construction_worker: update ci dependencies
- feat: :sparkles: add getHoverManager to keepTrackApi
- ci: :construction_worker: reduce unnecessary visaulizer runs
- fix: :bug: fix splash screen not showing up
- ci: :construction_worker: fix ci/cd increase timeout
- fix: :bug: dont overwrite dist/settings/settingsOverride.js
- ci: :pencil2: fix typo in ci/cd
- fix: :adhesive_bandage: fix build script
- ci: :construction_worker: rebuild on PR from dependabot
- ci: :bug: fix gh-pages deployment
- fix: :bug: fix colorscheme when limitedsats in effect
- Delete .github/workflows/build.workflow
- Create build.workflow

#### v8.0.0-0

>  

- Update
- v7.2
- Add .circleci/config.yml
- New version
- feat: :sparkles: give user option to hide toasts
- fix: :bug: fixed error when sensor not selected
- feat: :sparkles: add 2030 catalog tools and 3d cone draft
- feat: :fire: Convert to class based system for code part 1
- ci: :sparkles: add visualizer workflow
- refactor: :recycle: split missileManager.ts and convert to classes
- feat: :technologist: convert settingsManager to a class
- refactor: :recycle: split watchlist plugin and convert to classes for better modularity
- refactor: :recycle: convert dots to classes and implement vao
- feat: :sparkles: add new gray political map and color scheme
- style: :art: fix minor formatting and linter errors
- test: :white_check_mark: improve test coverage
- style: :art: format saveVariable.ts
- chore: :technologist: update changelog
- build: :green_heart: add missing tsconfig file
- build: :construction_worker: update github pipeline to use modern node versions
- feat: :sparkles: enable toggles for orbital regime independent of color scheme
- feat: :lipstick: warn/prevent user trying non-circular orbits for breakups
- ci: :arrow_up: update ci/cd pipeline dependencies
- build: :construction_worker: clean up build pipeline
- fix: :bug: trap bug when satInSun cant be calculated
- Create SECURITY.md
- feat: :sparkles: maintain sensor filter and rerun on satellite change for multisite lookangles
- build: :lock: update all unsecure dependencies
- feat: :sparkles: update lookangles on time change
- refactor: :recycle: migrate setting to stereo-map plugin
- style: :art: remove trailing spaces
- style: :art: remove trailing spaces
- fix: :bug: fix error calculating meanA in non-circular orbits
- build: :art: fix yaml formatting
- build: :wrench: update vscode settings
- ci: :bug: update yml
- ci: :construction_worker: update sonarcloud and CodeQL
- ci: :green_heart: fix yaml formatting caused by github
- fix: :bug: fix missing ground objects
- feat: :sparkles: resize mesh models to support pizza box 3D model
- feat: :sparkles: add close side menu to KeepTrackPlugin class
- ci: :rotating_light: fix linter issue
- feat: :sparkles: rerun search when opening search bar
- ci: :green_heart: remove watch from npm test
- Update SECURITY.md
- ci: :bug: update yml
- ci: :bug: update yml
- build: :lock: fix npm security issues
- fix: :pencil2: fix bug in test due to typo
- chore: fixing tags
- fix: :bug: fix search dropdown not showing when search icon clicked
- build: :arrow_up: upgrade Orbital Object Toolkit (ootk)
- ci: :adhesive_bandage: fix typo in yaml
- Update visualizer.yml
- ci: :green_heart: reduce unnecessary automatic PRs
- Repo visualizer: update diagram
- Repo visualizer: update diagram
- Repo visualizer: update diagram
- Repo visualizer: update diagram
- Repo visualizer: update diagram
- Repo visualizer: update diagram
- Update SECURITY.md
- Repo visualizer: update diagram
- Repo visualizer: update diagram
- Update visualizer.yml
- Update visualizer.yml
- feat: :sparkles: add staticOffsetChange keepTrackApi callback
- Repo visualizer: update diagram

#### v7.2.0

>  

- Main
- test: :adhesive_bandage: fix testing issue causing jest to fail on gi…
- Update
- Update
- minor bug fixes
- Version 7.1
- Update to 7.0
- Update
- Update
- Upgrade dependencies
- Develop
- Develop
- Develop
- refactor: :label: convert om-manager to typescript
- Develop
- Develop3
- feat: :card_file_box: update catalog
- fix: :green_heart: update docker.google instructions
- Develop
- feat: :zap: optimize milky way textures and rotate
- Develop
- Develop
- Develop
- Develop
- fix: :ambulance: fix photomanager icon not loading
- fix: :ambulance: fix image not found on linux ending in /
- Develop
- Develop
- build: :arrow_up: upgrade dependencies
- Develop
- chore: :card_file_box: update database
- fix: :zap: remove jquery and fix open bugs
- feat: :sparkles: add eci ecf ric inc2lon and time2lon plots
- refactor: :zap: remove jquery
- feat: :sparkles: add satellite search on control site clicked
- style: :art: replace all camelCase files with hyphens for better git detection
- feat: :sparkles: add scenario-creator scaffold
- docs: :page_facing_up: clear AGPL notice
- feat: :sparkles: add 2nd sat selection + update selectbox
- fix: :rotating_light: fix sonarcube findings
- feat: :sparkles: add ECI plots
- refactor: :zap: remove more jquery
- fix: :zap: reduce complexity of legend color code
- feat: :zap: optimize cruncher loops
- build: :construction_worker: add google cloud support
- fix: :bug: fix loading + legend + add more settings
- refactor: :zap: remove jquery from adviceManager
- test: :white_check_mark: fix all failing tests
- fix: :zap: improve loading times
- fix: :bug: safeguard functions against bad values
- feat: :sparkles: add RIC frame 3D scatter plots
- refactor: :zap: change base64 images to delayedsrc images
- feat: :sparkles: add ecf analysis plot
- fix: :bug: fix time not moving at correct speed
- feat: :sparkles: add better breakup logic
- fix: :rotating_light: fix minor sonarcube findings
- fix: :rotating_light: fix minor sonarcube findings
- refactor: :zap: remove jquery
- refactor: :label: add more typing to colorSchemeManager
- fix: :zap: fix minor issues with stf menu
- docs: :memo: update changelog
- docs: :memo: update changelog
- fix: :beers: start fixing trend analysis menu
- fix: :bug: fix lookangles menu
- feat: :sparkles: add find reentries function
- feat: :triangular_flag_on_post: modify breakup options to be more realistic
- fix: :bug: fix ray casting on earth functionality
- fix: :sparkles: add color scheme for notional debris
- feat: :sparkles: new loading screen
- fix: :bug: fix premature filtering in findsat
- feat: :sparkles: add ability to use ECF for satellite orbits
- chore: :bookmark: update to version 5.4
- fix: :bug: fix socrates
- fix: :lipstick: fix bug with sat-infobox being sluggish
- fix: :bug: fix countries filters
- fix: :label: better typing
- test: :camera_flash: update snapshots
- docs: :memo: add better notes on how dot interpolation works
- fix: :bug: fix next pass time not updating
- fix: :bug: include TBA sats as Special
- fix deploy
- chore: :bookmark: change to 6.0.1
- fix: :sparkles: update SRP FOV
- fix: :bug: fix missing top menu icons
- fix: :bug: fix umbral not showing
- Update deploy-pipeline.yml
- fix: :pencil2: fix capitialization issue with constellations.ts
- test: :bug: fix settingsmenu tests
- chore: :lock: add gpg signing
- build: :lock: update npm packages
- fix: :lock: bump async

#### v7.1.2

>  

- feat: :sparkles: add func to show selected object as large red dot
- fix: :bug: fixes #630
- feat: :sparkles: add skeleton for new help menus
- test: :white_check_mark: update tests
- feat: :sparkles: fix issues on mobile devices
- test: :adhesive_bandage: fix testing issue causing jest to fail on github
- feat: :sparkles: add neighbors color scheme for orbit density
- feat: :sparkles: add sensors help menu
- feat: :sparkles: enable legend functions for orbit density scheme
- feat: :sparkles: new splash screens
- feat: :sparkles: add orbit density color scheme
- test: :camera_flash: update snapshots for testing
- feat: :sparkles: add help to plot menus
- feat: :sparkles: add main help menu
- feat: :sparkles: add help to edit sat menu
- feat: :sparkles: add meanmo to period conversions on edit sat
- feat: :sparkles: add help to constellations menu and fix constellation search code
- feat: :sparkles: add sensors help
- feat: :sparkles: add help for breakup menu
- feat: :sparkles: add help menu to colors menu
- fix: :bug: fix bug where lookangles enabled with no sensor
- feat: :sparkles: add analysis help menu
- fix: :bug: fix incorrect lookangles caused by caching satrec
- feat: :sparkles: add help to new launch menu
- feat: :sparkles: add help to missile menu
- feat: :sparkles: add help to dop menu
- feat: :sparkles: add watchlist help menu
- feat: :sparkles: add help to initial orbit menu
- feat: :sparkles: add help to find sat menu
- feat: :sparkles: add help to debug menu
- feat: :sparkles: add help to stf menu
- feat: :sparkles: add help to satellite photo menu
- feat: :sparkles: add help for collisions menu
- fix: :bug: add error logging for possible bug #635
- test: :clown_face: add missing mock data to tests
- feat: :sparkles: add help to twitter menu
- feat: :sparkles: add help to next launch menu
- feat: :sparkles: add help to external source
- feat: :sparkles: add help to countries menu
- feat: :sparkles: add help to map menu
- feat: :sparkles: add help to settings menu
- fix: :bug: fix error on loading related to tle4.js
- fix: :bug: fix bug in sat-fov menu when plugins disabled
- fix: :bug: fix bug with color menu plugin being disabled
- refactor: :recycle: simplify help menu code
- fix: :bug: fix bug with sat url param not being found
- fix: :bug: fix texture issue after undoing black earth
- feat: :sparkles: add about page help menu
- fix: :lock: fix security issue

#### v7.1.1

>  

- fix: :bug: fix error with TLE when editing satellite
- fix: fix error setting value of null in analysis menu
- fix: :bug: fix error in updateSatInfo
- feat: :sparkles: add inc vs alt plots
- test: :white_check_mark: add manual jest inline testing for debugging on github
- build: :lock: fix security issue
- fix: :bug: fix tests
- fix: :bug: fix ecentricity formatting
- test: :white_check_mark: update how jest is run

#### v7.1.0

>  

- feat: :card_file_box: update catalog
- feat: :sparkles: add code for extended catalog
- feat: :sparkles: add new optional settings
- fix: :bug: fix contries and constellations menus
- feat: :label: update types
- feat: :wrench: update default settings
- docs: :memo: update changelog
- fix: :children_crossing: delay error sound to prevent constant repeats
- fix: :bug: fix bug on mobile
- feat: :sparkles: add faster searching

#### v7.0.3

>  

- fix: :bug: fix issue caused by clicking a non-satellite first
- refactor: :label: update camera typing
- fix: :bug: add error trapping for uniformMatrix4fv failure

#### v7.0.2

>  

- fix: :bug: fix sorting issue with null satellites
- fix: :bug: fix issue with sun calculations
- fix: :bug: remove old reference to uiManager.resize2DMap
- fix: :bug: fix testing bugs
- refactor: remove jquery get request
- chore: :memo: update version number
- fix: :lock: remove vulnerability

#### v7.0.1

>  

- fix: :bug: fix satellite fov not showing up
- fix: :bug: fix lostobjects colorscheme hanging
- fix: :bug: fix bug in getlookangles with null for satellite
- refactor: :recycle: refactor to allow use as a react component
- build: :see_no_evil: add npmignore for lib builds
- fix: :bug: fix search issues
- feat: :sparkles: add bulk add/remove to watchlist
- docs: :memo: update changelog
- test: :white_check_mark: fix broken watchlist tests
- docs: :memo: update readme
- feat: :sparkles: add prefetching of splash screens on initial run

#### v7.0.0

>  

- fix: :bug: fix country menu not working
- fix: :bug: fix timeMachine showing other objects
- refactor: :label: add better type checking
- fix: :bug: complete country matching code
- test: :white_check_mark: add testing for colorSchemeChangeAlerts
- feat: :sparkles: add settings to hide agency dots
- feat: :sparkles: add debug menu
- feat: :sparkles: add filter settings for various orbits
- docs: :memo: update changelog
- feat: :sparkles: add labels to watchlist items in fov
- feat: :sparkles: add new splash screen wallpapers
- feat: :goal_net: add TLE validation when creating TLEs
- fix: :bug: fix bug where search results dont respond
- feat: :sparkles: add new logo and loading screen
- refactor: :recycle: change default lookangles to 2 days from 7
- fix: :bug: fix watchlist line to satellite
- docs: :memo: update readme
- fix: :bug: fix bug in error catching
- fix: :bug: fix memory leak in line-factory
- fix: :bug: fix screenshot resolution
- build: :arrow_up: upgrade serve

#### v6.2.0

>  

- build(deps-dev): bump @babel/plugin-proposal-private-methods from 7.16.11 to 7.18.6
- build(deps): bump echarts from 5.3.2 to 5.3.3
- build(deps-dev): bump mini-css-extract-plugin from 2.6.0 to 2.6.1
- build(deps-dev): bump husky from 7.0.4 to 8.0.1
- build(deps-dev): bump @testing-library/jest-dom from 5.16.2 to 5.16.4
- build(deps-dev): bump @typescript-eslint/parser from 5.12.1 to 5.30.7
- build(deps-dev): bump ponicode from 0.61.3 to 0.70.11
- chore: :card_file_box: update TLE databases
- refactor: :heavy_minus_sign: replace suncalc with ootk
- feat: :sparkles: add new sensors
- fix: :bug: fix tle exporters
- fix: :bug: fix bug when creating sensor or observer from rmb
- fix: :bug: fix edit sat menu
- feat: :sparkles: add error reporting feature
- refactor: :recycle: simplify tle formatting
- feat: :sparkles: add basic sounds
- test: :white_check_mark: fix failing jest tests
- docs: update changelog
- feat: :sparkles: add additional tle export options
- fix: :bug: fix initial orbits menu
- fix: :bug: fix breakup creator
- feat: :sparkles: add mute button
- fix: :bug: fix bug new launch time mismatch
- feat: :sparkles: add sound effects
- feat: :sparkles: update sounds
- fix: :bug: update apogee when edit sat in positionCruncher
- feat: :sparkles: add sounds to settings menu
- fix: :bug: update default colorscheme to catch unknown types
- fix: :goal_net: add defensive code to satCalculate
- build: :arrow_up: update all dependencies
- fix: :bug: fix bottom menu ui not responding when edges clicked
- fix: :bug: fix watchlist issues
- feat: :sparkles: update about page
- fix: :bug: fix bug caused by depricated fov text
- build: :arrow_up: update ootk
- fix: :bug: fix breakup menu
- fix: :bug: fix new launch menu
- fix: :bug: correct tle formatting in orbitReferencesLinkClick
- fix: :bug: fix earth becoming background
- fix: :bug: fix TLE formatting bug in getOrbitByLatLon
- fix: :goal_net: add defensive code to setSelectedSat
- fix: :goal_net: add defensive code to snapToSat
- chore: :card_file_box: update SOCRATES example
- fix: :bug: fix typo in stfOnObjectLinkClick
- fix: :lock: update node-fetch
- build(deps-dev): bump @babel/plugin-proposal-private-methods

#### v6.1.0

>  

- refactor: :recycle: split SatMath into pieces
- refactor: :truck: split uiManager into smaller pieces
- docs: :page_facing_up: clear AGPL notice
- refactor: :recycle: split satMath
- perf: :zap: improve color calculation speed
- fix: :lock: remove security false postives
- fix: :rotating_light: fix sonarcube findings
- style: :art: add more granular prettier ignore directives
- feat: :sparkles: add better embeded support
- refactor: :label: convert om-manager to typescript
- refactor: :heavy_minus_sign: migrate from satellite.js to ootk for all orbital math
- feat: :sparkles: update color scheme menus
- perf: :zap: add caching of satrec object
- feat: :zap: optimize find close objects code
- fix: :rotating_light: fix minor sonarcube findings
- feat: :sparkles: add group countries color scheme
- feat: :sparkles: update orbit manager
- refactor: :recycle: update embeded example
- refactor: :zap: optimize age of elset color scheme
- feat: :sparkles: add vismag calculations to satbox
- docs: :memo: update changelog
- refactor: :recycle: update sat group class
- feat: :heavy_minus_sign: migrate from satellite.js to ootk
- refactor: :recycle: reduce unnecessary code in meshManager
- feat: :sparkles: update time machine
- feat: :sparkles: update group color scheme
- fix: :arrow_up: upgarde critical dependencies to fix build issue
- feat: :heavy_minus_sign: migrate from satellite.js to ootk
- test: :camera_flash: update snapshots
- build: :arrow_up: bump dependencies
- feat: :sparkles: update hover manager
- fix: :sparkles: update object manager
- fix: :adhesive_bandage: remove debugger call
- fix: :adhesive_bandage: remove unnecessary logging
- test: :white_check_mark: fix api mocks

#### v6.0.3

>  

- fix: :zap: remove jquery and fix open bugs
- feat: :sparkles: add eci ecf ric inc2lon and time2lon plots
- refactor: :zap: remove jquery
- feat: :sparkles: add satellite search on control site clicked
- style: :art: replace all camelCase files with hyphens for better git detection
- feat: :sparkles: add scenario-creator scaffold
- feat: :sparkles: add 2nd sat selection + update selectbox
- test: :zap: improve jest speed and reliability
- feat: :sparkles: add ECI plots
- refactor: :zap: remove more jquery
- fix: :zap: reduce complexity of legend color code
- build: :construction_worker: add google cloud support
- fix: :bug: fix loading + legend + add more settings
- refactor: :zap: remove jquery from adviceManager
- feat: :card_file_box: update catalog
- feat: :zap: optimize milky way textures and rotate
- test: :white_check_mark: fix all failing tests
- fix: :zap: improve loading times
- feat: :sparkles: add RIC frame 3D scatter plots
- refactor: :zap: change base64 images to delayedsrc images
- feat: :sparkles: add ecf analysis plot
- fix: :bug: fix time not moving at correct speed
- feat: :sparkles: add better breakup logic
- fix: :ambulance: fix image not found on linux ending in /
- refactor: :zap: remove jquery
- fix: :zap: fix minor issues with stf menu
- fix: :beers: start fixing trend analysis menu
- fix: :bug: fix lookangles menu
- feat: :sparkles: add find reentries function
- feat: :triangular_flag_on_post: modify breakup options to be more realistic
- fix: :bug: fix ray casting on earth functionality
- feat: :sparkles: new loading screen
- fix: :bug: fix premature filtering in findsat
- feat: :sparkles: add ability to use ECF for satellite orbits
- chore: :bookmark: update to version 5.4
- fix: :bug: fix socrates
- fix: :bug: fix countries filters
- test: :camera_flash: update snapshots
- fix: :bug: fix next pass time not updating
- fix: :bug: include TBA sats as Special
- chore: :bookmark: change to 6.0.1
- fix: :sparkles: update SRP FOV
- fix: :bug: fix missing top menu icons
- fix: :bug: fix umbral not showing
- fix: :green_heart: update docker.google instructions
- fix: :ambulance: fix photomanager icon not loading
- fix: :pencil2: fix capitialization issue with constellations.ts
- test: :bug: fix settingsmenu tests
- chore: :lock: add gpg signing
- fix: :lock: bump async

#### v6.0.2

>  

- feat: :zap: optimize milky way textures and rotate
- chore: :bookmark: change to 6.0.1

#### v6.0.1

>  

- fix: :bug: fix loading + legend + add more settings
- feat: :sparkles: new loading screen

#### v6.0.0

>  

- fix: :zap: remove jquery and fix open bugs
- refactor: :zap: remove jquery
- refactor: :zap: remove more jquery
- refactor: :zap: remove jquery from adviceManager
- test: :white_check_mark: fix all failing tests
- refactor: :zap: remove jquery
- chore: :bookmark: update to version 5.4

#### v5.4.0

>  

- feat: :sparkles: add satellite search on control site clicked
- style: :art: replace all camelCase files with hyphens for better git detection
- feat: :sparkles: add scenario-creator scaffold
- fix: :zap: reduce complexity of legend color code
- fix: :zap: improve loading times
- fix: :bug: fix time not moving at correct speed
- feat: :sparkles: add better breakup logic
- fix: :zap: fix minor issues with stf menu
- fix: :beers: start fixing trend analysis menu
- feat: :triangular_flag_on_post: modify breakup options to be more realistic
- fix: :bug: fix ray casting on earth functionality
- fix: :bug: fix socrates
- fix: :bug: fix countries filters
- fix: :bug: fix next pass time not updating
- fix: :bug: include TBA sats as Special
- fix: :sparkles: update SRP FOV
- fix: :bug: fix missing top menu icons
- fix: :bug: fix umbral not showing
- test: :bug: fix settingsmenu tests
- fix: :lock: bump async

#### v5.3.0

>  

- ci: :construction_worker: add cypress to pipeline
- Develop
- refactor: :heavy_minus_sign: remove old dependencies
- ci: :construction_worker: update codecov settings
- Develop
- ci: :construction_worker: add github actions back to main branch
- Develop
- Develop
- fix: :ambulance: fixed post processing manager
- fix: :rotating_light: fixed sonarqube errors
- Develop
- build: :rotating_light: ignore database file
- build: :rotating_light: minor fixes for sonarlint warnings
- Develop
- fix: :bug: fix moon position errors
- feat: :sparkles: add eci ecf ric inc2lon and time2lon plots
- feat: :sparkles: add 2nd sat selection + update selectbox
- test: :white_check_mark: increase test coverage of uiInput
- feat: :sparkles: add ECI plots
- ci: :fire: remove github actions from develop branch
- feat: :sparkles: allow multiple STFs to be created
- refactor: :recycle: split analysis into components
- test: :white_check_mark: increase test coverage of uiInput
- test: :white_check_mark: increase coverage of calculations.ts
- feat: :sparkles: add RIC frame 3D scatter plots
- refactor: :zap: change base64 images to delayedsrc images
- feat: :sparkles: add ecf analysis plot
- test: :white_check_mark: increase test coverage
- fix: :ambulance: fix image not found on linux ending in /
- ci: :rocket: add cypress testing
- fix: :adhesive_bandage: fix sensors appearing selected when not selected
- fix: :bug: fix multisite lookangles
- refactor: :lock: use separate func for keyboardEvt
- fix: :bug: fix lookangles menu
- refactor: :art: use constant for key pressed
- feat: :sparkles: add find reentries function
- fix: :adhesive_bandage: fix find near orbit when raan 350+
- refactor: :heavy_minus_sign: remove perfect-scrollbar
- fix: :zap: add limits to all searches with findSat
- fix: :bug: fix premature filtering in findsat
- feat: :sparkles: add ability to use ECF for satellite orbits
- docs: :memo: update changelog
- refactor: :label: add typing of findBestPass
- refactor: :rotating_light: address sonarqube findings
- fix: :adhesive_bandage: fix searching by orbit near 359 raan
- refactor: :rotating_light: address sonarqube findings
- ci: :construction_worker: fix cypress pipeline
- build: :arrow_up: upgrade dependencies
- fix: :adhesive_bandage: align three buttons in custom sensor
- ci: :construction_worker: add alternate http server for cypress testing
- refactor: :rotating_light: address sonarqube finding
- test: :rotating_light: fix trufflehog finding
- ci: :truck: rename master to main
- fix: :adhesive_bandage: fix alignment of rows in sensor lists
- fix: :ambulance: fix photomanager icon not loading
- fix: :pencil2: fix capitialization issue with constellations.ts
- fix: :bug: fix searches in URL not working on load
- ci: :pencil2: add "npm run" to build pipeline
- fix: :adhesive_bandage: remove duplicate css
- fix: :bug: fix right mouse click not working
- chore: :lock: add gpg signing
- ci: :package: add placeholder for e2e tests
- build: :package: updated npm packages

#### v5.2.1

>  

- refactor: :heavy_minus_sign: remove materialize.js in favor of npm package
- docs: :memo: new changelog for 5.2
- test: :camera_flash: snapshots updated to UTC timezone
- style: :art: fixed sonarqube findings
- test: :white_check_mark: increase test coverage in satMath
- test: :white_check_mark: expand testing of uiInput.ts
- test: :white_check_mark: increase test coverage of positionCruncher
- test: :white_check_mark: increase test coverage
- test: :white_check_mark: add tests for cruncherInteractions.ts
- test: :white_check_mark: set time using UTC to ensure standardized timezone settings
- test: :white_check_mark: increase test coverage of orbitCruncher
- test: :white_check_mark: increase test coverage of classification.ts
- test: :white_check_mark: increase test coverage of findSat and positionCruncher
- docs: :page_facing_up: update copyright dates
- test: :white_check_mark: add more test coverage to satInfoboxCore
- fix: :bug: replace getFullYear with getUTCFullYear
- ci: :camera_flash: remove snapshot tripping trufflehog
- test: :white_check_mark: standardize time in colorschememanager
- test: :camera_flash: remove obsolute snapshots
- ci: :heavy_plus_sign: add husky to package
- ci: :white_check_mark: added run lint on commit
- test: :camera_flash: remove obsolete snapshots

#### v5.2.0

>  

- fix: :bug: fix undefined error in positionCruncher
- Develop
- build(deps-dev): bump @babel/core from 7.16.5 to 7.16.7
- build(deps-dev): bump jest from 27.4.5 to 27.4.7
- build(deps-dev): bump @babel/preset-typescript from 7.16.5 to 7.16.7
- build(deps-dev): bump @types/jquery from 3.5.12 to 3.5.13
- build(deps-dev): bump webpack from 5.65.0 to 5.66.0
- build(deps-dev): bump http-server from 14.0.0 to 14.1.0
- build(deps-dev): bump ponicode from 0.60.0 to 0.61.3
- build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.9.0 to 5.9.1
- build(deps-dev): bump @types/node from 17.0.7 to 17.0.8
- build(deps-dev): bump source-map-loader from 3.0.0 to 3.0.1
- build(deps-dev): bump @typescript-eslint/parser from 5.9.0 to 5.9.1
- build(deps-dev): bump retire from 3.0.3 to 3.0.6
- build(deps-dev): bump @babel/plugin-proposal-private-methods from 7.16.5 to 7.16.7
- build(deps-dev): bump eslint-plugin-jest from 25.3.0 to 25.3.4
- build(deps-dev): bump @types/jest from 27.0.3 to 27.4.0
- build(deps-dev): bump @babel/preset-env from 7.16.5 to 7.16.8
- build(deps-dev): bump @types/jquery from 3.5.10 to 3.5.12
- Develop
- feat: :sparkles: add RIC frame on hover
- build: :arrow_up: bump all dependencies
- Develop
- fix: :bug: fix meshManager selecting correct mesh
- refactor: :recycle: positionCruncher overhauled to be less complex
- chore: :children_crossing: undo last commit
- Develop
- build: :construction_worker: codecov is info only
- Develop
- Develop
- refactor: :rotating_light: fixed sonar findings
- refactor: :rotating_light: fixed sonar finding on input complexity
- Develop
- build: :coffin: admin folder will now be handled by a separate repo
- build: :green_heart: updated build scripts for gitlab pipeline
- Develop
- Develop
- Develop
- build(deps-dev): bump @types/node from 16.11.12 to 17.0.0
- Develop
- Develop
- fix: :bug: fix moon position errors
- refactor: :heavy_minus_sign: remove locally hosted dependencies
- refactor: :recycle: refactor uiManager.ts to look cleaner
- feat: :bento: add flock, lemur, oneweb, spacebee and search by bus
- refactor: :recycle: refactor hoverbox code out of drawManager
- docs: :memo: changelog bump
- style: :rotating_light: code cleanup to fix sonarqube findings
- refactor: :recycle: refactor legend change code
- refactor: :recycle: refactor camera.ts
- style: :rotating_light: reformat to reduce sonarqube code smells
- feat: :sparkles: add more search filters and minor bug fixes
- fix: :bug: add installDirectory settings for staging.dso.mil
- build: :rotating_light: minor fixes for sonarlint warnings
- fix: :rotating_light: fixed sonarqube errors
- refactor: :recycle: refactor screenshot code
- build: :lock: add explicit ignore for incorrect trufflehog warnings
- test: :white_check_mark: replace all js tests with ts
- refactor: :technologist: update catalog searches
- style: :art: sonarqube findings fixed
- style: :art: removed unused code
- fix: :bug: fixed bug with ignoring trufflehog and added sonarqube fixes
- docs: :rotating_light: explicitly identify intentionally high complexity functions
- docs: :memo: updated readme and contributing guidelines
- fix: :rotating_light: fixed minor css sonarqube findings
- test: :white_check_mark: replaced js test with ts
- refactor: :recycle: reduce complexity
- style: :rotating_light: fixed sonarqube findings
- style: :zap: reduce unnecessary missileManager actions
- refactor: :truck: migrate more scripts to TypeScript
- fix: :adhesive_bandage: fixed sonarqube issues
- test: :white_check_mark: add better tests for tleformater
- fix: :bug: fix show sensors with fov link not working
- refactor: :fire: remove uiLimited code
- style: :rotating_light: remove unnecessary comments
- test: :white_check_mark: convert js tests to ts
- refactor: :fire: remove duplicate code
- build: :construction_worker: fix build env and update dependencies
- feat: :sparkles: add search for star and panToStar functionality
- Update issue templates
- fix: :children_crossing: removed extra spacing when sat-infobox is dragged
- chore: :children_crossing: feature request template
- test: :white_check_mark: tests are now timezone agnostic
- test: :white_check_mark: expand code coverage on positionCruncher
- chore: :rotating_light: added explicit ignores for sonarqube
- build: :art: cleaned up build files
- feat: :zap: add more dynamic reference orbit satellites
- fix: :ambulance: fixed post processing manager
- fix: :lock: addressed sonarqube security findings
- test: :camera_flash: update snapshots
- test: :bug: add consistent time when testing in different timezones
- feat: :children_crossing: provide feedback on getorbitbylatlon errors to user
- Create bug.md
- Delete feature-request.md
- 403 error fix: changed htm files to html files to address 403 error. Updated fiveserver, package.json, and build.mjs
- Update user-story.md
- feat: :children_crossing: change collision time to slightly before event
- fix: :ambulance: fix typo breaking drawManager
- fix: :bug: fix race condition in findSat plugin
- test: :camera_flash: update snapshots
- ci: :construction_worker: update github pipeline
- test: :camera_flash: update snapshots
- feat: :children_crossing: provide user feedback on editsat failures
- test: fixed failing tests
- test: :alien: change code coverage directory for sonarcube
- docs: :memo: update readme
- build: :rotating_light: addressed yaml lint findings
- ci: :green_heart: add new york timezone for deployment
- build: :rotating_light: second try at addressing yaml lint issues
- docs: :memo: added a link on cognitive complexity
- ci: :green_heart: add github token
- ci: :green_heart: use different method for changing timezone
- build: :lock: added trufflehog regex
- refactor: :rotating_light: reduce complexity in getters.ts
- fixing deployment: updating dockerfile to more closely match frontend.
- build: :green_heart: use New York timezone
- fix: :bug: fix bug where object id 0 has no orbit
- ci: :adhesive_bandage: reverted change to sonar key
- build: :rotating_light: ignore database file
- ci: :green_heart: use with vs env
- ci: :pencil2: lowercase github token
- chore: :children_crossing: update bat file for index.html
- ci: :wrench: update babel config
- fix: :bug: fix reference orbits having wrong rasc
- test: :adhesive_bandage: fix moon tests
- build: :heavy_minus_sign: remove five-server until security update is made
- refactor: :rotating_light: fix sonar lint error
- Update deploy-pipeline.yml
- build: :arrow_up: remove vulnerability
- build: :arrow_up: security fix
- build: :lock: fix vulnerability
- build(deps-dev): bump @typescript-eslint/eslint-plugin
- build(deps-dev): bump @babel/plugin-proposal-private-methods

#### v5.1.0

>  

- build(deps-dev): bump @types/node from 16.11.12 to 17.0.0
- Develop
- build: :hammer: cleaned up all the build scripts to use node API
- fix: :label: type error preventing build
- build: :construction_worker: add code coverage settings for sonarcloud
- build: :construction_worker: better github pipeline
- Develop2
- build: :green_heart: allow but dont require node 17
- fix: :bug: fixed use of strings instead of SpaceObjectType enum
- Develop
- Develop
- build(package): downgraded typescript and referenced local build in vscode
- refactor(keeptrackapi): refactored api + removed all &lt;any&gt;keepTrackApi references
- build(dockerfile): got docker to start the npm install but need to remove github dependencies
- build(deps-dev): bump jsdom from 17.0.0 to 19.0.0
- Develop
- Develop
- Develop
- fix(catalogloader): fixed offline catalog loading with JSON parse
- Develop
- Add CodeSee architecture diagram workflow to repository
- Develop
- Develop
- test(settingsmanager): fixed tests to work with non-module settingsMa…
- fix: :rotating_light: fixed multiple sonarqube findings
- feat: :children_crossing: better feedback on 404/500 errors
- refactor: :fire: removed duplicate code
- fix: :bug: fixed some sonarqube findings
- fix: :bug: fixed bugs related to legacy end of world json sims
- fix: :rotating_light: extra file breaking linter
- test: :white_check_mark: added testing to positionCruncher
- fix: :bug: new launch now displays error if no sat selected
- test: :white_check_mark: increased satSet test coverage
- test: :white_check_mark: increased test coverage on menuController
- refactor: :rotating_light: fixed sonarqube findings
- build: :construction_worker: sonarcloud fixes and deploy pipeline
- refactor: :coffin: removed WIP radarDataManager
- ci: :construction_worker: new deployment pipeline
- ci: :construction_worker: add checkout of code to each job
- build: :rotating_light: yaml linting
- perf: :lock: addressed multiple sonarqube findings
- build: :green_heart: changed build pipeline order
- refactor: :rotating_light: fixed sonar finding on input complexity
- ci: :pencil2: added missing "run" command
- test: :coffin: removed obsolete jest snapshots
- ci: :rotating_light: fixed linting errors in yml files
- ci: :white_check_mark: generate code coverage for sonarcloud
- build: :wastebasket: removed unnecessary build calls
- refactor: :rotating_light: fixed sonar findings
- test: :adhesive_bandage: make tests pass
- build: :construction_worker: linting build-pipeline.yml
- build: :construction_worker: run on push OR pull not both
- fix: :art: minor changes to redundant css code
- build: :lock: add sonarcube scans to master on push
- test: :bug: fixed jest tests
- build: :green_heart: updated build scripts for gitlab pipeline
- build: :ambulance: watch command is locking up build in CI
- ci: :construction_worker: no node restrictions for better interoperability
- fix: :bug: fixed bug where 404 was always displayed
- fix: :lipstick: fixed bug in materialize.css
- fix: :lock: address sonarqube finding for client-side redirection
- build: :bug: webpack ignores catalog admin files
- fix: :pencil2: error page now redirects back to home page
- test: :bug: fixed test running after jest teardown
- ci: :construction_worker: changed npm-audit-action
- build: :green_heart: yml issue
- ci: :pencil2: removed extra -
- build: :coffin: admin folder will now be handled by a separate repo
- chore: :coffin: removed unused images
- refactor: :label: type incorrect
- ci: :pencil2: fixed port for ftp deployment
- ci: :construction_worker: clarify pipeline order
- build: :pencil2: yml not yaml
- build: :green_heart: workspace directory "fixed" again
- build: :coffin: removed duplicate test script
- Merge branches 'master' and 'master' of https://code.il4.dso.mil/spacecamp/delta4/darts/keeptrack-space
- feat(multiple): merging with the current github code base
- fix(timemanager): improved time sync between satCruncher orbitCruncher and main thread
- refactor: :fire: removed old php scripts that are no longer used
- test: :white_check_mark: fixed test dependencies and use of SatObject
- refactor: :truck: split satSet into multiple files
- test(multiple): increased code coverage
- test: :white_check_mark: improved coverage of default ruleSet
- test(multiple): fixed tests
- refactor(timemanager): consolidated all propRate propOffset and satCruncher time communication
- build: :hammer: implemented five-server (live-server) and webpack --watch
- test: :white_check_mark: increased code coverage
- feat: :sparkles: convert SpaceObjectType enum to string
- refactor: :rotating_light: fixed eslint warnings
- test: :heavy_plus_sign: added missing imports
- test: :white_check_mark: improved main.ts tests
- chore(changelog): updated changelog
- test: :white_check_mark: code coverage for group ruleset
- refactor(timemanager/transforms.ts): refactored time conversion functions out of timeManager.ts
- refactor: :label: created &lt;KeepTrackPrograms&gt; interface to reduce use of &lt;any&gt;
- refactor: :heavy_minus_sign: removed some @app references
- refactor: :fire: removed old cypress e2e tools
- test(multiple): improved code coverage
- test(multiple): increase code coverage
- build: :coffin: removed old scripts that are no longer needed
- test: :white_check_mark: 100% coverage in countries colorscheme
- test: :white_check_mark: added code coverage to main.ts and embed.ts
- Delete codesee-arch-diagram.yml
- refactor: :recycle: cleaned up breakup code
- test(multiple): fixed tests for no EST test servers
- build: :lock: removed vulnerabilities in devdependencies
- build: :arrow_up: upgraded multiple dependencies
- fix(initialorbit): creating an analyst satellite automatically searches for it now
- Delete .gitlab-ci.yml
- Update .gitlab-ci.yml file
- SH: added dockerfile, added npm install to build script (not functional yet)
- build(dockerfile): reworked dependencies to get docker working
- fix: :bug: analyst satellites were not defaulting with correct SpaceObjectType
- fix(watchlist): load watchlist now calls the correct function
- test: :lock: false positive for secret
- fix(selectsatmanager): fixed bug where search box was displayed empty and updated political map
- build: :arrow_up: requiring node 17 to mitigate bug in node 16
- build(package.json): added test:unit
- refactor(multiple): minor ts errors fixed or hidden
- changelog
- fix(sensor): sensor reset button now sets the sensor back to defaults
- Update node-ci.yml
- build: :bug: CI now relies on previous step
- build: :green_heart: wrong yaml path
- Update Dockerfile per MDO request (may need to double check npm i removal)
- fix: :bug: enabled local testing without https
- build: :construction_worker: wrong yml filename
- ci: :green_heart: added package-lock.json back in for pipelines npm ci
- SH: updated dockerfile to look at output dist instead of build

#### v5.0.1

>  

- build(deps-dev): bump cypress from 7.7.0 to 8.2.0
- build(deps-dev): bump http-server from 0.12.3 to 13.0.0
- build(deps-dev): bump jest from 26.6.3 to 27.0.6
- Develop
- feat(settingsmanager.js): settings.js now compiles separate from othe…
- Develop
- feat(sensor.ts): added link to show all sensors with fov on a satellite
- thkruz/issue295
- build(deps-dev): bump css-loader from 5.2.7 to 6.2.0
- Version 5
- feat(meshes): added new meshes
- added new  catalog loader
- test(multiple): a lot of ponicode created unit tests
- fix(multiple): improved code to allow more unit tests and catch async errors
- refactor(camera): migrated camera to typescript
- feat(multiple): improved error detection and reporting for webgl issues
- test(multiple): added many new Jest tests
- fix(get_data.php): patched vulnerability
- build(configs): updated configuration settings
- refactor(satset): cleaned up satSet code
- refactor(sun): implement vao and move to typescript
- refactor(moon): add vao and move to typescript
- feat(extra.json): better offline catalog management
- fix(multiple): implemented Snyk and fixed multiple minor errors
- refactor(camera): renamed cameraManager to setup future multi camera modes
- build(embed): created an embedable version of KeepTrack
- feat(settingsmanager.js): settings.js now compiles separate from other files for easy offline edits
- feat(gamepad): initial gamepad support
- test(multiple): fixed failing tests
- feat(settingsmanager.js): add passing of URI with settings overrides
- refactor(camera): refactor cameraTypes to be like enums
- update settingsManager to not be a module
- test(apimocks.ts): consolidated mocks for jest testing
- fix(positioncruncher): fixed issue with full FOV not working with fence update
- test(settingsmanager): improved settingsManager testing
- test(multiple): added additional unit tests
- test(ui-input.ts): improved ui-input testing and error catching
- test(externalapi): added new stub file for tests
- test(moon): added test for the moon
- feat(line-factory.js): added lines for showing scanning by satellite or ground sensor
- feat(ui-input.ts): added political maps and upgraded surveillance fence view
- feat(settingsoverride): added an override so that settings stay consistent after updates
- docs(changelog.md): version bump
- fix(uimanager): shift f to find and shift h to hide UI
- feat(main.js): added more visible error checking to the loading screen
- fix(satset): getTEARR now works on missile objects
- test(main.js): removed unnecessary console statements and improved testing
- ascii catalog edits
- fix(starmanager): fixed bug where webGl lags hard after highlighting certain stars
- feat(settingsmanager): added new settings for overriding defaults to support making movies
- fix(satset.js): added more descriptive error messages
- feat(meshmanager.js): added new meshes, mesh rotation settings, sbirs options, and mesh overrides
- feat(sensormanager.js): added drawFov function for animating radars surveillance fences
- fix(color-scheme-factory.js): show stars when searching for objects
- feat(camera.js): added autopan, zoom speed settings, and zooming on missiles
- fix(shorttermfences.ts): fixed scoping issue with one time only flag
- build(settings.js): enabled offline version
- fix(satinfoboxcore): hide sunlight status if no sensor
- changelog
- build(package.json): improved npm scripts
- fix(sensorlist.js): removed cobra danes secondary sensor
- build(package): upgraded jsdom
- fix(webgl-obj-loader.js): migrated fetch to $.get for offline support
- fix(package.json): fixed http-server issue with new default ip address
- feat(atmosphere.ts): allow mesh to be moved with a position override
- fix(satinfoboxcore): fixed bug when selecting a missile
- test(test-env): migrated from require to import
- fix(satmath): fixed issue with ecf calculations breaking sun and moon
- Update README.md
- fix(catalogloader): fixed offline catalog loading with JSON parse
- github actions
- feat(moon.js): allow moon position to be modified with an override
- test(settingsmanager): fixed tests to work with non-module settingsManager
- no admin folder required
- feat(ui-input.ts): added override to allow zooming while auto rotate is on
- build(tsconfig.json): build to es3
- test(camera.test.ts): unneeded import
- settingsManager fixed
- refactor(timemanager.ts): changed warning to debug to reduce unecessary messages in the console
- build(.gitignore): added embed folder
- fix(catalogloader.ts): give static dots an id property
- fix(index.htm): removed modernizr since it provided no value
- fix jest to use jsdom

#### v4.1.0

>  

- Main
- Develop
- Develop
- build(typescript): started migration to typescript
- fix(sensor.ts): fixes #295
- fix(satinfoboxcore): only show sensor info if a sensor is selected
- docs(changelog): version officially bumped to 4.0
- chore(commitizen): added commitizen to package.json
- updated dependencies

#### v4.0.0

>  

- feat(keeptrack): complete overhaul to TypeScript and implement KeepTrackApi
- feat(astroux): implemented astroux css and soundManager
- fix(nextlaunchmanager): upgraded to launch library 2 api
- test(integration tests): updated integration tests to support keeptrackApi
- feat(main): updated main.js to use keeptrackApi
- feat(multiple): implemented keeptrackApi instead of passing variables to functions
- fix(satinfoboxcore): provided a fix for when isInSun is unavailable (testing only so far)
- fix(tle.js): fixed missing export call in offline TLEs
- fix(ui-input.ts): fixed DOP calculation bug
- fix(lookangles.js): fixed dop calculation bug
- build(package.json): changed jest testing to stop on first failure
- chore(launch.json): changed vscode config for debugging

#### v3.5.0

>  

- refactor(settingsmanager): converted settingsmanager from js to ts
- refactor(uimanager): ui-input converted to ts and uiManager updated to be more dynamic
- feat(satinfoboxcore): refactored satInfoBox as plugin
- chore(contributing.md): removed contributing.md file
- refactor(multiple): standardized use of lat, lon, alt vs lat, long, obshei
- refactor(selectsatmanager): refactored selectSatManager as a plugin to keeptrackApi
- feat(externalapi): implemented API for external plugins
- chore(tsconfig.json): updated tsconfig rules
- chore(tle): updated TLEs
- chore(declaration.d.ts): enabled css for typescript
- chore(.eslintrc): removed no-explicit-any rule

#### v3.4.3

>  

- feat(uimanager.js): added Short Term Fence menu
- build(deps-dev): bump style-loader from 2.0.0 to 3.0.0
- feat(satvmagmanager): expanded sunlight color scheme, fixed propagati…
- fix(analysis-tools): fixed analysis tools to work with OOTK
- fix(style.css): bottom menu was hiding some input selection options. …
- fix(uimanager): fixed find objects in this orbit and orbit remaining …
- docs(changelog): generated auto changelog
- docs(readme.md): updated readme for version 3
- feat(satvmagmanager): expanded sunlight color scheme, fixed propagation speed code and line to sat
- fix(ui-input.ts): migrated ui-input to typescript. fixed on click and create sensor/observer bugs
- build(typescript): started migration to typescript
- refactor(helpers.ts): migrated helper module to typescript
- refactor(nextlaunchmanager.ts): fixed typing errors during build
- test(integration1): increased code coverage
- build(typescript): updated types and lint rules
- fix(uimanager): fixed find objects in this orbit and orbit remaining after watchlist item removed
- fix(nextlaunchmanager.ts): fixed type error
- test(integration1.test.js): increased lookangles code coverage
- build(uimanager.js): fixed import to use new typescript file
- Autofix issues in 2 files
- chore(changelog): updated changelog
- fix(style.css): bottom menu was hiding some input selection options. changed max-heigh of popups
- build(package.json): updated version npm scripts to include git tag
- fix(nextlaunchmanager): removed race condition involving launchList
- build(helper.ts): fixed type error
- chore(package.json): bumped version number
- build(auto-changelog): added changelog dependency
- ci(deepsource): fixed exclude to ignore external libraries

#### v3.2.0

>  

- feat(uimanager.js): improved alerts for watchlist items entering/exit…
- build(release.yml): fixed github publishing reference
- chore(package.json): version bump
- fix(uimanager): fixes issues #223 and #237
- ci(github workflows): updated to match package.json new script names
- feat(photomanager.js): added on orbit imagery to close #14
- test(integration tests): split integration testing into 3 files
- feat(ui-input.js): added draw sat to sun line feature
- test(integration1.test.js): added menu-sat-photo testing

#### v3.1.3

>  

- feat(uimanager.js): improved alerts for watchlist items entering/exiting fov
- fix(satset.js): fixed color of overlay icon when loading saved watchlist

#### v3.1.2

- build(release.yml): fixed github publishing reference

#### v3.1.1

- chore(package.json): version bump

#### v3.1.0

>  

- fix(uimanager): fixes issues #223 and #237
- ci(github workflows): updated to match package.json new script names
- build(deps-dev): bump jest from 26.6.3 to 27.0.1
- build(deps-dev): bump imports-loader from 2.0.0 to 3.0.0
- Develop
- Develop
- develop
- test(color-scheme.unit.test.js): increased code coverage
- test(dots.unit.test.js): increased test coverage
- Develop
- perf(drawmanager.js): removed extra meshManager.draw calls and fixed …
- perf(positioncruncher.js): longer time between propagation loops
- Develop
- test(integration.test.js): increased test coverage
- Develop
- test(search-box): add 90% code coverage
- Develop
- Develop
- Bump imports-loader from 1.2.0 to 2.0.0
- Ootk
- feat(ootk): integrated ootk to replace satellite.js
- Develop
- Version bump
- Twgl
- Develop
- Twgl
- Added getSunPosition and Fixed getStarPosition
- Color factory
- Private variables in camera
- Clear entry point
- Clear entry point
- Class extraction
- Development
- Update version number
- Private Methods and Fields added
- Create Camera Class
- fix(uimanager): fixes issues #223 and #237
- Fixed #217
- README Update
- test(cypress): added cypress E2E testing
- chore(out.json): remove unneded output
- fix(ui): various bugfixes to UI menus
- Offline fixes for Firefox 52
- test(integration.js): increased code coverage
- refactor(uimanager.js): consolidated sensor selection code
- feat(analysis): added analysis features and move ootk to a separate location
- fix(orbitmanager.js): fixed orbit not updating on new launch generation
- test(integration.js): raised to 80% code coverage
- fix(graphics): reduced use of framebuffers and overall number of drawing calls
- chore(package.json): version bump
- Reorganize Files
- test(integration.test.js): added integration testing to increase code coverage
- fix(babel.config.js): cleaned up minor errors that had no impact on code
- feat(webgl): upgrade to webgl2
- refactor(multiple): increased code coverage and fixed fringe cases
- test(integration.test.js): increased code coverage
- Ocular Occlusion for Earth
- feat(ui): resizeable menus added
- Added ocular occlusion for mesh models
- refactor(sidemenumanager.js): consolidated side menu code from uiManager
- meshManager fixes
- dlManager updated
- library separated internal vs external
- Renamed dlManager drawManager
- refactor(helpers.js): extracted color parsing and conversion functions
- Moved webworkers
- Godrays
- test(all): added working jest support for doms, webworkers, and canvas
- Consolidated constants
- Consolidated sceneManager and Removed jQuery
- feat(post-processing): added FXAA support
- Made mapManager part of uiManager
- Fixes for offfline tles, atmosphere, camera, meshes
- Post Processing Resize Fix
- refactor(ui-validation): extracted validation jquery code from uiManager
- fix(sidemenumanager): fixed references to depricated sMM functions
- perf(drawloop): reduced GPU commands
- perf(dots.js): reduced number of dots in buffer to speed up readpixel calls
- build(package.json): automatic version and build date scripts added
- Reduce readPixel calls
- Remove unused libraries
- Screenshots, timepicker, and sat-hoverbox bugfixes
- build(npm scripts): cleaned up npm scripts naming
- Fixed meshManager webgl error
- fix(camera.js): fixed issue where reseting camera could get stuck spinning in a circle
- build(cypress.yml): removed cypress github action
- Depricated modules folder
- test(cypress.yml): remove firefox testing
- fix(dots.js): moved mat4 multiplication from vert shader to js
- build(startup.js): simplified cypress testing
- build(e2e.js): disable e2e for now
- build(webworker): disable webworkers during testing
- Libraries merged into lib folder
- build(package.json): added start-server-and-test
- build(package.json): added npm-run-all
- build(package.json): downgraded jest
- selectSatManager moved to drawManager
- Improved desktop performance
- build(webworkers): skip workers when in CI mode on github
- search-box moved
- Fixed hover and select colors
- test(cypress.yml): fixed spacing issue
- test(cypress.yml): fixed formatting
- Enabled mipmaps
- test(package.json): added http-server
- test(cypress.yml): remove last firefox test
- fix(materialize-local.css): fixed load order of colors
- test(startup.js): simplified cypress test
- fix(startup.js): removed redundant global variable references
- fix(drawmanager.js): fixed resizing from small screen to big screen that caused gpupicking to break
- test(startup.js): added error handling
- test(cypress.yml): updated working-directory
- build(github actions): typo in build command
- perf(drawmanager.js): removed extra meshManager.draw calls and fixed earthBumpMap
- test(missilemananger.unit.test.js): removed unnecessary test
- Reduce DOM Lookups
- fix(tle.js): added export for offline TLEs
- build(gpr.js): reenabled linter
- build(node-ci.yml): simplified node-ci
- test(node-ci.yml): removed cypress from node-ci
- orbitManager moved
- build(package.json): use start-server-and-test for jest
- chore(package.json): bumped version number
- build(cypress.yml): made cypress run headless
- build(node-ci.yml): node version bump
- chore(package.json): update version number
- sideMenuManager moved to uiManager
- readpixels throttle
- build(node-ci): added build:dev
- build(node-ci.yml): fix gl issue
- build(node-ci.yml): remove CI variable
- test(meshmanager.js): removed testing of meshManager init
- build(package.json): fixed issue with jest
- chore(version.js): bump version number
- test(startup.js): increase wait to 10s
- chore(package.json): updated version number
- docs(settingsmanager): updated version number
- build(node-ci.yml): fixed typo
- fix(babel.config.js): bugs found in deepsource removed
- fix(sidemenumanager.js): fixed issue when less than 20 collision events
- ci(package.json): removed outdated package
- build(webworker): changed to array
- build(node-ci.yml): convert node-ci to windows runner
- build(node-ci.yml): fixed typo
- test(startup.js): increased waiting to 30s
- test(cypress.yml): fixed typo
- fix(satset.js): fixed calculation on how many dots to draw
- Update node-ci.yml
- fix(drawmanager.js): typo removed
- Update is-website-vulnerable.yml
- fix(sidemenumanager.js): dOM text reinterpreted as HTML
- Update README.md
- build(node-ci.yml): added local server
- test(package.json): added cypress
- test(cypress.yml): fixed typo
- build(package.json): created a script for starting a test server on localhost
- merge conflicts
- Revert "Revert "Fix DOMContentLoaded issue""
- Revert "Fix DOMContentLoaded issue"
- Fix DOMContentLoaded issue
- Extracted starManager and Made LineFactory
- Extracted SunCalc and More Explicit Start Order
- Refactored main.js
- No ColorScheme Globals and Fixed Sunlight Status
- ColorSchemeFactory
- Automatic ES6 Conversion
- dots class created
- keeptrack-head renammed settings
- Established Clear Loading Order
- Smarter dots buffer use
- Decoupled parseCatalog
- twgl for Moon
- Moon and Atmosphere Switched to TWGL
- Cleanup SatSet.init
- Fixed pMatrix Not Updating
- Class for Satellite gl Actions
- Reduce Dependencies
- Fixed bug with appending hoverbox
- Separated Update Draw and Drawpicking
- Fix Star Sizes
- Private Fields Removed
- Stable SunCalc
- Removed jQuery from main.js
- Separate Picking from Positions
- Revert "Private variables in camera"
- Clean main.js
- Separate catalog loading
- Separated gpu buffer setup
- Reduce Dependencies
- Fixed daysold calculations
- Added gl.DYNAMIC_DRAW
- Moved webworkers to own folder
- Fixed raycasting bug when clicking earth
- Revert "Lint fix for camera.js"
- Lint fix for camera.js
- satVmag moved
- Archived unused js code

#### v3.0.4

>  

- Fix .gitattributes Issue
- Include All Req Image
- Remove unused files from deepsource
- Development
- Github Packages fix
- Create codeql-analysis.yml
- Create release.yml
- Delete npm-publish.yml
- Create deploy-ghpages.yml
- Create .deepsource.toml
- Fix codecov
- Update release.yml
- Fix coverage
- Update .deepsource.toml
- Add codecov
- Update README.md
- Update node-ci.yml
- Delete npm.yml
- Create npm.yml
- Update node-ci.yml
- Add coverage to package

#### v3.0.3

>  

- Development
- Create CONTRIBUTING.md
- Fixed Gitattributes
- Update README.md
- .gitignore Update
- Update README.md
- Example automatic todo
- Fix Images
- Update README.md
- Update README.md
- Update npm-publish.yml
- Update npm-publish.yml
- Update npm-publish.yml
- Update npm-publish.yml
- Bump to 3.0.3
- Update npm-publish.yml
- Update npm-publish.yml
- Update npm-publish.yml
- Update node-ci.yml
- Update README.md
- Update npm-publish.yml
- Update README.md

#### v3.0.2

>  

- cameraManager testing added
- Development
- Refactor main.js
- Fixed loading screen issues
- Update and rename npm.yml to npm-publish.yml
- Update and rename lint.yml to node-ci.yml
- Fixed tests
- Create npm.yml
- Configured for CI
- Update node-ci.yml
- Update node-ci.yml
- Update node-ci.yml
- Update lint.yml
- Update node-ci.yml
- Update lint.yml
- Ignore coverage
- Update npm.yml
- Update is-website-vulnerable.yml

#### v3.0.1

>  

- updateRadarData script
- Remove highres images
- Remove radar data
- Remove radar data
- Remove 8k images
- Remove highres images
- Remove 8k images

#### v3.0.0

>  

- Bump mkdirp from 0.5.5 to 1.0.4
- Upgrade to ES6+
- eslint rename
- npm publishing
- Create dependabot.yml
- Update lint.yml
- gitignore
- Remove hires images
- Rm package-lock.json

#### v2.8.1

>  

- satellite.js to 4.1.3
- Implement npm
- PropRate 0 bugfix.
- Package update

#### v2.8.0

>  

- Missile bugfixes. Error toasts. New loading messages.

#### v2.7.5

>  

- Better orbit lines. Mobile scrolling bufix.

#### v2.7.4

>  

- Fixed to Satellite camera mode bugfixes

#### v2.7.3

>  

- Reduce memory leaks

#### v2.7.2

>  

- Selected dot color fix

#### v2.7.1

>  

- Initial Orbit Determination
- Numerous bugfixes.
- 16K images and satellite fixed camera
- Astronomy and Planetarium fixes. Shader updates.
- Time propagation bug fixes.
- Version updated
- Mobile webgl fixes

#### v2.5.1

>  

- RadarData toggle
- Performance fixes
- Mobile fixes.
- frag depth extension fixes
- radarData auto-import
- Console Toggle

#### v2.4.0

>  

- Create LICENSE
- Faster indexing and more radarData colors.
- GNU GPL copyright update
- Update README.md
- Bugfixes
- Update README.md
- Update README.md
- license folder rename

#### v2.3.0

>  

- Moon fixed. GS database added.
- radarData module updates

#### v2.2.0

>  

- RadarData module updated

#### v2.1.0

>  

- Offline fixes and rmManager

#### v2.0.0

>  

- Feature locks and bugfixes
- Fixed running without webserver
- Right click menu color fix

#### v1.20.12

>  

- Relative velocity added

#### v1.20.11

>  

- Fix line to satellite from sensor

#### v1.20.10

>  

- External data fix
- Fixed edit satellite menu

#### v1.20.9

>  

- External data fix

#### v1.20.8

>  

- Show sensor to satellite link. Fix external sensor requests.
- Missing min files

#### v1.20.7

>  

- Zoom more friendly. Fixes #182
- Multisite lookangles fix
- Starlink control sites
- Fixed timeRate handling, missile events, and colorbox issues
- Galileo satLinkManager
- External Sources menu
- Sub 1 Second Loading
- Lighthouse Report fixes
- PWA update
- Version Number Update
- Service worker update.
- Fix which assets preloaded
- Fixed toasts for limitedUI without all the extras of materialize
- Progressive Web App test
- Improved PWA
- Thinner orbit lines when the UI is disabled
- Increased visibility when searching for satellites
- Better search menu handling
- PWA bugfix
- Ensure a default earth texture loads
- Manifest files
- Fix duplicate suns #185
- Service worker installed first
- Prevent zoom NaN errors
- Clear lines too when the screen is cleared
- Search list dropdown fix
- Breakup generator fixes
- PWA update
- Add license file template
- Missile manager updated to use new timeManager
- PWA fix
- Multisite Lookangles fixed with new timeManager
- https redirect
- Alpha settings in webgl off
- Provide a valid apple-touch-icon
- webmanifest update
- PWA update
- PWA fix
- PWA remove extra file
- Unecessary CSS in limitedUI mode is overriding other websites CSS files
- Multisite lookangles fix 2
- Charset declaration earlier in page load
- Fullscreen PWA
- Bugfix on manifest
- Favorite icon update
- Add an Apple touch icon
- Add a theme-color meta tag
- Better Apple Touch icon

#### v1.20.1

>  

- Pr/179
- Merge Le-Roi Changes
- Constellations
- Footer Nav Style Updates
- format update
- code formatting
- format update
- Repo Update
- Fixed formatter issues.
- Latest From Master
- working on code format
- Minimize loading times and add prettier
- CSS issues and response.html
- O3b and debris
- AEHF and auto face Nadir
- Minified js loading
- Bugfixes
- Galileo satellite added
- Gps satellite model added
- Add orbcomm and globalstar constellations
- Added PNames to stars HR3 to HR1003
- Javascript standard style.
- Added additional constellations
- Add sensors and fix sun
- Embed testing and image preloading
- Bugfixes
- Enable draw-less setting
- Refactor sensorManager attributes
- Update checker-script.js
- Updates
- Reverted json loading
- pre-multiplied alphas disabled for firefox compatibility
- Better loading order
- working on sensor manager
- Fixed css and time
- json updates
- Fix bug from merge
- Folder Cleanup
- footer nav tweaks
- Update checker-script.js
- Improved atmosphere shader
- Working on embeded.htnl
- Skip minified version of satSet
- Update sensorManager.js
- typo
- Typo
- Missing semicolon
- Missing missileManager icon
- Fix conflicts. We need to fix your linter.
- Update style.css

#### v1.19.10

>  

- Fixed mobile clock and unlinked datestring to close #169 and #170
- More 3D models
- More meshes and improved camera controls
- Colored Meshes
- Astro Space UXDS update
- Fixed bug
- Case sensitive Satellite.obj (rename later).
- Bugfixes
- Color fixes

#### v1.19.7

>  

- After loading updated with readystate function
- 17-08-2020 keeptrack.space response and compatibility update.
- Updated UI colors. Close #166
- Added right click menu on mobile to close #132
- Close #150
- revert??
- update
- loading update
- response and compatibility update
- Update index.htm
- response update
- Improved camera controls
- testing error scripts
- Working on content loaded
- Fixed rest of #132
- response updates
- Look for an essential file rather than the index.htm
- Merged changes. Hides analytics and adds https requirement.
- some tweaks
- trail and error
- Performance update for limitedUI mode.
- Combined Ignores
- My ignores
- footer menu fix (SEE LINE COMMENT 2148 UI.JS )
- Fixed github.io

#### v1.19.3

>  

- mesh cleanup
- Merged sun.js and earth.js
- meshManager implemented!
- Updates for limitedUI
- Mobile resizing and width calculation ignoring scroll bar fixed
- Better mobile device detection and canvas resize locking #154
- Remove debug comments
- Update README.md
- Updated preview image.
- Fixed issue with satellite shaders too small until zoom changes
- Fixed bug that kept reloading previous sensor even after clearing it
- Update README.md
- Update README.md
- timeManager file rename

#### v1.18.3

>  

- Added constellations
- meshManager added with 3d satellite
- Panning controls implemented
- Cleaned up settings manager
- Shader improvements, bump maps, specular lighting
- Update index.htm
- response update
- Limited UI Enhancements
- response updates
- Made analytics only turn on when on keeptrack.space #141
- Local rotation implemented
- Removed background forced coloring
- Github Version
- footer menu fix (SEE LINE COMMENT 2148 UI.JS )
- Typos in constellations
- Typos in constellations
- Fixed bug with time drifting backwards.
- Fixed typo
- Removed comma

#### v1.17.0

>  

- Atmosphere, performance improvements, and embed support.
- Atmosphere, Time Machine, and Optional Modules System
- Added Sun, Moon, and install directory settings
- Remove Sat Class. Add French SLBM. Fix TruSat Map.
- Better shaders
- Better shaders
- Search and Socrates bug fixes.
- Local to utc fixed in lookangles formatting
- updateURL overhaul
- Fixed install directory code
- Hi-Res Screenshots
- Submarine settings in MissileManager
- satellite.satSensorFOV
- get parameters updated to use date variable
- sat-cruncher error catching
- Notify of color scheme changes
- github.io Compatibility
- Dynamic missile apogee added.
- MissileManager updates
- Dynamic install location code.
- Debris only and photo button
- Match protocol for colorbox
- TruSat Correction
- Remove logging
- Remove .min reference

#### v1.11.2

>  

- Bugfixes and persistent sensor. Fixes #138
- CSO Search added. Group colorscheme fixed.
- lookangles.js reorganized
- Code cleanup
- Best pass times calculator
- Fix issue #137
- Age of Elset colorscheme added
- Fix screen recorder and rise/set lookangles
- Search slider update
- Delete todo-issues.yml
- Create todo-issues.yml
- Test todo bot
- Delete to-do-to-issues.yml
- Update todo-issues.yml

#### v1.10.1

>  

- jQuery update and removed depricated references
- Next Launch Manager added to solve #97
- Cleanup TODO comments
- Decayed satellite checks
- Create Linter
- is-website-vulnerable
- Create to-do-to-issues.yml
- jQquery 3.5.1 update
- Update README.md
- Update README.md

#### v1.9.3

>  

- Red theme fixes #125
- Dynamic object colors and color picker in settings
- SatChng Menu and fixed multiple TODOs
- Clean lookangles and multisitelooks. Add catalog exports.
- Cleanup file organization
- Cleanup file organization
- Cleanup minor syntax errors
- Add debugging mode
- Dynamic mobile mode
- Force Cache Refresh
- Analyst Satellite Fixes
- Update README.md
- Sensor parameter fixes.
- Merge
- Update README.md
- Update README.md
- Update README.md
- Update README.md

#### v1.8.0

>  

- fix JS math expression
- Bug fixes.
- Visual Magnitudes for satellites. Right Click Menu Changes.
- Dynamic object colors and color picker in settings
- Stars Updates, Earth Map Adds, and Breakup/New Launch Fixes
- Additional Map options from the right click menu.
- TruSat tie-in
- TruSat Integration Update
- Keep last map settings on reload.

#### v1.5.1

>  

- Updated video recording (now includes UI) and added sunlight view
- Added Video Recorder
- IE bug fixes
- Reduced position calculations.

#### v1.2.6

>  

- Reorganized Files
- Improved Responsive UI/CSS
- Added Launch Sites
- Updated social links.

#### v1.2.4

>  

- Added Constellations
- drawLoop Fix
- drawLoop Fix

#### v1.2.2

>  

- Improved Stars and Constellations
- Stars and Constellations
- Astronomy View Improvements

#### v1.1.1

>  

- Fixes for offline mode.
- Support for Mike McCant's TLEs
- Delete .gitignore
- Delete .htaccess
- Cross-browser support for satbox-info
- Delete .gitattributes
- Offline bugfix
- License Typo
- Remove some files.
- Delete .jshintrc
- License Typo

#### v1.0.0

>  

- License System Implemented
- DOP Table Added
- Small Bugfixes
- Update README.md
- Removed offline scripts.
- Delete keeptrackPreview.jpg
- Delete dayearth-10800.jpg
- Delete dayearth-43200.jpg
- Delete 6_night_16k.jpg
- Delete 2_earth_16k.jpg

#### v0.48.2

>  

- PDOP function finished
- Started PDOP Calculator

#### v0.48.1

>  

- Surveillance and FOV Bubble modes.
- Right Click Menu Added
- Enabled multisat satoverfly mode. Minor UI fixes.
- Partial undo of IE11 Fix.

#### v0.42.7

>  

- Performance Updates
- Bug Fixes
- Updated Libraries.
- Moved group creation to a web worker and drastically increased load time
- More Performance Updates
- Fixed group creation and coloring.
- Fixed group-cruncher bugs + added performance scaling for sat-cruncher.
- Performance Improvements
- Performance Improvements
- Planetarium view bug fixes.
- Added satellite overfly options.
- Added satellite overfly options.
- Fixed infinite loop in mobile.hidesearch
- Low Performance Mode
- Reducing performance hit on recoloring
- Fixed missile conflicts with new markers
- Downgraded unneeded Float32Array to Int8Array
- Fixed issue with single click on mobile.
- Less DOM Creation
- Fixed bug in satcruncher related to satellite overfly.
- IE11 Bugfix.
- Bugfix for mobile.
- Update version number
- SatCruncher ignore markers unless enabled.
- Ignore markers unless enabled during satSet.draw
- Canvas bugfix.
- Update Version

#### v0.36.1

>  

- Reworked mobile controls and consolidated html files.
- Reworked mobile controls and consolidated html files.
- SOCRATES fixed. Border added to menus.
- ESA sensors added. Mobile CSS improved.
- Improved mobile UI
- Sat Label and Demo Modes added. New HiRes images.
- Moved colorscheme to a side menu.
- Added Sensor FOV Bubbles
- Countries color scheme added.
- Consolidated legend menu changes.
- Moved colors from color-scheme to settingsManager.
- Consolidated files.
- New loading screen, slimmer ui, and mobile controls.
- Fullscreen mobile interface.
- Fixes to date picker and mobile menus.
- Fixed bugs in satinfobox menu.
- Fixed minor UI issues with Multi Sensor menu.
- Fixed bug with 2D map resizing on mobile.
- UI Updates
- Fixed bug with bottom menu.
- Fixed mobile touch sensitivity.
- Fixed desktop movement and legend color toggles.
- Fixed bug with launch facilities not displaying full names.
- Better caching prevention.
- Fixed scroll on bottom icons when mobile.
- Variable sized fragment shaders
- Better hires images.
- Fixed bug that crashes multitouch on mobile.

#### v0.34.0

>  

- Fixed #89 and #90
- Fixed #89 and #90
- Changes to Planetarium Camera Mode. Fixed #83.
- Changes to Planetarium Camera Mode. Fixed #83.
- Fixed #81. Map settings needed updated on load.
- Downgraded satcruncher from satellite.js 2.0.2 to 1.3 for better speed
- Vertex Shader can now be changed realtime.
- Legend UI is now a toggle for satellite visibility.
- Added geolocation options when using https.
- Added license info from James Yoder/thingsinspace.
- Add hires option from GET variable.
- Adjusted cameraType.SATELLITE movement. Q and E for rotation.
- Allow passing mw, retro, vec, etc via GET instead of different filenames
- Update .igtignore
- Harder to deselect selectedsat when in satellite camera view.
- Fixed fieldOfView code.
- Fixed fieldOfView code.
- Fixed fieldOfView code.

#### v0.33.0

>  

- Added planetarium and satellite camera views

#### v0.32.0

>  

- Minor fixes.
- Added an vector version of the offline version.
- Added vector image.
- Added vector image.
- Fixed bug in view sats in FOV. Started multithreading SGP4.
- Fixed timeManager.now errors and added Editor.htm
- Changed offline satbox update interval. Added more optional information for offline versions.
- Planetarium Camera View Added
- Fixed error in offline only version due to load order.
- Corrected date error in settings.

#### v0.30.7

>  

- Updated merging function for offline use.

#### v0.30.6

>  

- Separated UI from main.js
- InView for all SSN sensors added.
- Fixed performance issue with sat-cruncher and overlay.
- Overlay updated to recalculate times when needed.
- _updateOverlay causes jittering
- Reduce garbage collection in sat-cruncher.js
- Fixed theme problems
- In default view only calculate colors if inview changes.
- Fixed bug with legend reseting colorscheme

#### v0.30.5

>  

- Develop
- Develop
- Develop
- Develop
- Develop
- Develop
- Develop
- Rise Set Lookangle Times
- Organize
- Upgraded to satellite.js 1.4.0
- Separated main functions into separate files. Trying to reduce global variables and optimize each of the main functions.
- Remove admin folder.
- Replacing strings with single references in variable.js. Addresses issue #72
- Fixed multisite propagation and added Cobra Dane
- Missile Generator added.
- Renamed internal functions.
- Minor Changes
- Fixed some red theme problems.
- Added Offline Version
- Added a retro version set to March 13, 2000. Fixed a few incorrect launch sites.
- Added MW page to display only missiles.
- No External Sources
- Material Font, SSN Lookangles, and Custom Sensors
- Updated ballistic missiles.
- Added mini loading screen and touch controls for date/time picker.
- Stereographic Map and Telescopes
- Integrated lookangles.js with satellite.js.
- Standardize variable names.
- Created timeManager and reduced jQuery calls during drawLoop.
- About Author Icon
- Optimizations to reduce garbage collection. Ugly code.
- timeManager organized and unnecessary public functions and variables hidden
- Cleaned up extra satellite functions.
- Updated editor to allow additional satellite information and a URL to be added.
- New Interface Finished
- Reduced need for garbage collection on loops.
- Created custom objects with static variable to display launch sites
- Added overlay for watchlist items and yellow highlighting for inview watchlist items.
- Mobile Version
- Added more launch sites for nominal creator and fixed some styling problems on side menus where bottom 50px were cutoff.
- Fixed nominal creator functions. Main error was caused by converting string to a number - leftover from old version.
- Optimized the search function. Remove a lot of unnecessary extra variables.
- Add three camera modes (default, offset, FPS).
- Reduced unnecessary variables in lookangles methods.
- Few bugfixes where proprealtime was off by a few milliseconds.
- Added limitSats GET variable to filter out extra satellites
- Added ability to have additional satellites in a local file for offline mode.
- Added mobile controls
- Added legend to the top right to address issue "Legend for Colors".
- Added legend to the top right to address issue #23 (Legend for Colors).
- Organized braun.js and renammed mapper.
- Custom Sensor Menu
- Removed Changelog. Pulled drawLoop variables to global scope. Fixed altitude check for calculating zoom.
- Custom Sensor Menu
- Combined FOV-bubble.js and line.js into drawLoop-shapes.js
- Fixed orbit search. Added watchlist red theme when inview.
- TLE saving and loading added.
- Progress on Breakup Simulator
- Fixed map for IE 9 & 10.
- Add watchlist menu.
- Missile creation page updated to add premade list of targets.
- Added show distance on hover feature and fixed jday calculation glitch in elset age.
- Mobile controls tapandhold functionality added.
- Code cleanup
- North or South Option on Nominals
- Error Checking on Satellite Edit
- Added setting to increase sharpness of satellties
- Optimized search time and groups.js code. Related to issue #10
- Deconflict with Master Branch
- Added different legends depending on the current colorscheme
- Enabled bottom menus when sensor is selected from the map.
- Added License Key for Offline Only users.
- Updated About Info
- Socrates optimization.
- Removed Ligatures for IE Compatibility
- Added watchlist save and load buttons.
- Fixed glitch preventing launches to the north.
- Added filter options to the settings menu for convienence.
- Added JDAY to the top left.
- Reorganized js libraries to a separate folder.
- search-box.js reorganized.
- Text Highlighting Fixed
- Cleaned up settings menu.
- Added alert text when camera mode changed.
- Optimized syncing mechanism for multiple catalogues.
- Formatted sun.js like other functions.
- Updated version number.
- Removed multiple declarations of the current time "now" that were causing incorrect values in the satbox when proprate was not 1.
- SensorSelected Variable
- Added current time check to nominal creator. Solves issue #67.
- Removed admin folder from github.
- Show Next Pass in Sat Box
- More Launch Sites
- Fixed sun exclusion times.
- Cleanup main folder.
- Removed unnecessary getSatIdFromCoord calls from drawloop.
- Fixed edit satellite function.
- Social Media Links
- Updated about page.
- Made show distance default
- Reorganized settingsManager.
- Moved simulations to cleanup main folder.
- Less choppy mobile controls
- Removing duplicate jday functions.
- Fixed 2d map.
- Fixed multisensorlookangles
- Updated gitignore
- Fixed bug where all dropdown menus had extra bottom padding
- Fixed map update override.
- Added check to hide SOCRATES menu if the limitSats filter is on.
- Fixed error message in timeManager that was in the wrong spot.
- RCS color display fixed to account for actual RCS values not size groups
- Readd satData copy to searchBox.init
- Fixed mobile sliders color and prevented default keyboard popup.
- Right Mouse Click Fixed
- Red theme removed if last object from watchlist is removed while inview.
- Update version number.
- Added public github link.
- Adjusted RCS check in colorscheme so that Small Satellites now display correctly.
- Updated index Date
- Updated gitignore
- Version Fixed
- Fixed bug on index.htm where side menus were missing.
- This should fix issue #70.
- Updated version number.
- Increment version number
- Updated version number.
- Shortened option description in settings menu.
- Updated version number
- Updated version number
- Updated version number.
- Version number updated.
- Cleanup github
- Fixed glitch caused by static objects in satcache.
- Right Mouse Click Fixed

#### v0.10.0

>  

- Develop
- Develop
- UI Overhaul
- TLE Minification
- UI Overhaul
- Only FOV Option
- Optional Show Next Pass

#### v0.9.2

>  

- Develop
- TLE Update
- Satellite Editor
- Fixed iframes
- Alternate Launch Menu
- Edit Satellites
- ISS Stream, Launch Updater, and Socrates Improvements
- MultiSite Lookangles
- sat-cruncher Semi-Standard
- Improved Multi Site Lookangles
- Disable Bottom Icons Initially
- Country Menu Improved
- Variable Cleanup
- Settings Menu
- Settings Menu Update
- Future Next Pass Feature and Removed Memory Leak
- TAGs Updated
- Version Number Menu
- Socrates Menu Functionality
- Default Messages Changed\nChanged the default messages to make them more obvious if there is a js error.
- Prevent Shake Effect Failures
- Fixed Tooltips
- NORAD Number Search
- Find Near Objects Fixed
- Disable Look Angles Until Sensor Selected
- Proprate Fixed
- Links and Version Number Box
- Disable Weather if No Weather Maps
- Variables Optional
- Version Number Updated
- Updated Ignore
- Updated Ignore File
- Fixed Index.htm
- Testing Git Commit
- Version Box Fixed
- Version Box Updated
- Reduced Max Orbits
- Default Messages Changed
- Default Messages Changed" -m "Changed the default messages to make them more obvious if there is a js error.
- FIxed ELSET Parser
- Renamed Images

#### v0.5.2

>  

- Fixed Open Issues

#### v0.5.1

>  

- Admin Section Added
- Updated README for v0.5.0

#### v0.5.0

>  

- Revert "Javascript Semi-Standard Compliant"
- Revert "SOCRATES"
- SOCRATES
- SOCRATES
- Remove Old Files

#### v0.4.0

>  

- Javascript Semi-Standard Compliant
- Create README.md
- Update README.md

#### v0.3.0

>  

- 12 October 2016
- 21 December 2016
- 7 December 2016
- 20 December 2016
- :neckbeard: Added .gitattributes & .gitignore files
- Delete dot-blue.png
