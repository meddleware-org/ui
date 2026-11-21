<script setup lang="ts">
// Single sidebar entry: optional icon + label, active/disabled states, accent-tinted active background. A button by default (the host owns
// selection state); give it `href` to render a real link (open in a new tab, copy the address, work without script), or wrap it in a
// router link with `custom`. The label is drawn in full colour: dimming it with opacity would take it below the contrast floor.
import { safePath, safeHref } from '@meddleware/web-utils'

withDefaults(
  defineProps<{
    /** The entry's text. */
    label: string
    /** A decorative leading glyph (hidden from assistive technology). */
    icon?: string
    /** The current entry: highlighted and marked `aria-current="page"`. */
    active?: boolean
    /** Disables the button form (a link cannot be disabled). */
    disabled?: boolean
    /** Render an `<a>` to this root-relative path or URL (checked with `safePath` / `safeHref`). */
    href?: string
  }>(),
  { active: false, disabled: false },
)
// Template: A real link when there is an `href` (a root-relative path goes through `safePath`, anything else through `safeHref`), a button otherwise.
</script>
<template>
  <a v-if="href !== undefined" :href="href.startsWith('/') ? safePath(href) : safeHref(href)" class="sidebar-item" :class="{ 'is-active': active }" :aria-current="active ? 'page' : undefined">
    <span v-if="icon" class="sidebar-item__icon" aria-hidden="true">{{ icon }}</span>
    {{ label }}
  </a>
  <button v-else type="button" class="sidebar-item" :class="{ 'is-active': active }" :disabled="disabled" :aria-current="active ? 'page' : undefined">
    <span v-if="icon" class="sidebar-item__icon" aria-hidden="true">{{ icon }}</span>
    {{ label }}
  </button>
</template>
<style scoped>
/* Square corners + full width so the hover/active highlight reads as a solid horizontal block across the whole sidebar (the nav
   container drops its horizontal padding to let it bleed to the edges; this item's own horizontal padding keeps the text inset). */
.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--space-2xs);
  width: 100%;
  padding: var(--space-2xs) var(--space-sm);
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--_muted, var(--muted));
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background var(--transition-base), color var(--transition-base);
}
/* Hover tints from the item's own colour (`currentColor`), so it works on both the light and the dark panel. */
.sidebar-item:hover:not(:disabled) {
  background: color-mix(in srgb, currentColor 10%, transparent);
  color: var(--_text, var(--text));
}
/* The current entry: a stronger accent tint, and the label in full text colour. */
.sidebar-item.is-active {
  background: color-mix(in srgb, var(--accent) 26%, transparent);
  color: var(--_text, var(--text));
}
/* A disabled entry keeps its text (opacity would take it below contrast) and only loses the pointer cursor. */
.sidebar-item:disabled {
  cursor: default;
}
/* Forced colours (Windows High Contrast) drop backgrounds, so the current page needs an edge of its own. */
@media (forced-colors: active) {
  .sidebar-item.is-active {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
}
/* Inset ring: the item bleeds to the sidebar's edges, so an outer ring would be clipped. */
.sidebar-item:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
/* A fixed-width cell so labels line up whether or not an entry has an icon. */
.sidebar-item__icon {
  width: var(--space-sm);
  text-align: center;
}
</style>
