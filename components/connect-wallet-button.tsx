'use client'

import { useWallet } from '@/lib/wallet-context'

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ConnectWalletButton() {
  const { address, connecting, error, connect, disconnect } = useWallet()

  if (address) {
    return (
      <button
        onClick={disconnect}
        className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground"
      >
        {truncateAddress(address)}
      </button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={connect}
        disabled={connecting}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {connecting ? 'Connecting…' : 'Connect wallet'}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}