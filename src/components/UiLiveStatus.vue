<script setup lang="ts">
// A polite live region for status text ("Saved", "Loading rows…", "3 results"). The region is ALWAYS mounted and only its text changes: a
// live region inserted together with its text is not reliably announced, which a `v-if` on the element causes. Use it for progress and
// results; use UiNotice (`type="error"`) for failures that need attention.
withDefaults(defineProps<{ message?: string; /** Names the region for assistive technology. */ label?: string }>(), { label: 'Status' })
</script>

<template>
  <output class="mw-live" :aria-label="label"><slot>{{ message }}</slot></output>
</template>

<style scoped>
.mw-live {
  display: block;
  color: var(--muted);
  font-size: var(--font-size-sm);
}
.mw-live:empty {
  display: none;
}
</style>
