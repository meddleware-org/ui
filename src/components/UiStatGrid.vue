<script setup lang="ts">
// Two-column key/value readout — a description list. Fill it with UiStatRow (each renders a
// <dt>/<dd> pair that lands directly in the grid's two columns).
</script>

<template>
  <dl class="mw-stat-grid"><slot /></dl>
</template>

<style scoped>
.mw-stat-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3px 12px;
  margin: 0;
  font-size: 0.8rem;
}
</style>
