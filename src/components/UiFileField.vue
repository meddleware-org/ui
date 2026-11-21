<script setup lang="ts">
// A labelled file chooser: UiFormField's label, hint and error around a native `<input type="file">`, with the association (id,
// aria-invalid, aria-describedby) done for you. It reports the chosen file (or `null` when the choice was cleared); reading the file is
// the caller's job.
import UiFormField from './UiFormField.vue'

defineProps<{
  /** The input's id (the label points at it). */
  id: string
  /** The label text. */
  label: string
  /** Help text under the field. */
  hint?: string
  /** An error message; also marks the input invalid. */
  error?: string | null
  /** The input's `accept` filter (media types or extensions). */
  accept?: string
  /** Disables the input. */
  disabled?: boolean
  /** Marks the input required. */
  required?: boolean
}>()
const emit = defineEmits<{
  /** The chosen file, or `null` when the choice was cleared. */
  select: [file: File | null]
}>()

/**
 * Report the chosen file to the parent.
 * @param event - the input's `change` event
 */
function onChange(event: Event): void {
  emit('select', (event.target as HTMLInputElement).files?.[0] ?? null)
}
</script>

<template>
  <UiFormField :id="id" :label="label" :hint="hint" :error="error">
    <template #default="{ attrs }">
      <!-- The field's id and ARIA wiring are passed by hand because the slot receives them as `attrs`, not as fallthrough attributes. -->
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
/* Fills its container but may shrink (`min-inline-size: 0`): a file input's intrinsic width would otherwise push a narrow layout sideways. */
.mw-file {
  inline-size: 100%;
  min-inline-size: 0;
  max-inline-size: 100%;
  color: var(--text);
  font: inherit;
}
/* The native "Choose file" button, restyled to match the rest of the controls. */
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
