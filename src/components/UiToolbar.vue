<script setup lang="ts">
// Desktop-console toolbar. Rendered as <menu> — HTML's element for a toolbar (a list of
// commands) — with one UiToolbarButton per action. Clicking an action emits `action` with its id.
// UiToolbarButton remains exported for standalone use (e.g. table refresh / pagination).
import UiToolbarButton from './UiToolbarButton.vue'

export interface ToolbarAction {
  id: string
  label: string
  disabled?: boolean
}

defineProps<{ actions: ToolbarAction[] }>()
const emit = defineEmits<{ action: [id: string] }>()
</script>

<template>
  <menu class="mw-toolbar">
    <li v-for="a in actions" :key="a.id">
      <UiToolbarButton :disabled="a.disabled" @click="emit('action', a.id)">{{ a.label }}</UiToolbarButton>
    </li>
  </menu>
</template>

<style scoped>
.mw-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 4px 8px;
  list-style: none;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
}
</style>
