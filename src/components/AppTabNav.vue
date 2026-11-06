<script setup lang="ts">
// Tab list for switching views within the same page — the WAI-ARIA tabs pattern (HTML has no
// native tabs element, so the role supplies the semantics). Pair each tab set with UiTabPanel,
// passing the same `idPrefix`, so tabs and panels reference each other.
// aria-controls must reference an element in the DOM: by default only the selected tab carries it
// (one panel rendered, its content swapped). Set `allPanels` when every tab's panel stays mounted
// (e.g. hidden with v-show) so each tab points at its own panel.
// Keyboard: Left/Right move between tabs (wrapping), Home/End jump to the ends; the focused tab
// is activated immediately. Only the selected tab is in the Tab sequence (roving tabindex).
// variant="underline" (default): active-underline indicator.
// variant="raised": desktop-app raised-tab style (active tab "opens" into content area).
import { tabIds } from '../tabs.js'

export interface AppTab {
  id: string
  label: string
}

const props = withDefaults(
  defineProps<{
    tabs: AppTab[]
    modelValue: string
    /** Shared with the UiTabPanel(s) of this tab set to link tab ↔ panel ids. */
    idPrefix: string
    ariaLabel?: string
    variant?: 'underline' | 'raised'
    /** 'lg' enlarges the tabs (padding + font) so they stand out from body text. */
    size?: 'md' | 'lg'
    /** Every tab's UiTabPanel is in the DOM (inactive ones hidden), not only the selected one. */
    allPanels?: boolean
    /** Drop the bleed between the tab strip and the content (a strip that sits directly on a page edge rather than in a card). */
    flush?: boolean
  }>(),
  { variant: 'underline', size: 'md', allPanels: false, flush: false },
)

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

// Indexed explicitly: Vue does not guarantee v-for template-ref array order.
const buttons: HTMLButtonElement[] = []

function select(index: number): void {
  const tab = props.tabs[index]
  if (!tab) return
  emit('update:modelValue', tab.id)
  buttons[index]?.focus()
}

function onKeydown(e: KeyboardEvent, index: number): void {
  const last = props.tabs.length - 1
  const target =
    e.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
    : e.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
    : e.key === 'Home' ? 0
    : e.key === 'End' ? last
    : -1
  if (target < 0) return
  e.preventDefault()
  select(target)
}
</script>

<template>
  <menu
    role="tablist"
    class="mw-tab-nav"
    :class="{ 'mw-tab-nav--raised': variant === 'raised', 'mw-tab-nav--lg': size === 'lg', 'mw-tab-nav--flush': flush }"
    :aria-label="ariaLabel"
  >
    <!-- role="none": a tablist may only own tabs, so the list item is transparent to
         assistive technology (and display: contents keeps it out of layout). -->
    <li v-for="(tab, i) in tabs" :key="tab.id" role="none" class="mw-tab-nav__item">
      <button
        :id="tabIds(idPrefix, tab.id).tab"
        :ref="(el) => { buttons[i] = el as HTMLButtonElement }"
        type="button"
        role="tab"
        class="mw-tab-nav__tab"
        :class="{ 'mw-tab-nav__tab--active': modelValue === tab.id }"
        :aria-selected="modelValue === tab.id"
        :aria-controls="allPanels || modelValue === tab.id ? tabIds(idPrefix, tab.id).panel : undefined"
        :tabindex="modelValue === tab.id ? 0 : -1"
        @click="emit('update:modelValue', tab.id)"
        @keydown="onKeydown($event, i)"
      >{{ tab.label }}</button>
    </li>
  </menu>
</template>

<style scoped>
/* ── Underline variant (default) ─────────────────────────────────────── */

.mw-tab-nav {
  display: flex;
  /* Tabs wrap onto a second row when they do not fit (a phone, a larger text size) instead of widening the page. */
  flex-wrap: wrap;
  gap: var(--space-3xs);
  margin: 0;
  padding: 0;
  list-style: none;
  border-bottom: var(--space-4xs) solid var(--border);
}

/* The list items generate no box: the tab buttons stay the flex items, so every rule below
   (including the negative margins that punch through the bottom border) applies unchanged. */
.mw-tab-nav__item {
  display: contents;
}

.mw-tab-nav__tab {
  appearance: none;
  background: none;
  border: none;
  border-radius: 0;
  border-bottom: var(--space-4xs) solid transparent;
  padding: var(--space-2xs) var(--space-sm);
  margin-bottom: calc(-1 * var(--space-4xs));
  cursor: pointer;
  font-size: var(--font-size-base);
  color: var(--muted);
  transition: color var(--transition-base), border-color var(--transition-base);
}

.mw-tab-nav__tab:hover {
  color: var(--text);
}

.mw-tab-nav__tab--active {
  border-bottom-color: var(--accent);
  color: var(--text);
  font-weight: var(--font-weight-semibold);
}

/* ── Raised variant ──────────────────────────────────────────────────── */

.mw-tab-nav--raised {
  align-items: flex-end;
  /* override default underline border */
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  padding: var(--space-3xs) var(--space-3xs) 0;
  gap: var(--space-4xs);
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
}

.mw-tab-nav--raised::-webkit-scrollbar {
  display: none;
}

.mw-tab-nav--raised .mw-tab-nav__tab {
  /* reset underline defaults */
  border-bottom: 1px solid var(--border);
  margin-bottom: -1px; /* punch through the container's bottom border */
  padding: var(--space-3xs) var(--space-xs) var(--space-3xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--muted);
  background: var(--lift);
  border-top: var(--space-4xs) solid transparent;
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  white-space: nowrap;
  transition: color var(--transition-base), background var(--transition-base),
    border-color var(--transition-base);
}

.mw-tab-nav--raised .mw-tab-nav__tab:hover:not(.mw-tab-nav__tab--active) {
  color: var(--text);
  background: var(--surface);
}

.mw-tab-nav--raised .mw-tab-nav__tab--active {
  color: var(--text);
  background: var(--bg);
  border-color: var(--accent) var(--border) var(--bg) var(--border); /* erase — merges visually with content area */
  font-weight: var(--font-weight-semibold);
}

/* Large raised tabs — bigger padding + font so they stand out from body text. */
.mw-tab-nav--raised.mw-tab-nav--lg {
  gap: var(--space-4xs);
  padding: var(--space-3xs) var(--space-3xs) 0;
}
.mw-tab-nav--raised.mw-tab-nav--lg .mw-tab-nav__tab {
  padding: var(--space-2xs) var(--space-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

/* Flush: the strip sits directly on a page edge, so it drops the surface band and the side padding. */
.mw-tab-nav--flush {
  padding-inline: 0;
  background: transparent;
}
</style>
