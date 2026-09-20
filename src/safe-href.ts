/**
 * Validate a consumer-supplied URL before binding it to an `href` attribute.
 *
 * Allows `https:` (all hosts) and `http:` on `localhost`/`127.0.0.1` (dev only).
 * Returns `undefined` for `javascript:`, `data:`, or any other disallowed scheme so Vue
 * renders no `href` attribute rather than a potentially-executable link.
 */
export function safeHref(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  try {
    const u = new URL(url)
    if (u.protocol === 'https:') return url
    if (u.protocol === 'http:' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1'))
      return url
  } catch {
    // unparseable URL — reject
  }
  return undefined
}
