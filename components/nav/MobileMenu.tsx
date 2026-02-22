'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, Settings, User, LogOut } from 'lucide-react'
import type { SessionUser } from '@/types'

interface NavLink { href: string; label: string }

interface MobileMenuProps {
  open: boolean
  navLinks: NavLink[]
  pathname: string
  user?: SessionUser | null
  onClose: () => void
  onSignOut: () => void
}

export default function MobileMenu({ open, navLinks, pathname, user, onClose, onSignOut }: MobileMenuProps) {
  return (
    <div
      className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="px-3 sm:px-4 py-4 space-y-1 bg-burgundy-900/95 border-t border-white/5">
        {navLinks.map(({ href, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`block px-4 py-3 text-sm font-medium rounded-full transition-all duration-200 ${
                isActive ? 'text-gold-400 bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
          <Link
            href="/ticketing"
            onClick={onClose}
            className="block px-4 py-3 text-sm font-semibold bg-gold-400 text-burgundy-900 rounded-full text-center hover:bg-gold-500 transition-all duration-200"
          >
            Get Tickets
          </Link>

          {user ? (
            <>
              {/* User info card */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'Profile'}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-gold-400/50"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gold-400 flex items-center justify-center ring-2 ring-gold-400/50">
                    <span className="text-sm font-bold text-burgundy-900">
                      {(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                </div>
              </div>

              {[
                { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { href: '/settings', icon: Settings, label: 'Settings' },
                ...(user.role === 'admin' ? [{ href: '/admin', icon: User, label: 'Admin Panel' }] : []),
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/70 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}

              <button
                onClick={() => { onClose(); onSignOut() }}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 rounded-full hover:bg-white/5 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/signin"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white/80 hover:text-white border border-white/15 rounded-full hover:bg-white/5 transition-all duration-200"
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
