<script setup lang="ts">
// A message box: info, warning, error or success, with the ARIA role that matches how urgent it is (an error interrupts, the rest are polite,
// info has no role). The text keeps the body colour on every tone; only the border and the tint carry the tone (see the style notes).
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

// error is `alert` (assertive: it interrupts); ok and warning are `status` (polite); plain info announces nothing, because it is not news.
const role = computed(() => (props.type === 'error' ? 'alert' : props.type === 'ok' || props.type === 'warning' ? 'status' : undefined))
// Template: A <p> by default (phrasing content only); `as="div"` for a list or several paragraphs, which a <p> cannot hold.
</script>

<template>
  <component :is="as" class="mw-notice" :class="type !== 'info' ? `mw-notice--${type}` : ''" :role="role">
    <slot>{{ message }}</slot>
  </component>
</template>

<style scoped>
/* A thick left border is the tone's marker, so the message is recognisable by shape as well as by colour. */
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
/* Each tone sets its border colour and a faint tint of itself over the lift surface (8-12%, kept low so the --text colour stays AAA on it). */
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
