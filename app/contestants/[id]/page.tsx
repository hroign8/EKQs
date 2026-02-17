'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Heart, ChevronLeft, Crown, Award, Camera, Star } from 'lucide-react'
import Link from 'next/link'
import VotingModal from '@/components/VotingModal'
import type { Contestant } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ContestantDetailsPage() {
  const params = useParams()
  const [contestant, setContestant] = useState<Contestant | null>(null)
  const [loading, setLoading] = useState(true)
  const [showVotingModal, setShowVotingModal] = useState(false)

  useEffect(() => {
    const fetchContestant = async () => {
      try {
        const res = await fetch(`/api/contestants/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setContestant(data)
        }
      } catch {
        // Error handled by null contestant below
      } finally {
        setLoading(false)
      }
    }
    fetchContestant()
  }, [params.id])

  if (loading) {
    return <LoadingSpinner message="Loading contestant..." />
  }

  if (!contestant) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-burgundy-900 mb-4">Contestant Not Found</h1>
          <Link href="/contestants" className="text-burgundy-900 hover:text-gold-500 font-semibold inline-flex items-center gap-1">
            <ChevronLeft className="w-5 h-5" /> Back to Contestants
          </Link>
        </div>
      </main>
    )
  }

  const votes = contestant.votes as Record<string, number>
  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)
  const contestantRank = contestant.rank || 0

  const voteCategories = [
    { key: 'peoplesChoice', name: "People's Choice", icon: Heart, votes: votes.peoplesChoice || 0 },
    { key: 'bestTalent', name: 'Best Talent', icon: Award, votes: votes.bestTalent || 0 },
    { key: 'bestEveningWear', name: 'Best Evening Wear', icon: Crown, votes: votes.bestEveningWear || 0 },
    { key: 'missPhotogenic', name: 'Miss Photogenic', icon: Camera, votes: votes.missPhotogenic || 0 },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-burgundy-900 py-6">
        <div className="container mx-auto px-4">
          <Link 
            href="/contestants" 
            className="inline-flex items-center gap-1 text-burgundy-200 hover:text-gold-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Contestants
          </Link>
        </div>
      </div>

      {/* Contestant Details */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
            {/* Image - 2 columns */}
            <div className="md:col-span-2">
              <div className="sticky top-20">
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] max-h-[60vh] md:max-h-none">
                  <Image 
                    src={contestant.image || '/uploads/contestants/placeholder.svg'}
                    alt={contestant.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    priority
                  />
                  {contestant.rank && contestant.rank <= 3 && (
                    <div className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white ${
                      contestant.rank === 1 ? 'bg-gold-500' : contestant.rank === 2 ? 'bg-gray-400' : 'bg-amber-600'
                    }`}>
                      {contestant.rank}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info - 3 columns */}
            <div className="md:col-span-3 space-y-6">
              {/* Name & Badge */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-semibold text-burgundy-600 bg-burgundy-100 px-3 py-1 rounded-full">
                    {contestant.gender === 'Male' ? 'King' : 'Queen'} Contestant
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-burgundy-900 mb-3 sm:mb-4">{contestant.name}</h1>
                <p className="text-gray-600 leading-relaxed">
                  {contestant.description}
                </p>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-burgundy-900">{totalVotes.toLocaleString()}</div>
                  <p className="text-gray-500 text-xs sm:text-sm">Total Votes</p>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-burgundy-900">#{contestant.rank || contestantRank}</div>
                  <p className="text-gray-500 text-xs sm:text-sm">Current Rank</p>
                </div>
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-burgundy-900">4</div>
                  <p className="text-gray-500 text-xs sm:text-sm">Categories</p>
                </div>
              </div>

              {/* Vote Categories */}
              <div className="bg-white rounded-2xl p-4 sm:p-6">
                <h3 className="font-bold text-burgundy-900 mb-4">Votes by Category</h3>
                <div className="space-y-4">
                  {voteCategories.map((category) => {
                    const percentage = Math.round((category.votes / totalVotes) * 100)
                    return (
                      <div key={category.key}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <category.icon className="w-4 h-4 text-gold-500" />
                            <span className="text-gray-700 text-sm">{category.name}</span>
                          </div>
                          <span className="font-bold text-burgundy-900">{category.votes.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gold-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={() => setShowVotingModal(true)}
                  className="flex-1 bg-gold-500 text-burgundy-900 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-gold-400 transition-colors text-sm sm:text-base"
                >
                  Vote for {contestant.name.split(' ')[0]}
                </button>
                <Link 
                  href="/contestants"
                  className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold border-2 border-gray-200 text-gray-700 hover:border-burgundy-900 hover:text-burgundy-900 transition-colors text-center text-sm sm:text-base"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showVotingModal && (
        <VotingModal
          contestant={contestant}
          onClose={() => setShowVotingModal(false)}
        />
      )}

    </main>
  )
}
