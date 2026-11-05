// @vitest-environment jsdom
// Two behaviours the keyboard and low-vision sweeps depend on: a field hint's tip is dismissible without moving the pointer or the focus
// (WCAG 1.4.13), and a sticky header publishes its real height for the scroll padding (WCAG 2.4.11).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import UiFieldHint from '../components/UiFieldHint.vue'

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

describe('AppHeader height', () => {
  let callback: (() => void) | null = null
  let disconnected = 0
  beforeEach(() => {
    callback = null
    disconnected = 0
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: () => void) {
          callback = cb
        }
        observe(): void {}
        disconnect(): void {
          disconnected++
        }
      },
    )
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    document.documentElement.style.removeProperty('--mw-header-offset')
  })

  it('publishes its measured height on <html> while sticky, follows a change, and removes it when it goes', () => {
    const w = mount(AppHeader, { props: { sticky: true }, attachTo: document.body })
    const header = w.element as HTMLElement
    header.getBoundingClientRect = () => ({ height: 130.4 }) as DOMRect
    callback!()
    expect(document.documentElement.style.getPropertyValue('--mw-header-offset')).toBe('131px')
    header.getBoundingClientRect = () => ({ height: 56 }) as DOMRect
    callback!()
    expect(document.documentElement.style.getPropertyValue('--mw-header-offset')).toBe('56px')
    w.unmount()
    expect(disconnected).toBe(1)
    expect(document.documentElement.style.getPropertyValue('--mw-header-offset')).toBe('')
  })

  it('publishes nothing for a header that does not stick', () => {
    const w = mount(AppHeader, { props: { sticky: false }, attachTo: document.body })
    expect(callback).toBeNull()
    w.unmount()
    expect(document.documentElement.style.getPropertyValue('--mw-header-offset')).toBe('')
  })
})
