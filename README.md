# @meddleware/ui

Shared Vue 3 component library for the `@meddleware` UIs. Delivers a layout shell (header, sidebar, footer), colour-mode control, and UI primitives — all styled with [`@meddleware/design-tokens`](https://www.npmjs.com/package/@meddleware/design-tokens) (Oxblood / Indigo palette).

## Installation

```sh
npm install @meddleware/ui @meddleware/design-tokens
# or
yarn add @meddleware/ui @meddleware/design-tokens
```

`vue ^3.5.0` is a peer dependency — install it separately if not already present.

## Setup

Import both CSS files once at your application entry point:

```ts
// src/main.ts (or equivalent)
import '@meddleware/design-tokens/tokens.css' // required — registers CSS custom properties
import '@meddleware/ui/base.css'              // optional — element-level defaults
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

## Exports

### Layout shell

| Component | Description |
| --- | --- |
| `AppHeader` | Top navigation bar. Accepts `variant`, optional `colors` override, and named slots for dynamic content. |
| `AppSidebar` | Side navigation panel. Same API as `AppHeader`. |
| `AppFooter` | Page footer. Same API as `AppHeader`. |

All three accept a `variant` prop:

| Variant | Behaviour |
| --- | --- |
| `'dark'` | Uses `--mw-panel-dark-*` tokens — renders correctly on any page theme. |
| `'light'` | Uses `--mw-panel-light-*` tokens — renders correctly on any page theme. |
| `'transparent'` | Inherits the page background and text colour. |

### Primitives

| Component | Description |
| --- | --- |
| `UiButton` | Styled button. |
| `UiCard` | Card container with surface background and border. |
| `UiSelect` | Styled select input. |
| `UiNotice` | Notice / alert banner. |
| `SidebarItem` | Navigation button for use inside `AppSidebar`. Accepts `label`, `icon`, `active`, and `disabled` props. |
| `CopyableAddress` | Shows a value (address/blob id/tx digest) with a dedicated **copy icon** (the value text is not the copy trigger). Put a link in the default slot to make it both linkable and copyable. Props: `address`, `truncate`, `chars`, `label`. |
| `ExplorerLink` | External block-explorer link with a truncated label (or slot). Chain-agnostic — pass `href` (build it with `suiExplorerUrl`, or an app helper such as a Walruscan URL). Nest inside `CopyableAddress` for link + copy. |

Copy + link compose — nest `ExplorerLink` in `CopyableAddress` so the value links out while the
icon copies:

```vue
<CopyableAddress :address="addr">
  <ExplorerLink :href="suiExplorerUrl('account', addr, 'testnet')" :value="addr" />
</CopyableAddress>
```

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
