<script setup lang="ts">
// Compact desktop-console toolbar button. Usable inside UiToolbar or standalone (e.g. table refresh / pagination controls).
// It is deliberately a bare button: the label is the slot, a click is the caller's `@click` (it falls through to the <button>), and the
// disabled state is the native `disabled` attribute, so the browser handles focus, keyboard activation and the accessibility tree.
// Template: type=button so it never submits a form it happens to sit in.
</script>

<template>
  <button type="button" class="mw-toolbar-btn"><slot /></button>
</template>

<style scoped>
/* A compact button for dense desktop toolbars; the minimum height keeps the target above the 24px WCAG 2.5.8 floor. */
.mw-toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3xs);
  padding: var(--space-3xs) var(--space-2xs);
  min-height: var(--space-md);
  font-size: var(--font-size-sm);
  background: var(--lift);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  color: var(--text);
  cursor: pointer;
  white-space: nowrap;
  /* Only the properties that change on hover transition; the duration token is zeroed under prefers-reduced-motion by the reset. */
  transition: background var(--duration-fast), border-color var(--duration-fast);
}
/* Hover swaps the fill and shows the accent edge; the label keeps --text, so contrast never depends on the hover state. */
.mw-toolbar-btn:hover:not(:disabled) {
  background: var(--surface);
  border-color: var(--accent);
}
/* Greyed with a filter, not opacity (opacity on text takes it below the contrast floor). */
.mw-toolbar-btn:disabled {
  filter: grayscale(0.6);
  cursor: not-allowed;
}
/* Keyboard focus ring in the fleet's focus colour. */
.mw-toolbar-btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}
</style>
