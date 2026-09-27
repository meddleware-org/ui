<script setup lang="ts">
// Tab list for switching views within the same page — the WAI-ARIA tabs pattern (HTML has no
// native tabs element, so the role supplies the semantics). Pair each tab set with UiTabPanel,
// passing the same `idPrefix`, so tabs and panels reference each other.
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
  }>(),
  { variant: 'underline', size: 'md' },
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
    :class="{ 'mw-tab-nav--raised': variant === 'raised', 'mw-tab-nav--lg': size === 'lg' }"
    :aria-label="ariaLabel"
  >
    <!-- role="presentation": a tablist may only own tabs, so the list item is transparent to
         assistive technology (and display: contents keeps it out of layout). -->
    <li v-for="(tab, i) in tabs" :key="tab.id" role="presentation" class="mw-tab-nav__item">
      <button
        :id="tabIds(idPrefix, tab.id).tab"
        :ref="(el) => { buttons[i] = el as HTMLButtonElement }"
        type="button"
        role="tab"
        class="mw-tab-nav__tab"
        :class="{ 'mw-tab-nav__tab--active': modelValue === tab.id }"
        :aria-selected="modelValue === tab.id"
        :aria-controls="tabIds(idPrefix, tab.id).panel"
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
  gap: var(--space-3xs);
  margin: 0;
  padding: 0;
  list-style: none;
  border-bottom: 2px solid var(--border);
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
  border-bottom: 2px solid transparent;
  padding: var(--space-2xs) var(--space-sm);
  margin-bottom: -2px;
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
  font-weight: 600;
}

/* ── Raised variant ──────────────────────────────────────────────────── */

.mw-tab-nav--raised {
  align-items: flex-end;
  /* override default underline border */
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  padding: 4px 4px 0;
  gap: 2px;
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
  padding: 5px 14px 6px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--muted);
  background: var(--lift);
  border-top: 2px solid transparent;
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  letter-spacing: 0.01em;
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
  font-weight: 600;
}

/* Large raised tabs — bigger padding + font so they stand out from body text (used on the
   dashboard's Blockchain tools page). */
.mw-tab-nav--raised.mw-tab-nav--lg {
  gap: 3px;
  padding: 6px 6px 0;
}
.mw-tab-nav--raised.mw-tab-nav--lg .mw-tab-nav__tab {
  padding: 9px 20px 10px;
  font-size: 0.95rem;
  font-weight: 600;
}
</style>
