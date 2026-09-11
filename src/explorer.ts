// Centralized block-explorer URL builder — the single source of truth for where the UI links Sui
// entities. `explorer.sui.io` was retired with no official replacement; the ecosystem standard is
// SuiVision (by BlockVision). Swap the base here to change every ExplorerLink at once.
//
// Walrus blobs are NOT a Sui entity type and are handled by the consuming app (walrus-ui builds a
// Walruscan URL); this module stays Sui-only so the UI library carries no Walrus specifics.

/** Sui networks SuiVision serves. */
export type SuiNetwork = 'mainnet' | 'testnet' | 'devnet'

/** The kind of Sui entity to link, mapped to SuiVision's URL path segment. */
export type SuiExplorerKind = 'account' | 'object' | 'txblock'

/** SuiVision origin per network (mainnet has no subdomain). */
const SUIVISION_ORIGIN: Record<SuiNetwork, string> = {
  mainnet: 'https://suivision.xyz',
  testnet: 'https://testnet.suivision.xyz',
  devnet: 'https://devnet.suivision.xyz',
}

/**
 * Build a SuiVision explorer URL for a Sui entity.
 *
 * @param kind - `account` (address), `object`, or `txblock` (transaction digest).
 * @param id - The address / object id / transaction digest.
 * @param network - Target network (default `testnet`).
 * @returns The full SuiVision URL, e.g. `https://testnet.suivision.xyz/account/0x…`.
 */
export function suiExplorerUrl(
  kind: SuiExplorerKind,
  id: string,
  network: SuiNetwork = 'testnet',
): string {
  const origin = SUIVISION_ORIGIN[network] ?? SUIVISION_ORIGIN.testnet
  return `${origin}/${kind}/${id}`
}
