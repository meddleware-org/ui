<script setup lang="ts">
// A compact link showing the platform's overall status, polled from the status API. Nothing is claimed until the first answer: it starts
// in "checking" (also what SSR renders). The state is written in words; the dot is decoration.
// The defaults point at the public status site, so an app needs no configuration; the poll interval is floored at 15 s (in the composable)
// so a mistaken tiny value cannot hammer the status service.
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

/** What the widget shows: nothing is claimed (`checking`) until the first answer arrives. */
type WidgetState = 'checking' | 'ok' | 'degraded' | 'error'

// The API has four levels, the widget three states plus "checking"; `unknown` is shown as degraded rather than as healthy.
const STATE_MAP: Record<StatusLevel, WidgetState> = {
  operational: 'ok',
  degraded: 'degraded',
  down: 'error',
  unknown: 'degraded',
}

// The poll runs inside the composable, which stops it when the component is unmounted.
const { snapshot, error } = useStatusSnapshot({ url: props.apiUrl, intervalMs: props.pollInterval })

// A failed poll is `error` even if an older snapshot exists: stale "operational" must not be shown for a status that cannot be read.
const state = computed<WidgetState>(() => (error.value ? 'error' : snapshot.value ? STATE_MAP[snapshot.value.overall] : 'checking'))
// The wording comes from web-utils' STATUS_HEADLINE, the one list every surface uses, so this widget never disagrees with the status page.
const label = computed(() => (error.value ? 'Status unavailable' : snapshot.value ? STATUS_HEADLINE[snapshot.value.overall] : 'Checking status…'))
// The dot's colour follows the widget's state, not the raw level, so `unknown` and a failed poll look the way their words say.
const dot = computed<StatusLevel>(() => (state.value === 'ok' ? 'operational' : state.value === 'degraded' ? 'degraded' : state.value === 'error' ? 'down' : 'unknown'))
// Template: An external link to the human-readable status page; the state is the link's text, and the dot is decoration.
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
/* A one-line link, inheriting its colour and size from where it sits (a footer); it underlines on hover instead of changing colour. */
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
