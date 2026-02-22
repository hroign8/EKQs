import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Results — EKQs',
  description: 'View the latest voting results for EKQs contestants.',
  openGraph: {
    title: 'Results — EKQs',
    description: 'View the latest voting results for EKQs contestants.',
  },
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
