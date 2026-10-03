// @vitest-environment jsdom
// Defensive behaviour of components that take consumer- or chain-supplied values.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CopyrightLine from '../components/CopyrightLine.vue'
import CopyableAddress from '../components/CopyableAddress.vue'

describe('CopyrightLine symbol link', () => {
  const href = (symbolHref?: string) =>
    mount(CopyrightLine, { props: { organisationName: 'Org', symbolHref } }).find('a').attributes('href')

  it('keeps the default and root-relative paths', () => {
    expect(href()).toBe('/legal/copyright.html')
    expect(href('/legal/other.html')).toBe('/legal/other.html')
    expect(href('https://example.org/legal')).toBe('https://example.org/legal')
  })

  it('refuses script URLs and paths that leave the site, falling back to the default', () => {
    expect(href('javascript:alert(1)')).toBe('/legal/copyright.html')
    expect(href('//evil.example/x')).toBe('/legal/copyright.html')
    expect(href('/\\evil.example/x')).toBe('/legal/copyright.html')
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

  it('restores a known stored mode', async () => {
    localStorage.setItem('mw-color-mode', 'light')
    vi.resetModules()
    const { useColorMode } = await import('../composables/useColorMode.js')
    expect(useColorMode('dark').mode.value).toBe('light')
  })
})
