---
name: review-plugin
description: Audit a KeepTrack plugin for correctness, completeness, and adherence to architecture conventions. Use when creating, reviewing, or fixing any plugin in src/plugins/ or src/plugins-pro/.
---

# Plugin Quality Review

Audit the plugin specified by `$ARGUMENTS` (a file path, directory, or plugin class name). If no argument is given, audit the plugin file currently open in the IDE or ask the user which plugin to review.

## Step 1 — Locate and Read the Plugin

1. Find the main plugin `.ts` file. Search both `src/plugins/` and `src/plugins-pro/` directories. Read it in full.
2. Read any associated CSS file (same directory).
3. Read the `locales/` directory contents (if it exists).
4. Check for a `__tests__/` directory.

## Step 2 — Run the Checklist

Work through **every** item below. For each item, determine PASS, FAIL, or N/A. Collect all findings before reporting.

### 2.1 Identity & Naming

- [ ] `readonly id` is set and matches the class name exactly.
- [ ] File header comment references the correct filename (not a copy-paste relic).
- [ ] Error logging calls (`errorManagerInstance.error(...)`) pass the correct source filename string.
- [ ] `dependencies_` array is declared (even if empty `[]`).

### 2.2 Composition Pattern (preferred over legacy properties)

Modern plugins should use config methods rather than direct properties. Check which approach the plugin uses and flag legacy properties that should be migrated:

| Capability | Legacy Property | Composition Method | Lifecycle Hooks |
|---|---|---|---|
| Bottom icon | `bottomIconElementName`, `bottomIconImg`, `bottomIconLabel` | `getBottomIconConfig(): IBottomIconConfig` | `onBottomIconClick()`, `onBottomIconDeselect()` |
| Side menu | `sideMenuElementName`, `sideMenuElementHtml`, `sideMenuTitle` | `getSideMenuConfig(): ISideMenuConfig` | `onSideMenuOpen()`, `onSideMenuClose()` |
| Secondary menu | `sideMenuSecondaryHtml`, `sideMenuSecondaryOptions` | `getSecondaryMenuConfig(): ISecondaryMenuConfig` | `onSecondaryMenuOpen()`, `onSecondaryMenuClose()` |
| Help | `helpTitle`, `helpBody` | `getHelpConfig(): IHelpConfig` | — |
| Keyboard shortcuts | — | `getKeyboardShortcuts(): IKeyboardShortcut[]` | callbacks in config |
| Form submit | `submitCallback` | — | `onFormSubmit()` |
| Download/export | `downloadIconCb` | — | `onDownload()` — title bar icon auto-generated when `downloadIconCb` is set (works with or without secondary menu) |
| Context menu | `rmbL1Html`, `rmbL2Html`, `rmbCallback` | `getContextMenuConfig(): IContextMenuConfig` | `onContextMenuAction(targetId, clickedSatId?)` |

- [ ] Plugin uses composition config methods (`getBottomIconConfig`, `getSideMenuConfig`, etc.) instead of setting legacy properties directly.
- [ ] If `onBottomIconClick()` is implemented, a **legacy bridge** exists:
  ```typescript
  bottomIconCallback = (): void => {
    this.onBottomIconClick();
  };
  ```
- [ ] If `onContextMenuAction()` is implemented, a **legacy bridge** exists for `rmbCallback`.
- [ ] Config method imports are from `@app/engine/plugins/core/plugin-capabilities`.

### 2.3 CSS / DOM ID Consistency

This is one of the most common bugs. The plugin's `id` property is used as a prefix for all DOM element IDs via `${this.id}-xxx` in the HTML template. The CSS must target these exact IDs. **CSS selectors are case-sensitive** — `#collisions-table` does NOT match `id="Collisions-table"`.

- [ ] Every CSS selector (`#id-xxx`, `.id-xxx`) matches an actual DOM ID/class produced by the plugin's HTML template or JS code. **Check case sensitivity** — this is the #1 CSS bug found in reviews.
- [ ] No leftover selectors from a renamed plugin or copy-paste origin.
- [ ] The `sideMenuElementName` (or `getSideMenuConfig().elementName`) matches the wrapper `<div id="...">` in the HTML.
- [ ] Class names used in JS (e.g., `classList.contains('${this.id}-event')`) match those in CSS.

