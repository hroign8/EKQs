'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  TrendingUp, Users, Trophy, BarChart3,
  RefreshCw, Download, Settings, Eye,
  Crown, Loader2, DollarSign, Wallet, CreditCard, ArrowUpRight,
} from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import type { Contestant } from '@/types'
import { isAdmin } from '@/types'
import type {
  Category,
  VotingPackage,
  VoteLogEntry,
  AdminTab,
  ModalType,
} from './types'
import { getVotes, getTotalVotes } from './types'

import OverviewTab from './components/OverviewTab'
import ResultsTab from './components/ResultsTab'
import ContestantsTab from './components/ContestantsTab'
import VoteLogTab from './components/VoteLogTab'
import RevenueTab from './components/RevenueTab'
import PackagesTab from './components/PackagesTab'
import SettingsTab from './components/SettingsTab'
import AdminModals from './components/AdminModals'

export default function AdminPage() {
  const { data: session, isPending: sessionPending } = useSession()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [votingActive, setVotingActive] = useState(true)
  const [publicResults, setPublicResults] = useState(false)
  const [contestantsList, setContestantsList] = useState<Contestant[]>([])
  const [categoriesList, setCategoriesList] = useState<Category[]>([])
  const [packagesList, setPackagesList] = useState<VotingPackage[]>([])
  const [voteLogList, setVoteLogList] = useState<VoteLogEntry[]>([])
  const [overviewData, setOverviewData] = useState<{ totalContestants: number; totalVotes: number; totalRevenue: number; totalTickets: number; recentMessages: number }>({ totalContestants: 0, totalVotes: 0, totalRevenue: 0, totalTickets: 0, recentMessages: 0 })
  const [dataLoading, setDataLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<ModalType>('contestant')
  const [editingPackage, setEditingPackage] = useState<VotingPackage | null>(null)
  const [advancedSettings, setAdvancedSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
    debugMode: false,
    maxVotesPerUser: '1000',
    sessionTimeout: '30',
    apiRateLimit: '100',
  })
  const [packageFormData, setPackageFormData] = useState({ name: '', votes: '', price: '' })
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [voteFormPackageId, setVoteFormPackageId] = useState('')
  const [formData, setFormData] = useState({
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
  const [eventFormData, setEventFormData] = useState({
    name: '',
    tagline: '',
    startDate: '',
    endDate: '',
    votingStart: '',
    votingEnd: '',
  })
  const [, setIsEditingEvent] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const fetchAdminData = useCallback(async () => {
    setDataLoading(true)
    try {
      const [contestantsRes, categoriesRes, packagesRes, votesRes, overviewRes, eventRes] = await Promise.all([
        fetch('/api/admin/contestants'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/packages'),
        fetch('/api/admin/votes'),
        fetch('/api/admin/overview'),
        fetch('/api/admin/event'),
      ])

      if (contestantsRes.ok) {
        const data = await contestantsRes.json()
        setContestantsList(data)
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategoriesList(data)
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0].slug || data[0].id)
        }
      }
      if (packagesRes.ok) {
        const data = await packagesRes.json()
        setPackagesList(data)
      }
      if (votesRes.ok) {
        const data = await votesRes.json()
        const entries = (data.votes || []).map((v: { id: string; createdAt: string; user?: { email: string }; contestant?: { name: string }; category?: { name: string }; verified: boolean; package?: { id: string; name: string }; votesCount: number; amountPaid: number }) => ({
          id: v.id,
          time: new Date(v.createdAt).toLocaleString(),
          voterEmail: v.user?.email || 'unknown',
          contestant: v.contestant?.name || 'unknown',
          category: v.category?.name || 'unknown',
          verified: v.verified,
          packageId: v.package?.id || '',
          packageName: v.package?.name || '',
          votesCount: v.votesCount,
          amountPaid: v.amountPaid,
        }))
        setVoteLogList(entries)
      }
      if (overviewRes.ok) {
        const data = await overviewRes.json()
        setOverviewData(data)
      }
      if (eventRes.ok) {
        const data = await eventRes.json()
        if (data && !data.error) {
          setEventFormData({
            name: data.name || '',
            tagline: data.tagline || '',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            votingStart: data.votingPeriod?.start || data.votingStart || '',
            votingEnd: data.votingPeriod?.end || data.votingEnd || '',
          })
          setVotingActive(data.isActive ?? true)
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setDataLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    if (!sessionPending && session?.user && isAdmin(session.user)) {
      fetchAdminData()
    }
  }, [sessionPending, session, fetchAdminData])

  // ---------------------------------------------------------------------------
  // Image upload helpers
  // ---------------------------------------------------------------------------
  const processImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
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
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processImageFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processImageFile(file)
  }

  // ---------------------------------------------------------------------------
  // Tab definitions
  // ---------------------------------------------------------------------------
  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'contestants', label: 'Participants' },
    { id: 'results', label: 'Results' },
    { id: 'packages', label: 'Packages' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'votelog', label: 'Vote Log' },
    { id: 'settings', label: 'Event Settings' },
  ]

  // ---------------------------------------------------------------------------
  // Contestant handlers
  // ---------------------------------------------------------------------------
  const handleAddContestant = () => {
    setEditingContestant(null)
    setFormData({ name: '', country: '', gender: '', image: '', description: '' })
    setModalType('contestant')
    setShowModal(true)
  }

  const handleEditContestant = (contestant: Contestant) => {
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
  }

  const handleDeleteContestant = async (id: string) => {
    if (confirm('Are you sure you want to delete this contestant?')) {
      try {
        const res = await fetch(`/api/admin/contestants?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          setContestantsList(contestantsList.filter(c => c.id !== id))
        } else {
          const data = await res.json()
          alert(data.error || 'Failed to delete contestant')
        }
      } catch { alert('Failed to delete contestant') }
    }
  }

  const handleSaveContestant = async () => {
    if (!formData.name || !formData.country || !formData.gender) {
      alert('Please fill in all required fields')
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
          setContestantsList(contestantsList.map(c => c.id === editingContestant.id ? updated : c))
        } else {
          const data = await res.json()
          alert(data.error || 'Failed to update contestant')
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
          setContestantsList([...contestantsList, newContestant])
        } else {
          const data = await res.json()
          alert(data.error || 'Failed to add contestant')
          return
        }
      }
      setShowModal(false)
      setModalType('contestant')
    } catch { alert('An error occurred while saving') }
  }

  // ---------------------------------------------------------------------------
  // Category handlers
  // ---------------------------------------------------------------------------
  const handleAddCategory = () => {
    setEditingCategory(null)
    setCategoryFormData({ id: '', name: '' })
    setModalType('category')
    setShowModal(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({ id: category.id, name: category.name })
    setModalType('category')
    setShowModal(true)
  }

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          setCategoriesList(categoriesList.filter(c => c.id !== id))
        } else {
          const data = await res.json()
          alert(data.error || 'Failed to delete category')
        }
      } catch { alert('Failed to delete category') }
    }
  }

  const handleSaveCategory = async () => {
    if (!categoryFormData.name) {
      alert('Please enter a category name')
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
          setCategoriesList(categoriesList.map(c => c.id === editingCategory.id ? updated : c))
        } else {
          const data = await res.json()
          alert(data.error || 'Failed to update category')
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
          setCategoriesList([...categoriesList, newCat])
        } else {
          const data = await res.json()
          alert(data.error || 'Failed to add category')
          return
        }
      }
      setShowModal(false)
      setModalType('contestant')
    } catch { alert('An error occurred while saving') }
  }

  // ---------------------------------------------------------------------------
  // Vote handlers
  // ---------------------------------------------------------------------------
  const handleAddManualVote = () => {
    setVoteFormData({ voterEmail: '', contestantId: '', categoryId: '' })
    setModalType('vote')
    setShowModal(true)
  }

  const handleSaveManualVote = async () => {
    if (!voteFormData.voterEmail || !voteFormData.contestantId || !voteFormData.categoryId || !voteFormPackageId) {
      alert('Please fill in all fields')
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
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to record vote')
      }
    } catch { alert('An error occurred while saving the vote') }
    setShowModal(false)
    setModalType('contestant')
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------
  const handleEditEvent = () => {
    setIsEditingEvent(true)
    setModalType('event')
    setShowModal(true)
  }

  const handleSaveEvent = async () => {
    try {
      const res = await fetch('/api/admin/event', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventFormData),
      })
      if (res.ok) {
        alert('Event details saved successfully!')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save event details')
      }
    } catch { alert('An error occurred while saving') }
    setShowModal(false)
    setIsEditingEvent(false)
    setModalType('contestant')
  }

  // ---------------------------------------------------------------------------
  // CSV export helpers
  // ---------------------------------------------------------------------------
  const escapeCSV = (value: string | number) => {
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const handleExportCSV = () => {
    const categoryHeaders = categoriesList.map(cat => cat.name)
    const headers = ['ID', 'Name', 'Country', 'Gender', ...categoryHeaders, 'Total Votes']
    const rows = contestantsList.map(c => {
      const votes = getVotes(c)
      return [
        c.id,
        c.name,
        c.country,
        c.gender,
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
  }

  const handleExportVoteLog = () => {
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
  }

  const handleResetVotes = async () => {
    if (confirm('Are you sure you want to reset ALL votes? This action cannot be undone!')) {
      if (confirm('This will set all contestant votes to 0. Please confirm again.')) {
        try {
          const res = await fetch('/api/admin/votes', { method: 'DELETE' })
          if (res.ok) {
            await fetchAdminData()
            alert('All votes have been reset.')
          } else {
            const data = await res.json()
            alert(data.error || 'Failed to reset votes')
          }
        } catch { alert('An error occurred while resetting votes') }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Modal helpers
  // ---------------------------------------------------------------------------
  const handleCloseModal = () => {
    setShowModal(false)
    setModalType('contestant')
    setEditingContestant(null)
    setEditingCategory(null)
    setEditingPackage(null)
    setPackageFormData({ name: '', votes: '', price: '' })
  }

  const handleOpenModal = (type: ModalType) => {
    setModalType(type)
    setShowModal(true)
  }

  // ---------------------------------------------------------------------------
  // Package handlers
  // ---------------------------------------------------------------------------
  const handleAddPackage = () => {
    setEditingPackage(null)
    setPackageFormData({ name: '', votes: '', price: '' })
    setModalType('package')
    setShowModal(true)
  }

  const handleEditPackage = (pkg: VotingPackage) => {
    setEditingPackage(pkg)
    setPackageFormData({
      name: pkg.name,
      votes: pkg.votes.toString(),
      price: pkg.price.toString(),
    })
    setModalType('package')
    setShowModal(true)
  }

  const handleDeletePackage = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        const res = await fetch(`/api/admin/packages?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          setPackagesList(packagesList.filter(p => p.id !== id))
        } else {
          const data = await res.json()
          alert(data.error || 'Failed to delete package')
        }
      } catch { alert('Failed to delete package') }
    }
  }

  const handleTogglePackage = async (id: string) => {
    const pkg = packagesList.find(p => p.id === id)
    if (!pkg) return
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !pkg.isActive }),
      })
      if (res.ok) {
        setPackagesList(packagesList.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p))
      }
    } catch { alert('Failed to toggle package') }
  }

  const handleSavePackage = async () => {
    if (!packageFormData.name || !packageFormData.votes || !packageFormData.price) {
      alert('Please fill in all fields')
      return
    }

    const votes = parseInt(packageFormData.votes)
    const price = parseFloat(packageFormData.price)

    if (isNaN(votes) || isNaN(price) || votes <= 0 || price < 0) {
      alert('Please enter valid numbers for votes and price')
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
          setPackagesList(packagesList.map(p => p.id === editingPackage.id ? updated : p))
        } else {
          const data = await res.json()
          alert(data.error || 'Failed to update package')
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
          setPackagesList([...packagesList, newPkg])
        } else {
          const data = await res.json()
          alert(data.error || 'Failed to add package')
          return
        }
      }
      handleCloseModal()
    } catch { alert('An error occurred while saving') }
  }

  // ---------------------------------------------------------------------------
  // Revenue helpers
  // ---------------------------------------------------------------------------
  const calculateTotalRevenue = () =>
    voteLogList.reduce((total, entry) => total + entry.amountPaid, 0)

  const calculateTotalVotesSold = () =>
    voteLogList.reduce((total, entry) => total + entry.votesCount, 0)

  const getAverageTransactionValue = () =>
    voteLogList.length === 0 ? 0 : calculateTotalRevenue() / voteLogList.length

  // ---------------------------------------------------------------------------
  // Auth guards
  // ---------------------------------------------------------------------------
  if (sessionPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy-900" />
      </div>
    )
  }

  if (!session?.user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy-900" />
      </div>
    )
  }

  if (!isAdmin(session.user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-burgundy-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have administrator privileges. Only admin accounts can access this dashboard.
          </p>
          <button
            onClick={() => { window.location.href = '/' }}
            className="bg-burgundy-900 hover:bg-burgundy-800 text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-burgundy-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin data...</p>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-burgundy-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gold-500"></div>
              <Crown className="w-6 h-6 text-gold-500" />
              <div className="h-px w-12 bg-gold-500"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-burgundy-200">Manage contestants, votes, and settings</p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium ${
              votingActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${votingActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span>{votingActive ? 'Voting Open' : 'Voting Closed'}</span>
            </div>

            <a
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>View Site</span>
            </a>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 rounded-full hover:bg-gold-400 transition-colors text-burgundy-900 font-semibold"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Tabs Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-1.5 sm:p-2 overflow-x-auto scroll-container">
            <div className="flex gap-1 sm:gap-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-burgundy-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-burgundy-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Summary Card */}
        <div className="bg-burgundy-900 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Wallet className="w-7 h-7 text-burgundy-900" />
              </div>
              <div>
                <h3 className="text-burgundy-200 text-sm font-medium mb-1">Revenue from Voting</h3>
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
                  ${calculateTotalRevenue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-green-500/20 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-medium text-sm">Live Tracking</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 text-burgundy-200 text-xs font-medium mb-2">
                <CreditCard className="w-4 h-4" />
                <span>Transactions</span>
              </div>
              <p className="text-2xl font-black text-white">{voteLogList.length.toLocaleString()}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-burgundy-200 text-xs font-medium mb-2">
                <TrendingUp className="w-4 h-4" />
                <span>Votes Sold</span>
              </div>
              <p className="text-2xl font-black text-white">{calculateTotalVotesSold().toLocaleString()}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-burgundy-200 text-xs font-medium mb-2">
                <DollarSign className="w-4 h-4" />
                <span>Avg Transaction</span>
              </div>
              <p className="text-2xl font-black text-white">${getAverageTransactionValue().toFixed(2)}</p>
            </div>

            <button
              onClick={() => setActiveTab('revenue')}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 text-burgundy-200 text-xs font-medium mb-2">
                <BarChart3 className="w-4 h-4" />
                <span>View Details</span>
              </div>
              <p className="text-2xl font-black text-white flex items-center gap-2">
                Revenue <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </p>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gold-600" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-black text-burgundy-900 truncate">{overviewData.totalVotes.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-gray-500">Total Votes</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-black text-burgundy-900 truncate">{overviewData.totalTickets}</div>
                <div className="text-xs sm:text-sm text-gray-500">Ticket Sales</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-black text-burgundy-900 truncate">{contestantsList.length}</div>
                <div className="text-xs sm:text-sm text-gray-500">Participants</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <div className="text-lg sm:text-2xl font-black text-burgundy-900 truncate">{categoriesList.length}</div>
                <div className="text-xs sm:text-sm text-gray-500">Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            onAddContestant={handleAddContestant}
            onAddCategory={handleAddCategory}
            onExportCSV={handleExportCSV}
            onAddManualVote={handleAddManualVote}
          />
        )}

        {activeTab === 'results' && (
          <ResultsTab
            contestantsList={contestantsList}
            categoriesList={categoriesList}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {activeTab === 'contestants' && (
          <ContestantsTab
            contestantsList={contestantsList}
            categoriesList={categoriesList}
            onAddContestant={handleAddContestant}
            onEditContestant={handleEditContestant}
            onDeleteContestant={handleDeleteContestant}
          />
        )}

        {activeTab === 'votelog' && (
          <VoteLogTab
            voteLogList={voteLogList}
            onAddManualVote={handleAddManualVote}
            onExportVoteLog={handleExportVoteLog}
          />
        )}

        {activeTab === 'revenue' && (
          <RevenueTab
            voteLogList={voteLogList}
            packagesList={packagesList}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'packages' && (
          <PackagesTab
            packagesList={packagesList}
            onAddPackage={handleAddPackage}
            onEditPackage={handleEditPackage}
            onDeletePackage={handleDeletePackage}
            onTogglePackage={handleTogglePackage}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            categoriesList={categoriesList}
            packagesList={packagesList}
            votingActive={votingActive}
            publicResults={publicResults}
            eventFormData={eventFormData}
            onSetVotingActive={setVotingActive}
            onSetPublicResults={setPublicResults}
            onEditEvent={handleEditEvent}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onResetVotes={handleResetVotes}
            onExportCSV={handleExportCSV}
            onSwitchTab={setActiveTab}
            onOpenModal={handleOpenModal}
          />
        )}
      </div>

      {/* Modals */}
      <AdminModals
        showModal={showModal}
        modalType={modalType}
        onClose={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
        editingContestant={editingContestant}
        onSaveContestant={handleSaveContestant}
        fileInputRef={fileInputRef}
        isDragging={isDragging}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onImageUpload={handleImageUpload}
        categoryFormData={categoryFormData}
        setCategoryFormData={setCategoryFormData}
        editingCategory={editingCategory}
        onSaveCategory={handleSaveCategory}
        voteFormData={voteFormData}
        setVoteFormData={setVoteFormData}
        voteFormPackageId={voteFormPackageId}
        setVoteFormPackageId={setVoteFormPackageId}
        contestantsList={contestantsList}
        categoriesList={categoriesList}
        packagesList={packagesList}
        onSaveManualVote={handleSaveManualVote}
        eventFormData={eventFormData}
        setEventFormData={setEventFormData}
        onSaveEvent={handleSaveEvent}
        packageFormData={packageFormData}
        setPackageFormData={setPackageFormData}
        editingPackage={editingPackage}
        onSavePackage={handleSavePackage}
        advancedSettings={advancedSettings}
        setAdvancedSettings={setAdvancedSettings}
      />
    </div>
  )
}
