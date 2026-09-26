<script setup lang="ts">
// A single row in UiActivityFeed: a leading dot, a type label, and a right-aligned
// time/meta. Provide text via props or override with the `type` / `time` slots.
defineProps<{ type?: string; time?: string }>()
</script>

<template>
  <li class="mw-feed__item">
    <span class="mw-feed__dot" aria-hidden="true" />
    <span class="mw-feed__type"><slot name="type">{{ type }}</slot></span>
    <span class="mw-feed__time"><slot name="time">{{ time }}</slot></span>
  </li>
</template>

<style scoped>
.mw-feed__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
  border-bottom: 1px solid var(--border);
  color: var(--muted);
}
.mw-feed__item:last-child {
  border-bottom: none;
}
.mw-feed__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 4px;
  flex-shrink: 0;
}
.mw-feed__type {
  color: var(--text);
  font-weight: 500;
  white-space: nowrap;
}
.mw-feed__time {
  margin-left: auto;
  white-space: nowrap;
  font-family: var(--mw-font-mono);
  font-size: 0.72rem;
}
</style>
