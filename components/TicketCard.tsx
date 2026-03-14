'use client'

import { useState } from 'react'
import { Crown, Star, Ticket, MapPin, Calendar, BadgeCheck, Clock, QrCode, Trophy, X, ExternalLink } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { TicketEntry } from '@/types'

interface TicketCardProps {
  ticket: TicketEntry
  holderName: string
  eventName?: string
  eventDate?: string
  venue?: string
  /** Currency-aware price formatter. Falls back to `$` + `.toFixed(2)`. */
  formatPrice?: (usd: number) => string
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
  formatPrice = (v) => `$${v.toFixed(2)}`,
}: TicketCardProps) {
  const isConfirmed = ticket.status === 'confirmed'
  const isPending = ticket.status === 'pending'
  const [qrModalOpen, setQrModalOpen] = useState(false)

  // Build the validation URL — works in browser only
  const qrValue =
    typeof window !== 'undefined'
      ? `${window.location.origin}/tickets/scan?id=${ticket.id}`
      : ticket.id

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
            <Trophy className={`w-3.5 h-3.5 ${tier.accent}`} />
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
              <span className="text-xl font-black text-burgundy-900">{formatPrice(ticket.totalAmount)}</span>
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
          {isConfirmed ? (
            <button
              onClick={() => setQrModalOpen(true)}
              aria-label="Enlarge QR code"
              className="group flex flex-col items-center gap-2 focus:outline-none"
            >
              <div className="w-[72px] h-[72px] rounded-xl bg-white border-2 border-burgundy-900/20 p-1.5 shadow-md group-hover:shadow-lg group-hover:border-burgundy-900/40 transition-all">
                <QRCodeSVG
                  value={qrValue}
                  size={56}
                  fgColor="#4a0e1f"
                  bgColor="#ffffff"
                  level="M"
                />
              </div>
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider text-center leading-tight">
                Show at Entry
              </p>
              <p className="text-[8px] text-gray-300 font-mono">
                {ticket.id.slice(-8).toUpperCase()}
              </p>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-[72px] h-[72px] rounded-xl bg-gray-100 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider text-center">
                {isPending ? 'Awaiting Payment' : 'Unavailable'}
              </p>
              <p className="text-[8px] text-gray-300 font-mono">
                {ticket.id.slice(-8).toUpperCase()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile "Show QR" button — only for confirmed tickets */}
      {isConfirmed && (
        <div className="sm:hidden border-t border-dashed border-gray-200/80 mx-4 mb-3 pt-3 flex justify-center">
          <button
            onClick={() => setQrModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-burgundy-900 text-white text-xs font-semibold hover:bg-burgundy-800 transition-colors shadow-md shadow-burgundy-900/20"
          >
            <QrCode className="w-3.5 h-3.5" /> Show Entry QR Code
          </button>
        </div>
      )}

      {/* QR Modal */}
      {qrModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ticket QR Code"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setQrModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQrModalOpen(false)}
              aria-label="Close QR code"
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            <div className="text-center">
              <h3 className="text-base font-extrabold text-burgundy-900">{eventName}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{holderName} · {ticket.ticketName}</p>
            </div>

            <div className="bg-white border-2 border-burgundy-900/15 rounded-xl p-3 shadow-inner">
              <QRCodeSVG
                value={qrValue}
                size={220}
                fgColor="#4a0e1f"
                bgColor="#ffffff"
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="text-center space-y-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Present this QR at the entrance
              </p>
              <p className="text-[10px] text-gray-400 font-mono">{ticket.id.slice(-12).toUpperCase()}</p>
            </div>

            <a
              href={qrValue}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-burgundy-700 hover:text-burgundy-900 font-medium transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Open validation link
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
