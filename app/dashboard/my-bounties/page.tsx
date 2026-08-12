import Link from 'next/link'
import { Plus } from 'lucide-react'
import { bounties } from '@/lib/mock-data'
import { BountyCard, DashboardShell, SectionHeader } from '@/components/dashboard-shell'
export default function MyBountiesPage() { return <DashboardShell title="My bounties"><SectionHeader eyebrow="Workspace" title="My bounties" description="Bounties you are participating in or managing." action={<Link href="/dashboard/create-bounty" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Plus size={16}/>Create bounty</Link>}/><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{bounties.slice(0, 3).map(bounty => <BountyCard bounty={bounty} key={bounty.id}/>)}</div></DashboardShell> }
