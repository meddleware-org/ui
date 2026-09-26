<script setup lang="ts">
// Two-column key/value grid for compact stat readouts. Fill it with UiStatRow.
</script>

<template>
  <div class="mw-stat-grid"><slot /></div>
</template>

<style scoped>
.mw-stat-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3px 12px;
  font-size: 0.8rem;
}
</style>
