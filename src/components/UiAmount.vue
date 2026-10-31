<script setup lang="ts">
// A SUI/WAL amount written from its base units (MIST / FROST), exactly: through bigint digits, never a float. A `<data>` element carries
// the machine value. By default the figure is rounded for reading (four decimals, but a tiny amount shows its significant digits);
// `exact` writes every digit, for where a person approves a payment.
import { computed } from 'vue'
import { formatCoinAmount, formatCoinExact } from '@meddleware/web-utils'

const props = withDefaults(
  defineProps<{
    /** The amount in base units: a bigint, an integer, or a decimal string of an integer. */
    value: bigint | number | string | null | undefined
    symbol?: string
    exact?: boolean
  }>(),
  { symbol: 'SUI', exact: false },
)

const base = computed<bigint | null>(() => {
  const v = props.value
  if (v === null || v === undefined) return null
  try {
    return typeof v === 'bigint' ? v : BigInt(typeof v === 'number' ? Math.trunc(v) : v.trim())
  } catch {
    return null
  }
})
const text = computed(() => (base.value === null ? '—' : (props.exact ? formatCoinExact : formatCoinAmount)(base.value, props.symbol)))
</script>

<template>
  <data class="mw-amount" :value="base === null ? undefined : base.toString()">{{ text }}</data>
</template>

<style scoped>
.mw-amount {
  font-family: var(--mw-font-mono);
  white-space: nowrap;
}
</style>
