<script setup lang="ts">
// Two-column key/value readout — a description list. Fill it with UiStatRow (each renders a <dt>/<dd> pair that lands directly in the
// grid's two columns).
</script>

<template>
  <dl class="mw-stat-grid"><slot /></dl>
</template>

<style scoped>
.mw-stat-grid {
  display: grid;
  grid-template-columns: fit-content(40%) minmax(0, 1fr); /* the value column may be narrower than its longest unbroken word (a 66-character id); the label column is at most 40%, so large text leaves the value room */
  gap: var(--space-4xs) var(--space-xs);
  margin: 0;
  font-size: var(--font-size-sm);
}
</style>
