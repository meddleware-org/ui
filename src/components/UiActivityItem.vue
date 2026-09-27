<script setup lang="ts">
// A single row in UiActivityFeed: the event type, then right-aligned secondary metadata.
// Provide text via props or override with the `type` / `time` slots. When the metadata is a real
// date/time, pass `datetime` (a valid datetime string) and it renders as <time>; otherwise it is
// side information and renders as <small>. The leading dot is decorative (CSS).
defineProps<{ type?: string; time?: string; datetime?: string }>()
</script>

<template>
  <li class="mw-feed__item">
    <slot name="type">{{ type }}</slot>
    <time v-if="datetime" class="mw-feed__meta" :datetime="datetime"><slot name="time">{{ time }}</slot></time>
    <small v-else class="mw-feed__meta"><slot name="time">{{ time }}</slot></small>
  </li>
</template>

<style scoped>
.mw-feed__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  font-weight: 500;
  white-space: nowrap;
}
.mw-feed__item::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 4px;
  flex-shrink: 0;
}
.mw-feed__item:last-child {
  border-bottom: none;
}
.mw-feed__meta {
  margin-left: auto;
  color: var(--muted);
  font-family: var(--mw-font-mono);
  font-size: 0.72rem;
  font-weight: 400;
}
</style>
