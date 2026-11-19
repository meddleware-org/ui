import { effectScope, ref, watch, type Ref } from 'vue'

/** The user's colour-mode preference: force `light`/`dark`, or follow the OS with `system`. */
export type ColorMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'mw-color-mode'

/** Module-singleton state — the colour mode is app-global and externally managed. */
const mode: Ref<ColorMode> = ref<ColorMode>('system')
/**
 * Whether the choice is kept on this device. Off until the person ticks "Remember on this device" (or a choice they asked to be
 * remembered earlier is found). A choice always applies for the visit; it is written to storage only while this is on, and turning it
 * off removes what was stored: the "simple means of objecting" PECR Sch. A1 para 6 asks for (docs/legal STORAGE_LEDGER B2, L-PECR-2).
 */
const remember: Ref<boolean> = ref(false)
let initialized = false

function store(m: ColorMode | null): void {
  try {
    if (typeof localStorage === 'undefined') return
    if (m === null) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, m)
  } catch {
    /* private mode / no storage: the choice still applies for the visit */
  }
}

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
 * Nothing is stored unless the person asks: bind `remember` to the control's "Remember on this device" box
 * (`ColorModeControl` `v-model:remember`). Without it, the system setting (or `defaultMode`) applies and choices last for the visit.
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
    remember.value = stored !== null
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
        if (remember.value) store(m)
      })
      watch(remember, (keep) => store(keep ? mode.value : null))
    })
  }

  function set(m: ColorMode): void {
    mode.value = m
  }

  /** light → dark → system → light */
  function cycle(): void {
    set(mode.value === 'light' ? 'dark' : mode.value === 'dark' ? 'system' : 'light')
  }

  /** Keep the choice on this device (true) or forget it (false: the stored value is removed at once). */
  function setRemember(keep: boolean): void {
    remember.value = keep
  }

  return { mode, set, cycle, remember, setRemember, isDark: () => resolveDark(mode.value) }
}
