'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Ticket,
  User,
  Mail,
  CalendarDays,
  Hash,
  Loader2,
  ScanLine,
  ArrowLeft,
  BadgeCheck,
} from 'lucide-react'

interface ValidatedTicket {
  id: string
  status: 'pending' | 'confirmed' | 'failed'
  ticketName: string
  quantity: number
  totalAmount: number
  holderName: string
  holderEmail: string
  purchasedAt: string
  transactionId: string | null
}

function ScanResult() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<ValidatedTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const id = searchParams.get('id')

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!id) {
        if (!cancelled) {
          setError('No ticket ID provided. Please scan a valid ticket QR code.')
          setLoading(false)
        }
        return
      }

      try {
        const res = await fetch(`/api/tickets/validate?id=${encodeURIComponent(id)}`)
        const data = await res.json()
        if (!cancelled) {
          if (!res.ok) {
            setError(data.error || 'Failed to validate ticket.')
          } else {
            setTicket(data)
          }
        }
      } catch {
        if (!cancelled) setError('Network error. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => { cancelled = true }
  }, [id])

  if (loading && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-burgundy-900 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Validating ticket...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-100 shadow-lg overflow-hidden">
          <div className="bg-red-600 px-6 py-8 text-center">
            <XCircle className="w-16 h-16 text-white mx-auto mb-3" />
            <h1 className="text-2xl font-extrabold text-white">Invalid Ticket</h1>
          </div>
          <div className="px-6 py-6 text-center">
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-burgundy-900 text-white rounded-full text-sm font-semibold hover:bg-burgundy-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!ticket) return null

  const isConfirmed = ticket.status === 'confirmed'
  const isPending = ticket.status === 'pending'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Status Header */}
        <div
          className={`px-6 py-8 text-center ${
            isConfirmed ? 'bg-green-600' : isPending ? 'bg-amber-500' : 'bg-red-600'
          }`}
        >
          {isConfirmed ? (
            <CheckCircle2 className="w-20 h-20 text-white mx-auto mb-3 drop-shadow-lg" />
          ) : isPending ? (
            <Clock className="w-20 h-20 text-white mx-auto mb-3 drop-shadow-lg" />
          ) : (
            <XCircle className="w-20 h-20 text-white mx-auto mb-3 drop-shadow-lg" />
          )}
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isConfirmed ? 'VALID' : isPending ? 'PENDING' : 'INVALID'}
          </h1>
          <p className="text-white/80 text-sm font-medium mt-1">
            {isConfirmed
              ? 'This ticket is confirmed — allow entry'
              : isPending
              ? 'Payment not yet confirmed — deny entry'
              : 'Ticket is not valid — deny entry'}
          </p>
        </div>

        {/* Ticket Details */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Ticket className="w-4.5 h-4.5 text-violet-600" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Ticket Type</p>
              <p className="text-sm font-bold text-gray-900">
                {ticket.ticketName} · {ticket.quantity} {ticket.quantity === 1 ? 'person' : 'people'}
              </p>
            </div>
            {isConfirmed && (
              <BadgeCheck className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Ticket Holder</p>
              <p className="text-sm font-bold text-gray-900">{ticket.holderName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Email</p>
              <p className="text-sm font-bold text-gray-900 truncate">{ticket.holderEmail}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Purchased</p>
                <p className="text-xs font-bold text-gray-900">
                  {new Date(ticket.purchasedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                <Hash className="w-4.5 h-4.5 text-pink-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Ticket ID</p>
                <p className="text-xs font-bold text-gray-900 font-mono">{ticket.id.slice(-8).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <a
            href="/tickets/scan"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-burgundy-900 text-white rounded-full text-sm font-semibold hover:bg-burgundy-800 transition-colors"
          >
            <ScanLine className="w-4 h-4" /> Scan Another
          </a>
        </div>
      </div>
    </div>
  )
}

export default function TicketScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-burgundy-900" />
        </div>
      }
    >
      <ScanResult />
    </Suspense>
  )
}
