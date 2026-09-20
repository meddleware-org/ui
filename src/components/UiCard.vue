<script setup lang="ts">
defineProps<{
  /** Optional card heading rendered in the header slot fallback. */
  title?: string
}>()
</script>

<template>
  <section class="mw-card">
    <header v-if="title || $slots.header" class="mw-card__header">
      <slot name="header">
        <h3 class="mw-card__title">{{ title }}</h3>
      </slot>
    </header>
    <div class="mw-card__body"><slot /></div>
    <footer v-if="$slots.footer" class="mw-card__footer"><slot name="footer" /></footer>
  </section>
</template>

<style scoped>
.mw-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  overflow: hidden;
}
.mw-card__header {
  padding: var(--space-xs) var(--space-sm);
  border-bottom: 1px solid var(--border);
}
.mw-card__title {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: 600;
}
.mw-card__body {
  padding: var(--space-sm);
}
.mw-card__footer {
  padding: var(--space-xs) var(--space-sm);
  border-top: 1px solid var(--border);
  background: var(--lift);
}
</style>
