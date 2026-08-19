'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { quais } from 'quais'

interface PelagusProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, handler: (...args: any[]) => void) => void
  removeListener: (event: string, handler: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    pelagus?: PelagusProvider
  }
}

interface WalletContextValue {
  address: string | null
  provider: quais.BrowserProvider | null
  connecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<quais.BrowserProvider | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    setError(null)

    const pelagus = typeof window !== 'undefined' ? window.pelagus : undefined
    if (!pelagus) {
      setError('Pelagus wallet not found. Install it from pelaguswallet.io')
      return
    }

    setConnecting(true)
    try {
      // NOTE: verify this RPC method name against Pelagus's injected provider —
      // modeled on eth_requestAccounts but unconfirmed against current Pelagus docs.
      const accounts = (await pelagus.request({
        method: 'quai_requestAccounts',
      })) as string[]

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from Pelagus')
      }

      const browserProvider = new quais.BrowserProvider(pelagus)
      setProvider(browserProvider)
      setAddress(accounts[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setProvider(null)
  }, [])

  // Keep address in sync if the user switches accounts in Pelagus directly
  useEffect(() => {
    const pelagus = typeof window !== 'undefined' ? window.pelagus : undefined
    if (!pelagus) return

    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts?.[0] ?? null)
    }

    pelagus.on('accountsChanged', handleAccountsChanged)
    return () => pelagus.removeListener('accountsChanged', handleAccountsChanged)
  }, [])

  return (
    <WalletContext.Provider
      value={{ address, provider, connecting, error, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return ctx
}