import { useState, useEffect } from 'react'
import type { Contestant, Event } from '@/types'

/**
 * Generic fetch hook for API data.
 */
export function useApiData<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!cancelled) {
          setData(json)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [url])

  return { data, loading, error, setData }
}

/**
 * Fetch contestants from the API (returns first page of results).
 */
export function useContestants() {
  const result = useApiData<{ contestants: Contestant[]; total: number; page: number; totalPages: number } | Contestant[]>(
    '/api/contestants',
    [] as Contestant[]
  )
  // Normalise: API returns either a paginated object or a plain array (legacy)
  const contestants = Array.isArray(result.data)
    ? result.data
    : (result.data as { contestants: Contestant[] }).contestants ?? []
  return { ...result, data: contestants }
}

/**
 * Fetch event data from the API.
 */
export function useEvent() {
  return useApiData<Event | null>('/api/event', null)
}
