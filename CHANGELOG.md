# Changelog

All notable changes to `@meddleware/ui` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [Semantic Versioning](https://semver.org/).

## [0.1.31] - 2026-10-08

### Security

- `safeHref` refuses credentials in the authority (`https://suivision.xyz@evil.example/`), control
  characters, spaces and backslashes, and returns the normalised `URL.href`. New `safePath` validates
  root-relative paths; `CopyrightLine` uses it, closing the `/<TAB>/evil.example` bypass (the URL parser
  deletes the tab, leaving `//evil.example`).

### Fixed

- **Accessibility, measured in a real browser.** A Playwright + axe gate over a component gallery, across
  every theme × season, found and fixed: header/sidebar/footer slot links drawing the page accent on a panel
  of the other theme; sidebar-group labels, pending status-bar items and footer links dimmed with opacity
  below 4.5:1; badge tints that took their text below 4.5:1; the pending badge using the bright
  `--warning` as text (now `--warning-text`).
- Links are underlined by default (colour alone was the only cue); the step badge uses
  `--accent-contrast` instead of `#fff`.
- `useColorMode`'s watcher no longer stops when the component that called it first unmounts.
- `StatusWidget` starts in "Checking status…" instead of claiming "All systems operational", raises
  `pollInterval` to at least 15 s and does not poll while the tab is hidden.
- Address truncation defaults to `[12, 10]` (10 hex characters each side, against address-poisoning
  look-alikes); a value that fits is shown whole; a zero count no longer prints the full value after the
  ellipsis. New `truncateMiddle`. Pass `:truncate="false"` where a user chooses where funds go.
- No hard-coded colour fallbacks (`var(--accent, #6366f1)`, `#fff`); stylelint `color-no-hex` enforces it.

### Changed

- The 11.6 MB kopimi PDF and the legal HTML are no longer in the package (tarball 11.8 MB → 112 kB);
  they live in `legal/` for apps to copy, with the PDF's checksum and the note that its source is
  unrecorded. Emitted assets other than the stylesheet keep hashed names instead of overwriting `base.css`.
- Requires `@meddleware/design-tokens` ^0.1.9 (per-theme seasons, `--warning-text`).
- CI runs lint, a package-contents check and the real-browser gate; the release workflow runs the same
  workflow on the tagged commit (it skipped lint) and no step uses `--if-present` any more.
- All 33 components are mounted in the jsdom axe tests (11 were not); documentation drift corrected.

## [0.1.30] - 2026-10-03

### Fixed

- Requires `@meddleware/design-tokens` ^0.1.8, which defines the `--mw-panel-*` status tokens the
  panel status colours (0.1.29) use.

## [0.1.29] - 2026-10-03

### Fixed

- `suiExplorerUrl` encodes the id, so a chain-supplied value is always one path segment.
- `CopyrightLine` `symbolHref` accepts only a root-relative path or a URL `safeHref` allows; anything
  else falls back to the default link.
- `CopyableAddress` no longer rejects (or shows "Copied") when the clipboard refuses the write.
- `useColorMode` restores only `light`, `dark` or `system` from storage.
- `StatusWidget` requests time out after 10 s, so a hung request cannot stall polling.
- `AppTabNav` sets `aria-controls` only for tabs whose panel is rendered; status colours stay legible
  in light and dark panels.

### Changed

- `repository` declared for npm provenance; CI gates `npm audit` through an expiring allowlist.

## [0.1.28] - 2026-09-27

Semantic-HTML refactor. Contains **breaking** component-contract changes (see Changed), released as
a patch under the pre-0.2 versioning rule.

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
