<script setup lang="ts">
// Shared tab navigation — v-model + typed tabs.
// variant="underline" (default): page-level nav with active-underline indicator.
// variant="raised": desktop-app raised-tab style (active tab "opens" into content area).
export interface AppTab {
  id: string
  label: string
}

withDefaults(
  defineProps<{
    tabs: AppTab[]
    modelValue: string
    ariaLabel?: string
    variant?: 'underline' | 'raised'
  }>(),
  { variant: 'underline' },
)

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()
</script>

<template>
  <nav
    class="mw-tab-nav"
    :class="{ 'mw-tab-nav--raised': variant === 'raised' }"
    :aria-label="ariaLabel"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="mw-tab-nav__tab"
      :class="{ 'mw-tab-nav__tab--active': modelValue === tab.id }"
      :aria-current="modelValue === tab.id ? 'page' : undefined"
      @click="emit('update:modelValue', tab.id)"
    >{{ tab.label }}</button>
  </nav>
</template>

<style scoped>
/* ── Underline variant (default) ─────────────────────────────────────── */

.mw-tab-nav {
  display: flex;
  gap: var(--space-3xs);
  border-bottom: 2px solid var(--border);
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
  border-top-color: var(--accent);
  border-left-color: var(--border);
  border-right-color: var(--border);
  border-bottom-color: var(--bg); /* erase — merges visually with content area */
  font-weight: 600;
}
</style>
