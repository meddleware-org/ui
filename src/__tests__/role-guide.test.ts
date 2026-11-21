// @vitest-environment jsdom
// UiRoleGuide: a native radio group picks a path; CSS shows its panel; the choice is mirrored in the address, never stored.
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { axe } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'
import UiRoleGuide, { type RoleGuideRole } from '../components/UiRoleGuide.vue'

expect.extend(axeMatchers)
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext

const roles: RoleGuideRole[] = [
  { id: 'use', title: 'Use the tools', summary: 'Get things done.', steps: ['Pick a tool.', 'Use it.', 'Take your data with you.'], need: 'A browser', get: 'The tool', links: [{ text: 'See the tools', href: '#tools' }] },
  { id: 'build', title: 'Build with them', summary: 'Open APIs.', steps: ['Read the APIs.', 'Build.'], links: [{ text: 'Developer guide ↗', href: 'https://meddleware.dev/' }] },
  { id: 'run', title: 'Run my own', summary: 'Host it.', steps: ['Choose.', 'Host.', 'Name it.'] },
]

// Remove anything a case attached to the document and reset the address, so the next case starts on a clean page.
afterEach(() => {
  history.replaceState(null, '', '/')
  localStorage.clear()
  sessionStorage.clear()
})

// The radio group, the panels and the address mirror. Panel visibility itself is CSS (`:has`), which jsdom does not evaluate, so these tests
// check the markup and the behaviour that script adds; the real browser rendering is checked in e2e.
describe('UiRoleGuide', () => {
  it('is a radio group in a fieldset with a legend, one panel per path, the first chosen', () => {
    const w = mount(UiRoleGuide, { props: { roles, name: 'guide' } })
    expect(w.get('fieldset legend').text()).toBe("I'm here to…")
    const radios = w.findAll('input[type="radio"]')
    expect(radios.map((r) => (r.element as HTMLInputElement).name)).toEqual(['guide', 'guide', 'guide'])
    expect((radios[0].element as HTMLInputElement).checked).toBe(true)
    expect(w.findAll('section.mw-role-guide__panel').map((p) => p.attributes('id'))).toEqual(['for-use', 'for-build', 'for-run'])
    expect(w.get('#for-use ol').findAll('li')).toHaveLength(3)
    expect(w.get('#for-use dl').text()).toContain("You'll need")
  })

  it('mirrors the choice in the address and stores nothing', async () => {
    const w = mount(UiRoleGuide, { props: { roles, name: 'guide' } })
    await w.findAll('input[type="radio"]')[1].setValue(true)
    expect(location.hash).toBe('#for-build')
    expect(localStorage.length + sessionStorage.length).toBe(0)
  })

  it('opens on the path the address names', async () => {
    history.replaceState(null, '', '/#for-run')
    const w = mount(UiRoleGuide, { props: { roles, name: 'guide' } })
    await w.vm.$nextTick()
    expect((w.findAll('input[type="radio"]')[2].element as HTMLInputElement).checked).toBe(true)
  })

  it('has no accessibility violations', async () => {
    const w = mount(UiRoleGuide, { props: { roles, name: 'guide' }, attachTo: document.body })
    expect(await axe(w.html(), { rules: { region: { enabled: false } } })).toHaveNoViolations()
    w.unmount()
  })
})
