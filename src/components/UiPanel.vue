<script setup lang="ts">
// Titled content panel — the desktop-console surface primitive. A <section> whose optional heading (the `title` prop or `title` slot) is
// a real heading element; body content sits directly in the section, and the heading bleeds to the panel edges via negative margins.
// `level` sets the heading rank (default h2) to fit the host page's outline.
import { computed, useSlots } from 'vue'

const props = withDefaults(defineProps<{ title?: string; level?: 2 | 3 | 4 | 5 | 6 }>(), { level: 2 })
const slots = useSlots()
const hasTitle = computed(() => Boolean(props.title || slots.title))
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
.mw-panel {
  padding: var(--space-xs);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  background: var(--surface);
  overflow: hidden;
}
.mw-panel__title {
  margin: calc(-1 * var(--space-xs)) calc(-1 * var(--space-xs)) var(--space-xs);
  padding: var(--space-3xs) var(--space-xs);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wide);
  line-height: inherit;
  text-transform: uppercase;
  color: var(--muted);
  background: var(--lift);
  border-bottom: 1px solid var(--border);
}
</style>
