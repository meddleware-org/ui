<script setup lang="ts">
// Compact desktop-console toolbar button. Usable inside UiToolbar or standalone
// (e.g. table refresh / pagination controls).
</script>

<template>
  <button type="button" class="mw-toolbar-btn"><slot /></button>
</template>

<style scoped>
.mw-toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  height: 26px;
  font-size: 0.8rem;
  background: var(--lift);
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--text);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.1s, border-color 0.1s;
}
.mw-toolbar-btn:hover:not(:disabled) {
  background: var(--surface);
  border-color: var(--accent);
}
.mw-toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.mw-toolbar-btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}
</style>
