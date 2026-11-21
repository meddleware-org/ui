<script setup lang="ts">
// "I'm here to…": one guide, several paths (use the tools, build with them, run your own). A native radio group in a fieldset picks the
// path; the chosen path's panel is shown by CSS alone (`:has(:checked)`), so the guide works without JavaScript wherever the page is
// prerendered, and with no CSS support every panel shows in order. With JavaScript the choice is mirrored in the address (`#for-<id>`)
// so a path can be shared; nothing is stored in the browser (workspace decision D134). Each panel is a numbered path of steps, what the
// reader will need and get, and links onward.
import { onMounted, ref } from 'vue'
import { safeHref } from '@meddleware/web-utils'
import UiButton from './UiButton.vue'

/** One path through the guide. */
export interface RoleGuideRole {
  /** Stable id, used in the address (`#for-<id>`) and the radio value: lowercase letters, digits and hyphens. */
  id: string
  /** The choice's label and the panel's heading ("Use the tools"). */
  title: string
  /** One line under the choice ("Get things done without being kept"). */
  summary: string
  /** The numbered steps, in order (plain text). */
  steps: string[]
  /** "You'll need" (optional). */
  need?: string
  /** "You get" (optional). */
  get?: string
  /** Links onward; the first is drawn as the main action. External links name it in their text (e.g. "Developer guide ↗"). */
  links?: { text: string; href: string }[]
}

// The props are documented inline. `roles` is plain data (the content), so a page can build one guide from a file and another from different
// data without a new component.
const props = withDefaults(
  defineProps<{
    /** The paths, in order (two to six). */
    roles: RoleGuideRole[]
    /** The radio group's name: unique on the page. */
    name: string
    /** The question the choices answer. */
    legend?: string
    /** Heading rank of each panel's title, to fit the page's outline. */
    level?: 2 | 3 | 4
  }>(),
  { legend: "I'm here to…", level: 3 },
)

// The chosen path's id: the first path until the visitor chooses, or the one named in the address.
const chosen = ref(props.roles[0]?.id ?? '')
// The panel's id (and the address fragment) for a path.
const panelId = (id: string): string => `for-${id}`

/** Mirror the choice in the address so it can be shared; replaceState, so the back button is not filled with choices. */
function choose(id: string): void {
  chosen.value = id
  // Guarded for a server render, where there is no window or history; the radios still work, they just do not update the address.
  if (typeof window !== 'undefined' && typeof history !== 'undefined') {
    history.replaceState(history.state, '', `#${panelId(id)}`)
  }
}

// Read the address once the page is on screen (never during server render), so a shared link opens on the path it names.
onMounted(() => {
  const fromHash = window.location.hash.replace(/^#for-/, '')
  // An unknown fragment (any other anchor on the page) is ignored, so it cannot blank the guide.
  if (props.roles.some((r) => r.id === fromHash)) chosen.value = fromHash
  if (import.meta.env.DEV && (props.roles.length < 2 || props.roles.length > 6)) {
    console.warn(`UiRoleGuide: ${props.roles.length} roles; the guide is drawn for two to six`)
  }
})
// Template: Two parts: a fieldset of radio choices, then one panel per path. The panels are all in the markup, so without JavaScript (or CSS `:has`) every path is readable; with them, the chosen radio decides which panel is shown.
</script>

<template>
  <div class="mw-role-guide">
    <fieldset class="mw-role-guide__choices">
      <legend class="mw-role-guide__legend">{{ legend }}</legend>
      <!-- The label wraps its radio (the native association); a click anywhere on the card chooses the path. -->
      <label v-for="role in roles" :key="role.id" class="mw-role-guide__choice">
        <input type="radio" :name="name" :value="role.id" :checked="chosen === role.id" @change="choose(role.id)" />
        <span class="mw-role-guide__choice-title">{{ role.title }}</span>
        <span class="mw-role-guide__choice-summary">{{ role.summary }}</span>
      </label>
    </fieldset>

    <div class="mw-role-guide__panels">
      <!-- Each panel is a labelled section whose heading names the path; the links go through `safeHref`. -->
      <section v-for="role in roles" :id="panelId(role.id)" :key="role.id" class="mw-role-guide__panel" :aria-labelledby="`${panelId(role.id)}-title`">
        <component :is="`h${level}`" :id="`${panelId(role.id)}-title`" class="mw-role-guide__title">{{ role.title }}</component>
        <ol class="mw-role-guide__steps">
          <!-- The number is drawn for sight only: the ordered list already gives assistive technology each step's position. -->
          <li v-for="(step, i) in role.steps" :key="i"><span class="mw-role-guide__num" aria-hidden="true">{{ i + 1 }}</span>{{ step }}</li>
        </ol>
<!-- A description list: each term ("You'll need", "You get") with its description, only for the facts the path has. -->
        <dl v-if="role.need || role.get" class="mw-role-guide__facts">
          <template v-if="role.need">
            <dt>You'll need</dt>
            <dd>{{ role.need }}</dd>
          </template>
          <template v-if="role.get">
            <dt>You get</dt>
            <dd>{{ role.get }}</dd>
          </template>
        </dl>
        <p v-if="role.links?.length" class="mw-role-guide__links">
          <UiButton v-for="(link, i) in role.links" :key="link.href" :href="safeHref(link.href)" :variant="i === 0 ? 'primary' : 'secondary'">
            {{ link.text }}
          </UiButton>
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* (Layout is intrinsic: grids with `minmax(0, …)` columns, no fixed widths, so it reflows at 320 px and at 200% text size.) */
/* The guide's own layout: the choices above, the panels below, in one column that may shrink (see the grid note). */
.mw-role-guide {
  display: grid;
  /* minmax(0, …): the column may shrink below its content's minimum, so the choices reflow at 200% text instead of widening the page. */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-md);
}

