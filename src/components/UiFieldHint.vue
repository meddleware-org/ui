<script setup lang="ts">
defineProps<{ fieldId: string }>()

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') (e.currentTarget as HTMLElement).blur()
}
</script>

<template>
  <span class="mw-field-hint">
    <button
      type="button"
      class="mw-field-hint__btn"
      :aria-describedby="`${fieldId}-hint`"
      aria-label="Help"
      @keydown="onKeyDown"
    >?</button>
    <span :id="`${fieldId}-hint`" role="tooltip" class="mw-field-hint__tip">
      <slot />
    </span>
  </span>
</template>

<style scoped>
.mw-field-hint {
  position: relative;
  display: inline-block;
  margin-inline-start: var(--space-3xs);
  vertical-align: middle;
}

.mw-field-hint__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* 24px: the smallest target WCAG 2.5.8 accepts without space around it. */
  inline-size: calc(var(--space-sm) + var(--space-3xs));
  block-size: calc(var(--space-sm) + var(--space-3xs));
  padding: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  line-height: 1;
  border-radius: 50%;
  border: 1px solid var(--muted);
  color: var(--muted);
  background: transparent;
  cursor: help;
  /* reset any global button styles */
  font-family: inherit;
}

.mw-field-hint__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
}

.mw-field-hint__tip {
  position: absolute;
  top: calc(100% + var(--space-3xs));
  left: 0;
  z-index: var(--z-popover);
  min-width: calc(var(--mw-content-narrow) / 2);
  max-width: min(var(--mw-content-narrow), 90vw);
  padding: var(--space-2xs) var(--space-xs);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  line-height: var(--leading-normal);
  color: var(--text);
  box-shadow: var(--shadow-2);
  /* Not rendered until shown: a hidden tip that is only transparent still widens the page's scrollable area when it sits near the edge
     (a reflow failure at 320px). The button's aria-describedby still reaches it, as a hidden element can be a description. */
  display: none;
}

.mw-field-hint:hover .mw-field-hint__tip,
.mw-field-hint:focus-within .mw-field-hint__tip {
  display: block;
}
</style>
