'use client'

import { useState, useCallback } from 'react'
import type { DashboardStats, VoteEntry, TicketEntry, MessageEntry, AccountInfo } from '@/types'

const DEFAULT_STATS: DashboardStats = {
  totalVotesCast: 0,
  totalTransactions: 0,
  totalSpent: 0,
  verifiedVotes: 0,
  pendingVotes: 0,
  confirmedTickets: 0,
  pendingTickets: 0,
  totalTicketsPurchased: 0,
  messagesSent: 0,
}

export function useDashboardData() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS)
  const [votes, setVotes] = useState<VoteEntry[]>([])
  const [tickets, setTickets] = useState<TicketEntry[]>([])
  const [messages, setMessages] = useState<MessageEntry[]>([])
  const [account, setAccount] = useState<AccountInfo | null>(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setVotes(data.votes)
        setTickets(data.tickets)
        setMessages(data.messages)
        setAccount(data.account)
      } else {
        setError('Failed to load dashboard data. Please try again.')
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, stats, votes, tickets, messages, account, fetchDashboard }
}
