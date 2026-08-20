'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { quais } from 'quais'
import { useWallet } from '@/lib/wallet-context'
import { BOUNTY_ESCROW_ADDRESS, BOUNTY_ESCROW_ABI } from '@/lib/bounty-escrow-contract'

interface ParticipateDialogProps {
  bounty: {
    title: string
    repo: string
    reward: string
    days: number
    bountyId?: string
  }
}

// Placeholder until bountyId format is finalized
const PLACEHOLDER_BOUNTY_ID =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

export function ParticipateDialog({ bounty }: ParticipateDialogProps) {
  const [open, setOpen] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)
  const [amount, setAmount] = useState('');

  const { address, provider, connect, connecting } = useWallet()

  const handleClose = () => {
    setOpen(false)
    setTxError(null)
    setAccepted(false)
  }

  const handleFund = async () => {
    setTxError(null)

    if (!address || !provider) {
      await connect()
      return
    }

    const trimmedAmount = amount.trim()
    const parsedAmount = Number(trimmedAmount)

    if (!trimmedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setTxError('Enter a valid amount greater than 0.')
      return
    }

    setSubmitting(true)
    try {
      const signer = await provider.getSigner()
      const contract = new quais.Contract(
        BOUNTY_ESCROW_ADDRESS,
        BOUNTY_ESCROW_ABI,
        signer
      )

      const bountyId = bounty.bountyId ?? PLACEHOLDER_BOUNTY_ID
      const value = quais.parseQuai(trimmedAmount)

      const tx = await contract.fund(bountyId, { value })
      await tx.wait();

      

      setAccepted(true)
    } catch (err) {
      setTxError(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
      >
        Fund
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#071512]/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="participate-title"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            {accepted ? (
              <div className="text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-green-wash text-[#08784d]">
                  <Check size={24} />
                </div>
                <h2 id="participate-title" className="mt-4 text-xl font-semibold">
                  Bounty accepted
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  You&apos;re now participating in this bounty. Your contribution
                  will be submitted through GitHub.
                </p>
                <div className="mt-6 grid gap-2">
                  <a
                    href={`https://github.com/${bounty.repo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Open GitHub issue
                  </a>
                  <button
                    onClick={handleClose}
                    className="rounded-lg border border-border px-4 py-3 text-sm font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="section-label">Funding</div>
                    <h2 id="participate-title" className="mt-1 text-xl font-semibold">
                      You&apos;re about to fund this bounty
                    </h2>
                  </div>
                  <button
                    onClick={handleClose}
                    aria-label="Close dialog"
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="fund-amount"
                    className="text-sm font-semibold text-foreground"
                  >
                    Amount to fund
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                    <input
                      id="fund-amount"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      placeholder={bounty.reward}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                    <span className="text-xs font-semibold text-muted-foreground">
                      QUAI
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-muted-foreground">
                  Your quai tokens will be locked in the Bounty Escrow contract.
                </p>

                {!address && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Connect your wallet to fund this bounty.
                  </p>
                )}

                {txError && (
                  <p className="mt-3 text-xs text-red-600">{txError}</p>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 rounded-lg border border-border px-4 py-3 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFund}
                    disabled={submitting || connecting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {submitting || connecting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : null}
                    {!address
                      ? 'Connect wallet'
                      : submitting
                        ? 'Confirm in wallet…'
                        : 'Fund bounty'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}