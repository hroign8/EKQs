'use client'

import { Edit, Plus, Eye, EyeOff, Trash2, Settings, Download, Upload } from 'lucide-react'
import type { Category, VotingPackage, AdminTab, ModalType } from '../types'
import { useToast } from '@/components/Toast'

interface SettingsTabProps {
  categoriesList: Category[]
  packagesList: VotingPackage[]
  votingActive: boolean
  publicResults: boolean
  eventFormData: { name: string; tagline: string; startDate: string; endDate: string; votingStart: string; votingEnd: string }
  onSetVotingActive: (active: boolean) => void
  onSetPublicResults: (show: boolean) => void
  onEditEvent: () => void
  onAddCategory: () => void
  onEditCategory: (category: Category) => void
  onDeleteCategory: (id: string) => void
  onResetVotes: () => void
  onExportCSV: () => void
  onSwitchTab: (tab: AdminTab) => void
  onOpenModal: (type: ModalType) => void
}

export default function SettingsTab({
  categoriesList,
  packagesList,
  votingActive,
  publicResults,
  eventFormData,
  onSetVotingActive,
  onSetPublicResults,
  onEditEvent,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onResetVotes,
  onExportCSV,
  onSwitchTab,
  onOpenModal,
}: SettingsTabProps) {
  const toast = useToast()
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Event Details */}
        <div className="bg-white rounded-2xl p-6 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-burgundy-900">Event Details</h3>
            <button
              onClick={onEditEvent}
              className="flex items-center gap-2 px-4 py-2 bg-burgundy-900 text-white rounded-full font-medium text-sm hover:bg-burgundy-800 transition-all"
            >
              <Edit className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Event Name</p>
              <p className="font-bold text-burgundy-900 mt-1">{eventFormData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tagline</p>
              <p className="font-medium text-gray-700 mt-1">{eventFormData.tagline}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Event Dates</p>
              <p className="font-medium text-gray-700 mt-1">{eventFormData.startDate} - {eventFormData.endDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Voting Period</p>
              <p className="font-medium text-gray-700 mt-1">{eventFormData.votingStart} - {eventFormData.votingEnd}</p>
            </div>
          </div>
        </div>

        {/* Voting Controls */}
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-bold text-burgundy-900 mb-6">Voting Controls</h3>

          <div className="space-y-4">
            <div className={`rounded-xl p-4 flex items-center justify-between ${votingActive ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div>
                <p className="font-bold text-burgundy-900">Voting Status</p>
                <p className="text-sm text-gray-500 mt-1">
                  {votingActive ? 'Currently accepting votes' : 'Voting is closed'}
                </p>
              </div>
              <button
                onClick={() => onSetVotingActive(!votingActive)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  votingActive
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {votingActive ? 'Close Voting' : 'Open Voting'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <div>
                <p className="font-bold text-burgundy-900 text-sm sm:text-base">Public Results</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                  {publicResults ? 'Visible to all voters' : 'Hidden from voters'}
                </p>
              </div>
              <button
                onClick={() => onSetPublicResults(!publicResults)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full hover:bg-gray-100 transition-all text-xs sm:text-sm font-medium text-gray-700 self-start sm:self-auto"
              >
                {publicResults ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-red-50 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <div>
                <p className="font-bold text-burgundy-900 text-sm sm:text-base">Reset All Votes</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Clear all votes and start fresh</p>
              </div>
              <button
                onClick={onResetVotes}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all text-xs sm:text-sm font-semibold self-start sm:self-auto"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Management Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Management */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-burgundy-900">Category Management</h3>
            <button
              onClick={onAddCategory}
              className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-burgundy-900 rounded-full font-semibold text-sm hover:bg-gold-400 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          <div className="space-y-2">
            {categoriesList.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-700">{category.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditCategory(category)}
                    aria-label={`Edit ${category.name}`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCategory(category.id)}
                    aria-label={`Delete ${category.name}`}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voting Packages Summary */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-burgundy-900">Voting Packages</h3>
            <button
              onClick={() => onSwitchTab('packages')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm hover:bg-gray-200 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>Manage</span>
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">Configure voting packages and pricing</p>
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-700">Active Packages</span>
              <p className="text-xs text-gray-500">{packagesList.filter(p => p.isActive).length} of {packagesList.length} packages enabled</p>
            </div>
            <span className="text-2xl font-black text-gold-500">{packagesList.filter(p => p.isActive).length}</span>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-burgundy-900 mb-4 sm:mb-6">Data Management</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={onExportCSV}
            className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-500 transition-colors">
              <Download className="w-6 h-6 text-blue-600 group-hover:text-white" />
            </div>
            <span className="font-medium text-gray-700">Export Data</span>
            <span className="text-xs text-gray-500 mt-1">Download as CSV</span>
          </button>

          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.csv'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) {
                  toast.info(`File "${file.name}" selected. Import functionality would process this file.`)
                }
              }
              input.click()
            }}
            className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-500 transition-colors">
              <Upload className="w-6 h-6 text-green-600 group-hover:text-white" />
            </div>
            <span className="font-medium text-gray-700">Import Data</span>
            <span className="text-xs text-gray-500 mt-1">Upload CSV file</span>
          </button>

          <button
            onClick={() => onOpenModal('advanced')}
            className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-500 transition-colors">
              <Settings className="w-6 h-6 text-purple-600 group-hover:text-white" />
            </div>
            <span className="font-medium text-gray-700">Advanced</span>
            <span className="text-xs text-gray-500 mt-1">System settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}
