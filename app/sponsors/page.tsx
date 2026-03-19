import {
  Crown,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import PageHero from '@/components/PageHero'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sponsors | Eritrean Kings & Queens',
  description: 'Meet the sponsors and partners who make the Eritrean Kings & Queens pageant possible.',
}

interface SponsorItem {
  name: string
  description: string
  icon?: LucideIcon
  imageSrc?: string
  imageClassName?: string
}

const platinumSponsors: SponsorItem[] = [
  { name: 'Virah Forex Bureau Uganda Limited', description: 'We are a trusted financial services provider offering foreign currency exchange and international money transfers through Western Union, MoneyGram, and Ria, along with Mobile Money, Airtel Money, and agency banking services. Customers can conveniently access our services at our Kansanga branch (UK Mall) and Bunga branch (Ivory Mall) in Kampala.', imageSrc: '/Val-logo.svg'},
]

const goldSponsors: SponsorItem[] = [
  { name: 'Grand Hub Cafe and Halls', description: 'Grand Hub is a vibrant destination in Kabalagala Kampala, dedicated to great meals and exceptional cakes for every occasion. Blending warm café experiences with versatile event halls, GrandHub hosts celebrations, corporate gatherings, and memorable events of all sizes in a modern, welcoming setting.', imageSrc: '/grandhub_logo.svg', imageClassName: 'scale-150'}, 
  { name: 'ERT Afro Fashion Design', description: 'Luxury fashion blending traditional Eritrean textiles with modern designs.', imageSrc: '/fashion_logo.svg' },
  { name: 'Micky Desigens', description: 'Micky Designs is a distinguished fashion house founded by the visionary Mickydad Kaaku. We specialize in crafting glamorous gowns and captivating designs that are sure to turn heads. Withan unwavering commitment to excellence, we curate new collections annually, and our presence is felt at more than 30 fashion events both domestically and internationally. Our dedicated team comprises young artisans and tailors who work tirelessly to bring our creative visions to life. Micky Designs has proudly collaborated with the most prominent names in the fashion, film, and entertainmentindustries across the country. We harbor a fervent belief that ourpassion and dedication will one day propel us to make a global impact.', imageSrc: '/mickyz_designs_logo.svg', imageClassName: 'scale-150' },
  { name: 'Interservice Hotel', description: 'At Interservice Hotel, we believe in creating a space where guests can relax, unwind, and feel truly at home. Nestled in the heart of Kampala, our hotel offers a blend of modern luxury and classic charm, providing an unforgettable experience for every traveler. Whether you’re here for business or leisure, our dedicated team is committed to exceeding your expectations and making every stay a memorable one', imageSrc: '/interservice_logo.svg' },
]

const silverSponsors: SponsorItem[] = [
  { name: 'Faras Uganda', description: 'Faras is a ride-hailing and on-demand service app operating in Kampala, providing bodas (motorcycles), car services, and courier services. The app allows users to book rides, access food delivery, and utilize a wallet system, with features like FarasMiles cashback. It can be reached via toll-free number 0800 344 440 or through their website.', imageSrc: '/faras_logo_gray-01.svg'},
]

interface PartnerItem {
  name: string
  type: string
  icon?: LucideIcon
  imageSrc?: string
  imageClassName?: string
}

const partners: PartnerItem[] = [
  { name: 'East Africa International Medical Center', type: 'Healthcare', imageSrc: '/east_africa_logo.svg' },
  { name: 'Crown Studio', type: 'Media', imageSrc: '/crown_studio_logo.svg', imageClassName: 'object-cover scale-110' },
  { name: 'Valentino R Kabenge', type: 'Entertainment', imageClassName: 'object-cover scale-110', imageSrc: '/valentino_logo.svg' },
]



function SponsorRow({ sponsor }: { sponsor: SponsorItem }) {
  const Icon = sponsor.icon
  return (
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-white border-2 border-burgundy-900 ${sponsor.imageSrc ? '' : 'p-1'}`}>
        {sponsor.imageSrc ? (
          <Image
            src={sponsor.imageSrc}
            alt={sponsor.name}
            width={40}
            height={40}
            className={`w-full h-full object-contain ${sponsor.imageClassName ?? ''}`}
          />
        ) : Icon ? (
          <Icon className="w-5 h-5 text-burgundy-900" />
        ) : null}
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
              <div className="space-y-8">
                {platinumSponsors.map((s) => <SponsorRow key={s.name} sponsor={s} />)}
              </div>
            </div>

            <div className="border-t border-gray-100 mb-10"></div>

            {/* Gold */}
            <div className="mb-10">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Gold</p>
              <div className="grid sm:grid-cols-2 gap-8">
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
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-white border-2 border-burgundy-900">
                      {partner.imageSrc ? (
                        <Image
                          src={partner.imageSrc}
                          alt={partner.name}
                          width={36}
                          height={36}
                          className={`w-9 h-9 object-cover rounded-full ${partner.imageClassName ?? ''}`}
                        />
                      ) : Icon ? (
                        <Icon className="w-4 h-4 text-burgundy-900" />
                      ) : null}
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
