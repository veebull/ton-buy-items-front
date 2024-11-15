import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Minus, Plus } from "lucide-react"

const sbts = [
  {
    name: "Master Gardener",
    image: "/badges/master-gardener.png",
    description: "Awarded for growing 100 plants",
    price: {
      ton: 4.99,
      stars: 5000
    },
    requirements: "Must have grown 100 plants",
    quantity: 0
  },
  {
    name: "Plant Scientist",
    image: "/badges/scientist.png",
    description: "For completing all research tasks",
    price: {
      ton: 3.99,
      stars: 4000
    },
    requirements: "Complete all research missions",
    quantity: 0
  },
  {
    name: "Green Thumb",
    image: "/badges/green-thumb.png",
    description: "For perfect plant care streak",
    price: {
      ton: 2.99,
      stars: 3000
    },
    requirements: "30 days perfect plant care",
    quantity: 0
  }
]

export function SBTSection() {
  const [buyQuantities, setBuyQuantities] = useState<Record<string, number>>(
    Object.fromEntries(sbts.map(sbt => [sbt.name, 1]))
  )

  const handleDecrease = (sbtName: string) => {
    setBuyQuantities(prev => ({
      ...prev,
      [sbtName]: Math.max(0, prev[sbtName] - 1)
    }))
  }

  const handleIncrease = (sbtName: string) => {
    setBuyQuantities(prev => ({
      ...prev,
      [sbtName]: prev[sbtName] + 1
    }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sbts.map((sbt) => (
        <Card key={sbt.name} className="p-4">
          <img 
            src={sbt.image} 
            alt={sbt.name} 
            className="w-32 h-32 mx-auto object-contain"
          />
          <div className="mt-4 text-center">
            <h3 className="font-bold text-lg">{sbt.name}</h3>
            <div className="text-sm text-muted-foreground">
              Owned: x{sbt.quantity}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {sbt.description}
            </p>
            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              ⚠️ {sbt.requirements}
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleDecrease(sbt.name)}
                disabled={buyQuantities[sbt.name] === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="w-12 text-center">
                {buyQuantities[sbt.name]}
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleIncrease(sbt.name)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              <Button 
                className="w-full" 
                variant="outline"
                disabled={buyQuantities[sbt.name] === 0}
              >
                💎 {(sbt.price.ton * buyQuantities[sbt.name]).toFixed(4)} TON
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                disabled={buyQuantities[sbt.name] === 0}
              >
                ⭐ {sbt.price.stars * buyQuantities[sbt.name]} Stars
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 