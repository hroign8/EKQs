'use client'

import { Crown, Heart, Award, Camera, Clock, Star, Users, Mic, Music, Utensils } from 'lucide-react'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-burgundy-900 py-8 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-gold-500"></div>
            <Crown className="w-6 h-6 text-gold-500" />
            <div className="h-px w-12 bg-gold-500"></div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            About <span className="text-gold-500">Us</span>
          </h1>
          <p className="text-burgundy-200 text-base sm:text-lg max-w-xl mx-auto">
            Learn more about our event and mission
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Mission */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              The mission of Eritrean Kings & Queens is to deliver a professionally structured and transparently managed national pageant that integrates cultural promotion, leadership development, and social advocacy with strong commercial and institutional partnerships.
            </p>
            <p className="text-gray-600 mb-4">
              We achieve this through structured training programs, fair and merit-based competition, strategic brand collaborations, and high-quality production standards. We are redefining pageantry as a tool for empowerment and nation-building.
            </p>
            <p className="text-gray-600 mb-3">
              The platform is committed to producing credible ambassadors who represent Eritrea with:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
              <li>Leadership</li>
              <li>Cultural pride</li>
              <li>Market value</li>
              <li>Eloquence</li>
              <li>Discipline</li>
              <li>Social impact</li>
              <li>Integrity</li>
              <li>Global representation</li>
            </ul>
          </div>

          {/* About the Event */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-4">About the Event</h2>
            <p className="text-gray-600 mb-4">
              Eritrean Kings & Queens is a national pageant platform designed to develop confident, intelligent, and purpose-driven men and women who represent Eritrean excellence.
            </p>
            <p className="text-gray-600 mb-4">
              We aim to become the premier national pageant platform dedicated to developing confident, intelligent, and purpose-driven men and women who represent the highest standards of Eritrean excellence. The platform envisions a new generation of kings and queens recognized not only for presence and charisma, but for leadership, cultural awareness, eloquence, discipline, and commitment to social impact.
            </p>
            <p className="text-gray-600 mb-4">
              Through this initiative, we seek to elevate authentic Eritrean voices, celebrate and preserve cultural identity, and cultivate role models who inspire unity, resilience, and positive transformation across communities and generations.
            </p>
            <p className="text-gray-600 mb-4">
              Eritrean Kings & Queens is designed to produce ambassadors who lead with integrity, communicate with confidence, and use their influence to advance meaningful social and cultural causes at both national and global levels.
            </p>
            <p className="text-gray-600 mb-3">We combine:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1 pl-2">
              <li>Cultural celebration</li>
              <li>Leadership development</li>
              <li>Youth empowerment</li>
              <li>National representation</li>
              <li>Commercial brand partnerships</li>
            </ul>
            <p className="text-gray-700 font-medium italic">
              This is not only a pageant, it is an ambassador development platform.
            </p>
          </div>

          {/* Approach */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-4">Our Approach</h2>
            <p className="text-gray-600 mb-3">
              We deliver a professionally managed, transparent, and commercially viable pageant models through:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1 pl-2">
              <li>Structured contestant training</li>
              <li>Merit-based competition</li>
              <li>Cultural promotion</li>
              <li>Advocacy programs</li>
              <li>Strategic partnerships</li>
              <li>High-quality production</li>
            </ul>
            <p className="text-gray-700 font-medium italic">
              Result: credible ambassadors with market and social value.
            </p>
          </div>

          {/* Objectives */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-4">Objectives</h2>
            <p className="text-gray-600 mb-3">
              Eritrean Kings & Queens is established to achieve the following objectives:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
              <li>Empower young men and women through leadership and personal development programs</li>
              <li>Promote and showcase Eritrean culture, heritage, and identity on modern platforms</li>
              <li>Develop nationally recognized role models and cultural ambassadors</li>
              <li>Build a sustainable and scalable pageant model with long-term growth potential</li>
              <li>Attract corporate sponsorships and institutional partnerships</li>
              <li>Establish strong media and digital visibility</li>
              <li>Generate consistent audience engagement across broadcast and digital channels</li>
              <li>Create career and brand pathways for contestants and titleholders</li>
              <li>Position the pageant as both a cultural and commercial platform</li>
            </ul>
          </div>

          {/* What to Expect */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-6">What to Expect</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mic className="w-5 h-5 text-burgundy-900" />
                </div>
                <div>
                  <h3 className="font-bold text-burgundy-900 mb-1">Live Performances</h3>
                  <p className="text-gray-600 text-sm">Enjoy stunning talent showcases from our contestants including singing, dancing, and more.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-burgundy-900" />
                </div>
                <div>
                  <h3 className="font-bold text-burgundy-900 mb-1">Entertainment</h3>
                  <p className="text-gray-600 text-sm">Special guest performances, DJ sets, and traditional Eritrean music throughout the evening.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Utensils className="w-5 h-5 text-burgundy-900" />
                </div>
                <div>
                  <h3 className="font-bold text-burgundy-900 mb-1">Fine Dining</h3>
                  <p className="text-gray-600 text-sm">VIP and VVIP guests enjoy curated menus featuring Eritrean and international cuisine.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-burgundy-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-burgundy-900" />
                </div>
                <div>
                  <h3 className="font-bold text-burgundy-900 mb-1">Networking</h3>
                  <p className="text-gray-600 text-sm">Connect with community leaders, entrepreneurs, and like-minded individuals.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Timeline */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-6">Event Schedule</h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-20 flex-shrink-0">
                  <span className="text-sm font-bold text-gold-500">6:00 PM</span>
                </div>
                <div className="flex-1 pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-burgundy-900">Red Carpet Arrival</h3>
                  <p className="text-gray-600 text-sm">Guests arrive with photo opportunities and welcome drinks</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-20 flex-shrink-0">
                  <span className="text-sm font-bold text-gold-500">7:00 PM</span>
                </div>
                <div className="flex-1 pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-burgundy-900">Opening Ceremony</h3>
                  <p className="text-gray-600 text-sm">Welcome address and introduction of contestants</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-20 flex-shrink-0">
                  <span className="text-sm font-bold text-gold-500">8:00 PM</span>
                </div>
                <div className="flex-1 pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-burgundy-900">Talent Showcase</h3>
                  <p className="text-gray-600 text-sm">Contestants perform their unique talents on stage</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-20 flex-shrink-0">
                  <span className="text-sm font-bold text-gold-500">9:30 PM</span>
                </div>
                <div className="flex-1 pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-burgundy-900">Evening Wear Segment</h3>
                  <p className="text-gray-600 text-sm">Formal fashion showcase and Q&A with contestants</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-20 flex-shrink-0">
                  <span className="text-sm font-bold text-gold-500">11:00 PM</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-burgundy-900">Crowning Ceremony</h3>
                  <p className="text-gray-600 text-sm">Announcement of winners and coronation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Competition Categories */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-6">Competition Categories</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-burgundy-900 mb-1">People's Choice Award</h3>
                  <p className="text-gray-600 text-sm">Voted by our community members, recognizing the contestant who has captured the hearts of the people.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-burgundy-900 mb-1">Best Talent Award</h3>
                  <p className="text-gray-600 text-sm">Celebrates exceptional skills in music, dance, sports, arts, and other creative pursuits.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-burgundy-900 mb-1">Best Evening Wear Award</h3>
                  <p className="text-gray-600 text-sm">Recognition for elegance, style, and confident presentation in formal fashion.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-burgundy-900 mb-1">Miss Photogenic Award</h3>
                  <p className="text-gray-600 text-sm">Celebrating the contestant with the most striking visual presence on camera.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-burgundy-50 rounded-2xl p-5 sm:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-burgundy-900">5+</div>
                <p className="text-gray-600 text-sm">Years Running</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-burgundy-900">50+</div>
                <p className="text-gray-600 text-sm">Past Contestants</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-burgundy-900">10K+</div>
                <p className="text-gray-600 text-sm">Community Votes</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-burgundy-900">1000+</div>
                <p className="text-gray-600 text-sm">Event Attendees</p>
              </div>
            </div>
          </div>

          {/* Why Vote */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-4">Why Your Vote Matters</h2>
            <p className="text-gray-600 mb-6">
              Your vote is more than just a choice—it's a celebration of the values and achievements you admire.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-burgundy-50 rounded-xl p-4">
                <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-700 text-sm">Support individuals making a difference</span>
              </div>
              <div className="flex items-center gap-3 bg-burgundy-50 rounded-xl p-4">
                <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-700 text-sm">Recognize excellence and dedication</span>
              </div>
              <div className="flex items-center gap-3 bg-burgundy-50 rounded-xl p-4">
                <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-700 text-sm">Join our community celebration</span>
              </div>
              <div className="flex items-center gap-3 bg-burgundy-50 rounded-xl p-4">
                <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-700 text-sm">Inspire the next generation</span>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-6">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-burgundy-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-gold-500 font-bold text-xl">E</span>
                </div>
                <h3 className="font-bold text-burgundy-900 mb-2">Excellence</h3>
                <p className="text-gray-600 text-sm">We celebrate outstanding achievement in all forms.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-burgundy-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-gold-500 font-bold text-xl">H</span>
                </div>
                <h3 className="font-bold text-burgundy-900 mb-2">Heritage</h3>
                <p className="text-gray-600 text-sm">We honor and celebrate Eritrean culture and traditions.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-burgundy-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-gold-500 font-bold text-xl">C</span>
                </div>
                <h3 className="font-bold text-burgundy-900 mb-2">Community</h3>
                <p className="text-gray-600 text-sm">We bring people together to celebrate unity and diversity.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl p-5 sm:p-8">
            <h2 className="text-2xl font-bold text-burgundy-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="font-bold text-burgundy-900 mb-2">How do I vote for a contestant?</h3>
                <p className="text-gray-600 text-sm">Visit our contestants page, select your favorite, choose a category, and complete the payment of $2.50 per vote to cast your vote.</p>
              </div>
              <div className="pb-4 border-b border-gray-100">
                <h3 className="font-bold text-burgundy-900 mb-2">Can I vote multiple times?</h3>
                <p className="text-gray-600 text-sm">Yes! You can vote as many times as you like for any contestant in any category. Each vote costs $2.50.</p>
              </div>
              <div className="pb-4 border-b border-gray-100">
                <h3 className="font-bold text-burgundy-900 mb-2">When does voting close?</h3>
                <p className="text-gray-600 text-sm">Voting closes on March 16, 2026 at 11:59 PM. Make sure to cast your votes before then!</p>
              </div>
              <div>
                <h3 className="font-bold text-burgundy-900 mb-2">How can I attend the event?</h3>
                <p className="text-gray-600 text-sm">Purchase tickets through our ticketing page. We offer General, VIP, and VVIP packages with different perks and seating.</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-burgundy-900 rounded-2xl p-5 sm:p-8 text-center">
            <Crown className="w-10 h-10 text-gold-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Get Involved?</h2>
            <p className="text-burgundy-200 mb-6 max-w-md mx-auto">
              Visit our voting page to cast your votes and support your favorite contestants.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contestants" className="inline-block bg-gold-500 text-burgundy-900 px-8 py-3 rounded-full font-bold hover:bg-gold-400 transition-colors">
                Vote Now
              </Link>
              <Link href="/ticketing" className="inline-block bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors">
                Get Tickets
              </Link>
              <Link href="/sponsors" className="inline-block bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors">
                Become a Sponsor
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
