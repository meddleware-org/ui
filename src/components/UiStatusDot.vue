<script setup lang="ts">
// Small health indicator dot for the status bar. `status` maps to a semantic colour.
withDefaults(defineProps<{ status?: 'ok' | 'warn' | 'error' }>(), { status: 'ok' })
</script>

<template>
  <span class="mw-status-dot" :class="`mw-status-dot--${status}`" aria-hidden="true" />
</template>

<style scoped>
.mw-status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 4px;
  flex-shrink: 0;
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
</style>
