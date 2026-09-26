<script setup lang="ts">
// Vertical activity feed list. Fill with UiActivityItem.
</script>

<template>
  <ul class="mw-feed" role="list"><slot /></ul>
</template>

<style scoped>
.mw-feed {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.78rem;
}
</style>
