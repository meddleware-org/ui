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
// `VITE_DOCS_URL` / `VITE_DEV_URL` build values).
import { computed } from 'vue'
import AppFooter from './AppFooter.vue'
import AppHeader from './AppHeader.vue'
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
    docsUrl?: string
    devUrl?: string
    /** The colour mode a first visit gets; a saved choice always wins. */
    defaultMode?: 'light' | 'dark' | 'system'
  }>(),
  { docsUrl: undefined, devUrl: undefined, defaultMode: 'dark' },
)

const { mode, set } = useColorMode(props.defaultMode)
const docs = computed(() => props.docsUrl || `https://docs.meddleware.co.uk/blockchain/sui/${props.slug}/`)
const dev = computed(() => props.devUrl || `https://meddleware.dev/sui/${props.slug}/`)
</script>

<template>
  <UiAppShell contained>
    <template #header>
      <AppHeader variant="dark">
        <template #brand><slot name="brand">{{ title }}</slot></template>
        <template #actions>
          <slot name="actions" />
          <ColorModeControl :model-value="mode" @update:model-value="set" />
        </template>
      </AppHeader>
    </template>

    <h1 class="mw-visually-hidden">{{ title }}</h1>
    <slot />

    <template #footer>
      <AppFooter :docs-url="docs" :dev-url="dev">
        <template #start>
          <CopyrightLine symbol-variant="kopimi" organisation-name="Meddleware" rights-statement="jam" />
        </template>
      </AppFooter>
    </template>
  </UiAppShell>
</template>
