<script setup lang="ts">
// Desktop-console toolbar: a WAI-ARIA toolbar (one tab stop; Left/Right/Home/End move between its buttons). Clicking an action emits
// `action` with its id. UiToolbarButton remains exported for standalone use (e.g. table refresh or pagination).
import { onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'
import UiToolbarButton from './UiToolbarButton.vue'

export interface ToolbarAction {
  id: string
  label: string
  disabled?: boolean
}

withDefaults(defineProps<{ actions: ToolbarAction[]; /** Names the toolbar for assistive technology. */ label?: string }>(), { label: 'Actions' })
const emit = defineEmits<{ action: [id: string] }>()

const bar = ref<HTMLElement | null>(null)

/** The enabled buttons, in order (a disabled button cannot take focus). */
const buttons = (): HTMLButtonElement[] => Array.from(bar.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])

function onKeydown(e: KeyboardEvent): void {
  const all = buttons()
  const at = all.indexOf(document.activeElement as HTMLButtonElement)
  if (at < 0) return
  const last = all.length - 1
  const to =
    e.key === 'ArrowRight' ? (at === last ? 0 : at + 1)
    : e.key === 'ArrowLeft' ? (at === 0 ? last : at - 1)
    : e.key === 'Home' ? 0
    : e.key === 'End' ? last
    : -1
  if (to < 0) return
  e.preventDefault()
  all.forEach((b, i) => (b.tabIndex = i === to ? 0 : -1))
  all[to]?.focus()
}

/** Only one button is in the Tab sequence at a time (roving tabindex): the one last used, or the first. */
function settle(): void {
  const all = buttons()
  const keep = all.find((b) => b.tabIndex === 0) ?? all[0]
  all.forEach((b) => (b.tabIndex = b === keep ? 0 : -1))
}
onMounted(() => {
  settle()
  bar.value?.addEventListener('keydown', onKeydown)
  bar.value?.addEventListener('focusin', onFocusin)
})
onBeforeUnmount(() => {
  bar.value?.removeEventListener('keydown', onKeydown)
  bar.value?.removeEventListener('focusin', onFocusin)
})
onUpdated(settle)

function onFocusin(e: FocusEvent): void {
  const all = buttons()
  const target = e.target as HTMLButtonElement
  if (all.includes(target)) all.forEach((b) => (b.tabIndex = b === target ? 0 : -1))
}
</script>

<template>
  <div ref="bar" class="mw-toolbar" role="toolbar" :aria-label="label">
    <UiToolbarButton v-for="a in actions" :key="a.id" :disabled="a.disabled" @click="emit('action', a.id)">{{ a.label }}</UiToolbarButton>
  </div>
</template>

<style scoped>
.mw-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3xs);
  margin: 0;
  padding: var(--space-3xs) var(--space-2xs);
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
}
</style>
