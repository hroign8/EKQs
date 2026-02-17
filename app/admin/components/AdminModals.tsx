'use client'

import { X, Upload, Trash2 } from 'lucide-react'
import type { Contestant } from '@/types'
import type {
  Category,
  VotingPackage,
  ModalType,
  AdvancedSettings,
  ContestantFormData,
  EventFormData,
} from '../types'

interface AdminModalsProps {
  showModal: boolean
  modalType: ModalType
  onClose: () => void
  // Contestant
  formData: ContestantFormData
  setFormData: (data: ContestantFormData) => void
  editingContestant: Contestant | null
  onSaveContestant: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  isDragging: boolean
  isUploading: boolean
  uploadProgress: number
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  // Category
  categoryFormData: { id: string; name: string }
  setCategoryFormData: (data: { id: string; name: string }) => void
  editingCategory: Category | null
  onSaveCategory: () => void
  // Vote
  voteFormData: { voterEmail: string; contestantId: string; categoryId: string }
  setVoteFormData: (data: { voterEmail: string; contestantId: string; categoryId: string }) => void
  voteFormPackageId: string
  setVoteFormPackageId: (id: string) => void
  contestantsList: Contestant[]
  categoriesList: Category[]
  packagesList: VotingPackage[]
  onSaveManualVote: () => void
  // Event
  eventFormData: EventFormData
  setEventFormData: (data: EventFormData) => void
  onSaveEvent: () => void
  // Package
  packageFormData: { name: string; votes: string; price: string }
  setPackageFormData: (data: { name: string; votes: string; price: string }) => void
  editingPackage: VotingPackage | null
  onSavePackage: () => void
  // Advanced
  advancedSettings: AdvancedSettings
  setAdvancedSettings: (settings: AdvancedSettings) => void
}

