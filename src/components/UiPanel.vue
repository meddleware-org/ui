<script setup lang="ts">
// Titled content panel — the desktop-console surface primitive. Optional heading
// (via the `title` prop or the `head` slot) plus a body slot.
defineProps<{ title?: string }>()
</script>

<template>
  <div class="mw-panel">
    <div v-if="title || $slots.head" class="mw-panel__head">
      <slot name="head">{{ title }}</slot>
    </div>
    <div class="mw-panel__body"><slot /></div>
  </div>
</template>

<style scoped>
.mw-panel {
  border: 1px solid var(--border);
  border-radius: 2px;
  background: var(--surface);
  overflow: hidden;
}
.mw-panel__head {
  padding: 5px 10px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  background: var(--lift);
  border-bottom: 1px solid var(--border);
}
.mw-panel__body {
  padding: 10px;
}
</style>
