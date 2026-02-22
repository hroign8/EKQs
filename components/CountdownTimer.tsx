'use client'

import { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'
import { formatDateShort, parseLocalDate } from '@/lib/utils'

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

export default function CountdownTimer({ endDate, eventDate }: { endDate: string; eventDate?: string }) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  })

  const targetDate = eventDate || endDate

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const base = parseLocalDate(targetDate)
      const endDateTime = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 59, 999)
      const now = new Date()

      const difference = endDateTime.getTime() - now.getTime()

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      })
    }

    calculateTimeRemaining()
    const timer = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (timeRemaining.isExpired) {
    return (
      <div className="bg-burgundy-900 rounded-2xl p-5 sm:p-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Event Has Started!</h2>
        <p className="text-sm sm:text-base text-burgundy-200">Thank you for being part of this celebration</p>
      </div>
    )
  }

  return (
    <div className="bg-burgundy-900 rounded-2xl p-5 sm:p-8">
      <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
        <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-gold-500" />
        <h2 className="text-sm sm:text-lg font-semibold text-white">Voting Ends {formatDateShort(targetDate)}</h2>
      </div>
      
      <div
        aria-label={`${timeRemaining.days} days, ${timeRemaining.hours} hours, ${timeRemaining.minutes} minutes remaining`}
        className="flex items-center justify-center gap-2 sm:gap-6"
      >
        {/* Days */}
        <div className="text-center">
          <div className="text-3xl sm:text-5xl font-bold text-gold-500 tabular-nums">
            {String(timeRemaining.days).padStart(2, '0')}
          </div>
          <div className="text-xs text-burgundy-200 mt-1 uppercase tracking-wider">Days</div>
        </div>
        
        <span className="text-2xl sm:text-3xl text-gold-500/50 font-light">:</span>
        
        {/* Hours */}
        <div className="text-center">
          <div className="text-3xl sm:text-5xl font-bold text-gold-500 tabular-nums">
            {String(timeRemaining.hours).padStart(2, '0')}
          </div>
          <div className="text-xs text-burgundy-200 mt-1 uppercase tracking-wider">Hours</div>
        </div>
        
        <span className="text-2xl sm:text-3xl text-gold-500/50 font-light">:</span>
        
        {/* Minutes */}
        <div className="text-center">
          <div className="text-3xl sm:text-5xl font-bold text-gold-500 tabular-nums">
            {String(timeRemaining.minutes).padStart(2, '0')}
          </div>
          <div className="text-xs text-burgundy-200 mt-1 uppercase tracking-wider">Mins</div>
        </div>
        
        <span className="text-2xl sm:text-3xl text-gold-500/50 font-light">:</span>
        
        {/* Seconds */}
        <div className="text-center">
          <div className="text-3xl sm:text-5xl font-bold text-gold-500 tabular-nums">
            {String(timeRemaining.seconds).padStart(2, '0')}
          </div>
          <div className="text-xs text-burgundy-200 mt-1 uppercase tracking-wider">Secs</div>
        </div>
      </div>
    </div>
  )
}

