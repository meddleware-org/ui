<template>
  <small class="copyright-line">
    <a :href="symbolIsPath ? safePath(computedSymbolHref) : safeHref(computedSymbolHref)" class="symbol-link" target="_blank" rel="noopener noreferrer"
      :aria-label="computedSymbolLabel">
      <template v-if="symbolVariant === 'copyright'">&copy;</template>
      <svg v-else-if="symbolVariant === 'copyleft'" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false" class="symbol-mark">
        <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.5" />
        <text x="-12" y="12" transform="scale(-1,1)" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-size="13" fill="currentColor">C</text>
      </svg>
      <svg v-else viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false" class="symbol-mark">
        <path d="M12 4L22 23H2Z" fill="none" stroke="currentColor" stroke-width="1.5" />
        <text x="12" y="18" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="11" fill="currentColor">C</text>
      </svg>
    </a> {{ year }} {{ organisationName }}.{{ resolvedRightsStatement ? ` ${resolvedRightsStatement}` : '' }}
  </small>
</template>

<script setup lang="ts">
// The same notice is drawn by the Link in Bio page renderer (repos/link-in-bio-service crates/core/src/render.rs, `rights_notice`),
// with a test that pins the Kopimi path: change the marks or the wording in both (workspace docs/legal L-IP-1).
import { computed } from 'vue'
import { safeHref, safePath } from '@meddleware/web-utils'

/** The named rights statements: `all` ("All rights reserved."), `none`, `jam` ("All jams preserved.") or any custom text. */
type RightsStatementVariant = 'all' | 'none' | 'jam' | 'custom'
/** The mark drawn before the year: the © sign, the copyleft mark or the Kopimi triangle. */
type SymbolVariant = 'copyright' | 'copyleft' | 'kopimi'

const props = withDefaults(defineProps<{
  /** The organisation named in the notice. */
  organisationName: string
  /** The year shown (default: the current year). */
  year?: number
  /** A named statement (`all`, `none`, `jam`), `''` for none, or any custom sentence. */
  rightsStatement?: RightsStatementVariant | string
  /** Which mark to draw and which legal document it links to. */
  symbolVariant?: SymbolVariant
  /**
   * Where the legal documents are served (default `https://meddleware.co.uk/legal/`, the one canonical host, so an app ships no copies).
   * A root-relative path (`/legal/`) serves them from the app's own origin instead.
   */
  legalBase?: string
  /** Optional override for the symbol link href. Defaults based on symbolVariant. */
  symbolHref?: string
  /** Optional override for the symbol link aria-label. Defaults based on symbolVariant. */
  symbolLabel?: string
}>(), {
  year: () => new Date().getFullYear(),
  rightsStatement: 'all',
  symbolVariant: 'copyright',
  legalBase: 'https://meddleware.co.uk/legal/',
})

/**
 * Check a link target: a root-relative path stays on the site (`safePath`), anything else must be a URL `safeHref` allows.
 * @param href - the candidate link
 * @returns the checked link, or `undefined` when it is not safe
 */
function symbolLink(href: string): string | undefined {
  return href.startsWith('/') ? safePath(href) : safeHref(href)
}

// The legal document each mark links to; the files are served from `legalBase`.
const DOCUMENT: Record<SymbolVariant, string> = {
  kopimi: 'powr.broccoli-kopimi.pdf',
  copyleft: 'copyleft.html',
  copyright: 'copyright.html',
}

// The link target, in order of preference: the caller's override, the document under `legalBase`, then a same-origin `/legal/` fallback, so a
// refused URL never leaves the symbol without a destination.
const computedSymbolHref = computed(
  () =>
    (props.symbolHref ? symbolLink(props.symbolHref) : undefined) ||
    symbolLink(props.legalBase.replace(/\/?$/, '/') + DOCUMENT[props.symbolVariant]) ||
    `/legal/${DOCUMENT[props.symbolVariant]}`,
)

// The binding in the template re-checks the value with the matching sanitiser, so the link is safe by
// construction there (the boundary lint rule requires a helper call in the binding).
const symbolIsPath = computed(() => computedSymbolHref.value.startsWith('/'))

// The accessible name of the symbol link: the symbol alone says nothing to a screen reader, so the label names the document.
const computedSymbolLabel = computed(() =>
  props.symbolLabel ||
  (props.symbolVariant === 'kopimi' ? 'Kopimi legal notice' : props.symbolVariant === 'copyleft' ? 'Copyleft legal notice' : 'Copyright legal notice'),
)

// The sentence after the organisation name; an empty string leaves it out, and an unknown value is shown as the caller's own text.
const resolvedRightsStatement = computed(() => {
  if (props.rightsStatement === '') return ''
  if (props.rightsStatement === 'none') return 'No rights reserved.'
  if (props.rightsStatement === 'all' || !props.rightsStatement) return 'All rights reserved.'
  if (props.rightsStatement === 'jam') return 'All jams preserved.'
  return props.rightsStatement
})
// Template: <small> is the element for legal and rights text. The symbol is the link to the legal document (and its accessible name); the copyleft and kopimi marks are drawn inline so they follow `currentColor` and need no image request. The href is rechecked here with the matching sanitiser, because the boundary lint rule wants a helper call in the binding itself.
</script>

<style scoped>
.copyright-line {
  /* Self-contained inline formatting context. `display: inherit` broke inside a flex parent (e.g. the dashboard sidebar's
     flex-column) — it turned the <small> into a flex container, which blockified the symbol/text children and silently voided
     their vertical-align. inline-block keeps children inline so the mark aligns consistently in every context. */
  display: inline-block;
  /* The line wraps at a large text size or a narrow width (the symbol stays with its own link). */
  max-width: 100%;
  text-align: center;
}

/* The symbol and its link stay together on one line (`nowrap`) and take the notice's own colour; hover underlines instead of recolouring. */
.symbol-link {
  white-space: nowrap;
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  vertical-align: text-top;
  padding: 0 var(--space-4xs);
}
.symbol-link:hover {
  text-decoration: underline;
}

/* The drawn marks sit slightly below the baseline so they align with the text's x-height. */
.symbol-mark {
  display: inline;
  vertical-align: -0.15em;
}
</style>
