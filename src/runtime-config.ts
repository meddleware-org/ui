/**
 * Runtime endpoint configuration (ADR-0005; Series C step C1z).
 *
 * A static app is built once and configured per deployment: the operator serves a same-origin
 * `/runtime-config.json` (static-server mounts it from a ConfigMap) that overrides the build-time
 * endpoint variables. Only ENDPOINTS can be overridden — the hosts of machine-facing services (the
 * read-indexer and the Walrus upload relays) — never ids, fees, addresses or anything that moves money,
 * which stay build-time `VITE_*` values. A missing, non-JSON (an SPA fallback page) or invalid file
 * leaves the build-time values in force.
 *
 * Load it once, before the app's modules are imported, then read every endpoint through
 * {@link withRuntimeEnv}:
 *
 * ```ts
 * // main.ts
 * import { loadRuntimeConfig } from '@meddleware/ui'
 * await loadRuntimeConfig()
 * await import('./boot')
 *
 * // config.ts
 * const env = withRuntimeEnv(import.meta.env)
 * export const INDEXER_URL = env.VITE_INDEXER_URL || ''
 * ```
 */

/** The only keys a runtime config may set: machine-zone endpoints. */
export const RUNTIME_ENDPOINT_KEYS = [
  'VITE_INDEXER_URL',
  'VITE_WALRUS_RELAY_TESTNET',
  'VITE_WALRUS_RELAY_MAINNET',
] as const

export type RuntimeEndpointKey = (typeof RUNTIME_ENDPOINT_KEYS)[number]
export type RuntimeEndpoints = Partial<Record<RuntimeEndpointKey, string>>

/** Default location: same origin, so it is the operator's own file and needs no CORS. */
export const RUNTIME_CONFIG_PATH = '/runtime-config.json'
/** Larger than any real file; refuses a page served in its place before parsing it. */
const MAX_BYTES = 16 * 1024
const TIMEOUT_MS = 3000

let loaded: Readonly<RuntimeEndpoints> = Object.freeze({})

/** An endpoint value: `https:` (or `http:` on localhost / 127.0.0.1 for development), no credentials,
 * no query or fragment. Returns the value without a trailing slash, or undefined. */
export function parseEndpoint(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) return undefined
  if (/[\u0000- \u007f\\]/.test(value)) return undefined
  let u: URL
  try {
    u = new URL(value)
  } catch {
    return undefined
  }
  if (u.username || u.password || u.search || u.hash) return undefined
  const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1'
  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && local)) return undefined
  return u.href.replace(/\/+$/, '')
}

/**
 * Validate a parsed runtime config. Unknown keys and invalid values are dropped (and reported), so a
 * typo can never inject anything; the result holds only valid endpoint overrides.
 */
export function parseRuntimeConfig(input: unknown): { endpoints: RuntimeEndpoints; rejected: string[] } {
  const endpoints: RuntimeEndpoints = {}
  const rejected: string[] = []
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return { endpoints, rejected: ['<root>'] }
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!(RUNTIME_ENDPOINT_KEYS as readonly string[]).includes(key)) {
      rejected.push(key)
      continue
    }
    const endpoint = parseEndpoint(value)
    if (endpoint === undefined) rejected.push(key)
    else endpoints[key as RuntimeEndpointKey] = endpoint
  }
  return { endpoints, rejected }
}

/**
 * Fetch and apply the runtime config. Never throws: on any failure the build-time values stay in force.
 * Resolves to the endpoints that were applied.
 */
export async function loadRuntimeConfig(
  path: string = RUNTIME_CONFIG_PATH,
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<Readonly<RuntimeEndpoints>> {
  if (!path.startsWith('/') || path.startsWith('//')) return loaded
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetchImpl(path, { cache: 'no-cache', credentials: 'omit', redirect: 'error', signal: controller.signal })
    if (!res.ok) return loaded
    const type = res.headers.get('content-type') ?? ''
    if (!/^application\/json\b/i.test(type)) return loaded
    const text = await res.text()
    if (text.length > MAX_BYTES) return loaded
    const { endpoints, rejected } = parseRuntimeConfig(JSON.parse(text))
    if (rejected.length) console.warn(`runtime-config: ignored ${rejected.join(', ')}`)
    loaded = Object.freeze({ ...endpoints })
  } catch {
    // Absent, unreachable, slow or malformed: keep the build-time values.
  } finally {
    clearTimeout(timer)
  }
  return loaded
}

/** The endpoints applied by {@link loadRuntimeConfig} (empty before it ran or when nothing applied). */
export function runtimeEndpoints(): Readonly<RuntimeEndpoints> {
  return loaded
}

/** The build-time environment with the runtime endpoint overrides applied on top. */
export function withRuntimeEnv<T extends Record<string, unknown>>(buildEnv: T): T & RuntimeEndpoints {
  return { ...buildEnv, ...loaded }
}

/** Test hook: forget the loaded overrides. */
export function resetRuntimeConfigForTesting(): void {
  loaded = Object.freeze({})
}
