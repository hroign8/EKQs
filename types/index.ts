
export interface Contestant {
  id: string
  name: string
  country: string
  gender: 'Male' | 'Female' | string
  image: string
  description: string
  votes: Record<string, number>
  rank?: number
}

export interface VotingCategory {
  id: string
  slug?: string
  name: string
  totalVotes?: number
}

export interface Vote {
  id: string
  contestantId: string
  categoryId: string
  voterEmail: string
  timestamp: Date
  verified: boolean
}

export interface Event {
  id: string
  name: string
  tagline: string
  startDate: string
  endDate: string
  votingPeriod: {
    start: string
    end: string
  }
  isActive: boolean
  totalVotes: number
  uniqueVoters: number
  votePrice: number
}

/**
 * Extended user type with role from better-auth admin plugin.
 */
export interface SessionUser {
  id: string
  name: string
  email: string
  image?: string | null
  role?: string
  [key: string]: unknown
}

/**
 * Helper to safely check if a user has admin role.
 */
export function isAdmin(user: unknown): boolean {
  return (user as SessionUser)?.role === 'admin'
}

/**
 * Helper to get user role safely.
 */
export function getUserRole(user: unknown): string | undefined {
  return (user as SessionUser)?.role
}