import React, { useState, useEffect, useMemo } from 'react';
import {
  Coffee,
  MapPin,
  Navigation,
  Star,
  Users,
  Wallet,
  Ticket,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  LogOut,
  UserCheck,
  Gift,
  X,
  Info
} from 'lucide-react';
import { BANGALORE_AREAS, FALLBACK_CAFES } from './fallbackData';

const API_BASE = 'http://localhost:5000/api';

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

function computeMeetupScore(sub) {
  const score =
    0.35 * sub.ambiance +
    0.30 * sub.seating +
    0.20 * sub.food +
    0.15 * sub.value;
  return Number(score.toFixed(2));
}

export default function App() {
  const [stage, setStage] = useState('auth');
  const [user, setUser] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  const [authTab, setAuthTab] = useState('guest');
  const [guestName, setGuestName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');

  const [onboardStep, setOnboardStep] = useState(1);
  const [onboardArea, setOnboardArea] = useState('Koramangala');
  const [onboardBudget, setOnboardBudget] = useState('any');
  const [onboardAmbiance, setOnboardAmbiance] = useState('All');

  const [activeTab, setActiveTab] = useState('explore');
  const [cafes, setCafes] = useState([]);
  const [selectedArea, setSelectedArea] = useState('Koramangala');
  const [customCoords, setCustomCoords] = useState(null);
  const [areaFilter, setAreaFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('any');
  const [maxDistance, setMaxDistance] = useState('any');
  const [ambianceFilter, setAmbianceFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('meetup');

  const [selectedCafe, setSelectedCafe] = useState(null);
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('5:30 PM');
  const [bookingGuests, setBookingGuests] = useState(4);
  const [rewardChoice, setRewardChoice] = useState('cashback');
  const [selectedCouponId, setSelectedCouponId] = useState('');
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');

  const [revAmbiance, setRevAmbiance] = useState(5);
  const [revSeating, setRevSeating] = useState(5);
  const [revFood, setRevFood] = useState(4);
  const [revValue, setRevValue] = useState(5);
  const [revSpend, setRevSpend] = useState('');
  const [revComment, setRevComment] = useState('');

  const fetchCafes = async (areaName = selectedArea, coords = customCoords) => {
    try {
      const query = coords
        ? `lat=${coords.lat}&lng=${coords.lng}`
        : `area=${encodeURIComponent(areaName)}`;
      const res = await fetch(`${API_BASE}/cafes?${query}`);
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      setCafes(data.cafes);
      setBackendConnected(true);
    } catch {
      const base = coords || BANGALORE_AREAS[areaName] || BANGALORE_AREAS['Koramangala'];
      const enriched = FALLBACK_CAFES.map((c) => ({
        ...c,
        distanceKm: calculateDistanceKm(base.lat, base.lng, c.lat, c.lng),
        meetupScore: computeMeetupScore(c.subRatings)
      }));
      setCafes(enriched);
      setBackendConnected(false);
    }
  };

  useEffect(() => {
    fetchCafes(selectedArea, customCoords);
  }, [selectedArea, customCoords]);

  const handleGuestStart = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: guestName })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser(data.user);
      setBackendConnected(true);
    } catch {
      setUser({
        id: 'guest_local_' + Date.now(),
        name: guestName.trim() || 'Guest Explorer',
        email: 'guest@tableforus.in',
        isGuest: true,
        freeBookingsUsed: 0,
        walletBalance: 0,
        coupons: [],
        bookings: []
      });
    }
    setOnboardStep(1);
    setStage('onboarding');
  };

  const handleAccountLogin = async (e) => {
    e.preventDefault();
    if (!accountEmail.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: accountName, email: accountEmail })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser(data.user);
      setBackendConnected(true);
      if (data.user.onboardingCompleted) {
        setSelectedArea(data.user.preferences.area || 'Koramangala');
        setBudgetFilter(data.user.preferences.maxBudget || 'any');
        setAmbianceFilter(data.user.preferences.ambiance || 'All');
        setStage('dashboard');
        return;
      }
    } catch {
      setUser({
        id: 'local_' + Date.now(),
        name: accountName.trim() || accountEmail.split('@')[0],
        email: accountEmail.trim(),
        isGuest: false,
        freeBookingsUsed: 0,
        walletBalance: 0,
        coupons: [],
        bookings: []
      });
    }
    setOnboardStep(1);
    setStage('onboarding');
  };

  const completeOnboarding = async () => {
    const prefs = {
      area: onboardArea,
      maxBudget: onboardBudget,
      ambiance: onboardAmbiance
    };
    setSelectedArea(onboardArea);
    setCustomCoords(null);
    setBudgetFilter(onboardBudget);
    setAmbianceFilter(onboardAmbiance);

    if (user) {
      try {
        const res = await fetch(`${API_BASE}/users/${user.id}/onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefs)
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        setUser({ ...user, preferences: prefs });
      }
    }
    setStage('dashboard');
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => {
        alert('Location permission denied. Using selected Bangalore neighborhood.');
      }
    );
  };

  const filteredCafes = useMemo(() => {
    return cafes
      .filter((c) => {
        if (areaFilter !== 'All' && c.area !== areaFilter) return false;
        if (budgetFilter === 'under300' && c.budget > 300) return false;
        if (budgetFilter === '300to500' && (c.budget < 300 || c.budget > 500)) return false;
        if (budgetFilter === 'above500' && c.budget <= 500) return false;
        if (maxDistance !== 'any' && c.distanceKm > Number(maxDistance)) return false;
        if (ambianceFilter !== 'All' && c.ambiance !== ambianceFilter) return false;
        if (
          searchQuery.trim() &&
          !c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !c.area.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !c.specialty.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
        if (sortBy === 'budget') return a.budget - b.budget;
        return b.meetupScore - a.meetupScore;
      });
  }, [cafes, areaFilter, budgetFilter, maxDistance, ambianceFilter, searchQuery, sortBy]);

  const handleBookTable = async (e) => {
    e.preventDefault();
    if (!selectedCafe || !user) return;

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cafeId: selectedCafe.id,
          date: bookingDate,
          time: bookingTime,
          guests: bookingGuests,
          rewardChoice,
          useCouponId: selectedCouponId || null,
          useWallet: useWalletBalance
        })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser(data.user);
      setBookingSuccessMsg(
        `Table confirmed at ${selectedCafe.name}! ${data.booking.rewardSummary}.`
      );
      setSelectedCouponId('');
      setUseWalletBalance(false);
    } catch {
      const isFree = user.freeBookingsUsed < 3;
      const baseFee = isFree ? 0 : 99;
      let discount = 0;
      const updatedCoupons = [...(user.coupons || [])];

      if (!isFree && selectedCouponId) {
        const idx = updatedCoupons.findIndex((c) => c.id === selectedCouponId && !c.used);
        if (idx !== -1) {
          discount += updatedCoupons[idx].amount;
          updatedCoupons[idx] = { ...updatedCoupons[idx], used: true };
        }
      }

      let wallet = user.walletBalance || 0;
      let walletUsed = 0;
      if (!isFree && useWalletBalance && wallet > 0) {
        walletUsed = Math.min(wallet, Math.max(0, baseFee - discount));
        wallet -= walletUsed;
      }

      const paid = Math.max(0, baseFee - discount - walletUsed);
      let usedCount = user.freeBookingsUsed;
      let rewardSummary = '';

      if (isFree) {
        usedCount += 1;
        rewardSummary = `Free Booking #${usedCount} of 3 (${3 - usedCount} free left)`;
      } else if (rewardChoice === 'cashback') {
        const cb = Math.max(20, Math.round((paid || baseFee) * 0.2));
        wallet += cb;
        rewardSummary = `₹${cb} Instant Cashback credited to Wallet`;
      } else {
        const newCpn = {
          id: 'CPN' + Math.floor(1000 + Math.random() * 9000),
          code: 'BREW50',
          label: '₹50 Off Next Table Booking / Order',
          amount: 50,
          used: false
        };
        updatedCoupons.push(newCpn);
        rewardSummary = `Unlocked Coupon ${newCpn.code} (₹50 Off Next Order)`;
      }

      const newBooking = {
        id: 'BK' + Math.floor(100000 + Math.random() * 900000),
        cafeId: selectedCafe.id,
        cafeName: selectedCafe.name,
        cafeArea: selectedCafe.area,
        date: bookingDate,
        time: bookingTime,
        guests: bookingGuests,
        isFree,
        amountPaid: paid,
        rewardSummary,
        status: 'Confirmed'
      };

      setUser({
        ...user,
        freeBookingsUsed: usedCount,
        walletBalance: wallet,
        coupons: updatedCoupons,
        bookings: [newBooking, ...(user.bookings || [])]
      });
      setBookingSuccessMsg(`Table confirmed at ${selectedCafe.name}! ${rewardSummary}.`);
      setSelectedCouponId('');
      setUseWalletBalance(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!selectedCafe) return;

    const payload = {
      user: user?.name || 'Guest Explorer',
      ambiance: Number(revAmbiance),
      seating: Number(revSeating),
      food: Number(revFood),
      value: Number(revValue),
      spend: Number(revSpend) || selectedCafe.budget,
      comment: revComment.trim() || 'Great hangout vibe and easy to chat with friends!'
    };

    try {
      const res = await fetch(`${API_BASE}/cafes/${selectedCafe.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSelectedCafe({ ...selectedCafe, ...data.cafe });
      fetchCafes();
    } catch {
      const avg = Number(
        ((payload.ambiance + payload.seating + payload.food + payload.value) / 4).toFixed(1)
      );
      const updated = {
        ...selectedCafe,
        reviews: [
          {
            id: Date.now(),
            user: payload.user,
            rating: avg,
            spend: payload.spend,
            comment: payload.comment,
            date: 'Just now'
          },
          ...selectedCafe.reviews
        ]
      };
      setSelectedCafe(updated);
      setCafes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }
    setRevComment('');
    setRevSpend('');
  };

  if (stage === 'auth') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between px-4 py-8">
        <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2C1E16] text-[#FAF8F5] flex items-center justify-center shadow-sm">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-semibold tracking-tight text-[#2C1E16]">TableForUs</span>
              <span className="block text-[11px] text-[#7A6A5F]">Bangalore Cafe & Meetup Finder</span>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#EFEAE2] text-[#5C493E] font-medium">
            First 3 Table Bookings Free
          </span>
        </header>

        <main className="max-w-4xl w-full mx-auto grid md:grid-cols-2 gap-10 items-center my-auto py-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E6DFD5] text-xs font-medium text-[#B86B35]">
              <Sparkles className="w-3.5 h-3.5" />
              JP Nagar • Jayanagar • Koramangala • Electronic City
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#2C1E16] leading-tight">
              Find the right cafe in Bangalore to catch up with friends.
            </h1>
            <p className="text-sm sm:text-base text-[#66564C] leading-relaxed">
              Compare live distance from your area, per-person budget, hangout ambiance, and our
              weighted Friend-Meetup Score—then reserve your table in seconds.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white border border-[#E8E1D7] rounded-xl p-3.5">
                <p className="text-lg font-semibold text-[#2C1E16]">24+</p>
                <p className="text-xs text-[#7A6A5F]">Curated Cafes</p>
              </div>
              <div className="bg-white border border-[#E8E1D7] rounded-xl p-3.5">
                <p className="text-lg font-semibold text-[#B86B35]">3 Free</p>
                <p className="text-xs text-[#7A6A5F]">Table Bookings</p>
              </div>
              <div className="bg-white border border-[#E8E1D7] rounded-xl p-3.5">
                <p className="text-lg font-semibold text-[#2C1E16]">20%</p>
                <p className="text-xs text-[#7A6A5F]">Wallet Cashback</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E6DFD5] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex rounded-xl bg-[#F4EFE8] p-1 mb-6">
              <button
                type="button"
                onClick={() => setAuthTab('guest')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  authTab === 'guest'
                    ? 'bg-white text-[#2C1E16] shadow-sm'
                    : 'text-[#6E5E54] hover:text-[#2C1E16]'
                }`}
              >
                Continue as Guest
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('account')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  authTab === 'account'
                    ? 'bg-white text-[#2C1E16] shadow-sm'
                    : 'text-[#6E5E54] hover:text-[#2C1E16]'
                }`}
              >
                Sign In / Sign Up
              </button>
            </div>

            {authTab === 'guest' ? (
              <form onSubmit={handleGuestStart} className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#2C1E16]">Instant Guest Access</h2>
                  <p className="text-xs text-[#7A6A5F] mt-1">
                    No password needed. Includes 3 free table bookings & rewards wallet.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C493E] mb-1.5">
                    Your Name (optional)
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g., Sanjana"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD7CC] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#B86B35]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#B86B35] hover:bg-[#A35B29] text-white text-sm font-medium flex items-center justify-center gap-2 transition shadow-sm"
                >
                  Enter as Guest
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleAccountLogin} className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#2C1E16]">Welcome to TableForUs</h2>
                  <p className="text-xs text-[#7A6A5F] mt-1">
                    Save your bookings, free reservation credits, and cashback coupons.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C493E] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Sanjana M"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD7CC] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#B86B35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C493E] mb-1.5">
                    College or Personal Email
                  </label>
                  <input
                    type="email"
                    required
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    placeholder="sanjana@university.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD7CC] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#B86B35]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#2C1E16] hover:bg-[#3F2C21] text-white text-sm font-medium flex items-center justify-center gap-2 transition shadow-sm"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </main>

        <footer className="max-w-5xl w-full mx-auto text-center text-xs text-[#8C7B70]">
          TableForUs • Built for Bangalore Cafe Discovery & Group Meetups
        </footer>
      </div>
    );
  }

  if (stage === 'onboarding') {
    const budgetOptions = [
      { id: 'under300', label: 'Under ₹300 / person', desc: 'Pocket-friendly college hangouts' },
      { id: '300to500', label: '₹300 – ₹500 / person', desc: 'Comfortable coffee, snacks & desserts' },
      { id: 'above500', label: '₹500+ / person', desc: 'Artisanal brunch & rooftop lounges' },
      { id: 'any', label: 'Show All Budgets', desc: 'Compare everything nearby' }
    ];

    const ambianceOptions = [
      { id: 'All', label: 'Any Ambiance', desc: 'Open to all hangout styles' },
      { id: 'Outdoor Garden', label: 'Outdoor Garden', desc: 'Courtyards, greenery & open air' },
      { id: 'Cozy & Quiet', label: 'Cozy & Quiet', desc: 'Peaceful corners for deep talks' },
      { id: 'Board Games & Lively', label: 'Board Games & Lively', desc: 'Games, energy & group tables' },
      { id: 'Aesthetic & Minimal', label: 'Aesthetic & Minimal', desc: 'Warm wood, natural light & pastries' },
      { id: 'Rooftop', label: 'Rooftop', desc: 'Evening breeze & open-sky views' }
    ];

    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full bg-white border border-[#E6DFD5] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-medium text-[#B86B35]">
              Step {onboardStep} of 3 • Personalize Your Feed
            </span>
            <button
              type="button"
              onClick={completeOnboarding}
              className="text-xs text-[#7A6A5F] hover:text-[#2C1E16] underline"
            >
              Skip to Dashboard
            </button>
          </div>

          <div className="w-full h-1.5 bg-[#EFEAE2] rounded-full mb-7 overflow-hidden">
            <div
              className="h-full bg-[#B86B35] transition-all duration-300"
              style={{ width: `${(onboardStep / 3) * 100}%` }}
            />
          </div>

          {onboardStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-[#2C1E16]">
                  Hi {user?.name || 'there'}! Where are you starting from?
                </h2>
                <p className="text-sm text-[#6E5E54] mt-1">
                  We’ll calculate exact distances in km from your Bangalore neighborhood.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(BANGALORE_AREAS).map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setOnboardArea(area)}
                    className={`p-3.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                      onboardArea === area
                        ? 'border-[#B86B35] bg-[#FDF8F4] text-[#2C1E16]'
                        : 'border-[#E6DFD5] hover:border-[#C9BEB0] text-[#5C493E]'
                    }`}
                  >
                    <MapPin
                      className={`w-4 h-4 shrink-0 ${
                        onboardArea === area ? 'text-[#B86B35]' : 'text-[#8C7B70]'
                      }`}
                    />
                    <span className="text-sm font-medium">{area}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {onboardStep === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-[#2C1E16]">
                  What’s your typical per-person budget?
                </h2>
                <p className="text-sm text-[#6E5E54] mt-1">
                  We’ll highlight cafes that match your friend group’s comfort range.
                </p>
              </div>
              <div className="space-y-2.5">
                {budgetOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOnboardBudget(opt.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                      onboardBudget === opt.id
                        ? 'border-[#B86B35] bg-[#FDF8F4]'
                        : 'border-[#E6DFD5] hover:border-[#C9BEB0]'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-[#2C1E16]">{opt.label}</p>
                      <p className="text-xs text-[#7A6A5F]">{opt.desc}</p>
                    </div>
                    {onboardBudget === opt.id && (
                      <CheckCircle2 className="w-5 h-5 text-[#B86B35] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {onboardStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-[#2C1E16]">
                  What kind of cafe ambiance does your group love?
                </h2>
                <p className="text-sm text-[#6E5E54] mt-1">
                  You can change this anytime on the main dashboard.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ambianceOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOnboardAmbiance(opt.id)}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      onboardAmbiance === opt.id
                        ? 'border-[#B86B35] bg-[#FDF8F4]'
                        : 'border-[#E6DFD5] hover:border-[#C9BEB0]'
                    }`}
                  >
                    <p className="text-sm font-medium text-[#2C1E16]">{opt.label}</p>
                    <p className="text-xs text-[#7A6A5F] mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#EFEAE2]">
            {onboardStep > 1 ? (
              <button
                type="button"
                onClick={() => setOnboardStep(onboardStep - 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#66564C] hover:bg-[#F4EFE8] flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {onboardStep < 3 ? (
              <button
                type="button"
                onClick={() => setOnboardStep(onboardStep + 1)}
                className="px-5 py-2.5 rounded-xl bg-[#2C1E16] hover:bg-[#3F2C21] text-white text-sm font-medium flex items-center gap-1.5"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={completeOnboarding}
                className="px-6 py-2.5 rounded-xl bg-[#B86B35] hover:bg-[#A35B29] text-white text-sm font-medium flex items-center gap-2 shadow-sm"
              >
                Explore Bangalore Cafes
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const freeBookingsLeft = Math.max(0, 3 - (user?.freeBookingsUsed || 0));
  const activeCoupons = (user?.coupons || []).filter((c) => !c.used);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C1E16]">
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur border-b border-[#E6DFD5]">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2C1E16] text-[#FAF8F5] flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-semibold tracking-tight">TableForUs</span>
              <span className="hidden sm:inline-block ml-2 text-[11px] px-2 py-0.5 rounded-full bg-[#EFEAE2] text-[#66564C]">
                {backendConnected ? 'Live API' : 'Local Mode'}
              </span>
            </div>
          </div>

          <nav className="flex items-center bg-[#EFEAE2] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'explore'
                  ? 'bg-white text-[#2C1E16] shadow-sm'
                  : 'text-[#66564C] hover:text-[#2C1E16]'
              }`}
            >
              Explore Cafes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activeTab === 'bookings'
                  ? 'bg-white text-[#2C1E16] shadow-sm'
                  : 'text-[#66564C] hover:text-[#2C1E16]'
              }`}
            >
              My Bookings & Wallet
              {(user?.bookings?.length || 0) > 0 && (
                <span className="px-1.5 py-0.2 text-xs rounded-full bg-[#B86B35] text-white">
                  {user.bookings.length}
                </span>
              )}
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E6DFD5] text-xs">
              <Ticket className="w-3.5 h-3.5 text-[#B86B35]" />
              <span className="font-medium">{freeBookingsLeft}/3 Free Bookings</span>
              <span className="text-[#D4C9BC]">|</span>
              <Wallet className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-medium">₹{user?.walletBalance || 0}</span>
            </div>

            <div className="flex items-center gap-2 pl-2">
              <span className="text-xs font-medium text-[#5C493E] flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#B86B35]" />
                {user?.name}
              </span>
              <button
                type="button"
                title="Switch User / Logout"
                onClick={() => setStage('auth')}
                className="p-2 rounded-lg text-[#7A6A5F] hover:bg-[#EFEAE2] hover:text-[#2C1E16]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {activeTab === 'explore' && (
        <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <section className="bg-white border border-[#E6DFD5] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#B86B35]">
                Your Starting Point in Bangalore
              </p>
              <h1 className="text-lg sm:text-xl font-semibold text-[#2C1E16] mt-0.5">
                Showing live distances from{' '}
                <span className="underline decoration-[#B86B35]/50">
                  {customCoords ? 'Your Live GPS Location' : selectedArea}
                </span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={customCoords ? 'gps' : selectedArea}
                onChange={(e) => {
                  if (e.target.value === 'gps') {
                    handleUseGPS();
                  } else {
                    setCustomCoords(null);
                    setSelectedArea(e.target.value);
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-[#DFD7CC] bg-[#FAF8F5] text-sm font-medium text-[#2C1E16] focus:outline-none focus:border-[#B86B35]"
              >
                {Object.keys(BANGALORE_AREAS).map((area) => (
                  <option key={area} value={area}>
                    From: {area}
                  </option>
                ))}
                {customCoords && <option value="gps">From: Live GPS Coordinates</option>}
              </select>

              <button
                type="button"
                onClick={handleUseGPS}
                className="px-3.5 py-2 rounded-xl border border-[#DFD7CC] hover:border-[#B86B35] bg-white text-sm font-medium text-[#2C1E16] flex items-center gap-1.5 transition"
              >
                <Navigation className="w-3.5 h-3.5 text-[#B86B35]" />
                Use My GPS
              </button>
            </div>
          </section>

          <section className="bg-white border border-[#E6DFD5] rounded-2xl p-4 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-1">
                <Search className="w-4 h-4 text-[#8C7B70] absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cafe or dish..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DFD7CC] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#B86B35]"
                />
              </div>

              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#DFD7CC] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#B86B35]"
              >
                <option value="All">All Bangalore Areas</option>
                {Object.keys(BANGALORE_AREAS).map((a) => (
                  <option key={a} value={a}>
                    Cafe in {a}
                  </option>
                ))}
              </select>

              <select
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#DFD7CC] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#B86B35]"
              >
                <option value="any">Any Budget / Person</option>
                <option value="under300">Under ₹300 / person</option>
                <option value="300to500">₹300 – ₹500 / person</option>
                <option value="above500">₹500+ / person</option>
              </select>

              <select
                value={ambianceFilter}
                onChange={(e) => setAmbianceFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#DFD7CC] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#B86B35]"
              >
                <option value="All">All Ambiance Styles</option>
                <option value="Outdoor Garden">Outdoor Garden</option>
                <option value="Cozy & Quiet">Cozy & Quiet</option>
                <option value="Board Games & Lively">Board Games & Lively</option>
                <option value="Aesthetic & Minimal">Aesthetic & Minimal</option>
                <option value="Rooftop">Rooftop</option>
              </select>

              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#DFD7CC] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#B86B35]"
              >
                <option value="any">Any Distance</option>
                <option value="3">Within 3 km</option>
                <option value="6">Within 6 km</option>
                <option value="10">Within 10 km</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F0EAE1] text-xs">
              <div className="flex items-center gap-2 text-[#66564C]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#B86B35]" />
                <span>
                  Showing <strong>{filteredCafes.length}</strong> cafes
                </span>
                {(areaFilter !== 'All' ||
                  budgetFilter !== 'any' ||
                  ambianceFilter !== 'All' ||
                  maxDistance !== 'any' ||
                  searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAreaFilter('All');
                      setBudgetFilter('any');
                      setAmbianceFilter('All');
                      setMaxDistance('any');
                      setSearchQuery('');
                    }}
                    className="text-[#B86B35] underline ml-1"
                  >
                    Reset filters
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#7A6A5F]">Sort by:</span>
                {[
                  { id: 'meetup', label: 'Friend-Meetup Score' },
                  { id: 'distance', label: 'Nearest First' },
                  { id: 'budget', label: 'Lowest Budget' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSortBy(s.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      sortBy === s.id
                        ? 'bg-[#2C1E16] text-white'
                        : 'bg-[#F4EFE8] text-[#5C493E] hover:bg-[#E8E0D4]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {filteredCafes.length === 0 ? (
            <div className="bg-white border border-[#E6DFD5] rounded-2xl p-12 text-center space-y-3">
              <p className="text-base font-medium text-[#2C1E16]">
                No cafes match those exact filters right now.
              </p>
              <button
                type="button"
                onClick={() => {
                  setAreaFilter('All');
                  setBudgetFilter('any');
                  setAmbianceFilter('All');
                  setMaxDistance('any');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-[#B86B35] text-white text-xs font-medium"
              >
                Show All Bangalore Cafes
              </button>
            </div>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCafes.map((cafe) => (
                <article
                  key={cafe.id}
                  className="bg-white border border-[#E6DFD5] rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="relative h-44 bg-[#EFEAE2]">
                      <img
                        src={cafe.image}
                        alt={cafe.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-[#2C1E16] text-xs font-medium shadow-sm">
                        {cafe.area} • {cafe.distanceKm} km
                      </span>
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#2C1E16]/90 text-white text-xs font-semibold flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#E5A97B]" />
                        {cafe.meetupScore} / 5
                      </span>
                    </div>

                    <div className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-[#2C1E16] leading-snug">
                          {cafe.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FDF6EE] text-[#B86B35] shrink-0">
                          <Star className="w-3 h-3 fill-[#B86B35]" />
                          {cafe.overallRating}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#66564C]">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F4EFE8] font-medium text-[#2C1E16]">
                          ₹{cafe.budget} / person
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F4EFE8]">
                          {cafe.ambiance}
                        </span>
                      </div>

                      <p className="text-xs text-[#7A6A5F] line-clamp-2">{cafe.specialty}</p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-emerald-700 font-medium">
                      {freeBookingsLeft > 0
                        ? `Free Table Booking (${freeBookingsLeft} left)`
                        : '₹99 Booking • 20% Cashback'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCafe(cafe);
                        setBookingSuccessMsg('');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#B86B35] hover:bg-[#A35B29] text-white text-xs font-medium transition"
                    >
                      View & Book Table
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}
        </main>
      )}

      {activeTab === 'bookings' && (
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E6DFD5] rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-[#7A6A5F]">
                <Ticket className="w-4 h-4 text-[#B86B35]" />
                Free Table Bookings Left
              </div>
              <p className="text-2xl font-semibold text-[#2C1E16] mt-2">
                {freeBookingsLeft} <span className="text-sm font-normal text-[#7A6A5F]">of 3</span>
              </p>
              <p className="text-xs text-[#7A6A5F] mt-1">
                First 3 reservations carry ₹0 booking fee.
              </p>
            </div>

            <div className="bg-white border border-[#E6DFD5] rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-[#7A6A5F]">
                <Wallet className="w-4 h-4 text-emerald-700" />
                Rewards Wallet Cashback
              </div>
              <p className="text-2xl font-semibold text-[#2C1E16] mt-2">
                ₹{user?.walletBalance || 0}
              </p>
              <p className="text-xs text-[#7A6A5F] mt-1">
                Redeemable on future table reservations.
              </p>
            </div>

            <div className="bg-white border border-[#E6DFD5] rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-[#7A6A5F]">
                <Gift className="w-4 h-4 text-[#B86B35]" />
                Active Discount Coupons
              </div>
              <p className="text-2xl font-semibold text-[#2C1E16] mt-2">{activeCoupons.length}</p>
              <p className="text-xs text-[#7A6A5F] mt-1">
                {activeCoupons.length > 0
                  ? `${activeCoupons[0].code} (₹${activeCoupons[0].amount} Off Next Order)`
                  : 'Unlocked automatically after paid bookings.'}
              </p>
            </div>
          </div>

          {activeCoupons.length > 0 && (
            <div className="bg-white border border-[#E6DFD5] rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[#2C1E16]">Your Next-Order Discount Vouchers</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {activeCoupons.map((cpn) => (
                  <div
                    key={cpn.id}
                    className="p-3.5 rounded-xl border border-dashed border-[#B86B35] bg-[#FDF8F4] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#B86B35]">{cpn.code}</span>
                      <p className="text-xs text-[#2C1E16] mt-0.5">{cpn.label}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white text-[#2C1E16]">
                      ₹{cpn.amount} OFF
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-[#E6DFD5] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#2C1E16]">Table Reservations</h2>
              <button
                type="button"
                onClick={() => setActiveTab('explore')}
                className="text-xs font-medium text-[#B86B35] underline"
              >
                + Book Another Cafe
              </button>
            </div>

            {!user?.bookings || user.bookings.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <p className="text-sm text-[#5C493E]">No table bookings yet.</p>
                <p className="text-xs text-[#7A6A5F]">
                  Pick any cafe in Bangalore and use your 3 free table reservations!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {user.bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-[#EFEAE2] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#2C1E16]">{b.cafeName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#66564C]">
                        {b.cafeArea} • {b.date} at {b.time} • {b.guests} Friends
                      </p>
                      <p className="text-xs font-medium text-[#B86B35]">{b.rewardSummary}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-semibold text-[#2C1E16]">
                        {b.amountPaid === 0 ? 'FREE (₹0)' : `Paid ₹${b.amountPaid}`}
                      </p>
                      <p className="text-[11px] text-[#8C7B70]">Ref: {b.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {selectedCafe && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E6DFD5] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="relative h-52 bg-[#EFEAE2]">
              <img
                src={selectedCafe.image}
                alt={selectedCafe.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedCafe(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 text-[#2C1E16] flex items-center justify-center shadow"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-end justify-between gap-2">
                <div className="bg-white/95 backdrop-blur px-3.5 py-2 rounded-xl shadow-sm">
                  <h2 className="text-lg font-semibold text-[#2C1E16]">{selectedCafe.name}</h2>
                  <p className="text-xs text-[#66564C]">
                    {selectedCafe.address} • <strong>{selectedCafe.distanceKm} km away</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 grid md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#B86B35]">
                      Friend-Meetup Rating
                    </span>
                    <span className="text-base font-bold text-[#2C1E16]">
                      {selectedCafe.meetupScore} / 5.0
                    </span>
                  </div>

                  {[
                    { label: 'Ambiance & Vibe (35%)', val: selectedCafe.subRatings.ambiance },
                    { label: 'Group Seating Space (30%)', val: selectedCafe.subRatings.seating },
                    { label: 'Food & Coffee (20%)', val: selectedCafe.subRatings.food },
                    { label: 'Budget Value (15%)', val: selectedCafe.subRatings.value }
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs text-[#5C493E]">
                        <span>{item.label}</span>
                        <span className="font-semibold">{item.val}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E6DFD5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#B86B35]"
                          style={{ width: `${(item.val / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-xs text-[#5C493E]">
                  <p>
                    <strong>Budget:</strong> ~₹{selectedCafe.budget} per person •{' '}
                    <strong>Hours:</strong> {selectedCafe.hours}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedCafe.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-full bg-[#F4EFE8] text-[#2C1E16] font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#EFEAE2]">
                  <h3 className="text-sm font-semibold text-[#2C1E16]">
                    Friend Reviews ({selectedCafe.reviews.length})
                  </h3>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {selectedCafe.reviews.map((r) => (
                      <div key={r.id} className="p-2.5 rounded-xl bg-[#FAF8F5] text-xs space-y-1">
                        <div className="flex justify-between font-medium text-[#2C1E16]">
                          <span>{r.user}</span>
                          <span>
                            ★ {r.rating} • Spent ₹{r.spend}
                          </span>
                        </div>
                        <p className="text-[#66564C]">{r.comment}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddReview} className="space-y-2 pt-2">
                    <p className="text-xs font-medium text-[#2C1E16]">Rate this meetup spot:</p>
                    <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                      {[
                        { label: 'Vibe', val: revAmbiance, set: setRevAmbiance },
                        { label: 'Seating', val: revSeating, set: setRevSeating },
                        { label: 'Food', val: revFood, set: setRevFood },
                        { label: 'Value', val: revValue, set: setRevValue }
                      ].map((f) => (
                        <label key={f.label} className="block">
                          <span className="text-[#7A6A5F]">{f.label}</span>
                          <select
                            value={f.val}
                            onChange={(e) => f.set(Number(e.target.value))}
                            className="w-full mt-0.5 px-1.5 py-1 rounded-lg border border-[#DFD7CC] bg-white"
                          >
                            {[5, 4, 3, 2, 1].map((n) => (
                              <option key={n} value={n}>
                                {n} ★
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={revComment}
                        onChange={(e) => setRevComment(e.target.value)}
                        placeholder="Share hangout notes..."
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[#DFD7CC] text-xs"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-[#2C1E16] text-white text-xs font-medium"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E6DFD5] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
                <form onSubmit={handleBookTable} className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-[#2C1E16]">Reserve a Table</h3>
                    <p className="text-xs text-[#7A6A5F] mt-0.5">
                      {freeBookingsLeft > 0
                        ? `You have ${freeBookingsLeft} of 3 free table bookings remaining!`
                        : 'Choose instant wallet cashback or a discount voucher on your next order.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#5C493E] mb-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#DFD7CC] bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#5C493E] mb-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Time Slot
                      </label>
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#DFD7CC] bg-white text-xs"
                      >
                        <option>11:00 AM</option>
                        <option>1:30 PM</option>
                        <option>4:00 PM</option>
                        <option>5:30 PM</option>
                        <option>7:30 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5C493E] mb-1">
                      Number of Friends
                    </label>
                    <select
                      value={bookingGuests}
                      onChange={(e) => setBookingGuests(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#DFD7CC] bg-white text-xs"
                    >
                      {[2, 3, 4, 5, 6, 8, 10].map((g) => (
                        <option key={g} value={g}>
                          {g} People
                        </option>
                      ))}
                    </select>
                  </div>

                  {freeBookingsLeft > 0 ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <p className="font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        Free Table Booking ({freeBookingsLeft} of 3 left)
                      </p>
                      <p className="text-emerald-800">
                        Reservation Fee: <strong>₹0</strong>. Pay directly at the cafe for what you
                        order.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-white border border-[#E6DFD5] space-y-3 text-xs">
                      <div className="flex justify-between font-medium text-[#2C1E16]">
                        <span>Table Reservation Fee (After 3 Free)</span>
                        <span>₹99</span>
                      </div>

                      {activeCoupons.length > 0 && (
                        <div>
                          <label className="block text-[11px] font-medium text-[#5C493E] mb-1">
                            Apply Next-Order Discount Coupon:
                          </label>
                          <select
                            value={selectedCouponId}
                            onChange={(e) => setSelectedCouponId(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#DFD7CC] bg-[#FAF8F5]"
                          >
                            <option value="">No coupon applied</option>
                            {activeCoupons.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.code} — Save ₹{c.amount}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {(user?.walletBalance || 0) > 0 && (
                        <label className="flex items-center gap-2 text-[#2C1E16]">
                          <input
                            type="checkbox"
                            checked={useWalletBalance}
                            onChange={(e) => setUseWalletBalance(e.target.checked)}
                          />
                          Use ₹{user.walletBalance} Wallet Cashback
                        </label>
                      )}

                      <div className="space-y-1.5 pt-1 border-t border-[#EFEAE2]">
                        <p className="font-medium text-[#2C1E16]">Choose Your Booking Reward:</p>
                        <label className="flex items-center gap-2 p-2 rounded-lg border border-[#EFEAE2] cursor-pointer">
                          <input
                            type="radio"
                            name="reward"
                            checked={rewardChoice === 'cashback'}
                            onChange={() => setRewardChoice('cashback')}
                          />
                          <span>
                            <strong>20% Instant Cashback</strong> to TableForUs Wallet
                          </span>
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded-lg border border-[#EFEAE2] cursor-pointer">
                          <input
                            type="radio"
                            name="reward"
                            checked={rewardChoice === 'coupon'}
                            onChange={() => setRewardChoice('coupon')}
                          />
                          <span>
                            <strong>₹50 OFF Coupon</strong> on your next order
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {bookingSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                      {bookingSuccessMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#B86B35] hover:bg-[#A35B29] text-white text-sm font-medium transition shadow-sm"
                  >
                    {freeBookingsLeft > 0
                      ? 'Confirm Free Table Booking (₹0)'
                      : 'Pay & Confirm Table Booking'}
                  </button>
                </form>

                <p className="text-[11px] text-[#8C7B70] mt-4 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    Formula: Meetup Score = 35% Ambiance + 30% Seating + 20% Food + 15% Value.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
