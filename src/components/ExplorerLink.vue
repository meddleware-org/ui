<script setup lang="ts">
// A block-explorer link. Chain-agnostic: it just renders `href` as an external anchor with a
// truncated label (or slot content). Pair it with CopyableAddress — nest this inside CopyableAddress
// — when a value should be both a link and copyable. Build `href` with `suiExplorerUrl` (this
// package) for Sui entities, or an app-specific helper (e.g. Walruscan) for other targets.
import { computed } from 'vue'
import { safeHref } from '../safe-href.js'
import { DEFAULT_TRUNCATE_CHARS, truncateMiddle } from '../truncate.js'

const props = withDefaults(
  defineProps<{
    /** Destination URL (opens in a new tab). */
    href: string
    /** Value used for the truncated label + title; omit when providing slot content. */
    value?: string
    /** Prefix…suffix truncation of `value` (default true); `false` shows it whole (see `CopyableAddress`). */
    truncate?: boolean
    /** [prefixChars, suffixChars] — only used when truncate is true. Default [12, 10]. */
    chars?: [number, number]
  }>(),
  { truncate: true, chars: () => [...DEFAULT_TRUNCATE_CHARS] },
)

const label = computed(() => {
  if (!props.value) return ''
  return props.truncate ? truncateMiddle(props.value, props.chars) : props.value
})
</script>

<template>
  <a class="el-root" :href="safeHref(href)" target="_blank" rel="noopener noreferrer" :title="value">
    <slot>{{ label }}</slot>
  </a>
</template>

<style scoped>
.el-root {
  font-family: monospace;
  font-size: inherit;
  color: var(--accent);
  text-decoration: underline dotted;
  text-underline-offset: 2px;
  transition: color 0.15s;
}
.el-root:hover {
  color: var(--text);
  text-decoration-style: solid;
}
</style>
