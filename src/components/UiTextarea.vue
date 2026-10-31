<script setup lang="ts">
// A styled native <textarea>. A single root: attributes (id, rows, aria-*, placeholder, maxlength…) fall through to the textarea itself,
// and the value is `v-model`. Labelled by its context (UiFormField's label[for], or an aria-label).
const model = defineModel<string>()
</script>

<template>
  <textarea v-model="model" class="mw-textarea"></textarea>
</template>

<style scoped>
.mw-textarea {
  width: 100%;
  padding: var(--space-2xs) var(--space-xs);
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font: inherit;
  resize: vertical;
}
.mw-textarea::placeholder {
  color: var(--muted);
}
.mw-textarea:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}
.mw-textarea[aria-invalid='true'] {
  border-color: var(--danger);
}
.mw-textarea:disabled {
  filter: grayscale(0.6);
  cursor: not-allowed;
}
</style>
