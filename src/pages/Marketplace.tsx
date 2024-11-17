import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NFTSection } from '@/components/marketplace/NFTSection';
import { SBTSection } from '@/components/marketplace/SBTSection';
import { ItemsSection } from '@/components/marketplace/ItemsSection';
import { WalletConnect } from '@/components/WalletConnect';
import { useToast } from '@/hooks/use-toast';

export function Marketplace() {
  const { toast } = useToast();

  const showTestToasts = () => {
    // toast('Event has been created.');
    toast({
      title: 'Default Toast',
      description: 'This is a default toast message',
    });

    setTimeout(() => {
      toast({
        title: 'Success Toast',
        description: 'Operation completed successfully',
        variant: 'success',
      });
    }, 1000);

    setTimeout(() => {
      toast({
        title: 'Warning Toast',
        description: 'This is a warning message',
        variant: 'warning',
      });
    }, 2000);

    setTimeout(() => {
      toast({
        title: 'Error Toast',
        description: 'Something went wrong!',
        variant: 'destructive',
      });
    }, 3000);
  };

  return (
    <div className='container mx-auto p-4 space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>🌿 TON Garden Marketplace</h1>
        <div className='flex gap-4 items-center'>
          <Button variant='outline' onClick={showTestToasts}>
            Test Toasts
          </Button>
          <WalletConnect />
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='items' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='items'>🛠️ Items</TabsTrigger>
          <TabsTrigger value='nft'>🎨 NFTs</TabsTrigger>
          <TabsTrigger value='sbt'>🏆 SBT</TabsTrigger>
        </TabsList>
        <TabsContent value='items'>
          <ItemsSection />
        </TabsContent>,
        <TabsContent value='nft'>
          <NFTSection />
        </TabsContent>
        <TabsContent value='sbt'>
          <SBTSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
