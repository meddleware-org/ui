<script setup lang="ts">
// Previous / next controls for a keyset-paginated list (pair with `usePager`). The current page is announced politely as it changes.
import UiButton from './UiButton.vue'

withDefaults(
  defineProps<{
    /** Zero-based index of the page shown. */
    index: number
    hasNext: boolean
    loading?: boolean
    /** Names the navigation landmark. */
    label?: string
    prevLabel?: string
    nextLabel?: string
  }>(),
  { label: 'Pages', prevLabel: 'Previous', nextLabel: 'Next' },
)
defineEmits<{ prev: []; next: [] }>()
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
  gap: var(--space-sm);
  align-items: center;
  justify-content: flex-end;
  margin-top: var(--space-xs);
}
.mw-pager__page {
  color: var(--muted);
  font-size: var(--font-size-sm);
}
</style>
