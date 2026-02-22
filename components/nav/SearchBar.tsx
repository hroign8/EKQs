'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { useSearch, type SearchResult } from '@/lib/useSearch'

interface SearchBarProps {
  /** Variant for layout within nav */
  variant: 'desktop' | 'mobile'
}

function ResultsList({
  results,
  loading,
  onClose,
}: {
  results: SearchResult[]
  loading: boolean
  onClose: () => void
}) {
  if (loading) return <div className="px-4 py-3 text-sm text-white/50">Searching...</div>
  if (results.length === 0) return <div className="px-4 py-3 text-sm text-white/50">No contestants found</div>
  return (
    <div className="py-1">
      {results.map((c) => (
        <Link
          key={c.id}
          href={`/contestants/${c.id}`}
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors"
        >
          <Image
            src={c.image || '/uploads/contestants/placeholder.svg'}
            alt={c.name}
            width={c.id ? 36 : 32}
            height={c.id ? 36 : 32}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-white">{c.name}</p>
            <p className="text-xs text-white/50">{c.country}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function SearchBar({ variant }: SearchBarProps) {
  const { searchQuery, searchResults, searchLoading, handleSearch, clearSearch } = useSearch()
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => { setFocused(false); clearSearch() }, [clearSearch])
  const showDropdown = focused && searchQuery.length >= 2

  const inputCls =
    variant === 'desktop'
      ? 'w-36 xl:w-44 pl-9 pr-3 py-2 text-sm bg-white/5 border border-white/10 rounded-full text-white placeholder-white/40 focus:bg-white/10 focus:border-gold-400 focus:outline-none transition-all duration-200'
      : 'w-full pl-9 pr-3 py-2 text-sm bg-white/5 border border-white/10 rounded-full text-white placeholder-white/40 focus:bg-white/10 focus:border-gold-400 focus:outline-none transition-all duration-200'

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        placeholder={variant === 'desktop' ? 'Search contestants...' : 'Search...'}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          // Delay so click on result still fires
          if (!dropdownRef.current?.contains(e.relatedTarget as Node)) setFocused(false)
        }}
        className={inputCls}
      />

      {showDropdown && (
        <div
          ref={dropdownRef}
          className={`absolute top-full mt-2 bg-burgundy-800 border border-white/10 rounded-xl shadow-xl shadow-black/30 overflow-hidden z-[9999] ${
            variant === 'desktop' ? 'left-0 w-72' : 'left-0 right-0'
          }`}
        >
          <ResultsList results={searchResults} loading={searchLoading} onClose={handleClose} />
        </div>
      )}
    </div>
  )
}
