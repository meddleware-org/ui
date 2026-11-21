<script setup lang="ts">
// A date-and-time field that shows and edits wall-clock time in a chosen zone and exchanges UTC instants: `v-model` is an ISO 8601
// instant (or null), `zone` an IANA zone. The label names the zone, so nobody has to guess which clock they are setting.
import { computed } from 'vue'
import { fromLocalInput, toLocalInput } from '@meddleware/web-utils'
import UiFormField from './UiFormField.vue'
import UiInput from './UiInput.vue'

// Attributes go to the input inside the field, not to the field's wrapper (v-bind below).
defineOptions({ inheritAttrs: false })
/** The instant as an ISO 8601 string in UTC, or null when empty. */
const model = defineModel<string | null>({ default: null })
const props = defineProps<{
  /** The input's id (the label points at it). */
  id: string
  /** The label text; the zone is appended so the zone is read with the label. */
  label: string
  /** The IANA time zone whose wall-clock time is shown and edited. */
  zone: string
  /** Help text under the field. */
  hint?: string
  /** An error message; also marks the input invalid. */
  error?: string | null
}>()

// A `datetime-local` input holds a wall time with no zone, so it is converted to and from the UTC instant through the chosen zone.
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
