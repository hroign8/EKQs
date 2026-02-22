'use client'

import { X } from 'lucide-react'
import type { Contestant } from '@/types'
import type {
  Category,
  VotingPackage,
  ModalType,
  AdvancedSettings,
  ContestantFormData,
  EventFormData,
} from '../types'
import ContestantModal from './modals/ContestantModal'
import CategoryModal from './modals/CategoryModal'
import VoteModal from './modals/VoteModal'
import EventModal from './modals/EventModal'
import PackageModal from './modals/PackageModal'
import AdvancedSettingsModal from './modals/AdvancedSettingsModal'

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

const MODAL_TITLE: Record<ModalType, string | ((props: AdminModalsProps) => string)> = {
  contestant: (p) => (p.editingContestant ? 'Edit Contestant' : 'Add New Contestant'),
  category: (p) => (p.editingCategory ? 'Edit Category' : 'Add New Category'),
  vote: 'Add Manual Vote',
  event: 'Edit Event Details',
  package: (p) => (p.editingPackage ? 'Edit Package' : 'Add New Package'),
  advanced: 'Advanced Settings',
}

function resolveTitle(props: AdminModalsProps): string {
  const t = MODAL_TITLE[props.modalType]
  return typeof t === 'function' ? t(props) : t
}

export default function AdminModals(props: AdminModalsProps) {
  const {
    showModal, modalType, onClose,
    formData, setFormData, editingContestant, onSaveContestant,
    fileInputRef, isDragging, isUploading, uploadProgress,
    onDragOver, onDragLeave, onDrop, onImageUpload,
    categoryFormData, setCategoryFormData, editingCategory, onSaveCategory,
    voteFormData, setVoteFormData, voteFormPackageId, setVoteFormPackageId,
    contestantsList, categoriesList, packagesList, onSaveManualVote,
    eventFormData, setEventFormData, onSaveEvent,
    packageFormData, setPackageFormData, editingPackage, onSavePackage,
    advancedSettings, setAdvancedSettings,
  } = props

  if (!showModal) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl relative overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="bg-burgundy-900 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <h2 id="modal-title" className="text-base sm:text-xl font-bold text-white">
            {resolveTitle(props)}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {modalType === 'contestant' && (
          <ContestantModal
            formData={formData}
            setFormData={setFormData}
            editingContestant={editingContestant}
            fileInputRef={fileInputRef}
            isDragging={isDragging}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onImageUpload={onImageUpload}
            onSave={onSaveContestant}
            onClose={onClose}
          />
        )}


        {modalType === 'category' && (
          <CategoryModal
            categoryFormData={categoryFormData}
            setCategoryFormData={setCategoryFormData}
            editingCategory={editingCategory}
            onSave={onSaveCategory}
            onClose={onClose}
          />
        )}

        {modalType === 'vote' && (
          <VoteModal
            voteFormData={voteFormData}
            setVoteFormData={setVoteFormData}
            voteFormPackageId={voteFormPackageId}
            setVoteFormPackageId={setVoteFormPackageId}
            contestantsList={contestantsList}
            categoriesList={categoriesList}
            packagesList={packagesList}
            onSave={onSaveManualVote}
            onClose={onClose}
          />
        )}

        {modalType === 'event' && (
          <EventModal
            eventFormData={eventFormData}
            setEventFormData={setEventFormData}
            onSave={onSaveEvent}
            onClose={onClose}
          />
        )}

        {modalType === 'package' && (
          <PackageModal
            packageFormData={packageFormData}
            setPackageFormData={setPackageFormData}
            editingPackage={editingPackage}
            onSave={onSavePackage}
            onClose={onClose}
          />
        )}

        {modalType === 'advanced' && (
          <AdvancedSettingsModal
            advancedSettings={advancedSettings}
            setAdvancedSettings={setAdvancedSettings}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}
