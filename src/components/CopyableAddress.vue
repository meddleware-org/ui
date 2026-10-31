<script setup lang="ts">
// Displays a value (an address, blob id, tx digest, …) with a dedicated copy ICON that copies the full value to the clipboard. The value
// itself is NOT the copy trigger — only the icon is — so the value slot can hold a link (nest an <ExplorerLink> in the default slot)
// while the icon still copies. With no slot it shows the truncated `address`.
import { computed } from 'vue'
import { DEFAULT_TRUNCATE_CHARS, truncateMiddle } from '@meddleware/web-utils'
import UiCopyButton from './UiCopyButton.vue'

const props = withDefaults(
  defineProps<{
    /** The full value to copy (and to truncate for the default label). */
    address: string
    /**
     * Prefix…suffix truncation for the default label (default true). Ignored when a slot is given. Set
     * `false` wherever a user chooses where funds go (a treasury, a recipient): a truncated label can be
     * matched by a look-alike address (address poisoning).
     */
    truncate?: boolean
    /** [prefixChars, suffixChars] — only used for the default label when truncate is true. Default [12, 10]. */
    chars?: [number, number]
    /** Accessible label / tooltip for the copy button (default "Copy"). */
    label?: string
  }>(),
  { truncate: true, chars: () => [...DEFAULT_TRUNCATE_CHARS], label: 'Copy' },
)

const display = computed(() => (props.truncate ? truncateMiddle(props.address, props.chars) : props.address))
</script>

<template>
  <span class="ca-root">
    <span class="ca-value" :title="address"><slot>{{ display }}</slot></span>
    <UiCopyButton :value="address" :label="label" />
  </span>
</template>

<style scoped>
.ca-root {
  display: inline-flex;
  align-items: center;
  /* font-relative gap (em) — scales with the address text by design. */
  gap: 0.35em;
  /* A value shown whole (a 64-character address) wraps instead of widening the page. */
  max-width: 100%;
}
.ca-value {
  font-family: var(--mw-font-mono);
  font-size: inherit;
  min-width: 0;
  overflow-wrap: anywhere;
  /* A header's actions do not wrap their text, but an address may (at 200% text it is wider than a phone). */
  white-space: normal;
}
</style>
