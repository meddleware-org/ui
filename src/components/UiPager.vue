<script setup lang="ts">
// Previous / next controls for a keyset-paginated list (pair with `usePager`). The current page is announced politely as it changes.
import UiButton from './UiButton.vue'

withDefaults(
  defineProps<{
    /** Zero-based index of the page shown. */
    index: number
    /** Whether a next page exists (a keyset list knows this only by fetching one more row). */
    hasNext: boolean
    /** A page is being fetched: both buttons are disabled and the label says so. */
    loading?: boolean
    /** Names the navigation landmark. */
    label?: string
    /** The previous button's text. */
    prevLabel?: string
    /** The next button's text. */
    nextLabel?: string
  }>(),
  { label: 'Pages', prevLabel: 'Previous', nextLabel: 'Next' },
)
defineEmits<{
  /** The previous button was pressed. */
  prev: []
  /** The next button was pressed. */
  next: []
}>()
// Template: A named <nav> landmark; the <output> is a polite live region, so the new page number is announced after a press.
</script>

<template>
  <nav class="mw-pager" :aria-label="label">
    <UiButton variant="ghost" size="sm" :disabled="index === 0 || loading" @click="$emit('prev')">{{ prevLabel }}</UiButton>
    <output class="mw-pager__page" aria-label="Current page">Page {{ index + 1 }}<template v-if="loading"> (loading…)</template></output>
    <UiButton variant="ghost" size="sm" :disabled="!hasNext || loading" @click="$emit('next')">{{ nextLabel }}</UiButton>
  </nav>
</template>

<style scoped>
.mw-pager {
  display: flex;
  flex-wrap: wrap; /* at 200% text the buttons and the page label no longer fit one line */
  gap: var(--space-sm);
  align-items: center;
  justify-content: flex-end;
  margin-top: var(--space-xs);
}
/* The page label is secondary to the buttons, so it is muted (AAA) and small. */
.mw-pager__page {
  color: var(--muted);
  font-size: var(--font-size-sm);
}
</style>
