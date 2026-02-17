'use client'

import Image from 'next/image'
import { Crown, Camera, Loader2 } from 'lucide-react'
import { useContestants } from '@/lib/hooks'
import Link from 'next/link'
import { useState } from 'react'
import PageHero from '@/components/PageHero'

export default function GalleryPage() {
  const [filter, setFilter] = useState<'all' | 'Male' | 'Female'>('all')
  const { data: contestants, loading } = useContestants()

  const filteredContestants = filter === 'all' 
    ? contestants 
    : contestants.filter(c => c.gender === filter)

  return (
    <main className="min-h-screen bg-gray-50">
      <PageHero title="Photo" highlightedWord="Gallery" subtitle="Browse photos of our talented contestants" icon={Camera} />

      {/* Filter Tabs */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-full font-medium transition-colors ${
              filter === 'all'
                ? 'bg-burgundy-900 text-white'
                : 'bg-white text-gray-700 hover:text-burgundy-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('Male')}
            className={`px-6 py-2.5 rounded-full font-medium transition-colors ${
              filter === 'Male'
                ? 'bg-burgundy-900 text-white'
                : 'bg-white text-gray-700 hover:text-burgundy-900'
            }`}
          >
            Kings
          </button>
          <button
            onClick={() => setFilter('Female')}
            className={`px-6 py-2.5 rounded-full font-medium transition-colors ${
              filter === 'Female'
                ? 'bg-burgundy-900 text-white'
                : 'bg-white text-gray-700 hover:text-burgundy-900'
            }`}
          >
            Queens
          </button>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-burgundy-900" />
          </div>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredContestants.map((contestant) => (
            <Link key={contestant.id} href={`/contestants/${contestant.id}`}>
              <div className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden hover:ring-2 hover:ring-gold-500 transition-all">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={contestant.image || '/uploads/contestants/placeholder.svg'}
                    alt={contestant.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-burgundy-900 group-hover:text-gold-600 transition-colors text-sm sm:text-base truncate">
                    {contestant.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {contestant.gender === 'Male' ? 'King' : 'Queen'} Contestant
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}

        {!loading && filteredContestants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No contestants found in this category.</p>
          </div>
        )}
      </div>

      {/* Event Photos Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="h-px w-12 bg-burgundy-900"></div>
              <Crown className="w-5 h-5 text-burgundy-900" />
              <div className="h-px w-12 bg-burgundy-900"></div>
            </div>
            <h2 className="text-3xl font-bold text-burgundy-900">Past Events</h2>
            <p className="text-gray-600 mt-2">Highlights from previous Eritrean Kings & Queens events</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-square bg-burgundy-100 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-8 h-8 text-burgundy-300 mx-auto mb-2" />
                <p className="text-burgundy-400 text-sm">Coming Soon</p>
              </div>
            </div>
            <div className="aspect-square bg-burgundy-100 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-8 h-8 text-burgundy-300 mx-auto mb-2" />
                <p className="text-burgundy-400 text-sm">Coming Soon</p>
              </div>
            </div>
            <div className="aspect-square bg-burgundy-100 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-8 h-8 text-burgundy-300 mx-auto mb-2" />
                <p className="text-burgundy-400 text-sm">Coming Soon</p>
              </div>
            </div>
            <div className="aspect-square bg-burgundy-100 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-8 h-8 text-burgundy-300 mx-auto mb-2" />
                <p className="text-burgundy-400 text-sm">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-burgundy-900 mb-3">Want to See More?</h2>
          <p className="text-gray-600 mb-6">Attend our event and experience it live!</p>
          <Link href="/ticketing" className="inline-block bg-gold-500 text-burgundy-900 px-8 py-3 rounded-full font-bold hover:bg-gold-400 transition-colors">
            Get Tickets
          </Link>
        </div>
      </div>

    </main>
  )
}
