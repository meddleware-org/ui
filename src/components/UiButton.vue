<script setup lang="ts">
// A button, or a link that looks like one (`href`). `busy` shows a spinner and blocks interaction without losing the label.
import { computed } from 'vue'
import { safeHref } from '@meddleware/web-utils'

// Props are documented inline below. The element is chosen by `href`: a link and a button share every class, so they look the same.
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

// Disabled and busy both block interaction; they differ only in how they look (see the styles).
const inert = computed(() => props.disabled || props.busy)

/**
 * Stop a disabled or busy link from navigating. A link cannot be `disabled`, so the click is cancelled instead.
 * @param e - the click event
 */
function block(e: Event): void {
  if (inert.value) e.preventDefault()
}
// Template: With an `href` it is a real link (so it can be opened in a new tab or copied); an inert link has no href and leaves the tab order. Otherwise a native button. Both show the spinner and set aria-busy while an operation runs.
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
/* (Colours are token roles only: no hex values, so the seasons and both colour modes reach every button.) */
/* Sizes are spacing tokens, so the button scales with the root font size and with a larger text setting (WCAG 1.4.4).
   Shared shape for every variant and for both elements; the variants below only set colours. The label is semibold so it holds its weight on a fill. */
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
/* The compact size for dense rows and toolbars. */
.mw-btn--sm {
  padding: var(--space-3xs) var(--space-2xs);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}
/* Unavailable (disabled) is dimmed and shows a not-allowed cursor; busy is exempt and shows a progress cursor instead. */
.mw-btn:disabled:not([aria-busy='true']),
.mw-btn[aria-disabled='true']:not([aria-busy='true']) {
  /* Dimmed, not opacity-faded: a disabled control is exempt from contrast, but its label stays readable. A busy one keeps its colour:
     it is working, not unavailable. */
  filter: grayscale(0.6);
  cursor: not-allowed;
}
/* Busy keeps its colours: it is working, not unavailable, and the spinner already says so. */
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
/* Primary: the accent fill with its AAA-checked contrast label. */
.mw-btn--primary {
  background: var(--accent);
  color: var(--accent-contrast);
}
/* Each fill variant's hover is an inner ring in the label colour, applied only when the control is live. */
.mw-btn--primary:not(:disabled, [aria-disabled='true']):hover {
  box-shadow: inset 0 0 0 var(--space-4xs) var(--accent-contrast);
}
/* Secondary: the secondary fill pair. */
.mw-btn--secondary {
  background: var(--secondary);
  color: var(--secondary-contrast);
}
.mw-btn--secondary:not(:disabled, [aria-disabled='true']):hover {
  box-shadow: inset 0 0 0 var(--space-4xs) var(--secondary-contrast);
}
/* Danger: for destructive actions; the same contrast label as primary. */
.mw-btn--danger {
  background: var(--danger);
  color: var(--accent-contrast);
}
.mw-btn--danger:not(:disabled, [aria-disabled='true']):hover {
  box-shadow: inset 0 0 0 var(--space-4xs) var(--accent-contrast);
}
/* Ghost: outlined, no fill; hover only adds the lift surface behind the label. */
.mw-btn--ghost {
  background: transparent;
  color: var(--text);
  border-color: var(--border);
}
/* Ghost hover adds the lift surface only, so the --text label keeps its contrast on it. */
.mw-btn--ghost:not(:disabled, [aria-disabled='true']):hover {
  background: var(--lift);
}
/* Link: looks like inline text, underlined (the underline, not the colour, marks it as interactive). */
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
/* A link-style button thickens its underline on hover; it has no fill to ring. */
.mw-btn--link:not(:disabled, [aria-disabled='true']):hover {
  text-decoration-thickness: 0.14em;
}
</style>
