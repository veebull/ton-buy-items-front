import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Minus, Plus, Loader2 } from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/ton';
import { useToast } from '@/hooks/use-toast';
import { useTelegram } from '@/hooks/useTelegram';
import { createStarsPayment } from '@/api/create-stars-payment';

// Define interface for inventory
interface Inventory {
  [key: string]: number;
}

const STORAGE_KEY = 'ton_garden_inventory';

const items = [
  {
    name: 'Mystery Box',
    icon: '❓',
    price: {
      ton: 0.0125,
      stars: 100,
      eth: 0.001,
    },
    quantity: 0,
  },
  {
    name: 'Intensive Watering',
    icon: '🚿',
    price: {
      ton: 0.0125,
      stars: 100,
      eth: 0.001,
    },
    quantity: 0,
  },
  {
    name: 'Pesticide',
    icon: '🧪',
    price: {
      ton: 0.025,
      stars: 200,
      eth: 0.002,
    },
    quantity: 0,
  },
  {
    name: 'TON Jetton',
    icon: '🪙',
    price: {
      ton: 0.1,
      stars: 1000,
      eth: 0.01,
    },
    quantity: 0,
  },
  {
    name: 'ETH Token',
    icon: '💫',
    price: {
      ton: 0.2,
      stars: 2000,
      eth: 0.02,
    },
    quantity: 0,
  },
];

