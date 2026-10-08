import { describe, expect, it } from 'vitest'
import { panelVars } from './panel'

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

  it('keeps the page status roles for transparent panels', () => {
    expect(panelVars('transparent')).toMatchObject({ '--_ok': 'var(--ok)', '--_danger': 'var(--danger)' })
  })

  it('lets per-instance colours override the status defaults', () => {
    expect(panelVars('dark', { ok: '#0f0' })['--_ok' as keyof object]).toBe('#0f0')
  })
})
