<script setup lang="ts">
// A status or tag as words, a symbol and a border. The text keeps the body colour (so it meets contrast in every theme and season);
// the tone only colours the border, the tint and the symbol, so colour never carries the meaning alone (WCAG 1.4.1).
import { computed } from 'vue'

/** A badge's tone: what colours its border, tint and symbol. */
export type BadgeTone = 'ok' | 'warn' | 'danger' | 'info' | 'accent' | 'neutral'

const props = withDefaults(defineProps<{
  /** Semantic tone: the colour of the border, tint and symbol. Default `neutral`. */
  tone?: BadgeTone
  /**
   * A short symbol before the label (decorative, hidden from assistive technology: the label carries the meaning). Pass your own
   * (`'◐'`, `'○'`), `false` for none, or leave unset for the tone's default when `tone` is given.
   */
  symbol?: string | false
  /** @deprecated Use `tone`. `active` → ok, `pending` → warn, `closed`/`neutral` → neutral. */
  variant?: 'active' | 'closed' | 'pending' | 'neutral'
}>(), {
  // An explicit default: a prop typed `string | false` is otherwise cast to `false` when absent, which would hide the tone's own symbol.
  symbol: undefined,
})

// The symbol shown for each tone when the caller gives none: a shape per tone, so tone is never carried by colour alone.
const DEFAULT_SYMBOL: Record<BadgeTone, string> = { ok: '✓', warn: '!', danger: '✗', info: 'i', accent: '•', neutral: '•' }
// The deprecated `variant` prop mapped onto tones, so old callers keep working.
const FROM_VARIANT: Record<NonNullable<typeof props.variant>, BadgeTone> = { active: 'ok', pending: 'warn', closed: 'neutral', neutral: 'neutral' }

// `tone` wins over the deprecated `variant`; with neither, the badge is neutral.
const resolved = computed<BadgeTone>(() => props.tone ?? (props.variant ? FROM_VARIANT[props.variant] : 'neutral'))
// The symbol to draw: none when turned off, the caller's own when given, and the tone's default only when a tone was chosen explicitly.
const shown = computed(() => {
  if (props.symbol === false) return ''
  if (props.symbol !== undefined) return props.symbol
  return props.tone ? DEFAULT_SYMBOL[props.tone] : ''
})
</script>

<template>
  <span class="mw-badge" :class="`mw-badge--${resolved}`"><span v-if="shown" class="mw-badge__symbol" aria-hidden="true">{{ shown }}</span><slot /></span>
</template>

<style scoped>
/* `--_tone` is the one colour every tone sets; the border, the tint and the symbol all read from it. The text stays --text (AAA on the tint). */
.mw-badge {
  --_tone: var(--border);
  display: inline-flex;
  gap: var(--space-3xs);
  align-items: baseline;
  padding: 0 var(--space-xs);
  border: 1px solid var(--_tone);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--_tone) 12%, var(--bg));
  color: var(--text);
  font-size: var(--font-size-sm);
  /* A badge can hold a sentence ("Relay online · tip above the limit"): at a large text size or a narrow width it wraps instead of
     pushing the page sideways (WCAG 1.4.4, 1.4.10). */
  max-inline-size: 100%;
  overflow-wrap: anywhere;
}
.mw-badge--ok {
  --_tone: var(--ok);
}
.mw-badge--warn {
  --_tone: var(--warning);
}
.mw-badge--danger {
  --_tone: var(--danger);
}
.mw-badge--info {
  --_tone: var(--info);
}
.mw-badge--accent {
  --_tone: var(--accent);
}
/* The symbol takes the tone colour; it is decorative (hidden from assistive technology) and the label carries the meaning. */
.mw-badge__symbol {
  color: var(--_tone);
}
/* The warning hue is too light to read as a glyph on the tint, so warn uses its darker text variant for the symbol. */
.mw-badge--warn .mw-badge__symbol {
  color: var(--warning-text);
}
</style>
