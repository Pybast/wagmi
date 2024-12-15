import type { Address, Chain, ChainFormatters } from 'viem'
import { celo as celoViem, zkSync as zkSyncViem } from 'viem/chains'

import type { Config } from '../createConfig.js'
import type { IsNarrowable, Merge } from './utils.js'
import type { ERC3770Address } from '../actions/sendTransaction.js'

export type ChainShortNames =
  | 'eth'
  | 'bsc'
  | 'pol'
  | 'arb'
  | 'op'
  | 'wag'
  | 'celo'
  | 'zkSync'

export const chainShortNamesMapper: Record<number, ChainShortNames> = {
  1: 'eth', // Ethereum Mainnet
  10: 'op', // Optimism
  56: 'bsc', // Binance Smart Chain
  137: 'pol', // Polygon (Matic)
  456: 'wag', // Wagmi (Matic)
  42161: 'arb', // Arbitrum One
  [celoViem.id]: 'celo',
  [zkSyncViem.id]: 'zkSync',
}

// Function to get chainId from short name
export function getChainIdFromShortName(shortName: string): number | undefined {
  for (const [chainId, name] of Object.entries(chainShortNamesMapper)) {
    if (name === shortName) {
      return parseInt(chainId) // Return the numeric chainId
    }
  }
  return undefined // Return undefined if not found
}

export function extractAddressFromChainSpecificAddress(
  address: ERC3770Address | Address,
): Address {
  return address.split(':')[1] as Address
}

/** Filters {@link Config} chains by {@link chainId} or simplifies if no `ChainFormatters` are present. */
export type SelectChains<
  config extends Config,
  chainId extends config['chains'][number]['id'] | undefined = undefined,
> = Config extends config
  ? readonly [Chain] // chains not inferrable, return default
  : IsNarrowable<chainId, config['chains'][number]['id']> extends true
    ? readonly [Extract<config['chains'][number], { id: chainId }>] // select specific chain
    : HasFormatter<config['chains']> extends true
      ? config['chains'] // return all chains since one has formatter
      : // return default chain with ID set to union (allows for more simple type since the only thing that is different is the chain ID for each chain)
        readonly [Merge<Chain, { id: config['chains'][number]['id'] }>]

type HasFormatter<chains extends readonly Chain[]> = chains extends readonly [
  infer head extends Chain,
  ...infer tail extends readonly Chain[],
]
  ? IsNarrowable<head['formatters'], ChainFormatters | undefined> extends true
    ? true
    : HasFormatter<tail>
  : false
