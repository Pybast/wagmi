////////////////////////////////////////////////////////////////////////////////
// viem/chains
////////////////////////////////////////////////////////////////////////////////

// biome-ignore lint/performance/noBarrelFile: entrypoint module
// biome-ignore lint/performance/noReExportAll: entrypoint module
import {
  celo as celoViem,
  mainnet as mainnetViem,
  optimism as optimismViem,
  zkSync as zkSyncViem,
} from 'viem/chains'
import {
  type Chain,
  chainShortNamesMapper,
} from '../../../core/src/types/chain.js'

export type { Chain }

type ChainWithShortName = Chain & { shortName: string }

export const celo: Chain = {
  ...celoViem,
  shortName: chainShortNamesMapper[celoViem.id]!,
}

export const mainnet: ChainWithShortName = {
  ...mainnetViem,
  shortName: chainShortNamesMapper[mainnetViem.id]!,
}

export const optimism: ChainWithShortName = {
  ...optimismViem,
  shortName: chainShortNamesMapper[optimismViem.id]!,
}

export const zkSync: ChainWithShortName = {
  ...zkSyncViem,
  shortName: chainShortNamesMapper[zkSyncViem.id]!,
}
