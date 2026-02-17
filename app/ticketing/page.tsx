
'use client'
import React, { useState, useEffect } from 'react';
import { Ticket as TicketIcon, Check, Crown, Star, Users, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useEvent } from '@/lib/hooks';
import Link from 'next/link';
import { formatDateShort } from '@/lib/utils';
import PageHero from '@/components/PageHero';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Ticket {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
  icon: string;
}

const TicketingPage: React.FC = () => {
  const { data: session } = useSession();
  const { data: eventData } = useEvent();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch('/api/tickets');
        if (res.ok) {
          const data = await res.json();
          // Map API data to expected shape
          const mapped = data.map((t: { id: string; name: string; price: number; features: string | string[]; popular?: boolean }) => ({
            id: t.id,
            name: t.name,
            price: t.price,
            features: typeof t.features === 'string' ? JSON.parse(t.features) : t.features || [],
            popular: t.popular || false,
            icon: t.name === 'VVIP' ? 'crown' : t.name === 'VIP' ? 'star' : 'ticket',
          }));
          setTickets(mapped);
        }
      } catch {
        // Fallback to hardcoded tickets if API fails
        setTickets([
          { id: '1', name: 'VVIP', price: 50, features: ['Premium front-row seating', 'Backstage access', 'Meet & greet with contestants', 'Exclusive gift bag', 'Priority entry', 'Complimentary drinks'], popular: true, icon: 'crown' },
          { id: '2', name: 'VIP', price: 30, features: ['Reserved seating', 'Early entry', 'Event program', 'Commemorative badge', 'Refreshments included'], icon: 'star' },
          { id: '3', name: 'General', price: 10, features: ['General admission', 'Event access', 'Standing area', 'Complimentary refreshments'], icon: 'ticket' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTotal(ticket.price * quantity);
    setError('');
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
    setQuantity(qty);
    if (selectedTicket) {
      setTotal(selectedTicket.price * qty);
    }
  };

  const handleBuy = async () => {
    if (!selectedTicket || quantity <= 0) return;

    if (!session?.user) {
      setError('Please sign in to purchase tickets.');
      return;
    }

    setPurchasing(true);
    setError('');

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId: selectedTicket.id,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to purchase tickets');
        setPurchasing(false);
        return;
      }

      // Redirect to PesaPal for payment
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      // Free ticket - success
      setError('');
      setSelectedTicket(null);
      setQuantity(1);
      setTotal(0);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'crown': return <Crown className="w-8 h-8" />;
      case 'star': return <Star className="w-8 h-8" />;
      default: return <TicketIcon className="w-8 h-8" />;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading tickets..." />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <PageHero title="Get Your Tickets" subtitle="Join us for an unforgettable evening celebrating excellence, beauty, and talent" />

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Event Info Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Event Date</div>
                <div className="font-bold text-burgundy-900">{eventData ? formatDateShort(eventData.startDate) : 'TBA'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Venue</div>
                <div className="font-bold text-burgundy-900">Grand Hub, Kampala</div>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 bg-green-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium text-sm">Tickets Available</span>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-burgundy-900 mb-2">Choose Your Experience</h2>
          <p className="text-gray-600">Select the ticket that best suits you</p>
        </div>
        
        {/* Ticket Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-10">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className={`relative bg-white rounded-2xl transition-all duration-300 overflow-hidden ${
                selectedTicket?.id === ticket.id
                  ? 'ring-2 ring-gold-500 scale-[1.02]'
                  : 'hover:shadow-lg'
              }`}
            >
              {ticket.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gold-500 text-burgundy-900 px-4 py-1.5 text-xs font-bold rounded-bl-xl">
                    MOST POPULAR
                  </div>
                </div>
              )}
              
              <div className="p-6">
                {/* Icon & Title */}
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    ticket.popular ? 'bg-gold-500 text-burgundy-900' : 'bg-burgundy-100 text-burgundy-900'
                  }`}>
                    {getIcon(ticket.icon)}
                  </div>
                  <h3 className="text-2xl font-bold text-burgundy-900 mb-1">{ticket.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-gold-500">${ticket.price}</span>
                    <span className="text-gray-500 text-sm">/person</span>
                  </div>
                </div>
                
                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {ticket.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-gold-600" strokeWidth={3} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Select Button */}
                <button
                  onClick={() => handleSelect(ticket)}
                  className={`w-full py-3 rounded-full font-semibold transition-all duration-200 ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-gold-500 text-burgundy-900'
                      : 'bg-burgundy-900 text-white hover:bg-burgundy-800'
                  }`}
                >
                  {selectedTicket?.id === ticket.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      Selected
                    </span>
                  ) : (
                    'Select Ticket'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Purchase Section */}
        {selectedTicket && (
          <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-3xl mx-auto mb-8 sm:mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-burgundy-900 mb-4 sm:mb-6 text-center">Complete Your Purchase</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Selected Ticket</div>
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xl font-bold text-burgundy-900">{selectedTicket.name}</p>
                  <p className="text-sm text-gray-600">${selectedTicket.price} each</p>
                </div>
              </div>
              
              <div className="text-center">
                <label htmlFor="quantity" className="block text-sm text-gray-500 mb-2">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-full bg-gray-50 px-4 py-3 rounded-xl text-xl font-bold text-burgundy-900 text-center focus:ring-2 focus:ring-gold-500 focus:outline-none transition-all"
                />
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Total Amount</div>
                <div className="bg-gold-50 rounded-xl px-4 py-3">
                  <p className="text-3xl font-black text-gold-500">${total}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleBuy}
              disabled={purchasing || !session?.user}
              className="w-full bg-gold-500 hover:bg-gold-400 text-burgundy-900 py-4 rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchasing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <TicketIcon className="w-5 h-5" />
                  Purchase Tickets
                </>
              )}
            </button>
            {!session?.user && (
              <p className="text-sm text-center text-gray-500 mt-3">
                Please <Link href="/signin" className="text-gold-500 font-semibold hover:text-gold-600">sign in</Link> to purchase tickets.
              </p>
            )}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl mt-4">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Why Attend */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="h-px w-12 bg-gold-500"></div>
              <Star className="w-5 h-5 text-gold-500 fill-gold-500" />
              <div className="h-px w-12 bg-gold-500"></div>
            </div>
            <h2 className="text-3xl font-bold text-burgundy-900">Why Attend?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-7 h-7 text-burgundy-900" />
              </div>
              <h4 className="font-bold text-burgundy-900 mb-2">Premium Event</h4>
              <p className="text-sm text-gray-600">Experience world-class entertainment and celebration</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-burgundy-900" />
              </div>
              <h4 className="font-bold text-burgundy-900 mb-2">Amazing Prizes</h4>
              <p className="text-sm text-gray-600">Witness contestants compete for prestigious awards</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-burgundy-900" />
              </div>
              <h4 className="font-bold text-burgundy-900 mb-2">Community Spirit</h4>
              <p className="text-sm text-gray-600">Join hundreds celebrating Eritrean culture and excellence</p>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
};

export default TicketingPage;
