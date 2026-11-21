<script setup lang="ts">
// Where it is used: the status bar, the status widget and the dashboard's tool cards.
// A small health indicator dot. It is decorative: always put the state in words beside it (a label, a headline), because colour alone
// does not carry meaning. `status` takes a platform status level or the short aliases the status bar used.
import type { StatusLevel } from '@meddleware/web-utils'

/** What a dot can show: a platform status level, or the short aliases the status bar used (`ok`, `warn`, `error`). */
export type StatusDotStatus = StatusLevel | 'ok' | 'warn' | 'error'

withDefaults(
  defineProps<{
    /** The state to colour the dot for (default `ok`). */
    status?: StatusDotStatus
    /** The dot's size: small (default) or medium. */
    size?: 'sm' | 'md'
  }>(),
  { status: 'ok', size: 'sm' },
)

// Both vocabularies reduce to four tones, so the styles below are written once per tone, not once per alias.
// aliases first, then the platform levels they stand for: `ok`/`operational`, `warn`/`degraded`, `error`/`down`.
const TONE: Record<StatusDotStatus, 'ok' | 'warn' | 'error' | 'unknown'> = {
  ok: 'ok',
  operational: 'ok',
  warn: 'warn',
  degraded: 'warn',
  error: 'error',
  down: 'error',
  unknown: 'unknown',
}
// Template: aria-hidden: the dot is decoration; the state must be written in words beside it (WCAG 1.4.1, colour alone carries no meaning).
</script>

<template>
  <span class="mw-status-dot" :class="[`mw-status-dot--${TONE[status]}`, `mw-status-dot--${size}`]" aria-hidden="true" />
</template>

<style scoped>
/* A filled circle; it does not shrink in a flex row. The sizes and tones below only set its dimensions and fill. */
.mw-status-dot {
  display: inline-block;
  border-radius: 50%;
  flex-shrink: 0;
}
/* Small is the default (inline with text); medium for a dot used as a standalone indicator. Sizes are spacing tokens, so they scale. */
.mw-status-dot--sm {
  width: var(--space-2xs);
  height: var(--space-2xs);
}
.mw-status-dot--md {
  width: var(--space-xs);
  height: var(--space-xs);
}
/* Tone fills, from the status tokens: ok, warning and danger are each AAA-checked against the canvases (3:1 non-text is the requirement). */
.mw-status-dot--ok {
  background: var(--ok);
}
.mw-status-dot--warn {
  background: var(--warning);
}
.mw-status-dot--error {
  background: var(--danger);
}
/* Unknown is muted grey, not a status colour: nothing is claimed about a state that is not known. */
.mw-status-dot--unknown {
  background: var(--muted);
}
</style>
