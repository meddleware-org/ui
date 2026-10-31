// @vitest-environment jsdom
// axe over the primitives added or reworked in the 0.1.x refresh (structure and ARIA only: jsdom has no layout, so colour is checked in
// a real browser by the gallery e2e).
import { describe, it, expect, beforeAll } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { axe } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'
import { installDialogShim } from './dialog-shim'
import UiBadge from '../components/UiBadge.vue'
import UiStatusDot from '../components/UiStatusDot.vue'
import UiNotice from '../components/UiNotice.vue'
import UiButton from '../components/UiButton.vue'
import UiCard from '../components/UiCard.vue'
import UiDataTable from '../components/UiDataTable.vue'
import UiSegmentedControl from '../components/UiSegmentedControl.vue'
import UiStepper from '../components/UiStepper.vue'
import UiToolbar from '../components/UiToolbar.vue'
import UiCopyButton from '../components/UiCopyButton.vue'
import UiFileField from '../components/UiFileField.vue'
import UiTextField from '../components/UiTextField.vue'
import UiSelectField from '../components/UiSelectField.vue'
import UiCheckField from '../components/UiCheckField.vue'
import UiDateTimeField from '../components/UiDateTimeField.vue'
import UiMeter from '../components/UiMeter.vue'
import UiPager from '../components/UiPager.vue'
import UiLiveStatus from '../components/UiLiveStatus.vue'
import UiEmptyState from '../components/UiEmptyState.vue'
import UiCodeBlock from '../components/UiCodeBlock.vue'
import UiAmount from '../components/UiAmount.vue'
import UiAppShell from '../components/UiAppShell.vue'
import AppHeader from '../components/AppHeader.vue'
import AppSidebar from '../components/AppSidebar.vue'
import SidebarItem from '../components/SidebarItem.vue'
import ColorModeControl from '../components/ColorModeControl.vue'
import StatusWidget from '../components/StatusWidget.vue'

expect.extend(axeMatchers)
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext
const opts = { rules: { region: { enabled: false } } }
beforeAll(installDialogShim)
const clean = async (html: string): Promise<void> => {
  expect(await axe(html, opts)).toHaveNoViolations()
}

