<script setup lang="ts">
// Desktop-console status bar: a list of status items (monospace, muted, sticky to the bottom of its scroll container). Separators are
// decorative CSS, hidden from assistive technology.
//
// The standard items render from props, each only when its prop is provided:
//   network     — network name with a health dot (`healthy`, default true)
//   epoch       — "Epoch N"; `null` shows a placeholder while it loads
//   lastRefresh — "Refreshed Ns ago", ticking on its own; `null` shows "Loading…"
// Add further items as <li> elements in the default slot.
import { computed } from 'vue'
import { useNow } from '../composables/useNow'
import UiStatusDot from './UiStatusDot.vue'

const props = withDefaults(
  defineProps<{
    /** The network's name (capitalised for display); omit to show no network item. */
    network?: string
    /** Whether the network is healthy: the dot is ok (default) or error. */
    healthy?: boolean
    /** The epoch number; `null` shows a placeholder while it loads; omit to show no epoch item. */
    epoch?: number | null
    /** When the data was last refreshed; `null` shows "Loading…"; omit to show no refresh item. The text ticks on its own. */
    lastRefresh?: Date | null
  }>(),
  { healthy: true },
)

// One shared clock that ticks every second, so "Refreshed 12s ago" keeps counting without the parent re-rendering.
const now = useNow(1000)
const networkLabel = computed(() => (props.network ? props.network.charAt(0).toUpperCase() + props.network.slice(1) : ''))

/**
 * How long ago a date was, in the coarse units a status bar needs.
 * @param d - the moment to measure from
 * @returns `just now` under five seconds, then seconds, then whole minutes
 */
function timeAgo(d: Date): string {
  // Clamped at zero: a clock a little behind the server's would otherwise show "-3s ago".
  const s = Math.max(0, Math.floor((now.value - d.getTime()) / 1000))
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  return `${Math.floor(s / 60)}m ago`
}
// Template: role="list" is explicit because the list has no markers and Safari with VoiceOver would otherwise drop the list semantics.
</script>

<template>
  <ul role="list" class="mw-statusbar" aria-label="Status">
    <li v-if="network">
      <UiStatusDot :status="healthy ? 'ok' : 'error'" />
      {{ networkLabel }}
      <!-- The dot is decoration, so the health is also written for assistive technology. -->
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
/* A strip pinned to the bottom of its scroll container: small monospace text in the muted colour (AAA), with a rule above. */
.mw-statusbar {
  display: flex;
  flex-wrap: wrap; /* at 200% text the items no longer fit one line */
  align-items: center;
  gap: var(--space-4xs) var(--space-sm);
  margin: 0;
  padding: var(--space-4xs) var(--space-xs);
  list-style: none;
  font-size: var(--font-size-2xs);
  color: var(--muted);
  background: var(--surface);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  max-inline-size: 100%;
  font-family: var(--mw-font-mono);
  position: sticky;
  bottom: 0;
  z-index: var(--z-raised);
}
/* `:deep` because the items include `<li>`s the caller puts in the default slot, which scoped styles would not otherwise reach. */
.mw-statusbar > :deep(li) {
  display: flex;
  align-items: center;
  gap: var(--space-3xs);
}
/* Decorative separator between items; the empty alt text keeps it out of the accessibility tree. */
.mw-statusbar > :deep(li + li)::before {
  content: '│' / '';
  margin-inline-end: var(--space-xs);
  color: var(--border);
}
/* A pending value is set apart by style, not by dimming it (opacity takes the text below the contrast floor). */
.mw-statusbar__pending {
  font-style: italic;
}
</style>
