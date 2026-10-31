<script setup lang="ts">
// A surface with an optional heading. Default: a titled `<section>` whose header band bleeds to the card edge. `plain` drops the band
// (the title is just a heading, for a list of cards); `as` picks the element (`article`, or `li` inside a list); `href` makes the whole
// card a link through its title, so one link carries the card and there is one tab stop.
import { computed } from 'vue'
import { safeHref } from '@meddleware/web-utils'

const props = withDefaults(
  defineProps<{
    /** Card heading, rendered in the header slot's fallback. */
    title?: string
    /** Root element. */
    as?: 'section' | 'article' | 'li'
    /** Heading rank (default 3), to fit the page's outline. */
    level?: 2 | 3 | 4 | 5 | 6
    /** No header band: the title is a plain heading above the content. */
    plain?: boolean
    /** Make the whole card a link to this URL through its title (checked with `safeHref`; external links are not opened in a new tab). */
    href?: string
  }>(),
  { as: 'section', level: 3, plain: false },
)

const url = computed(() => (props.href === undefined ? undefined : safeHref(props.href)))
// `header`/`footer` are only scoped to the card inside sectioning content (`section`, `article`). Inside a list item they would become
// page-level banner and contentinfo landmarks, so a card that is a list item uses plain elements.
const band = computed(() => (props.as === 'li' ? 'div' : 'header'))
</script>

<template>
  <component :is="as" class="mw-card" :class="{ 'mw-card--plain': plain, 'mw-card--link': url }">
    <component :is="band" v-if="title || $slots.header || $slots.icon" class="mw-card__header">
      <slot name="icon" />
      <slot name="header">
        <component :is="`h${level}`" class="mw-card__title">
          <a v-if="url" :href="safeHref(href)" class="mw-card__link">{{ title }}</a>
          <template v-else>{{ title }}</template>
        </component>
      </slot>
    </component>
    <!-- Body content sits directly in the card (which owns the padding); the header and footer bleed to the card edges via negative
         margins unless the card is plain. -->
    <slot />
    <component :is="band === 'header' ? 'footer' : 'div'" v-if="$slots.footer" class="mw-card__footer"><slot name="footer" /></component>
  </component>
</template>

<style scoped>
.mw-card {
  position: relative;
  padding: var(--space-sm);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  overflow: hidden;
}
.mw-card__header {
  margin: calc(-1 * var(--space-sm)) calc(-1 * var(--space-sm)) var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border-bottom: 1px solid var(--border);
}
.mw-card__title {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}
.mw-card__footer {
  margin: var(--space-sm) calc(-1 * var(--space-sm)) calc(-1 * var(--space-sm));
  padding: var(--space-xs) var(--space-sm);
  border-top: 1px solid var(--border);
  background: var(--lift);
}

/* Plain: the heading sits in the flow, with no band and no rule. */
.mw-card--plain .mw-card__header {
  margin: 0 0 var(--space-2xs);
  padding: 0;
  border-bottom: 0;
}
.mw-card--plain .mw-card__title {
  font-size: var(--font-size-lg);
}

/* Linked: the title's anchor is stretched over the whole card, so the card is one target with one tab stop. */
.mw-card__link {
  color: inherit;
  text-decoration: none;
}
.mw-card__link::after {
  content: '';
  position: absolute;
  inset: 0;
}
.mw-card--link {
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}
.mw-card--link:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-1);
}
/* The focus ring is the whole card: the link's stretched ::after carries it, drawn inside the card edge (the card clips overflow). */
.mw-card__link:focus-visible::after {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
  border-radius: var(--radius);
}
</style>
