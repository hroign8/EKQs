'use client'

import { useState } from 'react'
import { Crown, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import PageHero from '@/components/PageHero'

const faqs = [
  {
    category: 'Voting',
    questions: [
      {
        q: 'How do I vote for a contestant?',
        a: 'Visit our contestants page, select your favorite, choose a category, and complete the payment to cast your vote.',
      },
      {
        q: 'Can I vote multiple times?',
        a: 'Yes! You can vote as many times as you like for any contestant in any category. Each vote helps support the contestants and contributes to their chances of winning.',
      },
      {
        q: 'When does voting close?',
        a: 'Voting closes on March 16, 2026 at 11:59 PM. Make sure to cast your votes before then!',
      },
      {
        q: 'How are votes counted?',
        a: 'Every vote is recorded securely in our system. Results are updated in real time and can be viewed on the results page.',
      },
      {
        q: 'What payment methods are accepted for voting?',
        a: 'We accept mobile money and card payments through our secure PesaPal payment gateway.',
      },
    ],
  },
  {
    category: 'Tickets and Event',
    questions: [
      {
        q: 'How can I attend the event?',
        a: 'Purchase tickets through our ticketing page. We offer General, VIP, and VVIP packages with different perks and seating.',
      },
      {
        q: 'What is included in each ticket package?',
        a: 'General admission includes entry to the event. VIP tickets include reserved seating and refreshments. VVIP tickets offer front-row seating, fine dining, a meet-and-greet with contestants, and exclusive gifts.',
      },
      {
        q: 'Can I get a refund on my ticket?',
        a: 'Ticket refunds are available up to 7 days before the event. Please contact us at info@ekqs.com for refund requests.',
      },
      {
        q: 'Where is the event held?',
        a: 'The event takes place in Kampala, Uganda. The exact venue details are shared with ticket holders closer to the event date.',
      },
      {
        q: 'What is the dress code?',
        a: 'We encourage smart formal or semi-formal attire. VIP and VVIP guests are encouraged to dress in elegant evening wear.',
      },
    ],
  },
  {
    category: 'Contestants',
    questions: [
      {
        q: 'How are contestants selected?',
        a: 'Contestants go through an application and selection process where they are evaluated on their achievements, community involvement, and overall presentation.',
      },
      {
        q: 'What categories do contestants compete in?',
        a: "Contestants compete in four main categories: People's Choice, Best Talent, Best Fashion, Confidence, and Miss Photogenic.",
      },
      {
        q: 'Can I nominate someone as a contestant?',
        a: 'Yes! Nominations can be submitted through our contact page. Nominated individuals will be invited to apply for the next event cycle.',
      },
    ],
  },
  {
    category: 'General',
    questions: [
      {
        q: 'What is Eritrean Kings & Queens?',
        a: 'Eritrean Kings & Queens is an annual pageant celebrating excellence, beauty, and the achievements of outstanding individuals from the Eritrean community. We focus on character, intelligence, talent, and community service.',
      },
      {
        q: 'How can I sponsor or partner with the event?',
        a: 'We welcome sponsorship and partnership inquiries. Please reach out to us at info@ekqs.com with your proposal.',
      },
      {
        q: 'How do I contact the organizers?',
        a: 'You can reach us via email at info@ekqs.com, by phone at +256-708203858 or +256-756531948, or through our contact page.',
      },
    ],
  },
]

export default function FAQsPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  function toggle(key: string) {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <PageHero title="Frequently Asked" highlightedWord="Questions" subtitle="Find answers to common questions about voting, tickets, and the event" />

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-xl font-bold text-burgundy-900 mb-4">{section.category}</h2>
              <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-100">
                {section.questions.map((item, idx) => {
                  const key = `${section.category}-${idx}`
                  const isOpen = openItems[key]
                  return (
                    <button
                      key={key}
                      onClick={() => toggle(key)}
                      className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 focus:outline-none hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold text-burgundy-900 text-sm sm:text-base">{item.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-burgundy-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-burgundy-400 flex-shrink-0" />
                        )}
                      </div>
                      {isOpen && (
                        <p className="mt-3 text-gray-600 text-sm leading-relaxed pr-8">{item.a}</p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Still have questions? */}
          <div className="bg-burgundy-900 rounded-2xl p-5 sm:p-8 text-center">
            <Crown className="w-10 h-10 text-gold-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Still Have Questions?</h2>
            <p className="text-burgundy-200 mb-6 max-w-md mx-auto">
              Can&apos;t find what you&apos;re looking for? Our team is happy to help.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-gold-500 text-burgundy-900 px-8 py-3 rounded-full font-bold hover:bg-gold-400 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

    </main>
  )
}
