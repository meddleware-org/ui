// @vitest-environment jsdom
// The vendored source, its recorded hash and the derived files are checked by scripts/check-brand.mjs (part of `npm test`).
import FAVICON from '../brand/files/favicon.svg?raw'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BrandMark from '../components/BrandMark.vue'
import * as ui from '../index'
import { MARK_PATH, MARK_VIEW_BOX } from '../brand/mark'

describe('the brand mark', () => {
  it('has a favicon with a transparent background that follows the colour mode and draws the same path', () => {
    expect(FAVICON).toContain('prefers-color-scheme:dark')
    expect(FAVICON).not.toMatch(/<rect|<circle|<text/)
    expect(FAVICON).toContain('fill-rule="evenodd"')
    expect(FAVICON).toContain(MARK_PATH)
    expect(FAVICON).toContain(MARK_VIEW_BOX)
  })

  it('is exported and renders decorative by default, named when given a label', () => {
    expect(ui.BrandMark).toBe(BrandMark)
    const plain = mount(BrandMark)
    expect(plain.get('svg').attributes('aria-hidden')).toBe('true')
    expect(plain.get('path').attributes('fill')).toBe('currentColor')
    expect(plain.get('path').attributes('d')).toBe(MARK_PATH)
    const named = mount(BrandMark, { props: { label: 'Meddleware' } })
    expect(named.get('svg').attributes('role')).toBe('img')
    expect(named.get('svg').attributes('aria-label')).toBe('Meddleware')
    expect(named.get('svg').attributes('aria-hidden')).toBeUndefined()
  })
})
