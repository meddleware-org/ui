<script setup lang="ts">
// A "?" button whose tip opens on hover and on focus. WCAG 1.4.13 (content on hover or focus): the tip can be dismissed without moving the
// pointer or the focus (Escape), the pointer can move onto the tip without it closing, and it stays until dismissed or no longer hovered or
// focused. A dismissed tip stays closed until the pointer has left and focus has gone, so it cannot reopen over what the person is reading.
// The listeners are attached from script, so the wrapper stays a plain element with no handler in the template.
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{ fieldId: string }>()

const root = ref<HTMLElement | null>(null)
const dismissed = ref(false)
let hovered = false
let focused = false

function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') dismissed.value = true
}
function settle(): void {
  if (hovered || focused) return
  document.removeEventListener('keydown', onKey)
  dismissed.value = false
}
function enter(): void {
  hovered = true
  document.addEventListener('keydown', onKey)
}
function leave(): void {
  hovered = false
  settle()
}
function focusIn(): void {
  focused = true
  document.addEventListener('keydown', onKey)
}
function focusOut(): void {
  focused = false
  settle()
}

onMounted(() => {
  const el = root.value
  el?.addEventListener('mouseenter', enter)
  el?.addEventListener('mouseleave', leave)
  el?.addEventListener('focusin', focusIn)
  el?.addEventListener('focusout', focusOut)
})
onBeforeUnmount(() => {
  const el = root.value
  el?.removeEventListener('mouseenter', enter)
  el?.removeEventListener('mouseleave', leave)
  el?.removeEventListener('focusin', focusIn)
  el?.removeEventListener('focusout', focusOut)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <span ref="root" class="mw-field-hint" :class="{ 'mw-field-hint--dismissed': dismissed }">
    <button
      type="button"
      class="mw-field-hint__btn"
      :aria-describedby="`${fieldId}-hint`"
      aria-label="Help"
    >?</button>
    <span :id="`${fieldId}-hint`" role="tooltip" class="mw-field-hint__tip">
      <slot />
    </span>
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

.mw-field-hint__tip {
  position: absolute;
  top: calc(100% + var(--space-3xs));
  left: 0;
  z-index: var(--z-popover);
  min-width: calc(var(--mw-content-narrow) / 2);
  max-width: min(var(--mw-content-narrow), 90vw);
  padding: var(--space-2xs) var(--space-xs);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  line-height: var(--leading-normal);
  color: var(--text);
  box-shadow: var(--shadow-2);
  /* Not rendered until shown: a hidden tip that is only transparent still widens the page's scrollable area when it sits near the edge
     (a reflow failure at 320px). The button's aria-describedby still reaches it, as a hidden element can be a description. */
  display: none;
}

.mw-field-hint:not(.mw-field-hint--dismissed):hover .mw-field-hint__tip,
.mw-field-hint:not(.mw-field-hint--dismissed):focus-within .mw-field-hint__tip {
  display: block;
}
</style>
