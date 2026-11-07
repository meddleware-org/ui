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
