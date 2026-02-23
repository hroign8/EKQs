'use client'

import { useState, useEffect, useReducer, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Check, ChevronLeft, Crown, Heart, Loader2, LogIn } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { useCurrency } from '@/lib/hooks'
import type { Contestant, VotingCategory, VotingPackage } from '@/types'
import Link from 'next/link'

type Step = 'package' | 'category' | 'confirm' | 'success'

interface VotingModalProps {
  contestant: Contestant | null
  onClose: () => void
  onSuccess?: () => void
}

// ── Step-machine reducer ────────────────────────────────────────────────────

export interface ModalState {
  step: Step
  selectedPackage: VotingPackage | null
  selectedCategory: VotingCategory | null
}

export type ModalAction =
  | { type: 'SELECT_PACKAGE'; payload: VotingPackage }
  | { type: 'SELECT_CATEGORY'; payload: VotingCategory }
  | { type: 'CONFIRM_PACKAGE' }
  | { type: 'CONFIRM_CATEGORY' }
  | { type: 'BACK_TO_PACKAGE' }
  | { type: 'BACK_TO_CATEGORY' }
  | { type: 'SUCCESS' }
  | { type: 'RESET' }

export const initialModalState: ModalState = {
  step: 'package',
  selectedPackage: null,
  selectedCategory: null,
}

export function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'SELECT_PACKAGE':
      return { ...state, selectedPackage: action.payload }
    case 'SELECT_CATEGORY':
      return { ...state, selectedCategory: action.payload }
    case 'CONFIRM_PACKAGE':
      return state.selectedPackage ? { ...state, step: 'category' } : state
    case 'CONFIRM_CATEGORY':
      return state.selectedCategory ? { ...state, step: 'confirm' } : state
    case 'BACK_TO_PACKAGE':
      return { ...state, step: 'package' }
    case 'BACK_TO_CATEGORY':
      return { ...state, step: 'category' }
    case 'SUCCESS':
      return { ...state, step: 'success' }
    case 'RESET':
      return initialModalState
    default:
      return state
  }
}

