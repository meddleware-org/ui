<script setup lang="ts">
// The company mark: the Kopimi "K" (public domain; see src/brand/README.md). Decorative by default: put the name beside it, or pass `label`
// when the mark stands alone. It is drawn in `currentColor`, so it takes the accent (or any colour) of its context, in either colour mode; its
// size follows the text (1em tall) unless the container sets `--mw-brand-size`.
import { MARK_PATH, MARK_VIEW_BOX } from '../brand/mark'

// The mark's geometry comes from `brand/mark.ts`, which is generated from the vendored SVG (never edited by hand).
defineProps<{
  /** An accessible name, for a mark that stands alone. Without it the mark is hidden from assistive technology. */
  label?: string
}>()
// Template: An inline SVG so it inherits `currentColor` (a background-image could not). With a label it is an image; without one it is hidden from assistive technology because the name sits beside it. `focusable=false` keeps old Edge and IE from making it a tab stop.
</script>

<template>
  <svg
    class="mw-brand-mark"
    :viewBox="MARK_VIEW_BOX"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
  >
    <path :d="MARK_PATH" fill="currentColor" fill-rule="evenodd" />
  </svg>
</template>

<style scoped>
/* 1em square by default, so it scales with the text it sits in; a container overrides the size with --mw-brand-size. */
.mw-brand-mark {
  inline-size: var(--mw-brand-size, 1em);
  block-size: var(--mw-brand-size, 1em);
  display: inline-block; /* the reset makes svg a block, which would put the mark on a line of its own beside the title */
  flex: none;
  vertical-align: -0.125em;
}
</style>
