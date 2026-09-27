// @vitest-environment jsdom
// Behaviour tests for the interactive primitives: AppTabNav keyboard roving (WAI-ARIA tabs) and
// UiDialog open/close/return-value plumbing.
import { describe, it, expect, beforeAll } from 'vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { installDialogShim } from './dialog-shim'
import AppTabNav from '../components/AppTabNav.vue'
import UiDialog from '../components/UiDialog.vue'

beforeAll(installDialogShim)

const TABS = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
]

describe('AppTabNav (WAI-ARIA tabs)', () => {
  function mountTabs(modelValue = 'a') {
    return mount(AppTabNav, {
      props: { tabs: TABS, modelValue, idPrefix: 'x', 'onUpdate:modelValue': () => {} },
      attachTo: document.body,
    })
  }

  it('links tabs to panels and exposes selection state', () => {
    const w = mountTabs('b')
    const tabs = w.findAll('[role="tab"]')
    expect(w.find('[role="tablist"]').exists()).toBe(true)
    expect(tabs[1].attributes('id')).toBe('x-tab-b')
    expect(tabs[1].attributes('aria-controls')).toBe('x-panel-b')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
    expect(tabs[0].attributes('aria-selected')).toBe('false')
    // Roving tabindex: only the selected tab is in the tab sequence.
    expect(tabs.map((t) => t.attributes('tabindex'))).toEqual(['-1', '0', '-1'])
    w.unmount()
  })

  it('arrow keys wrap, Home/End jump, and each move selects + focuses the tab', async () => {
    const w = mountTabs('a')
    const tabs = w.findAll('[role="tab"]')
    await tabs[0].trigger('keydown', { key: 'ArrowLeft' })
    await tabs[0].trigger('keydown', { key: 'ArrowRight' })
    await tabs[0].trigger('keydown', { key: 'End' })
    await tabs[2].trigger('keydown', { key: 'Home' })
    expect(w.emitted('update:modelValue')).toEqual([['c'], ['b'], ['c'], ['a']])
    expect(document.activeElement).toBe(tabs[0].element)
    w.unmount()
  })

  it('ignores unrelated keys', async () => {
    const w = mountTabs('a')
    await w.findAll('[role="tab"]')[0].trigger('keydown', { key: 'Enter' })
    expect(w.emitted('update:modelValue')).toBeUndefined()
    w.unmount()
  })
})

describe('UiDialog', () => {
  it('opens as a modal when open, and is labelled by its heading', async () => {
    const w = mount(UiDialog, { props: { open: true, title: 'Connect' }, attachTo: document.body })
    await nextTick()
    const dialog = w.find('dialog')
    expect(dialog.attributes('open')).toBeDefined()
    const heading = w.find('h2')
    expect(heading.text()).toBe('Connect')
    expect(dialog.attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(dialog.attributes('closedby')).toBe('any')
    w.unmount()
  })

  it('close(value) closes, updates v-model and emits the return value', async () => {
    const w = mount(UiDialog, {
      props: { open: true, title: 'Terms', 'onUpdate:open': (v: boolean) => w.setProps({ open: v }) },
      slots: {
        actions: ({ close }: { close: (v?: string) => void }) =>
          h('button', { type: 'button', onClick: () => close('accept') }, 'OK'),
      },
      attachTo: document.body,
    })
    await nextTick()
    await w.find('footer button').trigger('click')
    expect(w.emitted('close')).toEqual([['accept']])
    expect(w.emitted('update:open')).toEqual([[false]])
    expect(w.find('dialog').attributes('open')).toBeUndefined()
    w.unmount()
  })

  it('the close button dismisses with an empty return value', async () => {
    const w = mount(UiDialog, { props: { open: true, title: 'X' }, attachTo: document.body })
    await nextTick()
    await w.find('.mw-dialog__close').trigger('click')
    expect(w.emitted('close')).toEqual([['']])
    w.unmount()
  })

  it('non-dismissible: no close button, closedby=none, and cancel (Escape) is prevented', async () => {
    const w = mount(UiDialog, { props: { open: true, title: 'Uploading', dismissible: false }, attachTo: document.body })
    await nextTick()
    const dialog = w.find('dialog')
    expect(w.find('.mw-dialog__close').exists()).toBe(false)
    expect(dialog.attributes('closedby')).toBe('none')
    const cancel = new Event('cancel', { cancelable: true })
    dialog.element.dispatchEvent(cancel)
    expect(cancel.defaultPrevented).toBe(true)
    w.unmount()
  })

  it('fallback backdrop click (no native closedby) closes a dismissible dialog', async () => {
    const w = mount(UiDialog, { props: { open: true, title: 'X' }, attachTo: document.body })
    await nextTick()
    await w.find('dialog').trigger('click')
    expect(w.emitted('close')).toEqual([['']])
    w.unmount()
  })
})
