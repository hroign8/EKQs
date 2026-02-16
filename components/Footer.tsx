'use client'

import { Crown, Instagram, Facebook, Twitter, Mail, Send, Loader2, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubscribe = async () => {
    if (!email.trim()) return

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong')
        return
      }

      setStatus('success')
      setMessage('Subscribed successfully!')
      setEmail('')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 4000)
    } catch {
      setStatus('error')
      setMessage('Something went wrong')
    }
  }

  return (
    <footer className="bg-burgundy-900 text-white">
      <div className="container mx-auto px-4 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Crown className="w-6 h-6 text-gold-500" />
              <span className="text-xl font-bold">
                Eritrean <span className="text-gold-500">Kings & Queens</span>
              </span>
            </div>
            <p className="text-burgundy-200 text-sm mb-6">
              Celebrating excellence, heritage, and beauty. Join us in crowning the next generation of leaders.
            </p>
            <div className="flex space-x-4">
              <a href="#" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full border border-burgundy-700 flex items-center justify-center text-burgundy-200 hover:text-gold-500 hover:border-gold-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full border border-burgundy-700 flex items-center justify-center text-burgundy-200 hover:text-gold-500 hover:border-gold-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" rel="noopener noreferrer" aria-label="Twitter" className="w-10 h-10 rounded-full border border-burgundy-700 flex items-center justify-center text-burgundy-200 hover:text-gold-500 hover:border-gold-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" rel="noopener noreferrer" aria-label="Email" className="w-10 h-10 rounded-full border border-burgundy-700 flex items-center justify-center text-burgundy-200 hover:text-gold-500 hover:border-gold-500 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-burgundy-200 hover:text-gold-500 transition-colors">Vote</Link></li>
              <li><Link href="/results" className="text-burgundy-200 hover:text-gold-500 transition-colors">Standings</Link></li>
              {/* <li><Link href="/qr-code" className="text-burgundy-200 hover:text-gold-500 transition-colors">QR Code</Link></li> */}
              <li><Link href="/sponsors" className="text-burgundy-200 hover:text-gold-500 transition-colors">Sponsors</Link></li>
              <li><Link href="/faqs" className="text-burgundy-200 hover:text-gold-500 transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-burgundy-200">
              <li>21a UK Mall, Kansanga</li>
              <li>info@ekqs.com</li>
              <li>+256-700123456</li>
              <li>Kampala, Uganda</li>
            </ul>
          </div>

          {/* Stay Updated */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-burgundy-200 text-sm mb-4">
              Subscribe for event updates.
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                disabled={status === 'loading'}
                className="flex-1 min-w-0 px-4 py-2 bg-burgundy-800 border border-burgundy-700 rounded-full text-white placeholder-burgundy-300 focus:border-gold-500 outline-none transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleSubscribe}
                disabled={status === 'loading' || !email.trim()}
                className="w-10 h-10 bg-gold-500 text-burgundy-900 rounded-full flex items-center justify-center hover:bg-gold-400 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : status === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            {message && (
              <p className={`text-xs mt-2 ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                {message}
              </p>
            )}
            <p className="text-xs text-burgundy-300 mt-2">We respect your privacy.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-burgundy-800">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-burgundy-300 text-sm text-center sm:text-left">
          <p>© {new Date().getFullYear()} Eritrean Kings & Queens. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-gold-500 transition-colors">Privacy Policy</Link>
            <span className="text-burgundy-700">|</span>
            <Link href="/terms-of-service" className="hover:text-gold-500 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
