<script setup lang="ts">
import { ref } from 'vue'
import { usePanelOverrides, type PanelVariant, type PanelColors } from '../internal/panel'
import { safeHref } from '@meddleware/web-utils'

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
    /**
     * When set, renders a "Developer docs" link pointing at this URL.
     * Use `VITE_DEV_URL` in the consuming app to make this configurable per deployment.
     */
    devUrl?: string
  }>(),
  { variant: 'transparent' },
)

const root = ref<HTMLElement | null>(null)
usePanelOverrides(root, () => props.colors)

</script>

<template>
  <footer ref="root" class="mw-footer" :class="`mw-panel--${variant} mw-footer--${variant}`">
    <!-- Slots render directly (no layout wrappers); consumers style their own content. Only the
         component-owned documentation links are grouped, as a navigation block at the inline end. -->
    <slot name="start" />
    <slot />
    <slot name="end" />
    <nav v-if="docsUrl || devUrl" class="mw-footer__docs" aria-label="Documentation">
      <a
        v-if="docsUrl"
        :href="safeHref(docsUrl)"
        target="_blank"
        rel="noopener noreferrer"
      >Documentation</a>
      <a
        v-if="devUrl"
        :href="safeHref(devUrl)"
        target="_blank"
        rel="noopener noreferrer"
      >Developer docs</a>
    </nav>
  </footer>
</template>

<style scoped>
.mw-footer {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
  padding: var(--space-xs) var(--space-sm);
  background: var(--_bg);
  color: var(--_muted);
  border-top: 1px solid var(--_border);
  font-family: var(--mw-font-sans);
  font-size: var(--font-size-sm);
}
.mw-footer--transparent {
  border-top: 1px solid var(--border);
}
.mw-footer__docs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2xs) var(--space-sm);
  margin-inline-start: auto;
  max-inline-size: 100%;
}
.mw-footer__docs a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}
.mw-footer__docs a:hover {
  text-decoration-thickness: 0.14em;
}
/* Links the host slots into the footer take the footer's own text colour, not the page accent. */
.mw-footer :slotted(a) {
  color: inherit;
}

/* Status text inside a light/dark panel uses the panel's own legible status colours. */
.mw-footer:not(.mw-footer--transparent) {
  --ok: var(--_ok);
  --danger: var(--_danger);
  --info: var(--_info);
}
</style>
