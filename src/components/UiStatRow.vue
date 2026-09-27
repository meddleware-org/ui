<script setup lang="ts">
// A term/value pair inside UiStatGrid: a <dt>/<dd> fragment, so both land in the grid's two
// columns directly. `align` controls the value alignment (right by default; use 'left' for rich
// content like addresses).
withDefaults(defineProps<{ label: string; align?: 'left' | 'right' }>(), {
  align: 'right',
})
</script>

<template>
  <dt class="mw-stat-grid__label">{{ label }}</dt>
  <dd class="mw-stat-grid__value" :class="{ 'mw-stat-grid__value--left': align === 'left' }">
    <slot />
  </dd>
</template>

<style scoped>
.mw-stat-grid__label {
  color: var(--muted);
  white-space: nowrap;
}
.mw-stat-grid__value {
  margin: 0;
  font-family: var(--mw-font-mono);
  color: var(--text);
  text-align: right;
}
.mw-stat-grid__value--left {
  text-align: left;
}
</style>
