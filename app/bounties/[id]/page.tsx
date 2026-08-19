import Link from 'next/link'
import { ArrowLeft, Check, Code2, ExternalLink } from 'lucide-react'
import { ConnectWalletButton } from '@/components/connect-wallet-button'
import { DashboardShell, StatusBadge } from '@/components/dashboard-shell'
import { ParticipateDialog } from '@/components/participate-dialog'

export default async function BountyDetail({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const { id } = await params
  const bounty = await searchParams

  return (
    <DashboardShell title="Bounty detail">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/dashboard/bounties"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft size={15} />
          Back to bounties
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Code2 size={16} />
            {bounty.repo} · Issue #{bounty.issueNumber}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <StatusBadge status={bounty.status!} />
            <span className="text-xs text-muted-foreground">
              Funded escrow
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {bounty.title}
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            {bounty.description}
          </p>
        </div>

        <div className="flex flex-col items-end gap-4">
          <ConnectWalletButton />

          {/* Reward Box */}
          <div className="rounded-xl border border-[#bfe4cf] bg-green-wash p-5">
            <div className="text-xs font-semibold text-[#08784d]">REWARD</div>
            <div className="mt-1 font-mono text-2xl font-bold text-[#08784d]">
              {bounty.prize} QUAI
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mt-8 grid gap-5 md:grid-cols-[1.2fr_.8fr]">
        <section className="space-y-5">
          {/* GitHub Issue Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">
                  GitHub issue
                </div>
                <h2 className="mt-2 font-semibold">
                  #{bounty.issueNumber} {bounty.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{bounty.repo}</p>
              </div>
              <a
                href={`https://github.com/${bounty.repo}/issues/${bounty.issueNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-[#08784d]"
              >
                Open on GitHub <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Detailed Requirements */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold">Description</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {bounty.description}
            </p>

            <h2 className="mt-7 font-semibold">Completion requirements</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              These conditions determine whether the bounty is eligible for payout.
            </p>

            <div className="mt-5 space-y-3">
              {[
                'Pull request must be merged',
                'CI checks must pass',
                'PR must target main',
                'At least 1 maintainer approval',
                'Tests must pass',
              ].map((item) => (
                <div className="flex items-center gap-3 text-sm" key={item}>
                  <span className="grid size-5 place-items-center rounded-full bg-green-wash text-[#08784d]">
                    <Check size={13} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sidebar Summary */}
        <aside className="h-fit rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Bounty summary</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reward</span>
              <span className="font-mono font-semibold text-[#08784d]">
                {bounty.prize} QUAI
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deadline</span>
              <span>{bounty.days} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Maintainer</span>
              <span>Quai Labs</span>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <ParticipateDialog bounty={{title: bounty.title!, repo: bounty.repo!, reward: bounty.prize!, days: Number(bounty.days!), bountyId: bounty.id}} />
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
            Reward is already funded and held in Quai escrow.
          </p>
        </aside>
      </div>
    </DashboardShell>
  )
}