### 2.4 Localization (i18n)

- [ ] User-facing strings use `t7e('plugins.PluginName.key')` — not hardcoded English.
- [ ] `bottomIconLabel` (or config `.label`) uses `t7e()`.
- [ ] Side menu title uses `t7e()`.
- [ ] Help content uses `t7e()`.
- [ ] Error/info messages use `t7e()` where locale keys exist.
- [ ] Toast messages (`uiManager.toast(...)`) use `t7e()` — these are commonly overlooked.
- [ ] Button labels, table headers, and status text use `t7e()` where locale keys exist.
- [ ] Locale files exist for **all 9 languages**: `en.src.json`, `de.src.json`, `es.src.json`, `fr.src.json`, `zh.src.json`, `ja.src.json`, `ko.src.json`, `ru.src.json`, `uk.src.json`.
- [ ] If a Pro extension exists in `src/plugins-pro/`, it has its **own** `locales/` directory with keys for any additional UI it adds (new tabs, toasts, labels).
- [ ] Locale files are named `*.src.json` (not `*.json`).
- [ ] Locale JSON is wrapped in a `"plugins"` object: `{ "plugins": { "PluginName": { ... } } }`.
- [ ] **Translations are written in the target language** — not as Unicode escape sequences (`\u00e9`). Locale files must be human-readable: `"Périgée"` not `"\u0050\u00e9\u0072\u0069\u0067\u00e9\u0065"`. Unicode escapes make translations unverifiable without decoding. If you generate locale files, write the actual characters (UTF-8).
- [ ] Static arrays/options with translated text use `static get` (lazy getter) not `static` property (evaluated at parse time before localization loads).
- [ ] **Toolbar action buttons prefer icons over text** for a cleaner, more compact UI. Use icon-only `<img>` inside `<button>` with `kt-tooltip` for the label. Tooltips still need `t7e()` translation — the benefit is visual clarity and space savings, not fewer translations. Icons from `public/img/icons/` include `refresh.png`, `visibility.png`, `visibility-off.png`, `download.png`, etc.

### 2.5 Help Content

- [ ] Plugin provides help content via `getHelpConfig()` (or legacy `helpTitle`/`helpBody`).
- [ ] Help body explains what the plugin does and how to use it.

### 2.6 Keyboard Shortcuts

- [ ] If the plugin has a natural shortcut key, `getKeyboardShortcuts()` is implemented (per CLAUDE.md: "Add `getKeyboardShortcuts()` to plugins when logical shortcuts exist").
- [ ] Shortcut keys don't conflict with existing shortcuts in other plugins. **To check**: search for `getKeyboardShortcuts` across `src/plugins/` and list all claimed keys. Known taken keys include: `1-5`, `B`, `C`, `F`, `G`, `I`, `M`, `N`, `P`, `S`, `i`, `m`, `Home`, `Space`, `[`, `]`, `<`, `>`, `-`, `=`, `/`.

### 2.7 Side Menu HTML Structure

The base plugin's `generateSideMenuHtml_()` auto-wraps `sideMenuElementHtml` with the side-menu-parent container and title bar whenever `sideMenuSecondaryHtml` OR `downloadIconCb` is set. This means:

- **With secondary menu or downloadIconCb**: `sideMenuElementHtml` must contain **only inner content** (no wrapper divs). The base plugin generates the `<div id="..." class="side-menu-parent">` wrapper, title bar, and download/settings icons.
- **Without either**: `sideMenuElementHtml` must include the **full wrapper** (`<div id="..." class="side-menu-parent start-hidden text-select"><div class="side-menu">...</div></div>`).

**Important for pro plugins**: If a base plugin has NO download/secondary menu (full wrapper HTML) but the pro version ADDS `onDownload()`, the pro's `buildSideMenuHtml_()` override must switch to inner-only content since `downloadIconCb` gets auto-wired by `detectAndInitializeComponents_()` when `onDownload()` exists (via `IDownloadCapable` / `hasDownload()` type guard).

