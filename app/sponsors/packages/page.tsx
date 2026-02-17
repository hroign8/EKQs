'use client'

import {
  Crown,
  Gem,
  Trophy,
  Shield,
  Sparkles,
  CircleCheck,
  Mail,
  ArrowLeft,
  Award,
  Gift,
  Handshake,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'

interface SponsorshipTier {
  tier: string
  subtitle?: string
  price: string
  icon: LucideIcon
  popular?: boolean
  exclusive?: boolean
  benefits: string[]
  highlights: string[]
  bestFor?: string
}

const sponsorshipTiers: SponsorshipTier[] = [
  {
    tier: 'Platinum',
    subtitle: 'Main Event Partner & Naming Rights Holder',
    price: 'UGX 10,000,000',
    icon: Gem,
    exclusive: true,
    benefits: [
      'Exclusive "Presented By" naming rights (Eritrean Kings & Queens presented by [Sponsor])',
      'Largest logo placement on all materials',
      'Prime stage and backdrop branding',
      'Logo on contestants\' sashes or crowns, segment branding',
      'Opening and closing ceremony brand mentions',
      'Keynote speaking opportunity at the finale',
      'Lead brand integration in all media campaigns',
      'Full digital campaign co-branding',
      'Featured in press releases and interviews',
      'A dedicated sponsor video played at the event',
      'VIP hospitality package',
      'Judges\' panel representation',
      'Category award naming rights (1 major award)',
      'Social media campaign partnership series',
      'Post-event impact report',
    ],
    highlights: ['Exclusive Position', 'Naming Rights', 'Maximum Visibility'],
    bestFor: 'Telecoms, banks, national brands, large corporates',
  },
  {
    tier: 'Gold',
    subtitle: 'Strategic Partner',
    price: 'UGX 5,000,000',
    icon: Trophy,
    popular: true,
    benefits: [
      'Major logo placement across campaign materials',
      'Stage branding (secondary tier)',
      'Brand presence on press walls and media backdrops',
      'Sponsored segment during the event program',
      'Award category naming rights (1 category)',
      'Co-branded social media campaigns',
      'Brand mentions by MC during the event',
      'Product placement opportunities',
      'Press and media mentions',
      'VIP guest access package',
      'Booth or activation space at the venue',
      'Inclusion in digital promotions',
      'Post-event sponsor report',
    ],
    highlights: ['Strategic Partner', 'High Visibility', 'VIP Experience'],
    bestFor: 'Financial institutions, consumer brands, large retailers',
  },
  {
    tier: 'Silver',
    subtitle: 'Official Partner',
    price: 'UGX 3,000,000',
    icon: Shield,
    benefits: [
      'Logo placement on selected materials',
      'Backdrop and media wall inclusion',
      'Social media sponsor mentions',
      'On-screen logo during event broadcast',
      'Brand mention during the program',
      'Product/service inclusion in contestant kits',
      'Exhibition or display space at the venue',
      'Event tickets and VIP passes',
      'Inclusion in sponsor thank-you campaigns',
    ],
    highlights: ['Official Partner', 'Brand Recognition', 'Event Access'],
    bestFor: 'Mid-size brands, fashion, beauty, lifestyle companies',
  },
  {
    tier: 'Bronze',
    subtitle: 'Supporting Partner',
    price: 'UGX 1,800,000',
    icon: Sparkles,
    benefits: [
      'Logo on sponsor board',
      'Website sponsor listing',
      'Social media acknowledgment posts',
      'Event program listing',
      'Product inclusion opportunity',
      'Standard event tickets',
      'Group recognition during the event',
    ],
    highlights: ['Supporting Partner', 'Community Support', 'Event Access'],
    bestFor: 'SMEs, local brands, service providers',
  },
]

function TierCard({ tier }: { tier: SponsorshipTier }) {
  const TierIcon = tier.icon
  const isPopular = tier.popular

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border ${
        isPopular ? 'border-gold-500' : 'border-gray-100'
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 bg-gold-500 text-burgundy-900 text-center text-xs font-bold uppercase tracking-wider py-1.5">
          Most Popular
        </div>
      )}

      <div
        className={`p-5 sm:p-8 h-full ${
          isPopular ? 'bg-burgundy-900 pt-12' : 'bg-white'
        }`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-offset-2 ${
              isPopular
                ? 'bg-gold-500 ring-gold-500 ring-offset-burgundy-900'
                : 'bg-burgundy-900 ring-burgundy-200 ring-offset-white'
            }`}
          >
            <TierIcon
              className={`w-5 h-5 ${
                isPopular ? 'text-burgundy-900' : 'text-gold-500'
              }`}
            />
          </div>
          <div>
            <h3
              className={`text-xl font-bold ${
                isPopular ? 'text-white' : 'text-burgundy-900'
              }`}
            >
              {tier.tier}
            </h3>
            {tier.subtitle && (
              <p
                className={`text-xs ${
                  isPopular ? 'text-burgundy-300' : 'text-gray-400'
                }`}
              >
                {tier.subtitle}
              </p>
            )}
          </div>
        </div>

        <p
          className={`text-2xl font-bold mb-4 ${
            isPopular ? 'text-gold-500' : 'text-burgundy-900'
          }`}
        >
          {tier.price}
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tier.highlights.map((h) => (
            <span
              key={h}
              className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
                isPopular
                  ? 'bg-gold-500/15 text-gold-500'
                  : 'bg-burgundy-50 text-burgundy-900'
              }`}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Benefits */}
        <ul className="space-y-3">
          {tier.benefits.map((b, i) => (
            <li
              key={i}
              className={`flex items-start gap-3 text-sm ${
                isPopular ? 'text-burgundy-200' : 'text-gray-600'
              }`}
            >
              <CircleCheck
                className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-500"
              />
              {b}
            </li>
          ))}
        </ul>

        {/* Best for */}
        {tier.bestFor && (
          <p
            className={`text-xs mt-6 pt-4 border-t ${
              isPopular
                ? 'text-burgundy-400 border-burgundy-800'
                : 'text-gray-400 border-gray-100'
            }`}
          >
            <span className={isPopular ? 'font-semibold text-burgundy-300' : 'font-semibold text-gray-500'}>
              Best for:
            </span>{' '}
            {tier.bestFor}
          </p>
        )}

        {/* CTA */}
        <div className="mt-6">
          <Link
            href="/contact"
            className={`block w-full text-center py-3 rounded-full font-bold transition-colors ${
              isPopular
                ? 'bg-gold-500 text-burgundy-900 hover:bg-gold-400'
                : 'bg-burgundy-900 text-white hover:bg-burgundy-800'
            }`}
          >
            Become a {tier.tier} Sponsor
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PackagesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-burgundy-900 py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <Link
            href="/sponsors"
            className="inline-flex items-center gap-2 text-burgundy-300 hover:text-white transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sponsors
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gold-500"></div>
              <Crown className="w-6 h-6 text-gold-500" />
              <div className="h-px w-12 bg-gold-500"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
              Sponsorship <span className="text-gold-500">Packages</span>
            </h1>
            <p className="text-burgundy-200 text-base sm:text-lg max-w-xl mx-auto">
              Choose a sponsorship tier that aligns with your brand and goals
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Packages Grid */}
          <div className="grid sm:grid-cols-2 gap-5">
            {sponsorshipTiers.map((tier) => (
              <TierCard key={tier.tier} tier={tier} />
            ))}
          </div>

          {/* What Every Sponsor Gets */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-6">
              What Every Sponsor Gets
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Brand association with a cultural event',
                'Access to the Eritrean diaspora community',
                'Event-day branding opportunities',
                'Digital & social media exposure',
                'Networking with community leaders',
                'Post-event thank-you & recognition',
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm text-gray-600"
                >
                  <CircleCheck
                    className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-500"
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Category Sponsor Options */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-burgundy-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-burgundy-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-burgundy-900">
                  Category Sponsor Options
                </h2>
                <p className="text-sm text-gray-500">
                  Sponsors can own a specific title or segment
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                'Best Cultural Ambassador Award',
                'Leadership Excellence Award',
                'Audience Choice Award',
                'Community Impact Award',
                'Best Talent Showcase',
                'Best Public Speaker',
                'Best Traditional Wear',
              ].map((category, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-burgundy-50 rounded-xl p-4"
                >
                  <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-burgundy-900">
                    {category}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Includes
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Award named after the sponsor',
                  'On-stage award presentation',
                  'Brand mention during the segment',
                  'Logo on award graphics',
                  'Segment branding in media clips',
                ].map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <CircleCheck
                      className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-500"
                    />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* In-Kind Partners */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-burgundy-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-burgundy-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-burgundy-900">
                  In-Kind Partners
                </h2>
                <p className="text-sm text-gray-500">
                  For non-cash partners
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                'Fashion designers',
                'Hotels & hospitality',
                'Beauty & grooming brands',
                'Transport providers',
                'Media production companies',
                'Photography & video teams',
              ].map((partner, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-burgundy-50 rounded-xl p-4"
                >
                  <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Handshake className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-burgundy-900">
                    {partner}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Benefits
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Partner recognition status',
                  'Logo placement (in-kind tier)',
                  'Media mentions',
                  'Backdrop inclusion',
                  'Social media features',
                  'Service credit acknowledgment',
                ].map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <CircleCheck
                      className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-500"
                    />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-burgundy-900 rounded-2xl p-5 sm:p-8 text-center">
            <Crown className="w-10 h-10 text-gold-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to Make an Impact?
            </h2>
            <p className="text-burgundy-200 mb-6 max-w-md mx-auto">
              Join our family of sponsors and help celebrate Eritrean culture,
              talent, and community.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-block bg-gold-500 text-burgundy-900 px-8 py-3 rounded-full font-bold hover:bg-gold-400 transition-colors"
              >
                Get in Touch
              </Link>
              <a
                href="mailto:info@ekqs.com?subject=Sponsorship%20Inquiry"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>

    </main>
  )
}
