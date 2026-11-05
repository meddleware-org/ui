// @vitest-environment jsdom
// Two behaviours the keyboard and low-vision sweeps depend on: a field hint's tip is dismissible without moving the pointer or the focus
// (WCAG 1.4.13), and a sticky header publishes its real height for the scroll padding (WCAG 2.4.11).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import UiFieldHint from '../components/UiFieldHint.vue'
import { useStickyOffset } from '../composables/useStickyOffset'

describe('UiFieldHint', () => {
  const press = (key: string) => document.dispatchEvent(new KeyboardEvent('keydown', { key }))
  const mountHint = () => mount(UiFieldHint, { props: { fieldId: 'f1' }, slots: { default: 'Explains the field.' }, attachTo: document.body })
  afterEach(() => document.body.replaceChildren())

  it('Escape closes a tip opened by hover, and it stays closed until the pointer has left', async () => {
    const w = mountHint()
    const root = w.find('.mw-field-hint')
    await root.trigger('mouseenter')
    press('Escape')
    await nextTick()
    expect(root.classes()).toContain('mw-field-hint--dismissed')
    press('a')
    expect(root.classes()).toContain('mw-field-hint--dismissed')
    await root.trigger('mouseleave')
    expect(root.classes()).not.toContain('mw-field-hint--dismissed')
    w.unmount()
  })

  it('Escape closes a tip opened by focus, and it comes back when focus returns', async () => {
    const w = mountHint()
    const root = w.find('.mw-field-hint')
    await root.trigger('focusin')
    press('Escape')
    await nextTick()
    expect(root.classes()).toContain('mw-field-hint--dismissed')
    await root.trigger('focusout')
    expect(root.classes()).not.toContain('mw-field-hint--dismissed')
    await root.trigger('focusin')
    expect(root.classes()).not.toContain('mw-field-hint--dismissed')
    w.unmount()
  })

  it('listens for Escape only while it is hovered or focused, and not after it is gone', async () => {
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const w = mountHint()
    expect(add.mock.calls.filter((c) => c[0] === 'keydown')).toHaveLength(0)
    await w.find('.mw-field-hint').trigger('mouseenter')
    expect(add.mock.calls.filter((c) => c[0] === 'keydown')).toHaveLength(1)
    w.unmount()
    expect(remove.mock.calls.filter((c) => c[0] === 'keydown').length).toBeGreaterThan(0)
    add.mockRestore()
    remove.mockRestore()
  })
})

describe('sticky offsets', () => {
  let callback: ((entries: unknown[]) => void) | null = null
  let disconnected = 0
  beforeEach(() => {
    callback = null
    disconnected = 0
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: (entries: unknown[]) => void) {
          callback = cb
        }
        observe(): void {}
        disconnect(): void {
          disconnected++
        }
      },
    )
    // A frame, run at once: the write happens outside the observer callback, as in a browser, but the test need not wait.
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    document.documentElement.style.removeProperty('--mw-header-offset')
    document.documentElement.style.removeProperty('--mw-sticky-extra')
  })
  /** What the observer delivers when the element's border box is `h` tall. */
  const resize = (h: number) => callback!([{ borderBoxSize: [{ blockSize: h }], contentRect: { height: h - 8 } }])

  it('a sticky AppHeader publishes its measured height on <html>, follows a change, and removes it when it goes', () => {
    const w = mount(AppHeader, { props: { sticky: true }, attachTo: document.body })
    resize(130.4)
    expect(document.documentElement.style.getPropertyValue('--mw-header-offset')).toBe('131px')
    resize(56)
    expect(document.documentElement.style.getPropertyValue('--mw-header-offset')).toBe('56px')
    w.unmount()
    expect(disconnected).toBe(1)
    expect(document.documentElement.style.getPropertyValue('--mw-header-offset')).toBe('')
  })

  it('ignores a first notification of zero (not laid out yet) and keeps the reset fallback', () => {
    const w = mount(AppHeader, { props: { sticky: true }, attachTo: document.body })
    resize(0)
    expect(document.documentElement.style.getPropertyValue('--mw-header-offset')).toBe('')
    resize(56)
    expect(document.documentElement.style.getPropertyValue('--mw-header-offset')).toBe('56px')
    w.unmount()
  })

  it('publishes nothing for a header that does not stick', () => {
    const w = mount(AppHeader, { props: { sticky: false }, attachTo: document.body })
    expect(callback).toBeNull()
    w.unmount()
    expect(document.documentElement.style.getPropertyValue('--mw-header-offset')).toBe('')
  })

  it('falls back to the content box where the border box is not reported, and never measures layout itself', () => {
    const w = mount(AppHeader, { props: { sticky: true }, attachTo: document.body })
    const measured = vi.fn(() => ({ height: 999 }) as DOMRect)
    ;(w.element as HTMLElement).getBoundingClientRect = measured
    callback!([{ contentRect: { height: 52.2 } }])
    expect(document.documentElement.style.getPropertyValue('--mw-header-offset')).toBe('53px')
    expect(measured).not.toHaveBeenCalled()
    w.unmount()
  })

  it('writes only when the height changed, and never from inside the observer callback', () => {
    const writes: number[] = []
    const set = document.documentElement.style.setProperty.bind(document.documentElement.style)
    vi.spyOn(document.documentElement.style, 'setProperty').mockImplementation((p, v) => {
      writes.push(1)
      set(p, v)
    })
    const w = mount(AppHeader, { props: { sticky: true }, attachTo: document.body })
    resize(60)
    resize(60) // unchanged: no second write
    expect(writes).toHaveLength(1)
    w.unmount()
  })

  it('useStickyOffset publishes any element under a name of its own (a second sticky layer), and takes a component instance', async () => {
    const Strip = defineComponent({ render: () => h('nav', { class: 'strip' }, 'tabs') })
    const Host = defineComponent({
      setup() {
        const strip = ref<{ $el?: unknown } | null>(null)
        useStickyOffset(strip, '--mw-sticky-extra')
        return () => h(Strip, { ref: strip })
      },
    })
    const w = mount(Host, { attachTo: document.body })
    resize(48)
    expect(document.documentElement.style.getPropertyValue('--mw-sticky-extra')).toBe('48px')
    w.unmount()
    expect(document.documentElement.style.getPropertyValue('--mw-sticky-extra')).toBe('')
  })
})