- [ ] Wrapper convention is followed correctly based on the above rules.
- [ ] A private `buildSideMenuHtml_()` is acceptable **only** when called from inside `getSideMenuConfig()` to produce the `html` value. It's a problem when it bypasses the config system entirely (setting HTML only in a standalone method without going through `getSideMenuConfig()`).
- [ ] If the plugin has a form, form ID follows `${sideMenuElementName}-form` pattern (required for auto-wired `onFormSubmit()`).
- [ ] Form element IDs follow `<prefix>-<field>` convention (e.g., `ds-scc`, `ds-time`).

### 2.8 Event Bus Usage

- [ ] `addJs()` calls `super.addJs()` first.
- [ ] DOM event listeners are registered in a `uiManagerFinal` handler (not in `addJs()` directly), since DOM elements aren't created until after `uiManagerInit`.
- [ ] Event subscriptions use `.bind(this)` or arrow functions to preserve context.
- [ ] `EventBus.getInstance()` calls are not repeated excessively — cache if used more than twice in the same method.
- [ ] **Persistence restore in `uiManagerFinal`**: Code that restores persisted state (e.g., auto-selecting last constellation, re-opening a panel) must NOT call UI methods like `uiManager.hideSideMenus()` or `searchManager.closeSearch()` that may not be fully wired yet. Use a `skipCloseMenus` parameter or guard with optional chaining (`uiManagerInstance?.hideSideMenus?.()`). This is a common source of startup crashes.
- [ ] **Login-state reactivity**: If the plugin's behavior depends on login state (e.g., auto-fetching external data), it subscribes to `EventBusEvent.userLogin` and `EventBusEvent.userLogout` in `addJs()` and updates toolbar/UI when the user logs in or out while the menu is already open.

### 2.9 Satellite/Sensor Requirements

- [ ] If the plugin requires a satellite to be selected, `isRequireSatelliteSelected = true` is set (auto-disables icon when no satellite selected).
- [ ] If applicable, `isIconDisabledOnLoad = true` and `isIconDisabled = true` are set.
- [ ] Or the equivalent `isDisabledOnLoad: true` in `getBottomIconConfig()`.

### 2.10 Code Style (per CLAUDE.md)

- [ ] Private members use trailing underscore: `myField_`, `myMethod_()`.
- [ ] `ServiceLocator.getXxx()` calls are cached at the start of methods, not called repeatedly.
- [ ] No loose equality `== null` — use `=== null`, `=== undefined`, or `typeof` checks.
- [ ] No commented-out dead code.
- [ ] HTML uses `html` tagged template literal from `@app/engine/utils/development/formatter`.
- [ ] LF line endings (not CRLF).
- [ ] `settingsManager` has an explicit import (`import { settingsManager } from '@app/settings/settings'`), not relied on as an implicit global. Note: `settingsManager` is assigned to `global` at runtime in `settings.ts:499`, so code works without import — but explicit imports are preferred for clarity and type safety.

### 2.11 Null Safety

- [ ] Non-null assertions (the ! operator) are justified — the element genuinely must exist at that point.
- [ ] `dataset` property reads check for `undefined` (not just `null`) since `HTMLElement.dataset[key]` returns `undefined` when missing. Common bug: `if (dataset.row !== null)` should be `!== undefined`.
- [ ] Null checks guard against missing satellites, DOM elements, etc. before accessing properties.
- [ ] **`getEl()` in table/UI population methods**: `getEl(id)` throws when the element doesn't exist and `isExpectedMissing` is `false` (default). Methods like `populateTable_()` that may run during startup restore (before DOM is fully built) should guard with `if (!getEl('element-id', true)) { return; }`. This also prevents test failures in Node/vitest where JSDOM elements aren't created.

### 2.12 Tests

