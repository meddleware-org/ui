// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppToolShell from '../components/AppToolShell.vue'

describe('AppToolShell', () => {
  const mountShell = (props: Record<string, unknown> = {}) =>
    mount(AppToolShell, {
      props: { title: 'Access Gate', slug: 'access-gate', ...props },
      slots: { default: '<p id="tool">the tool</p>', actions: '<button type="button">Connect</button>' },
    })

  it('puts the tool in the main landmark under one hidden page heading', () => {
    const w = mountShell()
    expect(w.findAll('h1')).toHaveLength(1)
    expect(w.get('h1').text()).toBe('Access Gate')
    expect(w.get('h1').classes()).toContain('mw-visually-hidden')
    expect(w.get('main #tool').text()).toBe('the tool')
  })

  it('names the tool in the header, with its actions beside the colour-mode control', () => {
    const w = mountShell()
    expect(w.get('header').text()).toContain('Access Gate')
    expect(w.get('header button').text()).toBe('Connect')
    expect(w.findAll('header button').length).toBeGreaterThanOrEqual(4) // the action, then light, dark, system
  })

  it('links the docs and developer pages of the tool by slug, and lets an app override them', () => {
    const hrefs = (w: ReturnType<typeof mountShell>) => w.findAll('footer a').map((a) => a.attributes('href'))
    expect(hrefs(mountShell())).toEqual(expect.arrayContaining(['https://docs.meddleware.co.uk/blockchain/sui/access-gate/', 'https://meddleware.dev/sui/access-gate/']))
    expect(hrefs(mountShell({ docsUrl: 'https://docs.example.test/x/' }))).toContain('https://docs.example.test/x/')
  })

  it('leaves a documentation link out when its URL is false, and the whole footer nav when both are', () => {
    const hrefs = (w: ReturnType<typeof mountShell>) => w.findAll('footer nav a').map((a) => a.attributes('href'))
    expect(hrefs(mountShell({ docsUrl: false }))).toEqual(['https://meddleware.dev/sui/access-gate/'])
    expect(hrefs(mountShell({ devUrl: false }))).toEqual(['https://docs.meddleware.co.uk/blockchain/sui/access-gate/'])
    expect(mountShell({ docsUrl: false, devUrl: false }).find('footer nav').exists()).toBe(false)
  })

  it('adds no page heading when the page brings its own, and shows the brand mark with the title', () => {
    expect(mountShell({ pageHeading: false }).findAll('h1')).toHaveLength(0)
    const w = mountShell()
    expect(w.get('header svg.mw-brand-mark').attributes('aria-hidden')).toBe('true')
    expect(w.get('header').text()).toContain('Access Gate')
  })

  it('limits the page to the tool width by default and not when contained is false', () => {
    expect(mountShell().get('main').classes()).toContain('mw-shell__main--contained')
    expect(mountShell({ contained: false }).get('main').classes()).not.toContain('mw-shell__main--contained')
  })

  it('shows a footer-note slot in the footer, after the copyright line', () => {
    const w = mount(AppToolShell, {
      props: { title: 'Status', slug: 'status' },
      slots: { default: '<p>x</p>', 'footer-note': '<small id="note">Checked every minute.</small>' },
    })
    const footer = w.get('footer')
    expect(footer.get('#note').text()).toBe('Checked every minute.')
    expect(footer.text().indexOf('Meddleware')).toBeLessThan(footer.text().indexOf('Checked every'))
  })

  it('has the copyright line with the kopimi mark in the footer', () => {
    expect(mountShell().get('footer').text()).toContain('Meddleware')
  })
})

describe('UiDataTable header scope', () => {
  it('warns in development when a header cell has no scope', async () => {
    vi.resetModules()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { default: Table } = await import('../components/UiDataTable.vue')
    mount(Table, { props: { rows: 1 }, slots: { head: '<th>Name</th>', default: '<tr><td>a</td></tr>' }, attachTo: document.body })
    expect(warn.mock.calls.some(([m]) => String(m).includes('scope="col"'))).toBe(true)
    warn.mockRestore()
  })
  it('stays quiet when every header cell has one', async () => {
    vi.resetModules()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { default: Table } = await import('../components/UiDataTable.vue')
    mount(Table, { props: { rows: 1 }, slots: { head: '<th scope="col">Name</th>', default: '<tr><td>a</td></tr>' }, attachTo: document.body })
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
