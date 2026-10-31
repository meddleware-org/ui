<script setup lang="ts">
// A button, or a link that looks like one (`href`). `busy` shows a spinner and blocks interaction without losing the label.
import { computed } from 'vue'
import { safeHref } from '@meddleware/web-utils'

const props = withDefaults(
  defineProps<{
    /** Visual style: primary (accent fill), secondary, ghost (outline), danger (red), or link (looks like inline text). */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
    /** `sm` is the compact size for dense rows and toolbars. */
    size?: 'md' | 'sm'
    /** HTML button type attribute. Use 'submit' inside forms; 'button' otherwise. Ignored for a link. */
    type?: 'button' | 'submit' | 'reset'
    /** When true, the control is rendered faded and blocks all interaction. */
    disabled?: boolean
    /** An operation is running: shows a spinner, sets `aria-busy`, and blocks interaction. The label stays. */
    busy?: boolean
    /** Render an `<a>` to this URL (checked with `safeHref`: an unsafe URL renders no `href`). */
    href?: string
  }>(),
  { variant: 'primary', size: 'md', type: 'button', disabled: false, busy: false },
)

const inert = computed(() => props.disabled || props.busy)

/** A disabled or busy link must not navigate. */
function block(e: Event): void {
  if (inert.value) e.preventDefault()
}
</script>

<template>
  <a
    v-if="href !== undefined"
    :href="inert ? undefined : safeHref(href)"
    class="mw-btn"
    :class="[`mw-btn--${variant}`, `mw-btn--${size}`]"
    :aria-disabled="inert ? 'true' : undefined"
    :aria-busy="busy ? 'true' : undefined"
    :tabindex="inert ? -1 : undefined"
    @click="block"
  >
    <span v-if="busy" class="mw-spinner" aria-hidden="true" />
    <slot />
  </a>
  <button
    v-else
    :type="type"
    :disabled="inert"
    class="mw-btn"
    :class="[`mw-btn--${variant}`, `mw-btn--${size}`]"
    :aria-busy="busy ? 'true' : undefined"
  >
    <span v-if="busy" class="mw-spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.mw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2xs);
  padding: var(--space-2xs) var(--space-xs);
  border-radius: var(--radius);
  border: 1px solid transparent;
  font: inherit;
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  cursor: pointer;
  transition:
    background var(--transition-base),
    box-shadow var(--transition-base);
}
.mw-btn--sm {
  padding: var(--space-3xs) var(--space-2xs);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}
.mw-btn:disabled:not([aria-busy='true']),
.mw-btn[aria-disabled='true']:not([aria-busy='true']) {
  /* Dimmed, not opacity-faded: a disabled control is exempt from contrast, but its label stays readable. A busy one keeps its colour:
     it is working, not unavailable. */
  filter: grayscale(0.6);
  cursor: not-allowed;
}
.mw-btn[aria-busy='true'] {
  cursor: progress;
}
/* The spinner is sized to the text; its ring takes the label colour so it reads on every fill. */
.mw-btn .mw-spinner {
  width: 1em;
  height: 1em;
  border-color: color-mix(in srgb, currentColor 30%, transparent);
  border-top-color: currentColor;
}
/* Hover is an inner ring in the label colour: it never changes the fill, so the label keeps its contrast. */
.mw-btn--primary {
  background: var(--accent);
  color: var(--accent-contrast);
}
.mw-btn--primary:not(:disabled, [aria-disabled='true']):hover {
  box-shadow: inset 0 0 0 var(--space-4xs) var(--accent-contrast);
}
.mw-btn--secondary {
  background: var(--secondary);
  color: var(--secondary-contrast);
}
.mw-btn--secondary:not(:disabled, [aria-disabled='true']):hover {
  box-shadow: inset 0 0 0 var(--space-4xs) var(--secondary-contrast);
}
.mw-btn--danger {
  background: var(--danger);
  color: var(--accent-contrast);
}
.mw-btn--danger:not(:disabled, [aria-disabled='true']):hover {
  box-shadow: inset 0 0 0 var(--space-4xs) var(--accent-contrast);
}
.mw-btn--ghost {
  background: transparent;
  color: var(--text);
  border-color: var(--border);
}
.mw-btn--ghost:not(:disabled, [aria-disabled='true']):hover {
  background: var(--lift);
}
.mw-btn--link {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--mw-link, var(--accent)); /* a link on a dark panel takes the panel's link colour */
  font-weight: inherit;
  text-decoration: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.18em;
}
.mw-btn--link:not(:disabled, [aria-disabled='true']):hover {
  text-decoration-thickness: 0.14em;
}
</style>
