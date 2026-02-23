'use client'

import { Crown, Star, Ticket, MapPin, Calendar, CheckCircle2, Clock, QrCode } from 'lucide-react'
import type { TicketEntry } from '@/types'

interface TicketCardProps {
  ticket: TicketEntry
  holderName: string
  eventName?: string
  eventDate?: string
  venue?: string
}

/**
 * A visual ticket card displayed on the user dashboard.
 * Looks like a real admission ticket with perforated edge, event info, and QR stub.
 */
export default function TicketCard({
  ticket,
  holderName,
  eventName = 'EKQs Pageant',
  eventDate,
  venue = 'Grand Hub, Kampala',
}: TicketCardProps) {
  const isConfirmed = ticket.status === 'completed'
  const isPending = ticket.status === 'pending'

  // Tier-based styling
  const tierConfig: Record<string, { gradient: string; accent: string; iconBg: string; icon: React.ReactNode; badge: string }> = {
    Table: {
      gradient: 'from-amber-50 via-yellow-50 to-amber-50',
      accent: 'text-amber-700',
      iconBg: 'bg-gradient-to-br from-gold-500 to-amber-500',
      icon: <Crown className="w-5 h-5 text-white" />,
      badge: 'bg-gold-500 text-burgundy-900',
    },
    VIP: {
      gradient: 'from-violet-50 via-purple-50 to-violet-50',
      accent: 'text-violet-700',
      iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
      icon: <Star className="w-5 h-5 text-white" />,
      badge: 'bg-violet-500 text-white',
    },
    General: {
      gradient: 'from-sky-50 via-blue-50 to-sky-50',
      accent: 'text-sky-700',
      iconBg: 'bg-gradient-to-br from-sky-500 to-blue-500',
      icon: <Ticket className="w-5 h-5 text-white" />,
      badge: 'bg-sky-500 text-white',
    },
  }

  const tier = tierConfig[ticket.ticketName] || tierConfig.General

  return (
    <div className="relative group">
      {/* Outer ticket shape with notches */}
      <div className={`relative rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-r ${tier.gradient} shadow-sm hover:shadow-lg transition-shadow duration-300`}>
        {/* Top decorative band */}
        <div className="h-2 bg-gradient-to-r from-burgundy-900 via-burgundy-800 to-burgundy-900" />

        <div className="flex">
          {/* ── Main ticket body ─────────────────────────────── */}
          <div className="flex-1 p-4 sm:p-5">
            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl ${tier.iconBg} flex items-center justify-center shadow-md`}>
                  {tier.icon}
                </div>
                <div>
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${tier.badge}`}>
                    {ticket.ticketName}
                  </span>
                  <p className="text-sm font-bold text-burgundy-900 mt-0.5">{eventName}</p>
                </div>
              </div>
              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                  isConfirmed
                    ? 'bg-green-100 text-green-700'
                    : isPending
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {isConfirmed ? <><CheckCircle2 className="w-3 h-3" /> CONFIRMED</> :
                 isPending ? <><Clock className="w-3 h-3" /> PENDING</> :
                 ticket.status.toUpperCase()}
              </span>
            </div>

            {/* Ticket details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Attendee</p>
                <p className="text-xs font-bold text-burgundy-900 mt-0.5 truncate">{holderName}</p>
              </div>
              {eventDate && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" /> Date
                  </p>
                  <p className="text-xs font-bold text-burgundy-900 mt-0.5">{eventDate}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" /> Venue
                </p>
                <p className="text-xs font-bold text-burgundy-900 mt-0.5">{venue}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Qty</p>
                <p className="text-xs font-bold text-burgundy-900 mt-0.5">
                  {ticket.quantity} {ticket.quantity === 1 ? 'person' : 'people'}
                </p>
              </div>
            </div>

            {/* Bottom: price + date bought */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-gray-200">
              <p className="text-lg font-black text-burgundy-900">${ticket.totalAmount.toFixed(2)}</p>
              <p className="text-[10px] text-gray-400 font-medium">
                Purchased {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* ── Perforated divider + QR stub ─────────────────── */}
          <div className="relative hidden sm:flex flex-col items-center">
            {/* Top notch */}
            <div className="absolute -top-1 w-5 h-5 rounded-full bg-gray-50 border border-gray-200 -translate-x-1/2 left-1/2 z-10" />
            {/* Dashed line */}
            <div className="w-px h-full border-l-2 border-dashed border-gray-200" />
            {/* Bottom notch */}
            <div className="absolute -bottom-1 w-5 h-5 rounded-full bg-gray-50 border border-gray-200 -translate-x-1/2 left-1/2 z-10" />
          </div>

          {/* QR Code stub */}
          <div className="hidden sm:flex w-28 flex-col items-center justify-center p-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${isConfirmed ? 'bg-burgundy-900' : 'bg-gray-200'}`}>
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

        {/* Bottom decorative band */}
        <div className="h-1.5 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500" />
      </div>
    </div>
  )
}
