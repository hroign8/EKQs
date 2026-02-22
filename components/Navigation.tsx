'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, User } from 'lucide-react'
import { useSession, signOut } from '@/lib/auth-client'
import { useNotifications } from '@/lib/useNotifications'
import SearchBar from '@/components/nav/SearchBar'
import NotificationBell from '@/components/nav/NotificationBell'
import ProfileMenu from '@/components/nav/ProfileMenu'
import MobileMenu from '@/components/nav/MobileMenu'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/contestants', label: 'Contestants' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/vote', label: 'Standings' },
  { href: '/contact', label: 'Contact' },
]

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(session?.user?.id)

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

          {/* Mobile Search */}
          <div className="flex-1 lg:hidden max-w-[200px] sm:max-w-xs mx-2">
            <SearchBar variant="mobile" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 xl:px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive ? 'text-gold-400 bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Desktop: Search + CTA + Auth */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-6">
            <SearchBar variant="desktop" />

            <Link
              href="/ticketing"
              className="px-4 xl:px-5 py-2 text-sm font-semibold bg-gold-400 text-burgundy-900 rounded-full hover:bg-gold-500 transition-all duration-200"
            >
              Get Tickets
            </Link>

            {!isPending && session?.user ? (
              <div className="flex items-center gap-3">
                <div className="w-px h-6 bg-white/10" />
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                />
                <ProfileMenu user={session.user as Parameters<typeof ProfileMenu>[0]['user']} onSignOut={handleSignOut} />
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

      <MobileMenu
        open={mobileMenuOpen}
        navLinks={NAV_LINKS}
        pathname={pathname}
        user={session?.user as Parameters<typeof MobileMenu>[0]['user']}
        onClose={() => setMobileMenuOpen(false)}
        onSignOut={handleSignOut}
      />
    </nav>
  )
}
