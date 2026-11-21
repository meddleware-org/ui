<script setup lang="ts">
/** Styled native <select>, labelled by the consuming context (UiFormField's label[for], or an aria-label passed as an attribute); this primitive carries no own label.
 * A single root element: attributes (id, aria-*, disabled…) fall
 * through to the select itself, and the chevron is painted in its background with two
 * token-coloured gradient strokes (so it follows the theme without an overlay element). */
/** The chosen option's value. */
const model = defineModel<string>()
</script>

<template>
  <select v-model="model" class="mw-select"><slot /></select>
</template>

<style scoped>
/* The control's edge is --control-border (3:1, WCAG 1.4.11). The chevron is drawn in the background so there is no overlay element to
   position or to hide from assistive technology. */
.mw-select {
  --_chevron-stroke: var(--muted);
  --_chevron-arm: var(--space-2xs);

  /* Drop the platform's own arrow so the token-coloured chevron below is the only one. */
  appearance: none;
  width: 100%;
  /* right padding = space-md + space-2xs (2.5rem) clears the chevron. */
  padding: var(--space-2xs) calc(var(--space-md) + var(--space-2xs)) var(--space-2xs) var(--space-xs);
  background-color: var(--surface);
  /* Chevron: a "\" arm and a "/" arm, each a 1.5px diagonal stroke in its own tile. */
  background-image:
    linear-gradient(
      45deg,
      transparent calc(50% - var(--space-4xs) / 2),
      var(--_chevron-stroke) calc(50% - var(--space-4xs) / 2),
      var(--_chevron-stroke) calc(50% + var(--space-4xs) / 2),
      transparent calc(50% + var(--space-4xs) / 2)
    ),
    linear-gradient(
      -45deg,
      transparent calc(50% - var(--space-4xs) / 2),
      var(--_chevron-stroke) calc(50% - var(--space-4xs) / 2),
      var(--_chevron-stroke) calc(50% + var(--space-4xs) / 2),
      transparent calc(50% + var(--space-4xs) / 2)
    );
  /* Each arm is a small square tile; the two tiles sit side by side on the right to make a "v". */
  background-position:
    right calc(var(--space-xs) + var(--_chevron-arm)) center,
    right var(--space-xs) center;
  background-size: var(--_chevron-arm) var(--_chevron-arm);
  background-repeat: no-repeat;
  color: var(--text);
  border: 1px solid var(--control-border);
  border-radius: var(--radius);
  font: inherit;
}
/* Keyboard focus ring in the fleet's focus colour. */
.mw-select:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}
</style>
