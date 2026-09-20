<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /**
   * Semantic intent — controls colour and ARIA role.
   * - `'info'` (default): neutral informational note.
   * - `'error'`: danger-coloured, sets `role="alert"` for assistive technologies.
   * - `'ok'`: success-coloured, sets `role="status"`.
   */
  type?: 'info' | 'error' | 'ok'
}>()

const role = computed(() => {
  if (props.type === 'error') return 'alert'
  if (props.type === 'ok') return 'status'
  return undefined
})
</script>

<template>
  <p class="mw-notice" :class="type && type !== 'info' ? `mw-notice--${type}` : ''" :role="role">
    <slot />
  </p>
</template>

<style scoped>
.mw-notice {
  margin: 0;
  padding: var(--space-2xs) var(--space-xs);
  border: 1px solid var(--border);
  border-left-width: 3px;
  border-radius: var(--radius);
  background: var(--lift);
  color: var(--text);
  font-size: var(--font-size-sm);
}
.mw-notice--error {
  border-left-color: var(--danger);
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 8%, transparent);
}
.mw-notice--ok {
  border-left-color: var(--ok);
  color: var(--ok);
  background: color-mix(in srgb, var(--ok) 8%, transparent);
}
</style>
