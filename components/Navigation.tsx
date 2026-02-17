'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X, Search, LogOut, User, ChevronDown, Settings, LayoutDashboard, Bell, Check } from 'lucide-react'
import { useSession, signOut } from '@/lib/auth-client'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  link: string | null
  createdAt: string
}

type SearchResult = {
  id: string
  name: string
  country: string
  image: string
}

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })
  const profileBtnRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Notifications state
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifDropdownPos, setNotifDropdownPos] = useState({ top: 0, right: 0 })
  const notifBtnRef = useRef<HTMLButtonElement>(null)
  const notifDropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchResultsRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Position dropdown relative to the profile button
  const updateDropdownPos = useCallback(() => {
    if (profileBtnRef.current) {
      const rect = profileBtnRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
  }, [])

  const updateNotifDropdownPos = useCallback(() => {
    if (notifBtnRef.current) {
      const rect = notifBtnRef.current.getBoundingClientRect()
      setNotifDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
  }, [])

  // Search contestants with debounce
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    if (query.trim().length < 2) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }
    
    setSearchLoading(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.contestants)
        }
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setSearchLoading(false)
      }
    }, 300)
  }, [])

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Fetch notifications
  useEffect(() => {
    if (!session?.user) return

    const abortController = new AbortController()

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications?limit=10', {
          signal: abortController.signal,
        })
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications)
          setUnreadCount(data.unreadCount)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('Failed to fetch notifications:', err)
      }
    }

    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    return () => {
      abortController.abort()
      clearInterval(interval)
    }
  }, [session?.user])

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        profileBtnRef.current && !profileBtnRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setProfileOpen(false)
      }
      if (
        notifBtnRef.current && !notifBtnRef.current.contains(target) &&
        notifDropdownRef.current && !notifDropdownRef.current.contains(target)
      ) {
        setNotificationsOpen(false)
      }
      if (
        searchInputRef.current && !searchInputRef.current.contains(target) &&
        searchResultsRef.current && !searchResultsRef.current.contains(target)
      ) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!profileOpen) return
    updateDropdownPos()
    window.addEventListener('scroll', updateDropdownPos, true)
    window.addEventListener('resize', updateDropdownPos)
    return () => {
      window.removeEventListener('scroll', updateDropdownPos, true)
      window.removeEventListener('resize', updateDropdownPos)
    }
  }, [profileOpen, updateDropdownPos])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/contestants', label: 'Contestants' },
    { href: '/about', label: 'About' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/vote', label: 'Standings' },
    { href: '/contact', label: 'Contact' },
  ];

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-[100] bg-burgundy-900/95 backdrop-blur-md border-b border-white/5 safe-bottom">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <Image
              src="/kings and queenz logo.svg"
              alt="EKQs Logo"
              width={40}
              height={40}
              className="rounded-full group-hover:opacity-90 transition-opacity duration-200"
            />
            <span className="text-lg font-semibold text-white hidden sm:block">
              EKQ<span className="text-gold-400">s</span>
            </span>
          </Link>

          {/* Mobile Search - visible on mobile/tablet */}
          <div className="flex-1 lg:hidden max-w-[200px] sm:max-w-xs mx-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white/5 border border-white/10 rounded-full text-white placeholder-white/40 focus:bg-white/10 focus:border-gold-400 focus:outline-none transition-all duration-200"
              />
              
              {/* Mobile Search Results Dropdown */}
              {searchFocused && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-burgundy-800 border border-white/10 rounded-xl shadow-xl shadow-black/30 overflow-hidden z-[9999]">
                  {searchLoading ? (
                    <div className="px-4 py-3 text-sm text-white/50">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-white/50">No contestants found</div>
                  ) : (
                    <div className="py-1">
                      {searchResults.map((contestant) => (
                        <Link
                          key={contestant.id}
                          href={`/contestants/${contestant.id}`}
                          onClick={() => { setSearchFocused(false); setSearchQuery(''); setSearchResults([]); }}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors"
                        >
                          <Image
                            src={contestant.image || '/uploads/contestants/placeholder.svg'}
                            alt={contestant.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">{contestant.name}</p>
                            <p className="text-xs text-white/50">{contestant.country}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 xl:px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-gold-400 bg-white/5'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Search & CTA Buttons */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search contestants..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-36 xl:w-44 pl-9 pr-3 py-2 text-sm bg-white/5 border border-white/10 rounded-full text-white placeholder-white/40 focus:bg-white/10 focus:border-gold-400 focus:outline-none transition-all duration-200"
              />
              
              {/* Search Results Dropdown */}
              {searchFocused && searchQuery.length >= 2 && (
                <div
                  ref={searchResultsRef}
                  className="absolute top-full left-0 mt-2 w-72 bg-burgundy-800 border border-white/10 rounded-xl shadow-xl shadow-black/30 overflow-hidden z-[9999]"
                >
                  {searchLoading ? (
                    <div className="px-4 py-3 text-sm text-white/50">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-white/50">No contestants found</div>
                  ) : (
                    <div className="py-1">
                      {searchResults.map((contestant) => (
                        <Link
                          key={contestant.id}
                          href={`/contestants/${contestant.id}`}
                          onClick={() => { setSearchFocused(false); setSearchQuery(''); setSearchResults([]); }}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors"
                        >
                          <Image
                            src={contestant.image || '/uploads/contestants/placeholder.svg'}
                            alt={contestant.name}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">{contestant.name}</p>
                            <p className="text-xs text-white/50">{contestant.country}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tickets button first */}
            <Link 
              href="/ticketing" 
              className="px-4 xl:px-5 py-2 text-sm font-semibold bg-gold-400 text-burgundy-900 rounded-full hover:bg-gold-500 transition-all duration-200"
            >
              Get Tickets
            </Link>

            {/* Sign In / Profile last */}
            {!isPending && session?.user ? (
              <div className="flex items-center gap-3">
                <div className="w-px h-6 bg-white/10" />
                
                {/* Notification Bell */}
                <button
                  ref={notifBtnRef}
                  onClick={() => { updateNotifDropdownPos(); setNotificationsOpen(!notificationsOpen); }}
                  className="relative p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown - rendered via portal */}
                {notificationsOpen && typeof document !== 'undefined' && createPortal(
                  <div
                    ref={notifDropdownRef}
                    style={{ position: 'fixed', top: notifDropdownPos.top, right: notifDropdownPos.right }}
                    className="w-80 max-h-96 bg-burgundy-800 border border-white/10 rounded-2xl shadow-xl shadow-black/30 overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-gold-400 hover:text-gold-300 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-72">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell className="w-8 h-8 text-white/20 mx-auto mb-2" />
                          <p className="text-sm text-white/50">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => {
                              if (!notification.read) markAsRead(notification.id);
                              if (notification.link) {
                                setNotificationsOpen(false);
                                window.location.href = notification.link;
                              }
                            }}
                            className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                              !notification.read ? 'bg-white/[0.02]' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                !notification.read ? 'bg-gold-400' : 'bg-transparent'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notification.read ? 'text-white font-medium' : 'text-white/70'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-[10px] text-white/30 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>,
                  document.body
                )}
                
                <button
                  ref={profileBtnRef}
                  onClick={() => { updateDropdownPos(); setProfileOpen(!profileOpen); }}
                  className="relative flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  <div className="relative">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'Profile'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-gold-400/60"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gold-400 flex items-center justify-center ring-2 ring-gold-400/60">
                        <span className="text-sm font-bold text-burgundy-900">
                          {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Live green dot */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-burgundy-900" />
                  </div>
                  <ChevronDown className={`w-3 h-3 text-white/50 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown - rendered via portal to escape stacking context */}
                {profileOpen && typeof document !== 'undefined' && createPortal(
                  <div
                    ref={dropdownRef}
                    style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right }}
                    className="w-64 bg-burgundy-800 border border-white/10 rounded-2xl shadow-xl shadow-black/30 overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-4 border-b border-white/10 bg-white/5">
                      <div className="flex items-center gap-3">
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || 'Profile'}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-gold-400/40"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gold-400 flex items-center justify-center ring-2 ring-gold-400/40">
                            <span className="text-base font-bold text-burgundy-900">
                              {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {session.user.name || 'User'}
                          </p>
                          <p className="text-xs text-white/50 truncate">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors duration-150"
                      >
                        <LayoutDashboard className="w-4 h-4 text-white/50" />
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors duration-150"
                      >
                        <Settings className="w-4 h-4 text-white/50" />
                        Settings
                      </Link>
                      {session.user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors duration-150"
                        >
                          <User className="w-4 h-4 text-white/50" />
                          Admin Panel
                        </Link>
                      )}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-white/10 py-1.5">
                      <button
                        onClick={() => { setProfileOpen(false); handleSignOut(); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors duration-150"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-px h-6 bg-white/10" />
                <Link 
                  href="/signin" 
                  className="flex items-center gap-2 px-4 xl:px-5 py-2 text-sm font-medium text-white/80 hover:text-white border border-white/15 rounded-full hover:border-white/30 transition-all duration-200"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-gold-400 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-3 sm:px-4 py-4 space-y-1 bg-burgundy-900/95 border-t border-white/5">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? 'text-gold-400 bg-white/5'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            );
          })}
          <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
            {/* Tickets first in mobile too */}
            <Link 
              href="/ticketing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-semibold bg-gold-400 text-burgundy-900 rounded-full text-center hover:bg-gold-500 transition-all duration-200"
            >
              Get Tickets
            </Link>

            {!isPending && session?.user ? (
              <>
                {/* User info card */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'Profile'}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-gold-400/50"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gold-400 flex items-center justify-center ring-2 ring-gold-400/50">
                      <span className="text-sm font-bold text-burgundy-900">
                        {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{session.user.name || 'User'}</p>
                    <p className="text-xs text-white/50 truncate">{session.user.email}</p>
                  </div>
                </div>
                <Link 
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                {session.user.role === 'admin' && (
                  <Link 
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 rounded-full hover:bg-white/5 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white/80 hover:text-white border border-white/15 rounded-full hover:bg-white/5 transition-all duration-200"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}