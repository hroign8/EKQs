'use client'

import { Crown } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-burgundy-900 py-8 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gold-500"></div>
            <Crown className="w-6 h-6 text-gold-500" />
            <div className="h-px w-12 bg-gold-500"></div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">Results</h1>
          <p className="text-burgundy-200 text-base sm:text-lg max-w-xl mx-auto">View the current standings and results</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-10 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-gold-500" />
          </div>
          <h2 className="text-2xl font-bold text-burgundy-900 mb-3">Admin Dashboard</h2>
          <p className="text-gray-600 mb-8">
            Detailed results and analytics are available in the Admin Dashboard.
          </p>
          <Link 
            href="/admin" 
            className="inline-block bg-gold-500 text-burgundy-900 px-8 py-3 rounded-full font-semibold hover:bg-gold-400 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
