import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'PricedIn | Pricing Jobs, Monetization Careers & Revenue Strategy Roles',
    template: '%s | PricedIn',
  },
  description:
    'The #1 job board for pricing jobs, monetization careers, and revenue strategy roles. Browse curated opportunities from top employers hiring pricing analysts, managers, and directors.',
  keywords: [
    'pricing jobs',
    'pricing manager jobs',
    'pricing analyst jobs',
    'monetization careers',
    'monetization jobs',
    'revenue strategy jobs',
    'revenue strategy careers',
    'commercial strategy jobs',
    'pricing director jobs',
    'head of pricing',
    'VP pricing',
    'pricing salary',
  ],
  authors: [{ name: 'PricedIn' }],
  creator: 'PricedIn',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'PricedIn',
    title: 'PricedIn | Pricing Jobs, Monetization Careers & Revenue Strategy Roles',
    description:
      'The #1 job board for pricing professionals. Browse pricing jobs, monetization careers, and revenue strategy roles at top companies.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PricedIn - Pricing Jobs, Monetization Careers & Revenue Strategy Roles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PricedIn | Pricing Jobs, Monetization Careers & Revenue Strategy Roles',
    description:
      'The #1 job board for pricing professionals. Browse pricing jobs, monetization careers, and revenue strategy roles at top companies.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="min-h-screen bg-brand-50 antialiased">{children}</body>
    </html>
  )
}
