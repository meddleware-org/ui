<script setup lang="ts">
// Desktop-console top toolbar container. Holds UiToolbarButton(s) and separators.
</script>

<template>
  <div class="mw-toolbar"><slot /></div>
</template>

<style scoped>
.mw-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
}
</style>
