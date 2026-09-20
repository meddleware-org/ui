<script setup lang="ts">
// Single sidebar entry button: optional icon + label, active/disabled states, accent-tinted
// active background. Presentational only — the host owns selection state.
withDefaults(
  defineProps<{ label: string; icon?: string; active?: boolean; disabled?: boolean }>(),
  { active: false, disabled: false },
)
</script>
<template>
  <button type="button" class="sidebar-item" :class="{ 'is-active': active }"
    :disabled="disabled" :aria-current="active ? 'page' : undefined">
    <span v-if="icon" class="sidebar-item__icon" aria-hidden="true">{{ icon }}</span>
    <span class="sidebar-item__label">{{ label }}</span>
  </button>
</template>
<style scoped>
.sidebar-item { display: flex; align-items: center; gap: var(--space-2xs); width: 100%; padding: var(--space-2xs) var(--space-xs); border: 0; border-radius: var(--radius); background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; opacity: 0.85; transition: background var(--transition-base), opacity var(--transition-base); }
.sidebar-item:hover:not(:disabled) { background: color-mix(in srgb, currentColor 10%, transparent); opacity: 1; }
.sidebar-item.is-active { background: color-mix(in srgb, var(--accent) 26%, transparent); opacity: 1; }
.sidebar-item:disabled { cursor: default; }
.sidebar-item:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 1px; }
.sidebar-item__icon { width: 1.1rem; text-align: center; }
</style>
