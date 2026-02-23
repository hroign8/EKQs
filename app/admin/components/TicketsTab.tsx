'use client'

import { Plus, Edit, Trash2, EyeOff, Eye, Ticket, Crown, Star, DollarSign, Users, TrendingUp } from 'lucide-react'
import type { AdminTicketType } from '../types'

interface TicketsTabProps {
  ticketTypesList: AdminTicketType[]
  onAddTicket: () => void
  onEditTicket: (t: AdminTicketType) => void
  onDeleteTicket: (id: string) => void
  onToggleTicket: (id: string) => void
}

const TIER_ICONS: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  crown: { icon: <Crown className="w-4 h-4" />, bg: 'bg-gold-100', text: 'text-gold-600' },
  star: { icon: <Star className="w-4 h-4" />, bg: 'bg-violet-100', text: 'text-violet-600' },
  ticket: { icon: <Ticket className="w-4 h-4" />, bg: 'bg-sky-100', text: 'text-sky-600' },
}

export default function TicketsTab({
  ticketTypesList,
  onAddTicket,
  onEditTicket,
  onDeleteTicket,
  onToggleTicket,
}: TicketsTabProps) {
  const activeTickets = ticketTypesList.filter(t => t.isActive)
  const totalPurchases = ticketTypesList.reduce((s, t) => s + t.purchaseCount, 0)
  const totalRevenue = ticketTypesList.reduce((s, t) => s + t.price * t.purchaseCount, 0)

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-burgundy-900 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <Ticket className="w-5 h-5 text-gold-500" />
            <span>Event Tickets</span>
          </h2>
          <p className="text-xs sm:text-sm text-burgundy-200 mt-0.5 sm:mt-1">Manage ticket types available for purchase</p>
        </div>
        <button
          onClick={onAddTicket}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 text-burgundy-900 rounded-full font-semibold text-sm hover:bg-gold-400 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Ticket</span>
        </button>
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
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-burgundy-900">
                {activeTickets.length > 0
                  ? `$${Math.min(...activeTickets.map(t => t.price)).toFixed(0)} – $${Math.max(...activeTickets.map(t => t.price)).toFixed(0)}`
                  : '—'}
              </div>
              <div className="text-xs text-gray-500 font-medium">Price Range</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
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
  )
}
