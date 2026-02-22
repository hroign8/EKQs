'use client'

import NextImage from 'next/image'
import {

  Trophy, Users, BarChart3, Crown, ExternalLink,
  Globe, QrCode, Mail, Ticket, Image as ImageIcon,
} from 'lucide-react'
import type { Contestant } from '@/types'
import type { Category } from '../types'
import { getVotes } from '../types'
import { genderTitle } from '@/lib/utils'

interface ResultsTabProps {
  contestantsList: Contestant[]
  categoriesList: Category[]
  selectedCategory: string
  onSelectCategory: (slug: string) => void
}

export default function ResultsTab({
  contestantsList,
  categoriesList,
  selectedCategory,
  onSelectCategory,
}: ResultsTabProps) {
  const getCategoryTotalVotes = (categorySlug: string) => {
    return contestantsList.reduce((sum, c) => sum + (getVotes(c)[categorySlug] || 0), 0)
  }

  const getTopInCategory = (categorySlug: string, limit = 3) => {
    return [...contestantsList]
      .sort((a, b) => (getVotes(b)[categorySlug] || 0) - (getVotes(a)[categorySlug] || 0))
      .slice(0, limit)
  }

  return (
    <div>
      {/* Results Content */}
      <div className="mb-8">
        <div className="overflow-x-auto scroll-container mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3 min-w-max sm:min-w-0">
            {categoriesList.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.slug || category.id)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-gold-500 text-burgundy-900 shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-gold-300 hover:text-gray-900'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="bg-burgundy-900 px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-gold-500" />
              <span>{categoriesList.find(c => c.id === selectedCategory)?.name} Leaderboard</span>
            </h2>
          </div>
          <div>
            {contestantsList
              .slice()
              .sort((a, b) => (getVotes(b)[selectedCategory] || 0) - (getVotes(a)[selectedCategory] || 0))
              .map((contestant, index) => {
                const totalVotes = contestantsList.reduce((sum, c) => sum + (getVotes(c)[selectedCategory] || 0), 0)
                const contestantVotes = getVotes(contestant)[selectedCategory] || 0
                const percentage = totalVotes ? ((contestantVotes / totalVotes) * 100).toFixed(1) : '0.0'
                const maxVotes = Math.max(...contestantsList.map(c => getVotes(c)[selectedCategory] || 0))
                const barWidth = maxVotes ? (contestantVotes / maxVotes) * 100 : 0

                return (
                  <div
                    key={contestant.id}
                    className={`flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-5 transition-all group ${
                      index === 0
                        ? 'bg-gradient-to-r from-gold-50 to-gold-100/50'
                        : index % 2 === 0
                          ? 'bg-gray-50/50'
                          : 'bg-white'
                    } ${index !== contestantsList.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-sm sm:text-lg shadow-sm ${
                        index === 0 ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-burgundy-900' :
                        index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700' :
                        index === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                    </div>

                    {/* Contestant Image */}
                    <div className="relative flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14">
                      <NextImage
                        src={contestant.image || '/uploads/contestants/placeholder.svg'}
                        alt={contestant.name}
                        fill
                        className="rounded-full object-cover ring-2 ring-white shadow-md group-hover:scale-105 transition-transform"
                        sizes="56px"
                      />
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center shadow-md z-10">
                          <Crown className="w-3.5 h-3.5 text-burgundy-900" />
                        </div>
                      )}
                    </div>

                    {/* Contestant Info & Progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-burgundy-900 truncate">{contestant.name}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          contestant.gender === 'Male'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {genderTitle(contestant.gender)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1 mb-2">{contestant.description}</p>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              index === 0
                                ? 'bg-gradient-to-r from-gold-400 to-gold-500'
                                : 'bg-burgundy-800'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 w-16">{percentage}%</span>
                      </div>
                    </div>

                    {/* Votes */}
                    <div className="text-right flex-shrink-0 pl-2 sm:pl-4">
                      <div className={`text-lg sm:text-2xl font-black ${index === 0 ? 'text-gold-600' : 'text-burgundy-900'}`}>
                        {contestantVotes.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">votes</div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Site Links */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6">
        <h3 className="text-base sm:text-lg font-bold text-burgundy-900 mb-3 sm:mb-4">Site Pages</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-3">
          {[
            { href: '/', icon: Globe, label: 'Home' },
            { href: '/vote', icon: Trophy, label: 'Vote' },
            { href: '/results', icon: BarChart3, label: 'Results' },
            { href: '/gallery', icon: ImageIcon, label: 'Gallery' },
            { href: '/qr-code', icon: QrCode, label: 'QR Code' },
            { href: '/about', icon: ExternalLink, label: 'About' },
            { href: '/contestants', icon: Users, label: 'Contestants' },
            { href: '/contact', icon: Mail, label: 'Contact' },
            { href: '/ticketing', icon: Ticket, label: 'Ticketing' },
          ].map(({ href, icon: Icon, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-burgundy-50 hover:scale-105 transition-all group"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-burgundy-100 transition-colors">
                <Icon className="w-5 h-5 text-gray-500 group-hover:text-burgundy-900" />
              </div>
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {categoriesList.map((category) => {
          const categorySlug = category.slug || category.id
          const topContestants = getTopInCategory(categorySlug)
          const totalVotes = getCategoryTotalVotes(categorySlug)
          const maxVotes = getVotes(topContestants[0])?.[categorySlug] || 0
          return (
            <div key={category.id} className="bg-white rounded-2xl overflow-hidden group hover:shadow-lg transition-all">
              <div className="bg-burgundy-900 px-5 py-3 flex items-center justify-between">
                <h3 className="font-bold text-white">{category.name}</h3>
                <span className="text-xs font-medium text-burgundy-200 bg-white/10 px-2.5 py-1 rounded-full">
                  {totalVotes.toLocaleString()} votes
                </span>
              </div>
              <div className="p-4 space-y-3">
                {topContestants.map((contestant, index) => (
                  <div
                    key={contestant.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                      index === 0 ? 'bg-gold-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                      index === 0 ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-burgundy-900' :
                      index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="relative w-10 h-10">
                      <NextImage
                        src={contestant.image || '/uploads/contestants/placeholder.svg'}
                        alt={contestant.name}
                        fill
                        className="rounded-full object-cover ring-2 ring-white shadow-sm"
                        sizes="40px"
                      />
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center z-10">
                          <Crown className="w-2.5 h-2.5 text-burgundy-900" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 truncate text-sm">{contestant.name}</span>
                        <span className={`font-bold ml-2 text-sm ${index === 0 ? 'text-gold-600' : 'text-burgundy-900'}`}>
                          {(getVotes(contestant)[categorySlug] || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-700 ${
                            index === 0 ? 'bg-gradient-to-r from-gold-400 to-gold-500' : 'bg-burgundy-800'
                          }`}
                          style={{
                            width: `${maxVotes ? ((getVotes(contestant)[categorySlug] || 0) / maxVotes) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
