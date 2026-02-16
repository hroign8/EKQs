'use client'

import { Crown, Scale, AlertTriangle, CreditCard, Users, ShieldCheck, Gavel, Mail } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-burgundy-900 py-8 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gold-500"></div>
            <Crown className="w-6 h-6 text-gold-500" />
            <div className="h-px w-12 bg-gold-500"></div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Terms of Service
          </h1>
          <p className="text-burgundy-200 text-base sm:text-lg max-w-xl mx-auto">
            Rules and guidelines for using our platform
          </p>
        </div>
      </div>

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
              Welcome to Eritrean Kings &amp; Queens. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website, services, and platform, including voting, ticket purchasing, and account creation. By accessing or using our platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
            </p>
          </div>

          {/* Section 1 - Acceptance */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Scale className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">1. Acceptance of Terms</h2>
            </div>
            <p className="text-gray-600 text-sm mb-3">By creating an account, casting a vote, purchasing a ticket, or otherwise using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and our <Link href="/privacy-policy" className="text-gold-500 hover:text-gold-600 transition-colors underline">Privacy Policy</Link>.</p>
            <p className="text-gray-600 text-sm">You must be at least 13 years of age to use this platform. If you are under 18, you represent that you have your parent or guardian&apos;s consent to use our services.</p>
          </div>

          {/* Section 2 - User Accounts */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">2. User Accounts</h2>
            </div>
            <p className="text-gray-600 text-sm mb-3">To access certain features such as voting and ticket purchasing, you must create an account. When creating an account, you agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm mb-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password and account credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
            </ul>
            <p className="text-gray-600 text-sm">You may sign in using your email and password or through Google OAuth. We reserve the right to suspend or terminate accounts that violate these Terms or engage in suspicious activity.</p>
          </div>

          {/* Section 3 - Voting Rules */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">3. Voting Rules &amp; Guidelines</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">Voting is a core feature of the Eritrean Kings &amp; Queens platform. By participating in voting, you agree to the following:</p>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">One Vote Per Category:</strong> Each registered user may cast one vote per voting category per contestant. Additional votes may be available through paid voting packages.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Paid Votes:</strong> Certain voting packages require payment, processed securely through PesaPal. Paid votes are non-refundable once successfully processed and counted.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Fair Voting:</strong> Any attempt to manipulate voting results through automated bots, fake accounts, or other fraudulent means is strictly prohibited and will result in account termination and vote invalidation.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Vote Counting:</strong> All votes are recorded with timestamps and are final once processed. We maintain the right to audit and verify votes to ensure fairness.</p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm"><strong className="text-burgundy-900">Results:</strong> Voting results are aggregated and displayed on the platform. Individual vote records are kept confidential.</p>
              </div>
            </div>
          </div>

          {/* Section 4 - Payments */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">4. Payments &amp; Ticketing</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-burgundy-900 mb-2">Ticket Purchases</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm">
                  <li>All ticket purchases are processed through PesaPal, our authorized payment gateway</li>
                  <li>Ticket prices are displayed in the applicable currency at the time of purchase</li>
                  <li>Upon successful payment, you will receive a confirmation email with your ticket details</li>
                  <li>Tickets are non-transferable unless otherwise stated</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-burgundy-900 mb-2">Refund Policy</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm">
                  <li>Ticket refunds may be requested up to 48 hours before the event date</li>
                  <li>Paid votes are non-refundable once processed and counted</li>
                  <li>Refund requests should be submitted through our <Link href="/contact" className="text-gold-500 hover:text-gold-600 transition-colors underline">Contact Page</Link></li>
                  <li>Approved refunds will be processed within 7–14 business days via the original payment method</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-burgundy-900 mb-2">Payment Security</h3>
                <p className="text-gray-500 text-sm">We do not store your payment card details or mobile money information. All payment processing is handled securely by PesaPal in compliance with applicable security standards.</p>
              </div>
            </div>
          </div>

          {/* Section 5 - Prohibited Conduct */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">5. Prohibited Conduct</h2>
            </div>
            <p className="text-gray-600 text-sm mb-3">You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm mb-4">
              <li>Use automated scripts, bots, or similar tools to interact with the platform</li>
              <li>Create multiple accounts to gain unfair voting advantages</li>
              <li>Attempt to hack, disrupt, or interfere with the platform&apos;s operations</li>
              <li>Impersonate another person or entity</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Harass, bully, or defame contestants, organizers, or other users</li>
              <li>Use the platform for any unlawful purpose</li>
              <li>Scrape, crawl, or harvest data from our platform without authorization</li>
              <li>Circumvent any access restrictions or security measures</li>
            </ul>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-red-700 text-sm font-medium">Violations may result in immediate account suspension or termination without prior notice.</p>
            </div>
          </div>

          {/* Sections 6-7 grouped */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-burgundy-900 mb-3">6. Intellectual Property</h2>
              <p className="text-gray-600 text-sm mb-3">All content on this platform — including but not limited to logos, designs, text, images, videos, and software — is the property of Eritrean Kings &amp; Queens or its licensors and is protected by intellectual property laws.</p>
              <p className="text-gray-600 text-sm">You may not reproduce, distribute, modify, or create derivative works from our content without prior written consent. Contestant photos and media are used with permission and remain the property of their respective owners.</p>
            </div>
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-xl font-bold text-burgundy-900 mb-3">7. User-Generated Content</h2>
              <p className="text-gray-600 text-sm mb-3">If you submit content to our platform (e.g., comments, photos, or contact form messages), you grant us a non-exclusive, royalty-free, worldwide license to use, display, and distribute that content in connection with our services.</p>
              <p className="text-gray-600 text-sm">You represent that you own or have the necessary rights to any content you submit and that it does not infringe on any third party&apos;s rights.</p>
            </div>
          </div>

          {/* Section 8 - Disclaimer */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">8. Disclaimer of Warranties</h2>
            </div>
            <p className="text-gray-600 text-sm mb-3">Our platform is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no warranties, express or implied, regarding:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm mb-4">
              <li>The accuracy, completeness, or timeliness of content</li>
              <li>Uninterrupted or error-free access to the platform</li>
              <li>The security of data transmitted through the platform</li>
              <li>The results of any voting or contest outcomes</li>
            </ul>
            <p className="text-gray-500 text-sm">We disclaim all warranties to the fullest extent permitted by law.</p>
          </div>

          {/* Sections 9-11 grouped */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-burgundy-900 mb-3">9. Limitation of Liability</h2>
              <p className="text-gray-600 text-sm">To the maximum extent permitted by law, Eritrean Kings &amp; Queens shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, including but not limited to loss of data, loss of profits, or any payment-related issues processed through PesaPal. Our total liability shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.</p>
            </div>
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-xl font-bold text-burgundy-900 mb-3">10. Indemnification</h2>
              <p className="text-gray-600 text-sm">You agree to indemnify and hold harmless Eritrean Kings &amp; Queens, its organizers, partners, and affiliates from any claims, damages, losses, or expenses (including legal fees) arising from your use of the platform, violation of these Terms, or infringement of any third party&apos;s rights.</p>
            </div>
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-xl font-bold text-burgundy-900 mb-3">11. Event Cancellation &amp; Modifications</h2>
              <p className="text-gray-600 text-sm mb-3">We reserve the right to modify, postpone, or cancel events at our discretion. In the event of cancellation:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm">
                <li>Ticket holders will be notified via email</li>
                <li>Full refunds will be issued for cancelled events</li>
                <li>Partial refunds may be offered for rescheduled events if you cannot attend the new date</li>
                <li>Voting results up to the point of cancellation remain valid</li>
              </ul>
            </div>
          </div>

          {/* Section 12 - Governing Law */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Gavel className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">12. Governing Law &amp; Disputes</h2>
            </div>
            <p className="text-gray-600 text-sm">These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of the platform shall be resolved through good-faith negotiation first. If a resolution cannot be reached, disputes shall be submitted to binding arbitration or the appropriate courts in the jurisdiction where Eritrean Kings &amp; Queens operates.</p>
          </div>

          {/* Sections 13-14 grouped */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-burgundy-900 mb-3">13. Changes to These Terms</h2>
              <p className="text-gray-600 text-sm">We reserve the right to update or modify these Terms at any time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. Your continued use of our platform after changes are posted constitutes acceptance of the revised Terms. We encourage you to review these Terms periodically.</p>
            </div>
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-xl font-bold text-burgundy-900 mb-3">14. Severability</h2>
              <p className="text-gray-600 text-sm">If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
            </div>
          </div>

          {/* Section 15 - Contact */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-burgundy-900" />
              </div>
              <h2 className="text-xl font-bold text-burgundy-900">15. Contact Us</h2>
            </div>
            <p className="text-gray-600 mb-4">If you have any questions about these Terms of Service, please contact us:</p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600"><strong className="text-burgundy-900">Email:</strong> info@eritreankingsqueens.com</p>
              <p className="text-gray-600"><strong className="text-burgundy-900">Website:</strong> <Link href="/contact" className="text-gold-500 hover:text-gold-600 transition-colors">Contact Page</Link></p>
            </div>
          </div>

          {/* Related Link */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 text-center">
            <p className="text-gray-500 mb-4">Please also review our</p>
            <Link
              href="/privacy-policy"
              className="inline-block bg-gold-500 text-burgundy-900 px-8 py-3 rounded-full font-semibold hover:bg-gold-400 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
