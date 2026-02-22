'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export type SearchResult = {
  id: string
  name: string
  country: string
  image: string
}

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (query.trim().length < 2) { setSearchResults([]); setSearchLoading(false); return }
    setSearchLoading(true)
    timeoutRef.current = setTimeout(async () => {
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

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setSearchLoading(false)
  }, [])

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }, [])

  return { searchQuery, searchResults, searchLoading, handleSearch, clearSearch }
}
