# erc-3770-option feature

The goal is to allow something like this

```ts
import { createConfig, http } from 'wagmi'
import { mainnet, optimism } from 'wagmi/chains'

export const configB = createConfig({
  chains: [mainnet, optimism],
  transports: {
    [optimism.id]: http(),
  },
  chainSpecificAddresses: true // or somethin like this

})

writeContract({
  abi,
  address: 'eth:0x6b175474e89094c44da98b954eedeac495271d0f', // should create a typing error if there is no chain prefix
  functionName: 'transferFrom',
  args: [
    '0xd2135CfB216b74109775236E36d4b433F1DF507B', // would be great to add them here as well
    '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', // and here
    123n,
  ],
})
```

## Tasks

1. add the ERC3770 short names to the wagmi chains
2. create the `${string}:0x${string}` type for chain-specific addresses
3. implement strict chain-specific address mode when defining the config
4. when sending transactions, verify that the destination address' chain corresponds to the current selected chain

## syncConnectedChain

[doc](https://wagmi.sh/react/api/createConfig#syncconnectedchain)

This feature solves a similar issue by making sure the wallet's chain is synced with the config, but it could still miss certain errors.
Examples:
- the config has multiple chains
- the wallet and the dapp are synced on the right chain but the user makes a mistake by providing an address which is only relevant to a different chain
