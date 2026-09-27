<script setup lang="ts">
// Desktop-console status bar: a list of status items (monospace, muted, sticky to the bottom of
// its scroll container). Separators are decorative CSS, hidden from assistive technology.
//
// The standard items render from props, each only when its prop is provided:
//   network     — network name with a health dot (`healthy`, default true)
//   epoch       — "Epoch N"; `null` shows a placeholder while it loads
//   lastRefresh — "Refreshed Ns ago"; `null` shows "Loading…"
// Add further items as <li> elements in the default slot.
import { computed } from 'vue'
import UiStatusDot from './UiStatusDot.vue'

const props = withDefaults(
  defineProps<{
    network?: string
    healthy?: boolean
    epoch?: number | null
    lastRefresh?: Date | null
  }>(),
  { healthy: true },
)

const networkLabel = computed(() =>
  props.network ? props.network.charAt(0).toUpperCase() + props.network.slice(1) : '',
)

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  return `${Math.floor(s / 60)}m ago`
}
</script>

<template>
  <ul role="list" class="mw-statusbar" aria-label="Status">
    <li v-if="network">
      <UiStatusDot :status="healthy ? 'ok' : 'error'" />
      {{ networkLabel }}
      <span class="mw-visually-hidden">({{ healthy ? 'status OK' : 'status error' }})</span>
    </li>
    <template v-if="epoch !== undefined">
      <li v-if="epoch !== null">Epoch {{ epoch }}</li>
      <li v-else class="mw-statusbar__pending">Epoch —</li>
    </template>
    <template v-if="lastRefresh !== undefined">
      <li v-if="lastRefresh">Refreshed {{ timeAgo(lastRefresh) }}</li>
      <li v-else class="mw-statusbar__pending">Loading…</li>
    </template>
    <slot />
  </ul>
</template>

<style scoped>
.mw-statusbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0;
  padding: 3px 12px;
  list-style: none;
  font-size: 0.72rem;
  color: var(--muted);
  background: var(--surface);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  font-family: var(--mw-font-mono);
  position: sticky;
  bottom: 0;
  z-index: 1;
}
.mw-statusbar > :deep(li) {
  display: flex;
  align-items: center;
}
/* Decorative separator between items; the empty alt text keeps it out of the accessibility tree. */
.mw-statusbar > :deep(li + li)::before {
  content: '│' / '';
  margin-inline-end: 16px;
  color: var(--border);
}
.mw-statusbar__pending {
  opacity: 0.7;
}
</style>
