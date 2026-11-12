<script setup lang="ts">
// The frame every standalone MeddleWare tool app shares: the page shell, a dark header with the tool's name, the actions the tool needs
// (a wallet button, a network badge …) next to the colour-mode control, one visually hidden page heading, and the footer with the
// documentation links and the copyright line. The tool itself is the default slot.
//
//   <AppToolShell title="Access Gate" slug="access-gate">
//     <template #actions><WalletModal /></template>
//     <AccessGateView />
//   </AppToolShell>
//
// `slug` names the tool's pages on the docs site and the developer site; `docsUrl` / `devUrl` override either (an app passes its
// `VITE_DOCS_URL` / `VITE_DEV_URL` build values) and `false` leaves that link out (a page with no such documentation). A page that has its own
// visible `h1` sets `:page-heading="false"`, so the shell does not add a second one. `:contained="false"` lets the page use the full
// width (a wide console with tables); the default keeps it to the tool width. A `footer-note` slot adds a sentence of the page's own
// to the footer, after the copyright line.
import { computed } from 'vue'
import AppFooter from './AppFooter.vue'
import AppHeader from './AppHeader.vue'
import BrandMark from './BrandMark.vue'
import ColorModeControl from './ColorModeControl.vue'
import CopyrightLine from './CopyrightLine.vue'
import UiAppShell from './UiAppShell.vue'
import { useColorMode } from '../composables/useColorMode'

const props = withDefaults(
  defineProps<{
    /** The tool's name: the brand in the header and the page's (visually hidden) heading. */
    title: string
    /** The tool's page name on the docs and developer sites (`access-gate` → `…/blockchain/sui/access-gate/`, `…/sui/access-gate/`). */
    slug: string
    /** The documentation link: a URL, or `false` for none (default: the tool's page on the docs site). */
    docsUrl?: string | false
    /** The developer-documentation link: a URL, or `false` for none (default: the tool's page on the developer site). */
    devUrl?: string | false
    /** Whether the shell adds the (visually hidden) page heading. Default true; false when the page brings its own `h1`. */
    pageHeading?: boolean
    /** Limit the page to the tool width (default). False for a full-width console. */
    contained?: boolean
    /** The colour mode a first visit gets; a saved choice always wins. */
    defaultMode?: 'light' | 'dark' | 'system'
  }>(),
  { docsUrl: undefined, devUrl: undefined, pageHeading: true, contained: true, defaultMode: 'dark' },
)

const { mode, set } = useColorMode(props.defaultMode)
const docs = computed(() => (props.docsUrl === false ? undefined : props.docsUrl || `https://docs.meddleware.co.uk/blockchain/sui/${props.slug}/`))
const dev = computed(() => (props.devUrl === false ? undefined : props.devUrl || `https://meddleware.dev/sui/${props.slug}/`))
</script>

<template>
  <UiAppShell :contained="contained">
    <template #header>
      <AppHeader variant="dark">
        <template #brand><slot name="brand"><BrandMark /> {{ title }}</slot></template>
        <template #actions>
          <slot name="actions" />
          <ColorModeControl :model-value="mode" @update:model-value="set" />
        </template>
      </AppHeader>
    </template>

    <h1 v-if="pageHeading" class="mw-visually-hidden">{{ title }}</h1>
    <slot />

    <template #footer>
      <AppFooter :docs-url="docs" :dev-url="dev">
        <template #start>
          <CopyrightLine symbol-variant="kopimi" organisation-name="Meddleware" rights-statement="jam" />
        </template>
        <slot name="footer-note" />
      </AppFooter>
    </template>
  </UiAppShell>
</template>
