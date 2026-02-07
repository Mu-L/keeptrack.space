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
| Download/export | `downloadIconCb` | — | `onDownload()` |
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

This is one of the most common bugs. The plugin's `id` property is used as a prefix for all DOM element IDs via `${this.id}-xxx` in the HTML template. The CSS must target these exact IDs.

- [ ] Every CSS selector (`#id-xxx`, `.id-xxx`) matches an actual DOM ID/class produced by the plugin's HTML template or JS code.
- [ ] No leftover selectors from a renamed plugin or copy-paste origin.
- [ ] The `sideMenuElementName` (or `getSideMenuConfig().elementName`) matches the wrapper `<div id="...">` in the HTML.
- [ ] Class names used in JS (e.g., `classList.contains('${this.id}-event')`) match those in CSS.

### 2.4 Localization (i18n)

- [ ] User-facing strings use `t7e('plugins.PluginName.key')` — not hardcoded English.
- [ ] `bottomIconLabel` (or config `.label`) uses `t7e()`.
- [ ] Side menu title uses `t7e()`.
- [ ] Help content uses `t7e()`.
- [ ] Error/info messages use `t7e()` where locale keys exist.
- [ ] Button labels, table headers, and status text use `t7e()` where locale keys exist.
- [ ] Locale files exist for **all 9 languages**: `en.src.json`, `de.src.json`, `es.src.json`, `fr.src.json`, `zh.src.json`, `ja.src.json`, `ko.src.json`, `ru.src.json`, `uk.src.json`.
- [ ] Locale files are named `*.src.json` (not `*.json`).
- [ ] Locale JSON is wrapped in a `"plugins"` object: `{ "plugins": { "PluginName": { ... } } }`.
- [ ] Static arrays/options with translated text use `static get` (lazy getter) not `static` property (evaluated at parse time before localization loads).

### 2.5 Help Content

- [ ] Plugin provides help content via `getHelpConfig()` (or legacy `helpTitle`/`helpBody`).
- [ ] Help body explains what the plugin does and how to use it.

### 2.6 Keyboard Shortcuts

- [ ] If the plugin has a natural shortcut key, `getKeyboardShortcuts()` is implemented (per CLAUDE.md: "Add `getKeyboardShortcuts()` to plugins when logical shortcuts exist").
- [ ] Shortcut keys don't conflict with existing shortcuts in other plugins.

### 2.7 Side Menu HTML Structure

- [ ] Wrapper div has correct ID and classes: `class="side-menu-parent start-hidden text-select"`.
- [ ] Inner content div has `class="side-menu"`.
- [ ] If the plugin has a form, form ID follows `${sideMenuElementName}-form` pattern (required for auto-wired `onFormSubmit()`).
- [ ] Form element IDs follow `<prefix>-<field>` convention (e.g., `ds-scc`, `ds-time`).

### 2.8 Event Bus Usage

- [ ] `addJs()` calls `super.addJs()` first.
- [ ] DOM event listeners are registered in a `uiManagerFinal` handler (not in `addJs()` directly), since DOM elements aren't created until after `uiManagerInit`.
- [ ] Event subscriptions use `.bind(this)` or arrow functions to preserve context.
- [ ] `EventBus.getInstance()` calls are not repeated excessively — cache if used more than twice in the same method.

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

### 2.11 Null Safety

- [ ] Non-null assertions (the ! operator) are justified — the element genuinely must exist at that point.
- [ ] `dataset` property reads check for `undefined` (not just `null`) since `HTMLElement.dataset[key]` returns `undefined` when missing.
- [ ] Null checks guard against missing satellites, DOM elements, etc. before accessing properties.

### 2.12 Tests

- [ ] A `__tests__/` directory exists with at least one test file.
- [ ] Tests use `setupStandardEnvironment()` from `@test/environment/standard-env`.
- [ ] `standardPluginSuite(PluginClass, 'PluginName')` is called for basic lifecycle tests.
- [ ] `standardPluginMenuButtonTests(PluginClass, 'PluginName')` is called if the plugin has a bottom icon.
- [ ] Config methods are tested (correct element names, drag options, etc.).
- [ ] `onBottomIconClick` / `bottomIconCallback` bridge is tested.
- [ ] Core business logic has dedicated tests.

### 2.13 MenuMode

- [ ] `menuMode` array (or `getBottomIconConfig().menuMode`) is appropriate for the plugin's audience:
  - `MenuMode.BASIC` — general users
  - `MenuMode.ADVANCED` — power users
  - `MenuMode.ANALYSIS` — analysis tools
  - `MenuMode.EXPERIMENTAL` — experimental/beta
  - `MenuMode.ALL` — always visible

### 2.14 UX Conventions

- [ ] When jumping to a specific time (TCA, TOCA), use `timeManager.changeStaticOffset(targetTime - Date.now())` to preserve playback state.
- [ ] Secondary menus / results tables stay open after user interactions (clicking rows, etc.).
- [ ] Table rows that trigger actions have `cursor: pointer` styling and `class="link"`.

## Step 3 — Report

Present findings as a structured report with these sections:

1. **Critical Issues** — Bugs that break functionality (CSS ID mismatches, wrong event wiring, null reference errors)
2. **Convention Violations** — Deviations from project standards (hardcoded strings, legacy pattern usage, missing trailing underscores)
3. **Missing Features** — Absent but expected capabilities (no tests, no help, no locales, no keyboard shortcuts)
4. **Minor Issues** — Code quality nits (dead code, style inconsistencies)
5. **Summary** — Overall health score (Critical/Warn/Good) and prioritized list of recommended fixes

For each issue, reference the specific file and line number using markdown link format: `[file.ts:42](path/to/file.ts#L42)`.
