'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useContestants, useEvent } from '@/lib/hooks'
import { Crown, Calendar, MapPin, Users, Star, Loader2 } from 'lucide-react'
import VotingModal from '@/components/VotingModal'
import CountdownTimer from '@/components/CountdownTimer'
import Footer from '@/components/Footer'
import Link from 'next/link'
import type { Contestant } from '@/types'

export default function Home() {
  const { data: contestants, loading: contestantsLoading } = useContestants()
  const { data: eventData, loading: eventLoading } = useEvent()
  const [showVotingModal, setShowVotingModal] = useState(false)
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null)
  const [votedContestants, setVotedContestants] = useState<Set<string>>(new Set())

  const handleVoteClick = (contestant: Contestant) => {
    setSelectedContestant(contestant)
    setShowVotingModal(true)
  }

  const handleVoteSuccess = () => {
    if (selectedContestant) {
      setVotedContestants(prev => new Set(prev).add(selectedContestant.id))
    }
  }

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const topContestants = [...contestants].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)).slice(0, 3)

  const isLoading = contestantsLoading || eventLoading

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gold-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-burgundy-900 text-white py-12 sm:py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src="/crown.jpeg" 
            alt="" 
            fill
            className="object-cover opacity-10"
            priority
          />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 mx-auto mb-4 sm:mb-6 rounded-full overflow-hidden border-4 border-gold-500">
            <Image 
              src="/crown.jpeg" 
              alt="Crown" 
              fill
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
            Eritrean Kings & Queens
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-burgundy-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            {eventData?.tagline || 'Celebrating excellence, beauty, and talent'}
          </p>
          <Link href="/contestants" className="inline-block bg-gold-500 hover:bg-gold-400 text-burgundy-900 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold transition-colors text-sm sm:text-base">
            Vote Now
          </Link>
        </div>
      </div>

      {/* Countdown Timer */}
      {eventData && (
        <div className="container mx-auto px-4 py-8">
          <CountdownTimer endDate={eventData.votingPeriod.end} eventDate={eventData.startDate} />
        </div>
      )}

      {/* Event Info Cards */}
      <div className="container mx-auto px-4 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <div className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-burgundy-900 mb-1">Event Date</h3>
            <p className="text-gray-600 text-sm">{eventData ? formatDate(eventData.startDate) : 'Coming Soon'}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-burgundy-900 mb-1">Venue</h3>
            <p className="text-gray-600 text-sm">Grand Hub, Kampala</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-burgundy-900 mb-1">Contestants</h3>
            <p className="text-gray-600 text-sm">{contestants.length} Talented Individuals</p>
          </div>
        </div>
      </div>

      {/* Featured Contestants */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="h-px w-12 bg-gold-500"></div>
              <Crown className="w-6 h-6 text-gold-500" />
              <div className="h-px w-12 bg-gold-500"></div>
            </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-burgundy-900">Leading Contestants</h2>
            <p className="text-gray-600 mt-2">Meet the top performers in the competition</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {topContestants.map((contestant, index) => (
              <Link 
                href={`/contestants/${contestant.id}`} 
                key={contestant.id}
                className="group"
              >
                <div className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow h-full flex flex-col items-center justify-center">
                  <div className="relative mb-4">
                    <div className={`relative w-32 h-32 rounded-full overflow-hidden border-4 ${
                      index === 0 ? 'border-gold-500' : index === 1 ? 'border-gray-300' : 'border-amber-600'
                    } group-hover:scale-105 transition-transform`}>
                      <Image 
                        src={contestant.image} 
                        alt={contestant.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-gold-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-burgundy-900 group-hover:text-gold-600 transition-colors">
                    {contestant.name}
                  </h3>
                  <p className="text-sm text-gray-600">{contestant.gender === 'Male' ? 'King' : 'Queen'} Contestant</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/contestants" className="inline-block bg-gold-500 hover:bg-gold-400 text-burgundy-900 px-8 py-3 rounded-full font-semibold transition-colors">
              View All Contestants
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="h-px w-12 bg-gold-500"></div>
            <Star className="w-5 h-5 text-gold-500 fill-gold-500" />
            <div className="h-px w-12 bg-gold-500"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-burgundy-900">How Voting Works</h2>
          <p className="text-gray-600 mt-2">Support your favorites in three simple steps</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-lg font-bold text-white">1</span>
            </div>
            <h3 className="font-bold text-burgundy-900 mb-2">Choose Contestant</h3>
            <p className="text-gray-600 text-sm">Browse through our talented contestants and find your favorites</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-lg font-bold text-white">2</span>
            </div>
            <h3 className="font-bold text-burgundy-900 mb-2">Select Category</h3>
            <p className="text-gray-600 text-sm">Pick from People's Choice, Best Talent, Best Evening Wear & more</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-lg font-bold text-white">3</span>
            </div>
            <h3 className="font-bold text-burgundy-900 mb-2">Cast Your Vote</h3>
            <p className="text-gray-600 text-sm">Complete payment to support them</p>
          </div>
        </div>
      </div>

      {/* Sponsor CTA */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-gold-500"></div>
            <Crown className="w-6 h-6 text-gold-500" />
            <div className="h-px w-12 bg-gold-500"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-burgundy-900 mb-4">Partner With Us</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            Showcase your brand to a vibrant, engaged audience. Become a sponsor and gain premium visibility at the biggest Eritrean cultural event of the year.
          </p>
          <div className="flex items-center justify-center">
            <Link href="/sponsors" className="bg-gold-500 hover:bg-gold-400 text-burgundy-900 px-8 py-3 rounded-full font-bold transition-colors">
              Become a Sponsor
            </Link>
          </div>
        </div>
      </div>

      <Footer />

      {showVotingModal && selectedContestant && (
        <VotingModal
          contestant={selectedContestant}
          onClose={() => setShowVotingModal(false)}
          onSuccess={handleVoteSuccess}
        />
      )}
    </main>
  )
}