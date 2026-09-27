<script setup lang="ts">
// Modal dialog built on the native <dialog> element (top layer, inert background, focus
// restore and Escape handling come from the platform).
//
// Structure: <dialog> › <article> › <header> (heading + close) · body slot · <footer> (actions).
// The <article> is deliberate: header/footer elements are only scoped away from the page-level
// banner/contentinfo landmarks when they sit inside sectioning content, and <dialog> is not
// sectioning content.
//
// Dismissal (Escape + backdrop click) uses the native `closedby` attribute, with a script-attached
// backdrop listener as a fallback where it is unsupported — so no interactive handler sits on the
// non-interactive <dialog> element itself.
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(
  defineProps<{
    /** Dialog heading (also its accessible name). Override the markup with the `title` slot. */
    title?: string
    /** Allow closing via Escape, backdrop click and the close button. */
    dismissible?: boolean
    /** Accessible label for the header close button. */
    closeLabel?: string
    /** CSS width of the dialog (default `min(420px, 90vw)`). */
    width?: string
  }>(),
  { dismissible: true, closeLabel: 'Close' },
)

const emit = defineEmits<{
  /** Fired whenever the dialog closes, with the value passed to `close()` ('' if dismissed). */
  close: [returnValue: string]
}>()

const el = ref<HTMLDialogElement | null>(null)
const titleId = useId()
const dialogWidth = computed(() => props.width ?? 'min(420px, 90vw)')

const supportsClosedBy = typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype

function close(returnValue = ''): void {
  if (el.value?.open) el.value.close(returnValue)
}

function sync(isOpen: boolean): void {
  const d = el.value
  if (!d) return
  if (isOpen && !d.open) d.showModal()
  else if (!isOpen && d.open) d.close()
}

function applyClosedBy(): void {
  // Not yet in Vue's DialogHTMLAttributes typings, so set it directly.
  el.value?.setAttribute('closedby', props.dismissible ? 'any' : 'none')
}

// Fallback light-dismiss: the article fills the dialog box, so a click whose target is the
// <dialog> itself can only have landed on the backdrop.
function onBackdropClick(e: MouseEvent): void {
  if (props.dismissible && e.target === el.value) close()
}

function onCancel(e: Event): void {
  if (!props.dismissible) e.preventDefault()
}

function onClose(): void {
  open.value = false
  emit('close', el.value?.returnValue ?? '')
}

onMounted(() => {
  applyClosedBy()
  if (!supportsClosedBy) el.value?.addEventListener('click', onBackdropClick)
  sync(open.value)
})
onBeforeUnmount(() => {
  el.value?.removeEventListener('click', onBackdropClick)
})
watch(open, sync, { flush: 'post' })
watch(() => props.dismissible, applyClosedBy)

defineExpose({ close })
</script>

<template>
  <dialog
    ref="el"
    class="mw-dialog"
    :aria-labelledby="titleId"
    @cancel="onCancel"
    @close="onClose"
  >
    <article class="mw-dialog__content">
      <header class="mw-dialog__header">
        <h2 :id="titleId" class="mw-dialog__title"><slot name="title">{{ title }}</slot></h2>
        <button
          v-if="dismissible"
          type="button"
          class="mw-dialog__close"
          :aria-label="closeLabel"
          @click="close()"
        >×</button>
      </header>
      <slot />
      <footer v-if="$slots.actions" class="mw-dialog__actions">
        <slot name="actions" :close="close" />
      </footer>
    </article>
  </dialog>
</template>

<style scoped>
.mw-dialog {
  --_width: v-bind(dialogWidth);
  width: var(--_width);
  max-height: 90vh;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 1.25rem 3.75rem rgb(0 0 0 / 45%);
}
.mw-dialog::backdrop {
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(2px);
}
.mw-dialog__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
}
.mw-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}
.mw-dialog__title {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: 600;
}
.mw-dialog__close {
  padding: 0 var(--space-3xs);
  border: 0;
  border-radius: var(--radius);
  background: none;
  color: var(--muted);
  font-size: var(--font-size-xl);
  line-height: 1;
  cursor: pointer;
}
.mw-dialog__close:hover {
  color: var(--text);
}
.mw-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-xs);
}
</style>
