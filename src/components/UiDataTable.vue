<script setup lang="ts">
// A table for dense consoles. Provide the header cells (`<th>` only) in the `head` slot and the body rows (`<tr>`) in the default slot.
//
//   • NEVER put a `<tr>` in the `head` slot: the component already wraps those cells in the header row, and a row inside a row
//     collapses every header into the first column. A dev-mode check warns if you do.
//   • `rows` is the number of body rows. When it is 0 the `empty` text is shown (without it, an empty slot is the only signal, which
//     a `v-for` that renders nothing never gives).
//   • `caption` names the table for assistive technology (visually hidden: use a heading for a visible title).
//   • When the table is wider than its box it scrolls sideways: the scroll box becomes a focusable, labelled region (so a keyboard user
//     can scroll it) and says so, so a phone does not show one column with no sign of more.
import { nextTick, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'

const props = defineProps<{
  /** The text shown when there are no rows. */
  empty?: string
  /** Number of body rows; 0 shows `empty`. Omit it to treat "nothing in the default slot" as empty. */
  rows?: number
  /** The table's accessible name. */
  caption?: string
}>()
const slots = defineSlots<{
  /** The header cells (`<th scope="col">` only: the component wraps them in the row). */
  head(): unknown
  /** The body rows (`<tr>`). */
  default(): unknown
  /** A caption with markup (otherwise use the `caption` prop). */
  caption(): unknown
}>()

// The scroll box around the table, measured to know whether the table is wider than it.
const wrap = ref<HTMLElement | null>(null)
// True while the table is wider than its box: then the box becomes a labelled, focusable region and shows the hint.
const scrollable = ref(false)
let observer: ResizeObserver | null = null

/** Work out whether the table needs to scroll sideways (a pixel of slack avoids flicker from fractional widths). */
function measure(): void {
  const el = wrap.value
  if (el) scrollable.value = el.scrollWidth > el.clientWidth + 1
}

// Development warnings only: the checks below cost a DOM query, so they are skipped in a production build.
const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true
let warned = false
let warnedScope = false
/** Warn once (in development) about the two easy mistakes in the `head` slot: a `<tr>` inside it, and a `<th>` without `scope`. */
function checkHead(): void {
  if (!isDev || warned) return
  if (wrap.value?.querySelector('thead tr tr')) {
    warned = true
    console.warn('UiDataTable: the head slot must contain only <th> cells; the component already wraps them in a <tr>.')
  }
  if (!warnedScope && wrap.value?.querySelector('thead th:not([scope])')) {
    warnedScope = true
    console.warn('UiDataTable: every <th> in the head slot needs scope="col" so assistive technology can tie a cell to its column.')
  }
}

// A ResizeObserver on the box and on the table re-measures when either changes size (a window resize, a column that grows, a font change).
onMounted(() => {
  measure()
  checkHead()
  if (typeof ResizeObserver !== 'undefined' && wrap.value) {
    observer = new ResizeObserver(measure)
    observer.observe(wrap.value)
    const table = wrap.value.querySelector('table')
    if (table) observer.observe(table)
  }
})
onUpdated(() => void nextTick(measure))
onBeforeUnmount(() => observer?.disconnect())

// Empty means `rows` is 0 when the caller gave it, otherwise "nothing in the default slot".
const isEmpty = (): boolean => (props.rows !== undefined ? props.rows === 0 : !slots.default)

// The wrapper is the horizontal scroll container. Deliberately not done on the <table> itself: giving a table display:block strips its
// table semantics in some browser/assistive-technology combinations.
// Template: When the table scrolls, the box becomes a named region and a tab stop so a keyboard user can scroll it (WCAG 2.1.1); when it does not, it is a plain div with no role. The empty text is a paragraph outside the table so an empty table is not announced as a table of nothing.
</script>

<template>
  <div
    ref="wrap"
    class="mw-data-table-wrap"
    :role="scrollable ? 'region' : undefined"
    :aria-label="scrollable ? (caption ?? 'Table') : undefined"
    :tabindex="scrollable ? 0 : undefined"
  >
    <table class="mw-data-table">
      <caption v-if="caption || $slots.caption" class="mw-visually-hidden"><slot name="caption">{{ caption }}</slot></caption>
      <thead>
        <tr><slot name="head" /></tr>
      </thead>
      <tbody v-if="!isEmpty()">
        <slot />
      </tbody>
    </table>
    <p v-if="isEmpty() && empty" class="mw-data-table__empty">{{ empty }}</p>
    <small v-if="scrollable" class="mw-data-table__hint">Scroll sideways to see more columns.</small>
  </div>
</template>

<style scoped>
/* The horizontal scroll container. */
.mw-data-table-wrap {
  /* Positioned, so visually hidden (absolutely placed) cells are clipped here and cannot widen the page. */
  position: relative;
  overflow-x: auto;
  scrollbar-width: thin;
}
.mw-data-table-wrap:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
/* The table fills the box; collapsed borders give single hairlines between rows. */
.mw-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}
/* Header/body cells are supplied via slots, so :deep() is required to reach them. Column headers are small caps; a row header
   (`scope="row"`) is the row's title and reads like body text. */
.mw-data-table :deep(th) {
  text-align: left;
  padding: var(--space-3xs) var(--space-2xs);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--muted);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.mw-data-table :deep(tbody th[scope='row']) {
  font-size: inherit;
  letter-spacing: normal;
  text-transform: none;
  color: var(--text);
  white-space: normal;
  vertical-align: middle;
}
/* Body cells: the same padding as headers so columns line up, with a hairline under each row. */
.mw-data-table :deep(td) {
  padding: var(--space-3xs) var(--space-2xs);
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
/* No rule under the last row (the box's own edge closes the table). */
.mw-data-table :deep(tbody tr:last-child td),
.mw-data-table :deep(tbody tr:last-child th) {
  border-bottom: none;
}
/* Zebra stripes on the lift surface help the eye follow a row across; the stripe is a faint tint, not the only row separator (the hairlines remain). */
.mw-data-table :deep(tbody tr:nth-child(even) td),
.mw-data-table :deep(tbody tr:nth-child(even) th) {
  background: var(--lift);
}
/* The empty message: centred, muted, with room so the table does not look broken. */
.mw-data-table__empty {
  margin: 0;
  padding: var(--space-md) var(--space-sm);
  text-align: center;
  color: var(--muted);
  font-size: var(--font-size-sm);
}
/* Stays in view at the left edge while the table scrolls under it. */
.mw-data-table__hint {
  position: sticky;
  left: 0;
  display: block;
  padding: var(--space-3xs) var(--space-2xs);
  color: var(--muted);
  font-size: var(--font-size-xs);
}
</style>
