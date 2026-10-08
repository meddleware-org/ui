// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CopyableAddress from '../components/CopyableAddress.vue'
import ExplorerLink from '../components/ExplorerLink.vue'

const ADDRESS = `0x${'ab'.repeat(31)}cd` // 66 characters

describe('address truncation', () => {
  it('CopyableAddress shows 10 hex characters on each side by default', () => {
    const w = mount(CopyableAddress, { props: { address: ADDRESS } })
    expect(w.find('.ca-value').text()).toBe(`${ADDRESS.slice(0, 12)}…${ADDRESS.slice(-10)}`)
    expect(w.find('.ca-value').attributes('title')).toBe(ADDRESS)
  })

  it('CopyableAddress shows the whole value with truncate=false (treasury, recipient)', () => {
    const w = mount(CopyableAddress, { props: { address: ADDRESS, truncate: false } })
    expect(w.find('.ca-value').text()).toBe(ADDRESS)
  })

  it('does not duplicate a value shorter than prefix + suffix, nor print the whole value after "…"', () => {
    expect(mount(CopyableAddress, { props: { address: '0x1' } }).find('.ca-value').text()).toBe('0x1')
    expect(mount(CopyableAddress, { props: { address: '0x1234567890', chars: [8, 0] } }).find('.ca-value').text()).toBe('0x123456…')
    expect(mount(CopyableAddress, { props: { address: '0x1234567890', chars: [0, 4] } }).find('.ca-value').text()).toBe('…7890')
  })

  it('ExplorerLink truncates the same way and can show the whole value', () => {
    const href = 'https://suiscan.xyz/mainnet/account/0x1'
    const short = mount(ExplorerLink, { props: { href, value: ADDRESS } })
    expect(short.text()).toBe(`${ADDRESS.slice(0, 12)}…${ADDRESS.slice(-10)}`)
    expect(mount(ExplorerLink, { props: { href, value: ADDRESS, truncate: false } }).text()).toBe(ADDRESS)
    expect(mount(ExplorerLink, { props: { href, value: '0x1' } }).text()).toBe('0x1')
  })

  it('ExplorerLink renders no href for an off-policy URL', () => {
    expect(mount(ExplorerLink, { props: { href: 'https://suivision.xyz@evil.example/x', value: '0x1' } }).attributes('href')).toBeUndefined()
  })
})
