'use client'

import { FormInput } from '@/components/FormInput'
import type { EventFormData } from '../../types'

interface EventModalProps {
  eventFormData: EventFormData
  setEventFormData: (data: EventFormData) => void
  onSave: () => void
  onClose: () => void
}

export default function EventModal({ eventFormData, setEventFormData, onSave, onClose }: EventModalProps) {
  return (
    <>
      <div className="p-6 space-y-4">
        <FormInput
          label="Event Name"
          required
          type="text"
          value={eventFormData.name}
          onChange={(e) => setEventFormData({ ...eventFormData, name: e.target.value })}
          placeholder="Event name"
        />

        <FormInput
          label="Tagline"
          type="text"
          value={eventFormData.tagline}
          onChange={(e) => setEventFormData({ ...eventFormData, tagline: e.target.value })}
          placeholder="Event tagline"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Start Date"
            type="text"
            value={eventFormData.startDate}
            onChange={(e) => setEventFormData({ ...eventFormData, startDate: e.target.value })}
            placeholder="Jan 1, 2026"
          />
          <FormInput
            label="End Date"
            type="text"
            value={eventFormData.endDate}
            onChange={(e) => setEventFormData({ ...eventFormData, endDate: e.target.value })}
            placeholder="Feb 28, 2026"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Voting Start"
            type="text"
            value={eventFormData.votingStart}
            onChange={(e) => setEventFormData({ ...eventFormData, votingStart: e.target.value })}
            placeholder="Jan 15, 2026"
          />
          <FormInput
            label="Voting End"
            type="text"
            value={eventFormData.votingEnd}
            onChange={(e) => setEventFormData({ ...eventFormData, votingEnd: e.target.value })}
            placeholder="Feb 25, 2026"
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
        <button onClick={onClose} className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-6 py-3 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-200 hover:scale-105"
        >
          Save Changes
        </button>
      </div>
    </>
  )
}
