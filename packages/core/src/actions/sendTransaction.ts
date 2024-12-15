import type {
  Account,
  Address,
  Chain,
  Client,
  TransactionRequest,
  SendTransactionErrorType as viem_SendTransactionErrorType,
  SendTransactionParameters as viem_SendTransactionParameters,
  SendTransactionReturnType as viem_SendTransactionReturnType,
} from 'viem'
import { sendTransaction as viem_sendTransaction } from 'viem/actions'

import type { Config } from '../createConfig.js'
import type { BaseErrorType, ErrorType } from '../errors/base.js'
import {
  type ChainShortNames,
  type SelectChains,
  chainShortNamesMapper,
  extractAddressFromChainSpecificAddress,
  getChainIdFromShortName,
} from '../types/chain.js'
import type {
  ChainIdParameter,
  ConnectorParameter,
} from '../types/properties.js'
import type { Compute } from '../types/utils.js'
import { getAction } from '../utils/getAction.js'
import {
  type GetConnectorClientErrorType,
  getConnectorClient,
} from './getConnectorClient.js'

export type ERC3770Address = `${ChainShortNames}:${Address}`

// Conditional type for 'to' property
type ToType<Config> = Config extends { chainSpecificAddresses: true }
  ? ERC3770Address
  : Address

export type SendTransactionParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<
      viem_SendTransactionParameters<chains[key], Account, chains[key]>,
      'chain' | 'gas' | 'to'
    > & {
      to: ToType<config> // Replace 'to' property with the conditional type
    } & ChainIdParameter<config, chainId> &
      ConnectorParameter
  >
}[number] & {
  /** Gas provided for transaction execution. */
  gas?: TransactionRequest['gas'] | null
}

export type SendTransactionReturnType = viem_SendTransactionReturnType

export type SendTransactionErrorType =
  // getConnectorClient()
  | GetConnectorClientErrorType
  // base
  | BaseErrorType
  | ErrorType
  // viem
  | viem_SendTransactionErrorType

/** https://wagmi.sh/core/api/actions/sendTransaction */
export async function sendTransaction<
  config extends Config,
  chainId extends config['chains'][number]['id'],
>(
  config: config,
  parameters: SendTransactionParameters<config, chainId>,
): Promise<SendTransactionReturnType> {
  const { account, chainId, connector, ...rest } = parameters

  let client: Client
  if (typeof account === 'object' && account?.type === 'local')
    client = config.getClient({ chainId })
  else
    client = await getConnectorClient(config, {
      account: account ?? undefined,
      chainId,
      connector,
    })

  if (config.chainSpecificAddresses) {
    // 1. get the chain
    const clientChainId = client.chain?.id

    // 2. extract the chain short name from the 'to' property
    const shortName = parameters.to.split(':')[0]

    if (shortName === undefined) throw new Error('Invalid short name')

    const chainIdFromShortName = getChainIdFromShortName(shortName)

    if (chainIdFromShortName === undefined)
      throw new Error('Invalid short name')

    if (clientChainId === undefined)
      throw new Error("Client's chain ID is not defined")

    // verify that 1. and 2. match
    if (clientChainId !== chainIdFromShortName)
      throw new Error(
        "Missmatch between client's chain ID and provided short name",
      )
  }

  const action = getAction(client, viem_sendTransaction, 'sendTransaction')
  const hash = await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    to: extractAddressFromChainSpecificAddress(rest.to), // we need to remove the chain-specific prefix here
    chain: chainId ? { id: chainId } : null,
    gas: rest.gas ?? undefined,
  })

  return hash
}
