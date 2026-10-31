// @vitest-environment jsdom
// theme-init.js runs before the app, as a plain script. It must agree with the app's own useColorMode and useSeason, or a page would
// flash one theme and then switch to another.
import SOURCE from '../theme-init.js?raw'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

function run(options: { stored?: string; fallback?: string; dark?: boolean; month?: number; storageThrows?: boolean } = {}): HTMLElement {
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('data-season')
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('dark') && !!options.dark, addEventListener() {} }))
  if (options.storageThrows) Object.defineProperty(window, 'localStorage', { configurable: true, get: () => { throw new Error('blocked') } })
  else if (options.stored !== undefined) localStorage.setItem('mw-color-mode', options.stored)
  if (options.month !== undefined) vi.setSystemTime(new Date(2026, options.month, 15))
  const script = options.fallback ? { getAttribute: (n: string) => (n === 'data-default' ? options.fallback! : null) } : null
  Object.defineProperty(document, 'currentScript', { configurable: true, value: script })
  new Function(SOURCE)()
  return document.documentElement
}

beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(document, 'currentScript')
})

describe('theme-init.js', () => {
  it('uses the visitor\'s saved choice over the default, and ignores anything else in storage', () => {
    expect(run({ stored: 'dark', fallback: 'light' }).getAttribute('data-theme')).toBe('dark')
    expect(run({ stored: 'light', fallback: 'dark' }).getAttribute('data-theme')).toBe('light')
    expect(run({ stored: 'purple', fallback: 'dark' }).getAttribute('data-theme')).toBe('dark')
  })

  it('falls back to data-default, then to the system preference', () => {
    expect(run({ fallback: 'dark' }).getAttribute('data-theme')).toBe('dark')
    expect(run({ fallback: 'light', dark: true }).getAttribute('data-theme')).toBe('light')
    expect(run({ dark: true }).getAttribute('data-theme')).toBe('dark')
    expect(run({ dark: false }).getAttribute('data-theme')).toBe('light')
    expect(run({ stored: 'system', dark: true }).getAttribute('data-theme')).toBe('dark')
  })

  it('sets the season for the month, the way useSeason does', async () => {
    const { useSeason } = await import('../composables/useSeason')
    for (const month of [0, 1, 2, 4, 5, 7, 8, 10, 11]) {
      const fromScript = run({ month }).getAttribute('data-season')
      document.documentElement.removeAttribute('data-season')
      useSeason()
      expect(fromScript, `month ${month}`).toBe(document.documentElement.getAttribute('data-season'))
    }
  })

  it('picks the same theme as useColorMode for the same inputs', async () => {
    vi.useRealTimers()
    for (const stored of ['light', 'dark', 'system']) {
      for (const dark of [true, false]) {
        const fromScript = run({ stored, dark, fallback: 'system' }).getAttribute('data-theme')
        vi.resetModules()
        document.documentElement.removeAttribute('data-theme')
        vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('dark') && dark, addEventListener() {} }))
        localStorage.setItem('mw-color-mode', stored)
        const { useColorMode } = await import('../composables/useColorMode')
        useColorMode('system')
        expect(fromScript, `${stored} dark=${dark}`).toBe(document.documentElement.getAttribute('data-theme'))
      }
    }
  })

  it('never throws, even with storage blocked', () => {
    expect(() => run({ storageThrows: true, fallback: 'dark' })).not.toThrow()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    Reflect.deleteProperty(window, 'localStorage')
  })
})
