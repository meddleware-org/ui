<script setup lang="ts">
// A term/value pair inside UiStatGrid: a <dt>/<dd> fragment, so both land in the grid's two columns directly. `align` controls the value
// alignment (right by default; use 'left' for rich content like addresses).
//
// The component has two root elements, so Vue cannot pick where fallthrough attributes go. `class` and `id` are applied to the value
// (`<dd>`) explicitly; other attributes are not forwarded.
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const valueId = computed(() => attrs.id as string | undefined)
const valueClass = computed(() => attrs.class)
withDefaults(defineProps<{ label: string; align?: 'left' | 'right' }>(), {
  align: 'right',
})
</script>

<template>
  <dt class="mw-stat-grid__label">{{ label }}</dt>
  <dd :id="valueId" class="mw-stat-grid__value" :class="[valueClass, { 'mw-stat-grid__value--left': align === 'left' }]">
    <slot />
  </dd>
</template>

<style scoped>
.mw-stat-grid__label {
  color: var(--muted);
  overflow-wrap: anywhere;
}
.mw-stat-grid__value {
  margin: 0;
  font-family: var(--mw-font-mono);
  color: var(--text);
  text-align: right;
  overflow-wrap: anywhere; /* an id or a hash wraps instead of widening the page */
}
.mw-stat-grid__value--left {
  text-align: left;
}
</style>
