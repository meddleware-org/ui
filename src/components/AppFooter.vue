<script setup lang="ts">
import { computed } from 'vue'
import { panelVars, type PanelVariant, type PanelColors } from '../internal/panel'
import { safeHref } from '../safe-href.js'

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

const panel = computed(() => panelVars(props.variant, props.colors) as Record<string, string>)
</script>

<template>
  <footer class="mw-footer" :class="`mw-footer--${variant}`">
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
        aria-label="Developer documentation"
      >Developer docs</a>
    </nav>
  </footer>
</template>

<style scoped>
.mw-footer {
  /* Panel colour variables (variant defaults or per-instance overrides), bound from script. */
  --_bg: v-bind('panel["--_bg"]');
  --_surface: v-bind('panel["--_surface"]');
  --_text: v-bind('panel["--_text"]');
  --_muted: v-bind('panel["--_muted"]');
  --_border: v-bind('panel["--_border"]');
  --_ok: v-bind('panel["--_ok"]');
  --_danger: v-bind('panel["--_danger"]');
  --_info: v-bind('panel["--_info"]');
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
  align-items: center;
  gap: var(--space-sm);
  margin-inline-start: auto;
}
.mw-footer__docs a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.7;
}
.mw-footer__docs a:hover {
  opacity: 1;
}

/* Status text inside a light/dark panel uses the panel's own legible status colours. */
.mw-footer:not(.mw-footer--transparent) {
  --ok: var(--_ok);
  --danger: var(--_danger);
  --info: var(--_info);
}
</style>
