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
import type { ChainShortNames, SelectChains } from '../types/chain.js'
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

export type ERC3770Account = Omit<Account, 'address'> & {
  address: ERC3770Address // Override address with ERC3770Address
  chainId: number // Optional: chainId to derive chain prefix if necessary
}

export type SendTransactionParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  ///
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<
      viem_SendTransactionParameters<
        chains[key],
        Config['chainSpecificAddresses'] extends true
          ? ERC3770Account
          : Account,
        chains[key]
      >,
      'chain' | 'gas'
    > &
      ChainIdParameter<config, chainId> &
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
  const action = getAction(client, viem_sendTransaction, 'sendTransaction')
  const hash = await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
    gas: rest.gas ?? undefined,
  })

  return hash
}
