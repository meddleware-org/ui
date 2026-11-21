<script setup lang="ts">
// A polite live region for status text ("Saved", "Loading rows…", "3 results"). The region is ALWAYS mounted and only its text changes: a
// live region inserted together with its text is not reliably announced, which a `v-if` on the element causes. Use it for progress and
// results; use UiNotice (`type="error"`) for failures that need attention.
withDefaults(
  defineProps<{
    /** The text to announce; the default slot takes rich content instead. */
    message?: string
    /** Names the region for assistive technology. */
    label?: string
  }>(),
  { label: 'Status' },
)
// Template: <output> is a native live region (role=status): polite announcements without an ARIA role of our own.
</script>

<template>
  <output class="mw-live" :aria-label="label"><slot>{{ message }}</slot></output>
</template>

<style scoped>
/* Block so it takes its own line; muted because it is secondary to the thing it reports on. */
.mw-live {
  display: block;
  color: var(--muted);
  font-size: var(--font-size-sm);
}
/* An empty region takes no space; it stays in the DOM (see above) so the next text is announced. */
.mw-live:empty {
  display: none;
}
</style>
