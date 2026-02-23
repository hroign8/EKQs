'use client'

import { useState } from 'react'
import { Plus, Download, Crown, Search, RefreshCw } from 'lucide-react'
import type { VoteLogEntry } from '../types'

interface VoteLogTabProps {
  voteLogList: VoteLogEntry[]
  onAddManualVote: () => void
  onExportVoteLog: () => void
  onVerifyPending: () => Promise<void>
}

export default function VoteLogTab({
  voteLogList,
  onAddManualVote,
  onExportVoteLog,
  onVerifyPending,
}: VoteLogTabProps) {
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all')
  const [search, setSearch] = useState('')
  const [verifying, setVerifying] = useState(false)

  const filtered = voteLogList.filter(v => {
    if (filter === 'verified' && !v.verified) return false
    if (filter === 'pending' && v.verified) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        v.voterEmail.toLowerCase().includes(q) ||
        (v.voterName || '').toLowerCase().includes(q) ||
        v.contestant.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      )
    }
    return true
  })

  const verifiedCount = voteLogList.filter(v => v.verified).length
  const pendingCount = voteLogList.length - verifiedCount
  const verifiedRevenue = voteLogList.filter(v => v.verified).reduce((s, v) => s + (v.amountPaid || 0), 0)
  const pendingRevenue = voteLogList.filter(v => !v.verified).reduce((s, v) => s + (v.amountPaid || 0), 0)

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="bg-burgundy-900 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <Crown className="w-5 h-5 text-gold-500" />
            <span>Vote Log</span>
          </h2>
          <p className="text-xs sm:text-sm text-burgundy-200 mt-0.5 sm:mt-1">Track all voting activity in real-time</p>
        </div>
        <div className="flex gap-2 sm:gap-3 self-start sm:self-auto flex-wrap">
          {pendingCount > 0 && (
            <button
              onClick={async () => {
                setVerifying(true)
                try { await onVerifyPending() } finally { setVerifying(false) }
              }}
              disabled={verifying}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-full font-semibold text-sm hover:bg-green-400 transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
              <span>{verifying ? 'Checking...' : 'Verify Pending'}</span>
            </button>
          )}
          <button
            onClick={onAddManualVote}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 text-burgundy-900 rounded-full font-semibold text-sm hover:bg-gold-400 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Vote</span>
          </button>
          <button
            onClick={onExportVoteLog}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-full font-medium text-sm hover:bg-white/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
        <div className="bg-white rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-black text-green-600">{verifiedCount}</div>
          <div className="text-xs text-gray-500 font-medium">Verified</div>
          <div className="text-xs text-green-600 font-semibold mt-0.5">${verifiedRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-black text-amber-600">{pendingCount}</div>
          <div className="text-xs text-gray-500 font-medium">Pending</div>
          <div className="text-xs text-amber-600 font-semibold mt-0.5">${pendingRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-black text-burgundy-900">
            {voteLogList.reduce((sum, v) => sum + (v.votesCount || 1), 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 font-medium">Total Votes</div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-black text-emerald-600 truncate">
            ${(verifiedRevenue + pendingRevenue).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 font-medium">Total Revenue</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search voter, contestant, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div className="flex gap-2">
          {([
            { key: 'all', label: 'All', count: voteLogList.length },
            { key: 'verified', label: 'Verified', count: verifiedCount },
            { key: 'pending', label: 'Pending', count: pendingCount },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === f.key
                  ? f.key === 'verified' ? 'bg-green-600 text-white'
                    : f.key === 'pending' ? 'bg-amber-500 text-white'
                    : 'bg-burgundy-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-burgundy-50">
              <th className="text-left px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Time</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Voter</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Contestant</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Category</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Package</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Votes</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Amount</th>
              <th className="text-center px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <Crown className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 font-medium">
                    {search ? 'No matching votes found' : filter === 'pending' ? 'No pending payments' : filter === 'verified' ? 'No verified payments' : 'No votes recorded yet'}
                  </p>
                </td>
              </tr>
            ) : filtered.map((vote, index) => (
              <tr
                key={vote.id}
                className={`transition-colors hover:bg-gold-50 ${
                  index !== filtered.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{vote.time.split(',')[0]}</div>
                  <div className="text-xs text-gray-500">{vote.time.split(',')[1]}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-burgundy-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-burgundy-700">
                        {(vote.voterName || vote.voterEmail).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      {vote.voterName && (
                        <div className="text-sm font-semibold text-gray-900 truncate">{vote.voterName}</div>
                      )}
                      <div className="text-xs text-gray-500 truncate">{vote.voterEmail}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-burgundy-900">{vote.contestant}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{vote.category}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full">
                    {vote.packageName || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-black text-burgundy-900">{vote.votesCount || 1}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-bold text-emerald-600">${(vote.amountPaid || 0).toFixed(2)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                      vote.verified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${vote.verified ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                      {vote.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="text-xs sm:text-sm text-gray-500">
          Showing <span className="font-semibold text-burgundy-900">{filtered.length}</span>{filtered.length !== voteLogList.length && ` of ${voteLogList.length}`} entries
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
