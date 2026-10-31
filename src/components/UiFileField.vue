<script setup lang="ts">
// A labelled file chooser: UiFormField's label, hint and error around a native `<input type="file">`, with the association (id,
// aria-invalid, aria-describedby) done for you. It reports the chosen file (or `null` when the choice was cleared); reading the file is
// the caller's job.
import UiFormField from './UiFormField.vue'

defineProps<{
  id: string
  label: string
  hint?: string
  error?: string | null
  /** The input's `accept` filter (media types or extensions). */
  accept?: string
  disabled?: boolean
  required?: boolean
}>()
const emit = defineEmits<{ select: [file: File | null] }>()

function onChange(event: Event): void {
  emit('select', (event.target as HTMLInputElement).files?.[0] ?? null)
}
</script>

<template>
  <UiFormField :id="id" :label="label" :hint="hint" :error="error">
    <template #default="{ attrs }">
      <input
        :id="attrs.id"
        type="file"
        class="mw-file"
        :accept="accept"
        :disabled="disabled"
        :required="required"
        :aria-invalid="attrs['aria-invalid']"
        :aria-describedby="attrs['aria-describedby']"
        @change="onChange"
      />
    </template>
  </UiFormField>
</template>

<style scoped>
.mw-file {
  max-width: 100%;
  color: var(--text);
  font: inherit;
}
.mw-file::file-selector-button {
  margin-inline-end: var(--space-xs);
  padding: var(--space-2xs) var(--space-xs);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  cursor: pointer;
}
.mw-file:disabled {
  filter: grayscale(0.6);
  cursor: not-allowed;
}
</style>
