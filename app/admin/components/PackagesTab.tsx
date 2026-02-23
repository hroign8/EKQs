'use client'

import { Plus, Edit, Trash2, EyeOff, Eye, Crown, Trophy, DollarSign, TrendingUp } from 'lucide-react'
import type { VotingPackage } from '../types'

interface PackagesTabProps {
  packagesList: VotingPackage[]
  onAddPackage: () => void
  onEditPackage: (pkg: VotingPackage) => void
  onDeletePackage: (id: string) => void
  onTogglePackage: (id: string) => void
}

const ICON_COLORS = [
  { bg: 'bg-gray-100', text: 'text-gray-500' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
  { bg: 'bg-slate-200', text: 'text-slate-500' },
  { bg: 'bg-gold-100', text: 'text-gold-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-burgundy-100', text: 'text-burgundy-600' },
]

export default function PackagesTab({
  packagesList,
  onAddPackage,
  onEditPackage,
  onDeletePackage,
  onTogglePackage,
}: PackagesTabProps) {
  const activePackages = packagesList.filter(p => p.isActive)

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-burgundy-900 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <Crown className="w-5 h-5 text-gold-500" />
            <span>Voting Packages</span>
          </h2>
          <p className="text-xs sm:text-sm text-burgundy-200 mt-0.5 sm:mt-1">Configure the packages available to voters</p>
        </div>
        <button
          onClick={onAddPackage}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 text-burgundy-900 rounded-full font-semibold text-sm hover:bg-gold-400 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Package</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
        <div className="bg-white rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-burgundy-900">{activePackages.length}/{packagesList.length}</div>
              <div className="text-xs text-gray-500 font-medium">Active Packages</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-burgundy-900">
                {activePackages.length > 0
                  ? `$${Math.min(...activePackages.map(p => p.price)).toFixed(2)} – $${Math.max(...activePackages.map(p => p.price)).toFixed(2)}`
                  : '—'}
              </div>
              <div className="text-xs text-gray-500 font-medium">Price Range</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-burgundy-900">
                {activePackages.length > 0 ? Math.max(...activePackages.map(p => p.votes)).toLocaleString() : '—'}
              </div>
              <div className="text-xs text-gray-500 font-medium">Max Votes/Package</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {packagesList.length === 0 ? (
          <div className="p-12 text-center">
            <Crown className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No packages yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Package</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Votes</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Per Vote</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {packagesList.map((pkg, index) => {
                const color = ICON_COLORS[index % ICON_COLORS.length]
                return (
                  <tr key={pkg.id} className={`hover:bg-gray-50 transition-colors ${!pkg.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color.bg}`}>
                          <Crown className={`w-4 h-4 ${color.text}`} />
                        </div>
                        <span className="font-semibold text-gray-900">{pkg.name}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span className="font-black text-burgundy-900 text-base">{pkg.votes.toLocaleString()}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span className="font-bold text-gold-600">${pkg.price.toFixed(2)}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-gray-500 hidden sm:table-cell">
                      ${(pkg.price / pkg.votes).toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onTogglePackage(pkg.id)}
                          title={pkg.isActive ? `Disable ${pkg.name}` : `Enable ${pkg.name}`}
                          className={`p-1.5 rounded-lg transition-colors ${
                            pkg.isActive
                              ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {pkg.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => onEditPackage(pkg)}
                          title={`Edit ${pkg.name}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePackage(pkg.id)}
                          title={`Delete ${pkg.name}`}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        )}
      </div>
    </div>
  )
}
