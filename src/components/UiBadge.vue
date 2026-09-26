<script setup lang="ts">
// Small uppercase status pill. `variant` maps to a semantic colour.
withDefaults(
  defineProps<{ variant?: 'active' | 'closed' | 'pending' | 'neutral' }>(),
  { variant: 'neutral' },
)
</script>

<template>
  <span class="mw-badge" :class="`mw-badge--${variant}`"><slot /></span>
</template>

<style scoped>
.mw-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 2px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.mw-badge--active {
  background: color-mix(in srgb, var(--ok) 20%, transparent);
  color: var(--ok);
}
.mw-badge--closed {
  background: color-mix(in srgb, var(--muted) 20%, transparent);
  color: var(--muted);
}
.mw-badge--pending {
  background: color-mix(in srgb, var(--warning) 20%, transparent);
  color: var(--warning);
}
.mw-badge--neutral {
  background: var(--lift);
  color: var(--muted);
}
</style>
