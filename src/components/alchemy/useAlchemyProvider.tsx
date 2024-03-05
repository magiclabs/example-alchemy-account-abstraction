import { useEffect, useMemo, useCallback, useState } from 'react';
import { useMagic } from '../magic/MagicProvider';
import { 
  type SmartAccountClient, 
  type SmartAccountSigner, 
  WalletClientSigner, 
  sepolia 
} from '@alchemy/aa-core';
import { createModularAccountAlchemyClient } from '@alchemy/aa-alchemy';
import { getAlchemyApiKey } from '@/utils/network';

// Initializes the useAlchemyProvider hook for managing AlchemyProvider in a React component.
export const useAlchemyProvider = () => {
  const { magic, walletClient } = useMagic();
  const chain = sepolia;
  const [smartClient, setSmartClient] = useState<SmartAccountClient>();

  // Create a WalletClientSigner instance using the viem walletClient from MagicProvider.
  const magicSigner: SmartAccountSigner | undefined = useMemo(() => {
    if (!walletClient) return;
    return new WalletClientSigner(walletClient, 'magic');
  }, [walletClient])
    
  // Connect the AlchemyClient to a Smart Account using the createModularAccountAlchemyClient class.
  const connectToSmartContractAccount = useCallback(async () => {
    if (!magicSigner || !magic) return;

    // This is where Magic is associated as the owner of the smart contract account.
    const client = await createModularAccountAlchemyClient({
      apiKey: getAlchemyApiKey(),
      chain,
      signer: magicSigner,
      gasManagerConfig: {
        policyId: process.env.NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID as string,
      }
    });
    
    setSmartClient(client);
  }, [chain, magic, magicSigner])
    
  useEffect(() => {
    if (magic?.user.isLoggedIn) {
      connectToSmartContractAccount()
    }
  }, [magic?.user.isLoggedIn, connectToSmartContractAccount])

  // Returns the SmartClient for use in components.
  return {
    smartClient,
  }
}