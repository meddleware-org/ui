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
  empty?: string
  /** Number of body rows; 0 shows `empty`. Omit it to treat "nothing in the default slot" as empty. */
  rows?: number
  /** The table's accessible name. */
  caption?: string
}>()
const slots = defineSlots<{ head(): unknown; default(): unknown; caption(): unknown }>()

const wrap = ref<HTMLElement | null>(null)
const scrollable = ref(false)
let observer: ResizeObserver | null = null

function measure(): void {
  const el = wrap.value
  if (el) scrollable.value = el.scrollWidth > el.clientWidth + 1
}

const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true
let warned = false
function checkHead(): void {
  if (!isDev || warned) return
  if (wrap.value?.querySelector('thead tr tr')) {
    warned = true
    console.warn('UiDataTable: the head slot must contain only <th> cells; the component already wraps them in a <tr>.')
  }
}

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

const isEmpty = (): boolean => (props.rows !== undefined ? props.rows === 0 : !slots.default)

// The wrapper is the horizontal scroll container. Deliberately not done on the <table> itself: giving a table display:block strips its
// table semantics in some browser/assistive-technology combinations.
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
.mw-data-table :deep(td) {
  padding: var(--space-3xs) var(--space-2xs);
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.mw-data-table :deep(tbody tr:last-child td),
.mw-data-table :deep(tbody tr:last-child th) {
  border-bottom: none;
}
.mw-data-table :deep(tbody tr:nth-child(even) td),
.mw-data-table :deep(tbody tr:nth-child(even) th) {
  background: var(--lift);
}
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
