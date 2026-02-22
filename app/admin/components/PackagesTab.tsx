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

export default function PackagesTab({
  packagesList,
  onAddPackage,
  onEditPackage,
  onDeletePackage,
  onTogglePackage,
}: PackagesTabProps) {
  const activePackages = packagesList.filter(p => p.isActive)

  return (
    <div className="space-y-6">
      {/* Packages Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-burgundy-900">Voting Packages</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Configure the voting packages available to users</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 rounded-full">
              <span className="text-xs sm:text-sm text-gray-600">Active:</span>
              <span className="font-bold text-green-600 text-sm">{activePackages.length}/{packagesList.length}</span>
            </div>
            <button
              onClick={onAddPackage}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gold-500 text-burgundy-900 rounded-full font-semibold text-xs sm:text-sm hover:bg-gold-400 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Package</span>
            </button>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {packagesList.map((pkg, index) => (
          <div
            key={pkg.id}
            className={`relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 transition-all group ${
              pkg.isActive
                ? 'hover:shadow-lg hover:scale-[1.02]'
                : 'opacity-50'
            }`}
          >
            {/* Status Badge */}
            <div className={`absolute -top-2 -right-2 sm:-top-2.5 sm:-right-2.5 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded-full shadow-sm ${
              pkg.isActive
                ? 'bg-green-500 text-white'
                : 'bg-gray-400 text-white'
            }`}>
              {pkg.isActive ? 'Active' : 'Inactive'}
            </div>

            {/* Package Icon */}
            <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl flex items-center justify-center ${
              index === 0 ? 'bg-gray-100' :
              index === 1 ? 'bg-amber-100' :
              index === 2 ? 'bg-gray-200' :
              index === 3 ? 'bg-gold-100' :
              index === 4 ? 'bg-purple-100' :
              'bg-burgundy-100'
            }`}>
              <Crown className={`w-6 h-6 ${
                index === 0 ? 'text-gray-500' :
                index === 1 ? 'text-amber-600' :
                index === 2 ? 'text-gray-500' :
                index === 3 ? 'text-gold-600' :
                index === 4 ? 'text-purple-600' :
                'text-burgundy-600'
              }`} />
            </div>

            <div className="text-center mb-2 sm:mb-3">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{pkg.name}</div>
              <div className="text-2xl sm:text-4xl font-black text-burgundy-900">{pkg.votes}</div>
              <div className="text-xs text-gray-500">{pkg.votes === 1 ? 'Vote' : 'Votes'}</div>
            </div>

            <div className="text-center mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100">
              <span className="text-xl sm:text-2xl font-black text-gold-500">${pkg.price.toFixed(2)}</span>
              <div className="text-xs text-gray-400 mt-1">
                ${(pkg.price / pkg.votes).toFixed(2)} per vote
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => onTogglePackage(pkg.id)}
                className={`p-2.5 rounded-xl transition-colors ${
                  pkg.isActive
                    ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                }`}
                aria-label={pkg.isActive ? `Disable ${pkg.name}` : `Enable ${pkg.name}`}
              >
                {pkg.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onEditPackage(pkg)}
                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                aria-label={`Edit ${pkg.name}`}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeletePackage(pkg.id)}
                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                aria-label={`Delete ${pkg.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Packages Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-burgundy-900">{activePackages.length}</div>
              <div className="text-sm text-gray-500">Active Packages</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-gold-600" />
            </div>
            <div>
              <div className="text-lg font-black text-burgundy-900">
                ${Math.min(...activePackages.map(p => p.price)).toFixed(2)} - ${Math.max(...activePackages.map(p => p.price)).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Price Range</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-burgundy-900">
                {Math.max(...activePackages.map(p => p.votes)).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Max Votes/Package</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
