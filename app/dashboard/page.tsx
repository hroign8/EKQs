'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NextImage from 'next/image'
import Link from 'next/link'
import {
  Crown,
  Loader2,
  Heart,
  Ticket,
  Mail,
  BarChart3,
  DollarSign,
  CheckCircle2,
  Clock,
  User,
  CalendarDays,
  ArrowUpRight,
  Trophy,
  ShieldCheck,
  TrendingUp,
  MessageCircle,
} from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { useDashboardData } from './hooks/useDashboardData'

type DashboardTab = 'overview' | 'votes' | 'tickets' | 'messages'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending: sessionPending } = useSession()
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const { loading, error, stats, votes, tickets, messages, account, fetchDashboard } = useDashboardData()

  useEffect(() => {
    if (!sessionPending && session?.user) {
      fetchDashboard()
    }
  }, [sessionPending, session, fetchDashboard])

  // Auth guard
  if (sessionPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy-900" />
      </div>
    )
  }

  if (!session?.user) {
    router.push('/signin')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy-900" />
      </div>
    )
  }

  const tabs: { key: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'votes', label: 'My Votes', icon: <Heart className="w-4 h-4" /> },
    { key: 'tickets', label: 'My Tickets', icon: <Ticket className="w-4 h-4" /> },
    { key: 'messages', label: 'Messages', icon: <Mail className="w-4 h-4" /> },
  ]

  const statCards = [
    {
      label: 'Total Votes Cast',
      value: stats.totalVotesCast,
      icon: <Heart className="w-5 h-5" />,
      iconBg: 'bg-blue-100 text-blue-600',
      accent: 'from-blue-500/10 to-transparent',
      border: 'border-blue-100',
      sub: stats.verifiedVotes > 0 ? `${stats.verifiedVotes} verified` : undefined,
      subColor: 'text-blue-500',
    },
    {
      label: 'Total Spent',
      value: `$${stats.totalSpent.toFixed(2)}`,
      icon: <DollarSign className="w-5 h-5" />,
      iconBg: 'bg-emerald-100 text-emerald-600',
      accent: 'from-emerald-500/10 to-transparent',
      border: 'border-emerald-100',
      sub: stats.totalTransactions > 0 ? `${stats.totalTransactions} transactions` : undefined,
      subColor: 'text-emerald-500',
    },
    {
      label: 'Tickets Purchased',
      value: stats.totalTicketsPurchased,
      icon: <Ticket className="w-5 h-5" />,
      iconBg: 'bg-violet-100 text-violet-600',
      accent: 'from-violet-500/10 to-transparent',
      border: 'border-violet-100',
      sub: stats.confirmedTickets > 0 ? `${stats.confirmedTickets} confirmed` : undefined,
      subColor: 'text-violet-500',
    },
    {
      label: 'Messages Sent',
      value: stats.messagesSent,
      icon: <MessageCircle className="w-5 h-5" />,
      iconBg: 'bg-amber-100 text-amber-600',
      accent: 'from-amber-500/10 to-transparent',
      border: 'border-amber-100',
      sub: undefined as string | undefined,
      subColor: 'text-amber-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-burgundy-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gold-500"></div>
              <Crown className="w-6 h-6 text-gold-500" />
              <div className="h-px w-12 bg-gold-500"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Dashboard</h1>
            <p className="text-burgundy-200">Track your voting activity, tickets, and more</p>
          </div>

          {/* Tabs */}
          <div role="tablist" aria-label="Dashboard sections" className="flex flex-wrap items-center justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                id={`dashboard-tab-${tab.key}`}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-gold-500 text-burgundy-900'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div role="alert" className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => fetchDashboard()}
              className="ml-4 text-sm font-medium underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-burgundy-900 mx-auto mb-4" />
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <div role="tabpanel" aria-labelledby={`dashboard-tab-${activeTab}`}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {statCards.map((card) => (
                    <div
                      key={card.label}
                      className={`relative bg-white rounded-2xl p-5 sm:p-6 border ${card.border} overflow-hidden group hover:shadow-lg hover:shadow-gray-100 hover:-translate-y-0.5 transition-all duration-300`}
                    >
                      {/* Decorative gradient */}
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${card.accent} rounded-bl-[60px] -mr-2 -mt-2 opacity-60 group-hover:opacity-100 transition-opacity`} />
                      <div className="relative">
                        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${card.iconBg} mb-4 shadow-sm`}>
                          {card.icon}
                        </div>
                        <p className="text-3xl font-extrabold text-burgundy-900 tracking-tight">{card.value}</p>
                        <p className="text-sm text-gray-500 mt-1.5 font-medium">{card.label}</p>
                        {card.sub && (
                          <p className={`text-xs ${card.subColor} mt-2 font-semibold flex items-center gap-1`}>
                            <TrendingUp className="w-3 h-3" />
                            {card.sub}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recent Votes */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-100/50 transition-shadow duration-300">
                    <div className="flex items-center justify-between p-6 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Heart className="w-4.5 h-4.5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-burgundy-900">Recent Votes</h3>
                      </div>
                      {votes.length > 0 && (
                        <button
                          onClick={() => setActiveTab('votes')}
                          className="text-sm text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gold-50 transition-colors"
                        >
                          View All <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {votes.length === 0 ? (
                      <div className="text-center px-6 pb-8 pt-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                          <Heart className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-600 font-medium">No votes yet</p>
                        <p className="text-sm text-gray-400 mt-1">Support your favorite contestants!</p>
                        <Link
                          href="/vote"
                          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-burgundy-900 text-white rounded-full text-sm font-semibold hover:bg-burgundy-800 transition-colors"
                        >
                          Start Voting
                        </Link>
                      </div>
                    ) : (
                      <div className="px-6 pb-4 space-y-2">
                        {votes.slice(0, 5).map((v, i) => (
                          <div
                            key={v.id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-50 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                          >
                            <div className="relative">
                              <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 ring-2 ring-white shadow-sm">
                                {v.contestantImage ? (
                                  <NextImage
                                    src={v.contestantImage}
                                    alt={v.contestantName}
                                    width={44}
                                    height={44}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              {i === 0 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center shadow-sm">
                                  <span className="text-[8px] font-bold text-white">1</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-burgundy-900 truncate">
                                {v.contestantName}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {v.categoryName} · <span className="font-medium text-gray-500">{v.votesCount} vote{v.votesCount !== 1 ? 's' : ''}</span>
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {v.verified ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-full">
                                  <Clock className="w-3 h-3" /> Pending
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Tickets */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-100/50 transition-shadow duration-300">
                    <div className="flex items-center justify-between p-6 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                          <Ticket className="w-4.5 h-4.5 text-violet-600" />
                        </div>
                        <h3 className="text-lg font-bold text-burgundy-900">Recent Tickets</h3>
                      </div>
                      {tickets.length > 0 && (
                        <button
                          onClick={() => setActiveTab('tickets')}
                          className="text-sm text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gold-50 transition-colors"
                        >
                          View All <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {tickets.length === 0 ? (
                      <div className="text-center px-6 pb-8 pt-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                          <Ticket className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-600 font-medium">No tickets purchased</p>
                        <p className="text-sm text-gray-400 mt-1">Get your event tickets now!</p>
                        <Link
                          href="/ticketing"
                          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-burgundy-900 text-white rounded-full text-sm font-semibold hover:bg-burgundy-800 transition-colors"
                        >
                          Get Tickets
                        </Link>
                      </div>
                    ) : (
                      <div className="px-6 pb-4 space-y-2">
                        {tickets.slice(0, 5).map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-50 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                          >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Ticket className="w-5 h-5 text-violet-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-burgundy-900 truncate">
                                {t.ticketName}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Qty: {t.quantity} · <span className="font-medium text-gray-500">${t.totalAmount.toFixed(2)}</span>
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${
                                  t.status === 'completed'
                                    ? 'text-green-700 bg-green-50'
                                    : t.status === 'pending'
                                    ? 'text-amber-700 bg-amber-50'
                                    : 'text-red-700 bg-red-50'
                                }`}
                              >
                                {t.status === 'completed' ? (
                                  <><CheckCircle2 className="w-3 h-3" /> Confirmed</>
                                ) : t.status === 'pending' ? (
                                  <><Clock className="w-3 h-3" /> Pending</>
                                ) : (
                                  t.status
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-100/50 transition-shadow duration-300">
                  <div className="flex items-center gap-3 p-6 pb-4">
                    <div className="w-9 h-9 rounded-xl bg-burgundy-100 flex items-center justify-center">
                      <User className="w-4.5 h-4.5 text-burgundy-700" />
                    </div>
                    <h3 className="text-lg font-bold text-burgundy-900">Account Details</h3>
                  </div>
                  <div className="px-6 pb-6 grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-50">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Name</p>
                        <p className="text-sm font-bold text-burgundy-900 truncate">{account?.name || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-50">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Email</p>
                        <p className="text-sm font-bold text-burgundy-900 truncate">{account?.email || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-50">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                        <CalendarDays className="w-5 h-5 text-violet-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Member Since</p>
                        <p className="text-sm font-bold text-burgundy-900">
                          {account?.createdAt ? new Date(account.createdAt).toLocaleDateString() : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-50">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Transactions</p>
                        <p className="text-sm font-bold text-burgundy-900">{stats.totalTransactions}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Votes Tab */}
            {activeTab === 'votes' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-burgundy-900">Voting History</h3>
                      <p className="text-sm text-gray-500">
                        {votes.length} transaction{votes.length !== 1 ? 's' : ''} · <span className="font-semibold text-blue-600">{stats.totalVotesCast}</span> total votes
                      </p>
                    </div>
                  </div>
                </div>
                {votes.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
                      <Heart className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-gray-600 font-semibold text-lg">No votes yet</p>
                    <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Support your favorite contestants by casting your first vote!</p>
                    <Link
                      href="/vote"
                      className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-burgundy-900 text-white rounded-full text-sm font-semibold hover:bg-burgundy-800 transition-colors shadow-lg shadow-burgundy-900/20"
                    >
                      Start Voting
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {votes.map((v) => (
                      <div key={v.id} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50/80 to-white border border-gray-50 hover:border-gray-200 hover:shadow-md hover:shadow-gray-100/50 transition-all duration-200 group">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 ring-2 ring-white shadow-sm group-hover:ring-gold-200 transition-all">
                          {v.contestantImage ? (
                            <NextImage
                              src={v.contestantImage}
                              alt={v.contestantName}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-burgundy-900 group-hover:text-burgundy-800">{v.contestantName}</p>
                          <p className="text-sm text-gray-400 mt-0.5">
                            {v.categoryName} · <span className="text-gray-500">{v.packageName}</span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-extrabold text-burgundy-900">
                            {v.votesCount} <span className="font-medium text-gray-500">vote{v.votesCount !== 1 ? 's' : ''}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">${v.amountPaid.toFixed(2)}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {v.verified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-100">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 flex-shrink-0 hidden sm:block font-medium">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-violet-50/50 to-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-burgundy-900">Ticket Purchases</h3>
                      <p className="text-sm text-gray-500">
                        {tickets.length} purchase{tickets.length !== 1 ? 's' : ''} · <span className="font-semibold text-violet-600">{stats.confirmedTickets}</span> confirmed
                      </p>
                    </div>
                  </div>
                </div>
                {tickets.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
                      <Ticket className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-gray-600 font-semibold text-lg">No tickets purchased</p>
                    <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Get your tickets for the event and enjoy the show!</p>
                    <Link
                      href="/ticketing"
                      className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-burgundy-900 text-white rounded-full text-sm font-semibold hover:bg-burgundy-800 transition-colors shadow-lg shadow-burgundy-900/20"
                    >
                      Get Tickets
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {tickets.map((t) => (
                      <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50/80 to-white border border-gray-50 hover:border-gray-200 hover:shadow-md hover:shadow-gray-100/50 transition-all duration-200 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                          <Ticket className="w-6 h-6 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-burgundy-900 group-hover:text-burgundy-800">{t.ticketName}</p>
                          <p className="text-sm text-gray-400 mt-0.5">Qty: <span className="font-medium text-gray-500">{t.quantity}</span></p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-extrabold text-burgundy-900">${t.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              t.status === 'completed'
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : t.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-red-50 text-red-700 border-red-100'
                            }`}
                          >
                            {t.status === 'completed' ? (
                              <><CheckCircle2 className="w-3 h-3" /> Confirmed</>
                            ) : t.status === 'pending' ? (
                              <><Clock className="w-3 h-3" /> Pending</>
                            ) : (
                              t.status
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 flex-shrink-0 hidden sm:block font-medium">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-burgundy-900">Contact Messages</h3>
                      <p className="text-sm text-gray-500">Your messages to the team</p>
                    </div>
                  </div>
                </div>
                {messages.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
                      <Mail className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-gray-600 font-semibold text-lg">No messages sent</p>
                    <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Have a question? We&apos;d love to hear from you!</p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-burgundy-900 text-white rounded-full text-sm font-semibold hover:bg-burgundy-800 transition-colors shadow-lg shadow-burgundy-900/20"
                    >
                      Contact Us
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {messages.map((m) => (
                      <div key={m.id} className="p-4 rounded-xl bg-gradient-to-r from-gray-50/80 to-white border border-gray-50 hover:border-gray-200 hover:shadow-md hover:shadow-gray-100/50 transition-all duration-200 group">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                              <MessageCircle className="w-4 h-4 text-amber-500" />
                            </div>
                            <p className="font-bold text-burgundy-900 text-sm group-hover:text-burgundy-800">
                              {m.subject || 'No Subject'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2.5">
                            {m.read ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                <CheckCircle2 className="w-3 h-3" /> Read
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-semibold bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                <Clock className="w-3 h-3" /> Sent
                              </span>
                            )}
                            <span className="text-xs text-gray-400 font-medium">
                              {new Date(m.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 pl-[42px] leading-relaxed">{m.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
