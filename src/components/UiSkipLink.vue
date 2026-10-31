<script setup lang="ts">
// "Skip to content": the first focusable element on the page, hidden until it takes focus, jumping to the main landmark (WCAG 2.4.1). It
// points at `#main`; a page whose landmark has another id passes `href="#its-id"` (it falls through to the link).
withDefaults(defineProps<{ label?: string }>(), { label: 'Skip to content' })
</script>

<template>
  <a class="mw-skip" href="#main">{{ label }}</a>
</template>

<style scoped>
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
.mw-skip:focus {
  transform: none;
}
</style>
