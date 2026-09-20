<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { safeHref } from '../safe-href.js'
import { parseSnapshot } from '../status.js'
import type { StatusLevel } from '../status.js'

const props = withDefaults(defineProps<{
  /** URL of the `GET /api/status` endpoint to poll. */
  apiUrl?: string
  /** URL the widget links to (the human-readable status page). */
  href?: string
  /** Poll interval in milliseconds. */
  pollInterval?: number
}>(), {
  apiUrl: 'https://status.meddleware.co.uk/api/status',
  href: 'https://status.meddleware.co.uk',
  pollInterval: 60_000,
})

type WidgetState = 'ok' | 'degraded' | 'error'

const STATE_MAP: Record<StatusLevel, WidgetState> = {
  operational: 'ok',
  degraded: 'degraded',
  down: 'error',
  unknown: 'degraded',
}

const LABEL: Record<StatusLevel, string> = {
  operational: 'All systems operational',
  degraded: 'Degraded',
  down: 'Major outage',
  unknown: 'Status unknown',
}

const state = ref<WidgetState>('ok')
const label = ref('All systems operational')
let timer: ReturnType<typeof setInterval> | null = null

async function poll(): Promise<void> {
  try {
    const res = await fetch(props.apiUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const snap = parseSnapshot(await res.json())
    if (!snap) throw new Error('unexpected response shape')
    state.value = STATE_MAP[snap.overall]
    label.value = LABEL[snap.overall]
  } catch {
    state.value = 'error'
    label.value = 'Status unavailable'
  }
}

onMounted(() => {
  poll()
  timer = setInterval(poll, props.pollInterval)
})
onUnmounted(() => {
  if (timer !== null) clearInterval(timer)
})
</script>

<template>
  <a
    :href="safeHref(href)"
    target="_blank"
    rel="noopener noreferrer"
    class="status-widget"
    :class="`status-widget--${state}`"
    :title="`Platform status: ${label}`"
  >
    <span class="status-widget__dot" aria-hidden="true" />
    <span class="status-widget__label">{{ label }}</span>
  </a>
</template>

<style scoped>
.status-widget {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  text-decoration: none;
  color: inherit;
  font-size: var(--font-size-sm);
  opacity: 0.85;
  transition: opacity var(--transition-base);
}
.status-widget:hover { opacity: 1; }

.status-widget__dot {
  width: var(--space-2xs);
  height: var(--space-2xs);
  border-radius: 50%;
  flex-shrink: 0;
}

/* Status dots use the role tokens (degraded → --warning, a functional yellow, not gold). */
.status-widget--ok       .status-widget__dot { background: var(--ok); }
.status-widget--degraded .status-widget__dot { background: var(--warning); }
.status-widget--error    .status-widget__dot { background: var(--danger); }
</style>
