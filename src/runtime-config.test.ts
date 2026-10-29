import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  loadRuntimeConfig,
  parseEndpoint,
  parseRuntimeConfig,
  resetRuntimeConfigForTesting,
  runtimeEndpoints,
  withRuntimeEnv,
} from './runtime-config.js'

const json = (body: unknown, init: { status?: number; type?: string } = {}) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'content-type': init.type ?? 'application/json' },
  })

afterEach(() => resetRuntimeConfigForTesting())

describe('parseEndpoint', () => {
  it('accepts https and local http, without a trailing slash', () => {
    expect(parseEndpoint('https://sui-indexer.meddleware.dev/')).toBe('https://sui-indexer.meddleware.dev')
    expect(parseEndpoint('https://relay.example/v1')).toBe('https://relay.example/v1')
    expect(parseEndpoint('http://localhost:8787')).toBe('http://localhost:8787')
  })
  it('refuses other schemes, remote http, credentials, query, fragment and control characters', () => {
    for (const bad of [
      'http://indexer.example', 'javascript:alert(1)', 'data:text/plain,x', 'https://u:p@example.com',
      'https://example.com/?x=1', 'https://example.com/#x', 'https://exa mple.com', 'https://a.example\\@b.example',
      '', 42, null, undefined, 'x'.repeat(3000),
    ]) expect(parseEndpoint(bad)).toBeUndefined()
  })
})

describe('parseRuntimeConfig', () => {
  it('keeps only known endpoint keys with valid values', () => {
    const { endpoints, rejected } = parseRuntimeConfig({
      VITE_INDEXER_URL: 'https://sui-indexer.meddleware.dev',
      VITE_WALRUS_RELAY_TESTNET: 'http://evil.example',
      VITE_ACCESS_GATE_ID_TESTNET: '0x1',
      VITE_FEE_MIST: '1',
    })
    expect(endpoints).toEqual({ VITE_INDEXER_URL: 'https://sui-indexer.meddleware.dev' })
    expect(rejected.sort()).toEqual(['VITE_ACCESS_GATE_ID_TESTNET', 'VITE_FEE_MIST', 'VITE_WALRUS_RELAY_TESTNET'])
  })
  it('refuses a non-object root', () => {
    expect(parseRuntimeConfig([]).endpoints).toEqual({})
    expect(parseRuntimeConfig('x').endpoints).toEqual({})
    expect(parseRuntimeConfig(null).endpoints).toEqual({})
  })
})

describe('loadRuntimeConfig', () => {
  it('applies a valid same-origin file and overrides the build-time env', async () => {
    const fetchImpl = vi.fn(async () => json({ VITE_INDEXER_URL: 'https://sui-indexer.meddleware.dev' }))
    await loadRuntimeConfig('/runtime-config.json', fetchImpl as unknown as typeof fetch)
    expect(fetchImpl).toHaveBeenCalledWith('/runtime-config.json', expect.objectContaining({ credentials: 'omit', redirect: 'error' }))
    expect(runtimeEndpoints()).toEqual({ VITE_INDEXER_URL: 'https://sui-indexer.meddleware.dev' })
    const env = withRuntimeEnv({ VITE_INDEXER_URL: 'https://sui-indexer.meddleware.dev', VITE_FEE_MIST: '7' })
    expect(env).toEqual({ VITE_INDEXER_URL: 'https://sui-indexer.meddleware.dev', VITE_FEE_MIST: '7' })
  })
  it('keeps the build-time values for 404, an HTML SPA fallback, oversize or malformed JSON, and network errors', async () => {
    for (const res of [
      () => json({}, { status: 404 }),
      () => json('<!doctype html><html></html>', { type: 'text/html' }),
      () => json('x'.repeat(20000)),
      () => json('{not json'),
      () => { throw new TypeError('network') },
    ]) {
      await loadRuntimeConfig('/runtime-config.json', vi.fn(async () => res()) as unknown as typeof fetch)
      expect(runtimeEndpoints()).toEqual({})
      expect(withRuntimeEnv({ VITE_INDEXER_URL: 'https://build.example' }).VITE_INDEXER_URL).toBe('https://build.example')
    }
  })
  it('never fetches a cross-origin or protocol-relative path', async () => {
    const fetchImpl = vi.fn()
    await loadRuntimeConfig('https://evil.example/c.json', fetchImpl as unknown as typeof fetch)
    await loadRuntimeConfig('//evil.example/c.json', fetchImpl as unknown as typeof fetch)
    expect(fetchImpl).not.toHaveBeenCalled()
  })
  it('the applied overrides are immutable', async () => {
    await loadRuntimeConfig('/runtime-config.json', (async () => json({ VITE_INDEXER_URL: 'https://a.example' })) as unknown as typeof fetch)
    expect(Object.isFrozen(runtimeEndpoints())).toBe(true)
  })
})
