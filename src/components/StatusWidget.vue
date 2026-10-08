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
  /** Poll interval in milliseconds (at least 15 000; smaller values are raised to it). */
  pollInterval?: number
}>(), {
  apiUrl: 'https://status.meddleware.co.uk/api/status',
  href: 'https://status.meddleware.co.uk',
  pollInterval: 60_000,
})

type WidgetState = 'checking' | 'ok' | 'degraded' | 'error'

/** The shortest interval honoured, so a tiny `pollInterval` cannot hammer the status endpoint. */
const MIN_POLL_MS = 15_000

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

// Nothing is claimed until the first answer: the widget starts in "checking" (also what SSR renders).
const state = ref<WidgetState>('checking')
const label = ref('Checking status…')
let timer: ReturnType<typeof setInterval> | null = null

async function poll(): Promise<void> {
  try {
    // Bounded so a hung request cannot stall polling (the next poll retries).
    const res = await fetch(props.apiUrl, { signal: AbortSignal.timeout(10_000) })
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

/** Poll unless the tab is hidden; a hidden tab catches up when it becomes visible again. */
function pollIfVisible(): void {
  if (!document.hidden) void poll()
}

onMounted(() => {
  void poll()
  timer = setInterval(pollIfVisible, Math.max(props.pollInterval, MIN_POLL_MS))
  document.addEventListener('visibilitychange', pollIfVisible)
})
onUnmounted(() => {
  if (timer !== null) clearInterval(timer)
  document.removeEventListener('visibilitychange', pollIfVisible)
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
  >{{ label }}</a>
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

/* Decorative status dot (the label text carries the meaning). */
.status-widget::before {
  content: '';
  width: var(--space-2xs);
  height: var(--space-2xs);
  border-radius: 50%;
  flex-shrink: 0;
}

/* Status dots use the role tokens (degraded → --warning, a functional yellow, not gold). */
.status-widget--checking::before { background: var(--muted); }
.status-widget--ok::before       { background: var(--ok); }
.status-widget--degraded::before { background: var(--warning); }
.status-widget--error::before    { background: var(--danger); }
</style>
