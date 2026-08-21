'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react'
import { BountyCard, DashboardShell, SectionHeader } from '@/components/dashboard-shell'

export interface Bounty {
  id: string;
  org: string;
  repo: string; 
  issueNumber: string;
  title: string;
  description: string;
  link: string;
  prize: number;
}

export default function BountiesPage() {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [skill, setSkill] = useState('All')

  const skills = [
    'All',
    'React',
    'TypeScript',
    'Solidity',
    'Go',
    'Rust',
    'Documentation',
  ]

  useEffect(() => {
    async function fetchBounties() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(
          'https://quaibounty.up.railway.app/api/bounties',
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch bounties: ${response.statusText}`)
        }

        const data = await response.json()
        // Handles array response or wrapped object like { bounties: [...] }
        setBounties(Array.isArray(data) ? data : data.bounties || [])
      } catch (err: any) {
        console.error('Error fetching bounties:', err)
        setError(err.message || 'Something went wrong fetching bounties.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBounties()
  }, [])

  return (
    <DashboardShell title="Explore Bounties">
      <SectionHeader
        eyebrow="Marketplace"
        title="Explore bounties"
        description="Find funded open-source work that matches your skills."
      />

      <div className="mt-8 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-lg bg-muted px-3">
          <Search size={17} className="text-muted-foreground" />
          <input
            aria-label="Search bounties"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bounties..."
            className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div className="flex items-center gap-2 overflow-x-auto">
          <SlidersHorizontal size={16} className="ml-1 shrink-0 text-muted-foreground" />
          {skills.map((item) => (
            <button
              key={item}
              onClick={() => setSkill(item)}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold ${
                skill === item
                  ? 'bg-[#071512] text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {bounties.length} funded issues
        </p>
        <button className="text-sm text-muted-foreground">
          Sort: Recommended
        </button>
      </div>

      {isLoading && (
        <div className="mt-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading bounties...</p>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bounties.map((bounty) => (
            <BountyCard bounty={bounty} key={bounty.id} />
          ))}
        </div>
      )}
    </DashboardShell>
  )
}