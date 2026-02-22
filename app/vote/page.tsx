'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useContestants, useApiData } from '@/lib/hooks'
import { Crown, Heart } from 'lucide-react'
import VotingModal from '@/components/VotingModal'
import PageHero from '@/components/PageHero'
import { genderTitle } from '@/lib/utils'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Contestant, VotingCategory } from '@/types'

export default function VotePage() {
  const { data: contestants, loading: contestantsLoading } = useContestants()
  const { data: categories, loading: categoriesLoading } = useApiData<VotingCategory[]>('/api/categories', [])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showVotingModal, setShowVotingModal] = useState(false)
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null)

  const activeCategorySlug = selectedCategory || (categories.length > 0 ? (categories[0].slug ?? 'peoplesChoice') : 'peoplesChoice')

  const handleVoteClick = (contestant: Contestant) => {
    setSelectedContestant(contestant)
    setShowVotingModal(true)
  }

  const getVoteCount = (contestant: Contestant) => {
    return contestant.votes?.[activeCategorySlug] ?? 0
  }

  const sortedContestants = [...contestants].sort((a, b) => getVoteCount(b) - getVoteCount(a))
  const maxVotes = sortedContestants.length > 0 ? Math.max(...sortedContestants.map(c => getVoteCount(c))) : 0
  const totalVotes = sortedContestants.reduce((sum, c) => sum + getVoteCount(c), 0)

  if (contestantsLoading || categoriesLoading) {
    return <LoadingSpinner message="Loading standings..." />
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <PageHero title="Live Standings" subtitle="Cast your vote and watch the competition unfold in real-time" />

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Stats Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Total Votes Cast</div>
              <div className="text-2xl sm:text-3xl font-black text-burgundy-900">{totalVotes.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Contestants</div>
              <div className="text-2xl sm:text-3xl font-black text-burgundy-900">{contestants.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Current Leader</div>
              <div className="text-base sm:text-xl font-bold text-gold-500 truncate">{sortedContestants[0]?.name}</div>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 bg-green-50 px-3 sm:px-4 py-2 rounded-full col-span-2 sm:col-span-1"
              aria-label="Voting is currently open"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
              <span className="text-green-700 font-medium text-sm">Voting Open</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div role="tablist" aria-label="Vote categories" className="overflow-x-auto scroll-container -mx-4 px-4 sm:mx-0 sm:px-0 mb-8 sm:mb-10">
          <div className="flex justify-start sm:justify-center gap-2 sm:gap-3 min-w-max sm:min-w-0 sm:flex-wrap">
            {categories.map((category) => (
              <button
                key={category.slug}
                id={`vote-tab-${category.slug}`}
                role="tab"
                aria-selected={activeCategorySlug === category.slug}
                onClick={() => setSelectedCategory(category.slug ?? '')}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                  activeCategorySlug === category.slug
                    ? 'bg-burgundy-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-burgundy-900'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div
          role="tabpanel"
          aria-labelledby={`vote-tab-${activeCategorySlug}`}
          className="bg-white rounded-2xl overflow-hidden"
        >
          {sortedContestants.map((contestant, index) => {
            const votes = getVoteCount(contestant)
            const percentage = maxVotes > 0 ? (votes / maxVotes) * 100 : 0
            const isTopThree = index < 3
            
            return (
              <div 
                key={contestant.id} 
                className={`transition-all ${index !== sortedContestants.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 gap-3 sm:gap-4">
                  {/* Rank & Image - Clickable */}
                  <Link href={`/contestants/${contestant.id}`} className="flex items-center gap-3 sm:gap-4 group cursor-pointer">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-base sm:text-lg flex-shrink-0 ${
                      index === 0 
                        ? 'bg-gold-500 text-burgundy-900' 
                        : index === 1 
                          ? 'bg-gray-300 text-gray-700' 
                          : index === 2 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                      <Image 
                        src={contestant.image || '/uploads/contestants/placeholder.svg'} 
                        alt={contestant.name}
                        fill
                        className="rounded-full object-cover transition-transform group-hover:scale-105"
                        sizes="64px"
                      />
                      {index === 0 && (
                        <div className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 bg-gold-500 rounded-full flex items-center justify-center">
                          <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-burgundy-900" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info - Clickable */}
                  <Link href={`/contestants/${contestant.id}`} className="flex-1 min-w-0 group cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-bold text-burgundy-900 truncate group-hover:text-gold-500 transition-colors">{contestant.name}</h3>
                      <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
                        contestant.gender === 'Male' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-pink-50 text-pink-700'
                      }`}>
                        {genderTitle(contestant.gender)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm line-clamp-1 mb-2 sm:mb-3">{contestant.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 sm:h-3 overflow-hidden">
                        <div 
                          role="progressbar"
                          aria-valuenow={Math.round(percentage)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${contestant.name} at ${percentage.toFixed(0)}% of top vote count`}
                          className={`h-full rounded-full transition-all duration-700 ${
                            index === 0 
                              ? 'bg-gradient-to-r from-gold-400 to-gold-500' 
                              : 'bg-burgundy-900'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500 w-10 sm:w-12 text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </Link>

                  {/* Votes & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 sm:ml-4">
                    <div className="text-center sm:text-right">
                      <div className="flex items-center gap-1.5 justify-start sm:justify-center text-burgundy-900">
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isTopThree ? 'fill-burgundy-900' : ''}`} />
                        <span className="text-xl sm:text-2xl font-black">{votes.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500 font-medium">votes</div>
                    </div>
                    
                    <button 
                      onClick={() => handleVoteClick(contestant)}
                      aria-label={`Vote for ${contestant.name}`}
                      className="bg-gold-500 text-burgundy-900 px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gold-400 transition-colors whitespace-nowrap text-sm sm:text-base"
                    >
                      Vote Now
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">Want to give your favorite contestant a bigger boost?</p>
          <p className="text-sm text-gray-400">Purchase voting packages to cast multiple votes at once</p>
        </div>
      </div>

      {showVotingModal && (
        <VotingModal
          contestant={selectedContestant}
          onClose={() => {
            setShowVotingModal(false)
            setSelectedContestant(null)
          }}
        />
      )}

    </main>
  )
}
