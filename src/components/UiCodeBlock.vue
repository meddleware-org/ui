<script setup lang="ts">
// A block of code or data (JSON payloads, manifests): a `<figure>` named by a visually hidden caption, holding a focusable `<pre>` so a
// keyboard user can scroll it. Long lines scroll rather than widen the page unless `wrap` is set.
withDefaults(defineProps<{ code?: string; label?: string; wrap?: boolean }>(), { label: 'Code', wrap: false })
</script>

<template>
  <figure class="mw-code">
    <figcaption class="mw-visually-hidden">{{ label }}</figcaption>
    <pre class="mw-code__pre" :class="{ 'mw-code__pre--wrap': wrap }" tabindex="0"><code><slot>{{ code }}</slot></code></pre>
  </figure>
</template>

<style scoped>
.mw-code {
  margin: 0;
  /* The block scrolls inside itself (`pre` overflow); it must not widen a flex or grid parent to fit its longest line. */
  min-inline-size: 0;
  max-inline-size: 100%;
}
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
.mw-code__pre--wrap {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.mw-code__pre:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
</style>
