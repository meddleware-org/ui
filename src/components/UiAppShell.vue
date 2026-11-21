<script setup lang="ts">
// The page frame: a skip link, then the `header`, an optional `sidebar`, the `<main>` landmark (the default slot) and the `footer`. It
// fills the viewport height (the footer sits at the bottom of a short page). `contained` limits the main content to the tool width.
// The skip link jumps to `<main>`; browsers move the keyboard starting point to the target, so it needs no tabindex (and no focus outline).
import UiSkipLink from './UiSkipLink.vue'

withDefaults(
  defineProps<{
    /** The `id` of the main landmark; the skip link points at it. */
    mainId?: string
    /** Limit the main content to the tool width (`--mw-tool-content-max`) and pad it; false lets the page use the full width. */
    contained?: boolean
  }>(),
  { mainId: 'main', contained: false },
)
// Template: Document order is the keyboard order: skip link, header, sidebar, main, footer. The landmarks (header, nav, main, footer) come from the slotted elements and the <main> here, so the shell adds no ARIA roles of its own.
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
/* A grid frame: header row, a growing content row, footer row; at least the viewport tall (`dvh`, so a phone's address bar is accounted for) so
   a short page keeps its footer at the bottom. */
.mw-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
}
/* With a sidebar the first column is the sidebar's own width and the content takes the rest. */
.mw-shell--sidebar {
  grid-template-columns: auto minmax(0, 1fr);
}
/* The header and footer span the full width. */
.mw-shell > :slotted(header),
.mw-shell > :slotted(footer) {
  grid-column: 1 / -1;
}
/* `min-width: 0` lets the main column shrink below its widest child instead of forcing a sideways scroll. */
.mw-shell__main {
  min-width: 0;
}
/* The content sits in the second column, whether or not the sidebar is there: below 45em the sidebar is a drawer outside the flow, and
   an unplaced `main` would otherwise fall into the sidebar's (auto-sized) column and shrink to its content. */
.mw-shell--sidebar > .mw-shell__main {
  grid-column: 2;
}
/* Narrow screens: the sidebar becomes an off-canvas drawer (AppSidebar), so the grid is a single column. */
@media (width < 45em) {
  .mw-shell--sidebar {
    grid-template-columns: minmax(0, 1fr);
  }
  .mw-shell--sidebar > .mw-shell__main {
    grid-column: 1;
  }
}
/* The tool width, centred, with room below for the footer. */
.mw-shell__main--contained {
  width: 100%;
  max-width: var(--mw-tool-content-max);
  margin-inline: auto;
  padding: var(--space-sm) var(--space-sm) var(--space-lg);
}
</style>
