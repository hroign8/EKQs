import type { Metadata } from 'next'
import { Shield, Eye, Database, Cookie, UserCheck, Globe, Mail } from 'lucide-react'
import Link from 'next/link'
import PageHero from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Privacy Policy | Eritrean Kings & Queens',
  description: 'Read our Privacy Policy to understand how we collect, use, and protect your personal data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero title="Privacy Policy" subtitle="How we collect, use, and protect your information" />

      {/* Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Last Updated */}
          <div className="text-center">
            <span className="inline-block bg-burgundy-100 text-burgundy-900 text-sm font-medium px-4 py-1.5 rounded-full">
              Last updated: February 13, 2026
            </span>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <p className="text-gray-600 leading-relaxed">
              Eritrean Kings &amp; Queens (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services, including voting, purchasing tickets, and creating an account. Please read this policy carefully. By using our platform, you consent to the practices described herein.
            </p>
          </div>

          {/* Section 1 - Information We Collect */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">1. Information We Collect</h2>
            </div>
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-burgundy-900 mb-2">Personal Information</h3>
                <p className="text-gray-600 mb-2">When you register for an account, purchase tickets, or cast votes, we may collect:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-500 text-sm">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number (if provided)</li>
                  <li>Payment information (processed securely through PesaPal)</li>
                  <li>Account credentials (passwords are encrypted and never stored in plain text)</li>
                  <li>Profile information linked to Google OAuth (if you sign in with Google)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-burgundy-900 mb-2">Automatically Collected Information</h3>
                <p className="text-gray-600 mb-2">When you access our platform, we may automatically collect:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-500 text-sm">
                  <li>IP address and approximate location</li>
                  <li>Browser type and version</li>
                  <li>Device type and operating system</li>
                  <li>Pages visited and time spent on our platform</li>
                  <li>Referring website addresses</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-burgundy-900 mb-2">Voting Data</h3>
                <p className="text-gray-600">When you vote for contestants, we record your vote selections, timestamps, and associated payment transactions to ensure the integrity and transparency of the voting process.</p>
              </div>
            </div>
          </div>

          {/* Section 2 - How We Use Your Information */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">2. How We Use Your Information</h2>
            </div>
            <p className="text-gray-600 mb-3">We use the collected information to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm">
              <li>Create and manage your account</li>
              <li>Process votes and display aggregated results</li>
              <li>Process ticket purchases and payments via PesaPal</li>
              <li>Send transactional emails (e.g., vote confirmations, ticket receipts, password resets)</li>
              <li>Send newsletters and event updates (only if you opt in)</li>
              <li>Prevent fraudulent voting and maintain platform integrity</li>
              <li>Improve our website, services, and user experience</li>
              <li>Comply with legal obligations</li>
              <li>Respond to your inquiries and support requests</li>
            </ul>
          </div>

          {/* Section 3 - Information Sharing */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">3. Information Sharing &amp; Disclosure</h2>
            </div>
            <p className="text-gray-600 mb-4">We do not sell your personal information. We may share your information with:</p>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Payment Processors:</strong> We use PesaPal to process payments. Your payment data is handled directly by PesaPal under their own privacy policy. We do not store your full credit card or mobile money details.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Email Service Providers:</strong> We use Resend for transactional emails. Only your email address and name are shared for the purpose of delivering communications.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Authentication Providers:</strong> If you sign in with Google, certain profile data is shared per Google&apos;s OAuth protocols.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Legal Requirements:</strong> We may disclose information if required by law, regulation, or legal process.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Event Partners:</strong> Aggregated, non-identifiable voting statistics may be shared with event sponsors and partners.</p>
              </div>
            </div>
          </div>

          {/* Section 4 - Data Security */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">4. Data Security</h2>
            </div>
            <p className="text-gray-600 mb-3">We implement appropriate technical and organizational measures to protect your data, including:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm mb-4">
              <li>Encrypted password storage using industry-standard hashing</li>
              <li>HTTPS encryption for all data in transit</li>
              <li>Secure database access controls</li>
              <li>Regular security reviews and updates</li>
            </ul>
            <p className="text-gray-500 text-sm">However, no method of electronic transmission or storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee absolute security.</p>
          </div>

          {/* Section 5 - Cookies */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">5. Cookies &amp; Tracking</h2>
            </div>
            <p className="text-gray-600 mb-3">We use cookies and similar technologies to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm mb-4">
              <li>Keep you signed in to your account</li>
              <li>Remember your preferences</li>
              <li>Understand how you interact with our platform</li>
              <li>Prevent fraud and ensure voting integrity</li>
            </ul>
            <p className="text-gray-500 text-sm">You can control cookies through your browser settings. Disabling cookies may affect certain features of our platform, such as staying signed in.</p>
          </div>

          {/* Section 6 - Your Rights */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">6. Your Rights</h2>
            </div>
            <p className="text-gray-600 mb-3">You have the right to:</p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Access:</strong> Request a copy of the personal data we hold about you</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Correction:</strong> Request correction of inaccurate or incomplete data</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Deletion:</strong> Request deletion of your account and associated personal data</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Opt-out:</strong> Unsubscribe from marketing emails at any time</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Data Portability:</strong> Request your data in a structured, commonly used format</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-4">To exercise any of these rights, please contact us at the email address provided below.</p>
          </div>

          {/* Sections 7-9 grouped */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-burgundy-900 mb-3">7. Third-Party Links</h2>
              <p className="text-gray-600 text-sm">Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.</p>
            </div>
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-xl font-bold text-burgundy-900 mb-3">8. Children&apos;s Privacy</h2>
              <p className="text-gray-600 text-sm">Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.</p>
            </div>
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-xl font-bold text-burgundy-900 mb-3">9. Changes to This Policy</h2>
              <p className="text-gray-600 text-sm">We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. We encourage you to review this policy periodically. Continued use of our platform after changes constitutes acceptance of the updated policy.</p>
            </div>
          </div>

          {/* Section 10 - Contact */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">10. Contact Us</h2>
            </div>
            <p className="text-gray-600 mb-4">If you have any questions or concerns about this Privacy Policy, please contact us:</p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600"><strong className="text-burgundy-900">Email:</strong> info@eritreankingsqueens.com</p>
              <p className="text-gray-600"><strong className="text-burgundy-900">Website:</strong> <Link href="/contact" className="text-gold-500 hover:text-gold-600 transition-colors">Contact Page</Link></p>
            </div>
          </div>

          {/* Related Link */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 text-center">
            <p className="text-gray-500 mb-4">Please also review our</p>
            <Link
              href="/terms-of-service"
              className="inline-block bg-gold-500 text-burgundy-900 px-8 py-3 rounded-full font-semibold hover:bg-gold-400 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
