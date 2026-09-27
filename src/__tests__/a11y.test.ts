// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { axe } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'
import { installDialogShim } from './dialog-shim'

// Runtime registration (vitest globals are off, so register explicitly).
// The matcher's TYPE augmentation lives in ./vitest-axe.d.ts.
expect.extend(axeMatchers)

// Component fragments are not full pages, so page-level landmark rules
// (region/landmark) don't apply — disable them for isolated component tests.
const opts = { rules: { region: { enabled: false } } }
import CopyrightLine from '../components/CopyrightLine.vue'
import UiButton from '../components/UiButton.vue'
import SidebarItem from '../components/SidebarItem.vue'
import SidebarGroup from '../components/SidebarGroup.vue'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import AppSidebar from '../components/AppSidebar.vue'
import AppTabNav from '../components/AppTabNav.vue'
import UiTabPanel from '../components/UiTabPanel.vue'
import ColorModeControl from '../components/ColorModeControl.vue'
import UiDialog from '../components/UiDialog.vue'
import UiSegmentedControl from '../components/UiSegmentedControl.vue'
import UiFormField from '../components/UiFormField.vue'
import UiSelect from '../components/UiSelect.vue'
import UiStatGrid from '../components/UiStatGrid.vue'
import UiStatRow from '../components/UiStatRow.vue'
import UiStatusBar from '../components/UiStatusBar.vue'
import UiToolbar from '../components/UiToolbar.vue'
import UiPanel from '../components/UiPanel.vue'
import UiCard from '../components/UiCard.vue'
import UiActivityFeed from '../components/UiActivityFeed.vue'
import UiActivityItem from '../components/UiActivityItem.vue'

beforeAll(installDialogShim)

async function expectNoViolations(html: string): Promise<void> {
  expect(await axe(html, opts)).toHaveNoViolations()
}

// Accessibility smoke tests: render representative components and assert axe
// finds no WCAG violations in the rendered markup.
describe('accessibility (axe)', () => {
  it('CopyrightLine has no violations', async () => {
    const wrapper = mount(CopyrightLine, {
      props: { organisationName: 'Meddleware', symbolVariant: 'kopimi' },
    })
    await expectNoViolations(wrapper.html())
  })

  it('UiButton has no violations', async () => {
    const wrapper = mount(UiButton, { slots: { default: 'Click me' } })
    await expectNoViolations(wrapper.html())
  })

  it('SidebarItem has no violations', async () => {
    const wrapper = mount(SidebarItem, { props: { label: 'Treasury', icon: '🏛' } })
    await expectNoViolations(wrapper.html())
  })

  it('SidebarGroup (fieldset + legend) has no violations', async () => {
    const wrapper = mount(SidebarGroup, {
      props: { label: 'Blockchain' },
      slots: { default: () => [h(SidebarItem, { label: 'Sui' }), h(SidebarItem, { label: 'Walrus' })] },
    })
    await expectNoViolations(wrapper.html())
  })

  it('AppHeader / AppFooter / AppSidebar shells have no violations', async () => {
    const header = mount(AppHeader, {
      slots: { brand: '<a href="/">Meddleware</a>', actions: '<button type="button">Connect</button>' },
    })
    const footer = mount(AppFooter, {
      props: { docsUrl: 'https://docs.example', devUrl: 'https://dev.example' },
      slots: { start: '<small>© Meddleware</small>' },
    })
    const sidebar = mount(AppSidebar, {
      slots: { default: () => h(SidebarItem, { label: 'Treasury' }), foot: '<p>No wallet connected</p>' },
    })
    await expectNoViolations(header.html() + sidebar.html() + footer.html())
  })

  it('AppTabNav + UiTabPanel (ARIA tabs) have no violations', async () => {
    const tabs = mount(AppTabNav, {
      props: {
        tabs: [
          { id: 'a', label: 'Alpha' },
          { id: 'b', label: 'Beta' },
        ],
        modelValue: 'a',
        idPrefix: 't',
        ariaLabel: 'Sections',
      },
    })
    const panel = mount(UiTabPanel, { props: { idPrefix: 't', tab: 'a' }, slots: { default: '<p>Alpha content</p>' } })
    await expectNoViolations(tabs.html() + panel.html())
  })

  it('ColorModeControl (fieldset + legend) has no violations', async () => {
    const wrapper = mount(ColorModeControl, { props: { modelValue: 'dark' } })
    await expectNoViolations(wrapper.html())
  })

  it('UiDialog (open) has no violations', async () => {
    const wrapper = mount(UiDialog, {
      props: { open: true, title: 'Before you deploy' },
      slots: { default: '<p>Terms apply.</p>', actions: '<button type="button">Continue</button>' },
      attachTo: document.body,
    })
    await expectNoViolations(wrapper.html())
    wrapper.unmount()
  })

  it('UiSegmentedControl (radio group) has no violations', async () => {
    const wrapper = mount(UiSegmentedControl, {
      props: {
        options: [
          { id: 'x', label: 'X' },
          { id: 'y', label: 'Y' },
        ],
        modelValue: 'x',
        ariaLabel: 'Mode',
      },
    })
    await expectNoViolations(wrapper.html())
  })

  it('UiFormField with input, and UiSelect, have no violations', async () => {
    const field = mount(UiFormField, {
      props: { id: 'name', label: 'Token name', hint: 'Shown in wallets' },
      slots: { default: (p: { attrs: Record<string, unknown> }) => h('input', { type: 'text', ...p.attrs }) },
    })
    const select = mount(UiSelect, {
      attrs: { 'aria-label': 'Network' },
      slots: { default: () => [h('option', { value: 'testnet' }, 'Testnet')] },
    })
    await expectNoViolations(field.html() + select.html())
  })

  it('UiStatGrid / UiStatRow (description list) have no violations', async () => {
    const wrapper = mount(UiStatGrid, {
      slots: { default: () => [h(UiStatRow, { label: 'Balance' }, () => '12 SUI'), h(UiStatRow, { label: 'Gates' }, () => '3')] },
    })
    await expectNoViolations(wrapper.html())
  })

  it('UiStatusBar and UiToolbar have no violations', async () => {
    const bar = mount(UiStatusBar, { props: { network: 'testnet', healthy: false, epoch: 42, lastRefresh: null } })
    const toolbar = mount(UiToolbar, { props: { actions: [{ id: 'home', label: 'Home' }] } })
    await expectNoViolations(toolbar.html() + bar.html())
  })

  it('UiPanel, UiCard and the activity feed have no violations', async () => {
    const panel = mount(UiPanel, {
      props: { title: 'Recent activity' },
      slots: { default: () => h(UiActivityFeed, () => [h(UiActivityItem, { type: 'Minted', time: 'ckpt 1' })]) },
    })
    const card = mount(UiCard, { props: { title: 'Gate' }, slots: { default: '<p>Body</p>', footer: '<p>Foot</p>' } })
    await expectNoViolations(panel.html() + card.html())
  })
})
