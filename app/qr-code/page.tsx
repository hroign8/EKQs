'use client'

import { QrCode, Smartphone, ScanLine, CheckCircle, Download, Copy } from 'lucide-react'
import PageHero from '@/components/PageHero'
import { useState, useEffect } from 'react'

export default function QRCodePage() {
  const [copied, setCopied] = useState(false)
  const [votingUrl, setVotingUrl] = useState('https://eritreankingsqueens.com')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVotingUrl(window.location.origin)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(votingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for insecure contexts
      const textArea = document.createElement('textarea')
      textArea.value = votingUrl
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Copy failed silently
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero title="QR Code Voting" subtitle="Scan with your phone to access the voting page instantly" />

      <div className="container mx-auto px-4 py-10 sm:py-16">
        {/* QR Code Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 sm:p-8 text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-burgundy-900 mb-2">Eritrean Kings & Queens</h2>
            <p className="text-gray-600 mb-6 sm:mb-8">Vote for your favorite contestant</p>

            {/* QR Code SVG */}
            <div className="inline-block bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
              <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-64 sm:h-64 mx-auto" xmlns="http://www.w3.org/2000/svg">
                {/* QR code pattern */}
                <rect fill="white" width="200" height="200" />
                {/* Top-left position detector */}
                <rect fill="black" x="10" y="10" width="50" height="50" />
                <rect fill="white" x="15" y="15" width="40" height="40" />
                <rect fill="black" x="20" y="20" width="30" height="30" />
                {/* Top-right position detector */}
                <rect fill="black" x="140" y="10" width="50" height="50" />
                <rect fill="white" x="145" y="15" width="40" height="40" />
                <rect fill="black" x="150" y="20" width="30" height="30" />
                {/* Bottom-left position detector */}
                <rect fill="black" x="10" y="140" width="50" height="50" />
                <rect fill="white" x="15" y="145" width="40" height="40" />
                <rect fill="black" x="20" y="150" width="30" height="30" />
                {/* Data modules - row 1 */}
                <rect fill="black" x="70" y="10" width="5" height="5" />
                <rect fill="black" x="80" y="10" width="5" height="5" />
                <rect fill="black" x="90" y="10" width="10" height="5" />
                <rect fill="black" x="110" y="10" width="10" height="5" />
                <rect fill="black" x="130" y="10" width="5" height="5" />
                {/* Data modules - row 2 */}
                <rect fill="black" x="70" y="20" width="10" height="5" />
                <rect fill="black" x="90" y="20" width="5" height="5" />
                <rect fill="black" x="100" y="20" width="10" height="5" />
                <rect fill="black" x="120" y="20" width="10" height="5" />
                {/* Data modules - row 3 */}
                <rect fill="black" x="70" y="30" width="5" height="5" />
                <rect fill="black" x="85" y="30" width="10" height="5" />
                <rect fill="black" x="100" y="30" width="5" height="5" />
                <rect fill="black" x="115" y="30" width="15" height="5" />
                {/* Data modules - rows 4-8 */}
                <rect fill="black" x="70" y="40" width="15" height="5" />
                <rect fill="black" x="95" y="40" width="5" height="5" />
                <rect fill="black" x="110" y="40" width="10" height="5" />
                <rect fill="black" x="70" y="50" width="5" height="5" />
                <rect fill="black" x="80" y="50" width="10" height="5" />
                <rect fill="black" x="100" y="50" width="15" height="5" />
                <rect fill="black" x="125" y="50" width="5" height="5" />
                {/* Middle section data */}
                <rect fill="black" x="10" y="70" width="5" height="5" />
                <rect fill="black" x="20" y="70" width="10" height="5" />
                <rect fill="black" x="40" y="70" width="15" height="5" />
                <rect fill="black" x="60" y="70" width="5" height="5" />
                <rect fill="black" x="75" y="70" width="10" height="5" />
                <rect fill="black" x="95" y="70" width="5" height="5" />
                <rect fill="black" x="110" y="70" width="10" height="5" />
                <rect fill="black" x="130" y="70" width="5" height="5" />
                <rect fill="black" x="145" y="70" width="10" height="5" />
                <rect fill="black" x="165" y="70" width="15" height="5" />
                <rect fill="black" x="185" y="70" width="5" height="5" />
                {/* More rows */}
                <rect fill="black" x="10" y="80" width="10" height="5" />
                <rect fill="black" x="30" y="80" width="5" height="5" />
                <rect fill="black" x="50" y="80" width="10" height="5" />
                <rect fill="black" x="70" y="80" width="5" height="5" />
                <rect fill="black" x="85" y="80" width="10" height="5" />
                <rect fill="black" x="100" y="80" width="5" height="5" />
                <rect fill="black" x="115" y="80" width="15" height="5" />
                <rect fill="black" x="140" y="80" width="5" height="5" />
                <rect fill="black" x="155" y="80" width="10" height="5" />
                <rect fill="black" x="175" y="80" width="15" height="5" />
                {/* Row 9-12 */}
                <rect fill="black" x="15" y="90" width="10" height="5" />
                <rect fill="black" x="35" y="90" width="5" height="5" />
                <rect fill="black" x="50" y="90" width="10" height="5" />
                <rect fill="black" x="70" y="90" width="15" height="5" />
                <rect fill="black" x="95" y="90" width="5" height="5" />
                <rect fill="black" x="110" y="90" width="10" height="5" />
                <rect fill="black" x="130" y="90" width="5" height="5" />
                <rect fill="black" x="150" y="90" width="15" height="5" />
                <rect fill="black" x="180" y="90" width="10" height="5" />
                {/* More rows */}
                <rect fill="black" x="10" y="100" width="5" height="5" />
                <rect fill="black" x="25" y="100" width="10" height="5" />
                <rect fill="black" x="45" y="100" width="5" height="5" />
                <rect fill="black" x="60" y="100" width="10" height="5" />
                <rect fill="black" x="80" y="100" width="5" height="5" />
                <rect fill="black" x="95" y="100" width="10" height="5" />
                <rect fill="black" x="115" y="100" width="5" height="5" />
                <rect fill="black" x="130" y="100" width="10" height="5" />
                <rect fill="black" x="150" y="100" width="5" height="5" />
                <rect fill="black" x="170" y="100" width="10" height="5" />
                {/* Rows 13-16 */}
                <rect fill="black" x="20" y="110" width="10" height="5" />
                <rect fill="black" x="40" y="110" width="5" height="5" />
                <rect fill="black" x="55" y="110" width="10" height="5" />
                <rect fill="black" x="75" y="110" width="5" height="5" />
                <rect fill="black" x="90" y="110" width="10" height="5" />
                <rect fill="black" x="110" y="110" width="5" height="5" />
                <rect fill="black" x="125" y="110" width="15" height="5" />
                <rect fill="black" x="150" y="110" width="5" height="5" />
                <rect fill="black" x="165" y="110" width="10" height="5" />
                <rect fill="black" x="185" y="110" width="5" height="5" />
                {/* More data rows */}
                <rect fill="black" x="15" y="120" width="5" height="5" />
                <rect fill="black" x="30" y="120" width="10" height="5" />
                <rect fill="black" x="50" y="120" width="5" height="5" />
                <rect fill="black" x="65" y="120" width="10" height="5" />
                <rect fill="black" x="85" y="120" width="5" height="5" />
                <rect fill="black" x="100" y="120" width="10" height="5" />
                <rect fill="black" x="120" y="120" width="5" height="5" />
                <rect fill="black" x="140" y="120" width="10" height="5" />
                <rect fill="black" x="160" y="120" width="5" height="5" />
                <rect fill="black" x="175" y="120" width="15" height="5" />
                {/* Bottom right data */}
                <rect fill="black" x="70" y="140" width="10" height="5" />
                <rect fill="black" x="90" y="140" width="5" height="5" />
                <rect fill="black" x="105" y="140" width="10" height="5" />
                <rect fill="black" x="125" y="140" width="5" height="5" />
                <rect fill="black" x="140" y="140" width="15" height="5" />
                <rect fill="black" x="165" y="140" width="5" height="5" />
                <rect fill="black" x="180" y="140" width="10" height="5" />
                <rect fill="black" x="70" y="150" width="5" height="5" />
                <rect fill="black" x="85" y="150" width="10" height="5" />
                <rect fill="black" x="105" y="150" width="5" height="5" />
                <rect fill="black" x="120" y="150" width="15" height="5" />
                <rect fill="black" x="145" y="150" width="5" height="5" />
                <rect fill="black" x="160" y="150" width="10" height="5" />
                <rect fill="black" x="180" y="150" width="10" height="5" />
                <rect fill="black" x="70" y="160" width="15" height="5" />
                <rect fill="black" x="95" y="160" width="5" height="5" />
                <rect fill="black" x="110" y="160" width="10" height="5" />
                <rect fill="black" x="130" y="160" width="5" height="5" />
                <rect fill="black" x="150" y="160" width="10" height="5" />
                <rect fill="black" x="170" y="160" width="5" height="5" />
                <rect fill="black" x="185" y="160" width="5" height="5" />
                <rect fill="black" x="70" y="170" width="5" height="5" />
                <rect fill="black" x="80" y="170" width="10" height="5" />
                <rect fill="black" x="100" y="170" width="5" height="5" />
                <rect fill="black" x="115" y="170" width="15" height="5" />
                <rect fill="black" x="140" y="170" width="5" height="5" />
                <rect fill="black" x="155" y="170" width="10" height="5" />
                <rect fill="black" x="175" y="170" width="15" height="5" />
                <rect fill="black" x="70" y="180" width="10" height="5" />
                <rect fill="black" x="90" y="180" width="5" height="5" />
                <rect fill="black" x="105" y="180" width="10" height="5" />
                <rect fill="black" x="125" y="180" width="5" height="5" />
                <rect fill="black" x="145" y="180" width="15" height="5" />
                <rect fill="black" x="170" y="180" width="5" height="5" />
                <rect fill="black" x="185" y="180" width="5" height="5" />
              </svg>
            </div>
          </div>

          {/* URL & Copy */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 flex items-center space-x-4 mb-8">
            <div className="flex-1 bg-gray-50 px-4 py-3 rounded-full font-mono text-sm text-gray-700 truncate">
              {votingUrl}
            </div>
            <button
              onClick={handleCopy}
              className="p-3 text-gray-500 hover:text-gold-500 transition-colors"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button className="bg-gold-500 text-burgundy-900 px-6 py-3 rounded-full font-semibold hover:bg-gold-400 transition-colors">
              Download QR Code
            </button>
            <button
              onClick={handleCopy}
              className="bg-white text-gray-700 px-6 py-3 rounded-full font-semibold border-2 border-gray-200 hover:border-burgundy-900 hover:text-burgundy-900 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy Voting Link'}
            </button>
          </div>

          {/* How It Works */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="font-bold text-burgundy-900 mb-2 text-lg">1. Scan</h3>
              <p className="text-sm text-gray-600">Open your phone's camera and point it at the QR code</p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ScanLine className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="font-bold text-burgundy-900 mb-2 text-lg">2. Open</h3>
              <p className="text-sm text-gray-600">Tap the notification to open the voting page</p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-gold-500" />
              </div>
              <h3 className="font-bold text-burgundy-900 mb-2 text-lg">3. Vote</h3>
              <p className="text-sm text-gray-600">Verify your email and cast your votes</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
