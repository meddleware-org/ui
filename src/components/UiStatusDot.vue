<script setup lang="ts">
// A small health indicator dot. It is decorative: always put the state in words beside it (a label, a headline), because colour alone
// does not carry meaning. `status` takes a platform status level or the short aliases the status bar used.
import type { StatusLevel } from '@meddleware/web-utils'

export type StatusDotStatus = StatusLevel | 'ok' | 'warn' | 'error'

withDefaults(defineProps<{ status?: StatusDotStatus; size?: 'sm' | 'md' }>(), { status: 'ok', size: 'sm' })

const TONE: Record<StatusDotStatus, 'ok' | 'warn' | 'error' | 'unknown'> = {
  ok: 'ok',
  operational: 'ok',
  warn: 'warn',
  degraded: 'warn',
  error: 'error',
  down: 'error',
  unknown: 'unknown',
}
</script>

<template>
  <span class="mw-status-dot" :class="[`mw-status-dot--${TONE[status]}`, `mw-status-dot--${size}`]" aria-hidden="true" />
</template>

<style scoped>
.mw-status-dot {
  display: inline-block;
  border-radius: 50%;
  flex-shrink: 0;
}
.mw-status-dot--sm {
  width: var(--space-2xs);
  height: var(--space-2xs);
}
.mw-status-dot--md {
  width: var(--space-xs);
  height: var(--space-xs);
}
.mw-status-dot--ok {
  background: var(--ok);
}
.mw-status-dot--warn {
  background: var(--warning);
}
.mw-status-dot--error {
  background: var(--danger);
}
.mw-status-dot--unknown {
  background: var(--muted);
}
</style>
