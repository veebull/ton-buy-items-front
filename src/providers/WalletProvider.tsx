import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { WagmiProvider, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';
import { createPublicClient, http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const manifestUrl =
  'https://raw.githubusercontent.com/veebull/twa-manifest-json/refs/heads/main/tonconnect-manifest.json';

const config = createConfig({
  chains: [mainnet],
  connectors: [metaMask()],
  client: createPublicClient({
    chain: mainnet,
    transport: http(),
  }) as any,
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <TonConnectUIProvider manifestUrl={manifestUrl} restoreConnection>
          {children}
        </TonConnectUIProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
