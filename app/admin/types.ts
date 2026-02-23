import type { Contestant } from '@/types'

export type Category = {
  id: string
  name: string
  slug?: string
}

export type VotingPackage = {
  id: string
  name: string
  slug?: string
  votes: number
  price: number
  isActive: boolean
}

export type VoteLogEntry = {
  id: string
  time: string
  voterEmail: string
  voterName: string
  contestant: string
  category: string
  verified: boolean
  packageName: string
  votesCount: number
  amountPaid: number
}

export type AdminTab = 'overview' | 'contestants' | 'results' | 'votelog' | 'settings' | 'packages' | 'revenue' | 'users' | 'tickets'

export type ModalType = 'contestant' | 'category' | 'vote' | 'event' | 'package' | 'advanced' | 'ticket'

export type AdminTicketType = {
  id: string
  name: string
  price: number
  features: string[]
  icon: string
  popular: boolean
  isActive: boolean
  sortOrder: number
  purchaseCount: number
  createdAt: string
}

export type TicketFormData = {
  name: string
  price: string
  features: string
  icon: string
  popular: boolean
  sortOrder: string
}

export type AdvancedSettings = {
  maintenanceMode: boolean
  emailNotifications: boolean
  autoBackup: boolean
  debugMode: boolean
  maxVotesPerUser: string
  sessionTimeout: string
  apiRateLimit: string
}

export type ContestantFormData = {
  name: string
  country: string
  gender: string
  image: string
  description: string
}

export type EventFormData = {
  name: string
  tagline: string
  startDate: string
  endDate: string
  votingStart: string
  votingEnd: string
}

/** Helper to get the votes record from a contestant. */
export function getVotes(contestant: Contestant): Record<string, number> {
  return (contestant.votes || {}) as Record<string, number>
}

/** Helper to get total votes across all categories. */
export function getTotalVotes(contestant: Contestant): number {
  const votes = getVotes(contestant)
  return Object.values(votes).reduce((sum, v) => sum + (v || 0), 0)
}
