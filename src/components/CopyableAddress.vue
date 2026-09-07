<script setup lang="ts">
// Displays a blockchain address (truncated by default) and copies the full address to the
// clipboard on click. Uses a transient "Copied!" label to confirm the action.
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  address: string
  /** Show prefix…suffix truncation (default true). Full address shown in title attribute always. */
  truncate?: boolean
  /** [prefixChars, suffixChars] — only used when truncate is true. */
  chars?: [number, number]
}>(), {
  truncate: true,
  chars: () => [6, 4],
})

const copied = ref(false)

const label = computed(() => {
  if (copied.value) return 'Copied!'
  if (!props.truncate) return props.address
  const [pre, suf] = props.chars
  return `${props.address.slice(0, pre)}…${props.address.slice(-suf)}`
})

async function copy(): Promise<void> {
  await navigator.clipboard.writeText(props.address)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}
</script>

<template>
  <button
    type="button"
    class="ca-root"
    :class="{ 'ca-root--copied': copied }"
    :title="address"
    @click="copy"
  >{{ label }}</button>
</template>

<style scoped>
.ca-root {
  display: inline-block;
  background: none;
  border: none;
  padding: 0;
  font-family: monospace;
  font-size: inherit;
  color: var(--muted, #888);
  cursor: pointer;
  text-decoration: underline dotted;
  text-underline-offset: 2px;
  transition: color 0.15s;
}

.ca-root:hover {
  color: var(--text, #f0f0f0);
}

.ca-root--copied {
  color: var(--accent, #6366f1);
  text-decoration: none;
}
</style>
