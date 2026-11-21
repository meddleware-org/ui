<script setup lang="ts">
// One-line tool description shown at the top of a tool view. Uniform styling across every tool
// (muted, default body font-size) so the intro line reads consistently everywhere.
// Template: A paragraph, not a heading: it describes the tool under the page's heading, so it must not appear in the heading outline.
</script>

<template>
  <p class="mw-tool-intro"><slot /></p>
</template>

<style scoped>
/* Muted, body-sized text under the tool's heading; the margins keep it close to the heading and clear of the content below. */
.mw-tool-intro {
  margin: var(--space-3xs) 0 var(--space-sm);
  color: var(--muted);
  /* No explicit font-size — inherits the body size so it never renders smaller than the content. */
}
</style>
