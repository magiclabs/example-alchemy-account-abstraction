import { getChainId, getNetworkUrl } from '@/utils/network';
import { OAuthExtension } from '@magic-ext/oauth';
import { Magic as MagicBase } from 'magic-sdk';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createWalletClient, createPublicClient, custom, http, WalletClient, PublicClient } from 'viem';
import { sepolia } from 'viem/chains';

export type Magic = MagicBase<OAuthExtension[]>;

type MagicContextType = {
  magic: Magic | null;
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
};

const MagicContext = createContext<MagicContextType>({
  magic: null,
  publicClient: null,
  walletClient: null,
});

export const useMagic = () => useContext(MagicContext);

const MagicProvider = ({ children }: { children: ReactNode }) => {
  const [magic, setMagic] = useState<Magic | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MAGIC_API_KEY) {
      const magicClient = new MagicBase(process.env.NEXT_PUBLIC_MAGIC_API_KEY as string, {
        network: {
          rpcUrl: getNetworkUrl(),
          chainId: getChainId(),
        },
        extensions: [new OAuthExtension()],
      });
      const publicClient = createPublicClient({
        transport: http(getNetworkUrl()), 
        chain: sepolia,
      });
      const walletClient = createWalletClient({
        transport: custom(magicClient.rpcProvider),
        chain: sepolia,
      });
      setMagic(magicClient);
      setPublicClient(publicClient);
      setWalletClient(walletClient);
    }
  }, []);

  const value = useMemo(() => {
    return {
      magic,
      publicClient,
      walletClient,
    };
  }, [magic, publicClient, walletClient]);

  return <MagicContext.Provider value={value}>{children}</MagicContext.Provider>;
};

export default MagicProvider;
