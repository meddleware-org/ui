// @vitest-environment jsdom
// Defensive behaviour of components that take consumer- or chain-supplied values.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CopyrightLine from '../components/CopyrightLine.vue'
import CopyableAddress from '../components/CopyableAddress.vue'

// The symbol link must only ever carry a safe destination, whatever the caller passes.
describe('CopyrightLine symbol link', () => {
  /** The one canonical host for the legal documents, so an app ships no copies. */
  const DEFAULT = 'https://meddleware.co.uk/legal/copyright.html'
  /**
   * The href the notice's symbol link renders for a given override and other props.
   * @param symbolHref - the caller's override, if any
   * @param extra - other props (`legalBase`, `symbolVariant`)
   */
  const href = (symbolHref?: string, extra: Record<string, unknown> = {}) =>
    mount(CopyrightLine, { props: { organisationName: 'Org', symbolHref, ...extra } }).find('a').attributes('href')

  it('keeps the default and root-relative paths', () => {
    expect(href()).toBe(DEFAULT)
    expect(href('/legal/other.html')).toBe('/legal/other.html')
    expect(href('https://example.org/legal')).toBe('https://example.org/legal')
  })

  it('refuses script URLs and paths that leave the site, falling back to the default', () => {
    // Each unsafe value is refused and the default document is used instead, so the symbol never loses its destination.
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
    // `legalBase` is where the documents are served: an app that serves its own copies passes a root-relative path.
    expect(href(undefined, { legalBase: '/legal/' })).toBe('/legal/copyright.html')
    expect(href(undefined, { legalBase: '/legal', symbolVariant: 'kopimi' })).toBe('/legal/powr.broccoli-kopimi.pdf')
    expect(href(undefined, { legalBase: 'https://legal.example/docs/', symbolVariant: 'copyleft' })).toBe('https://legal.example/docs/copyleft.html')
  })

  it('refuses an unsafe legalBase, falling back to the app\'s own /legal/', () => {
    // A bad base falls back to the app's own `/legal/` (a same-origin path), not to the canonical host: the caller asked for something else.
    expect(href(undefined, { legalBase: 'javascript:alert(1)//' })).toBe('/legal/copyright.html')
    expect(href(undefined, { legalBase: '//evil.example/' })).toBe('/legal/copyright.html')
  })
})

// Truncation is for scanning, not verifying: where funds go the address is shown whole, and the copy always has the full value.
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

// Nothing is stored before the person asks (D134): the choice applies for the visit, and is written only while "Remember" is on.
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
    const cm = useColorMode()
    cm.setRemember(true)
    cm.set('dark')
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('mw-color-mode')).toBe('dark')
  })

  it('stores nothing until the person asks to be remembered, and forgets on request (L-PECR-2)', async () => {
    vi.resetModules()
    const { nextTick } = await import('vue')
    const { useColorMode } = await import('../composables/useColorMode.js')
    const cm = useColorMode('system')
    expect(cm.remember.value).toBe(false)
    cm.set('light')
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.length).toBe(0)
    cm.setRemember(true)
    await nextTick()
    expect(localStorage.getItem('mw-color-mode')).toBe('light')
    cm.set('dark')
    await nextTick()
    expect(localStorage.getItem('mw-color-mode')).toBe('dark')
    cm.setRemember(false)
    await nextTick()
    expect(localStorage.getItem('mw-color-mode')).toBeNull()
    cm.set('light')
    await nextTick()
    expect(localStorage.length).toBe(0)
  })

  it('restores a known stored mode', async () => {
    localStorage.setItem('mw-color-mode', 'light')
    vi.resetModules()
    const { useColorMode } = await import('../composables/useColorMode.js')
    const cm = useColorMode('dark')
    expect(cm.mode.value).toBe('light')
    // A stored choice is one the person asked to keep, so the box shows ticked.
    expect(cm.remember.value).toBe(true)
  })
})
