<script setup lang="ts">
// Vertical activity feed list. Fill with UiActivityItem.
// It holds no state and no logic: the list element and its spacing only, so the items decide how they look. Used for the recent-activity
// views of the tool apps (what happened, newest first, in the order the caller passes).
// Template: role="list" is explicit on purpose: Safari with VoiceOver drops list semantics from a list whose bullets are removed (the fleet's workaround).
</script>

<template>
  <ul class="mw-feed" role="list"><slot /></ul>
</template>

<style scoped>
/* A plain vertical list: the bullets and the browser's indent are removed because each item draws its own marker and spacing. */
.mw-feed {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: var(--font-size-sm);
}
</style>
