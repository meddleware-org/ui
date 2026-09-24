<script setup lang="ts">
export interface StepperStep {
  id: string
  label: string
}

const props = defineProps<{
  steps: StepperStep[]
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [index: number]
}>()

function stepState(i: number): 'done' | 'active' | 'upcoming' {
  if (i < props.modelValue) return 'done'
  if (i === props.modelValue) return 'active'
  return 'upcoming'
}

function onClick(i: number): void {
  if (i < props.modelValue) emit('update:modelValue', i)
}
</script>

<template>
  <ol class="ui-stepper" role="list">
    <li
      v-for="(step, i) in steps"
      :key="step.id"
      class="ui-stepper__step"
      :class="`is-${stepState(i)}`"
    >
      <component
        :is="stepState(i) === 'done' ? 'button' : 'span'"
        class="ui-stepper__badge"
        :type="stepState(i) === 'done' ? 'button' : undefined"
        :aria-label="stepState(i) === 'done' ? `Back to ${step.label}` : undefined"
        :aria-current="stepState(i) === 'active' ? 'step' : undefined"
        @click="stepState(i) === 'done' && onClick(i)"
      >
        <span v-if="stepState(i) === 'done'" aria-hidden="true">✓</span>
        <span v-else aria-hidden="true">{{ i + 1 }}</span>
      </component>
      <span class="ui-stepper__label">{{ step.label }}</span>
    </li>
  </ol>
</template>

<style scoped>
.ui-stepper {
  display: flex;
  list-style: none;
  margin: 0 0 var(--space-md, 1.5rem);
  padding: 0;
}

.ui-stepper__step {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  position: relative;
  min-width: 0;
}

/* Connecting line entering this step from the previous one */
.ui-stepper__step:not(:first-child)::before {
  content: '';
  position: absolute;
  top: 1rem; /* half of 2rem badge */
  right: 50%;
  left: -50%;
  height: 2px;
  background: var(--border);
  z-index: 0;
}

.ui-stepper__step.is-done::before,
.ui-stepper__step.is-active::before {
  background: var(--accent);
}

.ui-stepper__badge {
  position: relative;
  z-index: 1;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1;
  flex-shrink: 0;
  border: 2px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  cursor: default;
  /* reset button appearance */
  font-family: inherit;
  padding: 0;
  transition: background-color var(--transition-base, 0.2s), border-color var(--transition-base, 0.2s);
}

button.ui-stepper__badge {
  cursor: pointer;
}

button.ui-stepper__badge:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.is-done .ui-stepper__badge {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.is-active .ui-stepper__badge {
  background: color-mix(in srgb, var(--accent) 12%, var(--surface));
  border-color: var(--accent);
  color: var(--accent);
}

.ui-stepper__label {
  font-size: 0.78rem;
  text-align: center;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.2;
}

.is-done .ui-stepper__label,
.is-active .ui-stepper__label {
  color: var(--text);
}

.is-active .ui-stepper__label {
  font-weight: 600;
}
</style>