- [ ] A `__tests__/` directory exists with at least one test file.
- [ ] Tests use `setupStandardEnvironment()` from `@test/environment/standard-env`.
- [ ] `standardPluginSuite(PluginClass, 'PluginName')` is called for basic lifecycle tests.
- [ ] `standardPluginMenuButtonTests(PluginClass, 'PluginName')` is called if the plugin has a bottom icon.
- [ ] Config methods are tested (correct element names, drag options, etc.).
- [ ] `onBottomIconClick` / `bottomIconCallback` bridge is tested.
- [ ] Core business logic has dedicated tests.
- [ ] Tests that assert on toast/error message strings use the `t7e()` key (not hardcoded English), since `t7e()` returns the key string when locales aren't loaded in the test environment.
- [ ] **Persistence restore paths are tested**: If the plugin restores state from `PersistenceManager` on startup, tests should verify that this code path doesn't crash when UI services are incomplete (mock `ServiceLocator` methods returning partial objects).
- [ ] **Static→instance method migration**: When a `static` public method is converted to `private` instance, old tests using `Class.method = vi.fn()` must be updated to use bracket notation `(plugin as any).method_(args)` or `vi.spyOn` on the instance.

### 2.13 MenuMode

- [ ] `menuMode` array (or `getBottomIconConfig().menuMode`) is appropriate for the plugin's audience:
  - `MenuMode.BASIC` — general users
  - `MenuMode.ADVANCED` — power users
  - `MenuMode.ANALYSIS` — analysis tools
  - `MenuMode.EXPERIMENTAL` — experimental/beta
  - `MenuMode.ALL` — always visible

### 2.14 UX Conventions

- [ ] When jumping to a specific time (TCA, TOCA), use `timeManager.changeStaticOffset(targetTime - Date.now())` to preserve playback state.
- [ ] **Camera after time jump**: When calling `lookAtLatLon` after `changeStaticOffset`, defer the camera call by one frame using `requestAnimationFrame(() => { camera.lookAtLatLon(...); })`. The GMST (Earth visual rotation) isn't recalculated until the next render frame — if the camera target is set before GMST updates, the Earth jumps visually and the camera ends up at the wrong longitude. Also always pass the explicit target date to `lookAtLatLon` (4th parameter) instead of relying on the default `simulationTimeObj`.
- [ ] **ESLint: no explicit `undefined` arguments**: The linter rejects `fn(a, b, undefined, d)`. Use a falsy value instead (e.g., `lookAtLatLon(lat, lon, 0, date)` — the `0` is falsy so the zoom `if (zoom)` check skips it).
- [ ] Secondary menus / results tables stay open after user interactions (clicking rows, etc.).
- [ ] Table rows that trigger actions have `cursor: pointer` styling and `class="link"`.
- [ ] `showLoading()` / `hideLoading()` are only used for genuinely heavy operations (bulk mesh creation, satellite propagation across full catalog). Individual row clicks, single mesh toggles, and other fast operations should NOT use the loading screen.
- [ ] **Buttons gated on data availability**: Action buttons that require data (e.g., "Show All Zones", "Clear All Zones") start with the `disabled` HTML attribute and are enabled programmatically after data loads. Style disabled state with `opacity: 0.3; cursor: not-allowed;`.
- [ ] **Minimize layout shifts**: When swapping between buttons (e.g., hiding a "Fetch" button and showing a "Refresh" button), perform both DOM changes in the same synchronous operation to avoid multiple layout shifts. For example, when the user clicks "Fetch", immediately show the "Refresh" button — don't wait for the async fetch to complete.
- [ ] **Login-gated external data fetch**: Plugins that fetch external API data (NASA EONET, CelesTrak, etc.) should auto-fetch for logged-in users when the menu opens, but show a manual "Fetch Data" button for guest users. Check login state synchronously via `PluginRegistry.getPlugin(UserAccountPlugin)?.cachedUser`. After a successful fetch, show the refresh button for all users regardless of login state. Use "Fetch" (not "Download") to avoid confusion with CSV/data export features.

### 2.15 Side Menu List Styling

