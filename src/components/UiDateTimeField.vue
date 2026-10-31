<script setup lang="ts">
// A date-and-time field that shows and edits wall-clock time in a chosen zone and exchanges UTC instants: `v-model` is an ISO 8601
// instant (or null), `zone` an IANA zone. The label names the zone, so nobody has to guess which clock they are setting.
import { computed } from 'vue'
import { fromLocalInput, toLocalInput } from '@meddleware/web-utils'
import UiFormField from './UiFormField.vue'
import UiInput from './UiInput.vue'

defineOptions({ inheritAttrs: false })
const model = defineModel<string | null>({ default: null })
const props = defineProps<{ id: string; label: string; zone: string; hint?: string; error?: string | null }>()

const local = computed({
  get: () => toLocalInput(model.value, props.zone),
  set: (v: string | number | undefined) => {
    const text = String(v ?? '')
    model.value = text === '' ? null : fromLocalInput(text, props.zone)
  },
})
</script>

<template>
  <UiFormField :id="id" :label="`${label} (${zone})`" :hint="hint" :error="error">
    <template #default="{ attrs }">
      <UiInput v-model="local" v-bind="{ ...attrs, ...$attrs }" type="datetime-local" />
    </template>
  </UiFormField>
</template>
