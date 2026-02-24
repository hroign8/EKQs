"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Check, Clock, Loader2 } from 'lucide-react'
import PageHero from '@/components/PageHero'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ [k: string]: string }>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  function validate() {
    const e: { [k: string]: string } = {}
    if (!name.trim()) e.name = 'Please enter your name.'
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) e.email = 'Please enter a valid email.'
    if (!message.trim() || message.trim().length < 10) e.message = 'Message must be at least 10 characters.'
    return e
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    setApiError('')
    if (Object.keys(e).length === 0) {
      setLoading(true)
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message }),
        })
        if (res.ok) {
          setSubmitted(true)
          setName('')
          setEmail('')
          setSubject('')
          setMessage('')
          setTimeout(() => setSubmitted(false), 5000)
        } else {
          const data = await res.json()
          setApiError(data.error || 'Failed to send message. Please try again.')
        }
      } catch {
        setApiError('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <PageHero title="Contact Us" subtitle="Have questions about the event? We'd love to hear from you" />

      {/* Contact Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-5 sm:p-8">
                <h2 className="text-xl font-bold text-burgundy-900 mb-2">Get in Touch</h2>
                <p className="text-gray-500 text-sm mb-8">
                  Reach out through any of these channels
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-burgundy-50 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-burgundy-900" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-0.5">Email</p>
                      <p className="font-semibold text-burgundy-900">info@ekqs.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-burgundy-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-burgundy-900" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-0.5">Phone</p>
                      <p className="font-semibold text-burgundy-900">+256-708203858</p>
                      <p className="font-semibold text-burgundy-900">+256-756531948</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-burgundy-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-burgundy-900" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-0.5">Location</p>
                      <p className="font-semibold text-burgundy-900">Kampala, Uganda</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-burgundy-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-burgundy-900" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 mb-0.5">Response Time</p>
                      <p className="font-semibold text-burgundy-900">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-5 sm:p-8">
                <h2 className="text-xl font-bold text-burgundy-900 mb-2">Send a Message</h2>
                <p className="text-gray-500 text-sm mb-6">Fill out the form below and we'll get back to you</p>
                
                {submitted ? (
                  <div className="bg-green-50 rounded-2xl p-5 sm:p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-white" strokeWidth={3} />
                    </div>
                    <h3 className="text-xl font-bold text-green-700 mb-2">Message Sent!</h3>
                    <p className="text-green-600">Thank you for reaching out. We'll get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl bg-gray-50 text-burgundy-900 focus:outline-none focus:bg-white transition-all ${
                            errors.name ? 'ring-2 ring-red-400' : ''
                          }`}
                          placeholder="Your name"
                        />
                        {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl bg-gray-50 text-burgundy-900 focus:outline-none focus:bg-white transition-all ${
                            errors.email ? 'ring-2 ring-red-400' : ''
                          }`}
                          placeholder="you@example.com"
                        />
                        {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email}</span>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 text-burgundy-900 focus:outline-none focus:bg-white transition-all"
                        placeholder="What is this regarding?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 text-burgundy-900 focus:outline-none focus:bg-white transition-all resize-none ${
                          errors.message ? 'ring-2 ring-red-400' : ''
                        }`}
                        placeholder="Write your message here..."
                      />
                      {errors.message && <span className="text-xs text-red-500 mt-1 block">{errors.message}</span>}
                    </div>

                    {apiError && (
                      <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
                        {apiError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gold-500 text-burgundy-900 py-4 rounded-full font-semibold hover:bg-gold-400 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 bg-white rounded-2xl p-5 sm:p-8 text-center">
            <h3 className="text-xl font-bold text-burgundy-900 mb-2">Frequently Asked Questions</h3>
            <p className="text-gray-500 mb-6 max-w-xl mx-auto">
              Looking for quick answers? Check out our FAQ section for common questions about voting, tickets, and the event.
            </p>
            <Link href="/faqs" className="inline-block bg-burgundy-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-burgundy-800 transition-colors">
              View FAQs
            </Link>
          </div>
        </div>
      </div>

    </main>
  )
}
