'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useSession } from '@/lib/auth-client'
import { isAdmin } from '@/types'
import type { Contestant } from '@/types'
import { useToast } from '@/components/Toast'
import type {
  Category,
  VotingPackage,
  VoteLogEntry,
  ModalType,
  AdvancedSettings,
  ContestantFormData,
  EventFormData,
  AdminTicketType,
  TicketFormData,
  TicketPurchaseEntry,
} from '../types'
import type { AdminUser } from '../components/UsersTab'
import { getVotes, getTotalVotes } from '../types'

interface OverviewData {
  totalContestants: number
  totalVotes: number
  totalRevenue: number
  totalTickets: number
  recentMessages: number
}

/**
 * Custom hook that manages all admin dashboard state and API handlers.
 * Extracted from AdminPage to reduce component size and improve testability.
 */
export function useAdminData() {
  const { data: session, isPending: sessionPending } = useSession()
  const toast = useToast()

  // ── Data state ──────────────────────────────────────────
  const [contestantsList, setContestantsList] = useState<Contestant[]>([])
  const [categoriesList, setCategoriesList] = useState<Category[]>([])
  const [packagesList, setPackagesList] = useState<VotingPackage[]>([])
  const [voteLogList, setVoteLogList] = useState<VoteLogEntry[]>([])
  const [usersList, setUsersList] = useState<AdminUser[]>([])
  const [overviewData, setOverviewData] = useState<OverviewData>({
    totalContestants: 0,
    totalVotes: 0,
    totalRevenue: 0,
    totalTickets: 0,
    recentMessages: 0,
  })
  const [dataLoading, setDataLoading] = useState(true)
  const [votingActive, setVotingActive] = useState(true)
  const [publicResults, setPublicResults] = useState(false)

  // ── UI state ────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<ModalType>('contestant')
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingPackage, setEditingPackage] = useState<VotingPackage | null>(null)
  const [editingTicket, setEditingTicket] = useState<AdminTicketType | null>(null)

  // ── Form state ──────────────────────────────────────────
  const [formData, setFormData] = useState<ContestantFormData>({
    name: '',
    country: '',
    gender: '',
    image: '',
    description: '',
  })
  const [categoryFormData, setCategoryFormData] = useState({ id: '', name: '' })
  const [voteFormData, setVoteFormData] = useState({
    voterEmail: '',
    contestantId: '',
    categoryId: '',
  })
  const [voteFormPackageId, setVoteFormPackageId] = useState('')
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    name: '',
    tagline: '',
    startDate: '',
    endDate: '',
    votingStart: '',
    votingEnd: '',
  })
  const [packageFormData, setPackageFormData] = useState({ name: '', votes: '', price: '' })
  const [ticketTypesList, setTicketTypesList] = useState<AdminTicketType[]>([])
  const [ticketPurchasesList, setTicketPurchasesList] = useState<TicketPurchaseEntry[]>([])
  const [ticketFormData, setTicketFormData] = useState<TicketFormData>({
    name: '',
    price: '',
    features: '',
    icon: 'ticket',
    popular: false,
    sortOrder: '0',
  })
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
    debugMode: false,
    maxVotesPerUser: '1000',
    sessionTimeout: '30',
    apiRateLimit: '100',
  })

  // ── Image upload state ──────────────────────────────────
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const deleteConfirmRef = useRef<{ key: string; timeout: ReturnType<typeof setTimeout> } | null>(null)

  // ── Data fetching ───────────────────────────────────────
  const fetchAdminData = useCallback(async () => {
    setDataLoading(true)
    try {
      const [contestantsRes, categoriesRes, packagesRes, votesRes, overviewRes, eventRes, usersRes, ticketsRes] = await Promise.all([
        fetch('/api/admin/contestants'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/packages'),
        fetch('/api/admin/votes'),
        fetch('/api/admin/overview'),
        fetch('/api/admin/event'),
        fetch('/api/admin/users'),
        fetch('/api/admin/tickets'),
      ])

      if (contestantsRes.ok) {
        setContestantsList(await contestantsRes.json())
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategoriesList(data)
        if (data.length > 0) {
          // Use functional setter so this never re-creates fetchAdminData on category change
          setSelectedCategory(prev => prev || (data[0].slug || data[0].id))
        }
      }
      if (packagesRes.ok) {
        setPackagesList(await packagesRes.json())
      }
      if (votesRes.ok) {
        const data = await votesRes.json()
        const entries = (data.votes || []).map((v: { id: string; time: string; voterEmail: string; voterName?: string; contestant: string; category: string; verified: boolean; packageName: string; votesCount: number; amountPaid: number }) => ({
          id: v.id,
          time: new Date(v.time).toLocaleString(),
          voterEmail: v.voterEmail || 'unknown',
          voterName: v.voterName || '',
          contestant: v.contestant || 'unknown',
          category: v.category || 'unknown',
          verified: v.verified,
          packageName: v.packageName || '',
          votesCount: v.votesCount,
          amountPaid: v.amountPaid,
        }))
        setVoteLogList(entries)
      }
      if (overviewRes.ok) {
        setOverviewData(await overviewRes.json())
      }
      if (usersRes.ok) {
        setUsersList(await usersRes.json())
      }
      if (ticketsRes.ok) {
        const ticketData = await ticketsRes.json()
        setTicketTypesList(ticketData.types || [])
        setTicketPurchasesList(ticketData.purchases || [])
      }
      if (eventRes.ok) {
        const data = await eventRes.json()
        if (data && !data.error) {
          setEventFormData({
            name: data.name || '',
            tagline: data.tagline || '',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            votingStart: data.votingStart || '',
            votingEnd: data.votingEnd || '',
          })
          setVotingActive(data.votingOpen ?? true)
          setPublicResults(data.publicResults ?? false)
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      toast.error('Failed to load admin data. Please refresh the page.')
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!sessionPending && session?.user && isAdmin(session.user)) {
      fetchAdminData()
    }
  }, [sessionPending, session, fetchAdminData])

  // ── Image upload helpers ────────────────────────────────
  const processImageFile = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const reader = new FileReader()
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100))
      }
    }
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData(prev => ({ ...prev, image: base64String }))
      setIsUploading(false)
      setUploadProgress(100)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImageFile(file)
  }, [processImageFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processImageFile(file)
  }, [processImageFile])

  // ── Modal helpers ───────────────────────────────────────
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setModalType('contestant')
    setEditingContestant(null)
    setEditingCategory(null)
    setEditingPackage(null)
    setPackageFormData({ name: '', votes: '', price: '' })
  }, [])

  const handleOpenModal = useCallback((type: ModalType) => {
    setModalType(type)
    setShowModal(true)
  }, [])

  /**
   * Two-click delete guard — replaces blocking confirm() dialogs.
   * First call shows a toast; second call within 5 s executes the action.
   */
  const requireDeleteConfirm = useCallback((key: string, action: () => Promise<void>) => {
    if (deleteConfirmRef.current?.key === key) {
      clearTimeout(deleteConfirmRef.current.timeout)
      deleteConfirmRef.current = null
      void action()
      return
    }
    if (deleteConfirmRef.current) {
      clearTimeout(deleteConfirmRef.current.timeout)
    }
    const timeout = setTimeout(() => { deleteConfirmRef.current = null }, 5000)
    deleteConfirmRef.current = { key, timeout }
    toast.error('Click again within 5 seconds to confirm.')
  }, [toast])

  // ── Contestant handlers ─────────────────────────────────
  const handleAddContestant = useCallback(() => {
    setEditingContestant(null)
    setFormData({ name: '', country: '', gender: '', image: '', description: '' })
    setModalType('contestant')
    setShowModal(true)
  }, [])

  const handleEditContestant = useCallback((contestant: Contestant) => {
    setEditingContestant(contestant)
    setFormData({
      name: contestant.name,
      country: contestant.country,
      gender: contestant.gender,
      image: contestant.image,
      description: contestant.description,
    })
    setModalType('contestant')
    setShowModal(true)
  }, [])

  const handleDeleteContestant = useCallback((id: string) => {
    requireDeleteConfirm(`contestant-${id}`, async () => {
      try {
        const res = await fetch(`/api/admin/contestants?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          setContestantsList(prev => prev.filter(c => c.id !== id))
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to delete contestant')
        }
      } catch { toast.error('Failed to delete contestant') }
    })
  }, [requireDeleteConfirm, toast])

  const handleSaveContestant = useCallback(async () => {
    if (!formData.name || !formData.country || !formData.gender) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (editingContestant) {
        const res = await fetch('/api/admin/contestants', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingContestant.id, ...formData }),
        })
        if (res.ok) {
          const updated = await res.json()
          setContestantsList(prev => prev.map(c => c.id === editingContestant.id ? updated : c))
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to update contestant')
          return
        }
      } else {
        const res = await fetch('/api/admin/contestants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (res.ok) {
          const newContestant = await res.json()
          setContestantsList(prev => [...prev, newContestant])
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to add contestant')
          return
        }
      }
      handleCloseModal()
    } catch { toast.error('An error occurred while saving') }
  }, [formData, editingContestant, handleCloseModal])

  // ── Category handlers ───────────────────────────────────
  const handleAddCategory = useCallback(() => {
    setEditingCategory(null)
    setCategoryFormData({ id: '', name: '' })
    setModalType('category')
    setShowModal(true)
  }, [])

  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({ id: category.id, name: category.name })
    setModalType('category')
    setShowModal(true)
  }, [])

  const handleDeleteCategory = useCallback((id: string) => {
    requireDeleteConfirm(`category-${id}`, async () => {
      try {
        const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          setCategoriesList(prev => prev.filter(c => c.id !== id))
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to delete category')
        }
      } catch { toast.error('Failed to delete category') }
    })
  }, [requireDeleteConfirm, toast])

  const handleSaveCategory = useCallback(async () => {
    if (!categoryFormData.name) {
      toast.error('Please enter a category name')
      return
    }

    try {
      if (editingCategory) {
        const res = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCategory.id, name: categoryFormData.name }),
        })
        if (res.ok) {
          const updated = await res.json()
          setCategoriesList(prev => prev.map(c => c.id === editingCategory.id ? updated : c))
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to update category')
          return
        }
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: categoryFormData.name }),
        })
        if (res.ok) {
          const newCat = await res.json()
          setCategoriesList(prev => [...prev, newCat])
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to add category')
          return
        }
      }
      setShowModal(false)
      setModalType('contestant')
    } catch { toast.error('An error occurred while saving') }
  }, [categoryFormData, editingCategory])

  // ── Vote handlers ───────────────────────────────────────
  const handleAddManualVote = useCallback(() => {
    setVoteFormData({ voterEmail: '', contestantId: '', categoryId: '' })
    setModalType('vote')
    setShowModal(true)
  }, [])

  const handleSaveManualVote = useCallback(async () => {
    if (!voteFormData.voterEmail || !voteFormData.contestantId || !voteFormData.categoryId || !voteFormPackageId) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const res = await fetch('/api/admin/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterEmail: voteFormData.voterEmail,
          contestantId: voteFormData.contestantId,
          categoryId: voteFormData.categoryId,
          packageId: voteFormPackageId,
        }),
      })

      if (res.ok) {
        await fetchAdminData()
        setShowModal(false)
        setModalType('contestant')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to record vote')
      }
    } catch { toast.error('An error occurred while saving the vote') }
  }, [voteFormData, voteFormPackageId, fetchAdminData])

  // ── Event handlers ──────────────────────────────────────
  const handleEditEvent = useCallback(() => {
    setModalType('event')
    setShowModal(true)
  }, [])

  const handleSaveEvent = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/event', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventFormData),
      })
      if (res.ok) {
        toast.success('Event details saved successfully!')
        setShowModal(false)
        setModalType('contestant')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save event details')
      }
    } catch { toast.error('An error occurred while saving') }
  }, [eventFormData, toast])

  // ── Package handlers ────────────────────────────────────
  const handleAddPackage = useCallback(() => {
    setEditingPackage(null)
    setPackageFormData({ name: '', votes: '', price: '' })
    setModalType('package')
    setShowModal(true)
  }, [])

  const handleEditPackage = useCallback((pkg: VotingPackage) => {
    setEditingPackage(pkg)
    setPackageFormData({
      name: pkg.name,
      votes: pkg.votes.toString(),
      price: pkg.price.toString(),
    })
    setModalType('package')
    setShowModal(true)
  }, [])

  const handleDeletePackage = useCallback((id: string) => {
    requireDeleteConfirm(`package-${id}`, async () => {
      try {
        const res = await fetch(`/api/admin/packages?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          setPackagesList(prev => prev.filter(p => p.id !== id))
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to delete package')
        }
      } catch { toast.error('Failed to delete package') }
    })
  }, [requireDeleteConfirm, toast])

  const handleTogglePackage = useCallback(async (id: string) => {
    const pkg = packagesList.find(p => p.id === id)
    if (!pkg) return
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !pkg.isActive }),
      })
      if (res.ok) {
        setPackagesList(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p))
      }
    } catch { toast.error('Failed to toggle package') }
  }, [packagesList])

  const handleSavePackage = useCallback(async () => {
    if (!packageFormData.name || !packageFormData.votes || !packageFormData.price) {
      toast.error('Please fill in all fields')
      return
    }

    const votes = parseInt(packageFormData.votes)
    const price = parseFloat(packageFormData.price)

    if (isNaN(votes) || isNaN(price) || votes <= 0 || price < 0) {
      toast.error('Please enter valid numbers for votes and price')
      return
    }

    try {
      if (editingPackage) {
        const res = await fetch('/api/admin/packages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPackage.id, name: packageFormData.name, votes, price }),
        })
        if (res.ok) {
          const updated = await res.json()
          setPackagesList(prev => prev.map(p => p.id === editingPackage.id ? updated : p))
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to update package')
          return
        }
      } else {
        const res = await fetch('/api/admin/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: packageFormData.name, votes, price }),
        })
        if (res.ok) {
          const newPkg = await res.json()
          setPackagesList(prev => [...prev, newPkg])
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to add package')
          return
        }
      }
      handleCloseModal()
    } catch { toast.error('An error occurred while saving') }
  }, [packageFormData, editingPackage, handleCloseModal])

  // ── Ticket type handlers ────────────────────────────────
  const handleAddTicket = useCallback(() => {
    setEditingTicket(null)
    setTicketFormData({ name: '', price: '', features: '', icon: 'ticket', popular: false, sortOrder: '0' })
    setModalType('ticket')
    setShowModal(true)
  }, [])

  const handleEditTicket = useCallback((t: AdminTicketType) => {
    setEditingTicket(t)
    setTicketFormData({
      name: t.name,
      price: t.price.toString(),
      features: t.features.join('\n'),
      icon: t.icon,
      popular: t.popular,
      sortOrder: t.sortOrder.toString(),
    })
    setModalType('ticket')
    setShowModal(true)
  }, [])

  const handleDeleteTicket = useCallback((id: string) => {
    requireDeleteConfirm(`ticket-${id}`, async () => {
      try {
        const res = await fetch(`/api/admin/tickets?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          setTicketTypesList(prev => prev.filter(t => t.id !== id))
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to delete ticket type')
        }
      } catch { toast.error('Failed to delete ticket type') }
    })
  }, [requireDeleteConfirm, toast])

  const handleToggleTicket = useCallback(async (id: string) => {
    const ticket = ticketTypesList.find(t => t.id === id)
    if (!ticket) return
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !ticket.isActive }),
      })
      if (res.ok) {
        setTicketTypesList(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t))
      }
    } catch { toast.error('Failed to toggle ticket type') }
  }, [ticketTypesList])

  const handleSaveTicket = useCallback(async () => {
    if (!ticketFormData.name || !ticketFormData.price) {
      toast.error('Please fill in name and price')
      return
    }
    const price = parseFloat(ticketFormData.price)
    const sortOrder = parseInt(ticketFormData.sortOrder) || 0
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price')
      return
    }
    const features = ticketFormData.features
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean)

    try {
      if (editingTicket) {
        const res = await fetch('/api/admin/tickets', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTicket.id,
            name: ticketFormData.name,
            price,
            features,
            icon: ticketFormData.icon,
            popular: ticketFormData.popular,
            sortOrder,
          }),
        })
        if (res.ok) {
          const updated = await res.json()
          setTicketTypesList(prev => prev.map(t => t.id === editingTicket.id ? { ...updated, purchaseCount: t.purchaseCount } : t))
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to update ticket type')
          return
        }
      } else {
        const res = await fetch('/api/admin/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: ticketFormData.name,
            price,
            features,
            icon: ticketFormData.icon,
            popular: ticketFormData.popular,
            sortOrder,
          }),
        })
        if (res.ok) {
          const newTicket = await res.json()
          setTicketTypesList(prev => [...prev, { ...newTicket, purchaseCount: 0 }])
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to add ticket type')
          return
        }
      }
      handleCloseModal()
    } catch { toast.error('An error occurred while saving') }
  }, [ticketFormData, editingTicket, handleCloseModal])

  const handleVerifyPendingTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tickets', { method: 'PATCH' })
      const data = await res.json()
      if (res.ok) {
        if (data.verified > 0 || data.removed > 0) {
          toast.success(data.message)
          await fetchAdminData()
        } else {
          toast.info(data.message || 'No pending ticket purchases to verify')
        }
      } else {
        toast.error(data.error || 'Failed to verify pending tickets')
      }
    } catch {
      toast.error('Failed to verify pending tickets')
    }
  }, [fetchAdminData, toast])

  // ── CSV export ──────────────────────────────────────────
  const escapeCSV = useCallback((value: string | number) => {
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }, [])

  const handleExportCSV = useCallback(() => {
    const categoryHeaders = categoriesList.map(cat => cat.name)
    const headers = ['ID', 'Name', 'Country', 'Gender', ...categoryHeaders, 'Total Votes']
    const rows = contestantsList.map(c => {
      const votes = getVotes(c)
      return [
        c.id, c.name, c.country, c.gender,
        ...categoriesList.map(cat => votes[cat.slug || cat.id] || 0),
        getTotalVotes(c),
      ].map(escapeCSV)
    })
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contestants-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [categoriesList, contestantsList, escapeCSV])

  const handleExportVoteLog = useCallback(() => {
    const headers = ['ID', 'Time', 'Voter Email', 'Contestant', 'Category', 'Verified']
    const rows = voteLogList.map(v => [
      v.id, v.time, v.voterEmail, v.contestant, v.category, v.verified ? 'Yes' : 'No',
    ].map(escapeCSV))
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vote-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [voteLogList, escapeCSV])

  const handleVerifyPending = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/votes', { method: 'PATCH' })
      const data = await res.json()
      if (res.ok) {
        if (data.verified > 0 || data.removed > 0) {
          toast.success(data.message)
          await fetchAdminData()
        } else {
          toast.info(data.message || 'No new payments to verify')
        }
      } else {
        toast.error(data.error || 'Failed to verify pending votes')
      }
    } catch {
      toast.error('Failed to verify pending votes')
    }
  }, [fetchAdminData, toast])

  const handleResetVotes = useCallback(() => {
    requireDeleteConfirm('reset-all-votes', async () => {
      try {
        const res = await fetch('/api/admin/votes', { method: 'DELETE' })
        if (res.ok) {
          await fetchAdminData()
          toast.success('All votes have been reset.')
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to reset votes')
        }
      } catch { toast.error('An error occurred while resetting votes') }
    })
  }, [requireDeleteConfirm, fetchAdminData, toast])

  // ── Voting active handler ────────────────────────────────

  // ── User handlers ────────────────────────────────────────
  const handleBanUser = useCallback(async (id: string, banned: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, banned }),
      })
      if (res.ok) {
        setUsersList(prev => prev.map(u => u.id === id ? { ...u, banned } : u))
        toast.success(banned ? 'User has been banned' : 'User has been unbanned')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update user')
      }
    } catch { toast.error('Failed to update user') }
  }, [toast])

  const handleExportUsers = useCallback(() => {
    const headers = ['ID', 'Name', 'Email', 'Verified', 'Role', 'Banned', 'Votes', 'Tickets', 'Joined']
    const rows = usersList.map(u => [
      u.id, u.name, u.email,
      u.emailVerified ? 'Yes' : 'No',
      u.role,
      u.banned ? 'Yes' : 'No',
      u._count.votes,
      u._count.tickets,
      new Date(u.createdAt).toLocaleDateString(),
    ].map(v => {
      const str = String(v)
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
    }))
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [usersList])
  /**
   * Toggle voting on/off and persist the change to the database via
   * PUT /api/admin/event. Unlike a raw setState, this actually takes effect.
   */
  const handleToggleVotingActive = useCallback(async (active: boolean) => {
    setVotingActive(active)
    try {
      const res = await fetch('/api/admin/event', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ votingOpen: active }),
      })
      if (res.ok) {
        toast.success(active ? 'Voting is now open' : 'Voting has been closed')
      } else {
        // Revert optimistic update on failure
        setVotingActive(!active)
        const data = await res.json()
        toast.error(data.error || 'Failed to update voting status')
      }
    } catch {
      setVotingActive(!active)
      toast.error('Failed to update voting status')
    }
  }, [toast])

  const handleTogglePublicResults = useCallback(async (show: boolean) => {
    setPublicResults(show)
    try {
      const res = await fetch('/api/admin/event', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicResults: show }),
      })
      if (res.ok) {
        toast.success(show ? 'Results are now public' : 'Results are now hidden')
      } else {
        // Revert optimistic update on failure
        setPublicResults(!show)
        const data = await res.json()
        toast.error(data.error || 'Failed to update results visibility')
      }
    } catch {
      setPublicResults(!show)
      toast.error('Failed to update results visibility')
    }
  }, [toast])

  // ── Revenue helpers (memoised values, computed once per voteLogList change) ──
  const totalRevenue = useMemo(
    () => voteLogList.reduce((total, entry) => total + entry.amountPaid, 0),
    [voteLogList]
  )

  const totalVotesSold = useMemo(
    () => voteLogList.reduce((total, entry) => total + entry.votesCount, 0),
    [voteLogList]
  )

  const averageTransactionValue = useMemo(
    () => voteLogList.length === 0 ? 0 : totalRevenue / voteLogList.length,
    [voteLogList, totalRevenue]
  )

  return {
    // Auth
    session,
    sessionPending,
    // Data
    contestantsList,
    categoriesList,
    packagesList,
    voteLogList,
    overviewData,
    dataLoading,
    votingActive,
    handleToggleVotingActive,
    publicResults,
    handleTogglePublicResults,
    selectedCategory,
    setSelectedCategory,
    // Modal
    showModal,
    modalType,
    editingContestant,
    editingCategory,
    editingPackage,
    handleCloseModal,
    handleOpenModal,
    // Forms
    formData,
    setFormData,
    categoryFormData,
    setCategoryFormData,
    voteFormData,
    setVoteFormData,
    voteFormPackageId,
    setVoteFormPackageId,
    eventFormData,
    setEventFormData,
    packageFormData,
    setPackageFormData,
    advancedSettings,
    setAdvancedSettings,
    // Image upload
    fileInputRef,
    isDragging,
    isUploading,
    uploadProgress,
    handleImageUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    // Handlers
    handleAddContestant,
    handleEditContestant,
    handleDeleteContestant,
    handleSaveContestant,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleSaveCategory,
    handleAddManualVote,
    handleSaveManualVote,
    handleEditEvent,
    handleSaveEvent,
    handleAddPackage,
    handleEditPackage,
    handleDeletePackage,
    handleTogglePackage,
    handleSavePackage,
    handleExportCSV,
    handleExportVoteLog,
    handleVerifyPending,
    handleResetVotes,
    // Users
    usersList,
    handleBanUser,
    handleExportUsers,
    // Tickets
    ticketTypesList,
    ticketPurchasesList,
    ticketFormData,
    setTicketFormData,
    editingTicket,
    handleAddTicket,
    handleEditTicket,
    handleDeleteTicket,
    handleToggleTicket,
    handleSaveTicket,
    handleVerifyPendingTickets,
    // Revenue
    totalRevenue,
    totalVotesSold,
    averageTransactionValue,
  }
}
