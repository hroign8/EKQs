'use client'

import { FormInput, FormSelect } from '@/components/FormInput'
import type { Contestant } from '@/types'
import type { Category, VotingPackage } from '../../types'

interface VoteModalProps {
  voteFormData: { voterEmail: string; contestantId: string; categoryId: string }
  setVoteFormData: (data: { voterEmail: string; contestantId: string; categoryId: string }) => void
  voteFormPackageId: string
  setVoteFormPackageId: (id: string) => void
  contestantsList: Contestant[]
  categoriesList: Category[]
  packagesList: VotingPackage[]
  onSave: () => void
  onClose: () => void
}

export default function VoteModal({
  voteFormData,
  setVoteFormData,
  voteFormPackageId,
  setVoteFormPackageId,
  contestantsList,
  categoriesList,
  packagesList,
  onSave,
  onClose,
}: VoteModalProps) {
  const selectedPackage = packagesList.find((p) => p.id === voteFormPackageId)

  return (
    <>
      <div className="p-6 space-y-4">
        <FormInput
          label="Voter Email"
          required
          type="email"
          value={voteFormData.voterEmail}
          onChange={(e) => setVoteFormData({ ...voteFormData, voterEmail: e.target.value })}
          placeholder="voter@example.com"
        />

        <FormSelect
          label="Select Contestant"
          required
          value={voteFormData.contestantId}
          onChange={(e) => setVoteFormData({ ...voteFormData, contestantId: e.target.value })}
        >
          <option value="">Select contestant</option>
          {contestantsList.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </FormSelect>

        <FormSelect
          label="Select Category"
          required
          value={voteFormData.categoryId}
          onChange={(e) => setVoteFormData({ ...voteFormData, categoryId: e.target.value })}
        >
          <option value="">Select category</option>
          {categoriesList.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </FormSelect>

        <div>
          <FormSelect
            label="Select Package"
            required
            value={voteFormPackageId}
            onChange={(e) => setVoteFormPackageId(e.target.value)}
          >
            <option value="">Select package</option>
            {packagesList.filter((p) => p.isActive).map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name} — {pkg.votes} vote{pkg.votes > 1 ? 's' : ''} for ${pkg.price.toFixed(2)}
              </option>
            ))}
          </FormSelect>
          {selectedPackage && (
            <div className="mt-2 text-xs text-gray-600">
              <span className="font-semibold">{selectedPackage.name}</span>: {selectedPackage.votes} vote
              {selectedPackage.votes > 1 ? 's' : ''} for{' '}
              <span className="text-green-700 font-semibold">${selectedPackage.price.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
        <button onClick={onClose} className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!voteFormData.voterEmail || !voteFormData.contestantId || !voteFormData.categoryId || !voteFormPackageId}
          className="px-6 py-3 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Vote
        </button>
      </div>
    </>
  )
}
