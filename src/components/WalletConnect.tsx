import { Button } from '@/components/ui/button';
import { useTonConnectUI } from '@tonconnect/ui-react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useConfig,
} from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import {
  Copy,
  ExternalLink,
  LogOut,
  Wallet,
  Diamond,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';

export function WalletConnect() {
  const { toast } = useToast();
  const { connect: connectEvm, isPending: isEvmPending } = useConnect();
  const { disconnect: disconnectEvm } = useDisconnect();
  const {
    address: evmAddress,
    isConnected: isEvmConnected,
    isConnecting: isEvmConnecting,
  } = useAccount();
  console.log('isEvmConnecting', isEvmConnecting);
  const chainId = useChainId();
  const config = useConfig();
  const [tonConnector] = useTonConnectUI();
  const [isTonConnecting, setIsTonConnecting] = useState(false);

  // Monitor TON wallet connection state
  useEffect(() => {
    if (!tonConnector.connectionRestored) {
      return; // Wait until connection state is restored
    }

    if (tonConnector.connected) {
      setIsTonConnecting(false);
      if (tonConnector.account?.address) {
        toast({
          title: 'TON Wallet Connected',
          description: `Connected to ${formatAddress(
            tonConnector.account.address
          )}`,
        });
      }
    }
  }, [
    tonConnector.connected,
    tonConnector.connectionRestored,
    tonConnector.account,
  ]);

  // Monitor EVM wallet connection
  useEffect(() => {
    if (isEvmConnected && evmAddress) {
      toast({
        title: 'MetaMask Connected',
        description: `Connected to ${formatAddress(evmAddress)}`,
      });
    }
  }, [isEvmConnected, evmAddress]);

  const handleTonConnect = () => {
    setIsTonConnecting(true);
    tonConnector.connectWallet();

    // Add a timeout to reset connecting state if it takes too long
    setTimeout(() => {
      setIsTonConnecting(false);
    }, 3000); // Reset after 3 seconds if no connection
  };

  const handleTonDisconnect = () => {
    tonConnector.disconnect();
    setIsTonConnecting(false);
    toast({
      title: 'TON Wallet Disconnected',
      description: 'Successfully disconnected from TON wallet',
    });
  };

  const handleEvmDisconnect = () => {
    disconnectEvm();
    toast({
      title: 'MetaMask Disconnected',
      description: 'Successfully disconnected from MetaMask',
    });
  };

  const handleEvmConnect = async () => {
    try {
      await connectEvm({ connector: metaMask() });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to MetaMask',
        variant: 'destructive',
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Address Copied',
      description: 'Wallet address copied to clipboard',
    });
  };

  const getTonAddress = () => {
    return tonConnector.account?.address ?? '';
  };

  const isTonMainnet = () => {
    // TON Connect provides network info through the wallet connection
    return tonConnector.account?.chain === '-239'; // -239 is TON mainnet, -3 is testnet
  };

  const NetworkDot = ({ isMainnet }: { isMainnet: boolean }) => (
    <div
      className={`w-2 h-2 rounded-full ${
        isMainnet ? 'bg-green-500' : 'bg-yellow-500'
      }`}
    />
  );

  const getEvmNetworkLabel = () => {
    const chain = config.chains.find((c) => c.id === chainId);
    if (!chain) return 'ETH';
    return chain.name;
  };

  const isMainnet = chainId === 1;

  return (
    <div className='flex gap-2'>
      {tonConnector.connected ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='min-w-52'>
              <Diamond className='w-4 h-4 mr-2' />
              <span className='truncate flex items-center gap-2'>
                {formatAddress(getTonAddress())} | TON
                <NetworkDot isMainnet={isTonMainnet()} />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => copyToClipboard(getTonAddress())}>
              <Copy className='w-4 h-4 mr-2' />
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.open(
                  `https://tonscan.org/address/${getTonAddress()}`,
                  '_blank'
                )
              }
            >
              <ExternalLink className='w-4 h-4 mr-2' />
              View on Explorer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleTonDisconnect}>
              <LogOut className='w-4 h-4 mr-2' />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : isTonConnecting ? (
        <Button variant='outline' className='min-w-52' disabled>
          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          <span className='truncate'>Connecting TON...</span>
        </Button>
      ) : (
        <Button
          variant='outline'
          onClick={handleTonConnect}
          disabled={isTonConnecting}
        >
          <Diamond className='w-4 h-4 mr-2' />
          TON Connect
        </Button>
      )}

      {isEvmConnected && evmAddress ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='min-w-52'>
              <Wallet className='w-4 h-4 mr-2' />
              <span className='truncate flex items-center gap-2'>
                {formatAddress(evmAddress)} | {getEvmNetworkLabel()}
                <NetworkDot isMainnet={isMainnet} />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => copyToClipboard(evmAddress)}>
              <Copy className='w-4 h-4 mr-2' />
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.open(
                  `https://${
                    !isMainnet ? `${chainId}.etherscan.io` : 'etherscan.io'
                  }/address/${evmAddress}`,
                  '_blank'
                )
              }
            >
              <ExternalLink className='w-4 h-4 mr-2' />
              View on Explorer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEvmDisconnect}>
              <LogOut className='w-4 h-4 mr-2' />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant='outline'
          onClick={handleEvmConnect}
          disabled={isEvmPending}
        >
          {isEvmPending ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <Wallet className='w-4 h-4 mr-2' />
          )}
          MetaMask
        </Button>
      )}
    </div>
  );
}
