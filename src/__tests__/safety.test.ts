// @vitest-environment jsdom
// Defensive behaviour of components that take consumer- or chain-supplied values.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CopyrightLine from '../components/CopyrightLine.vue'
import CopyableAddress from '../components/CopyableAddress.vue'

describe('CopyrightLine symbol link', () => {
  /** The one canonical host for the legal documents, so an app ships no copies. */
  const DEFAULT = 'https://meddleware.co.uk/legal/copyright.html'
  const href = (symbolHref?: string, extra: Record<string, unknown> = {}) =>
    mount(CopyrightLine, { props: { organisationName: 'Org', symbolHref, ...extra } }).find('a').attributes('href')

  it('keeps the default and root-relative paths', () => {
    expect(href()).toBe(DEFAULT)
    expect(href('/legal/other.html')).toBe('/legal/other.html')
    expect(href('https://example.org/legal')).toBe('https://example.org/legal')
  })

  it('refuses script URLs and paths that leave the site, falling back to the default', () => {
    expect(href('javascript:alert(1)')).toBe(DEFAULT)
    expect(href('//evil.example/x')).toBe(DEFAULT)
    expect(href('/\\evil.example/x')).toBe(DEFAULT)
  })

  it('refuses a tab, newline or space after the slash (the URL parser deletes them, leaving //host)', () => {
    for (const bad of ['/\t/evil.example', '/\n/evil.example', '/\r/evil.example', '/ /evil.example', '\t//evil.example']) {
      expect(href(bad), JSON.stringify(bad)).toBe(DEFAULT)
    }
  })

  it('refuses an absolute URL with credentials', () => {
    expect(href('https://example.org@evil.example/legal')).toBe(DEFAULT)
  })

  it('serves the documents from legalBase: another host, or the app\'s own origin', () => {
    expect(href(undefined, { legalBase: '/legal/' })).toBe('/legal/copyright.html')
    expect(href(undefined, { legalBase: '/legal', symbolVariant: 'kopimi' })).toBe('/legal/powr.broccoli-kopimi.pdf')
    expect(href(undefined, { legalBase: 'https://legal.example/docs/', symbolVariant: 'copyleft' })).toBe('https://legal.example/docs/copyleft.html')
  })

  it('refuses an unsafe legalBase, falling back to the app\'s own /legal/', () => {
    expect(href(undefined, { legalBase: 'javascript:alert(1)//' })).toBe('/legal/copyright.html')
    expect(href(undefined, { legalBase: '//evil.example/' })).toBe('/legal/copyright.html')
  })
})

describe('CopyableAddress', () => {
  afterEach(() => vi.unstubAllGlobals())

  const click = async (writeText: () => Promise<void>) => {
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const w = mount(CopyableAddress, { props: { address: '0xabc' } })
    await w.find('button').trigger('click')
    await flushPromises()
    return w.find('button').attributes('aria-label')
  }

  it('confirms a copy the clipboard accepted', async () => {
    expect(await click(vi.fn().mockResolvedValue(undefined))).toBe('Copied')
  })

  it('does not claim a copy the clipboard refused (and does not reject)', async () => {
    expect(await click(vi.fn().mockRejectedValue(new Error('denied')))).toBe('Copy')
  })
})

describe('useColorMode', () => {
  afterEach(() => localStorage.clear())

  it('ignores an unknown stored mode', async () => {
    localStorage.setItem('mw-color-mode', 'purple')
    vi.resetModules()
    const { useColorMode } = await import('../composables/useColorMode.js')
    expect(useColorMode('dark').mode.value).toBe('dark')
  })

  it('keeps applying and persisting after the component that called it first unmounts', async () => {
    vi.resetModules()
    const { defineComponent, h, nextTick } = await import('vue')
    const { mount } = await import('@vue/test-utils')
    const { useColorMode } = await import('../composables/useColorMode.js')
    // The first caller is a component's setup (an embedded tool view) that goes away.
    const First = defineComponent({ setup: () => { useColorMode('light'); return () => h('div') } })
    mount(First).unmount()
    useColorMode().set('dark')
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('mw-color-mode')).toBe('dark')
  })

  it('restores a known stored mode', async () => {
    localStorage.setItem('mw-color-mode', 'light')
    vi.resetModules()
    const { useColorMode } = await import('../composables/useColorMode.js')
    expect(useColorMode('dark').mode.value).toBe('light')
  })
})
