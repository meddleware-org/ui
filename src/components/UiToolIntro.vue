<script setup lang="ts">
// One-line tool description shown at the top of a tool view. Uniform styling across every tool
// (muted, default body font-size) so the intro line reads consistently everywhere.
</script>

<template>
  <p class="mw-tool-intro"><slot /></p>
</template>

<style scoped>
.mw-tool-intro {
  margin: 0.25rem 0 1.25rem;
  color: var(--muted);
  /* No explicit font-size — inherits the body size so it never renders smaller than the content. */
}
</style>
