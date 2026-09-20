<script setup lang="ts">
import type { ColorMode } from '../composables/useColorMode'

/**
 * Presentational light/dark/system control. It owns NO state — bind it with
 * `v-model` (or `:modelValue` + `@update:modelValue`) to external state, e.g.
 * the `useColorMode()` composable or your store.
 */
withDefaults(
  defineProps<{
    /** The currently selected colour mode (`v-model`). */
    modelValue: ColorMode
    /** Which modes to offer (default all three). */
    modes?: ColorMode[]
  }>(),
  { modes: () => ['light', 'dark', 'system'] },
)

defineEmits<{ 'update:modelValue': [ColorMode] }>()

const LABEL: Record<ColorMode, string> = { light: 'Light', dark: 'Dark', system: 'System' }
const GLYPH: Record<ColorMode, string> = { light: '☀', dark: '☾', system: '🖵' }
</script>

<template>
  <div class="mw-mode" role="group" aria-label="Colour mode">
    <button
      v-for="m in modes"
      :key="m"
      type="button"
      class="mw-mode__btn"
      :class="{ 'is-active': modelValue === m }"
      :aria-pressed="modelValue === m"
      :title="LABEL[m]"
      @click="$emit('update:modelValue', m)"
    >
      <span aria-hidden="true">{{ GLYPH[m] }}</span>
      <span class="mw-mode__label">{{ LABEL[m] }}</span>
    </button>
  </div>
</template>

<style scoped>
.mw-mode {
  display: inline-flex;
  /* 2px hairlines sit below the Fibonacci spacing floor (0.25rem) — kept literal by intent. */
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--_border, var(--border));
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--_text, var(--text)) 6%, transparent);
}
.mw-mode__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3xs);
  padding: var(--space-3xs) var(--space-2xs);
  border: 0;
  border-radius: calc(var(--radius) - 3px);
  background: transparent;
  color: var(--_text, var(--text));
  font: inherit;
  font-size: var(--font-size-sm);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(--transition-base), background var(--transition-base);
}
.mw-mode__btn:hover {
  opacity: 1;
}
.mw-mode__btn.is-active {
  opacity: 1;
  background: color-mix(in srgb, var(--_text, var(--text)) 14%, transparent);
}
.mw-mode__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}
/* Collapse labels on narrow controls — glyph only. */
@media (max-width: 640px) {
  .mw-mode__label {
    display: none;
  }
}
</style>
