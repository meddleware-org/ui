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

// A native group for the three mode buttons: the fieldset carries the pill styling and the (visually hidden) legend names the group.
</script>

<template>
  <fieldset class="mw-mode">
    <legend class="mw-visually-hidden">Colour mode</legend>
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
      <!-- Inline icons, not text glyphs: the monitor and moon characters depend on the font a device has. -->
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <template v-if="m === 'light'">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </template>
        <path v-else-if="m === 'dark'" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        <template v-else>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </template>
      </svg>
      <span class="mw-mode__label">{{ LABEL[m] }}</span>
    </button>
  </fieldset>
</template>

<style scoped>
.mw-mode {
  display: inline-flex;
  margin: 0;
  min-inline-size: 0;
  gap: var(--space-4xs);
  padding: var(--space-4xs);
  border: 1px solid var(--_border, var(--border));
  border-radius: var(--radius);
}
.mw-mode__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3xs);
  padding: var(--space-3xs) var(--space-2xs);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--_muted, var(--muted));
  font: inherit;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: color var(--transition-base), background var(--transition-base);
}
.mw-mode__btn:hover {
  color: var(--_text, var(--text));
}
.mw-mode__btn.is-active {
  color: var(--_text, var(--text));
  background: color-mix(in srgb, var(--_text, var(--text)) 14%, transparent);
}
.mw-mode__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}
/* Forced colours (Windows High Contrast) drop backgrounds, so the chosen mode needs an edge of its own. */
@media (forced-colors: active) {
  .mw-mode__btn.is-active {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
}
/* Collapse labels on narrow controls — glyph only. */
@media (width < 40em) {
  .mw-mode__label {
    display: none;
  }
}
</style>