export default function AdminModals({
  showModal,
  modalType,
  onClose,
  formData,
  setFormData,
  editingContestant,
  onSaveContestant,
  fileInputRef,
  isDragging,
  isUploading,
  uploadProgress,
  onDragOver,
  onDragLeave,
  onDrop,
  onImageUpload,
  categoryFormData,
  setCategoryFormData,
  editingCategory,
  onSaveCategory,
  voteFormData,
  setVoteFormData,
  voteFormPackageId,
  setVoteFormPackageId,
  contestantsList,
  categoriesList,
  packagesList,
  onSaveManualVote,
  eventFormData,
  setEventFormData,
  onSaveEvent,
  packageFormData,
  setPackageFormData,
  editingPackage,
  onSavePackage,
  advancedSettings,
  setAdvancedSettings,
}: AdminModalsProps) {
  if (!showModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl relative overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="bg-burgundy-900 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <h2 className="text-base sm:text-xl font-bold text-white">
            {modalType === 'contestant' && (editingContestant ? 'Edit Contestant' : 'Add New Contestant')}
            {modalType === 'category' && (editingCategory ? 'Edit Category' : 'Add New Category')}
            {modalType === 'vote' && 'Add Manual Vote'}
            {modalType === 'event' && 'Edit Event Details'}
            {modalType === 'package' && (editingPackage ? 'Edit Package' : 'Add New Package')}
            {modalType === 'advanced' && 'Advanced Settings'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contestant Form */}
        {modalType === 'contestant' && (
          <>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  placeholder="Enter country"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                >
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Photo <span className="text-red-500">*</span>
                </label>

                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => !formData.image && fileInputRef.current?.click()}
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                    formData.image
                      ? 'border-0'
                      : isDragging
                        ? 'border-2 border-dashed border-gold-500 bg-gold-50/50 scale-[1.02]'
                        : 'border-2 border-dashed border-gray-200 hover:border-gold-400 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={onImageUpload}
                    className="hidden"
                  />

                  {formData.image ? (
                    <div className="relative group">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-56 object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                      <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            fileInputRef.current?.click()
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white hover:scale-105 transition-all duration-200"
                        >
                          <Upload className="w-4 h-4 text-gold-600" />
                          <span className="text-sm font-medium text-gray-800">Change</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setFormData({ ...formData, image: '' })
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-red-500/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-red-500 hover:scale-105 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                          <span className="text-sm font-medium text-white">Remove</span>
                        </button>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Uploaded
                      </div>
                    </div>
                  ) : isUploading ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 relative">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            strokeDasharray="100, 100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className="text-gold-500"
                            strokeDasharray={`${uploadProgress}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gold-600">
                          {uploadProgress}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Uploading...</p>
                      <p className="text-xs text-gray-500 mt-1">Please wait</p>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isDragging
                          ? 'bg-gold-100 scale-110'
                          : 'bg-gray-100 group-hover:bg-gold-50'
                      }`}>
                        <Upload className={`w-7 h-7 transition-all duration-300 ${
                          isDragging ? 'text-gold-600 scale-110' : 'text-gray-400'
                        }`} />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {isDragging ? 'Drop your image here' : 'Drag & drop your image here'}
                      </p>
                      <p className="text-xs text-gray-500 mb-4">or click to browse</p>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <span className="px-2 py-1 bg-gray-100 rounded">JPG</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">PNG</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">GIF</span>
                        <span className="text-gray-300">|</span>
                        <span>Max 5MB</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all resize-none"
                  placeholder="Enter brief description about the contestant"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSaveContestant}
                className="px-6 py-3 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-200 hover:scale-105"
              >
                {editingContestant ? 'Update Contestant' : 'Add Contestant'}
              </button>
            </div>
          </>
        )}

        {/* Category Form */}
        {modalType === 'category' && (
          <>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  placeholder="Enter category name"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSaveCategory}
                className="px-6 py-3 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-200 hover:scale-105"
              >
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
            </div>
          </>
        )}

        {/* Manual Vote Form */}
        {modalType === 'vote' && (
          <>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Voter Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={voteFormData.voterEmail}
                  onChange={(e) => setVoteFormData({ ...voteFormData, voterEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  placeholder="voter@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Select Contestant <span className="text-red-500">*</span>
                </label>
                <select
                  value={voteFormData.contestantId}
                  onChange={(e) => setVoteFormData({ ...voteFormData, contestantId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                >
                  <option value="">Select contestant</option>
                  {contestantsList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Select Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={voteFormData.categoryId}
                  onChange={(e) => setVoteFormData({ ...voteFormData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                >
                  <option value="">Select category</option>
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Select Package <span className="text-red-500">*</span>
                </label>
                <select
                  value={voteFormPackageId}
                  onChange={(e) => setVoteFormPackageId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                >
                  <option value="">Select package</option>
                  {packagesList.filter(p => p.isActive).map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — {pkg.votes} vote{pkg.votes > 1 ? 's' : ''} for ${pkg.price.toFixed(2)}
                    </option>
                  ))}
                </select>
                {voteFormPackageId && (
                  <div className="mt-2 text-xs text-gray-600">
                    {(() => {
                      const pkg = packagesList.find(p => p.id === voteFormPackageId);
                      if (!pkg) return null;
                      return (
                        <span>
                          <span className="font-semibold">{pkg.name}</span>: {pkg.votes} vote{pkg.votes > 1 ? 's' : ''} for <span className="text-green-700 font-semibold">${pkg.price.toFixed(2)}</span>
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSaveManualVote}
                className="px-6 py-3 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!voteFormData.voterEmail || !voteFormData.contestantId || !voteFormData.categoryId || !voteFormPackageId}
              >
                Add Vote
              </button>
            </div>
          </>
        )}

        {/* Event Details Form */}
        {modalType === 'event' && (
          <>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={eventFormData.name}
                  onChange={(e) => setEventFormData({ ...eventFormData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  placeholder="Event name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={eventFormData.tagline}
                  onChange={(e) => setEventFormData({ ...eventFormData, tagline: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  placeholder="Event tagline"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-burgundy-900 mb-2">Start Date</label>
                  <input
                    type="text"
                    value={eventFormData.startDate}
                    onChange={(e) => setEventFormData({ ...eventFormData, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    placeholder="Jan 1, 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-burgundy-900 mb-2">End Date</label>
                  <input
                    type="text"
                    value={eventFormData.endDate}
                    onChange={(e) => setEventFormData({ ...eventFormData, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    placeholder="Feb 28, 2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-burgundy-900 mb-2">Voting Start</label>
                  <input
                    type="text"
                    value={eventFormData.votingStart}
                    onChange={(e) => setEventFormData({ ...eventFormData, votingStart: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    placeholder="Jan 15, 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-burgundy-900 mb-2">Voting End</label>
                  <input
                    type="text"
                    value={eventFormData.votingEnd}
                    onChange={(e) => setEventFormData({ ...eventFormData, votingEnd: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    placeholder="Feb 25, 2026"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSaveEvent}
                className="px-6 py-3 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-200 hover:scale-105"
              >
                Save Changes
              </button>
            </div>
          </>
        )}

        {/* Package Form */}
        {modalType === 'package' && (
          <>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Package Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={packageFormData.name}
                  onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all uppercase"
                  placeholder="e.g., DIAMOND, GOLD, SILVER"
                />
                <p className="text-xs text-gray-500 mt-1">Name will be displayed in uppercase</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                    Number of Votes <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={packageFormData.votes}
                    onChange={(e) => setPackageFormData({ ...packageFormData, votes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={packageFormData.price}
                    onChange={(e) => setPackageFormData({ ...packageFormData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    placeholder="e.g., 27.00"
                  />
                </div>
              </div>

              {packageFormData.votes && packageFormData.price && (
                <div className="bg-gold-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price per vote:</span>
                    <span className="font-bold text-gold-600">
                      ${(parseFloat(packageFormData.price) / parseInt(packageFormData.votes) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSavePackage}
                className="px-6 py-3 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-200 hover:scale-105"
              >
                {editingPackage ? 'Update Package' : 'Add Package'}
              </button>
            </div>
          </>
        )}

        {/* Advanced Settings Form */}
        {modalType === 'advanced' && (
          <>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-burgundy-900 uppercase tracking-wide mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900">Maintenance Mode</div>
                      <div className="text-sm text-gray-500">Disable public access temporarily</div>
                    </div>
                    <button
                      onClick={() => setAdvancedSettings({ ...advancedSettings, maintenanceMode: !advancedSettings.maintenanceMode })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        advancedSettings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        advancedSettings.maintenanceMode ? 'translate-x-7' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900">Debug Mode</div>
                      <div className="text-sm text-gray-500">Enable detailed error logging</div>
                    </div>
                    <button
                      onClick={() => setAdvancedSettings({ ...advancedSettings, debugMode: !advancedSettings.debugMode })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        advancedSettings.debugMode ? 'bg-gold-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        advancedSettings.debugMode ? 'translate-x-7' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-burgundy-900 uppercase tracking-wide mb-4">Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900">Email Notifications</div>
                      <div className="text-sm text-gray-500">Send alerts for new votes</div>
                    </div>
                    <button
                      onClick={() => setAdvancedSettings({ ...advancedSettings, emailNotifications: !advancedSettings.emailNotifications })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        advancedSettings.emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        advancedSettings.emailNotifications ? 'translate-x-7' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900">Auto Backup</div>
                      <div className="text-sm text-gray-500">Daily automatic data backup</div>
                    </div>
                    <button
                      onClick={() => setAdvancedSettings({ ...advancedSettings, autoBackup: !advancedSettings.autoBackup })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        advancedSettings.autoBackup ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        advancedSettings.autoBackup ? 'translate-x-7' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-burgundy-900 uppercase tracking-wide mb-4">Limits & Security</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Votes/User</label>
                    <input
                      type="number"
                      value={advancedSettings.maxVotesPerUser}
                      onChange={(e) => setAdvancedSettings({ ...advancedSettings, maxVotesPerUser: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (min)</label>
                    <input
                      type="number"
                      value={advancedSettings.sessionTimeout}
                      onChange={(e) => setAdvancedSettings({ ...advancedSettings, sessionTimeout: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit/min</label>
                    <input
                      type="number"
                      value={advancedSettings.apiRateLimit}
                      onChange={(e) => setAdvancedSettings({ ...advancedSettings, apiRateLimit: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-4">Danger Zone</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2.5 bg-red-50 text-red-600 rounded-full font-medium hover:bg-red-100 transition-colors">
                    Reset All Votes
                  </button>
                  <button className="px-4 py-2.5 bg-red-50 text-red-600 rounded-full font-medium hover:bg-red-100 transition-colors">
                    Clear Vote Log
                  </button>
                  <button className="px-4 py-2.5 bg-red-50 text-red-600 rounded-full font-medium hover:bg-red-100 transition-colors">
                    Factory Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-200 hover:scale-105"
              >
                Save Settings
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
