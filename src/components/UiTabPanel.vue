<script setup lang="ts">
// Panel for one AppTabNav tab. Pass the tab set's `idPrefix` and the `tab` id this panel shows
// (usually the active one) so it is labelled by — and controlled from — the matching tab.
// Focusable (tabindex 0) per the WAI-ARIA tabs pattern, so keyboard users can move from the tab
// list into panels whose first content is not itself focusable.
import { computed } from 'vue'
import { tabIds } from '../tabs.js'

const props = defineProps<{ idPrefix: string; tab: string }>()
const ids = computed(() => tabIds(props.idPrefix, props.tab))
</script>

<template>
  <section :id="ids.panel" role="tabpanel" :aria-labelledby="ids.tab" tabindex="0" class="mw-tab-panel">
    <slot />
  </section>
</template>

<style scoped>
.mw-tab-panel:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
</style>
