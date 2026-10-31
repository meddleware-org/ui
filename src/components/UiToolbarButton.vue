<script setup lang="ts">
// Compact desktop-console toolbar button. Usable inside UiToolbar or standalone (e.g. table refresh / pagination controls).
</script>

<template>
  <button type="button" class="mw-toolbar-btn"><slot /></button>
</template>

<style scoped>
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
  transition: background var(--duration-fast), border-color var(--duration-fast);
}
.mw-toolbar-btn:hover:not(:disabled) {
  background: var(--surface);
  border-color: var(--accent);
}
.mw-toolbar-btn:disabled {
  filter: grayscale(0.6);
  cursor: not-allowed;
}
.mw-toolbar-btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}
</style>
