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

const chosen = ref(props.roles[0]?.id ?? '')
const panelId = (id: string): string => `for-${id}`

/** Mirror the choice in the address so it can be shared; replaceState, so the back button is not filled with choices. */
function choose(id: string): void {
  chosen.value = id
  if (typeof window !== 'undefined' && typeof history !== 'undefined') {
    history.replaceState(history.state, '', `#${panelId(id)}`)
  }
}

onMounted(() => {
  const fromHash = window.location.hash.replace(/^#for-/, '')
  if (props.roles.some((r) => r.id === fromHash)) chosen.value = fromHash
  if (import.meta.env.DEV && (props.roles.length < 2 || props.roles.length > 6)) {
    console.warn(`UiRoleGuide: ${props.roles.length} roles; the guide is drawn for two to six`)
  }
})
</script>

<template>
  <div class="mw-role-guide">
    <fieldset class="mw-role-guide__choices">
      <legend class="mw-role-guide__legend">{{ legend }}</legend>
      <label v-for="role in roles" :key="role.id" class="mw-role-guide__choice">
        <input type="radio" :name="name" :value="role.id" :checked="chosen === role.id" @change="choose(role.id)" />
        <span class="mw-role-guide__choice-title">{{ role.title }}</span>
        <span class="mw-role-guide__choice-summary">{{ role.summary }}</span>
      </label>
    </fieldset>

    <div class="mw-role-guide__panels">
      <section v-for="role in roles" :id="panelId(role.id)" :key="role.id" class="mw-role-guide__panel" :aria-labelledby="`${panelId(role.id)}-title`">
        <component :is="`h${level}`" :id="`${panelId(role.id)}-title`" class="mw-role-guide__title">{{ role.title }}</component>
        <ol class="mw-role-guide__steps">
          <!-- The number is drawn for sight only: the ordered list already gives assistive technology each step's position. -->
          <li v-for="(step, i) in role.steps" :key="i"><span class="mw-role-guide__num" aria-hidden="true">{{ i + 1 }}</span>{{ step }}</li>
        </ol>
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
.mw-role-guide {
  display: grid;
  gap: var(--space-md);
}

/* The choices: large cards drawn on native radios, so keyboard, touch and screen readers get a radio group for free. */
.mw-role-guide__choices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: var(--space-xs);
  margin: 0;
  padding: 0;
  border: 0;
  min-inline-size: 0;
}
.mw-role-guide__legend {
  grid-column: 1 / -1;
  margin-bottom: var(--space-2xs);
  padding: 0;
  font-weight: var(--font-weight-semibold);
}
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
.mw-role-guide__choice-summary {
  color: var(--muted);
  font-size: var(--font-size-sm);
}
/* The chosen card: a doubled accent edge, not a tinted fill (a tint lowers the muted summary below the AAA ratio in some looks). */
.mw-role-guide__choice:has(input:checked) {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}
.mw-role-guide__choice:has(input:focus-visible) {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

/* The panels: every one shows where :has() is not supported (or without CSS); where it is, only the chosen one. */
.mw-role-guide__panels {
  display: grid;
  gap: var(--space-md);
}
@supports selector(:has(*)) {
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
.mw-role-guide__panel {
  padding: var(--space-md);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  scroll-margin-block-start: var(--space-2xl);
}
.mw-role-guide__title {
  margin: 0 0 var(--space-sm);
  font-size: var(--font-size-lg);
}

/* The steps: a numbered path, each number in a ring and a line joining the rings (a background, so no generated content). */
.mw-role-guide__steps {
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
.mw-role-guide__steps li:not(:last-child) {
  background: linear-gradient(var(--border), var(--border)) no-repeat calc(1rem - 1px) 2rem / 2px calc(100% - 2rem);
}
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

.mw-role-guide__facts {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--space-3xs) var(--space-sm);
  margin: 0 0 var(--space-sm);
}
.mw-role-guide__facts dt {
  font-weight: var(--font-weight-semibold);
}
.mw-role-guide__facts dd {
  margin: 0;
  color: var(--muted);
}
.mw-role-guide__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin: 0;
}

@media (forced-colors: active) {
  .mw-role-guide__choice:has(input:checked) {
    outline: 2px solid Highlight;
  }
}
@media (prefers-reduced-motion: reduce) {
  .mw-role-guide__choice {
    transition: none;
  }
}
</style>
