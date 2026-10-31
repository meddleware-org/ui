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
import { computed } from 'vue'
import { safeHref, safePath } from '@meddleware/web-utils'

type RightsStatementVariant = 'all' | 'none' | 'jam' | 'custom'
type SymbolVariant = 'copyright' | 'copyleft' | 'kopimi'

const props = withDefaults(defineProps<{
  organisationName: string
  year?: number
  rightsStatement?: RightsStatementVariant | string
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

/** A root-relative path that stays on the site (`safePath`) or a URL `safeHref` allows. */
function symbolLink(href: string): string | undefined {
  return href.startsWith('/') ? safePath(href) : safeHref(href)
}

const DOCUMENT: Record<SymbolVariant, string> = {
  kopimi: 'powr.broccoli-kopimi.pdf',
  copyleft: 'copyleft.html',
  copyright: 'copyright.html',
}

const computedSymbolHref = computed(
  () =>
    (props.symbolHref ? symbolLink(props.symbolHref) : undefined) ||
    symbolLink(props.legalBase.replace(/\/?$/, '/') + DOCUMENT[props.symbolVariant]) ||
    `/legal/${DOCUMENT[props.symbolVariant]}`,
)

// The binding in the template re-checks the value with the matching sanitiser, so the link is safe by
// construction there (the boundary lint rule requires a helper call in the binding).
const symbolIsPath = computed(() => computedSymbolHref.value.startsWith('/'))

const computedSymbolLabel = computed(() =>
  props.symbolLabel ||
  (props.symbolVariant === 'kopimi' ? 'Kopimi legal notice' : props.symbolVariant === 'copyleft' ? 'Copyleft legal notice' : 'Copyright legal notice'),
)

const resolvedRightsStatement = computed(() => {
  if (props.rightsStatement === '') return ''
  if (props.rightsStatement === 'none') return 'No rights reserved.'
  if (props.rightsStatement === 'all' || !props.rightsStatement) return 'All rights reserved.'
  if (props.rightsStatement === 'jam') return 'All jams preserved.'
  return props.rightsStatement
})
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

.symbol-mark {
  display: inline;
  vertical-align: -0.15em;
}
</style>
