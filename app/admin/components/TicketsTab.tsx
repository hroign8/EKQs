'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, EyeOff, Eye, Ticket, Crown, Star, DollarSign, Users, TrendingUp, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react'
import type { AdminTicketType, TicketPurchaseEntry } from '../types'

interface TicketsTabProps {
  ticketTypesList: AdminTicketType[]
  ticketPurchasesList: TicketPurchaseEntry[]
  onAddTicket: () => void
  onEditTicket: (t: AdminTicketType) => void
  onDeleteTicket: (id: string) => void
  onToggleTicket: (id: string) => void
  onVerifyPendingTickets: () => Promise<void>
}

const TIER_ICONS: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  crown: { icon: <Crown className="w-4 h-4" />, bg: 'bg-gold-100', text: 'text-gold-600' },
  star: { icon: <Star className="w-4 h-4" />, bg: 'bg-violet-100', text: 'text-violet-600' },
  ticket: { icon: <Ticket className="w-4 h-4" />, bg: 'bg-sky-100', text: 'text-sky-600' },
}

const STATUS_BADGES: Record<string, { bg: string; text: string; Icon: typeof CheckCircle }> = {
  confirmed: { bg: 'bg-green-50', text: 'text-green-700', Icon: CheckCircle },
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', Icon: Clock },
  failed: { bg: 'bg-red-50', text: 'text-red-700', Icon: XCircle },
}

export default function TicketsTab({
  ticketTypesList,
  ticketPurchasesList,
  onAddTicket,
  onEditTicket,
  onDeleteTicket,
  onToggleTicket,
  onVerifyPendingTickets,
}: TicketsTabProps) {
  const [verifying, setVerifying] = useState(false)
  const [view, setView] = useState<'types' | 'purchases'>('types')

  const activeTickets = ticketTypesList.filter(t => t.isActive)
  const totalPurchases = ticketTypesList.reduce((s, t) => s + t.purchaseCount, 0)
  const totalRevenue = ticketTypesList.reduce((s, t) => s + t.price * t.purchaseCount, 0)
  const pendingCount = ticketPurchasesList.filter(p => p.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="bg-burgundy-900 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Ticket className="w-5 h-5 text-gold-500" />
              <span>Event Tickets</span>
            </h2>
            <p className="text-xs sm:text-sm text-burgundy-200 mt-0.5 sm:mt-1">Manage ticket types and purchases</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {pendingCount > 0 && (
              <button
                onClick={async () => {
                  setVerifying(true)
                  try { await onVerifyPendingTickets() } finally { setVerifying(false) }
                }}
                disabled={verifying}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-full font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
                <span>{verifying ? 'Checking...' : `Verify Pending (${pendingCount})`}</span>
              </button>
            )}
            <button
              onClick={onAddTicket}
              className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 text-burgundy-900 rounded-full font-semibold text-sm hover:bg-gold-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ticket</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
          <div className="bg-white rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Ticket className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-burgundy-900">{activeTickets.length}/{ticketTypesList.length}</div>
                <div className="text-xs text-gray-500 font-medium">Active Types</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-burgundy-900">{totalPurchases}</div>
                <div className="text-xs text-gray-500 font-medium">Total Purchases</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-burgundy-900">${totalRevenue.toFixed(0)}</div>
                <div className="text-xs text-gray-500 font-medium">Ticket Revenue</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-burgundy-900">{pendingCount}</div>
                <div className="text-xs text-gray-500 font-medium">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-2xl p-1.5">
        <div className="flex gap-1">
          <button
            onClick={() => setView('types')}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              view === 'types' ? 'bg-burgundy-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Ticket Types ({ticketTypesList.length})
          </button>
          <button
            onClick={() => setView('purchases')}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              view === 'purchases' ? 'bg-burgundy-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Purchases ({ticketPurchasesList.length})
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-400 text-[10px] font-bold text-yellow-900">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Ticket Types Table */}
      {view === 'types' && (
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {ticketTypesList.length === 0 ? (
              <div className="p-12 text-center">
                <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No ticket types yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Features</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Purchases</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ticketTypesList.map((t) => {
                    const tier = TIER_ICONS[t.icon] || TIER_ICONS.ticket
                    return (
                      <tr key={t.id} className={`hover:bg-gray-50/50 transition-colors ${!t.isActive ? 'opacity-50' : ''}`}>
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg ${tier.bg} flex items-center justify-center flex-shrink-0`}>
                              <span className={tier.text}>{tier.icon}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900">{t.name}</span>
                              {t.popular && (
                                <span className="ml-2 text-[10px] font-bold bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full">POPULAR</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className="font-bold text-gold-600">${t.price.toFixed(2)}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 hidden sm:table-cell">
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {t.features.length > 0 ? t.features.join(' · ') : '—'}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className="font-bold text-burgundy-900">{t.purchaseCount}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            t.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {t.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onToggleTicket(t.id)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                              title={t.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {t.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => onEditTicket(t)}
                              className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteTicket(t.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Ticket Purchases Table */}
      {view === 'purchases' && (
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {ticketPurchasesList.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No ticket purchases yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ticketPurchasesList.map((p) => {
                    const badge = STATUS_BADGES[p.status] || STATUS_BADGES.pending
                    const BadgeIcon = badge.Icon
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 sm:px-6 py-3">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{p.userName}</div>
                            <div className="text-xs text-gray-400">{p.userEmail}</div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className="font-medium text-gray-700">{p.ticketType}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className="font-bold text-burgundy-900">{p.quantity}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className="font-bold text-gold-600">${p.totalAmount.toFixed(2)}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                            <BadgeIcon className="w-3 h-3" />
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                          <span className="text-xs text-gray-500">
                            {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
