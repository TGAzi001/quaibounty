import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'QuaiBounty — Fund the issue. Ship the fix. Get paid.',
  description: 'GitHub-native bounties with programmable verification and on-chain settlement through Quai.',
  generator: 'QuaiBounty',
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f8faf9', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={inter.variable}><body>{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
