// @vitest-environment jsdom
// Two behaviours the keyboard and low-vision sweeps depend on: a field hint's tip is dismissible without moving the pointer or the focus
// (WCAG 1.4.13), and a sticky header publishes its real height for the scroll padding (WCAG 2.4.11).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import UiFieldHint from '../components/UiFieldHint.vue'
import { useStickyOffset } from '../composables/useStickyOffset'

// The hint's WCAG 1.4.13 behaviour (dismissible, hoverable, persistent) over fake timers, which stand in for the close delay.
describe('UiFieldHint', () => {
  /** Press a key on the document, as the keyboard does (the component listens there). */
  const press = (key: string) => document.dispatchEvent(new KeyboardEvent('keydown', { key }))
  /** A hint attached to the document (focus and popover need a real parent) with some help text. */
  const mountHint = () => mount(UiFieldHint, { props: { fieldId: 'f1' }, slots: { default: 'Explains the field.' }, attachTo: document.body })
  /** The pointer leaving closes the text after a short delay (so it can cross the gap to the text), so a test waits that long. */
  const leaveAndWait = async (root: { trigger: (e: string) => Promise<void> }) => {
    await root.trigger('mouseleave')
    vi.advanceTimersByTime(200)
  }
  // Fake timers for the close delay; the body is emptied after each case so a leftover hint cannot catch the next case's events.
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    document.body.replaceChildren()
  })

  it('draws its text as a <small> popover that the button describes (valid inside a <p>, a table heading or a label row)', () => {
    const w = mountHint()
    const tip = w.find('#f1-hint')
    expect(tip.element.tagName).toBe('SMALL')
    expect(tip.attributes('popover')).toBe('manual')
    // No ARIA role: HTML has no tooltip element, and the description reaches assistive technology through aria-describedby.
    expect(tip.attributes('role')).toBeUndefined()
    expect(w.find('button').attributes('aria-describedby')).toBe('f1-hint')
    expect(tip.text()).toBe('Explains the field.')
    w.unmount()
  })

  it('Escape closes a tip opened by hover, and it stays closed until the pointer has left', async () => {
    const w = mountHint()
    const root = w.find('.mw-field-hint')
    await root.trigger('mouseenter')
    expect(root.classes()).toContain('mw-field-hint--open')
    // Escape dismisses it without moving the pointer or the focus (WCAG 1.4.13).
    press('Escape')
    await nextTick()
    expect(root.classes()).toContain('mw-field-hint--dismissed')
    expect(root.classes()).not.toContain('mw-field-hint--open')
    // Any other key changes nothing: the tip stays dismissed while the pointer is still there.
    press('a')
    expect(root.classes()).toContain('mw-field-hint--dismissed')
    // Once the pointer has really left, the dismissal ends, so the next visit can open it again.
    await leaveAndWait(root)
    await nextTick()
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
    // Focus leaving ends the dismissal; focus coming back shows the tip again.
    await root.trigger('focusout')
    expect(root.classes()).not.toContain('mw-field-hint--dismissed')
    await root.trigger('focusin')
    expect(root.classes()).not.toContain('mw-field-hint--dismissed')
    expect(root.classes()).toContain('mw-field-hint--open')
    w.unmount()
  })

  it('stays open while the pointer crosses the gap to the text, and closes once it has really left', async () => {
    const w = mountHint()
    const root = w.find('.mw-field-hint')
    await root.trigger('mouseenter')
    // 50 ms is inside the 150 ms close delay: the tip must still be open (the pointer is crossing the gap to the text).
    await root.trigger('mouseleave')
    vi.advanceTimersByTime(50)
    await nextTick()
    expect(root.classes()).toContain('mw-field-hint--open')
    await root.trigger('mouseenter') // back onto the text (a descendant of the root) before the delay ends
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(root.classes()).toContain('mw-field-hint--open')
    await leaveAndWait(root)
    await nextTick()
    expect(root.classes()).not.toContain('mw-field-hint--open')
    w.unmount()
  })

  it('pressing the button toggles the text, which is how a touch screen opens it, and a press elsewhere closes it', async () => {
    const w = mountHint()
    const root = w.find('.mw-field-hint')
    // A press pins the text open: a touch screen sends hover events before the click, so a toggle would open and close it in one tap.
    await w.find('button').trigger('click')
    expect(root.classes()).toContain('mw-field-hint--open')
    // Pinned: it stays when nothing is hovered or focused.
    await root.trigger('mouseleave')
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(root.classes()).toContain('mw-field-hint--open')
    // A press somewhere else closes it.
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(root.classes()).not.toContain('mw-field-hint--open')
    // The button toggles: press to open, press again to close.
    await w.find('button').trigger('click')
    expect(root.classes()).toContain('mw-field-hint--open')
    await w.find('button').trigger('click')
    expect(root.classes()).not.toContain('mw-field-hint--open')
    w.unmount()
  })

  it('a tap on a touch screen (hover events first, then the click) leaves the text open, not closed', async () => {
    const w = mountHint()
    const root = w.find('.mw-field-hint')
    await root.trigger('mouseenter') // what a browser sends on a tap, before the click
    await w.find('button').trigger('click')
    expect(root.classes()).toContain('mw-field-hint--open')
    await w.find('button').trigger('click')
    expect(root.classes()).not.toContain('mw-field-hint--open')
    w.unmount()
  })

  it('a press inside the hint does not count as a press elsewhere', async () => {
    // A person reading the text may press on it (to select a word); that must not be taken for a press "elsewhere" and close it.
    const w = mountHint()
    const root = w.find('.mw-field-hint')
    await w.find('button').trigger('click')
    await w.find('#f1-hint').trigger('pointerdown')
    expect(root.classes()).toContain('mw-field-hint--open')
    w.unmount()
  })

  it('listens for Escape only while it is hovered, focused or pinned, and not after it is gone', async () => {
    // The document-level keydown listener is only worth having while the hint is in use; spies count its adds and removes.
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

  it('warns in development when the text holds a block element', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const w = mount(UiFieldHint, { props: { fieldId: 'f2' }, slots: { default: '<ul><li>one</li></ul>' }, attachTo: document.body })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('phrasing content only'))
    w.unmount()
    warn.mockRestore()
  })
})

// A sticky header publishes its real height as a custom property on <html>, written on a frame and only when it changed.
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