describe('accessibility of the primitives (axe)', () => {
  it('badges, dots and notices', async () => {
    await clean(
      [
        mount(UiBadge, { props: { tone: 'ok' }, slots: { default: 'Posted' } }),
        mount(UiBadge, { props: { tone: 'warn', symbol: '◐' }, slots: { default: 'Queued' } }),
        mount(UiBadge, { props: { variant: 'closed' }, slots: { default: 'Closed' } }),
        mount(UiStatusDot, { props: { status: 'degraded', size: 'md' } }),
        mount(UiNotice, { props: { type: 'warning', message: 'Careful' } }),
        mount(UiNotice, { props: { type: 'error', as: 'div' }, slots: { default: '<p>One</p><p>Two</p>' } }),
      ].map((w) => w.html()).join(''),
    )
  })

  it('buttons: filled, link, busy and disabled links', async () => {
    await clean(
      [
        mount(UiButton, { slots: { default: 'Save' } }),
        mount(UiButton, { props: { variant: 'link', href: 'https://example.org' }, slots: { default: 'Docs' } }),
        mount(UiButton, { props: { busy: true }, slots: { default: 'Saving' } }),
        mount(UiButton, { props: { href: 'https://example.org', disabled: true }, slots: { default: 'Soon' } }),
      ].map((w) => w.html()).join(''),
    )
  })

  it('cards: section, article, plain and linked', async () => {
    await clean(
      '<ul role="list">' +
        [
          mount(UiCard, { props: { title: 'A', as: 'li', plain: true }, slots: { default: '<p>x</p>' } }),
          mount(UiCard, { props: { title: 'B', as: 'li', plain: true, href: 'https://example.org/b' }, slots: { default: '<p>y</p>' } }),
        ].map((w) => w.html()).join('') +
        '</ul>' +
        mount(UiCard, { props: { title: 'C', level: 2 }, slots: { default: '<p>z</p>', footer: '<p>f</p>' } }).html(),
    )
  })

  it('tables: rows, empty, captioned', async () => {
    await clean(
      [
        mount(UiDataTable, { props: { caption: 'Tasks', rows: 1 }, slots: { head: '<th scope="col">Task</th><th scope="col">Status</th>', default: '<tr><th scope="row">Write</th><td>Done</td></tr>' } }),
        mount(UiDataTable, { props: { caption: 'None', rows: 0, empty: 'Nothing yet' }, slots: { head: '<th scope="col">Task</th>', default: '' } }),
      ].map((w) => w.html()).join(''),
    )
  })

  it('segmented control, stepper (wizard and progress) and toolbar', async () => {
    await clean(
      [
        mount(UiSegmentedControl, { props: { options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], modelValue: 'a', label: 'View', layout: 'grid' } }),
        mount(UiStepper, { props: { steps: [{ id: 'a', label: 'One' }, { id: 'b', label: 'Two' }, { id: 'c', label: 'Three' }], modelValue: 1 } }),
        mount(UiStepper, { props: { orientation: 'vertical', steps: [{ id: 'a', label: 'Publish', status: 'done' }, { id: 'b', label: 'Verify', status: 'busy' }, { id: 'c', label: 'Share', status: 'error' }] } }),
        mount(UiToolbar, { props: { label: 'Page actions', actions: [{ id: 'a', label: 'One' }, { id: 'b', label: 'Two', disabled: true }] } }),
      ].map((w) => w.html()).join(''),
    )
  })

  it('copy button, amount, code block, live status, empty state and meter', async () => {
    await clean(
      [
        mount(UiCopyButton, { props: { value: '0x1' } }),
        mount(UiAmount, { props: { value: 13_100_000n } }),
        mount(UiCodeBlock, { props: { code: '{"a":1}', label: 'Payload' } }),
        mount(UiLiveStatus, { props: { message: 'Saved' } }),
        mount(UiEmptyState, { slots: { default: 'No gates yet', action: '<button type="button">Create</button>' } }),
        mount(UiMeter, { props: { label: 'Spend', used: 80, limit: 100, unit: 'USD' } }),
        mount(UiMeter, { props: { label: 'Other', used: 5, limit: null } }),
      ].map((w) => w.html()).join(''),
    )
  })

  it('fields: text, textarea, error, select, checkbox, date-time', async () => {
    await clean(
      [
        mount(UiTextField, { props: { id: 't1', label: 'Name', hint: 'Shown in wallets', modelValue: '' } }),
        mount(UiTextField, { props: { id: 't2', label: 'Body', rows: 3, modelValue: '' } }),
        mount(UiTextField, { props: { id: 't3', label: 'Symbol', error: 'Required', modelValue: '' } }),
        mount(UiFileField, { props: { id: 'f1', label: 'Icon', hint: 'PNG or SVG' } }),
        mount(UiFileField, { props: { id: 'f2', label: 'Icon', error: 'Too large' } }),
        mount(UiSelectField, { props: { id: 's1', label: 'Network', placeholder: 'Any', options: [['t', 'Testnet'], ['m', 'Mainnet']] as const, modelValue: '' } }),
        mount(UiCheckField, { props: { label: 'Send now', hint: 'goes live', modelValue: false } }),
        mount(UiDateTimeField, { props: { id: 'd1', label: 'Send at', zone: 'UTC', modelValue: '2026-07-01T08:30:00.000Z' } }),
      ].map((w) => w.html()).join(''),
    )
  })

  it('pager, shell panels with a menu button and a drawer, and the colour-mode control', async () => {
    await clean(
      [
        mount(UiPager, { props: { index: 1, hasNext: true, label: 'Tasks pages' } }),
        mount(AppHeader, { props: { sidebarId: 'nav' }, slots: { brand: '<a href="/">Brand</a>' } }),
        mount(AppSidebar, { attrs: { id: 'nav' }, slots: { default: () => [h(SidebarItem, { label: 'Home', active: true }), h(SidebarItem, { label: 'Docs', href: '/docs' })] } }),
        mount(ColorModeControl, { props: { modelValue: 'light' } }),
      ].map((w) => w.html()).join(''),
    )
  })

  it('the app shell: skip link, main, header and footer', async () => {
    const shell = mount(UiAppShell, { slots: { header: '<header><p>H</p></header>', default: '<h1>Title</h1>', footer: '<footer><p>F</p></footer>' } })
    expect(await axe(shell.html(), { rules: { region: { enabled: false } } })).toHaveNoViolations()
  })

  it('the status widget while checking', async () => {
    const wrapper = mount(StatusWidget)
    await clean(wrapper.html())
    wrapper.unmount()
  })
})
