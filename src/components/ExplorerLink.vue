<script setup lang="ts">
// A block-explorer link. Chain-agnostic: it just renders `href` as an external anchor with a
// truncated label (or slot content). Pair it with CopyableAddress — nest this inside CopyableAddress
// — when a value should be both a link and copyable. Build `href` with `suiExplorerUrl` (this
// package) for Sui entities, or an app-specific helper (e.g. Walruscan) for other targets.
import { computed } from 'vue'
import { DEFAULT_TRUNCATE_CHARS, safeHref, truncateMiddle } from '@meddleware/web-utils'

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
  /* A 24px-high target (WCAG 2.5.8): a small address link beside the copy button is otherwise too close to it. Block-level inside so a long id still wraps by lines. */
  display: inline-block;
  min-block-size: calc(var(--space-sm) + var(--space-3xs));
  font-family: var(--mw-font-mono);
  font-size: inherit;
  color: var(--mw-link, var(--accent));
  text-decoration: underline dotted;
  text-underline-offset: 0.18em;
  transition: color var(--duration-base);
}
.el-root:hover {
  color: var(--text);
  text-decoration-style: solid;
}
</style>
