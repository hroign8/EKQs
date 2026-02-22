'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Bell } from 'lucide-react'
import type { Notification } from '@/lib/useNotifications'

interface NotificationBellProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

export default function NotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationBellProps) {
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

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || dropRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => { window.removeEventListener('scroll', updatePos, true); window.removeEventListener('resize', updatePos) }
  }, [open, updatePos])

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => { updatePos(); setOpen((o) => !o) }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        className="relative p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right }}
          className="w-80 max-h-96 bg-burgundy-800 border border-white/10 rounded-2xl shadow-xl shadow-black/30 overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={onMarkAllAsRead} className="text-xs text-gold-400 hover:text-gold-300 transition-colors">
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-72">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/50">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.read) onMarkAsRead(n.id)
                    if (n.link) { setOpen(false); window.location.href = n.link }
                  }}
                  className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!n.read ? 'bg-white/[0.02]' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-gold-400' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-white/70'}`}>{n.title}</p>
                      <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-white/30 mt-1">
                        {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
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
    </>
  )
}
