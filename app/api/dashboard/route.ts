import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/api-utils'

/**
 * GET /api/dashboard
 * Authenticated endpoint — returns the current user's activity data.
 */
export async function GET() {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const userId = session!.user.id

    const [votes, tickets, messages, account] = await Promise.all([
      prisma.vote.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          contestant: { select: { id: true, name: true, image: true } },
          category: { select: { id: true, name: true } },
          package: { select: { id: true, name: true, votes: true, price: true } },
        },
      }),
      prisma.ticketPurchase.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          ticketType: { select: { id: true, name: true, price: true } },
        },
      }),
      prisma.contactMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      }),
    ])

    const totalVotesCast = votes.reduce((sum, v) => sum + v.votesCount, 0)
    const totalSpentVotes = votes.reduce((sum, v) => sum + v.amountPaid, 0)
    const totalSpentTickets = tickets.reduce((sum, t) => sum + t.totalAmount, 0)
    const verifiedVotes = votes.filter((v) => v.verified).length
    const pendingVotes = votes.filter((v) => !v.verified).length
    const confirmedTickets = tickets.filter((t) => t.status === 'completed').length
    const pendingTickets = tickets.filter((t) => t.status === 'pending').length

    return NextResponse.json({
      account,
      stats: {
        totalVotesCast,
        totalTransactions: votes.length + tickets.length,
        totalSpent: totalSpentVotes + totalSpentTickets,
        verifiedVotes,
        pendingVotes,
        confirmedTickets,
        pendingTickets,
        totalTicketsPurchased: tickets.length,
        messagesSent: messages.length,
      },
      votes: votes.map((v) => ({
        id: v.id,
        contestantName: v.contestant.name,
        contestantImage: v.contestant.image,
        categoryName: v.category.name,
        packageName: v.package.name,
        votesCount: v.votesCount,
        amountPaid: v.amountPaid,
        verified: v.verified,
        createdAt: v.createdAt,
      })),
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketName: t.ticketType.name,
        quantity: t.quantity,
        totalAmount: t.totalAmount,
        status: t.status,
        createdAt: t.createdAt,
      })),
      messages: messages.map((m) => ({
        id: m.id,
        subject: m.subject,
        message: m.message,
        read: m.read,
        createdAt: m.createdAt,
      })),
    })
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
