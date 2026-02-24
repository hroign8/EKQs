
export interface Contestant {
  id: string
  name: string
  country: string
  gender: 'Male' | 'Female'
  image: string
  description: string
  /** Populated by the client after fetching vote counts; absent on raw DB rows. */
  votes?: Record<string, number>
  rank?: number
}

/**
 * Contestant with vote counts loaded — used in voting/results views.
 * Keeps the DB model (`Contestant`) free from computed enrichment fields.
 */
export interface EnrichedContestant extends Contestant {
  votes: Record<string, number>
}

export interface VotingCategory {
  id: string
  slug?: string
  name: string
  totalVotes?: number
}

export interface VotingPackage {
  id: string
  slug?: string
  name: string
  votes: number
  price: number
  popular?: boolean
  isActive?: boolean
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
  /** Flat fields matching the Prisma schema. */
  votingStart: string
  votingEnd: string
  isActive: boolean
  publicResults?: boolean
  totalVotes?: number
  uniqueVoters?: number
  votePrice?: number
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
 * Type guard to check if a value is a SessionUser.
 */
function isSessionUser(value: unknown): value is SessionUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  )
}

/**
 * Helper to safely check if a user has admin role.
 */
export function isAdmin(user: unknown): boolean {
  return isSessionUser(user) && user.role === 'admin'
}

/**
 * Helper to get user role safely.
 */
export function getUserRole(user: unknown): string | undefined {
  return isSessionUser(user) ? user.role : undefined
}

// ── Dashboard types ──────────────────────────────────────────────────────────

export type DashboardStats = {
  totalVotesCast: number
  totalTransactions: number
  totalSpent: number
  verifiedVotes: number
  pendingVotes: number
  confirmedTickets: number
  pendingTickets: number
  totalTicketsPurchased: number
  messagesSent: number
}

export type VoteEntry = {
  id: string
  contestantName: string
  contestantImage: string
  categoryName: string
  packageName: string
  votesCount: number
  amountPaid: number
  verified: boolean
  createdAt: string
}

export type TicketEntry = {
  id: string
  ticketName: string
  quantity: number
  totalAmount: number
  status: 'pending' | 'confirmed' | 'failed'
  createdAt: string
}

export type MessageEntry = {
  id: string
  subject: string | null
  message: string
  read: boolean
  createdAt: string
}

export type AccountInfo = {
  id: string
  name: string
  email: string
  image: string | null
  createdAt: string
}