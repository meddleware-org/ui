<script setup lang="ts">
// One-line tool description shown at the top of a tool view. Uniform styling across every tool
// (muted, default body font-size) so the intro line reads consistently everywhere.
</script>

<template>
  <p class="mw-tool-intro"><slot /></p>
</template>

<style scoped>
.mw-tool-intro {
  margin: var(--space-3xs) 0 var(--space-sm);
  color: var(--muted);
  /* No explicit font-size — inherits the body size so it never renders smaller than the content. */
}
</style>
