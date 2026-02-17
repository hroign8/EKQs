"use client"

import { useState } from 'react'
import Image from 'next/image'
import { useContestants } from '@/lib/hooks'
import { useApiData } from '@/lib/hooks'
import { Heart } from 'lucide-react'
import VotingModal from '@/components/VotingModal'
import PageHero from '@/components/PageHero'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Contestant } from '@/types'

interface Category {
  id: string
  name: string
  slug: string
}

const filters = [
  { id: 'all', name: 'All' },
  { id: 'kings', name: 'Kings' },
  { id: 'queens', name: 'Queens' },
] as const

export default function ContestantsPage() {
  const { data: contestants, loading: contestantsLoading } = useContestants()
  const { data: categories, loading: categoriesLoading } = useApiData<Category[]>('/api/categories', [])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'kings' | 'queens'>('all')
  const [showVotingModal, setShowVotingModal] = useState(false)
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null)

  // Set default category once loaded
  const activeCategorySlug = selectedCategory || (categories.length > 0 ? categories[0].slug : 'peoplesChoice')

  const handleVoteClick = (contestant: Contestant) => {
    setSelectedContestant(contestant)
    setShowVotingModal(true)
  }

  const filteredContestants = contestants.filter(c => {
    if (selectedFilter === 'kings') return c.gender === 'Male'
    if (selectedFilter === 'queens') return c.gender === 'Female'
    return true
  })

  const sortedContestants = [...filteredContestants].sort((a, b) => {
    const aVotes = (a.votes as Record<string, number>)[activeCategorySlug] || 0
    const bVotes = (b.votes as Record<string, number>)[activeCategorySlug] || 0
    return bVotes - aVotes
  })

  const kingsCount = contestants.filter(c => c.gender === 'Male').length
  const queensCount = contestants.filter(c => c.gender === 'Female').length

  if (contestantsLoading || categoriesLoading) {
    return <LoadingSpinner message="Loading contestants..." />
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <PageHero title="Meet Our Contestants" subtitle="Discover the talented individuals competing for the crown" />

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Stats Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-16">
            <div className="text-center">
              <div className="text-3xl font-black text-burgundy-900 mb-1">{contestants.length}</div>
              <div className="text-sm text-gray-500">Total Contestants</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-blue-600">{kingsCount}</div>
              <div className="text-sm text-gray-500">Kings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-pink-600">{queensCount}</div>
              <div className="text-sm text-gray-500">Queens</div>
            </div>
          </div>
        </div>

        {/* Filter & Category Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          {/* Gender Filter */}
          <div className="flex gap-2 flex-shrink-0">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id as 'all' | 'kings' | 'queens')}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedFilter === filter.id
                    ? 'bg-burgundy-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="w-full sm:w-auto overflow-x-auto scroll-container -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeCategorySlug === category.slug
                      ? 'bg-gold-500 text-burgundy-900'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contestants Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {sortedContestants.map((contestant, index) => {
            const isTopThree = index < 3 && selectedFilter === 'all'
            
            return (
              <div 
                key={contestant.id} 
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden group"
              >
                {/* Contestant Image */}
                <div className="relative h-48 sm:h-72 overflow-hidden">
                  <Image 
                    src={contestant.image || '/uploads/contestants/placeholder.svg'} 
                    alt={contestant.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Rank Badge */}
                  {isTopThree && (
                    <div className={`absolute top-2 sm:top-4 left-2 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm sm:text-lg ${
                      index === 0 
                        ? 'bg-gold-500 text-burgundy-900' 
                        : index === 1 
                          ? 'bg-gray-300 text-gray-700' 
                          : 'bg-amber-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                  )}

                  {/* Gender Badge */}
                  <div className={`absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                    contestant.gender === 'Male' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-pink-500 text-white'
                  }`}>
                    {contestant.gender === 'Male' ? 'King' : 'Queen'}
                  </div>

                  {/* Name Overlay */}
                  <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                    <h3 className="text-sm sm:text-xl font-bold text-white mb-0.5 sm:mb-1 truncate">{contestant.name}</h3>
                    <div className="flex items-center gap-1 sm:gap-1.5 text-white/90">
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-white/90" />
                      <span className="text-xs sm:text-sm font-medium">{((contestant.votes as Record<string, number>)[activeCategorySlug] || 0).toLocaleString()} votes</span>
                    </div>
                  </div>
                </div>

                {/* Contestant Info */}
                <div className="p-3 sm:p-4">
                  <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {contestant.description}
                  </p>
                  <button 
                    onClick={() => handleVoteClick(contestant)}
                    className="w-full py-2 sm:py-3 rounded-full font-semibold transition-colors bg-gold-500 text-burgundy-900 hover:bg-gold-400 text-sm sm:text-base"
                  >
                    Vote Now
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {sortedContestants.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No contestants found for this filter.</p>
          </div>
        )}
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
