<script setup lang="ts">
// A block of code or data (JSON payloads, manifests): a `<figure>` named by a visually hidden caption, holding a focusable `<pre>` so a
// keyboard user can scroll it. Long lines scroll rather than widen the page unless `wrap` is set.
withDefaults(
  defineProps<{
    /** The text to show; the default slot takes it instead (for markup-free pre-formatted content). */
    code?: string
    /** The block's accessible name, shown only to assistive technology (default `Code`). */
    label?: string
    /** Wrap long lines instead of scrolling sideways. */
    wrap?: boolean
  }>(),
  { label: 'Code', wrap: false },
)
// Template: A figure named by its caption; the <pre> is focusable (tabindex=0) so a keyboard user can scroll a long block (WCAG 2.1.1).
</script>

<template>
  <figure class="mw-code">
    <figcaption class="mw-visually-hidden">{{ label }}</figcaption>
    <pre class="mw-code__pre" :class="{ 'mw-code__pre--wrap': wrap }" tabindex="0"><code><slot>{{ code }}</slot></code></pre>
  </figure>
</template>

<style scoped>
/* The figure resets the browser's default figure margins; the block's own spacing is the caller's layout. */
.mw-code {
  margin: 0;
  /* The block scrolls inside itself (`pre` overflow); it must not widen a flex or grid parent to fit its longest line. */
  min-inline-size: 0;
  max-inline-size: 100%;
}
/* Scrolls inside itself; the lift surface and the border set it apart from the page without relying on colour alone. */
.mw-code__pre {
  margin: 0;
  padding: var(--space-xs);
  overflow: auto;
  background: var(--lift);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: var(--mw-font-mono);
  font-size: var(--font-size-sm);
}
/* `wrap` mode: preserve line breaks but break anywhere inside a long token (a 66-character id) rather than scroll. */
.mw-code__pre--wrap {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
/* Inset ring: the block clips its overflow, so an outer ring would be cut off. */
.mw-code__pre:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
</style>
