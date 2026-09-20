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

const styleVars = computed(() => {
  const vars = panelVars(props.variant, props.colors) as Record<string, string>
  if (props.width) vars['--mw-sidebar-width'] = props.width
  return vars
})
</script>

<template>
  <aside class="mw-sidebar" :class="`mw-sidebar--${variant}`" :style="styleVars">
    <div v-if="$slots.head" class="mw-sidebar__head"><slot name="head" /></div>
    <nav class="mw-sidebar__nav" aria-label="Primary"><slot /></nav>
    <div v-if="$slots.body" class="mw-sidebar__body"><slot name="body" /></div>
    <div v-if="$slots.foot" class="mw-sidebar__foot"><slot name="foot" /></div>
  </aside>
</template>

<style scoped>
.mw-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  width: var(--mw-sidebar-width, 240px);
  background: var(--_bg);
  color: var(--_text);
  border-right: 1px solid var(--_border);
  font-family: var(--mw-font-sans);
}
.mw-sidebar__head {
  padding: var(--space-sm);
  border-bottom: 1px solid var(--_border);
}
.mw-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-3xs);
  padding: var(--space-xs);
  flex: 1 1 auto;
  overflow-y: auto;
}
.mw-sidebar__body {
  flex-shrink: 0;
}

.mw-sidebar__foot {
  padding: var(--space-xs) var(--space-sm);
  border-top: 1px solid var(--_border);
  color: var(--_muted);
  font-size: var(--font-size-sm);
}
</style>
