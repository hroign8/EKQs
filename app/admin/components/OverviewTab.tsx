'use client'

import { Plus, Download } from 'lucide-react'

interface OverviewTabProps {
  onAddContestant: () => void
  onAddCategory: () => void
  onExportCSV: () => void
  onAddManualVote: () => void
}

export default function OverviewTab({
  onAddContestant,
  onAddCategory,
  onExportCSV,
  onAddManualVote,
}: OverviewTabProps) {
  return (
    <div>
      {/* Quick Actions */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6">
        <h3 className="text-base sm:text-lg font-bold text-burgundy-900 mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <button
            onClick={onAddContestant}
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
          >
            <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-gold-500 transition-colors">
              <Plus className="w-5 h-5 text-gold-600 group-hover:text-burgundy-900" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Contestant</span>
          </button>

          <button
            onClick={onAddCategory}
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-500 transition-colors">
              <Plus className="w-5 h-5 text-purple-600 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Category</span>
          </button>

          <button
            onClick={onExportCSV}
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-500 transition-colors">
              <Download className="w-5 h-5 text-blue-600 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Export CSV</span>
          </button>

          <button
            onClick={onAddManualVote}
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-500 transition-colors">
              <Plus className="w-5 h-5 text-green-600 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Manual Vote</span>
          </button>
        </div>
      </div>
    </div>
  )
}
