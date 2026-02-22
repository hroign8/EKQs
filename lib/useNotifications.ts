'use client'

import { useState, useEffect, useCallback } from 'react'

export type Notification = {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  link: string | null
  createdAt: string
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) return
    const abortController = new AbortController()

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications?limit=10', { signal: abortController.signal })
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
    const interval = setInterval(fetchNotifications, 30000)
    return () => { abortController.abort(); clearInterval(interval) }
  }, [userId])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }, [])

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
