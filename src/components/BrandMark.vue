<script setup lang="ts">
// The company mark: the Kopimi "K" (public domain; see src/brand/README.md). Decorative by default: put the name beside it, or pass `label`
// when the mark stands alone. It is drawn in `currentColor`, so it takes the accent (or any colour) of its context, in either colour mode; its
// size follows the text (1em tall) unless the container sets `--mw-brand-size`.
import { MARK_PATH, MARK_VIEW_BOX } from '../brand/mark'

defineProps<{
  /** An accessible name, for a mark that stands alone. Without it the mark is hidden from assistive technology. */
  label?: string
}>()
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
.mw-brand-mark {
  inline-size: var(--mw-brand-size, 1em);
  block-size: var(--mw-brand-size, 1em);
  display: inline-block; /* the reset makes svg a block, which would put the mark on a line of its own beside the title */
  flex: none;
  vertical-align: -0.125em;
}
</style>
