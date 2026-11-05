// `@meddleware/eslint-config` accepts a template URL binding only when it calls one of these helpers (`URL_HELPERS`); they live in
// `@meddleware/web-utils`. A rename on one side would either break every app's lint or leave the rule accepting a name that no longer
// exists, so the two lists are checked against each other here, where both packages are installed.
import { URL_HELPERS } from '@meddleware/eslint-config'
import * as webUtils from '@meddleware/web-utils'
import { describe, expect, it } from 'vitest'

describe('URL helpers the lint rule accepts', () => {
  it('are all exported by @meddleware/web-utils as functions', () => {
    for (const name of URL_HELPERS) expect(typeof (webUtils as Record<string, unknown>)[name], name).toBe('function')
  })

  it('are the five the boundary documents', () => {
    expect([...URL_HELPERS].sort()).toEqual(['safeHref', 'safeIcon', 'safePath', 'suiExplorerUrl', 'walruscanBlobUrl'])
  })
})
