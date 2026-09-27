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
    {{ label }}
  </button>
</template>
<style scoped>
/* Square corners + full width so the hover/active highlight reads as a solid horizontal
   block across the whole sidebar (the nav container drops its horizontal padding to let it
   bleed to the edges; this item's own horizontal padding keeps the text inset). */
.sidebar-item { display: flex; align-items: center; gap: var(--space-2xs); width: 100%; padding: var(--space-2xs) var(--space-sm); border: 0; border-radius: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; opacity: 0.85; transition: background var(--transition-base), opacity var(--transition-base); }
.sidebar-item:hover:not(:disabled) { background: color-mix(in srgb, currentColor 10%, transparent); opacity: 1; }
.sidebar-item.is-active { background: color-mix(in srgb, var(--accent) 26%, transparent); opacity: 1; }
.sidebar-item:disabled { cursor: default; }
.sidebar-item:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 1px; }
.sidebar-item__icon { width: 1.1rem; text-align: center; }
</style>
