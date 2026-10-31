<script setup lang="ts">
// A styled native <input> (type `text` unless a `type` attribute says otherwise). A single root: attributes (id, type, aria-*, placeholder, disabled…) fall through to the input itself, and the
// value is `v-model`. Labelled by its context (UiFormField's label[for], or an aria-label); this primitive carries no label of its own.
const model = defineModel<string | number>()
</script>

<template>
  <input v-model="model" type="text" class="mw-input" />
</template>

<style scoped>
.mw-input {
  width: 100%;
  padding: var(--space-2xs) var(--space-xs);
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font: inherit;
}
.mw-input::placeholder {
  color: var(--muted);
}
/* A date-time input is a group of editable segments; WebKit leaves :focus-visible off the input while a segment holds focus. */
.mw-input:is(:focus-visible, :focus-within) {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}
.mw-input[aria-invalid='true'] {
  border-color: var(--danger);
}
.mw-input:disabled {
  filter: grayscale(0.6);
  cursor: not-allowed;
}
</style>
