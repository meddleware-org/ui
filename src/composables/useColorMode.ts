import { effectScope, ref, watch, type Ref } from 'vue'

/** The user's colour-mode preference: force `light`/`dark`, or follow the OS with `system`. */
export type ColorMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'mw-color-mode'

/** Module-singleton state — the colour mode is app-global and externally managed. */
const mode: Ref<ColorMode> = ref<ColorMode>('system')
let initialized = false

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function resolveDark(m: ColorMode): boolean {
  return m === 'dark' || (m === 'system' && systemPrefersDark())
}

function apply(m: ColorMode): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', resolveDark(m) ? 'dark' : 'light')
}

/**
 * External colour-mode state manager. `ColorModeControl` is presentational and
 * does NOT own state — bind it to `mode`/`set` (or your own store) instead.
 *
 * @param defaultMode used only on first init when nothing is persisted.
 */
export function useColorMode(defaultMode: ColorMode = 'system') {
  if (!initialized) {
    initialized = true
    let stored: ColorMode | null = null
    try {
      const value = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      // Only a known mode is restored; anything else stored under the key is ignored.
      if (value === 'light' || value === 'dark' || value === 'system') stored = value
    } catch {
      /* private mode / no storage — ignore */
    }
    mode.value = stored ?? defaultMode
    apply(mode.value)

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => {
          if (mode.value === 'system') apply('system')
        })
    }

    // A detached scope: the first caller may be a component that later unmounts, and a watcher created
    // in its setup would stop with it (theme changes would silently stop applying and persisting).
    effectScope(true).run(() => {
      watch(mode, (m) => {
        apply(m)
        try {
          if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, m)
        } catch {
          /* ignore */
        }
      })
    })
  }

  function set(m: ColorMode): void {
    mode.value = m
  }

  /** light → dark → system → light */
  function cycle(): void {
    set(mode.value === 'light' ? 'dark' : mode.value === 'dark' ? 'system' : 'light')
  }

  return { mode, set, cycle, isDark: () => resolveDark(mode.value) }
}
