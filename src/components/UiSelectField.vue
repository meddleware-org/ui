<script setup lang="ts">
// A labelled select. `options` are `[value, label]` pairs; with `placeholder` an empty-valued first option is the "any" / "none" choice.
import UiFormField from './UiFormField.vue'
import UiSelect from './UiSelect.vue'

// Attributes go to the select inside the field, not to the field's wrapper.
defineOptions({ inheritAttrs: false })
/** The chosen option's value (an empty string for the placeholder). */
const model = defineModel<string>({ default: '' })
defineProps<{
  /** The select's id (the label points at it). */
  id: string
  /** The label text. */
  label: string
  /** The choices as `[value, label]` pairs. */
  options: ReadonlyArray<readonly [string, string]>
  /** When given, an empty-valued first option with this text (the "any" or "none" choice). */
  placeholder?: string
  /** Help text under the field. */
  hint?: string
  /** An error message; also marks the select invalid. */
  error?: string | null
}>()
</script>

<template>
  <UiFormField :id="id" :label="label" :hint="hint" :error="error">
    <!-- Whatever follows the label on its row (a help button, an "optional" note), passed through to the field. -->
    <template v-if="$slots['label-suffix']" #label-suffix><slot name="label-suffix" /></template>
    <template #default="{ attrs }">
      <UiSelect v-model="model" v-bind="{ ...attrs, ...$attrs }">
        <option v-if="placeholder !== undefined" value="">{{ placeholder }}</option>
        <option v-for="[value, text] in options" :key="value" :value="value">{{ text }}</option>
      </UiSelect>
    </template>
  </UiFormField>
</template>
