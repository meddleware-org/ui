<script setup lang="ts">
// Scrollable desktop-console table. Provide header cells via the `head` slot and
// body rows via the default slot; when there are no rows, `empty` is shown.
defineProps<{ empty?: string }>()
const slots = defineSlots<{ head(): unknown; default(): unknown }>()
</script>

<template>
  <div class="mw-data-table-wrap">
    <table class="mw-data-table">
      <thead>
        <tr><slot name="head" /></tr>
      </thead>
      <tbody>
        <slot />
      </tbody>
    </table>
    <p v-if="empty && !slots.default" class="mw-data-table__empty">{{ empty }}</p>
  </div>
</template>

<style scoped>
.mw-data-table-wrap {
  overflow-x: auto;
}
.mw-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}
/* Header/body cells are supplied via slots, so :deep() is required to reach them. */
.mw-data-table :deep(th) {
  text-align: left;
  padding: 5px 8px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.mw-data-table :deep(td) {
  padding: 5px 8px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.mw-data-table :deep(tbody tr:last-child td) {
  border-bottom: none;
}
.mw-data-table :deep(tbody tr:nth-child(even) td) {
  background: var(--lift);
}
.mw-data-table__empty {
  text-align: center;
  padding: 24px 16px;
  color: var(--muted);
  font-size: 0.8rem;
}
</style>
