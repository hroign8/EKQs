'use client'

import { Crown, Star, Ticket, MapPin, Calendar, BadgeCheck, Clock, QrCode, Sparkles } from 'lucide-react'
import type { TicketEntry } from '@/types'

interface TicketCardProps {
  ticket: TicketEntry
  holderName: string
  eventName?: string
  eventDate?: string
  venue?: string
}

/**
 * A premium visual ticket card displayed on the user dashboard.
 * Features tier-specific branding, large ticket name, and QR stub.
 */
export default function TicketCard({
  ticket,
  holderName,
  eventName = 'EKQs Pageant',
  eventDate,
  venue = 'Grand Hub, Kampala',
}: TicketCardProps) {
  const isConfirmed = ticket.status === 'confirmed'
  const isPending = ticket.status === 'pending'

  // Tier-based styling
  const tierConfig: Record<string, {
    bg: string; headerBg: string; accent: string; icon: React.ReactNode
    glow: string; border: string; nameBg: string
  }> = {
    Table: {
      bg: 'bg-gradient-to-br from-amber-50 via-yellow-50/80 to-orange-50',
      headerBg: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600',
      accent: 'text-amber-700',
      icon: <Crown className="w-5 h-5" />,
      glow: 'shadow-amber-200/50',
      border: 'border-amber-200/60',
      nameBg: 'bg-amber-100 text-amber-800',
    },
    VIP: {
      bg: 'bg-gradient-to-br from-violet-50 via-purple-50/80 to-fuchsia-50',
      headerBg: 'bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600',
      accent: 'text-violet-700',
      icon: <Star className="w-5 h-5" />,
      glow: 'shadow-violet-200/50',
      border: 'border-violet-200/60',
      nameBg: 'bg-violet-100 text-violet-800',
    },
    General: {
      bg: 'bg-gradient-to-br from-sky-50 via-blue-50/80 to-cyan-50',
      headerBg: 'bg-gradient-to-r from-sky-600 via-blue-500 to-sky-600',
      accent: 'text-sky-700',
      icon: <Ticket className="w-5 h-5" />,
      glow: 'shadow-sky-200/50',
      border: 'border-sky-200/60',
      nameBg: 'bg-sky-100 text-sky-800',
    },
  }

  const tier = tierConfig[ticket.ticketName] || tierConfig.General

  return (
    <div className={`relative rounded-2xl overflow-hidden border ${tier.border} ${tier.bg} shadow-md ${tier.glow} hover:shadow-lg transition-all duration-300 group`}>
      {/* ── Colored header band with ticket name ────────────── */}
      <div className={`${tier.headerBg} px-4 sm:px-5 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner">
            {tier.icon}
          </div>
          <div>
            <h3 className="text-white font-extrabold text-lg sm:text-xl leading-tight tracking-tight">
              {ticket.ticketName}
            </h3>
            <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Admission Ticket</p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${
            isConfirmed
              ? 'bg-white/25 text-white'
              : isPending
              ? 'bg-yellow-400/30 text-yellow-100'
              : 'bg-red-400/30 text-red-100'
          }`}
        >
          {isConfirmed ? <><BadgeCheck className="w-3.5 h-3.5" /> CONFIRMED</> :
           isPending ? <><Clock className="w-3.5 h-3.5" /> PENDING</> :
           ticket.status.toUpperCase()}
        </span>
      </div>

      <div className="flex">
        {/* ── Main ticket body ─────────────────────────────── */}
        <div className="flex-1 px-4 sm:px-5 py-4">
          {/* Event name */}
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className={`w-3.5 h-3.5 ${tier.accent}`} />
            <p className="text-sm font-bold text-burgundy-900">{eventName}</p>
          </div>

          {/* Ticket details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2.5">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Attendee</p>
              <p className="text-xs font-bold text-gray-800 mt-0.5 truncate">{holderName}</p>
            </div>
            {eventDate && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" /> Date
                </p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">{eventDate}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> Venue
              </p>
              <p className="text-xs font-bold text-gray-800 mt-0.5">{venue}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Qty</p>
              <p className="text-xs font-bold text-gray-800 mt-0.5">
                {ticket.quantity} {ticket.quantity === 1 ? 'person' : 'people'}
              </p>
            </div>
          </div>

          {/* Bottom: price + date bought */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-gray-200/80">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-burgundy-900">${ticket.totalAmount.toFixed(2)}</span>
              <span className={`text-[10px] font-bold uppercase ml-1 px-1.5 py-0.5 rounded ${tier.nameBg}`}>
                {ticket.ticketName}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">
              {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* ── Perforated divider + QR stub ─────────────────── */}
        <div className="relative hidden sm:flex flex-col items-center">
          {/* Top notch */}
          <div className="absolute -top-1 w-6 h-6 rounded-full bg-gray-50 border border-gray-200 -translate-x-1/2 left-1/2 z-10" />
          {/* Dashed line */}
          <div className="w-px h-full border-l-2 border-dashed border-gray-300/50" />
          {/* Bottom notch */}
          <div className="absolute -bottom-1 w-6 h-6 rounded-full bg-gray-50 border border-gray-200 -translate-x-1/2 left-1/2 z-10" />
        </div>

        {/* QR Code stub */}
        <div className="hidden sm:flex w-28 flex-col items-center justify-center p-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-colors ${
            isConfirmed
              ? 'bg-burgundy-900 shadow-lg shadow-burgundy-900/20'
              : 'bg-gray-200'
          }`}>
            <QrCode className={`w-10 h-10 ${isConfirmed ? 'text-gold-500' : 'text-gray-400'}`} />
          </div>
          <p className="text-[9px] text-gray-400 font-semibold mt-2 text-center uppercase tracking-wider">
            {isConfirmed ? 'Show at Entry' : 'Awaiting Payment'}
          </p>
          <p className="text-[8px] text-gray-300 font-mono mt-0.5">
            {ticket.id.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  )
}
