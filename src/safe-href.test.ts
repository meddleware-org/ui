import { describe, it, expect } from 'vitest'
import { safeHref } from './safe-href.js'

describe('safeHref', () => {
  it('passes https URLs unchanged', () => {
    expect(safeHref('https://example.com')).toBe('https://example.com')
    expect(safeHref('https://status.meddleware.co.uk')).toBe('https://status.meddleware.co.uk')
    expect(safeHref('https://suivision.xyz/account/0xabc')).toBe('https://suivision.xyz/account/0xabc')
  })

  it('passes http://localhost and http://127.0.0.1 (dev)', () => {
    expect(safeHref('http://localhost:8080')).toBe('http://localhost:8080')
    expect(safeHref('http://127.0.0.1:4000/api')).toBe('http://127.0.0.1:4000/api')
  })

  it('rejects javascript: scheme', () => {
    expect(safeHref('javascript:alert(1)')).toBeUndefined()
    expect(safeHref('javascript:void(0)')).toBeUndefined()
  })

  it('rejects data: scheme', () => {
    expect(safeHref('data:text/html,<h1>x</h1>')).toBeUndefined()
  })

  it('rejects http:// on non-localhost hosts', () => {
    expect(safeHref('http://evil.com')).toBeUndefined()
    expect(safeHref('http://192.168.1.1')).toBeUndefined()
  })

  it('returns undefined for empty/null/undefined input', () => {
    expect(safeHref('')).toBeUndefined()
    expect(safeHref(null)).toBeUndefined()
    expect(safeHref(undefined)).toBeUndefined()
  })

  it('returns undefined for unparseable strings', () => {
    expect(safeHref('not a url')).toBeUndefined()
    expect(safeHref('//no-scheme')).toBeUndefined()
  })
})
