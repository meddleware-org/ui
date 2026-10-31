<script setup lang="ts">
// The "nothing here yet" message for a list or table, with an optional follow-up action (a button to create the first one).
</script>

<template>
  <div class="mw-empty">
    <p class="mw-empty__text"><slot /></p>
    <slot name="action" />
  </div>
</template>

<style scoped>
.mw-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md) var(--space-sm);
  text-align: center;
}
.mw-empty__text {
  margin: 0;
  color: var(--muted);
}
</style>
