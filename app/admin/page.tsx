'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import NextImage from 'next/image'
import {
  TrendingUp, Users, Trophy, BarChart3,
  RefreshCw, Download, Settings, Eye, EyeOff,
  Trash2, Crown, Plus, Edit, X, Upload, Image as ImageIcon, DollarSign, Wallet, CreditCard, ArrowUpRight, ExternalLink, Globe, QrCode, Mail, Ticket, Loader2
} from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import type { Contestant } from '@/types'
import Footer from '@/components/Footer'

type Category = {
  id: string
  name: string
  slug?: string
}

type VotingPackage = {
  id: string
  name: string
  slug?: string
  votes: number
  price: number
  isActive: boolean
}

type VoteLogEntry = {
  id: string
  time: string
  voterEmail: string
  contestant: string
  category: string
  verified: boolean
  packageId: string
  packageName: string
  votesCount: number
  amountPaid: number
}

type AdminTab = 'overview' | 'contestants' | 'results' | 'votelog' | 'settings' | 'packages' | 'revenue'

export default function AdminPage() {
  const { data: session, isPending: sessionPending } = useSession()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [votingActive, setVotingActive] = useState(true)
  const [publicResults, setPublicResults] = useState(false)
  const [contestantsList, setContestantsList] = useState<Contestant[]>([])
  const [categoriesList, setCategoriesList] = useState<Category[]>([])
  const [packagesList, setPackagesList] = useState<VotingPackage[]>([])
  const [voteLogList, setVoteLogList] = useState<VoteLogEntry[]>([])
  const [overviewData, setOverviewData] = useState<{ totalContestants: number; totalVotes: number; totalRevenue: number; totalTickets: number; recentMessages: number }>({ totalContestants: 0, totalVotes: 0, totalRevenue: 0, totalTickets: 0, recentMessages: 0 })
  const [dataLoading, setDataLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'contestant' | 'category' | 'vote' | 'event' | 'package' | 'advanced'>('contestant')
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
    categoryId: '' 
  })
  const [eventFormData, setEventFormData] = useState({
    name: '',
    tagline: '',
    startDate: '',
    endDate: '',
    votingStart: '',
    votingEnd: '',
  })
  const [isEditingEvent, setIsEditingEvent] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch all admin data on mount
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
    if (!sessionPending && session?.user && (session.user as { role?: string }).role === 'admin') {
      fetchAdminData()
    }
  }, [sessionPending, session, fetchAdminData])

  const processImageFile = (file: File) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Check file type
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
      setFormData({ ...formData, image: base64String })
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
    if (file) {
      processImageFile(file)
    }
  }

  const tabs = [
    { id: 'overview' as AdminTab, label: 'Overview' },
    { id: 'contestants' as AdminTab, label: 'Participants' },
    { id: 'results' as AdminTab, label: 'Results' },
    { id: 'packages' as AdminTab, label: 'Packages' },
    { id: 'revenue' as AdminTab, label: 'Revenue' },
    { id: 'votelog' as AdminTab, label: 'Vote Log' },
    { id: 'settings' as AdminTab, label: 'Event Settings' },
  ]

  const getVotes = (contestant: Contestant): Record<string, number> => {
    return (contestant.votes || {}) as Record<string, number>
  }

  const getTotalVotes = (contestant: Contestant) => {
    const votes = getVotes(contestant)
    return Object.values(votes).reduce((sum, v) => sum + (v || 0), 0)
  }

  const getCategoryTotalVotes = (categorySlug: string) => {
    return contestantsList.reduce((sum, c) => sum + (getVotes(c)[categorySlug] || 0), 0)
  }

  const getTopInCategory = (categorySlug: string, limit = 3) => {
    return [...contestantsList]
      .sort((a, b) => (getVotes(b)[categorySlug] || 0) - (getVotes(a)[categorySlug] || 0))
      .slice(0, limit)
  }

  const sortedByTotal = [...contestantsList].sort((a, b) => getTotalVotes(b) - getTotalVotes(a))

  const handleAddContestant = () => {
    setEditingContestant(null)
    setFormData({
      name: '',
      country: '',
      gender: '',
      image: '',
      description: '',
    })
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

  // Category handlers
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

  // Vote log handlers
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
        // Refresh data to get updated vote counts
        await fetchAdminData()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to record vote')
      }
    } catch { alert('An error occurred while saving the vote') }
    setShowModal(false)
    setModalType('contestant')
  }

  // Event handlers
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

  // Data handlers
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
        getTotalVotes(c)
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
      v.id,
      v.time,
      v.voterEmail,
      v.contestant,
      v.category,
      v.verified ? 'Yes' : 'No'
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

  const handleCloseModal = () => {
    setShowModal(false)
    setModalType('contestant')
    setEditingContestant(null)
    setEditingCategory(null)
    setEditingPackage(null)
    setPackageFormData({ name: '', votes: '', price: '' })
  }

  // Package handlers
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

  const calculateTotalRevenue = () => {
    return voteLogList.reduce((total, entry) => total + entry.amountPaid, 0)
  }

  const calculateTotalVotesSold = () => {
    return voteLogList.reduce((total, entry) => total + entry.votesCount, 0)
  }

  const getPackageSalesBreakdown = () => {
    const breakdown: Record<string, { count: number; revenue: number; votes: number }> = {}
    voteLogList.forEach(entry => {
      if (!breakdown[entry.packageId]) {
        breakdown[entry.packageId] = { count: 0, revenue: 0, votes: 0 }
      }
      breakdown[entry.packageId].count += 1
      breakdown[entry.packageId].revenue += entry.amountPaid
      breakdown[entry.packageId].votes += entry.votesCount
    })
    return breakdown
  }

  const getAverageTransactionValue = () => {
    if (voteLogList.length === 0) return 0
    return calculateTotalRevenue() / voteLogList.length
  }

  // Auth guard
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

  if ((session.user as { role?: string }).role !== 'admin') {
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
            {/* Voting Status */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium ${
              votingActive 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-red-500/20 text-red-300'
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
          <div>
            {/* Quick Actions */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6">
              <h3 className="text-base sm:text-lg font-bold text-burgundy-900 mb-3 sm:mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                <button 
                  onClick={handleAddContestant}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
                >
                  <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-gold-500 transition-colors">
                    <Plus className="w-5 h-5 text-gold-600 group-hover:text-burgundy-900" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Add Contestant</span>
                </button>
                
                <button 
                  onClick={handleAddCategory}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-500 transition-colors">
                    <Plus className="w-5 h-5 text-purple-600 group-hover:text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Add Category</span>
                </button>
                
                <button 
                  onClick={handleExportCSV}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-500 transition-colors">
                    <Download className="w-5 h-5 text-blue-600 group-hover:text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Export CSV</span>
                </button>

                <button 
                  onClick={handleAddManualVote}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-500 transition-colors">
                    <Plus className="w-5 h-5 text-green-600 group-hover:text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Add Manual Vote</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            {/* Results Content */}
            <div className="mb-8">
              <div className="overflow-x-auto scroll-container mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3 min-w-max sm:min-w-0">
                {categoriesList.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.slug || category.id)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-gold-500 text-burgundy-900 shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-gold-300 hover:text-gray-900'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="bg-burgundy-900 px-4 sm:px-6 py-3 sm:py-4">
                  <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-gold-500" />
                    <span>{categoriesList.find(c => c.id === selectedCategory)?.name} Leaderboard</span>
                  </h2>
                </div>
                <div>
                  {contestantsList
                    .slice()
                    .sort((a, b) => (getVotes(b)[selectedCategory] || 0) - (getVotes(a)[selectedCategory] || 0))
                    .map((contestant, index) => {
                      const totalVotes = contestantsList.reduce((sum, c) => sum + (getVotes(c)[selectedCategory] || 0), 0)
                      const contestantVotes = getVotes(contestant)[selectedCategory] || 0
                      const percentage = totalVotes ? ((contestantVotes / totalVotes) * 100).toFixed(1) : '0.0'
                      const maxVotes = Math.max(...contestantsList.map(c => getVotes(c)[selectedCategory] || 0))
                      const barWidth = maxVotes ? (contestantVotes / maxVotes) * 100 : 0
                      
                      return (
                        <div
                          key={contestant.id}
                          className={`flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-5 transition-all group ${
                            index === 0 
                              ? 'bg-gradient-to-r from-gold-50 to-gold-100/50' 
                              : index % 2 === 0 
                                ? 'bg-gray-50/50' 
                                : 'bg-white'
                          } ${index !== contestantsList.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                          {/* Rank Badge */}
                          <div className="flex-shrink-0">
                            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-sm sm:text-lg shadow-sm ${
                              index === 0 ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-burgundy-900' :
                              index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700' :
                              index === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                          
                          {/* Contestant Image */}
                          <div className="relative flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14">
                            <NextImage
                              src={contestant.image}
                              alt={contestant.name}
                              fill
                              className="rounded-full object-cover ring-2 ring-white shadow-md group-hover:scale-105 transition-transform"
                              sizes="56px"
                            />
                            {index === 0 && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center shadow-md z-10">
                                <Crown className="w-3.5 h-3.5 text-burgundy-900" />
                              </div>
                            )}
                          </div>
                          
                          {/* Contestant Info & Progress */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-burgundy-900 truncate">{contestant.name}</h3>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                contestant.gender === 'Male' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-pink-100 text-pink-700'
                              }`}>
                                {contestant.gender === 'Male' ? 'King' : 'Queen'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1 mb-2">{contestant.description}</p>
                            
                            {/* Progress Bar */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${
                                    index === 0 
                                      ? 'bg-gradient-to-r from-gold-400 to-gold-500' 
                                      : 'bg-burgundy-800'
                                  }`}
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-500 w-16">{percentage}%</span>
                            </div>
                          </div>
                          
                          {/* Votes */}
                          <div className="text-right flex-shrink-0 pl-2 sm:pl-4">
                            <div className={`text-lg sm:text-2xl font-black ${index === 0 ? 'text-gold-600' : 'text-burgundy-900'}`}>
                              {contestantVotes.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">votes</div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* Site Links */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6">
              <h3 className="text-base sm:text-lg font-bold text-burgundy-900 mb-3 sm:mb-4">Site Pages</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-3">
                <a 
                  href="/"
                  target="_blank"
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-burgundy-50 hover:scale-105 transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-burgundy-100 transition-colors">
                    <Globe className="w-5 h-5 text-gray-500 group-hover:text-burgundy-900" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Home</span>
                </a>
                <a 
                  href="/vote"
                  target="_blank"
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-burgundy-50 hover:scale-105 transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-burgundy-100 transition-colors">
                    <Trophy className="w-5 h-5 text-gray-500 group-hover:text-burgundy-900" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Vote</span>
                </a>
                <a 
                  href="/results"
                  target="_blank"
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-burgundy-50 hover:scale-105 transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-burgundy-100 transition-colors">
                    <BarChart3 className="w-5 h-5 text-gray-500 group-hover:text-burgundy-900" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Results</span>
                </a>
                <a 
                  href="/gallery"
                  target="_blank"
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-burgundy-50 hover:scale-105 transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-burgundy-100 transition-colors">
                    <ImageIcon className="w-5 h-5 text-gray-500 group-hover:text-burgundy-900" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Gallery</span>
                </a>
                <a 
                  href="/qr-code"
                  target="_blank"
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-burgundy-50 hover:scale-105 transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-burgundy-100 transition-colors">
                    <QrCode className="w-5 h-5 text-gray-500 group-hover:text-burgundy-900" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">QR Code</span>
                </a>
                <a 
                  href="/about"
                  target="_blank"
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-burgundy-50 hover:scale-105 transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-burgundy-100 transition-colors">
                    <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-burgundy-900" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">About</span>
                </a>
                <a 
                  href="/contestants"
                  target="_blank"
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-burgundy-50 hover:scale-105 transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-burgundy-100 transition-colors">
                    <Users className="w-5 h-5 text-gray-500 group-hover:text-burgundy-900" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Contestants</span>
                </a>
                <a 
                  href="/contact"
                  target="_blank"
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-burgundy-50 hover:scale-105 transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-burgundy-100 transition-colors">
                    <Mail className="w-5 h-5 text-gray-500 group-hover:text-burgundy-900" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Contact</span>
                </a>
                <a 
                  href="/ticketing"
                  target="_blank"
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-burgundy-50 hover:scale-105 transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-burgundy-100 transition-colors">
                    <Ticket className="w-5 h-5 text-gray-500 group-hover:text-burgundy-900" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Ticketing</span>
                </a>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {categoriesList.map((category) => {
                const categorySlug = category.slug || category.id
                const topContestants = getTopInCategory(categorySlug)
                const totalVotes = getCategoryTotalVotes(categorySlug)
                const maxVotes = getVotes(topContestants[0])?.[categorySlug] || 0
                return (
                  <div key={category.id} className="bg-white rounded-2xl overflow-hidden group hover:shadow-lg transition-all">
                    <div className="bg-burgundy-900 px-5 py-3 flex items-center justify-between">
                      <h3 className="font-bold text-white">{category.name}</h3>
                      <span className="text-xs font-medium text-burgundy-200 bg-white/10 px-2.5 py-1 rounded-full">
                        {totalVotes.toLocaleString()} votes
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      {topContestants.map((contestant, index) => (
                        <div 
                          key={contestant.id} 
                          className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                            index === 0 ? 'bg-gold-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                            index === 0 ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-burgundy-900' :
                            index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="relative w-10 h-10">
                            <NextImage
                              src={contestant.image}
                              alt={contestant.name}
                              fill
                              className="rounded-full object-cover ring-2 ring-white shadow-sm"
                              sizes="40px"
                            />
                            {index === 0 && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center z-10">
                                <Crown className="w-2.5 h-2.5 text-burgundy-900" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-gray-900 truncate text-sm">{contestant.name}</span>
                              <span className={`font-bold ml-2 text-sm ${index === 0 ? 'text-gold-600' : 'text-burgundy-900'}`}>
                                {(getVotes(contestant)[categorySlug] || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-700 ${
                                  index === 0 ? 'bg-gradient-to-r from-gold-400 to-gold-500' : 'bg-burgundy-800'
                                }`}
                                style={{
                                  width: `${maxVotes ? ((getVotes(contestant)[categorySlug] || 0) / maxVotes) * 100 : 0}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'contestants' && (
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-burgundy-900">All Participants</h3>
                <p className="text-xs sm:text-sm text-gray-500">Complete list with vote breakdown by category</p>
              </div>
              <button
                onClick={handleAddContestant}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all text-sm sm:text-base self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contestant</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Participant</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</th>
                    {categoriesList.map(cat => (
                      <th key={cat.id} className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{cat.name}</th>
                    ))}
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedByTotal.map((contestant, index) => (
                    <tr 
                      key={contestant.id} 
                      className={`transition-colors ${
                        index === 0 
                          ? 'bg-gradient-to-r from-gold-50 to-gold-100/50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                          index === 0 ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-burgundy-900' :
                          index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700' :
                          index === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11">
                            <NextImage
                              src={contestant.image}
                              alt={contestant.name}
                              fill
                              className="rounded-full object-cover ring-2 ring-white shadow-sm"
                              sizes="44px"
                            />
                            {index === 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center shadow-sm z-10">
                                <Crown className="w-3 h-3 text-burgundy-900" />
                              </div>
                            )}
                          </div>
                          <span className={`font-semibold ${index === 0 ? 'text-gold-700' : 'text-burgundy-900'}`}>{contestant.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          contestant.gender === 'Male' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {contestant.gender === 'Male' ? 'King' : 'Queen'}
                        </span>
                      </td>
                      {categoriesList.map(cat => (
                        <td key={cat.id} className="px-6 py-4 text-sm text-gray-600 text-right font-medium">
                          {(getVotes(contestant)[cat.slug || cat.id] || 0).toLocaleString()}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right">
                        <span className={`text-lg font-black ${index === 0 ? 'text-gold-600' : 'text-burgundy-900'}`}>
                          {getTotalVotes(contestant).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditContestant(contestant)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContestant(contestant.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'votelog' && (
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="bg-burgundy-900 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Vote Log</h3>
                <p className="text-sm text-burgundy-200 mt-0.5">Recent votes (newest first)</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleAddManualVote}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 text-burgundy-900 rounded-full font-semibold text-sm hover:bg-gold-400 hover:scale-105 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Manual Vote</span>
                </button>
                <button 
                  onClick={handleExportVoteLog}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-full font-medium text-sm hover:bg-white/20 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
              <div className="bg-white rounded-xl p-3 sm:p-4">
                <div className="text-lg sm:text-2xl font-black text-burgundy-900">{voteLogList.length}</div>
                <div className="text-xs text-gray-500 font-medium">Total Entries</div>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4">
                <div className="text-lg sm:text-2xl font-black text-emerald-600 truncate">
                  ${voteLogList.reduce((sum, v) => sum + (v.amountPaid || 0), 0).toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 font-medium">Total Revenue</div>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4">
                <div className="text-lg sm:text-2xl font-black text-burgundy-900">
                  {voteLogList.reduce((sum, v) => sum + (v.votesCount || 1), 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 font-medium">Total Votes</div>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4">
                <div className="text-lg sm:text-2xl font-black text-green-600">
                  {voteLogList.filter(v => v.verified).length}
                </div>
                <div className="text-xs text-gray-500 font-medium">Verified</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-burgundy-50">
                    <th className="text-left px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Time</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Voter</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Contestant</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Package</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Votes</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Amount</th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-burgundy-900 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {voteLogList.map((vote, index) => (
                    <tr 
                      key={vote.id} 
                      className={`transition-colors hover:bg-gold-50 ${
                        index !== voteLogList.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{vote.time.split(',')[0]}</div>
                        <div className="text-xs text-gray-500">{vote.time.split(',')[1]}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-burgundy-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-burgundy-700">
                              {vote.voterEmail.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-700">{vote.voterEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-burgundy-900">{vote.contestant}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{vote.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full">
                          {vote.packageName || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-burgundy-900">{vote.votesCount || 1}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-emerald-600">${(vote.amountPaid || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            vote.verified
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${vote.verified ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                            {vote.verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-xs sm:text-sm text-gray-500">
                Showing <span className="font-semibold text-burgundy-900">{voteLogList.length}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Revenue Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:shadow-md transition-all group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-emerald-600 truncate">
                  ${calculateTotalRevenue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Total Revenue</div>
              </div>
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:shadow-md transition-all group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-burgundy-900">{voteLogList.length}</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Total Transactions</div>
              </div>
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:shadow-md transition-all group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-burgundy-900">{calculateTotalVotesSold().toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Votes Sold</div>
              </div>
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:shadow-md transition-all group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-gold-600" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-burgundy-900">
                  ${getAverageTransactionValue().toFixed(2)}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Avg. Transaction</div>
              </div>
            </div>

            {/* Package Sales Breakdown */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-burgundy-900">Package Sales Breakdown</h3>
                <p className="text-sm text-gray-500 mt-1">Revenue breakdown by package type</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Package</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Votes/Pkg</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Times Sold</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Votes</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {packagesList.map((pkg) => {
                      const salesData = getPackageSalesBreakdown()[pkg.id] || { count: 0, revenue: 0, votes: 0 }
                      return (
                        <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-2.5 h-2.5 rounded-full ${pkg.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className="font-semibold text-burgundy-900">{pkg.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-700">${pkg.price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-gray-600">{pkg.votes}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-bold ${salesData.count > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                              {salesData.count}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-600">{salesData.votes.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-bold ${salesData.revenue > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                              ${salesData.revenue.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-bold text-burgundy-900">TOTAL</td>
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4 text-right font-bold text-burgundy-900">{voteLogList.length}</td>
                      <td className="px-6 py-4 text-right font-bold text-burgundy-900">{calculateTotalVotesSold().toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600 text-lg">
                        ${calculateTotalRevenue().toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="bg-burgundy-900 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Recent Transactions</h3>
                  <p className="text-sm text-burgundy-200 mt-0.5">Latest package purchases</p>
                </div>
                <button 
                  onClick={() => setActiveTab('votelog')}
                  className="text-sm text-gold-400 hover:text-gold-300 font-semibold transition-colors"
                >
                  View All →
                </button>
              </div>
              
              <div>
                {voteLogList.slice(0, 5).map((entry, index) => (
                  <div 
                    key={entry.id} 
                    className={`px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 transition-colors hover:bg-gray-50 ${
                      index !== Math.min(4, voteLogList.length - 1) ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gold-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-gold-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-burgundy-900 text-sm sm:text-base truncate">{entry.voterEmail}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{entry.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 ml-12 sm:ml-0 flex-shrink-0">
                      <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full truncate max-w-[120px]">
                        {entry.packageName}
                      </span>
                      <span className="font-black text-emerald-600 text-sm sm:text-base">${entry.amountPaid.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="space-y-6">
            {/* Packages Header */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-burgundy-900">Voting Packages</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Configure the voting packages available to users</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 rounded-full">
                    <span className="text-xs sm:text-sm text-gray-600">Active:</span>
                    <span className="font-bold text-green-600 text-sm">{packagesList.filter(p => p.isActive).length}/{packagesList.length}</span>
                  </div>
                  <button 
                    onClick={handleAddPackage}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gold-500 text-burgundy-900 rounded-full font-semibold text-xs sm:text-sm hover:bg-gold-400 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Package</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {packagesList.map((pkg, index) => (
                <div 
                  key={pkg.id}
                  className={`relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 transition-all group ${
                    pkg.isActive 
                      ? 'hover:shadow-lg hover:scale-[1.02]' 
                      : 'opacity-50'
                  }`}
                >
                  {/* Status Badge */}
                  <div className={`absolute -top-2 -right-2 sm:-top-2.5 sm:-right-2.5 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold rounded-full shadow-sm ${
                    pkg.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}>
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </div>

                  {/* Package Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-lg sm:rounded-xl flex items-center justify-center ${
                    index === 0 ? 'bg-gray-100' :
                    index === 1 ? 'bg-amber-100' :
                    index === 2 ? 'bg-gray-200' :
                    index === 3 ? 'bg-gold-100' :
                    index === 4 ? 'bg-purple-100' :
                    'bg-burgundy-100'
                  }`}>
                    <Crown className={`w-6 h-6 ${
                      index === 0 ? 'text-gray-500' :
                      index === 1 ? 'text-amber-600' :
                      index === 2 ? 'text-gray-500' :
                      index === 3 ? 'text-gold-600' :
                      index === 4 ? 'text-purple-600' :
                      'text-burgundy-600'
                    }`} />
                  </div>

                  <div className="text-center mb-2 sm:mb-3">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{pkg.name}</div>
                    <div className="text-2xl sm:text-4xl font-black text-burgundy-900">{pkg.votes}</div>
                    <div className="text-xs text-gray-500">{pkg.votes === 1 ? 'Vote' : 'Votes'}</div>
                  </div>

                  <div className="text-center mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100">
                    <span className="text-xl sm:text-2xl font-black text-gold-500">${pkg.price.toFixed(2)}</span>
                    <div className="text-xs text-gray-400 mt-1">
                      ${(pkg.price / pkg.votes).toFixed(2)} per vote
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleTogglePackage(pkg.id)}
                      className={`p-2.5 rounded-xl transition-colors ${
                        pkg.isActive 
                          ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title={pkg.isActive ? 'Disable' : 'Enable'}
                    >
                      {pkg.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleEditPackage(pkg)}
                      className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Packages Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-burgundy-900">{packagesList.filter(p => p.isActive).length}</div>
                    <div className="text-sm text-gray-500">Active Packages</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-gold-600" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-burgundy-900">
                      ${Math.min(...packagesList.filter(p => p.isActive).map(p => p.price)).toFixed(2)} - ${Math.max(...packagesList.filter(p => p.isActive).map(p => p.price)).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">Price Range</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-burgundy-900">
                      {Math.max(...packagesList.filter(p => p.isActive).map(p => p.votes)).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Max Votes/Package</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Event Details */}
              <div className="bg-white rounded-2xl p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-burgundy-900">Event Details</h3>
                  <button 
                    onClick={handleEditEvent}
                    className="flex items-center gap-2 px-4 py-2 bg-burgundy-900 text-white rounded-full font-medium text-sm hover:bg-burgundy-800 transition-all"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Event Name</label>
                    <p className="font-bold text-burgundy-900 mt-1">{eventFormData.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Tagline</label>
                    <p className="font-medium text-gray-700 mt-1">{eventFormData.tagline}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Event Dates</label>
                    <p className="font-medium text-gray-700 mt-1">{eventFormData.startDate} - {eventFormData.endDate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Voting Period</label>
                    <p className="font-medium text-gray-700 mt-1">{eventFormData.votingStart} - {eventFormData.votingEnd}</p>
                  </div>
                </div>
              </div>

              {/* Voting Controls */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-bold text-burgundy-900 mb-6">Voting Controls</h3>

                <div className="space-y-4">
                  <div className={`rounded-xl p-4 flex items-center justify-between ${votingActive ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div>
                      <p className="font-bold text-burgundy-900">Voting Status</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {votingActive ? 'Currently accepting votes' : 'Voting is closed'}
                      </p>
                    </div>
                    <button
                      onClick={() => setVotingActive(!votingActive)}
                      className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                        votingActive
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {votingActive ? 'Close Voting' : 'Open Voting'}
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <div>
                      <p className="font-bold text-burgundy-900 text-sm sm:text-base">Public Results</p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                        {publicResults ? 'Visible to all voters' : 'Hidden from voters'}
                      </p>
                    </div>
                    <button
                      onClick={() => setPublicResults(!publicResults)}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-full hover:bg-gray-100 transition-all text-xs sm:text-sm font-medium text-gray-700 self-start sm:self-auto"
                    >
                      {publicResults ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-red-50 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                    <div>
                      <p className="font-bold text-burgundy-900 text-sm sm:text-base">Reset All Votes</p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Clear all votes and start fresh</p>
                    </div>
                    <button 
                      onClick={handleResetVotes}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all text-xs sm:text-sm font-semibold self-start sm:self-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Management Sections */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Management */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-burgundy-900">Category Management</h3>
                  <button 
                    onClick={handleAddCategory}
                    className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-burgundy-900 rounded-full font-semibold text-sm hover:bg-gold-400 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {categoriesList.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-700">{category.name}</span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleEditCategory(category)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voting Packages Summary */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-burgundy-900">Voting Packages</h3>
                  <button 
                    onClick={() => setActiveTab('packages')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm hover:bg-gray-200 transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Manage</span>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Configure voting packages and pricing</p>
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-700">Active Packages</span>
                    <p className="text-xs text-gray-500">{packagesList.filter(p => p.isActive).length} of {packagesList.length} packages enabled</p>
                  </div>
                  <span className="text-2xl font-black text-gold-500">{packagesList.filter(p => p.isActive).length}</span>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-burgundy-900 mb-4 sm:mb-6">Data Management</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <button 
                  onClick={handleExportCSV}
                  className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-500 transition-colors">
                    <Download className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <span className="font-medium text-gray-700">Export Data</span>
                  <span className="text-xs text-gray-500 mt-1">Download as CSV</span>
                </button>
                
                <button 
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.csv'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        alert(`File "${file.name}" selected. Import functionality would process this file.`)
                      }
                    }
                    input.click()
                  }}
                  className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-500 transition-colors">
                    <Upload className="w-6 h-6 text-green-600 group-hover:text-white" />
                  </div>
                  <span className="font-medium text-gray-700">Import Data</span>
                  <span className="text-xs text-gray-500 mt-1">Upload CSV file</span>
                </button>
                
                <button 
                  onClick={() => {
                    setModalType('advanced')
                    setShowModal(true)
                  }}
                  className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-500 transition-colors">
                    <Settings className="w-6 h-6 text-purple-600 group-hover:text-white" />
                  </div>
                  <span className="font-medium text-gray-700">Advanced</span>
                  <span className="text-xs text-gray-500 mt-1">System settings</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Modal */}
      {showModal && (
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
                onClick={handleCloseModal}
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
                    
                    {/* Modern Drag & Drop Upload Area */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
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
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      {formData.image ? (
                        /* Image Preview with Overlay Controls */
                        <div className="relative group">
                          <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="w-full h-56 object-cover rounded-xl"
                          />
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                          
                          {/* Action Buttons Overlay */}
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
                          
                          {/* Success Badge */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Uploaded
                          </div>
                        </div>
                      ) : isUploading ? (
                        /* Upload Progress State */
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
                        /* Empty Drop Zone */
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
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveContestant}
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
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCategory}
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
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveManualVote}
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
                      <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={eventFormData.startDate}
                        onChange={(e) => setEventFormData({ ...eventFormData, startDate: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                        placeholder="Jan 1, 2026"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                        End Date
                      </label>
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
                      <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                        Voting Start
                      </label>
                      <input
                        type="text"
                        value={eventFormData.votingStart}
                        onChange={(e) => setEventFormData({ ...eventFormData, votingStart: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                        placeholder="Jan 15, 2026"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                        Voting End
                      </label>
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
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
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
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePackage}
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
                  {/* System Status Section */}
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

                  {/* Notifications Section */}
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

                  {/* Limits Section */}
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

                  {/* Danger Zone */}
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
                    onClick={handleCloseModal}
                    className="px-6 py-3 bg-gray-100 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Save settings logic here
                      handleCloseModal()
                    }}
                    className="px-6 py-3 bg-gold-500 text-burgundy-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-200 hover:scale-105"
                  >
                    Save Settings
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <Footer />
    {/* Ensure this closing div matches the top-level opening div in the component */}
    </div>
  );
}
