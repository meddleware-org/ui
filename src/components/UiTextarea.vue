<script setup lang="ts">
// A styled native <textarea>. A single root: attributes (id, rows, aria-*, placeholder, maxlength…) fall through to the textarea itself,
// and the value is `v-model`. Labelled by its context (UiFormField's label[for], or an aria-label).
/** The textarea's value. */
const model = defineModel<string>()
</script>

<template>
  <textarea v-model="model" class="mw-textarea"></textarea>
</template>

<style scoped>
/* Same look as UiInput (token surface, 3:1 control border); only vertical resizing, so it cannot be dragged wider than its container. */
.mw-textarea {
  width: 100%;
  padding: var(--space-2xs) var(--space-xs);
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--control-border);
  border-radius: var(--radius);
  font: inherit;
  resize: vertical;
}
/* A placeholder is hint text, not a value. */
.mw-textarea::placeholder {
  color: var(--muted);
}
/* The ring sits outside the border so it is never clipped. */
.mw-textarea:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}
/* Drawn from aria-invalid, which the field sets, so the colour and the announcement agree. */
.mw-textarea[aria-invalid='true'] {
  border-color: var(--danger);
}
/* Greyed with a filter, not opacity (see UiInput). */
.mw-textarea:disabled {
  filter: grayscale(0.6);
  cursor: not-allowed;
}
</style>
