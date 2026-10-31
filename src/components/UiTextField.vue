<script setup lang="ts">
// A labelled text input (a textarea when `rows` is given): UiFormField's label, hint and error around a UiInput or UiTextarea, with the
// association (id, aria-invalid, aria-describedby) done for you. Other attributes (`maxlength`, `placeholder`, `required`, `disabled`,
// `inputmode`, `autocomplete`…) go to the control.
import UiFormField from './UiFormField.vue'
import UiInput from './UiInput.vue'
import UiTextarea from './UiTextarea.vue'

defineOptions({ inheritAttrs: false })
const model = defineModel<string>({ default: '' })
withDefaults(
  defineProps<{
    id: string
    label: string
    type?: 'text' | 'url' | 'number' | 'search' | 'email' | 'password'
    /** Render a textarea of this many rows. */
    rows?: number
    hint?: string
    error?: string | null
  }>(),
  { type: 'text', rows: undefined, hint: undefined, error: null },
)
</script>

<template>
  <UiFormField :id="id" :label="label" :hint="hint" :error="error">
    <!-- Whatever follows the label on its row (a help button, an "optional" note), passed through to the field. -->
    <template v-if="$slots['label-suffix']" #label-suffix><slot name="label-suffix" /></template>
    <template #default="{ attrs }">
      <UiTextarea v-if="rows" v-model="model" v-bind="{ ...attrs, ...$attrs }" :rows="rows" />
      <UiInput v-else v-model="model" autocomplete="off" v-bind="{ ...attrs, ...$attrs }" :type="type" />
    </template>
  </UiFormField>
</template>