Plugins with simple list-style side menus (e.g., countries, color schemes, satellite photos, constellations) must follow the standard list pattern. Global CSS in `style.common.css` provides default border styling for all `<li>` items that are direct children of `<ul>` inside `.side-menu`:

```css
.side-menu > ul > li {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}
.side-menu > ul > li:first-child {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}
```

This gives every list a visible separator between items and a top border on the first item. Plugins get this for free when their HTML follows the standard structure:

```html
<div id="plugin-menu" class="side-menu-parent start-hidden text-select">
  <div id="plugin-content" class="side-menu">
    <ul id="plugin-list">
      <li class="menu-selectable" data-id="foo">Item 1</li>
      <li class="menu-selectable" data-id="bar">Item 2</li>
    </ul>
  </div>
</div>
```

- [ ] List items use `class="menu-selectable"` (provides hover highlight + cursor). Do NOT use custom per-plugin classes like `satPhotoRow` or `link` for list items — `menu-selectable` is the standard.
- [ ] List `<ul>` is a direct child of the `.side-menu` div (required for the `.side-menu > ul > li` selector to match).
- [ ] Items that need extra data use `data-*` attributes (e.g., `data-color`, `data-group`, `data-sensor`).
- [ ] Dynamically added items (e.g., DSCOVR images appended via `insertAdjacentHTML`) also use `menu-selectable`.

### 2.16 Resizable Width

Side menu plugins should be resizable by default. Users benefit from being able to adjust panel width to fit their screen and content.

- [ ] `dragOptions` includes `isDraggable: true` (either as a class property or in `getSideMenuConfig().dragOptions`). Only skip this for plugins where resize doesn't make sense (e.g., full-width plots, minimal-content panels).
- [ ] `minWidth` and `maxWidth` are set to reasonable values that accommodate the plugin's content.
- [ ] If the default 280px side menu width is too narrow for the plugin's content, an explicit `width` is set in `getSideMenuConfig()` (e.g., `width: 600` for form-heavy plugins).

### 2.17 Pro Plugin Extensibility

If the plugin has (or should have) a pro variant in `src/plugins-pro/`, check that the base class is structured for extension:

- [ ] Methods that a pro class would need to override are `protected` (not `private`). Common candidates: `buildSideMenuHtml_()`, `createTable_()`, `createRow_()`, `createHeaders_()`, `getDragOptions_()`, and data arrays like `collisionList_`.
- [ ] If a pro variant exists in `plugin-manifest.ts`, the manifest entry includes `proImport` and `proClassName`.
- [ ] The pro class inherits the same `id` as the base (same `configKey`, same DOM IDs).
- [ ] Static utility methods used by both base and pro (e.g., `createCell_()`) are `protected static`, not `private static`.

## Step 3 — Report

Present findings as a structured report with these sections:

1. **Critical Issues** — Bugs that break functionality (CSS ID mismatches, wrong event wiring, null reference errors)
2. **Convention Violations** — Deviations from project standards (hardcoded strings, legacy pattern usage, missing trailing underscores)
3. **Missing Features** — Absent but expected capabilities (no tests, no help, no locales, no keyboard shortcuts)
4. **Minor Issues** — Code quality nits (dead code, style inconsistencies)
5. **Summary** — Overall health score (Critical/Warn/Good) and prioritized list of recommended fixes

For each issue, reference the specific file and line number using markdown link format: `[file.ts:42](path/to/file.ts#L42)`.

## Appendix: Common Pitfalls Found in Reviews

These patterns have caused real bugs in past reviews. Pay special attention to them:

1. **Persistence restore crashes at startup**: Code in `uiManagerFinal` that calls `constellationMenuClick_()` or similar with persisted state will crash if that method internally calls `uiManager.hideSideMenus()` — the UI manager may not be fully wired at that point. Fix: add a `skipCloseMenus` parameter or guard UI calls.

2. **`getEl()` throws in tests**: `getEl(id)` throws when `isExpectedMissing` defaults to `false` and the element doesn't exist. In Node/vitest tests, DOM elements from `getSideMenuConfig().html` aren't created unless the full init lifecycle runs. Methods called during tests or startup restore should use `getEl(id, true)` with an early return.

