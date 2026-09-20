<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Visual style — primary (accent fill), secondary, ghost (outline), or danger (red). */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    /** HTML button type attribute. Use 'submit' inside forms; 'button' otherwise. */
    type?: 'button' | 'submit' | 'reset'
    /** When true, the button is rendered faded and blocks all interaction. */
    disabled?: boolean
  }>(),
  { variant: 'primary', type: 'button', disabled: false },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="mw-btn"
    :class="`mw-btn--${variant}`"
  >
    <slot />
  </button>
</template>

<style scoped>
.mw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2xs);
  padding: var(--space-2xs) var(--space-xs);
  border-radius: var(--radius);
  border: 1px solid transparent;
  font: inherit;
  font-weight: 550;
  cursor: pointer;
  transition:
    filter var(--transition-base),
    background var(--transition-base);
}
.mw-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.mw-btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.mw-btn--primary {
  background: var(--accent);
  color: var(--accent-contrast);
}
.mw-btn--primary:not(:disabled):hover {
  filter: brightness(1.08);
}
.mw-btn--secondary {
  background: var(--secondary);
  color: var(--secondary-contrast);
}
.mw-btn--secondary:not(:disabled):hover {
  filter: brightness(1.08);
}
.mw-btn--ghost {
  background: transparent;
  color: var(--text);
  border-color: var(--border);
}
.mw-btn--ghost:not(:disabled):hover {
  background: var(--lift);
}
.mw-btn--danger {
  background: var(--danger);
  color: var(--accent-contrast);
}
.mw-btn--danger:not(:disabled):hover {
  filter: brightness(1.08);
}
</style>
