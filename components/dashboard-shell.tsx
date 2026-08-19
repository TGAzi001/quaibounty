'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Bell,
  ChevronDown,
  Code2,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  Wallet,
  X,
  CircleDollarSign,
  GitPullRequest,
  Plus,
  LogOut,
  UserRound,
} from 'lucide-react'

interface BountyType {
  id: string;
  org: string;
  repo: string; 
  issueNumber: string;
  title: string;
  description: string;
  link: string;
  prize: number;
}

export type Workspace = 'contributor' | 'maintainer'

const contributorNav = [
  ['Overview', '/dashboard', LayoutDashboard],
  ['Explore Bounties', '/dashboard/bounties', FolderKanban],
  ['My Bounties', '/dashboard/my-bounties', Code2],
  ['Submissions', '/dashboard/submissions', GitPullRequest],
  ['Earnings', '/dashboard/earnings', CircleDollarSign],
  ['Wallet', '/dashboard/wallet', Wallet],
  ['Settings', '/dashboard/settings', Settings],
] as const

const maintainerNav = [
  ['Overview', '/dashboard', LayoutDashboard],
  ['My Bounties', '/dashboard/my-bounties', FolderKanban],
  ['Create Bounty', '/dashboard/create-bounty', Plus],
  ['Submissions', '/dashboard/submissions', GitPullRequest],
  ['Wallet', '/dashboard/wallet', Wallet],
  ['Transactions', '/dashboard/earnings', CircleDollarSign],
  ['Settings', '/dashboard/settings', Settings],
] as const

export function DashboardShell({
  children,
  title = 'Overview',
}: {
  children: React.ReactNode
  title?: string
}) {
  const pathname = usePathname()
  const [workspace, setWorkspace] = useState<Workspace>('contributor')
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = workspace === 'contributor' ? contributorNav : maintainerNav

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <div className="dashboard-surface min-h-screen text-foreground">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-y-auto border-r border-border bg-card px-5 py-6 transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">
              Q
            </span>
            QuaiBounty
          </Link>
          <button
            className="rounded-md p-2 text-muted-foreground lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace Selector */}
        <div className="mt-7 shrink-0 rounded-xl border border-border bg-muted/60 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">
            Current workspace
          </div>
          <select
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value as Workspace)}
            className="mt-2 w-full bg-transparent text-sm font-semibold outline-none"
          >
            <option value="contributor">Contributor</option>
            <option value="maintainer">Maintainer</option>
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            {workspace === 'contributor'
              ? 'Find and complete bounties'
              : 'Create and manage bounties'}
          </p>
        </div>

        {/* Links */}
        <nav
          className="mt-7 flex shrink-0 flex-col gap-1"
          aria-label="Dashboard navigation"
        >
          {nav.map(([label, href, Icon]) => (
            <Link
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${isActive(href) ? 'active' : ''}`}
              href={href}
              key={label}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Wallet Widget */}
        <div className="mt-7 shrink-0 rounded-xl bg-green-wash p-4">
          <div className="text-[11px] font-bold tracking-[.12em] text-[#08784d]">
            PAYOUT WALLET
          </div>
          <div className="mt-2 font-mono text-xs text-[#25372f]">
            Not connected
          </div>
          <Link
            href="/dashboard/wallet"
            className="mt-3 inline-block text-xs font-semibold text-[#08784d]"
          >
            Set up wallet →
          </Link>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-[#071512]/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      {/* Main Content Area */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur sm:px-8">
          <button
            className="rounded-md p-2 text-muted-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="hidden text-sm text-muted-foreground sm:block">
            Workspace /{' '}
            <span className="font-medium text-foreground">{title}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>

            {/* Profile Dropdown */}
            <details className="relative">
              <summary className="flex cursor-pointer list-none items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-[#071512] text-xs font-bold text-white">
                  AL
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-semibold">Alex Lee</span>
                  <span className="block text-[11px] text-muted-foreground">
                    @alexlee
                  </span>
                </span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </summary>

              <div className="absolute right-0 mt-3 w-60 rounded-xl border border-border bg-card p-2 shadow-xl">
                <div className="border-b border-border px-3 py-2">
                  <div className="text-sm font-semibold">Alex Lee</div>
                  <div className="text-xs text-muted-foreground">
                    Contributor · wallet not connected
                  </div>
                </div>
                <Link
                  className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  href="/dashboard/settings"
                >
                  <UserRound size={15} />
                  Profile
                </Link>
                <Link
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  href="/dashboard/settings"
                >
                  <Settings size={15} />
                  Settings
                </Link>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </details>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    FUNDED: 'Funded',
    OPEN: 'Open',
    IN_PROGRESS: 'In progress',
    VERIFYING: 'Verifying',
    SUCCESS: 'Success',
    PAID: 'Paid',
    EXPIRED: 'Expired',
    PR_SUBMITTED: 'PR submitted',
    CHANGES_REQUESTED: 'Changes requested',
  }

  const tone =
    status === 'FUNDED' || status === 'PAID' || status === 'SUCCESS'
      ? 'status-green'
      : status === 'VERIFYING' ||
        status === 'IN_PROGRESS' ||
        status === 'PR_SUBMITTED'
      ? 'status-blue'
      : status === 'EXPIRED'
      ? 'status-red'
      : 'status-neutral'

  return (
    <span className={`status-badge ${tone}`}>
      {labels[status] ?? status}
    </span>
  )
}

export function BountyCard({
  bounty,
}: {
  bounty: BountyType
}) {
    const queryParams = new URLSearchParams({
      org: bounty.org,
      repo: bounty.repo,
      issueNumber: bounty.issueNumber,
      title: bounty.title,
      description: bounty.description,
      status: "open",
      prize: bounty.prize.toString(),
      days: "30",
      id: bounty.id
    }).toString()
  return (
    <Link
      href={`/bounties/${bounty.id}?${queryParams}`}
      className="card-hover block rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <StatusBadge status={"open"} />
        <span className="font-mono text-sm font-semibold text-[#08784d]">
          {bounty.prize} QUAI
        </span>
      </div>

      <h3 className="mt-4 font-semibold text-foreground">{bounty.title}</h3>

      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        <Code2 size={13} />
        {bounty.repo}
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {bounty.description}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <span>
          {30} days remaining{' '}
          <span className="ml-1 text-foreground">→</span>
        </span>
      </div>
    </Link>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="section-label">{eyebrow}</div>}
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}