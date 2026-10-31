<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /**
     * Semantic intent: colour and ARIA role.
     * - `'info'` (default): a neutral note.
     * - `'warning'`: caution; `role="status"` (polite).
     * - `'error'`: danger-coloured; `role="alert"` (assertive).
     * - `'ok'`: success-coloured; `role="status"`.
     */
    type?: 'info' | 'warning' | 'error' | 'ok'
    /** The message, for the common case of one sentence (instead of the default slot). */
    message?: string
    /** Root element: a `<p>` (default) holds phrasing content; use `div` for block content (lists, several paragraphs). */
    as?: 'p' | 'div'
  }>(),
  { type: 'info', as: 'p' },
)

const role = computed(() => (props.type === 'error' ? 'alert' : props.type === 'ok' || props.type === 'warning' ? 'status' : undefined))
</script>

<template>
  <component :is="as" class="mw-notice" :class="type !== 'info' ? `mw-notice--${type}` : ''" :role="role">
    <slot>{{ message }}</slot>
  </component>
</template>

<style scoped>
.mw-notice {
  margin: 0;
  padding: var(--space-2xs) var(--space-xs);
  border: 1px solid var(--border);
  border-left-width: var(--space-4xs);
  border-radius: var(--radius);
  background: var(--lift);
  /* The message stays in body colour on every tone: text drawn in the tone colour over a tint of that colour loses contrast. The tone is
     the border and the tint. */
  color: var(--text);
  font-size: var(--font-size-sm);
}
.mw-notice--error {
  border-left-color: var(--danger);
  background: color-mix(in srgb, var(--danger) 8%, var(--lift));
}
.mw-notice--ok {
  border-left-color: var(--ok);
  background: color-mix(in srgb, var(--ok) 8%, var(--lift));
}
.mw-notice--warning {
  border-left-color: var(--warning);
  background: color-mix(in srgb, var(--warning) 12%, var(--lift));
}
</style>
