<script setup lang="ts">
// Single sidebar entry: optional icon + label, active/disabled states, accent-tinted active background. A button by default (the host owns
// selection state); give it `href` to render a real link (open in a new tab, copy the address, work without script), or wrap it in a
// router link with `custom`. The label is drawn in full colour: dimming it with opacity would take it below the contrast floor.
import { safePath, safeHref } from '@meddleware/web-utils'

withDefaults(
  defineProps<{
    label: string
    /** A decorative leading glyph (hidden from assistive technology). */
    icon?: string
    active?: boolean
    disabled?: boolean
    /** Render an `<a>` to this root-relative path or URL (checked with `safePath` / `safeHref`). */
    href?: string
  }>(),
  { active: false, disabled: false },
)
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
.sidebar-item:hover:not(:disabled) {
  background: color-mix(in srgb, currentColor 10%, transparent);
  color: var(--_text, var(--text));
}
.sidebar-item.is-active {
  background: color-mix(in srgb, var(--accent) 26%, transparent);
  color: var(--_text, var(--text));
}
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
.sidebar-item:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
.sidebar-item__icon {
  width: var(--space-sm);
  text-align: center;
}
</style>
