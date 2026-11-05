// The public API is `src/index.ts`. A component that is not exported there does not exist for consumers, so every component file must be
// exported, and what is exported must still be what the README promises (the helpers moved to web-utils stay re-exported).
import { describe, it, expect } from 'vitest'
import * as ui from '../index'

const files = Object.keys(import.meta.glob('../components/*.vue')).map((p) => p.replace('../components/', '').replace('.vue', ''))

describe('public exports', () => {
  it('exports every component in src/components', () => {
    const missing = files.filter((name) => !(name in ui))
    expect(missing).toEqual([])
    expect(files.length).toBeGreaterThan(40)
  })

  it('keeps the helpers that moved to web-utils available from this package', () => {
    for (const name of ['suiExplorerUrl', 'walruscanBlobUrl', 'safeHref', 'safePath', 'safeIcon', 'truncateMiddle', 'parseSnapshot', 'isStatusLevel', 'STATUS_LABEL', 'STATUS_HEADLINE']) {
      expect(name in ui, name).toBe(true)
    }
  })

  it('exports the composables', () => {
    for (const name of ['useColorMode', 'useSeason', 'useNow', 'useStatusSnapshot', 'usePager', 'useStickyOffset', 'tabIds']) expect(name in ui, name).toBe(true)
  })
})
