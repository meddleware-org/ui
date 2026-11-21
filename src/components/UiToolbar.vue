<script setup lang="ts">
// Desktop-console toolbar: a WAI-ARIA toolbar (one tab stop; Left/Right/Home/End move between its buttons). Clicking an action emits
// `action` with its id. UiToolbarButton remains exported for standalone use (e.g. table refresh or pagination).
import { onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'
import UiToolbarButton from './UiToolbarButton.vue'

/** One button in the toolbar. */
export interface ToolbarAction {
  /** What `action` is emitted with when the button is pressed. */
  id: string
  /** The button's text. */
  label: string
  /** A disabled button cannot be pressed or focused, and is skipped by the arrow keys. */
  disabled?: boolean
}

withDefaults(
  defineProps<{
    /** The buttons, in order. */
    actions: ToolbarAction[]
    /** Names the toolbar for assistive technology. */
    label?: string
  }>(),
  { label: 'Actions' },
)
const emit = defineEmits<{
  /** A button was pressed; the argument is its `id`. */
  action: [id: string]
}>()

// The toolbar element, used to find its buttons (the buttons are children, so they are looked up rather than registered).
const bar = ref<HTMLElement | null>(null)

/** The enabled buttons, in order (a disabled button cannot take focus). */
const buttons = (): HTMLButtonElement[] => Array.from(bar.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])

/**
 * Move focus between the buttons with the arrow keys, as the WAI-ARIA toolbar pattern asks: Left and Right wrap around, Home and End jump to the ends.
 * @param e - the keydown event on the toolbar
 */
function onKeydown(e: KeyboardEvent): void {
  const all = buttons()
  const at = all.indexOf(document.activeElement as HTMLButtonElement)
  // Focus is not on one of our buttons (it is somewhere inside the toolbar's own wrapper): leave the key alone.
  if (at < 0) return
  const last = all.length - 1
  // The index to move to: -1 means "not a key we handle".
  const to =
    e.key === 'ArrowRight' ? (at === last ? 0 : at + 1)
    : e.key === 'ArrowLeft' ? (at === 0 ? last : at - 1)
    : e.key === 'Home' ? 0
    : e.key === 'End' ? last
    : -1
  if (to < 0) return
  // Stop the arrow key scrolling the page, then make the target the one Tab stop and focus it.
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
// Native listeners on the element (not template handlers) so one pair covers every button, including ones rendered from `actions` later.
onMounted(() => {
  settle()
  bar.value?.addEventListener('keydown', onKeydown)
  bar.value?.addEventListener('focusin', onFocusin)
})
onBeforeUnmount(() => {
  bar.value?.removeEventListener('keydown', onKeydown)
  bar.value?.removeEventListener('focusin', onFocusin)
})
// The buttons change with `actions`, so the single Tab stop is re-established after every update.
onUpdated(settle)

/**
 * Keep the roving tab stop on whichever button was focused last (a click or a programmatic focus, not only the arrow keys).
 * @param e - the focusin event
 */
function onFocusin(e: FocusEvent): void {
  const all = buttons()
  const target = e.target as HTMLButtonElement
  if (all.includes(target)) all.forEach((b) => (b.tabIndex = b === target ? 0 : -1))
}
// Template: There is no native toolbar element, so role=toolbar is the one ARIA role here; it is what makes a screen reader announce the arrow-key behaviour.
</script>

<template>
  <div ref="bar" class="mw-toolbar" role="toolbar" :aria-label="label">
    <UiToolbarButton v-for="a in actions" :key="a.id" :disabled="a.disabled" @click="emit('action', a.id)">{{ a.label }}</UiToolbarButton>
  </div>
</template>

<style scoped>
/* A row of compact buttons with a rule under it, sitting on the surface colour; it does not shrink when it is a flex child. */
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
