<script setup lang="ts">
// A label/value pair inside UiStatGrid. Renders as two sibling grid cells (a
// fragment) so the label and value land in the grid's two columns directly.
// `align` controls the value alignment (right by default; use 'left' for rich
// content like addresses).
withDefaults(defineProps<{ label: string; align?: 'left' | 'right' }>(), {
  align: 'right',
})
</script>

<template>
  <span class="mw-stat-grid__label">{{ label }}</span>
  <span class="mw-stat-grid__value" :class="{ 'mw-stat-grid__value--left': align === 'left' }">
    <slot />
  </span>
</template>

<style scoped>
.mw-stat-grid__label {
  color: var(--muted);
  white-space: nowrap;
}
.mw-stat-grid__value {
  font-family: var(--mw-font-mono);
  color: var(--text);
  text-align: right;
}
.mw-stat-grid__value--left {
  text-align: left;
}
</style>
