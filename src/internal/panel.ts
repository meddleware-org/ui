import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

/** Panel colour scheme: theme-independent `light`/`dark` panel tokens, or `transparent`. */
export type PanelVariant = 'light' | 'dark' | 'transparent'

/** Optional per-instance colour overrides (win over the token defaults). */
export interface PanelColors {
  bg?: string
  surface?: string
  text?: string
  muted?: string
  border?: string
  ok?: string
  danger?: string
  info?: string
}

/**
 * Resolve a panel variant to a set of local CSS variables (`--_bg`, `--_text`,
 * …) that the header/sidebar/footer styles consume. Variants use the
 * theme-INDEPENDENT `--mw-panel-*` tokens so a dark panel renders correctly on
 * a light page (and vice-versa). Transparent inherits the page text colour.
 * Light/dark variants also carry status colours (`--_ok`, `--_danger`, `--_info`)
 * legible on that panel; the components re-scope `--ok`/`--danger`/`--info` to
 * them for their content. Transparent panels keep the page's status roles.
 * Any supplied `colors` override the defaults — token values are the default.
 */
export function panelVars(variant: PanelVariant, colors?: PanelColors): Record<string, string> {
  let base: Record<string, string>
  if (variant === 'transparent') {
    base = {
      '--_bg': 'transparent',
      '--_surface': 'transparent',
      '--_text': 'var(--text)',
      '--_muted': 'var(--muted)',
      '--_border': 'transparent',
      '--_ok': 'var(--ok)',
      '--_danger': 'var(--danger)',
      '--_info': 'var(--info)',
    }
  } else if (variant === 'light') {
    base = {
      '--_bg': 'var(--mw-panel-light-bg)',
      '--_surface': 'var(--mw-panel-light-surface)',
      '--_text': 'var(--mw-panel-light-text)',
      '--_muted': 'var(--mw-panel-light-muted)',
      '--_border': 'var(--mw-panel-light-border)',
      '--_ok': 'var(--mw-panel-light-ok)',
      '--_danger': 'var(--mw-panel-light-danger)',
      '--_info': 'var(--mw-panel-light-info)',
    }
  } else {
    base = {
      '--_bg': 'var(--mw-panel-dark-bg)',
      '--_surface': 'var(--mw-panel-dark-surface)',
      '--_text': 'var(--mw-panel-dark-text)',
      '--_muted': 'var(--mw-panel-dark-muted)',
      '--_border': 'var(--mw-panel-dark-border)',
      '--_ok': 'var(--mw-panel-dark-ok)',
      '--_danger': 'var(--mw-panel-dark-danger)',
      '--_info': 'var(--mw-panel-dark-info)',
    }
  }
  if (colors) {
    if (colors.bg) base['--_bg'] = colors.bg
    if (colors.surface) base['--_surface'] = colors.surface
    if (colors.text) base['--_text'] = colors.text
    if (colors.muted) base['--_muted'] = colors.muted
    if (colors.border) base['--_border'] = colors.border
    if (colors.ok) base['--_ok'] = colors.ok
    if (colors.danger) base['--_danger'] = colors.danger
    if (colors.info) base['--_info'] = colors.info
  }
  return base
}

const OVERRIDE_KEYS = ['bg', 'surface', 'text', 'muted', 'border', 'ok', 'danger', 'info'] as const

/**
 * Apply a panel's per-instance `colors` overrides to its root element. The variant's own colours are CLASSES (`mw-panel--dark` …, in the
 * reset), so only an override is ever written, and it is written through the CSSOM (`style.setProperty`) rather than a `style` attribute
 * in the template: nothing inline is rendered, and it needs no `'unsafe-inline'` in a strict `style-src`. Clearing `colors` clears it.
 */
export function usePanelOverrides(el: Ref<HTMLElement | null>, colors: () => PanelColors | undefined): void {
  const apply = (): void => {
    const root = el.value
    if (!root) return
    const c = colors()
    for (const k of OVERRIDE_KEYS) {
      const value = c?.[k]
      if (value) root.style.setProperty(`--_${k}`, value)
      else root.style.removeProperty(`--_${k}`)
    }
  }
  onMounted(apply)
  watch(colors, apply, { deep: true })
  onBeforeUnmount(() => {
    const root = el.value
    if (root) for (const k of OVERRIDE_KEYS) root.style.removeProperty(`--_${k}`)
  })
}
