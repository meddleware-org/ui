<script setup lang="ts">
// "Skip to content": the first focusable element on the page, hidden until it takes focus, jumping to the main landmark (WCAG 2.4.1). It
// points at `#main`; a page whose landmark has another id passes `href="#its-id"` (it falls through to the link).
withDefaults(
  defineProps<{
    /** The link text (default `Skip to content`). */
    label?: string
  }>(),
  { label: 'Skip to content' },
)
// Template: Place it first in the document, before the header: it is only useful as the first Tab stop.
// Template: A plain in-page link: the first Tab stop, moving focus to #main (WCAG 2.4.1). A caller's own `href` falls through and replaces this one.
</script>

<template>
  <a class="mw-skip" href="#main">{{ label }}</a>
</template>

<style scoped>
/* Parked above the viewport until it takes focus (not display:none, which would remove it from the tab order). */
.mw-skip {
  position: absolute;
  inset-block-start: var(--space-2xs);
  inset-inline-start: var(--space-2xs);
  z-index: var(--z-skip);
  padding: var(--space-2xs) var(--space-xs);
  background: var(--accent);
  color: var(--accent-contrast);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
  transform: translateY(-200%);
}
/* On focus it slides into view; the accent pair is the fleet's AAA-checked button colour. */
.mw-skip:focus {
  transform: none;
}
</style>
