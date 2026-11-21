<script setup lang="ts">
// Used for quotas and caps (a spending cap, a storage limit): anywhere "how much of how much" matters more than a bare number.
// A native <meter> with its numbers and its state in words next to it, so the colour is never the only signal. The fill is green up to
// half the limit, amber to 80 %, and red above that; the sentence says "within", "close to" or "over by".
import { computed, useId } from 'vue'

const props = defineProps<{
  /** What is measured (the meter's label). */
  label: string
  /** How much has been used. */
  used: number
  /** The limit; `null` means there is none, and then no bar is drawn. */
  limit: number | null
  /** A unit written after the numbers (`GiB`, `requests`). */
  unit?: string
  /** Format the numbers (default: as integers). */
  format?: (n: number) => string
}>()

// A unique id per instance, so the label points at the right meter when several are on a page.
const id = useId()
/** A number as the caller's format, or as an integer. */
const fmt = (n: number) => (props.format ? props.format(n) : String(n))
// The meter's scale: at least 1, so a limit of 0 does not make an invalid `max`.
const max = computed(() => Math.max(props.limit ?? 0, 1))
// Over the limit: shown in words and in the danger colour, never by colour alone.
const over = computed(() => props.limit !== null && props.used > props.limit)
// The state as a phrase: the colour of the bar is a second signal, this sentence is the first.
const state = computed(() => {
  if (props.limit === null) return 'no limit'
  if (over.value) return `over by ${fmt(props.used - props.limit)}`
  return props.limit > 0 && props.used / props.limit >= 0.8 ? 'close to the limit' : 'within the limit'
})
// "12 / 40 GiB — within the limit": the whole readout as one string.
const summary = computed(() => `${fmt(props.used)}${props.limit !== null ? ` / ${fmt(props.limit)}` : ''}${props.unit ? ` ${props.unit}` : ''} — ${state.value}`)
// Template: A native <meter> (role=meter) with a real <label for>, and the figures and the state as visible text beside it.
</script>

<template>
  <div class="mw-meter">
    <label :for="id" class="mw-meter__label">{{ label }}</label>
    <!-- low and high set the green / amber / red bands at 50% and 80% of the limit; optimum 0 makes lower better. -->
    <meter
      v-if="limit !== null"
      :id="id"
      class="mw-meter__bar"
      :value="Math.min(used, max)"
      min="0"
      :max="max"
      :low="max * 0.5"
      :high="max * 0.8"
      optimum="0"
    >
      {{ fmt(used) }} of {{ fmt(limit) }}
    </meter>
    <span class="mw-meter__text" :class="{ 'mw-meter__text--over': over }">{{ summary }}</span>
  </div>
</template>

<style scoped>
/* Label, bar and text in a wrapping row. */
.mw-meter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  align-items: center;
}
/* The label is semibold so it reads as the name of the measurement, not as part of the figures. */
.mw-meter__label {
  font-weight: var(--font-weight-semibold);
}
/* The readout in the muted colour (AAA); the state phrase is in it, so the bar's colour is never the only signal. */
.mw-meter__text {
  font-size: var(--font-size-sm);
  color: var(--muted);
}
/* Over the limit: the danger colour and a heavier weight, in addition to the words "over by". */
.mw-meter__text--over {
  color: var(--danger);
  font-weight: var(--font-weight-semibold);
}

/* Native meter, restyled with the role tokens (the track is --lift; the fills are roles that keep 3:1 against it). */
/* A fixed 10rem bar (a readable length that fits a phone beside its label); the native meter is drawn with the role tokens below. */
.mw-meter__bar {
  width: 10rem;
  height: var(--space-xs);
  appearance: none;
  background: var(--lift);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
}
/* WebKit and Blink draw a meter from pseudo-elements: the track, then one fill per band (optimum, suboptimum, even-less-good). */
.mw-meter__bar::-webkit-meter-bar {
  background: var(--lift);
  border: 0;
  border-radius: var(--radius-xs);
}
.mw-meter__bar::-webkit-meter-optimum-value {
  background: var(--ok);
}
.mw-meter__bar::-webkit-meter-suboptimum-value {
  background: var(--warning-text);
}
.mw-meter__bar::-webkit-meter-even-less-good-value {
  background: var(--danger);
}
/* Firefox has its own pseudo-classes for the same three bands; the colours are the same roles, so the meter reads alike in every engine. */
.mw-meter__bar:-moz-meter-optimum::-moz-meter-bar {
  background: var(--ok);
}
.mw-meter__bar:-moz-meter-sub-optimum::-moz-meter-bar {
  background: var(--warning-text);
}
.mw-meter__bar:-moz-meter-sub-sub-optimum::-moz-meter-bar {
  background: var(--danger);
}
</style>