3. **Typos in data slugs are breaking changes**: Renaming a data slug like `AmatuerRadio` → `AmateurRadio` fixes the typo but breaks persisted state and any external code referencing the old slug. Flag these as breaking changes in the report.

4. **Locale migration must touch all 9 global files**: When moving locale keys from `src/locales/*.src.json` to `src/plugins/<name>/locales/`, entries must be removed from ALL 9 global files. Missing one causes duplicate keys and build warnings.

5. **`addConstellation()` as a public API**: Plugins that let external code register items (constellations, filters, etc.) should include those dynamic items in `getCommandPaletteCommands()`. Test that dynamically added items appear in the command list.

6. **Stats calculation edge cases**: When computing orbital stats (avg altitude, plane count), guard against empty satellite arrays (division by zero) and handle satellites with missing orbital elements (`apogee`, `perigee`, `inclination` may be 0 or undefined for debris/unknown objects).

7. **GMST desync after `changeStaticOffset`**: `changeStaticOffset` updates `simulationTimeObj` immediately, but `timeManager.gmst` (used by the camera's Earth-tracking) isn't recalculated until `timeManager.update()` runs in the next render frame. Calling `lookAtLatLon` synchronously after `changeStaticOffset` causes the camera to compute a yaw target against the old Earth rotation. When GMST catches up next frame, the Earth jumps and the camera points at the wrong longitude. Symptom: clicking twice fixes it (second click has no GMST jump). Fix: wrap `lookAtLatLon` in `requestAnimationFrame`.

8. **Per-event mesh management**: When a plugin creates multiple independent meshes (one per table row), use a `Map<number, Mesh[]>` keyed by row index instead of a flat array. This enables per-item add/remove/toggle without affecting other items. Use lazy handler registration (`ensureHandlersRegistered_()`) to avoid double-registering draw/update handlers. Clear the map on data refresh (row indices become stale with new data).

9. **Loading screen usage**: `showLoading()` / `hideLoading()` should only be used for operations that genuinely block the UI for a noticeable duration (bulk mesh creation for all events, heavy satellite propagation loops). Do NOT use them for lightweight operations like creating a single mesh, clicking a table row, or toggling visibility on one item — these complete fast enough that the loading overlay just flickers annoyingly. When the loading screen IS needed, it cannot be replaced with `requestAnimationFrame` batching or `setTimeout` chunking — WebGL mesh init is heavy enough per-item that the UI remains unresponsive regardless of yielding strategy, and `engine.pause()` stops the time manager along with rendering.

10. **Icon-only toolbar buttons**: When plugins have action buttons (Refresh, Fetch, Show All, Clear All, etc.), prefer icon-only `<img>` inside `<button>` with `kt-tooltip` attributes instead of text labels. This produces a cleaner, more compact toolbar — but tooltips still need `t7e()` translation, so it doesn't reduce the number of locale keys. Pattern: wrap buttons in a flex container (e.g., `<div class="xx-toolbar">`), use `display: inline-flex; align-items: center; justify-content: center;` on each button, and `width: 20px; height: 20px; filter: brightness(0) invert(1);` on icon images to make them white. Icons available at `public/img/icons/`: `refresh.png`, `visibility.png`, `visibility-off.png`, `download.png`, `preview.png`, `preview-off.png`, plus category-specific icons.

11. **Login-gated fetch with toolbar state machine**: Plugins that fetch external data should implement a toolbar state machine: (a) Guest + no data → show Fetch button, hide Refresh; (b) Guest + has data → hide Fetch, show Refresh; (c) Logged in → always hide Fetch, show Refresh, auto-fetch if empty; (d) User logs in while menu open → auto-fetch via `EventBusEvent.userLogin` handler. The `updateToolbarForLoginState_()` helper pattern centralizes this logic. Test with `vi.spyOn(PluginRegistry, 'getPlugin')` returning a mock `UserAccountPlugin` with `{ cachedUser: { id: 'test' } }` for logged-in or `{ cachedUser: null }` for guest.
