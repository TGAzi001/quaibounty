export type BountyStatus = 'FUNDED' | 'OPEN' | 'IN_PROGRESS' | 'VERIFYING' | 'SUCCESS' | 'PAID' | 'EXPIRED'
export type Bounty = { id: string; title: string; repo: string; reward: number; skills: string[]; difficulty: 'Easy' | 'Medium' | 'Hard'; status: BountyStatus; days: number; issue: number; description: string }
export const bounties: Bounty[] = [
 { id:'auth-timeout', title:'Fix authentication timeout', repo:'quai-labs/sdk', reward:250, skills:['React','TypeScript','Auth'], difficulty:'Medium', status:'FUNDED', days:8, issue:184, description:'Investigate intermittent session expiry and improve retry behavior across the SDK authentication flow.' },
 { id:'wallet-kit', title:'Add transaction history pagination', repo:'open-source/wallet-kit', reward:480, skills:['TypeScript','GraphQL'], difficulty:'Hard', status:'OPEN', days:14, issue:72, description:'Add cursor-based pagination to transaction history while keeping the existing public API backwards compatible.' },
 { id:'cli-logs', title:'Improve CLI error output', repo:'quai-community/devtools', reward:120, skills:['Node.js','CLI'], difficulty:'Easy', status:'FUNDED', days:5, issue:39, description:'Make failed commands actionable with clear error codes, suggested fixes, and consistent terminal formatting.' },
 { id:'indexer', title:'Build block event indexer', repo:'quai-labs/indexer', reward:750, skills:['Go','Postgres','Quai'], difficulty:'Hard', status:'IN_PROGRESS', days:21, issue:311, description:'Create a resilient event indexer with reorg handling and a small query API for downstream tools.' },
]
export const faqs = [
 ['What is QuaiBounty?', 'QuaiBounty turns GitHub issues into funded, programmable bounties. Maintainers lock a reward before work starts, and contributors are paid when the contribution conditions are verified.'],
 ['How do contributors get paid?', 'A successful pull request moves through verification, then the escrow releases the advertised reward to the contributor’s connected Quai wallet.'],
 ['Where are bounty funds stored?', 'Funds are represented by an on-chain escrow flow. The MVP pairs transparent smart-contract settlement with an off-chain verification service.'],
 ['What conditions can be verified?', 'Requirements can include a merged pull request, passing CI, the target repository and branch, required approvals, and custom checks.'],
 ['What happens if a bounty expires?', 'The maintainer can define an expiry policy before funding. Expired bounties enter a review state for refund or extension.'],
 ['Can I be both a contributor and maintainer?', 'Yes. Your onboarding selection sets a preferred dashboard experience; it never permanently locks your account into one role.'],
]
export const stats = { available: 24, active: 3, reviews: 2, completed: 17, earned: 2840 }
