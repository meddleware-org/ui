// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StatusWidget from '../components/StatusWidget.vue'

const snapshot = (overall: string) => ({
  generated_at: '2026-10-08T00:00:00Z',
  overall,
  groups: [{ name: 'Platform', status: overall, components: [{ name: 'Web', status: overall }] }],
})
const respond = (body: unknown, ok = true) => vi.fn(async () => ({ ok, status: ok ? 200 : 500, json: async () => body }))

describe('StatusWidget', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  })

  it('claims nothing until the first answer arrives', async () => {
    vi.stubGlobal('fetch', () => new Promise(() => {}))
    const w = mount(StatusWidget)
    expect(w.text()).toBe('Checking status…')
    expect(w.classes()).toContain('status-widget--checking')
    expect(w.text()).not.toContain('operational')
    w.unmount()
  })

  it('shows the snapshot once it arrives, and "unavailable" when the request fails', async () => {
    vi.stubGlobal('fetch', respond(snapshot('operational')))
    const ok = mount(StatusWidget)
    await flushPromises()
    expect(ok.text()).toBe('All systems operational')
    expect(ok.classes()).toContain('status-widget--ok')
    ok.unmount()

    vi.stubGlobal('fetch', respond({}, false))
    const bad = mount(StatusWidget)
    await flushPromises()
    expect(bad.text()).toBe('Status unavailable')
    expect(bad.classes()).toContain('status-widget--error')
    bad.unmount()
  })

  it('treats a malformed body as unavailable, not as healthy', async () => {
    vi.stubGlobal('fetch', respond({ overall: 'operational' }))
    const w = mount(StatusWidget)
    await flushPromises()
    expect(w.text()).toBe('Status unavailable')
    w.unmount()
  })

  it('raises a tiny pollInterval to the minimum', async () => {
    const fetchMock = respond(snapshot('operational'))
    vi.stubGlobal('fetch', fetchMock)
    const w = mount(StatusWidget, { props: { pollInterval: 1 } })
    await flushPromises()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(14_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(2_000)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    w.unmount()
  })

  it('does not poll while the tab is hidden, and catches up when it is shown', async () => {
    const fetchMock = respond(snapshot('operational'))
    vi.stubGlobal('fetch', fetchMock)
    const w = mount(StatusWidget, { props: { pollInterval: 20_000 } })
    await flushPromises()
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    await vi.advanceTimersByTimeAsync(60_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new Event('visibilitychange'))
    await flushPromises()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    w.unmount()
  })

  it('links only to an allowed URL', () => {
    vi.stubGlobal('fetch', () => new Promise(() => {}))
    const w = mount(StatusWidget, { props: { href: 'javascript:alert(1)' } })
    expect(w.attributes('href')).toBeUndefined()
    w.unmount()
  })
})
