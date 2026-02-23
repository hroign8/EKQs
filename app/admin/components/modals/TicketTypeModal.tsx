'use client'

import { FormInput } from '@/components/FormInput'
import type { AdminTicketType, TicketFormData } from '../../types'

interface TicketTypeModalProps {
  ticketFormData: TicketFormData
  setTicketFormData: (data: TicketFormData) => void
  editingTicket: AdminTicketType | null
  onSave: () => void
  onClose: () => void
}

const ICON_OPTIONS = [
  { value: 'ticket', label: 'Ticket (General)' },
  { value: 'star', label: 'Star (VIP)' },
  { value: 'crown', label: 'Crown (Premium)' },
]

export default function TicketTypeModal({
  ticketFormData,
  setTicketFormData,
  editingTicket,
  onSave,
  onClose,
}: TicketTypeModalProps) {
  return (
    <>
      <div className="p-6 space-y-4">
        <FormInput
          label="Ticket Name"
          required
          type="text"
          value={ticketFormData.name}
          onChange={(e) => setTicketFormData({ ...ticketFormData, name: e.target.value })}
          placeholder="e.g., General, VIP, Table"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Price ($)"
            required
            type="number"
            min={0}
            step={0.01}
            value={ticketFormData.price}
            onChange={(e) => setTicketFormData({ ...ticketFormData, price: e.target.value })}
            placeholder="e.g., 30.00"
          />
          <FormInput
            label="Sort Order"
            type="number"
            min={0}
            value={ticketFormData.sortOrder}
            onChange={(e) => setTicketFormData({ ...ticketFormData, sortOrder: e.target.value })}
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon Style</label>
          <select
            value={ticketFormData.icon}
            onChange={(e) => setTicketFormData({ ...ticketFormData, icon: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-200 transition-all"
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Features <span className="text-gray-400 font-normal">(one per line)</span>
          </label>
          <textarea
            value={ticketFormData.features}
            onChange={(e) => setTicketFormData({ ...ticketFormData, features: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-200 transition-all resize-none"
            placeholder={"Priority seating\nComplimentary drinks\nMeet & greet access"}
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={ticketFormData.popular}
            onChange={(e) => setTicketFormData({ ...ticketFormData, popular: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-gold-500 focus:ring-gold-500"
          />
          <span className="text-sm font-medium text-gray-700">Mark as &quot;Popular&quot;</span>
        </label>
      </div>

      <div className="p-6 border-t border-gray-100 flex items-center justify-end space-x-3">
        <button onClick={onClose} className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-6 py-3 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-200 hover:scale-105"
        >
          {editingTicket ? 'Update Ticket' : 'Add Ticket'}
        </button>
      </div>
    </>
  )
}
