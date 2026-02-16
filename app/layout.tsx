import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Eritrean Kings & Queens - Digital Voting Platform',
  description: 'Digital voting platform for Eritrean Kings & Queens competition',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.className} antialiased`} suppressHydrationWarning>
        <Navigation />
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}