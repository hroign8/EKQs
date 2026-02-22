import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contestants — EKQs',
  description: 'Meet all the contestants competing in the EKQs pageant.',
  openGraph: {
    title: 'Contestants — EKQs',
    description: 'Meet all the contestants competing in the EKQs pageant.',
  },
}

export default function ContestantsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