// ── Focus trap helpers ──────────────────────────────────────────────────────

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function VotingModal({ contestant, onClose, onSuccess }: VotingModalProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { currency, formatPrice } = useCurrency()
  const [modalState, dispatch] = useReducer(modalReducer, initialModalState)
  const { step, selectedPackage, selectedCategory } = modalState

  const [packages, setPackages] = useState<VotingPackage[]>([])
  const [categories, setCategories] = useState<VotingCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // ── Focus trap ─────────────────────────────────────────────────────────────
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement

    const frame = requestAnimationFrame(() => {
      const first = modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)?.[0]
      first?.focus()
    })

    return () => {
      cancelAnimationFrame(frame)
      previousFocusRef.current?.focus()
    }
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key !== 'Tab') return

    const focusable = Array.from(
      modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS) ?? []
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [onClose])

  useEffect(() => {
    const init = async () => {
      try {
        const [pkgRes, catRes] = await Promise.all([
          fetch('/api/packages'),
          fetch('/api/categories'),
        ])
        
        if (pkgRes.ok) {
          const pkgData = await pkgRes.json()
          setPackages(pkgData)
        }
        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(catData)
          if (catData.length > 0) dispatch({ type: 'SELECT_CATEGORY', payload: catData[0] })
        }
      } catch {
        setError('Failed to load voting data')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleSubmitVote = async () => {
    if (!selectedPackage || !selectedCategory || !contestant) return
    
    if (!session?.user) {
      router.push('/signin')
      onClose()
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestantId: contestant.id,
          categoryId: selectedCategory.id,
          packageId: selectedPackage.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit vote')
        setSubmitting(false)
        return
      }

      if (data.free) {
        onSuccess?.()
        dispatch({ type: 'SUCCESS' })
        setSubmitting(false)
        return
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
        return
      }

      dispatch({ type: 'SUCCESS' })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!session?.user && step === 'confirm') {
    return (
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="voting-modal-signin-title"
        onKeyDown={handleKeyDown}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <div className="bg-white rounded-2xl w-full max-w-md relative overflow-hidden">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="bg-burgundy-900 px-6 py-8 text-center">
            <LogIn className="w-12 h-12 text-gold-500 mx-auto mb-4" />
            <h2 id="voting-modal-signin-title" className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-burgundy-200">You need to be signed in to vote</p>
          </div>
          <div className="p-6 text-center">
            <Link
              href="/signin"
              onClick={onClose}
              className="block w-full bg-gold-500 text-burgundy-900 py-4 rounded-full font-bold hover:bg-gold-400 transition-all mb-3"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={onClose}
              className="block w-full py-3 bg-gray-50 rounded-full font-semibold text-gray-700 hover:bg-gray-100 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="voting-modal-title"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-4xl relative overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading voting packages...</p>
          </div>
        ) : (
          <>
            {step === 'package' && (
              <div>
                <div className="bg-burgundy-900 px-6 py-8 text-center">
                  <div className="inline-flex items-center gap-3 mb-3">
                    <div className="h-px w-8 bg-gold-500"></div>
                    <Crown className="w-5 h-5 text-gold-500" />
                    <div className="h-px w-8 bg-gold-500"></div>
                  </div>
                  <h2 id="voting-modal-title" className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Vote for {contestant?.name || 'Contestant'}
                  </h2>
                  <p className="text-burgundy-200">Select a voting package to support your favorite</p>
                  {currency.code !== 'USD' && (
                    <p className="text-sm text-burgundy-300 mt-2">Prices shown in {currency.code}</p>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-6">
                    {packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => dispatch({ type: 'SELECT_PACKAGE', payload: pkg })}
                        aria-pressed={selectedPackage?.id === pkg.id}
                        className={`relative rounded-xl sm:rounded-2xl transition-all p-3 sm:p-4 ${
                          selectedPackage?.id === pkg.id
                            ? 'bg-gold-50 ring-2 ring-gold-500'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {selectedPackage?.id === pkg.id && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-gold-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-burgundy-900" />
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-[9px] sm:text-[10px] font-bold mb-0.5 sm:mb-1 text-gray-400 tracking-wide truncate">{pkg.name}</div>
                          <div className="text-2xl sm:text-3xl md:text-4xl font-black text-burgundy-900 mb-0.5">{pkg.votes}</div>
                          <div className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2">{pkg.votes === 1 ? 'Vote' : 'Votes'}</div>
                          <div className={`text-xs sm:text-sm font-bold ${selectedPackage?.id === pkg.id ? 'text-gold-600' : 'text-gold-500'}`}>
                            {formatPrice(pkg.price)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedPackage && (
                    <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-burgundy-900" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm text-gray-500">Selected Package</div>
                          <div className="font-bold text-burgundy-900 text-sm sm:text-base truncate">
                            {selectedPackage.name} - {selectedPackage.votes} {selectedPackage.votes === 1 ? 'Vote' : 'Votes'}
                          </div>
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-gold-500 flex-shrink-0">{formatPrice(selectedPackage.price)}</div>
                    </div>
                  )}

                  <button
                    onClick={() => dispatch({ type: 'CONFIRM_PACKAGE' })}
                    disabled={!selectedPackage}
                    className="w-full bg-gold-500 text-burgundy-900 py-4 rounded-full font-bold hover:bg-gold-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {selectedPackage 
                      ? `Continue with ${selectedPackage.votes} ${selectedPackage.votes === 1 ? 'Vote' : 'Votes'}`
                      : 'Select a Package'}
                  </button>
                </div>
              </div>
            )}

            {step === 'category' && (
              <div>
                <div className="bg-burgundy-900 px-6 py-8 text-center">
                  <div className="inline-flex items-center gap-3 mb-3">
                    <div className="h-px w-8 bg-gold-500"></div>
                    <Crown className="w-5 h-5 text-gold-500" />
                    <div className="h-px w-8 bg-gold-500"></div>
                  </div>
                  <h2 id="voting-modal-title" className="text-2xl sm:text-3xl font-bold text-white mb-2">Choose Category</h2>
                  <p className="text-burgundy-200">Select which category to vote in</p>
                </div>

                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => dispatch({ type: 'SELECT_CATEGORY', payload: cat })}
                        aria-pressed={selectedCategory?.id === cat.id}
                        className={`w-full text-left rounded-2xl transition-all p-4 flex items-center justify-between ${
                          selectedCategory?.id === cat.id
                            ? 'bg-gold-50 ring-2 ring-gold-500'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <span className="font-semibold text-burgundy-900">{cat.name}</span>
                        {selectedCategory?.id === cat.id && (
                          <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-burgundy-900" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => dispatch({ type: 'CONFIRM_CATEGORY' })}
                    disabled={!selectedCategory}
                    className="w-full bg-gold-500 text-burgundy-900 py-4 rounded-full font-bold hover:bg-gold-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>

                  <button
                    onClick={() => dispatch({ type: 'BACK_TO_PACKAGE' })}
                    className="w-full mt-4 text-sm text-gray-500 hover:text-burgundy-900 transition-colors inline-flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Change package
                  </button>
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div>
                <div className="bg-burgundy-900 px-6 py-8 text-center">
                  <div className="inline-flex items-center gap-3 mb-3">
                    <div className="h-px w-8 bg-gold-500"></div>
                    <Heart className="w-5 h-5 text-gold-500" />
                    <div className="h-px w-8 bg-gold-500"></div>
                  </div>
                  <h2 id="voting-modal-title" className="text-2xl sm:text-3xl font-bold text-white mb-2">Confirm Vote</h2>
                  <p className="text-burgundy-200">Review your selection before proceeding</p>
                </div>

                <div className="p-6">
                  <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Contestant</span>
                      <span className="font-bold text-burgundy-900">{contestant?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Category</span>
                      <span className="font-bold text-burgundy-900">{selectedCategory?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Package</span>
                      <span className="font-bold text-burgundy-900">{selectedPackage?.name} ({selectedPackage?.votes} votes)</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                      <span className="text-gray-500 font-semibold">Total</span>
                      <span className="text-2xl font-black text-gold-500">{formatPrice(selectedPackage?.price || 0)}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mb-4">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSubmitVote}
                    disabled={submitting}
                    className="w-full bg-gold-500 text-burgundy-900 py-4 rounded-full font-bold hover:bg-gold-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : selectedPackage?.price === 0 ? (
                      'Cast Free Vote'
                    ) : (
                      `Pay ${formatPrice(selectedPackage?.price || 0)} & Vote`
                    )}
                  </button>

                  <button
                    onClick={() => dispatch({ type: 'BACK_TO_CATEGORY' })}
                    className="w-full mt-4 text-sm text-gray-500 hover:text-burgundy-900 transition-colors inline-flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Change category
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div>
                <div className="bg-burgundy-900 px-6 py-8 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                  </div>
                  <h2 id="voting-modal-title" className="text-2xl sm:text-3xl font-bold text-white mb-2">Vote Cast Successfully!</h2>
                  <p className="text-burgundy-200">Thank you for supporting {contestant?.name}!</p>
                </div>

                <div className="p-6 text-center">
                  <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                    <div className="text-sm text-gray-500 mb-2">You cast</div>
                    <div className="text-4xl font-black text-burgundy-900 mb-1">
                      {selectedPackage?.votes} {selectedPackage?.votes === 1 ? 'Vote' : 'Votes'}
                    </div>
                    <div className="text-gold-500 font-semibold">{selectedPackage?.name} Package</div>
                  </div>

                  <button
                    onClick={() => { onSuccess?.(); onClose() }}
                    className="w-full bg-gold-500 text-burgundy-900 py-4 rounded-full font-bold hover:bg-gold-400 transition-all"
                  >
                    Continue Voting
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
