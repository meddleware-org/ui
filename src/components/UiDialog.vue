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
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, useId, watch } from 'vue'

/** Whether the dialog is open (`v-model:open`); it is set to false when the dialog closes by any route. */
const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(
  defineProps<{
    /** Dialog heading (also its accessible name). Override the markup with the `title` slot. */
    title?: string
    /** Allow closing via Escape, backdrop click and the close button. */
    dismissible?: boolean
    /** Accessible label for the header close button. */
    closeLabel?: string
    /** CSS width of the dialog (default: the narrow content width, `--mw-content-narrow`, capped at 90vw). */
    width?: string
    /** Heading rank (default 2), to fit the page's outline. */
    level?: 2 | 3 | 4 | 5 | 6
  }>(),
  { dismissible: true, closeLabel: 'Close', level: 2 },
)

const emit = defineEmits<{
  /** Fired whenever the dialog closes, with the value passed to `close()` ('' if dismissed). */
  close: [returnValue: string]
}>()

// The native <dialog> element, which does the modal work.
const el = ref<HTMLDialogElement | null>(null)
// A unique id for the heading, so `aria-labelledby` names this dialog even when several are on a page.
const titleId = useId()
// The CSS width, bound into the stylesheet with `v-bind`.
const dialogWidth = computed(() => props.width ?? 'min(var(--mw-content-narrow), 90vw)')

// The `closedby` attribute (light dismiss) is newer than <dialog>; where it is missing a backdrop-click listener is added instead.
const supportsClosedBy = typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype

/**
 * Close the dialog, if it is open.
 * @param returnValue - handed to the `close` event (an empty string when dismissed)
 */
function close(returnValue = ''): void {
  if (el.value?.open) el.value.close(returnValue)
}

/**
 * Make the element match the `open` model: show it modally, or close it.
 * @param isOpen - the wanted state
 */
function sync(isOpen: boolean): void {
  const d = el.value
  if (!d) return
  if (isOpen && !d.open) d.showModal()
  else if (!isOpen && d.open) d.close()
}

// What counts as a control inside the dialog, for deciding whether the dialog itself must be a tab stop.
const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

/**
 * A dialog that holds no control (a progress report) can still overflow at a large text size, and a scrollable region must be reachable
 * from the keyboard (WCAG 2.1.1; axe `scrollable-region-focusable`). With no control inside, the dialog itself takes a tab stop, so the
 * arrow keys scroll it; with one, that control is the way in and the dialog stays out of the tab order.
 */
function syncFocusable(): void {
  const d = el.value
  if (!d) return
  if (d.querySelector(FOCUSABLE)) d.removeAttribute('tabindex')
  else d.setAttribute('tabindex', '0')
}

/** Set `closedby`: `any` lets Escape and a click on the backdrop close the dialog, `none` forbids both (a dialog that must be answered). */
function applyClosedBy(): void {
  // Not yet in Vue's DialogHTMLAttributes typings, so set it directly.
  el.value?.setAttribute('closedby', props.dismissible ? 'any' : 'none')
}

/**
 * Fallback light dismiss for browsers without `closedby`: the article fills the dialog box, so a click whose target is the <dialog> itself can
 * only have landed on the backdrop.
 * @param e - the click event on the dialog
 */
function onBackdropClick(e: MouseEvent): void {
  if (props.dismissible && e.target === el.value) close()
}

/**
 * The browser's Escape handling: cancel it for a dialog that is not dismissible.
 * @param e - the `cancel` event
 */
function onCancel(e: Event): void {
  if (!props.dismissible) e.preventDefault()
}

/** Whatever closed the dialog (Escape, the button, a form, `close()`), keep the model in step and tell the parent. */
function onClose(): void {
  open.value = false
  emit('close', el.value?.returnValue ?? '')
}

onMounted(() => {
  applyClosedBy()
  syncFocusable()
  if (!supportsClosedBy) el.value?.addEventListener('click', onBackdropClick)
  sync(open.value)
})
onUpdated(syncFocusable)
onBeforeUnmount(() => {
  el.value?.removeEventListener('click', onBackdropClick)
})
watch(open, sync, { flush: 'post' })
watch(() => props.dismissible, applyClosedBy)

// A parent can close the dialog from outside (for instance after a successful action) through a template ref.
defineExpose({ close })
// Template: No click handler on the <dialog> in the template: Escape and backdrop dismissal come from `closedby`, or from the listener added in onMounted.
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
        <component :is="`h${level}`" :id="titleId" class="mw-dialog__title"><slot name="title">{{ title }}</slot></component>
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
/* The dialog box: a token surface and a large shadow, as wide as the narrow content width by default and never taller than the viewport. */
.mw-dialog {
  --_width: v-bind(dialogWidth);
  width: var(--_width);
  max-height: 90dvh;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-3);
}
/* The backdrop uses the shared token and a slight blur, so the page behind reads as out of reach. */
.mw-dialog::backdrop {
  background: var(--backdrop);
  backdrop-filter: blur(var(--space-4xs));
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
  font-weight: var(--font-weight-semibold);
}
/* The close button is a plain × (an icon-sized target); its accessible name is the `closeLabel` prop. */
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
/* Actions sit at the inline end and wrap rather than overflow at a large text size. */
.mw-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-xs);
}
</style>