export function ItemsSection() {
  const [buyQuantities, setBuyQuantities] = useState<Record<string, number>>(
    Object.fromEntries(items.map((item) => [item.name, 1]))
  );
  const [inventory, setInventory] = useState<Inventory>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? JSON.parse(stored)
      : Object.fromEntries(items.map((item) => [item.name, 0]));
  });
  const [tonConnector] = useTonConnectUI();
  const { toast } = useToast();
  const { telegram } = useTelegram();
  const [loadingPurchase, setLoadingPurchase] = useState<{
    itemName: string;
    type: 'ton' | 'stars' | 'eth' | null;
  }>({ itemName: '', type: null });

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
  }, [inventory]);

  const handleDecrease = (itemName: string) => {
    setBuyQuantities((prev) => ({
      ...prev,
      [itemName]: Math.max(0, prev[itemName] - 1),
    }));
  };

  const handleIncrease = (itemName: string) => {
    setBuyQuantities((prev) => ({
      ...prev,
      [itemName]: prev[itemName] + 1,
    }));
  };

  const checkTransactionStatus = async (
    address: string,
    hash: string,
    expectedAmount: string,
    expectedMessage: string,
    senderAddress: string
  ) => {
    console.log(
      'checkTransactionStatus',
      address,
      hash,
      expectedAmount,
      expectedMessage,
      senderAddress
    );
    try {
      // Try for up to 2 minutes (24 attempts, 5 seconds apart)
      for (let i = 0; i < 24; i++) {
        console.log('hash', hash);
        const response = await fetch(
          `https://testnet.toncenter.com/api/v2/getTransactions?address=${address}&data=${hash}&limit=10&to_lt=0&archival=false`,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          // Reduced wait time between retries to 5 seconds
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }

        const data = await response.json();
        console.log('data', data);

        if (data.ok && data.result) {
          // Look through transactions for matching amount, message AND sender
          console.log('data.result', data.result);
          const matchingTx = data.result.find((tx: any) => {
            const txComment = tx.in_msg?.message || '';
            console.log('txComment', txComment);
            const txSender = tx.in_msg?.source || '';
            const txAmount = tx.in_msg?.value || '0';

            // More lenient matching conditions
            const messageMatches = txComment === expectedMessage;

            console.log('messageComments', txComment, expectedMessage);

            const amountMatches =
              Math.abs(Number(txAmount) - Number(expectedAmount)) < 1e-9;
            const addressMatches =
              Address.parse(tx.in_msg?.destination).toRawString() ===
              Address.parse(address).toRawString();
            const senderMatches =
              Address.parse(txSender).toRawString() ===
              Address.parse(senderAddress).toRawString();

            console.log('Matching conditions:', {
              messageMatches,
              amountMatches,
              addressMatches,
              senderMatches,
            });

            return messageMatches && addressMatches && senderMatches;
          });

          console.log('matchingTx', matchingTx);

          if (matchingTx) {
            return true;
          }
        }

        // Reduced wait time between retries to 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      return false;
    } catch (error) {
      console.error('Error checking transaction:', error);
      return false;
    }
  };

  const updateInventory = (itemName: string, quantity: number) => {
    setInventory((prev) => ({
      ...prev,
      [itemName]: (prev[itemName] || 0) + quantity,
    }));
  };

  const handleTonPurchase = async (
    item: (typeof items)[0],
    quantity: number
  ) => {
    if (!tonConnector.connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your TON wallet first',
        variant: 'destructive',
      });
      return;
    }

    setLoadingPurchase({ itemName: item.name, type: 'ton' });
    try {
      // Get user's wallet address
      const userAddress = tonConnector.account?.address;
      if (!userAddress) {
        toast({
          title: 'Error',
          description: 'Could not get wallet address',
          variant: 'destructive',
        });
        return;
      }

      // Add user address, timestamp and random string to make each transaction unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const messageText = `From: ${userAddress}, Item: ${
        item.name
      }, Quantity: ${quantity}, Value: ${
        item.price.ton * quantity
      } TON, Time: ${timestamp}, ID: ${randomId}`;

      const commentBody = beginCell()
        .storeUint(0, 32)
        .storeStringTail(messageText)
        .endCell();

      const amount = toNano(item.price.ton * quantity).toString();
      const itemControllerAddress =
        'UQD0RtLqfWj1UHb2k1GSTtbch2QpqBDyEP59vezvTasjch_Y';

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: itemControllerAddress,
            amount,
            payload: commentBody.toBoc().toString('base64'),
          },
        ],
      };

      const result = await tonConnector.sendTransaction(transaction);
      console.log('result', result);

      if (result) {
        toast({
          title: 'Transaction Sent',
          description: 'Waiting for confirmation...',
        });

        // Monitor transaction status
        const success = await checkTransactionStatus(
          itemControllerAddress,
          result.boc,
          amount,
          messageText,
          userAddress
        );
        console.log('success', success);

        if (success) {
          updateInventory(item.name, quantity);
          toast({
            title: 'Purchase Successful',
            description: `Added ${quantity}x ${item.name} to your inventory!`,
          });
        } else {
          toast({
            title: 'Transaction Failed',
            description: 'Transaction was not confirmed in time',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      toast({
        title: 'Transaction Failed',
        description:
          error instanceof Error ? error.message : 'Failed to send transaction',
        variant: 'destructive',
      });
    } finally {
      setLoadingPurchase({ itemName: '', type: null });
    }
  };

  const handleStarsPurchase = async (
    item: (typeof items)[0],
    quantity: number
  ) => {
    // Only set loading if we're in Telegram WebApp
    if (!telegram?.WebApp) {
      toast({
        title: 'Telegram Required',
        description: 'Stars payments are only available in the Telegram app',
        variant: 'destructive',
      });
      return;
    }

    setLoadingPurchase({ itemName: item.name, type: 'stars' });
    try {
      // Calculate total stars cost
      const totalStars = item.price.stars * quantity;
      console.log('totalStars', totalStars);
      console.log('item.price.stars', item.price.stars);
      console.log('quantity', quantity);
      // Create invoice parameters
      const invoiceParams = {
        title: `${quantity}x ${item.name}`,
        description: `Purchase ${quantity} ${item.name} for ${totalStars} Stars`,
        currency: 'XTR', // XTR is the currency code for Telegram Stars
        prices: [
          {
            label: `${quantity}x ${item.name}`,
            amount: totalStars, // Amount in smallest units (1 Star = 100 units)
          },
        ],
        payload: JSON.stringify({
          type: 'stars_purchase',
          item_name: item.name,
          quantity: quantity,
          timestamp: Date.now(),
        }),
        start_parameter: 'stars_payment',
        need_name: false,
        need_phone_number: false,
        need_email: false,
        need_shipping_address: false,
        is_flexible: false,
        photo_url: item.icon
          ? `https://png.pngtree.com/png-vector/20191027/ourmid/pngtree-green-lawn-grass-icon-vector-design-template-isolated-on-white-background-png-image_1864295.jpg`
          : undefined,
        max_tip_amount: 0,
        suggested_tip_amounts: [],
        send_email_to_provider: false,
        send_phone_to_provider: false,
      };

      try {
        const invoiceUrl = await createStarsPayment(invoiceParams);

        const result = await new Promise<boolean>((resolve) => {
          telegram.WebApp?.openInvoice(invoiceUrl, function (status: string) {
            setLoadingPurchase({ itemName: '', type: null }); // Clear loading when modal closes
            resolve(status === 'paid');
          });
        });

        if (result) {
          updateInventory(item.name, quantity);
          toast({
            title: 'Purchase Successful',
            description: `Added ${quantity}x ${item.name} to your inventory!`,
          });
        }
      } catch (error) {
        console.error('Telegram payment error:', error);
        toast({
          title: 'Payment Failed',
          description: 'Failed to process Stars payment',
          variant: 'destructive',
        });
        setLoadingPurchase({ itemName: '', type: null }); // Clear loading on error
      }
    } catch (error) {
      console.error('Stars transaction failed:', error);
      toast({
        title: 'Transaction Failed',
        description:
          error instanceof Error ? error.message : 'Failed to send transaction',
        variant: 'destructive',
      });
      setLoadingPurchase({ itemName: '', type: null }); // Clear loading on error
    }
  };

  const handleEthPurchase = async (
    item: (typeof items)[0],
    quantity: number
  ) => {
    setLoadingPurchase({ itemName: item.name, type: 'eth' });
    console.log('handleEthPurchase', item, quantity);
    if (!tonConnector.connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your ETH wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get user's wallet address
      const userAddress = tonConnector.account?.address;
      if (!userAddress) {
        toast({
          title: 'Error',
          description: 'Could not get wallet address',
          variant: 'destructive',
        });
        return;
      }

      // Add implementation for ETH purchase here
      // This will depend on your specific smart contract implementation
      toast({
        title: 'ETH Purchase',
        description: 'ETH purchase functionality coming soon!',
        variant: 'warning',
      });
    } catch (error) {
      console.error('ETH transaction failed:', error);
      toast({
        title: 'Transaction Failed',
        description:
          error instanceof Error ? error.message : 'Failed to send transaction',
        variant: 'destructive',
      });
    } finally {
      setLoadingPurchase({ itemName: '', type: null });
    }
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {items.map((item) => (
        <Card key={item.name} className='p-4'>
          <div className='flex items-center space-x-4'>
            <div className='text-4xl'>{item.icon}</div>
            <div className='flex-1'>
              <h3 className='font-bold'>{item.name}</h3>
              <div className='text-sm text-muted-foreground'>
                Owned: x{inventory[item.name] || 0}
              </div>
            </div>
          </div>

          <div className='flex items-center justify-center gap-2 mt-4'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleDecrease(item.name)}
              disabled={buyQuantities[item.name] === 0}
            >
              <Minus className='h-4 w-4' />
            </Button>
            <div className='w-12 text-center'>{buyQuantities[item.name]}</div>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleIncrease(item.name)}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>

          <div className='mt-4 space-y-2'>
            <Button
              className='w-full'
              variant='outline'
              disabled={
                buyQuantities[item.name] === 0 ||
                (loadingPurchase.itemName === item.name &&
                  loadingPurchase.type === 'ton')
              }
              onClick={() => handleTonPurchase(item, buyQuantities[item.name])}
            >
              {loadingPurchase.itemName === item.name &&
              loadingPurchase.type === 'ton' ? (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              ) : (
                '💎'
              )}{' '}
              {(item.price.ton * buyQuantities[item.name]).toFixed(4)} TON
              {item.name === 'TON Jetton' && ' (Testnet)'}
            </Button>
            <Button
              className='w-full'
              variant='outline'
              disabled={
                buyQuantities[item.name] === 0 ||
                (loadingPurchase.itemName === item.name &&
                  loadingPurchase.type === 'stars')
              }
              onClick={() =>
                handleStarsPurchase(item, buyQuantities[item.name])
              }
            >
              {loadingPurchase.itemName === item.name &&
              loadingPurchase.type === 'stars' ? (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              ) : (
                '⭐'
              )}{' '}
              {item.price.stars * buyQuantities[item.name]} Stars
            </Button>
            <Button
              className='w-full'
              variant='outline'
              disabled={
                buyQuantities[item.name] === 0 ||
                (loadingPurchase.itemName === item.name &&
                  loadingPurchase.type === 'eth')
              }
              onClick={() => handleEthPurchase(item, buyQuantities[item.name])}
            >
              {loadingPurchase.itemName === item.name &&
              loadingPurchase.type === 'eth' ? (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              ) : (
                'Ξ'
              )}{' '}
              {(item.price.eth * buyQuantities[item.name]).toFixed(4)} ETH
              {item.name === 'ETH Token' && ' (Testnet)'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
