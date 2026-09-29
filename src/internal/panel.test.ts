import { describe, expect, it } from 'vitest'
import { panelVars } from './panel'

describe('panelVars', () => {
  it('gives light and dark panels their own status colours, with token-equal fallbacks', () => {
    expect(panelVars('light')).toMatchObject({
      '--_ok': 'var(--mw-panel-light-ok, #177542)',
      '--_danger': 'var(--mw-panel-light-danger, #b3261e)',
      '--_info': 'var(--mw-panel-light-info, #1558b5)',
    })
    expect(panelVars('dark')).toMatchObject({
      '--_ok': 'var(--mw-panel-dark-ok, #5bb392)',
      '--_danger': 'var(--mw-panel-dark-danger, #f08a7e)',
      '--_info': 'var(--mw-panel-dark-info, #6ea8fe)',
    })
  })

  it('keeps the page status roles for transparent panels', () => {
    expect(panelVars('transparent')).toMatchObject({ '--_ok': 'var(--ok)', '--_danger': 'var(--danger)' })
  })

  it('lets per-instance colours override the status defaults', () => {
    expect(panelVars('dark', { ok: '#0f0' })['--_ok' as keyof object]).toBe('#0f0')
  })
})
