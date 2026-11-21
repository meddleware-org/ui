<script setup lang="ts">
// Panel for one AppTabNav tab. Pass the tab set's `idPrefix` and the `tab` id this panel shows
// (usually the active one) so it is labelled by — and controlled from — the matching tab.
// Focusable (tabindex 0) per the WAI-ARIA tabs pattern, so keyboard users can move from the tab
// list into panels whose first content is not itself focusable.
import { computed } from 'vue'
import { tabIds } from '../tabs.js'

const props = defineProps<{
  /** The tab set's id prefix (the same one AppTabNav was given). */
  idPrefix: string
  /** The id of the tab this panel shows. */
  tab: string
}>()
// The ids come from one function (`tabs.ts`) shared with AppTabNav, so the tab's `aria-controls` and this panel's id cannot drift apart.
const ids = computed(() => tabIds(props.idPrefix, props.tab))
// Template: role=tabpanel labelled by its tab, and focusable so a keyboard user can leave the tab list into a panel with no focusable first child.
</script>

<template>
  <section :id="ids.panel" role="tabpanel" :aria-labelledby="ids.tab" tabindex="0" class="mw-tab-panel">
    <slot />
  </section>
</template>

<style scoped>
/* The panel is a tab stop, so it shows focus; inset so the ring is not clipped by a scrolling parent. */
.mw-tab-panel:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
</style>
