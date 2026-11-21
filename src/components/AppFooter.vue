<script setup lang="ts">
// The page footer: a flexible row for the page's own content (`start`, default and `end` slots) and, when URLs are given, a "Documentation"
// and a "Developer docs" link at the inline end. It is a panel (light, dark or transparent over the page), so it takes its colours from the
// same `--_*` overrides as the sidebar and the header. Content in the slots renders directly: the caller owns its layout.
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

// Applies the caller's colour overrides as custom properties on the footer element (see internal/panel.ts).
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
    <!-- External links: the URLs go through `safeHref` (https only), and target=_blank carries noopener and noreferrer. -->
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
/* A wrapping row: at a large text size the content and the docs links stack instead of running off the screen. The colours are the panel's. */
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
/* Over the page background the panel colours are transparent, so the rule above the footer uses the page's own divider. */
.mw-footer--transparent {
  border-top: 1px solid var(--border);
}
/* The docs links are pushed to the inline end (`margin-inline-start: auto`) and wrap rather than overflow. */
.mw-footer__docs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2xs) var(--space-sm);
  margin-inline-start: auto;
  max-inline-size: 100%;
}
/* Underlined and in the footer's own colour: the underline, not the colour, marks them as links; hover thickens it. */
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
