'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { ChevronDown, LayoutDashboard, Settings, User, LogOut } from 'lucide-react'
import type { SessionUser } from '@/types'

interface ProfileMenuProps {
  user: SessionUser
  onSignOut: () => void
}

export default function ProfileMenu({ user, onSignOut }: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const updatePos = useCallback(() => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
    }
  }, [])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || dropRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  useEffect(() => {
    if (!open) return
    updatePos()
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => { window.removeEventListener('scroll', updatePos, true); window.removeEventListener('resize', updatePos) }
  }, [open, updatePos])

  const initial = (user.name?.[0] || user.email?.[0] || 'U').toUpperCase()

  const Avatar = ({ size }: { size: 8 | 10 }) => (
    user.image ? (
      <Image
        src={user.image}
        alt={user.name || 'Profile'}
        width={size === 8 ? 32 : 40}
        height={size === 8 ? 32 : 40}
        className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-gold-400/60`}
      />
    ) : (
      <div className={`w-${size} h-${size} rounded-full bg-gold-400 flex items-center justify-center ring-2 ring-gold-400/60`}>
        <span className={`${size === 8 ? 'text-sm' : 'text-base'} font-bold text-burgundy-900`}>{initial}</span>
      </div>
    )
  )

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => { updatePos(); setOpen((o) => !o) }}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="relative flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl hover:bg-white/10 transition-all duration-200"
      >
        <div className="relative">
          <Avatar size={8} />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-burgundy-900" />
        </div>
        <ChevronDown className={`w-3 h-3 text-white/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right }}
          className="w-64 bg-burgundy-800 border border-white/10 rounded-2xl shadow-xl shadow-black/30 overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* User Info Header */}
          <div className="px-4 py-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
            <Avatar size={10} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
              <p className="text-xs text-white/50 truncate">{user.email}</p>
            </div>
          </div>

          <div className="py-1.5">
            {[
              { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { href: '/settings', icon: Settings, label: 'Settings' },
              ...(user.role === 'admin' ? [{ href: '/admin', icon: User, label: 'Admin Panel' }] : []),
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors duration-150"
              >
                <Icon className="w-4 h-4 text-white/50" />
                {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-white/10 py-1.5">
            <button
              onClick={() => { setOpen(false); onSignOut() }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors duration-150"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
