'use client'

import NextImage from 'next/image'
import { Plus, Edit, Trash2, Crown } from 'lucide-react'
import type { Contestant } from '@/types'
import type { Category } from '../types'
import { getVotes, getTotalVotes } from '../types'
import { genderTitle, rankBadgeClasses } from '@/lib/utils'

interface ContestantsTabProps {
  contestantsList: Contestant[]
  categoriesList: Category[]
  onAddContestant: () => void
  onEditContestant: (contestant: Contestant) => void
  onDeleteContestant: (id: string) => void
}

export default function ContestantsTab({
  contestantsList,
  categoriesList,
  onAddContestant,
  onEditContestant,
  onDeleteContestant,
}: ContestantsTabProps) {
  const sortedByTotal = [...contestantsList].sort((a, b) => getTotalVotes(b) - getTotalVotes(a))

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-burgundy-900">All Participants</h3>
          <p className="text-xs sm:text-sm text-gray-500">Complete list with vote breakdown by category</p>
        </div>
        <button
          onClick={onAddContestant}
          className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all text-sm sm:text-base self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contestant</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Contestants leaderboard">
          <thead>
            <tr className="bg-burgundy-50">
              <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">#</th>
              <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Contestant</th>
              {categoriesList.map(cat => (
                <th key={cat.id} className="text-right px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider whitespace-nowrap">
                  {cat.name}
                </th>
              ))}
              <th className="text-right px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Total</th>
              <th className="text-center px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedByTotal.map((contestant, index) => {
              const votes = getVotes(contestant)
              return (
                <tr
                  key={contestant.id}
                  className={`transition-colors hover:bg-gold-50 ${
                    index !== sortedByTotal.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${rankBadgeClasses(index)}`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                        <NextImage
                          src={contestant.image || '/uploads/contestants/placeholder.svg'}
                          alt={contestant.name}
                          fill
                          className="rounded-full object-cover ring-2 ring-white shadow-sm"
                          sizes="48px"
                        />
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center z-10">
                            <Crown className="w-3 h-3 text-burgundy-900" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-burgundy-900 truncate text-sm sm:text-base">{contestant.name}</div>
                        <div className="text-xs text-gray-500">{contestant.country} · {genderTitle(contestant.gender)}</div>
                      </div>
                    </div>
                  </td>
                  {categoriesList.map(cat => {
                    const catSlug = cat.slug || cat.id
                    return (
                      <td key={cat.id} className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                        <span className={`font-semibold text-sm ${(votes[catSlug] || 0) > 0 ? 'text-burgundy-900' : 'text-gray-300'}`}>
                          {(votes[catSlug] || 0).toLocaleString()}
                        </span>
                      </td>
                    )
                  })}
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                    <span className="font-black text-burgundy-900 text-sm sm:text-base">{getTotalVotes(contestant).toLocaleString()}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEditContestant(contestant)}
                        aria-label={`Edit ${contestant.name}`}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteContestant(contestant.id)}
                        aria-label={`Delete ${contestant.name}`}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
