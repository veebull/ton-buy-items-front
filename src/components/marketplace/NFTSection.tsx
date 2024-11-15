import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Minus, Plus } from "lucide-react"

const nfts = [
  {
    name: "Cuddly Cacti",
    image: "/plants/cacti.png",
    price: {
      ton: 9.99,
      stars: 10000,
      eth: 0.1
    },
    quantity: 0
  },
  // Add more NFTs...
]

export function NFTSection() {
  const [buyQuantities, setBuyQuantities] = useState<Record<string, number>>(
    Object.fromEntries(nfts.map(nft => [nft.name, 1]))
  )

  const handleDecrease = (nftName: string) => {
    setBuyQuantities(prev => ({
      ...prev,
      [nftName]: Math.max(0, prev[nftName] - 1)
    }))
  }

  const handleIncrease = (nftName: string) => {
    setBuyQuantities(prev => ({
      ...prev,
      [nftName]: prev[nftName] + 1
    }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nfts.map((nft) => (
        <Card key={nft.name} className="p-4">
          <img 
            src={nft.image} 
            alt={nft.name} 
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="mt-4">
            <h3 className="font-bold text-lg">{nft.name}</h3>
            <div className="text-sm text-muted-foreground">
              Owned: x{nft.quantity}
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleDecrease(nft.name)}
                disabled={buyQuantities[nft.name] === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-12 text-center">
                {buyQuantities[nft.name]}
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleIncrease(nft.name)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              <Button 
                className="w-full" 
                variant="outline"
                disabled={buyQuantities[nft.name] === 0}
              >
                💎 {(nft.price.ton * buyQuantities[nft.name]).toFixed(4)} TON
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                disabled={buyQuantities[nft.name] === 0}
              >
                ⭐ {nft.price.stars * buyQuantities[nft.name]} Stars
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                disabled={buyQuantities[nft.name] === 0}
              >
                Ξ {(nft.price.eth * buyQuantities[nft.name]).toFixed(4)} ETH
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 