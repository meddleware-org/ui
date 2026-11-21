<script setup lang="ts">
// A term/value pair inside UiStatGrid: a <dt>/<dd> fragment, so both land in the grid's two columns directly. `align` controls the value
// alignment (right by default; use 'left' for rich content like addresses).
//
// The component has two root elements, so Vue cannot pick where fallthrough attributes go. `class` and `id` are applied to the value
// (`<dd>`) explicitly; other attributes are not forwarded.
import { computed, useAttrs } from 'vue'

// Two root elements, so Vue cannot choose where fallthrough attributes go: turn the automatic fallthrough off and apply two of them by hand.
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
/** The caller's `id`, put on the value so a control elsewhere can be described by it (`aria-describedby`). */
const valueId = computed(() => attrs.id as string | undefined)
/** The caller's `class`, put on the value so a row can be styled from outside. */
const valueClass = computed(() => attrs.class)
withDefaults(
  defineProps<{
    /** The term (the `<dt>`). */
    label: string
    /** Value alignment: right (default) for figures, left for rich content such as addresses. */
    align?: 'left' | 'right'
  }>(),
  { align: 'right' },
)
// Template: A <dt>/<dd> pair with no wrapper: a <div> wrapper is valid in a description list, but it would be one grid item and break the two columns.
</script>

<template>
  <dt class="mw-stat-grid__label">{{ label }}</dt>
  <dd :id="valueId" class="mw-stat-grid__value" :class="[valueClass, { 'mw-stat-grid__value--left': align === 'left' }]">
    <slot />
  </dd>
</template>

<style scoped>
/* The label is muted (AAA) and may wrap anywhere so a long label cannot widen the grid's label column. */
.mw-stat-grid__label {
  color: var(--muted);
  overflow-wrap: anywhere;
}
/* The value is monospace (ids, hashes, amounts), reset of the browser's <dd> indent, and right-aligned by default. */
.mw-stat-grid__value {
  margin: 0;
  font-family: var(--mw-font-mono);
  color: var(--text);
  text-align: right;
  overflow-wrap: anywhere; /* an id or a hash wraps instead of widening the page */
}
/* `align="left"` for rich content (an address with a copy button). */
.mw-stat-grid__value--left {
  text-align: left;
}
</style>
