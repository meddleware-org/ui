<script setup lang="ts">
// The primary navigation column. On wide screens it sits beside the content; below 45em it becomes a drawer built on the Popover API:
// the `<aside>` is a `popover`, opened by a menu button (`AppHeader`'s `sidebar-id`, or any `popovertarget`), dismissed by Escape or a
// click outside, and closed when an item inside is chosen. Give it an `id` (it falls through to the `<aside>`) so the button can find it.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePanelOverrides, type PanelVariant, type PanelColors } from '../internal/panel'

const props = withDefaults(
  defineProps<{
    /** light | dark | transparent — default dark (token defaults, overridable). */
    variant?: PanelVariant
    /** Per-instance colour overrides; token values are used by default. */
    colors?: PanelColors
    /** Sidebar width (CSS length, e.g. '280px'). Defaults to `--mw-sidebar-width` (240px). */
    width?: string
    /** Accessible name of the navigation landmark. */
    navLabel?: string
  }>(),
  { variant: 'dark', navLabel: 'Primary' },
)

const sidebarWidth = computed(() => props.width ?? 'var(--mw-sidebar-width)')

const aside = ref<HTMLElement | null>(null)
usePanelOverrides(aside, () => props.colors)

/** Choosing an item inside the open drawer closes it. */
function onClick(e: MouseEvent): void {
  const el = aside.value
  if (!el || !(e.target instanceof Element) || !e.target.closest('button, a[href]')) return
  if (typeof el.hidePopover === 'function' && el.matches(':popover-open')) el.hidePopover()
}
onMounted(() => aside.value?.addEventListener('click', onClick))
onBeforeUnmount(() => aside.value?.removeEventListener('click', onClick))

// Only the navigation block is component-owned. head/body/foot slot content renders directly and styles itself; the nav grows to fill, so
// body/foot content settles at the bottom.
</script>

<template>
  <aside ref="aside" class="mw-sidebar" :class="`mw-panel--${variant} mw-sidebar--${variant}`" popover="auto">
    <slot name="head" />
    <nav class="mw-sidebar__nav" :aria-label="navLabel"><slot /></nav>
    <slot name="body" />
    <slot name="foot" />
  </aside>
</template>

<style scoped>
.mw-sidebar {
  --_width: v-bind(sidebarWidth);
  /* A popover is `display: none` and positioned by the user agent; on wide screens it is just a column. */
  margin: 0;
  padding: 0;
  border: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  width: var(--_width);
  background: var(--_bg);
  color: var(--_text);
  border-right: 1px solid var(--_border);
  font-family: var(--mw-font-sans);
  /* Not clipped: the drawer behaves as a column here. */
  overflow: visible;
  inset: auto;
  position: static;
}
.mw-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-3xs);
  /* Vertical padding only — items span the full width so their hover/active highlight bleeds
     edge-to-edge. Each SidebarItem provides its own horizontal padding for text inset. */
  padding: var(--space-xs) 0;
  flex: 1 1 auto;
  overflow-y: auto;
}

/* Below 45em: the drawer. Fixed to the inline start, over the page, in the top layer while open. */
@media (width < 45em) {
  .mw-sidebar:not(:popover-open) {
    display: none;
  }
  .mw-sidebar:popover-open {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(var(--_width), 85vw);
    height: 100dvh;
    box-shadow: var(--shadow-3);
  }
  .mw-sidebar::backdrop {
    background: var(--backdrop);
  }
}

/* Links the host slots into the sidebar take the sidebar's own text colour, not the page accent. */
.mw-sidebar :slotted(a) {
  color: inherit;
}

/* Status text inside a light/dark panel uses the panel's own legible status colours. */
.mw-sidebar:not(.mw-sidebar--transparent) {
  --ok: var(--_ok);
  --danger: var(--_danger);
  --info: var(--_info);
}
</style>
