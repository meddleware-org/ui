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
  id: string
  label: string
  error?: string | null
  hint?: string
}>()

const errorId = computed(() => `${props.id}-err`)
const hintId = computed(() => `${props.id}-hint-text`)
const slotAttrs = computed(() => ({
  id: props.id,
  'aria-invalid': props.error ? (true as const) : undefined,
  'aria-describedby': props.error ? errorId.value : props.hint ? hintId.value : undefined,
}))
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
.mw-form-field__label {
  display: inline-block;
  font-weight: var(--font-weight-semibold);
  margin: var(--space-xs) 0 var(--space-3xs);
}
/* The control always starts on its own line below the label row. */
.mw-form-field :slotted(:is(input, select, textarea)) {
  display: block;
}
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
.mw-form-field__error {
  color: var(--danger);
}
</style>
