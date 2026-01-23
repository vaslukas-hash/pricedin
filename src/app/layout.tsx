import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

const geistSans = GeistSans({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'PricedIn | Pricing & Revenue Strategy Jobs',
    template: '%s | PricedIn',
  },
  description: 'The job board for pricing, monetization, revenue strategy, and commercial strategy professionals. Find your next role at top companies.',
  keywords: ['pricing jobs', 'monetization jobs', 'revenue strategy', 'commercial strategy', 'pricing manager', 'pricing analyst'],
  authors: [{ name: 'PricedIn' }],
  creator: 'PricedIn',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'PricedIn',
    title: 'PricedIn | Pricing & Revenue Strategy Jobs',
    description: 'The job board for pricing, monetization, revenue strategy, and commercial strategy professionals.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PricedIn - Pricing & Revenue Strategy Jobs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PricedIn | Pricing & Revenue Strategy Jobs',
    description: 'The job board for pricing, monetization, revenue strategy, and commercial strategy professionals.',
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
    <html lang="en" className={geistSans.variable}>
      <body className="min-h-screen bg-brand-50 antialiased">
        {children}
      </body>
    </html>
  )
}
