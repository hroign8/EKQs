
export interface Contestant {
  id: string
  name: string
  country: string
  gender: string
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