/* The choices: large cards drawn on native radios, so keyboard, touch and screen readers get a radio group for free. */
.mw-role-guide__choices {
  /* As many cards per row as fit (at least 14rem each), so the choices stack on a phone and sit side by side on a desktop. */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: var(--space-xs);
  inline-size: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  min-inline-size: 0;
}
/* The question ("I'm here to…") spans all the cards and is semibold, as it is the group's name. */
.mw-role-guide__legend {
  grid-column: 1 / -1;
  margin-bottom: var(--space-2xs);
  padding: 0;
  font-weight: var(--font-weight-semibold);
}
/* One choice card: the radio, the title and the summary in a small grid. Padding and a border make the whole card the click target. */
.mw-role-guide__choice {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-4xs) var(--space-2xs);
  align-items: start;
  padding: var(--space-sm);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  cursor: pointer;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}
/* A radio sized to a comfortable target (WCAG 2.5.8) and aligned with the title's first line. */
.mw-role-guide__choice input {
  grid-row: 1 / span 2;
  margin: 0.25em 0 0;
  inline-size: 1.25rem;
  block-size: 1.25rem;
  accent-color: var(--accent);
}
.mw-role-guide__choice-title {
  font-weight: var(--font-weight-semibold);
}
/* The summary is muted (AAA) and small; it explains the choice without competing with the title. */
.mw-role-guide__choice-summary {
  color: var(--muted);
  font-size: var(--font-size-sm);
}
/* The chosen card: a doubled accent edge, not a tinted fill (a tint lowers the muted summary below the AAA ratio in some looks). */
.mw-role-guide__choice:has(input:checked) {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}
/* The radio is the real control, so its keyboard focus is shown on the whole card. */
.mw-role-guide__choice:has(input:focus-visible) {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

/* The panels: every one shows where :has() is not supported (or without CSS); where it is, only the chosen one. */
/* One column of panels; the gap separates them where several are shown (no `:has` support). */
.mw-role-guide__panels {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-md);
}
@supports selector(:has(*)) {
  /* Hide every panel, then show the one whose position matches the checked radio's (up to six paths; a development warning covers more). */
  .mw-role-guide__panel {
    display: none;
  }
  .mw-role-guide:has(.mw-role-guide__choice:nth-of-type(1) input:checked) .mw-role-guide__panel:nth-of-type(1),
  .mw-role-guide:has(.mw-role-guide__choice:nth-of-type(2) input:checked) .mw-role-guide__panel:nth-of-type(2),
  .mw-role-guide:has(.mw-role-guide__choice:nth-of-type(3) input:checked) .mw-role-guide__panel:nth-of-type(3),
  .mw-role-guide:has(.mw-role-guide__choice:nth-of-type(4) input:checked) .mw-role-guide__panel:nth-of-type(4),
  .mw-role-guide:has(.mw-role-guide__choice:nth-of-type(5) input:checked) .mw-role-guide__panel:nth-of-type(5),
  .mw-role-guide:has(.mw-role-guide__choice:nth-of-type(6) input:checked) .mw-role-guide__panel:nth-of-type(6) {
    display: block;
  }
}
/* A panel's box. `scroll-margin` keeps the heading clear of the sticky header when the address fragment scrolls to it. */
.mw-role-guide__panel {
  min-inline-size: 0;
  overflow-wrap: anywhere;
  padding: var(--space-md);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  scroll-margin-block-start: var(--space-2xl);
}
/* The panel's heading is a heading element sized by this class, not by its rank, so the rank can follow the page's outline. */
.mw-role-guide__title {
  margin: 0 0 var(--space-sm);
  font-size: var(--font-size-lg);
}

/* The steps: a numbered path, each number in a ring and a line joining the rings (a background, so no generated content). */
.mw-role-guide__steps {
  /* The browser's list markers are removed: each step draws its own numbered ring. */
  margin: 0 0 var(--space-sm);
  padding: 0;
  list-style: none;
}
.mw-role-guide__steps li {
  position: relative;
  padding-inline-start: 2.75rem;
  padding-block-end: var(--space-sm);
  min-block-size: 2rem;
}
/* The line joining one ring to the next is a thin gradient background (no generated content, so nothing extra for a screen reader). */
.mw-role-guide__steps li:not(:last-child) {
  background: linear-gradient(var(--border), var(--border)) no-repeat calc(1rem - 1px) 2rem / 2px calc(100% - 2rem);
}
/* The number's ring: decorative (aria-hidden), positioned in the padding the step leaves at its inline start. */
.mw-role-guide__num {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: grid;
  place-items: center;
  inline-size: 2rem;
  block-size: 2rem;
  border: 2px solid var(--accent);
  border-radius: 50%;
  background: var(--surface);
  font-weight: var(--font-weight-semibold);
}

/* "You'll need" and "You get": a description list in two columns, term then description. */
.mw-role-guide__facts {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: var(--space-3xs) var(--space-sm);
  margin: 0 0 var(--space-sm);
}
/* Terms are semibold and descriptions muted, so the pair reads as label and value. */
.mw-role-guide__facts dt {
  font-weight: var(--font-weight-semibold);
}
.mw-role-guide__facts dd {
  margin: 0;
  color: var(--muted);
}
/* The links onward sit in a wrapping row; the first is the primary button. */
.mw-role-guide__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin: 0;
}

/* Forced colours drop box-shadows, so the chosen card needs an outline of its own. */
@media (forced-colors: active) {
  .mw-role-guide__choice:has(input:checked) {
    outline: 2px solid Highlight;
  }
}
/* No transition for people who ask for less motion. */
@media (prefers-reduced-motion: reduce) {
  .mw-role-guide__choice {
    transition: none;
  }
}
</style>
