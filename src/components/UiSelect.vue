<script setup lang="ts">
/** Styled native <select> with a chevron overlay. Abstracted from the
 * token-deployer `FormSelect.vue` (kept visually identical). */
defineOptions({ inheritAttrs: false })
const model = defineModel<string>()
</script>

<template>
  <div class="mw-select">
    <!-- Labelled by the consuming context (UiFormField's label[for], or an
         aria-label passed through $attrs); this primitive carries no own label. -->
    <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
    <select v-bind="$attrs" v-model="model"><slot /></select>
    <svg
      class="mw-select__chevron"
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="8"
      viewBox="0 0 12 8"
      aria-hidden="true"
    >
      <path d="M1 1l5 5 5-5" />
    </svg>
  </div>
</template>

<style scoped>
.mw-select {
  position: relative;
}
.mw-select select {
  appearance: none;
  width: 100%;
  /* right padding = space-md + space-2xs (2.5rem) clears the chevron. */
  padding: var(--space-2xs) calc(var(--space-md) + var(--space-2xs)) var(--space-2xs) var(--space-xs);
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font: inherit;
}
.mw-select select:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}
.mw-select__chevron {
  position: absolute;
  right: var(--space-xs);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  stroke: var(--muted);
  stroke-width: 1.5;
  fill: none;
}
</style>
