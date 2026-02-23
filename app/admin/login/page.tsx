'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Crown, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { signIn, useSession } from '@/lib/auth-client'
import { isAdmin } from '@/types'
import { useEffect } from 'react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { data: session, isPending: sessionPending } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (!sessionPending && session?.user) {
      if (isAdmin(session.user)) {
        router.replace('/admin')
      }
    }
  }, [session, sessionPending, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await signIn.email({ email, password })
      if (result.error) {
        setError(result.error.message || 'Invalid credentials.')
      } else {
        // Verify the user has admin role before allowing access
        const sessionRes = await fetch('/api/auth/get-session')
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json()
          if (sessionData?.user?.role !== 'admin') {
            setError('Access denied. This portal is restricted to administrators only.')
            // Sign out the non-admin user from admin context
            await fetch('/api/auth/sign-out', { method: 'POST' })
            return
          }
        }
        router.push('/admin')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sessionPending) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy-900" />
      </main>
    )
  }

  if (session?.user && isAdmin(session.user)) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy-900" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-burgundy-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gold-500"></div>
            <Crown className="w-6 h-6 text-gold-500" />
            <div className="h-px w-12 bg-gold-500"></div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-burgundy-200">Sign in to access the admin dashboard</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Admin badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-burgundy-900" />
            <span className="text-sm font-semibold text-burgundy-900 uppercase tracking-wider">
              Authorized Personnel Only
            </span>
          </div>

          {/* Sign In Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition-all"
                    placeholder="admin@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-burgundy-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 focus:outline-none transition-all"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-burgundy-900 hover:bg-burgundy-800 text-white py-4 rounded-full font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            This area is restricted to administrators only.
          </p>
        </div>
      </div>
    </main>
  )
}
