<script setup lang="ts">
// Displays a value (an address, blob id, tx digest, …) with a dedicated copy ICON that copies the
// full value to the clipboard. The value itself is NOT the copy trigger — only the icon is — so the
// value slot can hold a link (nest an <ExplorerLink> in the default slot) while the icon still
// copies. With no slot it shows the truncated `address`.
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** The full value to copy (and to truncate for the default label). */
    address: string
    /** Prefix…suffix truncation for the default label (default true). Ignored when a slot is given. */
    truncate?: boolean
    /** [prefixChars, suffixChars] — only used for the default label when truncate is true. */
    chars?: [number, number]
    /** Accessible label / tooltip for the copy button (default "Copy"). */
    label?: string
  }>(),
  { truncate: true, chars: () => [6, 4], label: 'Copy' },
)

const copied = ref(false)

const display = computed(() => {
  if (!props.truncate) return props.address
  const [pre, suf] = props.chars
  return `${props.address.slice(0, pre)}…${props.address.slice(-suf)}`
})

async function copy(): Promise<void> {
  await navigator.clipboard.writeText(props.address)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1500)
}
</script>

<template>
  <span class="ca-root">
    <span class="ca-value" :title="address"><slot>{{ display }}</slot></span>
    <button
      type="button"
      class="ca-copy"
      :class="{ 'ca-copy--copied': copied }"
      :title="copied ? 'Copied!' : label"
      :aria-label="copied ? 'Copied' : label"
      @click="copy"
    >
      <!-- check when copied, copy glyph otherwise -->
      <svg
        v-if="copied"
        class="ca-icon"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <svg
        v-else
        class="ca-icon"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  </span>
</template>

<style scoped>
.ca-root {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
}
.ca-value {
  font-family: monospace;
  font-size: inherit;
}
.ca-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  color: var(--muted, #888);
  cursor: pointer;
  line-height: 1;
  transition: color 0.15s;
}
.ca-copy:hover {
  color: var(--text, #f0f0f0);
}
.ca-copy--copied {
  color: var(--accent, #6366f1);
}
.ca-icon {
  display: block;
}
</style>
