<script setup lang="ts">
// Bottom status bar for the desktop-console layout. Monospace, muted, sticky to
// the bottom of its scroll container. Compose items (with UiStatusDot) in the slot.
</script>

<template>
  <footer class="mw-statusbar"><slot /></footer>
</template>

<style scoped>
.mw-statusbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 3px 12px;
  font-size: 0.72rem;
  color: var(--muted);
  background: var(--surface);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  font-family: var(--mw-font-mono);
  position: sticky;
  bottom: 0;
  z-index: 1;
}
.mw-statusbar :deep(.mw-statusbar__item) {
  display: flex;
  align-items: center;
}
.mw-statusbar :deep(.mw-statusbar__sep) {
  color: var(--border);
}
</style>
