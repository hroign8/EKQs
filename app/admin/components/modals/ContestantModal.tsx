'use client'

import { Upload, Trash2 } from 'lucide-react'
import { FormInput, FormSelect, FormTextarea } from '@/components/FormInput'
import type { ContestantFormData } from '../../types'
import type { Contestant } from '@/types'

interface ContestantModalProps {
  formData: ContestantFormData
  setFormData: (data: ContestantFormData) => void
  editingContestant: Contestant | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  isDragging: boolean
  isUploading: boolean
  uploadProgress: number
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSave: () => void
  onClose: () => void
}

export default function ContestantModal({
  formData,
  setFormData,
  editingContestant,
  fileInputRef,
  isDragging,
  isUploading,
  uploadProgress,
  onDragOver,
  onDragLeave,
  onDrop,
  onImageUpload,
  onSave,
  onClose,
}: ContestantModalProps) {
  return (
    <>
      <div className="p-6 space-y-4">
        <FormInput
          label="Full Name"
          required
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter full name"
        />

        <FormInput
          label="Country"
          required
          type="text"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          placeholder="Enter country"
        />

        <FormSelect
          label="Gender"
          required
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
        >
          <option value="">Select gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
        </FormSelect>

        {/* Photo upload */}
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
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white hover:scale-105 transition-all duration-200"
                  >
                    <Upload className="w-4 h-4 text-gold-600" />
                    <span className="text-sm font-medium text-gray-800">Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, image: '' }) }}
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
                      fill="none" stroke="currentColor" strokeWidth="3"
                    />
                    <path
                      className="text-gold-500"
                      strokeDasharray={`${uploadProgress}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
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
                  isDragging ? 'bg-gold-100 scale-110' : 'bg-gray-100'
                }`}>
                  <Upload className={`w-7 h-7 transition-all duration-300 ${isDragging ? 'text-gold-600 scale-110' : 'text-gray-400'}`} />
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

        <FormTextarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          placeholder="Enter brief description about the contestant"
        />
      </div>

      <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
        <button onClick={onClose} className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-6 py-3 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-200 hover:scale-105"
        >
          {editingContestant ? 'Update Contestant' : 'Add Contestant'}
        </button>
      </div>
    </>
  )
}
