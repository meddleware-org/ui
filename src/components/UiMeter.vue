<script setup lang="ts">
// A native <meter> with its numbers and its state in words next to it, so the colour is never the only signal. The fill is green up to
// half the limit, amber to 80 %, and red above that; the sentence says "within", "close to" or "over by".
import { computed, useId } from 'vue'

const props = defineProps<{
  label: string
  used: number
  limit: number | null
  unit?: string
  /** Format the numbers (default: as integers). */
  format?: (n: number) => string
}>()

const id = useId()
const fmt = (n: number) => (props.format ? props.format(n) : String(n))
const max = computed(() => Math.max(props.limit ?? 0, 1))
const over = computed(() => props.limit !== null && props.used > props.limit)
const state = computed(() => {
  if (props.limit === null) return 'no limit'
  if (over.value) return `over by ${fmt(props.used - props.limit)}`
  return props.limit > 0 && props.used / props.limit >= 0.8 ? 'close to the limit' : 'within the limit'
})
const summary = computed(() => `${fmt(props.used)}${props.limit !== null ? ` / ${fmt(props.limit)}` : ''}${props.unit ? ` ${props.unit}` : ''} — ${state.value}`)
</script>

<template>
  <div class="mw-meter">
    <label :for="id" class="mw-meter__label">{{ label }}</label>
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
.mw-meter {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  align-items: center;
}
.mw-meter__label {
  font-weight: var(--font-weight-semibold);
}
.mw-meter__text {
  font-size: var(--font-size-sm);
  color: var(--muted);
}
.mw-meter__text--over {
  color: var(--danger);
  font-weight: var(--font-weight-semibold);
}

/* Native meter, restyled with the role tokens (the track is --lift; the fills are roles that keep 3:1 against it). */
.mw-meter__bar {
  width: 10rem;
  height: var(--space-xs);
  appearance: none;
  background: var(--lift);
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
}
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
