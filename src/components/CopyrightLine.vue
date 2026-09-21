<template>
  <small>
    <a :href="computedSymbolHref" class="symbol-link" target="_blank" rel="noopener noreferrer" :aria-label="computedSymbolLabel">
      <span v-if="resolvedSymbol === 'copyright'">&copy;</span>
      <span v-else-if="resolvedSymbol === 'copyleft'">🄯</span>
      <span v-else-if="resolvedSymbol === 'kopimi'">
        <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false" class="kopimi-mark">
          <path d="M12 4L22 23H2Z" fill="none" stroke="currentColor" stroke-width="1.5" />
          <text x="12" y="18" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif"
            font-size="11" fill="currentColor">
            C
          </text>
        </svg>
      </span>
    </a>
    {{ year }} {{ organisationName }}.<span v-if="resolvedRightsStatement">{{ ` ${resolvedRightsStatement}` }}</span>
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
.symbol-link {
  color: inherit;
  text-decoration: none;
}

.symbol-link:hover {
  text-decoration: underline;
}
</style>
