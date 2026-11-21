<script setup lang="ts">
// Steps in a sequence. Two uses:
//   • A wizard: `modelValue` is the current step's index; earlier steps are buttons that go back, later ones are upcoming.
//   • A progress list: give steps a `status` (`done`, `busy`, `error`, `pending`) and they show exactly that, in words for assistive
//     technology as well as in the badge (`orientation="vertical"` suits a running list).
import { computed } from 'vue'

/** A step's explicit state in a progress list. */
export type StepStatus = 'done' | 'busy' | 'error' | 'pending'

/** One step. */
export interface StepperStep {
  /** A stable key for the step. */
  id: string
  /** The step's visible name. */
  label: string
  /** Explicit state, overriding the one derived from `modelValue`. */
  status?: StepStatus
}

// A wizard needs `modelValue`; a progress list gives each step a `status` instead. Both are described in the header comment.
const props = withDefaults(
  defineProps<{
    /** The steps, in order. */
    steps: StepperStep[]
    /** Index of the current step in a wizard (ignored for steps that have a `status`). */
    modelValue?: number
    /** A row (default) for a wizard, or a column for a running list. */
    orientation?: 'horizontal' | 'vertical'
  }>(),
  { modelValue: 0, orientation: 'horizontal' },
)

const emit = defineEmits<{
  /** An earlier step was pressed to go back to it; the argument is its index. */
  'update:modelValue': [index: number]
}>()

/** A step's state: an explicit status, or `active` / `upcoming` derived from the current index. */
type State = StepStatus | 'active' | 'upcoming'
/** Each step's state, worked out once per change (not once per use in the template). */
// Index below the current is done, the current is active, the rest upcoming; an explicit `status` always wins (the progress-list use).
const states = computed<State[]>(() =>
  props.steps.map((s, i) => s.status ?? (i < props.modelValue ? 'done' : i === props.modelValue ? 'active' : 'upcoming')),
)
// The words said to assistive technology for a step with an explicit status (the badge itself is decorative).
const SAYS: Partial<Record<State, string>> = { done: 'done', busy: 'in progress', error: 'failed', pending: 'not started' }
// The glyph in the badge for a state; other states show the step number.
const GLYPH: Partial<Record<State, string>> = { done: '✓', error: '✗' }

/**
 * Go back to an earlier step of a wizard. Steps with an explicit `status` and steps at or after the current one cannot be jumped to.
 * @param i - the index of the pressed step
 */
function onClick(i: number): void {
  if (!props.steps[i]?.status && i < props.modelValue) emit('update:modelValue', i)
}
// Template: An ordered list: the steps are a sequence. role="list" is explicit because the markers are removed (Safari with VoiceOver drops the list otherwise).
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
/* A row of equal steps (a column in the vertical layout, below). */
.ui-stepper {
  display: flex;
  list-style: none;
  margin: 0 0 var(--space-md);
  padding: 0;
}
/* Vertical: one step per row, for a running list of tasks. */
.ui-stepper--vertical {
  flex-direction: column;
  gap: var(--space-xs);
  margin: 0;
}

/* Each step takes an equal share of the row and stacks its badge over its label. `min-width: 0` lets a long label shrink and truncate. */
.ui-stepper__step {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2xs);
  position: relative;
  min-width: 0;
}
/* In the vertical layout the badge sits beside its label. */
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
/* The line up to a reached step is drawn in the accent, so the completed stretch is visible. */
.ui-stepper--horizontal .ui-stepper__step.is-done::before,
.ui-stepper--horizontal .ui-stepper__step.is-active::before {
  background: var(--accent);
}

/* The numbered circle. It is a plain span, or a button for a completed wizard step; the button reset below makes them look the same. */
.ui-stepper__badge {
  position: relative;
  /* Above the connecting line, which runs behind the badges. */
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
  /* reset button appearance (a completed step is a <button>; the other badges are spans) */
  font-family: inherit;
  padding: 0;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}
/* Only the button form (a completed wizard step) shows the pointer and a focus ring. */
button.ui-stepper__badge {
  cursor: pointer;
}
button.ui-stepper__badge:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
/* State colours: done is a solid accent fill, active and busy an accent outline on a faint tint, error the danger colour; each also has a glyph or words. */
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
/* The error badge is the danger colour with a ✗ glyph; the words "failed" are also read out for a progress list. */
.is-error .ui-stepper__badge {
  background: color-mix(in srgb, var(--danger) 12%, var(--surface));
  border-color: var(--danger);
  color: var(--danger);
}

/* Labels are muted until a step has been reached, so progress reads at a glance; they stay in readable text colours (AAA). */
.ui-stepper__label {
  /* A tight line height keeps a two-line label compact beside its badge. */
  font-size: var(--font-size-sm);
  text-align: center;
  color: var(--muted);
  max-width: 100%;
  line-height: var(--leading-tight);
}
/* A horizontal label stays on one line and is cut with an ellipsis rather than wrapping the whole row. */
.ui-stepper--horizontal .ui-stepper__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Vertical labels read from the inline start, beside their badge. */
.ui-stepper--vertical .ui-stepper__label {
  text-align: start;
}
/* A reached step's label takes the full text colour; the active (or busy) one is also semibold. */
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
