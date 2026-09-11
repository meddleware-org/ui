# Changelog

All notable changes to `@meddleware/ui` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [Semantic Versioning](https://semver.org/).

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
