<template>
  <small class="copyright-line">
    <a :href="computedSymbolHref" class="symbol-link" target="_blank" rel="noopener noreferrer"
      :aria-label="computedSymbolLabel">
      <span v-if="resolvedSymbol === 'copyright'">&copy;</span>
      <span v-else-if="resolvedSymbol === 'copyleft'">🄯</span>
      <span v-else-if="resolvedSymbol === 'kopimi'" class="kopimi-symbol">
        <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false" class="kopimi-mark">
          <path d="M12 4L22 23H2Z" fill="none" stroke="currentColor" stroke-width="1.5" />
          <text x="12" y="18" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif"
            font-size="11" fill="currentColor">
            C
          </text>
        </svg>
      </span>
    </a><span class="text-content"> {{ year }} {{ organisationName }}.<span v-if="resolvedRightsStatement">{{ `
        ${resolvedRightsStatement}` }}</span></span>
  </small>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type RightsStatementVariant = 'all' | 'none' | 'jam' | 'custom'
type SymbolVariant = 'copyright' | 'copyleft' | 'kopimi'

const props = withDefaults(defineProps<{
  organisationName: string
  year?: number
  rightsStatement?: RightsStatementVariant | string
  symbolVariant?: SymbolVariant
  /** Optional override for the symbol link href. Defaults based on symbolVariant. */
  symbolHref?: string
  /** Optional override for the symbol link aria-label. Defaults based on symbolVariant. */
  symbolLabel?: string
}>(), {
  year: () => new Date().getFullYear(),
  rightsStatement: 'all',
  symbolVariant: 'copyright',
})

const resolvedSymbol = computed(() => props.symbolVariant)

const computedSymbolHref = computed(() =>
  props.symbolHref ||
  (resolvedSymbol.value === 'kopimi' ? '/legal/powr.broccoli-kopimi.pdf' : resolvedSymbol.value === 'copyleft' ? '/legal/copyleft.html' : '/legal/copyright.html'),
)

const computedSymbolLabel = computed(() =>
  props.symbolLabel ||
  (resolvedSymbol.value === 'kopimi' ? 'Kopimi legal notice' : resolvedSymbol.value === 'copyleft' ? 'Copyleft legal notice' : 'Copyright legal notice'),
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
  /* Self-contained inline formatting context. `display: inherit` broke inside a
     flex parent (e.g. the dashboard sidebar's flex-column) — it turned the
     <small> into a flex container, which blockified the symbol/text children and
     silently voided their vertical-align. inline-block keeps children inline so
     the kopimi mark aligns consistently in every context. */
  display: inline-block;
  white-space: nowrap;
  text-align: center;
}

.symbol-link {
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  vertical-align: text-top;
  padding: 0 0.1rem;
}

.symbol-link:hover {
  text-decoration: underline;
}

.kopimi-symbol {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.kopimi-mark {
  display: inline;
  vertical-align: -0.15em;
}

.text-content {
  display: inline;
}
</style>
