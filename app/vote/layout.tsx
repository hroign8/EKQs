import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vote — EKQs',
  description: 'Cast your votes and view the current standings for EKQs contestants.',
  openGraph: {
    title: 'Vote — EKQs',
    description: 'Cast your votes and view the current standings for EKQs contestants.',
  },
}

export default function VoteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
