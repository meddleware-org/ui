<script setup lang="ts">
// Titled content panel — the desktop-console surface primitive. A <section> whose optional heading (the `title` prop or `title` slot) is
// a real heading element; body content sits directly in the section, and the heading bleeds to the panel edges via negative margins.
// `level` sets the heading rank (default h2) to fit the host page's outline.
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    /** The heading text; the `title` slot takes rich content instead. Without either, no heading is drawn. */
    title?: string
    /** The heading rank (default 2), chosen to fit the host page's outline. */
    level?: 2 | 3 | 4 | 5 | 6
  }>(),
  { level: 2 },
)
const slots = useSlots()
// A heading is drawn only when there is something to put in it: an empty heading is a heading-order and accessibility fault.
const hasTitle = computed(() => Boolean(props.title || slots.title))
// Template: A <section> whose heading names it; the dynamic `h{level}` keeps the page's heading outline in order wherever the panel is used.
</script>

<template>
  <section class="mw-panel">
    <component :is="`h${level}`" v-if="hasTitle" class="mw-panel__title">
      <slot name="title">{{ title }}</slot>
    </component>
    <slot />
  </section>
</template>

<style scoped>
/* The panel's surface: a token background and a divider-weight border (it is a container, not a control, so 3:1 is not required).
   `overflow: hidden` lets the heading's negative margins bleed to the rounded edges without a scrollbar. */
.mw-panel {
  padding: var(--space-xs);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  background: var(--surface);
  overflow: hidden;
}
/* The heading bleeds to the panel's edges (negative margins undo the panel's padding) and reads as a small caps label, not a page heading. */
.mw-panel__title {
  margin: calc(-1 * var(--space-xs)) calc(-1 * var(--space-xs)) var(--space-xs);
  padding: var(--space-3xs) var(--space-xs);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wide);
  line-height: inherit;
  text-transform: uppercase;
  /* --muted is AAA on the lift surface, so the label needs no opacity. */
  color: var(--muted);
  background: var(--lift);
  border-bottom: 1px solid var(--border);
}
</style>
