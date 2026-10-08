<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { panelVars, type PanelVariant, type PanelColors } from '../internal/panel'

const props = withDefaults(
  defineProps<{
    /** light | dark | transparent — default dark (token defaults, overridable). */
    variant?: PanelVariant
    /** Per-instance colour overrides; token values are used by default. */
    colors?: PanelColors
    /** Stick to the top of the viewport (full-width shells). */
    sticky?: boolean
    /**
     * Solidify a transparent header on scroll: while at the top the header stays
     * see-through (e.g. over a hero); once the page scrolls it fades in a frosted
     * background so the brand/nav stay legible. No-op unless the header scrolls.
     */
    solidifyOnScroll?: boolean
  }>(),
  { variant: 'dark', sticky: true, solidifyOnScroll: false },
)

const panel = computed(() => panelVars(props.variant, props.colors) as Record<string, string>)

// Track scroll position only when solidify-on-scroll is requested.
const scrolled = ref(false)
let onScroll: (() => void) | null = null
onMounted(() => {
  if (!props.solidifyOnScroll || typeof window === 'undefined') return
  onScroll = () => {
    scrolled.value = window.scrollY > 8
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  if (onScroll) window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header
    class="mw-header"
    :class="[
      `mw-header--${variant}`,
      { 'mw-header--sticky': sticky, 'mw-header--scrolled': solidifyOnScroll && scrolled },
    ]"
  >
    <!-- Slots render directly (no layout wrappers). Contract: the brand slot's single element is
         the header's first child — it takes the brand typography and pushes everything after it to
         the inline end. Default-slot content that should fill the gap sets its own `flex: 1`. -->
    <slot name="brand" />
    <slot />
    <slot name="actions" />
  </header>
</template>

<style scoped>
.mw-header {
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
  gap: var(--space-2xs);
  height: var(--mw-header-height, 56px);
  padding: 0 var(--space-sm);
  background: var(--_bg);
  color: var(--_text);
  border-bottom: 1px solid var(--_border);
  font-family: var(--mw-font-sans);
  transition: background var(--transition-base), backdrop-filter var(--transition-base),
    border-color var(--transition-base), box-shadow var(--transition-base);
}
.mw-header--sticky {
  position: sticky;
  top: 0;
  z-index: 50;
}
/* Frosted, legible background once scrolled — keeps the whole header (background
   included) visually "stuck" while remaining light over a hero at the top. */
.mw-header--scrolled {
  background: color-mix(in srgb, var(--_bg-solid, var(--bg)) 82%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom-color: var(--border);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--border) 60%, transparent);
}
.mw-header > :slotted(:first-child) {
  display: flex;
  align-items: center;
  gap: var(--space-2xs);
  margin-inline-end: auto;
  font-weight: 650;
  letter-spacing: var(--tracking-wide);
  white-space: nowrap;
  text-decoration: none;
}
/* Links the host slots into the header take the header's own text colour, not the page accent: a light
   header on a dark page would otherwise draw the dark theme's accent on white. */
.mw-header :slotted(a) {
  color: inherit;
}

/* Status text inside a light/dark panel uses the panel's own legible status colours. */
.mw-header:not(.mw-header--transparent) {
  --ok: var(--_ok);
  --danger: var(--_danger);
  --info: var(--_info);
}
</style>
