'use client'

import { Plus, Download, Crown } from 'lucide-react'
import type { VoteLogEntry } from '../types'

interface VoteLogTabProps {
  voteLogList: VoteLogEntry[]
  onAddManualVote: () => void
  onExportVoteLog: () => void
}

export default function VoteLogTab({
  voteLogList,
  onAddManualVote,
  onExportVoteLog,
}: VoteLogTabProps) {
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
        <div className="flex gap-2 sm:gap-3 self-start sm:self-auto">
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
          <div className="text-lg sm:text-2xl font-black text-burgundy-900">{voteLogList.length}</div>
          <div className="text-xs text-gray-500 font-medium">Total Entries</div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-black text-emerald-600 truncate">
            ${voteLogList.reduce((sum, v) => sum + (v.amountPaid || 0), 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 font-medium">Total Revenue</div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-black text-burgundy-900">
            {voteLogList.reduce((sum, v) => sum + (v.votesCount || 1), 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 font-medium">Total Votes</div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-black text-green-600">
            {voteLogList.filter(v => v.verified).length}
          </div>
          <div className="text-xs text-gray-500 font-medium">Verified</div>
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
            {voteLogList.map((vote, index) => (
              <tr
                key={vote.id}
                className={`transition-colors hover:bg-gold-50 ${
                  index !== voteLogList.length - 1 ? 'border-b border-gray-100' : ''
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
                        {vote.voterEmail.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">{vote.voterEmail}</span>
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
          Showing <span className="font-semibold text-burgundy-900">{voteLogList.length}</span> entries
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
