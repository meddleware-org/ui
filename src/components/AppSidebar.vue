<script setup lang="ts">
import { computed } from 'vue'
import { panelVars, type PanelVariant, type PanelColors } from '../internal/panel'

const props = withDefaults(
  defineProps<{
    /** light | dark | transparent — default dark (token defaults, overridable). */
    variant?: PanelVariant
    /** Per-instance colour overrides; token values are used by default. */
    colors?: PanelColors
    /** Sidebar width (CSS length, e.g. '280px'). Defaults to `--mw-sidebar-width` (240px). */
    width?: string
  }>(),
  { variant: 'dark' },
)

const panel = computed(() => panelVars(props.variant, props.colors) as Record<string, string>)
const sidebarWidth = computed(() => props.width ?? 'var(--mw-sidebar-width, 240px)')
</script>

<template>
  <!-- Only the navigation block is component-owned. head/body/foot slot content renders directly
       and styles itself; the nav grows to fill, so body/foot content settles at the bottom. -->
  <aside class="mw-sidebar" :class="`mw-sidebar--${variant}`">
    <slot name="head" />
    <nav class="mw-sidebar__nav" aria-label="Primary"><slot /></nav>
    <slot name="body" />
    <slot name="foot" />
  </aside>
</template>

<style scoped>
.mw-sidebar {
  /* Panel colour variables (variant defaults or per-instance overrides), bound from script. */
  --_bg: v-bind('panel["--_bg"]');
  --_surface: v-bind('panel["--_surface"]');
  --_text: v-bind('panel["--_text"]');
  --_muted: v-bind('panel["--_muted"]');
  --_border: v-bind('panel["--_border"]');
  --_ok: v-bind('panel["--_ok"]');
  --_danger: v-bind('panel["--_danger"]');
  --_info: v-bind('panel["--_info"]');
  height: 100%;
  display: flex;
  flex-direction: column;
  --_width: v-bind(sidebarWidth);
  width: var(--_width);
  background: var(--_bg);
  color: var(--_text);
  border-right: 1px solid var(--_border);
  font-family: var(--mw-font-sans);
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
