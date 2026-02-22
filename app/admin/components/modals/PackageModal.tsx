'use client'

import { FormInput } from '@/components/FormInput'
import type { VotingPackage } from '../../types'

interface PackageModalProps {
  packageFormData: { name: string; votes: string; price: string }
  setPackageFormData: (data: { name: string; votes: string; price: string }) => void
  editingPackage: VotingPackage | null
  onSave: () => void
  onClose: () => void
}

export default function PackageModal({
  packageFormData,
  setPackageFormData,
  editingPackage,
  onSave,
  onClose,
}: PackageModalProps) {
  const pricePerVote =
    packageFormData.votes && packageFormData.price
      ? (parseFloat(packageFormData.price) / parseInt(packageFormData.votes) || 0).toFixed(2)
      : null

  return (
    <>
      <div className="p-6 space-y-4">
        <div>
          <FormInput
            label="Package Name"
            required
            type="text"
            value={packageFormData.name}
            onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
            placeholder="e.g., DIAMOND, GOLD, SILVER"
            className="uppercase"
          />
          <p className="text-xs text-gray-500 mt-1">Name will be displayed in uppercase</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Number of Votes"
            required
            type="number"
            min={1}
            value={packageFormData.votes}
            onChange={(e) => setPackageFormData({ ...packageFormData, votes: e.target.value })}
            placeholder="e.g., 100"
          />
          <FormInput
            label="Price ($)"
            required
            type="number"
            min={0}
            step={0.01}
            value={packageFormData.price}
            onChange={(e) => setPackageFormData({ ...packageFormData, price: e.target.value })}
            placeholder="e.g., 27.00"
          />
        </div>

        {pricePerVote !== null && (
          <div className="bg-gold-50 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Price per vote:</span>
            <span className="font-bold text-gold-600">${pricePerVote}</span>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
        <button onClick={onClose} className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-6 py-3 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-200 hover:scale-105"
        >
          {editingPackage ? 'Update Package' : 'Add Package'}
        </button>
      </div>
    </>
  )
}
