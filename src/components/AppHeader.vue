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

const styleVars = computed(() => panelVars(props.variant, props.colors))

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
    :style="styleVars"
  >
    <div class="mw-header__brand"><slot name="brand" /></div>
    <div class="mw-header__center"><slot /></div>
    <div class="mw-header__actions"><slot name="actions" /></div>
  </header>
</template>

<style scoped>
.mw-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
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
.mw-header__brand {
  display: flex;
  align-items: center;
  gap: var(--space-2xs);
  font-weight: 650;
  letter-spacing: var(--tracking-wide);
  white-space: nowrap;
}
.mw-header__center {
  flex: 1 1 auto;
  min-width: 0;
}
.mw-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2xs);
  margin-left: auto;
}
</style>
