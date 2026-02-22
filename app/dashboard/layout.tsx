import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — EKQs',
  description: 'Manage your EKQs account, view your votes, and track your activity.',
  openGraph: {
    title: 'Dashboard — EKQs',
    description: 'Manage your EKQs account, view your votes, and track your activity.',
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
