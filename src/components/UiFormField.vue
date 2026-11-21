<script setup lang="ts">
// A labelled form field, using the HTML spec's own idiom for one control: a <p> holding the
// label, the control and its hint/error text (<small>). A single root keeps each field one cell
// in grid/flex form layouts.
//
// The label is associated explicitly (for/id) rather than by nesting: the `label-suffix` slot
// typically holds UiFieldHint's help <button>, and a <label> may not contain labelable elements
// other than its own control — so the suffix sits beside the label, not inside it.
//
// Content contract: the default (control) slot and `label-suffix` must be phrasing content
// (input, select, textarea, UiSelect, spans…), as required inside a <p>.
import { computed } from 'vue'

const props = defineProps<{
  /** The control's id; the label's `for` points at it. */
  id: string
  /** The label text. */
  label: string
  /** An error message; replaces the hint, marks the control invalid and is what the control is described by. */
  error?: string | null
  /** Help text under the control, shown while there is no error. */
  hint?: string
}>()

// Ids derived from the control's id, so a page with several fields never has two the same.
const errorId = computed(() => `${props.id}-err`)
const hintId = computed(() => `${props.id}-hint-text`)
// What the control must carry to be wired to its label, error and hint; handed to the slot so any control can take it with v-bind.
const slotAttrs = computed(() => ({
  id: props.id,
  'aria-invalid': props.error ? (true as const) : undefined,
  'aria-describedby': props.error ? errorId.value : props.hint ? hintId.value : undefined,
}))
// Template: A <p> holding label, control and <small> text: the HTML spec's own idiom for one control. The error is described-by when present, the hint otherwise; a field never points at both.
</script>

<template>
  <p class="mw-form-field">
    <label :for="id" class="mw-form-field__label">{{ label }}</label><slot name="label-suffix" />
    <slot :attrs="slotAttrs" />
    <small v-if="hint && !error" :id="hintId" class="mw-form-field__hint">{{ hint }}</small>
    <small v-if="error" :id="errorId" class="mw-form-field__error">{{ error }}</small>
  </p>
</template>

<style scoped>
.mw-form-field {
  margin: 0;
  /* In a flex or grid parent a field would otherwise keep the intrinsic width of its control (a file chooser, a date-time input) and
     push the page sideways on a narrow screen or at a large text size (WCAG 1.4.10). */
  min-inline-size: 0;
  max-inline-size: 100%;
}
/* The label is semibold and sits above its control with room above, so fields in a form do not run together. */
.mw-form-field__label {
  display: inline-block;
  font-weight: var(--font-weight-semibold);
  margin: var(--space-xs) 0 var(--space-3xs);
}
/* The control always starts on its own line below the label row. */
.mw-form-field :slotted(:is(input, select, textarea)) {
  display: block;
}
/* Hint and error share a layout: a small block line directly under the control. */
.mw-form-field__hint,
.mw-form-field__error {
  display: block;
  margin: var(--space-3xs) 0 0;
  font-size: var(--font-size-sm);
}
.mw-form-field__hint {
  color: var(--muted);
  font-weight: var(--font-weight-regular);
}
/* The error is in the danger colour; its wording, not the colour, says what is wrong (the copy standard). */
.mw-form-field__error {
  color: var(--danger);
}
</style>
