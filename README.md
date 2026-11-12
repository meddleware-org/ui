# @meddleware/ui

Shared Vue 3 component library for the `@meddleware` UIs. Delivers a layout shell (header, sidebar, footer), colour-mode control, and UI primitives — all styled with [`@meddleware/design-tokens`](https://www.npmjs.com/package/@meddleware/design-tokens): a warm-neutral canvas with functional primary/rainbow accents, sacred-geometry (φ/Fibonacci) type + spacing scales, and optional seasonal theming.

## Installation

```sh
npm install @meddleware/ui @meddleware/design-tokens
# or
yarn add @meddleware/ui @meddleware/design-tokens
```

`vue ^3.5.0` is a peer dependency — install it separately if not already present.

## Setup

Import the CSS once at your application entry point:

```ts
// src/main.ts (or equivalent)
import '@meddleware/design-tokens/tokens.css'  // required — registers CSS custom properties
import '@meddleware/design-tokens/seasons.css' // optional — enables data-season theming
import '@meddleware/ui/reset.css'              // required once — element defaults, focus ring, utilities
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

Each component brings **its own CSS** when you import it, so a bundler keeps only the styles of the components an app uses (the package
declares `*.css` as a side effect, and each component's import lives in its own module). `@meddleware/ui/base.css` is the old single
file (reset + every component) for consumers that want it.

**Cascade layers.** The reset is `@layer mw.reset` and every component's CSS is `@layer mw.components`. Layered CSS always loses to your
unlayered CSS, so you override a component with an ordinary selector and never have to out-specify its internals.

**No flash of the wrong theme.** Load `@meddleware/ui/theme-init.js` as a plain script at the top of `<head>`
(`<script src="/theme-init.js" data-default="dark"></script>`, copied from the package into your public folder). It applies the saved
colour mode (or `data-default`: `light`, `dark` or `system`) and the season to `<html>` before first paint, with the same rules as
`useColorMode` and `useSeason`. It is a same-origin file, so it needs no CSP hash.

## Styling, scales & utilities

Components consume the design-token **role** tokens (`--accent`, `--warning`, `--focus-ring`, …) and
the **sacred-geometry scales** (`--space-*`, `--font-size-*`, `--leading-*`, `--tracking-*`) — never
colour-named or magic-number values. Focus states use the dedicated `--focus-ring` (blue) so they are
always visible and never read as an error. Component **props and accessibility are unchanged** by the
theming system — only the styling tokens they resolve to.

`reset.css` also ships utilities (respecting `prefers-reduced-motion`) and gives a bare `<button>` a base look from the tokens:

| Utility | Purpose |
| --- | --- |
| `.mw-noise` | Subtle CSS-native SVG-noise background layer (controlled imperfection over flat polish). |
| `.mw-mono` | Monospace font (`--mw-font-mono`). |
| `.mw-spinner` | Sigil-like ring loader that settles into a simple form. |
| `.mw-hand-drawn` | Empty positioned **placeholder hook** for bespoke hand-drawn SVG/canvas added later — drop an `<svg>`/`<canvas>` inside, or target `.mw-hand-drawn > svg` from your app. |
| `.mw-visually-hidden` | Hides content visually while keeping it available to assistive technology (e.g. a group's `<legend>`). |

Seasonal theming is entirely in `@meddleware/design-tokens` (import `seasons.css` + set
`data-season`); the components pick it up automatically through the role tokens.

## Exports

### Layout shell

| Component | Description |
| --- | --- |
| `AppHeader` | Top bar (`<header>`). `sidebarId` shows a menu button below 45em that opens that sidebar as a drawer. Slots `brand`, default and `actions` render **directly** in the header — no wrapper elements. The brand slot's single element comes first and takes the brand typography, pushing everything after it to the inline end; default-slot content that should fill the gap sets its own `flex: 1`. |
| `AppSidebar` | Side panel (`<aside>`) around a component-owned `<nav>` (default slot; `navLabel`, default "Primary"). Below 45em it becomes a **drawer** on the Popover API, opened by `AppHeader`'s menu button (give the sidebar an `id`, pass it as `sidebar-id`), closed by Escape, a click outside, or choosing an item. The `head`, `body` and `foot` slots render directly and style themselves; the nav grows, so body/foot content settles at the bottom. |
| `BrandMark` | The company mark, the Kopimi "K" (public domain, vendored; `src/brand/README.md`), drawn in `currentColor` so it takes the accent in either colour mode. Decorative unless given `label`. The favicon set (`favicon.svg` with a dark-mode colour, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) is published as `@meddleware/ui/brand/*`; apps get it through `@meddleware/frontend-config`'s `brandIcons`. |
| `AppToolShell` | The frame of a standalone tool app: header with the mark and the tool's name, `actions` slot, colour-mode control, footer with the documentation links and the copyright line. `docsUrl` / `devUrl` take a URL or `false` (no link); `pageHeading` false when the page has its own `h1`; `contained` false lets the page use the full width; a `footer-note` slot adds a sentence to the footer. |
| `AppFooter` | Page footer (`<footer>`). Slots `start`, default and `end` render directly; `docsUrl` / `devUrl` render a component-owned `<nav aria-label="Documentation">` at the inline end. |

All three accept a `variant` prop (a CSS class, `mw-panel--dark` and so on, defined in the reset; `colors` overrides are written to the element through the CSSOM, never as an inline `style` attribute, so they work under a strict CSP):

| Variant | Behaviour |
| --- | --- |
| `'dark'` | Uses `--mw-panel-dark-*` tokens — renders correctly on any page theme. |
| `'light'` | Uses `--mw-panel-light-*` tokens — renders correctly on any page theme. |
| `'transparent'` | Inherits the page background and text colour. |

### Primitives

| Component | Description |
| --- | --- |
| `UiButton` | Styled button, or a link that looks like one (`href`, checked with `safeHref`). `variant` primary / secondary / ghost / danger / link; `size` md / sm; `busy` shows a spinner, sets `aria-busy` and blocks interaction without losing the label. Hover is an inner ring in the label colour, so the label keeps its contrast. |
| `UiCard` | Card: optional `<header>` (title), body content directly inside, optional `<footer>`. `as` section / article / li, `level` 2–6 for the heading, `plain` drops the header band, `href` makes the whole card a link through its title (one tab stop). Inside a list item the band and footer are plain elements (a `<header>` there would become a page-level landmark). |
| `UiSelect` | Styled native `<select>` (single root; attributes fall through; chevron painted in CSS). Label it with `UiFormField` or an `aria-label`. |
| `UiFormField` | A labelled field as a `<p>`: `<label for>` + `label-suffix` slot (e.g. `UiFieldHint`, kept outside the label) + control slot (receives `attrs` with `id` / `aria-*`) + hint/error `<small>`. Slot content must be phrasing content. |
| `UiNotice` | Notice / alert banner. `type` info / warning / error / ok (roles: `alert` for error, `status` for ok and warning), `message` prop or slot, `as` p / div for block content. The text keeps body colour; the tone is the border and tint. |
| `UiDialog` | Modal on the native `<dialog>`: `<article>` › `<header>` (title heading, `level` default 2, + close) · body slot · `<footer>` (`actions` slot, scoped `close(value)`). `v-model:open`, `title`, `dismissible` (Escape/backdrop/close button via native `closedby`), `width`; emits `close(returnValue)`. |
| `AppTabNav` / `UiTabPanel` | WAI-ARIA tabs: `AppTabNav` is the `tablist` (arrow keys, Home/End, roving tabindex); wrap each view's content in `UiTabPanel` with the same `idPrefix` and the shown `tab` id. Only the selected tab gets `aria-controls` (one panel rendered); pass `all-panels` when every tab's panel stays mounted. `tabIds(prefix, id)` returns the linked ids. |
| `SidebarItem` | Sidebar entry: a button by default, a real `<a>` with `href` (checked with `safePath` / `safeHref`). `label`, `icon`, `active` (`aria-current="page"`), `disabled`. |
| `SidebarGroup` | Labelled group of sidebar items: a `<fieldset>` whose visible `<legend>` names the group. |
| `CopyableAddress` | Shows a value (address/blob id/tx digest) with a dedicated **copy icon** (the value text is not the copy trigger). Put a link in the default slot to make it both linkable and copyable. Props: `address`, `truncate`, `chars`, `label`. |
| `ExplorerLink` | External block-explorer link with a truncated label (or slot). Chain-agnostic — pass `href` (build it with `suiExplorerUrl`, or an app helper such as a Walruscan URL). Nest inside `CopyableAddress` for link + copy. |

Copy + link compose — nest `ExplorerLink` in `CopyableAddress` so the value links out while the
icon copies:

```vue
<CopyableAddress :address="addr">
  <ExplorerLink :href="suiExplorerUrl('account', addr, 'testnet')" :value="addr" />
</CopyableAddress>
```

### Desktop-console primitives

| Component | Description |
| --- | --- |
| `UiPanel` | Titled surface: `<section>` + heading (`title` prop/slot; `level` 2–6, default 2) + body content directly inside. |
| `UiStatGrid` / `UiStatRow` | Key/value readout as a description list (`<dl>` with `<dt>`/`<dd>` pairs). |
| `UiToolbar` | A WAI-ARIA toolbar (`role="toolbar"`, one tab stop, Left/Right/Home/End between enabled buttons). Props: `actions: ToolbarAction[]` (`{ id, label, disabled? }`), `label`; emits `action(id)`. |
| `UiToolbarButton` | Compact console button; also usable standalone (refresh, pagination). |
| `UiStatusBar` | Status bar as a list. Standard items from optional props `network` (+ `healthy`), `epoch`, `lastRefresh` (the relative time ticks on its own); extra `<li>` items in the default slot. |
| `UiDataTable` | Table. `head` slot: `<th>` cells **only** (never a `<tr>`; the component wraps them, and a dev check warns); default slot: rows; `rows` (0 shows `empty`), `caption` (visually hidden accessible name). When wider than its box the scroll area becomes a focusable, labelled region and says so. A `th scope="row"` reads as the row title, not a column header. |
| `UiBadge` | Status or tag as words + symbol + border: `tone` ok / warn / danger / info / accent / neutral, `symbol` (own glyph, `false`, or the tone's default). The label keeps body colour. (`variant` is the old API.) |
| `UiStatusDot` | Decorative health dot: `status` operational / degraded / down / unknown (or ok / warn / error), `size` sm / md. Put the state in words beside it. |
| `UiActivityFeed` / `UiActivityItem` | Activity list (`UiActivityItem` takes `type`, `time`, optional `datetime` to render a `<time>`). |
| `UiSegmentedControl` | Radio-group choice: `label` names the group (a `<legend>`, visually hidden unless `label-hidden` is false), the chosen option carries a ✓, `layout` inline / wrap / grid. |
| `UiStepper` | Steps: a wizard (`v-model` index) or a progress list (`status` per step: done / busy / error / pending; `orientation="vertical"`), with the state in words for assistive technology. |
| `UiMeter` | Labelled native `<meter>` with the state in words (within / close to / over). |
| `UiPager` + `usePager` | Previous / next for a keyset-paginated list; `usePager(load)` keeps the cursors seen and drops out-of-order answers. |

### Forms and small primitives

| Component | Description |
| --- | --- |
| `UiInput`, `UiTextarea` | Styled native controls (single root; attributes fall through; `v-model`). Label them with `UiFormField` or an `aria-label`. |
| `UiFileField` | `UiFormField` around a native file input: `id`, `label`, `hint`, `error`, `accept`, `disabled`, `required`; emits `select` with the chosen `File` (or `null`). |
| `UiTextField` | `UiFormField` + `UiInput` (or `UiTextarea` with `rows`), association done: `id`, `label`, `hint`, `error`; other attributes go to the control. |
| `UiSelectField`, `UiCheckField`, `UiDateTimeField` | A labelled select (`[value, label]` options, optional placeholder); a checkbox wrapped in its label (`label` slot for rich text); a date-time that edits wall time in a `zone` and exchanges UTC. |
| `UiLiveStatus` | A polite live region that is always mounted, so changes are announced. |
| `UiEmptyState`, `UiCodeBlock`, `UiCopyButton`, `UiAmount`, `UiSkipLink`, `UiAppShell` | "Nothing here yet" with an action slot; a focusable `<figure>`/`<pre>`; a copy icon that announces the result; an exact SUI/WAL amount in a `<data>` element; "Skip to content"; the page frame (skip link, `<main>`, header/sidebar/footer slots). |

### Helpers

The framework-free helpers live in [`@meddleware/web-utils`](https://www.npmjs.com/package/@meddleware/web-utils) and are re-exported here
(`suiExplorerUrl`, `walruscanBlobUrl`, `safeHref`, `safePath`, `truncateMiddle`, the status parser and its `STATUS_LABEL` /
`STATUS_HEADLINE`). Composables: `useColorMode`, `useSeason`, `useNow`, `useStatusSnapshot`, `usePager`.

### Explorer helper

| Export | Type | Description |
| --- | --- | --- |
| `suiExplorerUrl(kind, id, network?)` | Function | Builds a SuiVision URL. `kind`: `'account' \| 'object' \| 'txblock'`; `network` defaults to `'testnet'`. Single source of truth for Sui explorer links. |
| `SuiNetwork`, `SuiExplorerKind` | Types | `'mainnet' \| 'testnet' \| 'devnet'` and the link kinds. |

### Colour mode

| Export | Type | Description |
| --- | --- | --- |
| `ColorModeControl` | Vue SFC | Presentational light / dark / system toggle. **Owns no state** — bind with `v-model`. |
| `useColorMode(default?)` | Composable | Module-singleton colour-mode state manager. Sets `data-theme` on `<html>`, persists to `localStorage`, follows system preference when mode is `'system'`. |
| `ColorMode` | Type | `'light' \| 'dark' \| 'system'` |
| `PanelVariant` | Type | `'light' \| 'dark' \| 'transparent'` |
| `PanelColors` | Type | Per-instance colour override shape for layout shell components. |

## Theming

Global light / dark switching is handled by `useColorMode`, which sets `data-theme="dark"` on `<html>`. The semantic CSS tokens (`--bg`, `--surface`, `--text`, etc.) from `@meddleware/design-tokens` swap values automatically.

Layout shell components use the theme-independent `--mw-panel-{dark,light}-*` tokens for their `variant` prop, so a `variant="dark"` header renders correctly on a light page — and vice-versa — without any extra configuration.

### Example: wiring colour mode

```vue
<script setup lang="ts">
import { AppHeader, ColorModeControl, useColorMode } from '@meddleware/ui'

const { mode } = useColorMode()
</script>

<template>
  <AppHeader variant="dark">
    <template #actions>
      <ColorModeControl v-model="mode" />
    </template>
  </AppHeader>
</template>
```

## Publishing

Published to npmjs on `v*` git tags via `.github/workflows/publish.yml` using npm trusted publishing (OIDC) — no long-lived secrets required. The workflow installs dependencies, builds `dist/`, and publishes.

To release: bump `version` in `package.json`, add a CHANGELOG entry, run `npm run build` to verify, commit, tag (`git tag v0.x.y`), push the tag.

## License

[0BSD](./LICENSE) — BSD Zero Clause License.
