<script setup lang="ts">
import { computed } from 'vue'
import { panelVars, type PanelVariant, type PanelColors } from '../internal/panel'

const props = withDefaults(
  defineProps<{
    /** light | dark | transparent — default transparent (footers sit over the page background). */
    variant?: PanelVariant
    /** Per-instance colour overrides; token values are used by default. */
    colors?: PanelColors
    /**
     * When set, renders a "Documentation" link pointing at this URL.
     * Use `VITE_DOCS_URL` in the consuming app to make this configurable per deployment.
     */
    docsUrl?: string
  }>(),
  { variant: 'transparent' },
)

const styleVars = computed(() => panelVars(props.variant, props.colors))
</script>

<template>
  <footer class="mw-footer" :class="`mw-footer--${variant}`" :style="styleVars">
    <div class="mw-footer__start"><slot name="start" /></div>
    <div class="mw-footer__center"><slot /></div>
    <div class="mw-footer__end">
      <slot name="end" />
      <a
        v-if="docsUrl"
        :href="docsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="mw-footer__docs-link"
      >Documentation</a>
    </div>
  </footer>
</template>

<style scoped>
.mw-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.75rem 1rem;
  background: var(--_bg);
  color: var(--_muted);
  border-top: 1px solid var(--_border);
  font-family: var(--mw-font-sans);
  font-size: 0.85rem;
}
.mw-footer--transparent {
  border-top: 1px solid var(--border);
}
.mw-footer__center {
  flex: 1 1 auto;
  min-width: 0;
}
.mw-footer__end {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}
.mw-footer__docs-link {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.7;
}
.mw-footer__docs-link:hover {
  opacity: 1;
}
</style>
