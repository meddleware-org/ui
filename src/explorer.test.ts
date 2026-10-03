import { describe, it, expect } from 'vitest'
import { suiExplorerUrl } from './explorer.js'

describe('suiExplorerUrl', () => {
  it('builds testnet SuiVision URLs per kind', () => {
    expect(suiExplorerUrl('account', '0xabc', 'testnet')).toBe('https://testnet.suivision.xyz/account/0xabc')
    expect(suiExplorerUrl('object', '0xobj', 'testnet')).toBe('https://testnet.suivision.xyz/object/0xobj')
    expect(suiExplorerUrl('txblock', 'DIGEST', 'testnet')).toBe('https://testnet.suivision.xyz/txblock/DIGEST')
  })

  it('uses the bare domain for mainnet', () => {
    expect(suiExplorerUrl('account', '0xabc', 'mainnet')).toBe('https://suivision.xyz/account/0xabc')
  })

  it('defaults to testnet when network is omitted', () => {
    expect(suiExplorerUrl('account', '0xabc')).toBe('https://testnet.suivision.xyz/account/0xabc')
  })
})

describe('suiExplorerUrl encoding', () => {
  it('keeps a chain-supplied id to one path segment', () => {
    expect(suiExplorerUrl('object', '../txblock/x?y=1#z', 'testnet')).toBe(
      'https://testnet.suivision.xyz/object/..%2Ftxblock%2Fx%3Fy%3D1%23z',
    )
  })
})
