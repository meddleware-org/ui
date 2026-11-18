<script setup lang="ts">
// A "?" button with a short help text. The text opens on hover, on focus and when the button is pressed (a tap on a touch screen), and
// stays open until dismissed or until the pointer and focus have both gone.
//
// WCAG 1.4.13 (content on hover or focus): it can be dismissed without moving the pointer or the focus (Escape), the pointer can move onto
// it without it closing, and it stays until dismissed. A dismissed tip stays closed until the pointer has left and focus has gone, so it
// cannot reopen over what the person is reading. Pressing the button pins it open (which is also how a touch screen, with no hover and no
// focus on a tap in some browsers, opens it) and pressing it again closes it; a press elsewhere unpins it.
//
// Where it is drawn. The text is a Popover-API popover, which the browser draws in the TOP LAYER: above every other layer (a dialog
// included), and never clipped or scrolled by an ancestor. That is why a hint in a table heading no longer sits inside the table's
// scroll area and cannot add a scrollbar to it. It is placed beside the button by `placeTip` (below, above, right, left: the first
// that fits on screen; if none does, below, and the page grows to hold it). The text wraps inside a maximum width, so its background
// always contains it.
//
// The text is a <small> (the element HTML defines for side comments, and the one UiFormField uses for its own hints), so it is valid
// wherever the hint is: in a <p> as well as in a table heading. It takes phrasing content only (text, <code>, <strong>, <br>).
// Someone who needs a paragraph or a list has outgrown a tip: that belongs in the page or a UiDialog.
//
// The listeners are attached from script, so the wrapper stays a plain element with no handler in the template.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { placeTip } from '../internal/placeTip'

defineProps<{ fieldId: string }>()

const root = ref<HTMLElement | null>(null)
const tip = ref<HTMLElement | null>(null)
const open = ref(false)
const dismissed = ref(false)
let hovered = false
let focused = false
let pinned = false
let escapeListening = false
let closeTimer: ReturnType<typeof setTimeout> | undefined
let frame = 0
let observer: ResizeObserver | null = null

/** The pointer may cross the small gap between the button and the text without the text closing. */
const CLOSE_DELAY_MS = 150
/** Space between the button and the text, and kept clear at the screen's edges (in px: it is a measurement, not a style). */
const GAP = 6
const MARGIN = 8

const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true

/** Whether the text should be showing now. */
function wanted(): boolean {
  return !dismissed.value && (hovered || focused || pinned)
}

/** Measures the button and the text and writes where the text goes (document coordinates, as custom properties, through the CSSOM). */
function place(): void {
  const el = tip.value
  const anchor = root.value?.querySelector('button')
  if (!el || !anchor || !open.value) return
  const a = anchor.getBoundingClientRect()
  const t = el.getBoundingClientRect()
  const doc = document.documentElement
  const placement = placeTip(
    { left: a.left, top: a.top, width: a.width, height: a.height },
    { width: t.width, height: t.height },
    // Without the scrollbars: the root's client size, which is what a tip must stay inside to be fully visible.
    { width: doc.clientWidth, height: doc.clientHeight },
    { x: window.scrollX, y: window.scrollY },
    GAP,
    MARGIN,
  )
  el.style.setProperty('--mw-hint-x', `${placement.left}px`)
  el.style.setProperty('--mw-hint-y', `${placement.top}px`)
}

/** Places once per animation frame, however many scroll or resize events arrive. */
function schedule(): void {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    place()
  })
}

/** Listens for Escape from the first hover, focus or press until nothing is pinned, hovered or focused (once, however often it is asked). */
function listenForEscape(on: boolean): void {
  if (on === escapeListening) return
  escapeListening = on
  if (on) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
}

function onKey(e: KeyboardEvent): void {
  if (e.key !== 'Escape') return
  dismissed.value = true
  pinned = false
  apply()
}

/** A press outside the hint unpins it (a tap on a touch screen has no "pointer left"). */
function onOutside(e: Event): void {
  if (root.value && e.target instanceof Node && root.value.contains(e.target)) return
  pinned = false
  apply()
}

/** Brings the popover and the listeners in line with what is wanted. Safe to call at any time. */
function apply(): void {
  const el = tip.value
  const want = wanted()
  if (want && !open.value) {
    open.value = true
    // jsdom has no Popover API; every browser the fleet supports has it.
    el?.showPopover?.()
    document.addEventListener('pointerdown', onOutside)
    window.addEventListener('resize', schedule)
    // A scroll inside a table or panel moves the button without moving the page: capture it from every scroller.
    document.addEventListener('scroll', schedule, { capture: true, passive: true })
    place()
    if (el && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(schedule)
      observer.observe(el)
    }
  } else if (!want && open.value) {
    open.value = false
    el?.hidePopover?.()
    teardown()
  }
  // Nothing is pinned, hovered or focused any more: a dismissal ends, so the next visit can open it.
  if (!hovered && !focused && !pinned) {
    dismissed.value = false
    listenForEscape(false)
  }
}

