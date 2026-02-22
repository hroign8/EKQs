'use client'

import { FormInput } from '@/components/FormInput'
import type { Category } from '../../types'

interface CategoryModalProps {
  categoryFormData: { id: string; name: string }
  setCategoryFormData: (data: { id: string; name: string }) => void
  editingCategory: Category | null
  onSave: () => void
  onClose: () => void
}

export default function CategoryModal({
  categoryFormData,
  setCategoryFormData,
  editingCategory,
  onSave,
  onClose,
}: CategoryModalProps) {
  return (
    <>
      <div className="p-6 space-y-4">
        <FormInput
          label="Category Name"
          required
          type="text"
          value={categoryFormData.name}
          onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
          placeholder="Enter category name"
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
          {editingCategory ? 'Update Category' : 'Add Category'}
        </button>
      </div>
    </>
  )
}
