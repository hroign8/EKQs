'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Crown,
  Loader2,
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Camera,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  Ticket,
  Heart,
  CalendarDays,
  ChevronRight,
} from 'lucide-react'
import { useSession, updateUser, changePassword } from '@/lib/auth-client'

type SettingsTab = 'profile' | 'security' | 'notifications'

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, isPending: sessionPending } = useSession()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Profile form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [voteUpdates, setVoteUpdates] = useState(true)
  const [ticketReminders, setTicketReminders] = useState(true)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      setEmail(session.user.email || '')
      setAvatarPreview(session.user.image || null)
    }
  }, [session])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setUploadingAvatar(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to upload photo')
        setAvatarPreview(session?.user?.image || null)
        return
      }

      setSuccess('Profile photo updated!')
      setAvatarPreview(data.imageUrl)
      router.refresh()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to upload photo')
      setAvatarPreview(session?.user?.image || null)
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
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
      window.location.href = '/signin'
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy-900" />
      </div>
    )
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await updateUser({ name })
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setSaving(false)
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      setSaving(false)
      return
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      })
      setSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to change password. Check your current password.')
    } finally {
      setSaving(false)
    }
  }

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode; description: string }[] = [
    { key: 'profile', label: 'Profile', icon: <User className="w-5 h-5" />, description: 'Manage your personal info' },
    { key: 'security', label: 'Security', icon: <Shield className="w-5 h-5" />, description: 'Password & authentication' },
    { key: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, description: 'Email & alert preferences' },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-burgundy-900 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          {/* Back Link */}
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt={session.user.name || 'Profile'}
                  width={96}
                  height={96}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white/20"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gold-500 flex items-center justify-center ring-4 ring-white/20">
                  <span className="text-3xl font-bold text-burgundy-900">
                    {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                  </span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-burgundy-900 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {session.user.name || 'User'}
              </h1>
              <p className="text-burgundy-200 text-sm sm:text-base mb-3">{session.user.email}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white/80 rounded-full">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Member since {session.user.createdAt ? formatDate(String(session.user.createdAt)) : 'N/A'}
                </span>
                {session.user.role === 'admin' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/20 text-gold-400 rounded-full font-medium">
                    <Crown className="w-3.5 h-3.5" />
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar Navigation - Desktop */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-burgundy-900">Settings</h2>
              </div>
              <nav className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      activeTab === tab.key
                        ? 'bg-burgundy-50 text-burgundy-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-burgundy-900'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activeTab === tab.key ? 'bg-burgundy-900 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{tab.label}</p>
                      <p className="text-xs text-gray-400 truncate">{tab.description}</p>
                    </div>
                    {activeTab === tab.key && (
                      <ChevronRight className="w-4 h-4 text-burgundy-900" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Quick Links */}
              <div className="p-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-3 px-1">QUICK LINKS</p>
                <div className="space-y-1">
                  <Link
                    href="/vote"
                    className="flex items-center gap-3 p-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-burgundy-900 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    Vote Now
                  </Link>
                  <Link
                    href="/ticketing"
                    className="flex items-center gap-3 p-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-burgundy-900 transition-colors"
                  >
                    <Ticket className="w-4 h-4" />
                    Get Tickets
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden overflow-x-auto -mx-4 px-4 mb-2">
            <div className="flex gap-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-burgundy-900 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Success/Error Messages */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-burgundy-900">Profile Information</h2>
                    <p className="text-sm text-gray-500 mt-1">Update your personal details and public profile</p>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="p-5 sm:p-6 space-y-5">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-burgundy-900 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>

                    {/* Email Field (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          disabled
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-500 bg-gray-50 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Email address cannot be changed</p>
                    </div>

                    {/* Save Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving || name === session.user.name}
                        className="w-full sm:w-auto px-8 py-3 bg-burgundy-900 text-white rounded-full font-semibold hover:bg-burgundy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Account Stats */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-burgundy-900">Account Overview</h2>
                    <p className="text-sm text-gray-500 mt-1">Your activity summary</p>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <Heart className="w-5 h-5 text-burgundy-900 mb-2" />
                        <p className="text-2xl font-bold text-burgundy-900">—</p>
                        <p className="text-xs text-gray-500 mt-1">Votes Cast</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <Ticket className="w-5 h-5 text-burgundy-900 mb-2" />
                        <p className="text-2xl font-bold text-burgundy-900">—</p>
                        <p className="text-xs text-gray-500 mt-1">Tickets</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
                        <Mail className="w-5 h-5 text-burgundy-900 mb-2" />
                        <p className="text-2xl font-bold text-burgundy-900">—</p>
                        <p className="text-xs text-gray-500 mt-1">Messages</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      className="mt-4 inline-flex items-center gap-2 text-sm text-gold-600 hover:text-gold-700 font-medium"
                    >
                      View full details on Dashboard
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-burgundy-900">Change Password</h2>
                    <p className="text-sm text-gray-500 mt-1">Update your password to keep your account secure</p>
                  </div>

                  <form onSubmit={handlePasswordChange} className="p-5 sm:p-6 space-y-5">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl text-burgundy-900 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl text-burgundy-900 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Minimum 8 characters required</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl text-burgundy-900 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-2">Passwords do not match</p>
                      )}
                    </div>

                    {/* Change Password Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={saving || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                        className="w-full sm:w-auto px-8 py-3 bg-burgundy-900 text-white rounded-full font-semibold hover:bg-burgundy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Security Tips */}
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-burgundy-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-burgundy-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-burgundy-900 mb-2">Security Tips</h3>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-burgundy-900 mt-0.5 flex-shrink-0" />
                          Use a unique password you don&apos;t use elsewhere
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-burgundy-900 mt-0.5 flex-shrink-0" />
                          Include numbers, symbols, and mixed case letters
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-burgundy-900 mt-0.5 flex-shrink-0" />
                          Avoid personal information in your password
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-burgundy-900">Email Notifications</h2>
                    <p className="text-sm text-gray-500 mt-1">Choose what updates you want to receive</p>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {/* Email Notifications Toggle */}
                    <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-6 h-6 text-burgundy-900" />
                        </div>
                        <div>
                          <p className="font-semibold text-burgundy-900">Email Notifications</p>
                          <p className="text-sm text-gray-500 mt-0.5">Receive important updates via email</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                          emailNotifications ? 'bg-gold-500' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={emailNotifications}
                      >
                        <span
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
                            emailNotifications ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Vote Updates Toggle */}
                    <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Heart className="w-6 h-6 text-burgundy-900" />
                        </div>
                        <div>
                          <p className="font-semibold text-burgundy-900">Vote Confirmations</p>
                          <p className="text-sm text-gray-500 mt-0.5">Get notified when your votes are confirmed</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setVoteUpdates(!voteUpdates)}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                          voteUpdates ? 'bg-gold-500' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={voteUpdates}
                      >
                        <span
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
                            voteUpdates ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Ticket Reminders Toggle */}
                    <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Ticket className="w-6 h-6 text-burgundy-900" />
                        </div>
                        <div>
                          <p className="font-semibold text-burgundy-900">Event Reminders</p>
                          <p className="text-sm text-gray-500 mt-0.5">Receive reminders about upcoming events</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setTicketReminders(!ticketReminders)}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                          ticketReminders ? 'bg-gold-500' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={ticketReminders}
                      >
                        <span
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
                            ticketReminders ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info Note */}
                <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Notification preferences are saved automatically.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
