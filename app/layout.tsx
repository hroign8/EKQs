import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { ToastProvider } from '@/components/Toast'
import { SpeedInsights } from '@vercel/speed-insights/next'

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-plus-jakarta',
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ek-qs.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Eritrean Kings & Queens - Digital Voting Platform',
    template: '%s | Eritrean Kings & Queens',
  },
  description: 'Vote for your favorite contestants in the Eritrean Kings & Queens competition. Celebrating excellence, beauty, and talent in the Eritrean community.',
  keywords: ['Eritrean', 'Kings', 'Queens', 'voting', 'competition', 'beauty pageant', 'talent show', 'Kampala', 'Uganda'],
  authors: [{ name: 'Eritrean Kings & Queens' }],
  creator: 'Eritrean Kings & Queens',
  publisher: 'Eritrean Kings & Queens',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Eritrean Kings & Queens',
    title: 'Eritrean Kings & Queens - Digital Voting Platform',
    description: 'Vote for your favorite contestants in the Eritrean Kings & Queens competition. Celebrating excellence, beauty, and talent.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Eritrean Kings & Queens',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eritrean Kings & Queens - Digital Voting Platform',
    description: 'Vote for your favorite contestants in the Eritrean Kings & Queens competition.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4a1942',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Read the nonce injected by middleware so Next.js stamps it on its own
  // inline bootstrap scripts. Any custom <Script> components should also
  // receive this nonce prop.
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.className} antialiased`} suppressHydrationWarning>
        <ToastProvider>
          <Navigation />
          <div className="min-h-screen">
            {children}
          </div>
          <Footer />
        </ToastProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}