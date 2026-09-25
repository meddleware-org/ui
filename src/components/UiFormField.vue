<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
  label: string
  error?: string | null
  hint?: string
}>()

const errorId = computed(() => `${props.id}-err`)
const slotAttrs = computed(() => ({
  id: props.id,
  'aria-invalid': props.error ? (true as const) : undefined,
  'aria-describedby': props.error ? errorId.value : undefined,
}))
</script>

<template>
  <div class="mw-form-field">
    <label :for="id">{{ label }}<slot name="label-suffix" /></label>
    <slot :attrs="slotAttrs" />
    <p v-if="hint && !error" class="mw-form-field__hint">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="mw-form-field__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.mw-form-field label {
  display: block;
  font-weight: 600;
  margin: 0.9rem 0 0.3rem;
}
.mw-form-field__hint {
  margin: 0.25rem 0 0;
  color: var(--muted);
  font-size: var(--font-size-sm, 0.9rem);
  font-weight: 400;
}
.mw-form-field__error {
  margin: 0.25rem 0 0;
  color: var(--danger);
  font-size: var(--font-size-sm, 0.88rem);
}
</style>
