<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { usePanelOverrides, type PanelVariant, type PanelColors } from '../internal/panel'

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
    /**
     * The `id` of an AppSidebar. When set, a menu button appears on narrow screens (below 45em) that opens the sidebar as a drawer;
     * on wide screens the sidebar is always visible and the button is hidden.
     */
    sidebarId?: string
    /** Accessible name of the menu button. */
    menuLabel?: string
  }>(),
  { variant: 'dark', sticky: true, solidifyOnScroll: false, menuLabel: 'Menu' },
)


const root = ref<HTMLElement | null>(null)
usePanelOverrides(root, () => props.colors)

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
    ref="root"
    class="mw-header"
    :class="[
      `mw-panel--${variant}`,
      `mw-header--${variant}`,
      { 'mw-header--sticky': sticky, 'mw-header--scrolled': solidifyOnScroll && scrolled },
    ]"
   
  >
    <!-- The default and actions slots render directly (no layout wrappers). The brand slot sits in one element, whatever it holds
         (plain text or a link): it takes the brand typography and pushes everything after it to the inline end. Default-slot content that
         should fill the gap sets its own `flex: 1`. -->
    <button v-if="sidebarId" type="button" class="mw-header__menu" :popovertarget="sidebarId" :aria-label="menuLabel">
      <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <span v-if="$slots.brand" class="mw-header__brand"><slot name="brand" /></span>
    <slot />
    <slot name="actions" />
  </header>
</template>

<style scoped>
.mw-header {
  display: flex;
  align-items: center;
  gap: var(--space-2xs);
  /* At least the header height; a larger text size or a narrow screen wraps the actions onto a second row rather than overflowing. */
  flex-wrap: wrap;
  min-height: var(--mw-header-height);
  padding: var(--space-4xs) var(--space-sm);
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
  z-index: var(--z-header);
}
/* Frosted, legible background once scrolled — keeps the whole header (background
   included) visually "stuck" while remaining light over a hero at the top. */
.mw-header--scrolled {
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(var(--space-2xs));
  border-bottom-color: var(--border);
  box-shadow: var(--shadow-1);
}
.mw-header__brand {
  display: flex;
  align-items: center;
  gap: var(--space-2xs);
  margin-inline-end: auto;
  font-weight: var(--font-weight-brand);
  letter-spacing: var(--tracking-wide);
  white-space: nowrap;
  text-decoration: none;
}
/* Links the host slots into the header take the header's own text colour, not the page accent: a light
   header on a dark page would otherwise draw the dark theme's accent on white. */
.mw-header :slotted(a) {
  color: inherit;
}

/* The menu button opens the sidebar drawer; it only exists below the width at which the sidebar stops fitting beside the content. */
.mw-header__menu {
  display: none;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xs);
  border: 1px solid var(--_border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.mw-header__menu:hover {
  background: color-mix(in srgb, currentColor 12%, transparent);
}
@media (width < 45em) {
  .mw-header__menu {
    display: inline-flex;
  }
}

/* Status text inside a light/dark panel uses the panel's own legible status colours. */
.mw-header:not(.mw-header--transparent) {
  --ok: var(--_ok);
  --danger: var(--_danger);
  --info: var(--_info);
}
</style>
