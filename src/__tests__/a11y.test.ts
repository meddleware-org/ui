// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { axe } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'

expect.extend(axeMatchers)

// Component fragments are not full pages, so page-level landmark rules
// (region/landmark) don't apply — disable them for isolated component tests.
const opts = { rules: { region: { enabled: false } } }
import CopyrightLine from '../components/CopyrightLine.vue'
import UiButton from '../components/UiButton.vue'
import SidebarItem from '../components/SidebarItem.vue'

// Accessibility smoke tests: render representative components and assert axe
// finds no WCAG violations in the rendered markup.
describe('accessibility (axe)', () => {
  it('CopyrightLine has no violations', async () => {
    const wrapper = mount(CopyrightLine, {
      props: { organisationName: 'Meddleware', symbolVariant: 'kopimi' },
    })
    expect(await axe(wrapper.html(), opts)).toHaveNoViolations()
  })

  it('UiButton has no violations', async () => {
    const wrapper = mount(UiButton, { slots: { default: 'Click me' } })
    expect(await axe(wrapper.html(), opts)).toHaveNoViolations()
  })

  it('SidebarItem has no violations', async () => {
    const wrapper = mount(SidebarItem, { props: { label: 'Treasury', icon: '🏛' } })
    expect(await axe(wrapper.html(), opts)).toHaveNoViolations()
  })
})
