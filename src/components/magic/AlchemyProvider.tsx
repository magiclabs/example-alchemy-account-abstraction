import {
  getDefaultLightAccountFactoryAddress,
  LightSmartContractAccount,
} from "@alchemy/aa-accounts"
import { SmartAccountSigner, WalletClientSigner } from "@alchemy/aa-core"
import { AlchemyProvider } from "@alchemy/aa-alchemy"
import { polygonMumbai } from "viem/chains"
import { createWalletClient, custom, WalletClient } from "viem"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useMagic } from "./MagicProvider"

// Initializes the useAlchemyProvider hook for managing AlchemyProvider in a React component.
export const useAlchemyProvider = () => {
  const chain = polygonMumbai
  const lightAccountFactoryAddress = getDefaultLightAccountFactoryAddress(chain)
  const entryPointAddress = useMemo(
    () => "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    []
  )
  const { magic } = useMagic()
  const [provider, setProvider] = useState<AlchemyProvider>(
    new AlchemyProvider({
      chain,
      entryPointAddress,
      rpcUrl: process.env.NEXT_PUBLIC_MUMBAI_RPC!,
    })
  )

  const magicClient: WalletClient | undefined = useMemo(() => {
    if (!magic) return

    return createWalletClient({
      transport: custom(magic.rpcProvider),
    })
  }, [magic])

  const magicSigner: SmartAccountSigner | undefined = useMemo(() => {
    if (!magicClient) return
    return new WalletClientSigner(magicClient as any, "magic")
  }, [magicClient])

  useEffect(() => {
    if (magic?.user.isLoggedIn) {
      connectToSmartContractAccount()
    } else {
      disconnectFromSmartContractAccount()
    }
  }, [magic?.user.isLoggedIn])

  // Connects the AlchemyProvider to a Smart Account using the LightSmartContractAccount class.
  // Sets the owner as the Magic account wallet
  const connectToSmartContractAccount = useCallback(() => {
    if (!magicSigner) return

    const connectedProvider = provider.connect((provider) => {
      return new LightSmartContractAccount({
        rpcClient: provider,
        owner: magicSigner,
        chain,
        entryPointAddress,
        factoryAddress: lightAccountFactoryAddress,
      })
    })

    setProvider(connectedProvider)
    return connectedProvider
  }, [entryPointAddress, provider])

  // Disconnects the AlchemyProvider from the current account.
  const disconnectFromSmartContractAccount = useCallback(() => {
    const disconnectedProvider = provider.disconnect()
    setProvider(disconnectedProvider)
    return disconnectedProvider
  }, [provider])

  // Returns the AlchemyProvider, connectProviderToAccount, and disconnectProviderFromAccount for use in components.
  return {
    provider,
  }
}
