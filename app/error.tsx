'use client'

import { useEffect } from 'react'
import { Crown } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-burgundy-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Crown className="w-8 h-8 text-burgundy-900" />
        </div>
        <h2 className="text-2xl font-bold text-burgundy-900 mb-3">Something went wrong</h2>
        <p className="text-gray-600 mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-gold-500 hover:bg-gold-400 text-burgundy-900 px-8 py-3 rounded-full font-bold transition-colors"
        >
          Try Again
        </button>
      </div>
    </main>
  )
}
