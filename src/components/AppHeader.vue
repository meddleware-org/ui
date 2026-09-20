<script setup lang="ts">
import { computed } from 'vue'
import { panelVars, type PanelVariant, type PanelColors } from '../internal/panel'

const props = withDefaults(
  defineProps<{
    /** light | dark | transparent — default dark (token defaults, overridable). */
    variant?: PanelVariant
    /** Per-instance colour overrides; token values are used by default. */
    colors?: PanelColors
    /** Stick to the top of the viewport (full-width shells). */
    sticky?: boolean
  }>(),
  { variant: 'dark', sticky: true },
)

const styleVars = computed(() => panelVars(props.variant, props.colors))
</script>

<template>
  <header
    class="mw-header"
    :class="[`mw-header--${variant}`, { 'mw-header--sticky': sticky }]"
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
}
.mw-header--sticky {
  position: sticky;
  top: 0;
  z-index: 50;
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
