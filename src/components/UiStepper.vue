<script setup lang="ts">
// Steps in a sequence. Two uses:
//   • A wizard: `modelValue` is the current step's index; earlier steps are buttons that go back, later ones are upcoming.
//   • A progress list: give steps a `status` (`done`, `busy`, `error`, `pending`) and they show exactly that, in words for assistive
//     technology as well as in the badge (`orientation="vertical"` suits a running list).
import { computed } from 'vue'

export type StepStatus = 'done' | 'busy' | 'error' | 'pending'

export interface StepperStep {
  id: string
  label: string
  /** Explicit state, overriding the one derived from `modelValue`. */
  status?: StepStatus
}

const props = withDefaults(
  defineProps<{
    steps: StepperStep[]
    /** Index of the current step in a wizard (ignored for steps that have a `status`). */
    modelValue?: number
    orientation?: 'horizontal' | 'vertical'
  }>(),
  { modelValue: 0, orientation: 'horizontal' },
)

const emit = defineEmits<{
  'update:modelValue': [index: number]
}>()

type State = StepStatus | 'active' | 'upcoming'
/** Each step's state, worked out once per change (not once per use in the template). */
const states = computed<State[]>(() =>
  props.steps.map((s, i) => s.status ?? (i < props.modelValue ? 'done' : i === props.modelValue ? 'active' : 'upcoming')),
)
const SAYS: Partial<Record<State, string>> = { done: 'done', busy: 'in progress', error: 'failed', pending: 'not started' }
const GLYPH: Partial<Record<State, string>> = { done: '✓', error: '✗' }

function onClick(i: number): void {
  if (!props.steps[i]?.status && i < props.modelValue) emit('update:modelValue', i)
}
</script>

<template>
  <ol class="ui-stepper" :class="`ui-stepper--${orientation}`" role="list">
    <li
      v-for="(step, i) in steps"
      :key="step.id"
      class="ui-stepper__step"
      :class="`is-${states[i]}`"
      :aria-current="states[i] === 'active' ? 'step' : undefined"
    >
      <!-- A completed wizard step is a button (go back); every other badge is decorative: the state is said in words. -->
      <button
        v-if="!step.status && states[i] === 'done'"
        type="button"
        class="ui-stepper__badge"
        :aria-label="`Back to ${step.label}`"
        @click="onClick(i)"
      >✓</button>
      <span v-else class="ui-stepper__badge" aria-hidden="true">
        <span v-if="states[i] === 'busy'" class="mw-spinner" />
        <template v-else>{{ GLYPH[states[i]!] ?? i + 1 }}</template>
      </span>
      <span class="ui-stepper__label">{{ step.label }}</span>
      <span v-if="step.status && SAYS[states[i]!]" class="mw-visually-hidden">, {{ SAYS[states[i]!] }}</span>
    </li>
  </ol>
</template>

<style scoped>
.ui-stepper {
  display: flex;
  list-style: none;
  margin: 0 0 var(--space-md);
  padding: 0;
}
.ui-stepper--vertical {
  flex-direction: column;
  gap: var(--space-xs);
  margin: 0;
}

.ui-stepper__step {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2xs);
  position: relative;
  min-width: 0;
}
.ui-stepper--vertical .ui-stepper__step {
  flex-direction: row;
  align-items: center;
  gap: var(--space-xs);
}

/* Connecting line entering this step from the previous one (horizontal only). */
.ui-stepper--horizontal .ui-stepper__step:not(:first-child)::before {
  content: '';
  position: absolute;
  top: var(--space-xs); /* half of the badge */
  right: 50%;
  left: -50%;
  height: var(--space-4xs);
  background: var(--border);
  z-index: 0;
}
.ui-stepper--horizontal .ui-stepper__step.is-done::before,
.ui-stepper--horizontal .ui-stepper__step.is-active::before {
  background: var(--accent);
}

.ui-stepper__badge {
  position: relative;
  z-index: var(--z-raised);
  width: var(--space-md);
  height: var(--space-md);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  flex-shrink: 0;
  border: var(--space-4xs) solid var(--border);
  background: var(--surface);
  color: var(--muted);
  cursor: default;
  /* reset button appearance */
  font-family: inherit;
  padding: 0;
  transition: background-color var(--transition-base), border-color var(--transition-base);
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
  color: var(--accent-contrast);
}
.is-active .ui-stepper__badge,
.is-busy .ui-stepper__badge {
  background: color-mix(in srgb, var(--accent) 12%, var(--surface));
  border-color: var(--accent);
  color: var(--accent);
}
.is-error .ui-stepper__badge {
  background: color-mix(in srgb, var(--danger) 12%, var(--surface));
  border-color: var(--danger);
  color: var(--danger);
}

.ui-stepper__label {
  font-size: var(--font-size-sm);
  text-align: center;
  color: var(--muted);
  max-width: 100%;
  line-height: var(--leading-tight);
}
.ui-stepper--horizontal .ui-stepper__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ui-stepper--vertical .ui-stepper__label {
  text-align: start;
}
.is-done .ui-stepper__label,
.is-active .ui-stepper__label,
.is-busy .ui-stepper__label,
.is-error .ui-stepper__label {
  color: var(--text);
}
.is-active .ui-stepper__label,
.is-busy .ui-stepper__label {
  font-weight: var(--font-weight-semibold);
}
</style>
