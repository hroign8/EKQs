'use client'

import { DollarSign, CreditCard, TrendingUp, Wallet, Crown } from 'lucide-react'
import type { VoteLogEntry, VotingPackage, AdminTab } from '../types'

interface RevenueTabProps {
  voteLogList: VoteLogEntry[]
  packagesList: VotingPackage[]
  onSwitchTab: (tab: AdminTab) => void
}

export default function RevenueTab({
  voteLogList,
  packagesList,
  onSwitchTab,
}: RevenueTabProps) {
  const calculateTotalRevenue = () =>
    voteLogList.reduce((total, entry) => total + entry.amountPaid, 0)

  const calculateTotalVotesSold = () =>
    voteLogList.reduce((total, entry) => total + entry.votesCount, 0)

  const getAverageTransactionValue = () => {
    if (voteLogList.length === 0) return 0
    return calculateTotalRevenue() / voteLogList.length
  }

  const getPackageSalesBreakdown = () => {
    const breakdown: Record<string, { count: number; revenue: number; votes: number }> = {}
    voteLogList.forEach(entry => {
      if (!breakdown[entry.packageId]) {
        breakdown[entry.packageId] = { count: 0, revenue: 0, votes: 0 }
      }
      breakdown[entry.packageId].count += 1
      breakdown[entry.packageId].revenue += entry.amountPaid
      breakdown[entry.packageId].votes += entry.votesCount
    })
    return breakdown
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:shadow-md transition-all group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-600 truncate">
            ${calculateTotalRevenue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">Total Revenue</div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:shadow-md transition-all group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-burgundy-900">{voteLogList.length}</div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">Total Transactions</div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:shadow-md transition-all group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-burgundy-900">{calculateTotalVotesSold().toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">Votes Sold</div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:shadow-md transition-all group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-gold-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-burgundy-900">
            ${getAverageTransactionValue().toFixed(2)}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">Avg. Transaction</div>
        </div>
      </div>

      {/* Package Sales Breakdown */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-burgundy-900">Package Sales Breakdown</h3>
          <p className="text-sm text-gray-500 mt-1">Revenue breakdown by package type</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Package</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Votes/Pkg</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Times Sold</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Votes</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {packagesList.map((pkg) => {
                const salesData = getPackageSalesBreakdown()[pkg.id] || { count: 0, revenue: 0, votes: 0 }
                return (
                  <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${pkg.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="font-semibold text-burgundy-900">{pkg.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-700">${pkg.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{pkg.votes}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${salesData.count > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                        {salesData.count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">{salesData.votes.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${salesData.revenue > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                        ${salesData.revenue.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-bold text-burgundy-900">TOTAL</td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-right font-bold text-burgundy-900">{voteLogList.length}</td>
                <td className="px-6 py-4 text-right font-bold text-burgundy-900">{calculateTotalVotesSold().toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-black text-emerald-600 text-lg">
                  ${calculateTotalRevenue().toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="bg-burgundy-900 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">Recent Transactions</h3>
            <p className="text-sm text-burgundy-200 mt-0.5">Latest package purchases</p>
          </div>
          <button
            onClick={() => onSwitchTab('votelog')}
            className="text-sm text-gold-400 hover:text-gold-300 font-semibold transition-colors"
          >
            View All →
          </button>
        </div>

        <div>
          {voteLogList.slice(0, 5).map((entry, index) => (
            <div
              key={entry.id}
              className={`px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 transition-colors hover:bg-gray-50 ${
                index !== Math.min(4, voteLogList.length - 1) ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gold-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-gold-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-burgundy-900 text-sm sm:text-base truncate">{entry.voterEmail}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{entry.time}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 ml-12 sm:ml-0 flex-shrink-0">
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full truncate max-w-[120px]">
                  {entry.packageName}
                </span>
                <span className="font-black text-emerald-600 text-sm sm:text-base">${entry.amountPaid.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
