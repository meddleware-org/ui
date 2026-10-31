<script setup lang="ts">
// A labelled select. `options` are `[value, label]` pairs; with `placeholder` an empty-valued first option is the "any" / "none" choice.
import UiFormField from './UiFormField.vue'
import UiSelect from './UiSelect.vue'

defineOptions({ inheritAttrs: false })
const model = defineModel<string>({ default: '' })
defineProps<{
  id: string
  label: string
  options: ReadonlyArray<readonly [string, string]>
  placeholder?: string
  hint?: string
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
