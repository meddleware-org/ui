<script setup lang="ts">
// The "nothing here yet" message for a list or table, with an optional follow-up action (a button to create the first one).
// Say what is missing and what to do next, in plain words: an empty table with no explanation reads as a bug (the copy standard's rule).
// The message is the default slot, so it can carry a link; the action slot is only rendered by the caller when there is one.
// Template: The message is a paragraph; the optional `action` slot holds the follow-up (a button to create the first item).
</script>

<template>
  <div class="mw-empty">
    <p class="mw-empty__text"><slot /></p>
    <slot name="action" />
  </div>
</template>

<style scoped>
/* A centred column: message, then action, with room around it so an empty table or list does not look broken. */
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
  /* --muted is AAA on every canvas (design tokens), so dimmed text needs no opacity. */
  color: var(--muted);
}
</style>
