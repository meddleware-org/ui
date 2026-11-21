<script setup lang="ts">
// Used beside values a person may want to paste elsewhere: an address, a blob id, a transaction digest (CopyableAddress wraps it).
// An icon button that copies `value` to the clipboard and says so. The result is announced politely to assistive technology (a button
// whose name changes is not reliably announced) and shown on the icon for a moment. Nothing is copied, and nothing is claimed, when the
// clipboard is unavailable or denied.
import { getCurrentScope, onScopeDispose, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** The text to copy. */
    value: string
    /** Accessible label and tooltip (default "Copy"). */
    label?: string
  }>(),
  { label: 'Copy' },
)

/** True for a moment after a successful copy, to swap the icon and the announcement. */
const copied = ref(false)
// The timer that clears `copied`; kept so a second press restarts it and unmounting cancels it.
let timer: ReturnType<typeof setTimeout> | null = null
if (getCurrentScope()) onScopeDispose(() => timer !== null && clearTimeout(timer))

/** Copy the value; on success show the confirmation for 1.5 seconds. A refusal (insecure context, no permission) does nothing and claims nothing. */
async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.value)
  } catch {
    // Clipboard unavailable or denied (insecure context, permissions): nothing was copied.
    return
  }
  copied.value = true
  if (timer !== null) clearTimeout(timer)
  timer = setTimeout(() => {
    copied.value = false
  }, 1500)
}
// Template: The tooltip and the accessible name change with the result, but a changing name is not reliably announced, so the live region below says it too.
</script>

<template>
  <button
    type="button"
    class="mw-copy"
    :class="{ 'mw-copy--copied': copied }"
    :title="copied ? 'Copied!' : label"
    :aria-label="copied ? 'Copied' : label"
    @click="copy"
  >
    <!-- Two inline SVG icons (no icon font, no request): a tick after a copy, a "copy" glyph otherwise. Both are decorative (aria-hidden). -->
    <svg v-if="copied" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    <svg v-else viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
    <!-- Always mounted, so the text change is announced (a live region inserted together with its text is not reliably read). -->
    <span class="mw-visually-hidden" role="status">{{ copied ? 'Copied' : '' }}</span>
  </button>
</template>

<style scoped>
/* An icon-only button with no chrome: the icon takes the muted colour, and the target is padded out by `min-width`/`min-height`, not by a border. */
.mw-copy {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  /* A target of at least 24 CSS pixels (WCAG 2.5.8), that a wrapping value beside it cannot squeeze. */
  flex: none;
  min-width: 1.5rem;
  min-height: 1.5rem;
  color: var(--muted);
  cursor: pointer;
  line-height: 1;
  /* The colour change is short and follows the user's reduced-motion setting through the transition token. */
  transition: color var(--transition-base);
}
/* Hover and the "copied" state change the icon colour, and the copied state also swaps the glyph, so colour is not the only signal. */
.mw-copy:hover {
  color: var(--text);
}
.mw-copy--copied {
  color: var(--mw-link, var(--accent));
}
</style>
