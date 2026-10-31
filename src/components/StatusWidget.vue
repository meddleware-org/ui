<script setup lang="ts">
// A compact link showing the platform's overall status, polled from the status API. Nothing is claimed until the first answer: it starts
// in "checking" (also what SSR renders). The state is written in words; the dot is decoration.
import { computed } from 'vue'
import { safeHref, STATUS_HEADLINE, type StatusLevel } from '@meddleware/web-utils'
import { useStatusSnapshot } from '../composables/useStatusSnapshot'
import UiStatusDot from './UiStatusDot.vue'

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

const STATE_MAP: Record<StatusLevel, WidgetState> = {
  operational: 'ok',
  degraded: 'degraded',
  down: 'error',
  unknown: 'degraded',
}

const { snapshot, error } = useStatusSnapshot({ url: props.apiUrl, intervalMs: props.pollInterval })

const state = computed<WidgetState>(() => (error.value ? 'error' : snapshot.value ? STATE_MAP[snapshot.value.overall] : 'checking'))
const label = computed(() => (error.value ? 'Status unavailable' : snapshot.value ? STATUS_HEADLINE[snapshot.value.overall] : 'Checking status…'))
const dot = computed<StatusLevel>(() => (state.value === 'ok' ? 'operational' : state.value === 'degraded' ? 'degraded' : state.value === 'error' ? 'down' : 'unknown'))
</script>

<template>
  <a
    :href="safeHref(href)"
    target="_blank"
    rel="noopener noreferrer"
    class="status-widget"
    :class="`status-widget--${state}`"
    :title="`Platform status: ${label}`"
  ><UiStatusDot :status="dot" />{{ label }}</a>
</template>

<style scoped>
.status-widget {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  text-decoration: none;
  color: inherit;
  font-size: var(--font-size-sm);
}
.status-widget:hover {
  text-decoration: underline;
}
</style>
