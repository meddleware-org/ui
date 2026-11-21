// Tests for `panelVars` (panel.ts): each panel variant resolves to the right local custom properties, and a caller's overrides win.
import { describe, expect, it } from 'vitest'
import { panelVars } from './panel'

// panelVars returns plain strings (custom property name to value), so the tests compare them directly: no DOM is needed.
describe('panelVars', () => {
  it('gives light and dark panels their own status colours, from the panel palette tokens (no duplicated hex fallbacks)', () => {
    expect(panelVars('light')).toMatchObject({
      '--_ok': 'var(--mw-panel-light-ok)',
      '--_danger': 'var(--mw-panel-light-danger)',
      '--_info': 'var(--mw-panel-light-info)',
    })
    expect(panelVars('dark')).toMatchObject({
      '--_ok': 'var(--mw-panel-dark-ok)',
      '--_danger': 'var(--mw-panel-dark-danger)',
      '--_info': 'var(--mw-panel-dark-info)',
    })
  })

  // A transparent panel sits on the page, so its status colours are the page's own roles, not a panel palette.
  it('keeps the page status roles for transparent panels', () => {
    expect(panelVars('transparent')).toMatchObject({ '--_ok': 'var(--ok)', '--_danger': 'var(--danger)' })
  })

  // The caller's value wins over the token default for the key it names.
  it('lets per-instance colours override the status defaults', () => {
    expect(panelVars('dark', { ok: '#0f0' })['--_ok' as keyof object]).toBe('#0f0')
  })
})
