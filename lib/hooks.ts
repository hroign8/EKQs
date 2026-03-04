import { useState, useEffect, useCallback } from 'react'
import type { Contestant, Event } from '@/types'

// ── Currency helpers (shared across voting modal & ticketing) ──────────────

export interface CurrencyInfo {
  code: string
  symbol: string
  rate: number
}

const currencySymbols: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', INR: '₹',
  AUD: 'A$', CAD: 'C$', CHF: 'CHF', KRW: '₩', SGD: 'S$', HKD: 'HK$',
  SEK: 'kr', NOK: 'kr', DKK: 'kr', NZD: 'NZ$', ZAR: 'R', MXN: 'MX$',
  BRL: 'R$', RUB: '₽', TRY: '₺', PLN: 'zł', THB: '฿', MYR: 'RM',
  PHP: '₱', IDR: 'Rp', VND: '₫', AED: 'د.إ', SAR: '﷼', EGP: 'E£',
  NGN: '₦', KES: 'KSh', GHS: 'GH₵', ETB: 'Br', ERN: 'Nfk', UGX: 'UGX',
}

const timezoneToCurrency: Record<string, string> = {
  'Africa/Kampala': 'UGX', 'Africa/Nairobi': 'KES', 'Africa/Lagos': 'NGN',
  'Africa/Accra': 'GHS', 'Africa/Addis_Ababa': 'ETB', 'Africa/Asmara': 'ERN',
  'Africa/Cairo': 'EGP', 'Africa/Johannesburg': 'ZAR',
  'Europe/London': 'GBP', 'Europe/Paris': 'EUR', 'Europe/Berlin': 'EUR',
  'Europe/Stockholm': 'SEK', 'Europe/Oslo': 'NOK', 'Europe/Zurich': 'CHF',
  'Asia/Tokyo': 'JPY', 'Asia/Shanghai': 'CNY', 'Asia/Singapore': 'SGD',
  'Asia/Seoul': 'KRW', 'Asia/Kolkata': 'INR', 'Asia/Dubai': 'AED',
  'Australia/Sydney': 'AUD', 'Pacific/Auckland': 'NZD',
  'America/New_York': 'USD', 'America/Toronto': 'CAD', 'America/Mexico_City': 'MXN',
  'America/Sao_Paulo': 'BRL',
}

/** Module-level cache shared across all hook instances */
let exchangeRateCache: { rates: Record<string, number>; fetchedAt: number } | null = null
const EXCHANGE_RATE_TTL = 10 * 60 * 1000

const ZERO_DECIMAL_CURRENCIES = ['JPY', 'KRW', 'VND', 'IDR', 'UGX', 'NGN', 'KES']

/**
 * Resolves a currency code to its exchange rate and symbol, updating state.
 * Reuses the module-level cache for exchange rates.
 */
async function applyRate(
  code: string,
  setter: (c: CurrencyInfo) => void,
  isCancelled: () => boolean,
) {
  if (code === 'USD') {
    if (!isCancelled()) setter({ code: 'USD', symbol: '$', rate: 1 })
    return
  }
  if (!exchangeRateCache || Date.now() - exchangeRateCache.fetchedAt >= EXCHANGE_RATE_TTL) {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    if (res.ok) {
      const data = await res.json()
      exchangeRateCache = { rates: data.rates ?? {}, fetchedAt: Date.now() }
    }
  }
  if (!isCancelled() && exchangeRateCache) {
    const rate = exchangeRateCache.rates[code] || 1
    const symbol = currencySymbols[code] || code
    setter({ code, symbol, rate })
  }
}

/**
 * Detects the user's currency in this priority order:
 * 1. User's `preferredCurrency` saved in their profile (from /api/user/settings)
 * 2. Browser timezone mapping
 * 3. USD fall-back
 *
 * Prices stored in the DB are always in USD — this hook converts for display only.
 */
export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyInfo>({ code: 'USD', symbol: '$', rate: 1 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const isCancelled = () => cancelled

    const detect = async () => {
      try {
        // 1. Check user's saved preference from DB
        const settingsRes = await fetch('/api/user/settings')
        if (settingsRes.ok) {
          const { preferredCurrency } = await settingsRes.json() as { preferredCurrency: string | null }
          if (preferredCurrency) {
            await applyRate(preferredCurrency, setCurrency, isCancelled)
            return
          }
        }

        // 2. Fall back to timezone detection
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const detectedCode = timezoneToCurrency[timezone] || 'USD'
        await applyRate(detectedCode, setCurrency, isCancelled)
      } catch {
        // Silently fall back to USD
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    detect()
    return () => { cancelled = true }
  }, [])

  const formatPrice = useCallback(
    (usdPrice: number) => {
      const local = usdPrice * currency.rate
      if (ZERO_DECIMAL_CURRENCIES.includes(currency.code)) {
        return `${currency.symbol}${Math.round(local).toLocaleString()}`
      }
      return `${currency.symbol}${local.toFixed(2)}`
    },
    [currency],
  )

  return { currency, formatPrice, loading }
}

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
