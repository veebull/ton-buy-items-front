import { Marketplace } from '@/pages/Marketplace'
import { WalletProvider } from '@/providers/WalletProvider'
import { Toaster } from "@/components/ui/sonner"
import './App.css'

function App() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-background">
        <Marketplace />
        <Toaster />
      </div>
    </WalletProvider>
  )
}

export default App
