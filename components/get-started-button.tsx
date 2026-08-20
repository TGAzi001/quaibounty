'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'

export function LinkGithubButton() {
  const { address } = useWallet()
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)

  const handleLinkGithub = async () => {
    if (!address) {
      setLinkError('Connect your wallet first.')
      return
    }

    setLinkError(null)
    setLinking(true)
    try {
      const res = await fetch('https://quaibounty.up.railway.app/api/auth/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Failed to start GitHub linking')
      }

      window.location.href = data.redirectUrl
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Failed to link GitHub')
    } finally {
      setLinking(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleLinkGithub}
        disabled={linking || !address}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {linking ? 'Linking…' : 'Link GitHub'}
      </button>
      {linkError && <span className="text-xs text-red-600">{linkError}</span>}
    </div>
  )
}