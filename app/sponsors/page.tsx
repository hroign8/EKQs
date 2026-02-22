import {
  Crown,
  Heart,
  Globe,
  Megaphone,
  Mail,
  Building2,
  Wine,
  Plane,
  Shirt,
  Monitor,
  Landmark,
  UtensilsCrossed,
  PartyPopper,
  Tv,
  Users,
  GraduationCap,
  MapPin,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import PageHero from '@/components/PageHero'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sponsors | Eritrean Kings & Queens',
  description: 'Meet the sponsors and partners who make the Eritrean Kings & Queens pageant possible.',
}

interface SponsorItem {
  name: string
  description: string
  icon: LucideIcon
}

const platinumSponsors: SponsorItem[] = [
  { name: 'Asmara Holdings', description: 'Investment and real estate group supporting community development across East Africa.', icon: Building2 },
  { name: 'Red Sea Beverages', description: 'Premium beverage company celebrating Eritrean heritage through quality products.', icon: Wine },
]

const goldSponsors: SponsorItem[] = [
  { name: 'Habesha Airlines', description: 'Connecting the Eritrean diaspora with affordable flights and cultural exchange.', icon: Plane },
  { name: 'Massawa Fashion House', description: 'Luxury fashion blending traditional Eritrean textiles with modern design.', icon: Shirt },
  { name: 'Keren Tech Solutions', description: 'Empowering African businesses through innovative digital solutions.', icon: Monitor },
]

const silverSponsors: SponsorItem[] = [
  { name: 'Adulis Media', description: 'Amplifying Eritrean stories worldwide.', icon: Tv },
  { name: 'Nakfa Financial', description: 'Seamless remittance and banking for the diaspora.', icon: Landmark },
  { name: 'Sembel Catering', description: 'Traditional and fusion Eritrean cuisine.', icon: UtensilsCrossed },
  { name: 'Dahlak Events', description: 'Professional event management in Kampala.', icon: PartyPopper },
]

const partners = [
  { name: 'Eritrean Community Association', type: 'Community', icon: Heart },
  { name: 'UNESCO Cultural Heritage Fund', type: 'Cultural', icon: Globe },
  { name: 'East African Youth Foundation', type: 'Youth', icon: GraduationCap },
  { name: 'Kampala Convention Bureau', type: 'Venue', icon: MapPin },
  { name: 'AfricaMedia Group', type: 'Media', icon: Megaphone },
  { name: 'Diaspora Connect', type: 'Community', icon: Users },
]



function SponsorRow({ sponsor }: { sponsor: SponsorItem }) {
  const Icon = sponsor.icon
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-burgundy-50 rounded-full flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-burgundy-900" />
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-burgundy-900 text-sm">{sponsor.name}</h3>
        <p className="text-gray-500 text-sm mt-0.5">{sponsor.description}</p>
      </div>
    </div>
  )
}

export default function SponsorsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <PageHero title="Sponsors &" highlightedWord="Partners" subtitle="The organizations and individuals making our event possible" />

      <div className="container mx-auto px-4 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">

          {/* All Sponsors — single card */}
          <div className="bg-white rounded-2xl p-6 sm:p-10">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-8">Our Sponsors</h2>

            {/* Platinum */}
            <div className="mb-10">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Platinum</p>
              <div className="grid sm:grid-cols-2 gap-8">
                {platinumSponsors.map((s) => <SponsorRow key={s.name} sponsor={s} />)}
              </div>
            </div>

            <div className="border-t border-gray-100 mb-10"></div>

            {/* Gold */}
            <div className="mb-10">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Gold</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {goldSponsors.map((s) => <SponsorRow key={s.name} sponsor={s} />)}
              </div>
            </div>

            <div className="border-t border-gray-100 mb-10"></div>

            {/* Silver */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Silver</p>
              <div className="grid sm:grid-cols-2 gap-8">
                {silverSponsors.map((s) => <SponsorRow key={s.name} sponsor={s} />)}
              </div>
            </div>
          </div>

          {/* Partners */}
          <div className="bg-white rounded-2xl p-6 sm:p-10">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-8">Our Partners</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {partners.map((partner) => {
                const Icon = partner.icon
                return (
                  <div key={partner.name} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-burgundy-900 text-sm leading-tight">{partner.name}</p>
                      <p className="text-xs text-gray-400">{partner.type} Partner</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Why EKQ Matters */}
          <div className="bg-white rounded-2xl p-6 sm:p-10">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-4">Why Eritrean Kings & Queens Matters</h2>
            <p className="text-gray-600 mb-3">Current Opportunity Gap:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1 pl-2">
              <li>Limited structured youth ambassador platforms</li>
              <li>Underrepresented cultural storytelling</li>
              <li>Growing youth population</li>
              <li>Rising digital audience engagement</li>
              <li>Strong sponsor appetite for youth & culture platforms</li>
            </ul>
            <p className="text-gray-700 font-medium italic">
              Eritrean Kings & Queens fills this gap.
            </p>
          </div>

          {/* Value for Sponsors */}
          <div className="bg-white rounded-2xl p-6 sm:p-10">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-4">Value for Sponsors</h2>
            <p className="text-gray-600 mb-3">Partners gain:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1 pl-2">
              <li>National brand visibility</li>
              <li>Youth market engagement</li>
              <li>Cultural brand alignment</li>
              <li>Media exposure</li>
              <li>Digital campaign reach</li>
              <li>On-stage and broadcast branding</li>
              <li>Influencer & ambassador association</li>
              <li>CSR and social impact positioning</li>
            </ul>
            <p className="text-gray-700 font-medium italic">
              This is both marketing value + brand goodwill.
            </p>
          </div>

          {/* Become a Sponsor CTA */}
          <div className="bg-white rounded-2xl p-6 sm:p-10 text-center">
            <Crown className="w-10 h-10 text-gold-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-burgundy-900 mb-2">Become a Sponsor</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We offer Platinum, Gold, Silver, and Bronze sponsorship packages to fit your brand and goals.
            </p>
            <Link
              href="/sponsors/packages"
              className="inline-block bg-gold-500 text-burgundy-900 px-8 py-3 rounded-full font-bold hover:bg-gold-400 transition-colors"
            >
              View Sponsorship Packages
            </Link>
          </div>
        </div>
      </div>

    </main>
  )
}
