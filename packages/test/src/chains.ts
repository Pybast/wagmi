import type { Compute } from '@wagmi/core/internal'
import {
  type Chain as viem_Chain,
  mainnet as viem_mainnet,
  optimism as viem_optimism,
} from 'viem/chains'
import {type chainShortNames,  chainShortNamesMapper } from '../../core/src/types/chain.js'
import { getRpcUrls } from './utils.js'

type Fork = { blockNumber: bigint; url: string }

export type Chain = Compute<
  viem_Chain & {
    fork: Fork
    port: number
    shortName: chainShortNames
  }
>

const mainnetFork = {
  blockNumber: 19_258_213n,
  url: process.env.VITE_MAINNET_FORK_URL ?? 'https://cloudflare-eth.com',
} as const satisfies Fork

export const mainnet = {
  ...viem_mainnet,
  ...getRpcUrls({ port: 8545 }),
  fork: mainnetFork,
  shortName: chainShortNamesMapper[viem_mainnet.id]!
} as const satisfies Chain

export const mainnet2 = {
  ...viem_mainnet,
  ...getRpcUrls({ port: 8546 }),
  id: 456,
  nativeCurrency: { decimals: 18, name: 'wagmi', symbol: 'WAG' },
  fork: mainnetFork,
  shortName: chainShortNamesMapper[456]!
} as const satisfies Chain

export const optimism = {
  ...getRpcUrls({ port: 8547 }),
  ...viem_optimism,
  fork: {
    blockNumber: 107_317_577n,
    url: process.env.VITE_OPTIMISM_FORK_URL ?? 'https://mainnet.optimism.io',
  },
  shortName: chainShortNamesMapper[viem_optimism.id]!
} as const satisfies Chain

export const chain = {
  mainnet,
  mainnet2,
  optimism,
}