function teardown(): void {
  observer?.disconnect()
  observer = null
  document.removeEventListener('pointerdown', onOutside)
  window.removeEventListener('resize', schedule)
  document.removeEventListener('scroll', schedule, { capture: true } as EventListenerOptions)
  if (frame) cancelAnimationFrame(frame)
  frame = 0
}

function enter(): void {
  clearTimeout(closeTimer)
  hovered = true
  listenForEscape(true)
  apply()
}
function leave(): void {
  clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    hovered = false
    apply()
  }, CLOSE_DELAY_MS)
}
function focusIn(): void {
  focused = true
  listenForEscape(true)
  apply()
}
function focusOut(): void {
  focused = false
  apply()
}
/**
 * Pressing the button pins the text open, and pressing it again closes it. It pins even when hover or focus has already opened it: a
 * touch screen sends the hover events before the click, so a tap would otherwise open the text and close it in the same instant.
 */
function press(e: Event): void {
  if (!(e.target instanceof Element) || !e.target.closest('.mw-field-hint__btn')) return
  if (pinned) {
    pinned = false
    dismissed.value = true
  } else {
    dismissed.value = false
    pinned = true
    listenForEscape(true)
  }
  apply()
}

onMounted(() => {
  const el = root.value
  el?.addEventListener('mouseenter', enter)
  el?.addEventListener('mouseleave', leave)
  el?.addEventListener('focusin', focusIn)
  el?.addEventListener('focusout', focusOut)
  el?.addEventListener('click', press)
  if (isDev && tip.value?.querySelector('p, div, ul, ol, table, pre, blockquote, h1, h2, h3, h4, h5, h6')) {
    console.warn('UiFieldHint: the hint text takes phrasing content only (text, <code>, <strong>, <br>). Put paragraphs or lists in the page or a UiDialog.')
  }
})
onBeforeUnmount(() => {
  const el = root.value
  el?.removeEventListener('mouseenter', enter)
  el?.removeEventListener('mouseleave', leave)
  el?.removeEventListener('focusin', focusIn)
  el?.removeEventListener('focusout', focusOut)
  el?.removeEventListener('click', press)
  clearTimeout(closeTimer)
  listenForEscape(false)
  if (open.value) tip.value?.hidePopover?.()
  teardown()
})
</script>

<template>
  <span ref="root" class="mw-field-hint" :class="{ 'mw-field-hint--dismissed': dismissed, 'mw-field-hint--open': open }">
    <button
      type="button"
      class="mw-field-hint__btn"
      :aria-describedby="`${fieldId}-hint`"
      aria-label="Help"
    >?</button>
    <small :id="`${fieldId}-hint`" ref="tip" popover="manual" class="mw-field-hint__tip">
      <slot />
    </small>
  </span>
</template>

<style scoped>
.mw-field-hint {
  position: relative;
  display: inline-block;
  margin-inline-start: var(--space-3xs);
  vertical-align: middle;
}

.mw-field-hint__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* 24px: the smallest target WCAG 2.5.8 accepts without space around it. */
  inline-size: calc(var(--space-sm) + var(--space-3xs));
  block-size: calc(var(--space-sm) + var(--space-3xs));
  padding: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  line-height: 1;
  border-radius: 50%;
  border: 1px solid var(--muted);
  color: var(--muted);
  background: transparent;
  cursor: help;
  /* reset any global button styles */
  font-family: inherit;
}

.mw-field-hint__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}

/* The text. It is a popover, so it is in the top layer (never clipped, and drawn above a dialog) and the browser hides it until it is
   shown. Its position is written by the component as --mw-hint-x/-y, in document coordinates, so it scrolls with the page and, when
   no side fits on screen, makes the page itself (not the table or panel that holds the button) scroll far enough to read all of it.

   (No z-index: the top layer is above every stacking context.)

   Everything the heading it sits in would pass down is reset: a table heading is nowrap, uppercase and widely spaced, and the text
   used to inherit that and run off the end of its own background. */
.mw-field-hint__tip {
  position: absolute;
  inset: auto;
  inset-inline-start: var(--mw-hint-x, 0);
  inset-block-start: var(--mw-hint-y, 0);
  margin: 0;
  /* As wide as its text, up to the narrow content width, and never wider than the screen less the margins kept clear. */
  inline-size: max-content;
  max-inline-size: min(var(--mw-content-narrow), calc(100vw - 2 * var(--space-xs)));
  box-sizing: border-box;
  padding: var(--space-2xs) var(--space-xs);
  overflow: visible;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-2);
  color: var(--text);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  line-height: var(--leading-normal);
  letter-spacing: normal;
  text-transform: none;
  text-align: start;
  white-space: normal;
  overflow-wrap: anywhere;
}
</style>
