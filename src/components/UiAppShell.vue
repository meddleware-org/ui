<script setup lang="ts">
// The page frame: a skip link, then the `header`, an optional `sidebar`, the `<main>` landmark (the default slot) and the `footer`. It
// fills the viewport height (the footer sits at the bottom of a short page). `contained` limits the main content to the tool width.
// The skip link jumps to `<main>`; browsers move the keyboard starting point to the target, so it needs no tabindex (and no focus outline).
import UiSkipLink from './UiSkipLink.vue'

withDefaults(defineProps<{ /** The `id` of the main landmark; the skip link points at it. */ mainId?: string; contained?: boolean }>(), { mainId: 'main', contained: false })
</script>

<template>
  <div class="mw-shell" :class="{ 'mw-shell--sidebar': $slots.sidebar }">
    <UiSkipLink :href="`#${mainId}`" />
    <slot name="header" />
    <slot name="sidebar" />
    <main :id="mainId" class="mw-shell__main" :class="{ 'mw-shell__main--contained': contained }"><slot /></main>
    <slot name="footer" />
  </div>
</template>

<style scoped>
.mw-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
}
.mw-shell--sidebar {
  grid-template-columns: auto minmax(0, 1fr);
}
/* The header and footer span the full width. */
.mw-shell > :slotted(header),
.mw-shell > :slotted(footer) {
  grid-column: 1 / -1;
}
.mw-shell__main {
  min-width: 0;
}
/* The content sits in the second column, whether or not the sidebar is there: below 45em the sidebar is a drawer outside the flow, and
   an unplaced `main` would otherwise fall into the sidebar's (auto-sized) column and shrink to its content. */
.mw-shell--sidebar > .mw-shell__main {
  grid-column: 2;
}
@media (width < 45em) {
  .mw-shell--sidebar {
    grid-template-columns: minmax(0, 1fr);
  }
  .mw-shell--sidebar > .mw-shell__main {
    grid-column: 1;
  }
}
.mw-shell__main--contained {
  width: 100%;
  max-width: var(--mw-tool-content-max);
  margin-inline: auto;
  padding: var(--space-sm) var(--space-sm) var(--space-lg);
}
</style>
