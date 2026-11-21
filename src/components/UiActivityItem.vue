<script setup lang="ts">
// A single row in UiActivityFeed: the event type, then right-aligned secondary metadata.
// Provide text via props or override with the `type` / `time` slots. When the metadata is a real
// date/time, pass `datetime` (a valid datetime string) and it renders as <time>; otherwise it is
// side information and renders as <small>. The leading dot is decorative (CSS).
defineProps<{
  /** The event type, shown first (the `type` slot takes rich content). */
  type?: string
  /** The metadata text on the right (the `time` slot takes rich content). */
  time?: string
  /** A valid datetime string; when given the metadata is a real `<time>` element, otherwise it is a `<small>`. */
  datetime?: string
}>()
// Template: <time> only when the metadata is a real date or time; anything else is side information and would be a wrong `datetime`.
</script>

<template>
  <li class="mw-feed__item">
    <slot name="type">{{ type }}</slot>
    <time v-if="datetime" class="mw-feed__meta" :datetime="datetime"><slot name="time">{{ time }}</slot></time>
    <small v-else class="mw-feed__meta"><slot name="time">{{ time }}</slot></small>
  </li>
</template>

<style scoped>
/* One row: marker, event type, then the metadata pushed to the far end. Rows are divided by a hairline, not spaced by margins, so the
   list reads as one block. */
.mw-feed__item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2xs);
  padding: var(--space-3xs) 0;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}
/* The leading dot is decoration drawn in CSS (no element, nothing for a screen reader to read). */
.mw-feed__item::before {
  content: '';
  width: var(--space-2xs);
  height: var(--space-2xs);
  border-radius: 50%;
  background: var(--accent);
  margin-top: var(--space-3xs);
  flex-shrink: 0;
}
/* No divider under the last row. */
.mw-feed__item:last-child {
  border-bottom: none;
}
/* `margin-left: auto` right-aligns the metadata; monospace and the small size keep timestamps in a tidy column. */
.mw-feed__meta {
  margin-left: auto;
  color: var(--muted);
  font-family: var(--mw-font-mono);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-regular);
}
</style>
