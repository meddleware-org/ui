<script setup lang="ts">
// Segmented control — radio-group–based selection between labelled options.
// Semantically distinct from AppTabNav (navigation): this is a form input
// control for switching between mutually exclusive modes within a single view.
// The hidden radio inputs keep keyboard + screen-reader semantics correct; a shared `name`
// makes them one native radio group (arrow keys move the selection).
import { useId } from 'vue'

export interface SegmentedOption {
  id: string
  label: string
  disabled?: boolean
  title?: string
}

defineProps<{
  options: SegmentedOption[]
  modelValue: string
  ariaLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

const groupName = useId()
</script>

<template>
  <!-- Canonical radio-group markup: the fieldset carries the segmented-pill styling and the
       (visually hidden) legend names the group. -->
  <fieldset class="mw-seg">
    <legend v-if="ariaLabel" class="mw-visually-hidden">{{ ariaLabel }}</legend>
    <label
      v-for="opt in options"
      :key="opt.id"
      class="mw-seg__item"
      :class="{
        'mw-seg__item--active': modelValue === opt.id,
        'mw-seg__item--disabled': opt.disabled,
      }"
      :title="opt.title"
    >
      <input
        type="radio"
        :name="groupName"
        :value="opt.id"
        :checked="modelValue === opt.id"
        :disabled="opt.disabled"
        @change="emit('update:modelValue', opt.id)"
      />
      {{ opt.label }}
    </label>
  </fieldset>
</template>

<style scoped>
.mw-seg {
  display: inline-flex;
  margin: 0;
  padding: 0;
  min-inline-size: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.mw-seg__item {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Fixed height + horizontal-only padding: background fills the full cell cleanly
     with no top/bottom gap artefacts from line-height + padding interaction. */
  height: 2rem;
  padding: 0 var(--space-sm);
  /* Reset any host-app label margin (e.g. form label rules) — items in a continuous
     segmented group must never carry external margin. */
  margin: 0;
  border-right: 1px solid var(--border);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--muted);
  background: transparent;
  transition: background var(--transition-base), color var(--transition-base);
  user-select: none;
  white-space: nowrap;
}

.mw-seg__item:last-child {
  border-right: none;
}

.mw-seg__item--active {
  background: var(--accent);
  color: var(--accent-contrast);
}

/* The radio itself is hidden, so surface its keyboard focus on the segment. */
.mw-seg__item:has(input:focus-visible) {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}

.mw-seg__item--disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

.mw-seg__item input[type='radio'] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}
</style>
