# Changelog

All notable changes to `@meddleware/ui` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

Semantic-HTML refactor. Contains **breaking** component-contract changes (see Changed) — release
as a minor bump (0.2.0) and raise consumers' `@meddleware/ui` ranges accordingly.

### Added

- `UiDialog` — modal on the native `<dialog>` (`<article>` › `<header>` · body · `<footer>`),
  `v-model:open`, `dismissible` via native `closedby` (+ backdrop fallback), `close(returnValue)`.
- `UiTabPanel` + `tabIds()` — tab panels linked to `AppTabNav` tabs.
- `UiToolIntro` — shared one-line tool description.
- `.mw-visually-hidden` utility; `menu` list reset; fieldset `min-inline-size` / legend resets.
- `UiStatusBar` props `network`, `healthy`, `epoch`, `lastRefresh` (standard items built in).
- `UiPanel` `level` prop; `UiActivityItem` `datetime` prop; `AppTabNav` `size` prop.
- html-validate (`lint:html`) and axe + behaviour tests for the components.

### Changed (breaking)

- `AppHeader` / `AppFooter` / `AppSidebar`: slot wrapper elements removed — slot content renders
  directly and styles itself. AppHeader's brand is its first child; AppFooter's docs links are a
  `<nav aria-label="Documentation">`; AppSidebar no longer styles `head`/`body`/`foot`.
- `AppTabNav`: now the WAI-ARIA tabs pattern (`role="tablist"`/`tab`, arrow keys, roving
  tabindex) and requires `idPrefix`; wrap content in `UiTabPanel`.
- `UiToolbar`: `<menu>` driven by an `actions` prop (emits `action`); no default slot.
- `UiStatusBar`: `<ul>` list (was `<footer>`); separators are CSS.
- `UiPanel`: `<section>` + heading; `head` slot replaced by `title` slot.
- `UiFormField`: `<p>` root; `label-suffix` moved outside the `<label>`; hint/error are `<small>`.
- `UiSelect`: single `<select>` root (no wrapper); chevron drawn in CSS.
- `UiStatGrid` / `UiStatRow`: `<dl>` / `<dt>` + `<dd>`.
- `ColorModeControl`, `UiSegmentedControl`, `SidebarGroup`: `<fieldset>` + `<legend>` groups.
- `UiCard`: body wrapper removed. `UiActivityItem`: `<small>`/`<time>` meta, CSS dot.
  `StatusWidget`: CSS dot. `SidebarItem`: label span removed. `UiStepper`: click bound only on
  the back button; `aria-current="step"` on the `<li>`.
- `SidebarItem` hover is full-width with square corners.

## [0.1.12] - 2026-09-17

### Added

- `AppFooter`: new optional `docsUrl` prop — when set, renders a "Documentation" external link in
  the footer end area. Pass `VITE_DOCS_URL` from the consuming app to make the URL configurable per
  deployment.

## [0.1.10] - 2026-09-11

### Added

- `ExplorerLink` component — a chain-agnostic external block-explorer link (`href` + truncated
  label/slot). Nest it inside `CopyableAddress` to make a value both linkable and copyable.
- `suiExplorerUrl(kind, id, network?)` + `SuiNetwork` / `SuiExplorerKind` types — the single source
  of truth for Sui explorer links (SuiVision; `explorer.sui.io` was retired).

### Changed

- **`CopyableAddress`**: copy is now triggered by a dedicated **copy icon**, not by clicking the
  value text. The default slot renders the value (falling back to the truncated `address`), so a
  link can occupy it while the icon still copies the full value. (Behavioural change; call sites
  updated.)

## [0.1.5] - 2026-09-05

### Added

- `StatusWidget` component — polling status badge that links to the platform status page.
  Accepts `apiUrl`, `href`, and `pollInterval` props with sensible defaults pointing at
  `https://status.meddleware.co.uk`. Colours use design-token CSS vars (`--mw-ok-500`,
  `--mw-gold-500`, `--mw-danger-500`) rather than hardcoded hex values.
- `StatusLevel`, `StatusComponent`, `StatusGroup`, `StatusSnapshot` — TypeScript types
  that mirror the `GET /api/status` response contract from `platform-probe`.
- `isStatusLevel(s)` — type guard for validating a raw value against the `StatusLevel` union.
- `parseSnapshot(raw)` — runtime validator that returns a typed `StatusSnapshot` or `null`
  if the response shape is invalid, so callers treat a malformed response the same as a
  network error rather than silently misreading it.

## [0.1.4] - 2026-09-02

### Added

- `UiButton`, `UiCard`, `UiSelect`, `UiNotice` primitive components.

## [0.1.3] - 2026-09-02

### Added

- `SidebarItem` component — navigation button for use inside `AppSidebar`. Accepts `label`, `icon`, `active`, and `disabled` props. Uses `--mw-radius` and `--accent` design tokens.

## [0.1.1] - 2026-08-27

### Fixed

- `dist/index.d.ts` declaration file now included in the published package. Vite's `emptyOutDir` was wiping vue-tsc's declaration output; fixed by disabling `emptyOutDir` in `vite.config.ts` and adding an explicit `rm -rf dist` at the start of the build script.
- CSS output renamed from `ui.css` to `base.css` — `assetFileNames` condition in `vite.config.ts` never matched Vite's internal lib-mode asset name.

## [0.1.0] - 2026-08-24

### Added

- Initial release: Vue 3 component library built on `@meddleware/design-tokens`.
- Layout shell: `AppHeader`, `AppSidebar`, `AppFooter`.
- Primitives: `UiButton`, `UiCard`, `UiSelect`, `UiNotice`.
- `ColorModeControl` component and `useColorMode` composable.
- Vite library build (ESM) with `vue-tsc` declaration output to `dist/`.
