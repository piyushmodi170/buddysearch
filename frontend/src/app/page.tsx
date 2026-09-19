'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import IndiaMap from '@/components/IndiaMap';
import { 
  Search, MapPin, ArrowRight, Coffee, Film, Dumbbell, ShoppingBag, 
  Compass, Plane, ShieldCheck, DollarSign, Star, MessageSquare, 
  Users, CheckCircle2, Calendar, Sparkles, ChevronRight
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const CATEGORIES = [
  { icon: '🌙', name: 'Nightout Buddy', price: '₹500/hr', desc: 'Safe, fun companion for your night out', color: 'bg-purple-100 text-purple-600' },
  { icon: '🎬', name: 'Movie Buddy', price: '₹400/hr', desc: 'Share the popcorn and company', color: 'bg-red-100 text-red-600' },
  { icon: '🛍️', name: 'Shopping Buddy', price: '₹400/hr', desc: 'Personal stylist for a window shop', color: 'bg-pink-100 text-pink-600' },
  { icon: '💃', name: 'Clubbing Buddy', price: '₹600/hr', desc: 'Your go-to partner for a great night', color: 'bg-indigo-100 text-indigo-600' },
  { icon: '🎒', name: 'Event Buddy', price: '₹500/hr', desc: 'A trusted companion for every event', color: 'bg-green-100 text-green-600' },
  { icon: '🎮', name: 'Gaming Buddy', price: '₹300/hr', desc: 'Level up with a skilled gaming partner', color: 'bg-blue-100 text-blue-600' },
  { icon: '🍽️', name: 'Dinner Buddy', price: '₹500/hr', desc: 'Dine in the best with a flavor', color: 'bg-rose-100 text-rose-600' },
  { icon: '🏋️', name: 'Fitness Buddy', price: '₹500/hr', desc: 'Expert motivation for your fitness goals', color: 'bg-emerald-100 text-emerald-600' },
  { icon: '🚗', name: 'Driving Buddy', price: '₹300/hr', desc: 'Smooth, calm driving wherever you need', color: 'bg-teal-100 text-teal-600' },
  { icon: '🗣️', name: 'Language Buddy', price: '₹300/hr', desc: 'Practice and learn languages together', color: 'bg-cyan-100 text-cyan-600' },
  { icon: '📸', name: 'Photography Buddy', price: '₹500/hr', desc: 'Capture perfect memories with a photo partner', color: 'bg-yellow-100 text-yellow-600' },
  { icon: '🧭', name: 'City Explorer Buddy', price: '₹400/hr', desc: 'Unearth hidden gems and local spots with a city-savvy guide', color: 'bg-orange-100 text-orange-600' },
  { icon: '🤝', name: 'Event Buddy', price: '₹300/hr', desc: 'Listen, grow, and gain real-world experience alongside a mentor', color: 'bg-violet-100 text-violet-600' },
  { icon: '💼', name: 'Interview Buddy', price: '₹300/hr', desc: 'Ace your next interview with mock conversations and feedback', color: 'bg-slate-100 text-slate-600' },
  { icon: '☕', name: 'Cafe Buddy', price: '₹300/hr', desc: 'Good conversations over coffee with a friendly companion', color: 'bg-amber-100 text-amber-600' },
  { icon: '🚗', name: 'Car Pooling Buddy', price: '₹300/hr', desc: 'Share rides, split costs, and travel with trusted companions', color: 'bg-fuchsia-100 text-fuchsia-600' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans text-gray-900 overflow-x-hidden bg-[#fff9f9]">
      
      {/* 1. NAVBAR */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-md sticky top-0 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ff5a5f] rounded-lg flex items-center justify-center text-white shadow-sm font-bold text-sm">
              <Search size={16} strokeWidth={3} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-800">
              Buddy<span className="text-gray-500 font-medium">Search</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-gray-600">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#categories" className="hover:text-gray-900 transition-colors">Categories</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[13px] font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="px-5 py-2.5 bg-[#ff5a5f] hover:bg-[#ff4449] text-white rounded-full font-semibold text-[13px] transition-all shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative z-10 pt-16 pb-24 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-100 text-gray-500 rounded-full px-4 py-1.5 text-[11px] font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              India's #1 Social Companionship hiring Platform
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold text-gray-800 tracking-tight leading-[1.1]">
              Hire a Buddy <br />
              or <span className="text-[#ff5a5f]">Become One.</span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
                <div className="w-8 h-8 rounded-md bg-red-50 text-[#ff5a5f] flex items-center justify-center border border-red-100">
                  <Users size={16} />
                </div>
                Find your people.
              </div>
              <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
                <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
                  <ShieldCheck size={16} />
                </div>
                Hire for your plans.
              </div>
              <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
                <div className="w-8 h-8 rounded-md bg-green-50 text-green-500 flex items-center justify-center border border-green-100">
                  <CheckCircle2 size={16} />
                </div>
                Make it happen.
              </div>
            </div>

            <p className="text-gray-500 text-base leading-relaxed max-w-lg mt-6">
              India's social companion platform to find, hire, or connect with verified companions for every plan. From cafés and concerts to travel and adventures. BuddySearch makes social experiences effortless, while giving companions the opportunity to earn along the way.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
              <Link href="/find" className="w-full sm:w-auto px-8 py-4 bg-[#ff5a5f] hover:bg-[#ff4449] text-white rounded-full text-sm font-bold shadow-lg shadow-red-200 flex items-center justify-center gap-2 transition-all">
                <Search size={16} /> Hire a Buddy
              </Link>
              <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-[#ff5a5f] border-2 border-red-100 hover:bg-red-50 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all">
                <ShoppingBag size={16} /> Become a Buddy <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-6 pt-10 text-left border-t border-gray-100 mt-10">
              <div><h4 className="text-2xl md:text-3xl font-black text-[#ff5a5f]">100K+</h4><p className="text-xs text-gray-500 font-bold mt-2">Active Buddies</p></div>
              <div><h4 className="text-2xl md:text-3xl font-black text-[#ff5a5f]">50K+</h4><p className="text-xs text-gray-500 font-bold mt-2">Connections Made</p></div>
              <div><h4 className="text-2xl md:text-3xl font-black text-[#ff5a5f]">4.9★</h4><p className="text-xs text-gray-500 font-bold mt-2">Trust Score</p></div>
              <div><h4 className="text-2xl md:text-3xl font-black text-[#ff5a5f]">200+</h4><p className="text-xs text-gray-500 font-bold mt-2">Cities Across India</p></div>
            </div>
          </div>

          <div className="relative flex items-center justify-center h-[500px] hidden lg:flex mt-12 lg:mt-0">
            <div className="absolute w-[350px] h-[350px] bg-gradient-to-r from-red-100 to-pink-100 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute w-[300px] h-[300px] border border-dashed border-red-200 rounded-full"></div>
            <div className="absolute w-[450px] h-[450px] border border-dashed border-red-200 rounded-full"></div>
            
            <div className="relative z-20 w-[240px] h-[480px] bg-gray-900 rounded-[2.5rem] p-2.5 shadow-2xl border-4 border-gray-800">
              <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden flex flex-col relative pt-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-gray-900 rounded-b-xl z-10"></div>
                <div className="px-4 text-center mt-6">
                  <div className="inline-flex items-center gap-1 mb-5">
                     <div className="w-4 h-4 bg-[#ff5a5f] rounded flex items-center justify-center text-white text-[8px]"><Search size={10} strokeWidth={3}/></div>
                     <span className="font-bold text-xs text-gray-800">BuddySearch</span>
                  </div>
                  <h3 className="font-black text-gray-800 text-lg leading-tight mb-2">Hire a Buddy<br/>or <span className="text-[#ff5a5f]">Become One.</span></h3>
                  <p className="text-[8px] text-gray-400 mb-6 leading-relaxed">India's social companion platform to find, hire, or connect with verified companions.</p>
                  <div className="space-y-2">
                    <div className="w-full bg-red-50 text-[#ff5a5f] py-2 rounded-lg text-[10px] font-bold text-center border border-red-100">Hire a Buddy</div>
                    <div className="w-full bg-white text-gray-700 py-2 rounded-lg text-[10px] font-bold text-center border border-gray-200">Become a Buddy</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute z-30 flex flex-col items-center justify-center bg-white w-14 h-14 rounded-xl shadow-lg border border-gray-50 top-[10%] left-[20%]"><span className="text-sm mb-1">🍿</span><span className="text-[7px] font-bold text-gray-700 text-center leading-tight">Movie<br/>Buddy</span></div>
            <div className="absolute z-30 flex flex-col items-center justify-center bg-white w-14 h-14 rounded-xl shadow-lg border border-gray-50 top-[15%] right-[10%]"><span className="text-sm mb-1">🏋️</span><span className="text-[7px] font-bold text-gray-700 text-center leading-tight">Gym<br/>Buddy</span></div>
            <div className="absolute z-30 flex flex-col items-center justify-center bg-white w-14 h-14 rounded-xl shadow-lg border border-gray-50 top-[50%] left-[5%]"><span className="text-sm mb-1">🛍️</span><span className="text-[7px] font-bold text-gray-700 text-center leading-tight">Shopping<br/>Buddy</span></div>
            <div className="absolute z-30 flex flex-col items-center justify-center bg-white w-14 h-14 rounded-xl shadow-lg border border-gray-50 top-[60%] right-[0%]"><span className="text-sm mb-1">☕</span><span className="text-[7px] font-bold text-gray-700 text-center leading-tight">Coffee<br/>Buddy</span></div>
            <div className="absolute z-30 flex flex-col items-center justify-center bg-white w-14 h-14 rounded-xl shadow-lg border border-gray-50 bottom-[10%] left-[15%]"><span className="text-sm mb-1">✈️</span><span className="text-[7px] font-bold text-gray-700 text-center leading-tight">Travel<br/>Buddy</span></div>
            <div className="absolute z-30 flex flex-col items-center justify-center bg-white w-14 h-14 rounded-xl shadow-lg border border-gray-50 bottom-[5%] right-[15%]"><span className="text-sm mb-1">🎒</span><span className="text-[7px] font-bold text-gray-700 text-center leading-tight">Adventure<br/>Buddy</span></div>

            <div className="absolute z-30 w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-md overflow-hidden left-[15%] top-[40%]"><img src="https://i.pravatar.cc/100?img=1" alt="Avatar" className="w-full h-full object-cover" /></div>
            <div className="absolute z-30 w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-md overflow-hidden right-[22%] top-[35%]"><img src="https://i.pravatar.cc/100?img=5" alt="Avatar" className="w-full h-full object-cover" /></div>
            <div className="absolute z-30 w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-md overflow-hidden right-[12%] bottom-[25%]"><img src="https://i.pravatar.cc/100?img=10" alt="Avatar" className="w-full h-full object-cover" /></div>
            <div className="absolute z-30 w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-md overflow-hidden left-[30%] bottom-[20%]"><img src="https://i.pravatar.cc/100?img=4" alt="Avatar" className="w-full h-full object-cover" /></div>
            
            <div className="absolute top-[20%] left-[10%] text-red-300 text-xl">✦</div>
            <div className="absolute top-[35%] right-[5%] text-red-200 text-sm">✦</div>
          </div>
        </div>
      </section>

      {/* 3. MAP SECTION */}
      <section className="py-20 bg-[#374151] text-white">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            2,422 BUDDIES ONLINE RIGHT NOW
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Your Next Buddy <span className="text-[#ff5a5f]">Is Already Here.</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-3xl mx-auto leading-relaxed">
            Post what you're up for a coffee meet, shopping, movie plan, and real, verified buddies nearby who are online reply in minutes. Our nationwide network spans major cities - find a buddy near you, no matter where you are.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 flex flex-col items-center relative">
            <div className="w-full max-w-[300px] opacity-90"><IndiaMap /></div>
            <div className="flex items-center gap-6 mt-6 text-xs font-bold text-gray-400">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span><span>Active City</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#F04438]"></span><span>Trending City</span></div>
            </div>
          </div>
          <div className="md:col-span-7">
            <div className="text-center md:text-left mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Buddies Across India</h3>
              <p className="text-gray-400 text-xs">From metropolitan hubs to emerging cities, BuddySearch connects you with verified companions wherever life takes you. Our network is growing every day.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {INDIAN_STATES.map((state, idx) => (
                <div key={idx} className="bg-[#4b5563] border border-gray-600/50 p-2.5 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer hover:bg-[#ff5a5f] hover:border-[#ff5a5f] transition-all group">
                  <div className="w-4 h-4 rounded-full bg-gray-500/50 text-white flex items-center justify-center shrink-0 group-hover:bg-white/20"><MapPin size={10} /></div>
                  <span className="text-[10px] font-semibold text-gray-200 group-hover:text-white truncate">{state}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-3 mb-16">
          <span className="text-[10px] font-bold text-[#ff5a5f] bg-red-50 border border-red-100 rounded-full px-4 py-1 uppercase tracking-wider inline-block">HOW IT WORKS</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">Simple to start, <br/><span className="text-[#ff5a5f]">built for real connections</span></h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">BuddySearch works for two kinds of people: those who have a plan and need a companion, and those who love making new friends.</p>
        </div>

        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          {/* I need a buddy */}
          <div className="relative border border-red-100 bg-red-50/20 rounded-[2rem] p-8">
            <div className="absolute -top-4 left-8 bg-white text-[#ff5a5f] border border-red-200 rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-2 shadow-sm">
              <Users size={14}/> I need a Buddy
            </div>
            <div className="space-y-8 mt-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-red-200/50">
              {[
                { title: 'Post Your Plan', desc: 'Share what you want to do (cafe, gym, explore the city, watch a movie, travel somewhere new). Takes under 2 minutes.' },
                { title: 'Choose a verified Buddy', desc: 'Verified Buddies nearby who share your interests see your post and send you a chat request. Browse their profiles and pick your vibe.' },
                { title: 'Connect & Negotiate', desc: 'Accept a Buddy and a private chat opens instantly. Plan the details, set your own price and meet up.' },
                { title: 'Meet Up & Enjoy', desc: 'Meet up, enjoy the experience, and rate your Buddy. Every great rating builds your story and their reputation.' },
              ].map((s, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-[#ff5a5f] text-[#ff5a5f] font-bold text-sm flex items-center justify-center shrink-0 z-10 shadow-sm">0{idx+1}</div>
                  <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm flex-1">
                    <h4 className="font-bold text-gray-800 text-sm">{s.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* I want to be a buddy */}
          <div className="relative border border-amber-100 bg-amber-50/20 rounded-[2rem] p-8">
            <div className="absolute -top-4 left-8 bg-white text-amber-500 border border-amber-200 rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-2 shadow-sm">
              <ShieldCheck size={14}/> I want to be a Buddy
            </div>
            <div className="space-y-8 mt-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-amber-200/50">
              {[
                { title: 'Set Up Your Profile', desc: 'Tell people who you are, what activities you love, and where you are. Set your availability and let your personality shine.' },
                { title: 'Browse Nearby Plans', desc: 'See activity requests posted by people near you. Filter by interest, location, or Buddy category to find plans that match your energy.' },
                { title: 'Accept plans & Earn', desc: 'Get connect with people nearby, accept the plans that fit your schedule, set your own rates and get paid directly.' },
                { title: 'Meet Up & Enjoy', desc: 'Show up, enjoy the experience, and rate your client. Every great rating builds your story and their reputation.' },
              ].map((s, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-amber-400 text-amber-500 font-bold text-sm flex items-center justify-center shrink-0 z-10 shadow-sm">0{idx+1}</div>
                  <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex-1 relative">
                    {idx === 2 && <div className="absolute -top-3 right-4 bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-1 rounded-md">₹2K/hr<br/><span className="text-[7px] font-normal">make up to</span></div>}
                    <h4 className="font-bold text-gray-800 text-sm">{s.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. CATEGORIES */}
      <section id="categories" className="py-24 bg-[#fff9f9]">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-3 mb-16">
          <span className="text-[10px] font-bold text-[#ff5a5f] bg-red-50 border border-red-100 rounded-full px-4 py-1 uppercase tracking-wider inline-block">WHAT ARE YOU LOOKING FOR</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800">A Buddy for <span className="text-[#ff5a5f]">every plan</span></h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">Whether it's coffee, travel, movies, shopping, fitness, events, or simply exploring your city. Find, hire, or become a verified companion in minutes. Real people. Real experiences. Real opportunities to earn.</p>
        </div>

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {CATEGORIES.map((cat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${cat.color}`}>{cat.icon}</div>
                <div className="bg-gray-50 text-[#ff5a5f] text-[10px] font-bold px-2 py-1 rounded-full border border-gray-100">{cat.price}</div>
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">{cat.name}</h4>
              <p className="text-[11px] text-gray-500 mb-4 line-clamp-2">{cat.desc}</p>
              <Link href="/find" className="text-[11px] font-bold text-[#ff5a5f] border border-[#ff5a5f] rounded-full px-4 py-1.5 inline-block group-hover:bg-[#ff5a5f] group-hover:text-white transition-all">Book Now →</Link>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/find" className="px-8 py-3 bg-[#ff5a5f] hover:bg-[#ff4449] text-white rounded-full text-xs font-bold shadow-md inline-flex items-center gap-2 transition-all">
            Browse All Categories <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 6. FEATURES */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-3 mb-16">
          <span className="text-[10px] font-bold text-[#ff5a5f] bg-red-50 border border-red-100 rounded-full px-4 py-1 uppercase tracking-wider inline-block">WHY BUDDYSEARCH</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800">Built for real connections, <br/>built for friendship</h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">Every feature is designed to make finding - and hiring - a Buddy as natural and safe as possible.</p>
        </div>

        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[
            { icon: MapPin, title: 'Location-Based Discovery', desc: 'Find Buddies in your city, neighborhood, or wherever your next adventure takes you using real-time geo-filtering.' },
            { icon: MessageSquare, title: 'Private Real-Time Chat', desc: 'Don\'t overshare before you meet. Connect instantly, plan your activity, share details, and coordinate via our built-in secure in-app chat.' },
            { icon: ShieldCheck, title: 'Verified Profiles', desc: 'All Buddies go through an ID verification process. See their verified status clearly so you know exactly who you\'re connecting with.' },
            { icon: Sparkles, title: 'Instant Notifications', desc: 'Get notified the moment someone wants to join your plan, or when your chat request gets accepted. Stay in the loop, always.' },
            { icon: DollarSign, title: 'Activity Based Fees', desc: 'Buddies set custom rates based on types of plans. Set your own fee, charge per hour, per event or per day.' },
            { icon: Star, title: 'Flexible Roles', desc: 'Switch efforts smoothly when you\'re ready to group, host connections, or if you simply just want to join a plan near you.' },
          ].map((feature, i) => (
            <div key={i} className="bg-[#fff9f9] p-6 rounded-3xl border border-red-50 hover:border-red-200 transition-all">
              <div className="w-10 h-10 bg-red-100 text-[#ff5a5f] rounded-xl flex items-center justify-center mb-4"><feature.icon size={18} /></div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. INCOME / CALCULATOR */}
      <section className="py-24 bg-[#374151]">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-bold text-white bg-white/20 border border-white/10 rounded-full px-4 py-1 uppercase tracking-wider inline-block">EARN AS A BUDDY</span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Turn your free time <br/>into <span className="text-[#ff5a5f]">real income</span></h2>
            <p className="text-sm text-gray-400 leading-relaxed">India's fastest growing social platform. Set your own rules, choose your activities, and earn up to ₹2,000/hr - on your terms.</p>
            
            <div className="flex gap-8 pt-4">
              <div><h4 className="text-2xl font-bold text-white">₹2K/hr</h4><p className="text-[10px] text-gray-400">Top Earners</p></div>
              <div><h4 className="text-2xl font-bold text-white">200+</h4><p className="text-[10px] text-gray-400">Active Cities in India</p></div>
              <div className="bg-[#ff5a5f] rounded-xl p-3"><h4 className="text-xl font-bold text-white">₹240</h4><p className="text-[9px] text-red-100">Avg Earn</p></div>
            </div>
            
            <Link href="/signup" className="px-6 py-3 bg-[#ff5a5f] hover:bg-[#ff4449] text-white rounded-full text-xs font-bold inline-flex items-center gap-2 mt-4">
              Start Earning Today <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="bg-[#4b5563] p-6 rounded-[2rem] border border-gray-600 shadow-2xl relative">
             <div className="flex items-center justify-between border-b border-gray-500 pb-4 mb-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white"><Star size={16}/></div>
                   <div><h4 className="text-sm font-bold text-white">Hangout & Companionship</h4><p className="text-[10px] text-gray-400">Top earning category</p></div>
                </div>
                <div className="text-right">
                   <h4 className="text-sm font-bold text-white">Income & Earnings</h4><p className="text-[10px] text-gray-400">10 hrs/wk = ₹20,000/mo</p>
                </div>
             </div>
             <div className="bg-[#374151] rounded-xl p-4 mb-4">
                <h4 className="text-xs font-bold text-white mb-2">Set Your Own Rates</h4>
                <div className="h-2 bg-gray-600 rounded-full w-full overflow-hidden"><div className="h-full bg-[#ff5a5f] w-[60%]"></div></div>
                <p className="text-[9px] text-gray-400 mt-2">You decide what to charge.</p>
             </div>
             <div className="flex justify-between text-[10px] text-gray-300 font-semibold">
                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-400"/> Verified profiles</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-400"/> Secure payments</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-400"/> Flexible hours</span>
             </div>
          </div>
        </div>
      </section>

      {/* 8. PRICING */}
      <section id="pricing" className="py-24 bg-[#fff9f9]">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-3 mb-16">
          <span className="text-[10px] font-bold text-[#ff5a5f] bg-red-50 border border-red-100 rounded-full px-4 py-1 uppercase tracking-wider inline-block">PRICING</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800">Simple, transparent <br/>plans for everyone</h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">No hidden fees. Pick the plan that fits your pace. Limited time offer.</p>
          <p className="text-[10px] font-bold text-[#ff5a5f] underline cursor-pointer">BROWSE BUDDIES FIRST</p>
        </div>

        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'BASIC', price: '₹249', period: '/month', desc: 'Billed ₹2988 for 12 months', features: ['Browse buddy directories', 'Send up to 5 requests /mo', 'Public profile (limited)', 'Access to basic filters', 'Basic search visibility'], color: 'text-blue-500', btn: 'Start Basic', active: false },
            { name: 'STANDARD', price: '₹349', period: '/month', desc: 'Billed ₹4188 for 12 months', features: ['Everything in Basic', 'Send up to 15 requests /mo', 'Premium profile placement', '"Verified" badge on profile', 'Higher search placement'], color: 'text-green-500', btn: 'Get Standard', active: false },
            { name: 'PREMIUM', price: '₹449', period: '/month', desc: 'Billed ₹5388 for 12 months', features: ['Everything in Standard', 'Unlimited requests', 'Highest profile placement in search', 'Premium support & assistance', 'Exclusive invites to local events'], color: 'text-[#ff5a5f]', btn: 'Go Premium', active: true },
            { name: 'VIP / PLATINUM', price: '₹849', period: '/month', desc: 'Billed ₹10188 for 12 months', features: ['Everything in Premium', 'Priority 24/7 support', '"VIP" badge on profile', 'Featured in "Top Buddies" section', 'Zero platform fees on earnings'], color: 'text-purple-500', btn: 'Become a VIP', active: false },
          ].map((plan, i) => (
            <div key={i} className={`bg-white rounded-3xl p-6 border ${plan.active ? 'border-[#ff5a5f] shadow-xl shadow-red-100 relative scale-105 z-10' : 'border-gray-100 shadow-sm'} flex flex-col`}>
              {plan.active && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ff5a5f] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase">Most Popular</div>}
              <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mb-4 ${plan.color}`}><Star size={14}/></div>
              <h3 className="text-xs font-bold text-gray-800 mb-1">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                <span className="text-[10px] text-gray-500 font-bold mb-1.5">{plan.period}</span>
              </div>
              <p className="text-[9px] text-gray-400 mb-6">{plan.desc}</p>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-[10px] text-gray-600 font-medium">
                    <CheckCircle2 size={12} className={`${plan.color} shrink-0 mt-0.5`} /> {f}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-2.5 rounded-full text-xs font-bold transition-all ${plan.active ? 'bg-[#ff5a5f] text-white hover:bg-[#ff4449]' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                {plan.btn}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section id="testimonials" className="py-24 bg-white overflow-hidden border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-3 mb-16">
          <span className="text-[10px] font-bold text-[#ff5a5f] bg-red-50 border border-red-100 rounded-full px-4 py-1 uppercase tracking-wider inline-block">TESTIMONIALS</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800">Real people, <br/>real results</h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">From late-night outings to weekend adventures — real people share how BuddySearch made every moment better.</p>
        </div>

        {/* Marquee effect container */}
        <div className="relative w-full flex gap-4 px-6 pb-4 overflow-x-hidden">
           {/* Duplicate the array to create a scrolling effect */}
           <div className="flex gap-4 animate-[marquee_40s_linear_infinite] whitespace-nowrap">
             {[1,2,3,4,5,6,7].map((i) => (
               <div key={i} className="inline-block w-[300px] bg-[#fff9f9] border border-red-50 p-5 rounded-2xl whitespace-normal shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                     <img src={`https://i.pravatar.cc/150?img=${i+10}`} alt="User" className="w-10 h-10 rounded-full object-cover"/>
                     <div>
                        <h4 className="text-xs font-bold text-gray-800">Priya Sharma</h4>
                        <p className="text-[9px] text-gray-500">Travel Buddy - Mumbai</p>
                        <div className="flex text-[#ff5a5f] mt-0.5"><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/></div>
                     </div>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed italic">"I was hesitant at first, but hiring a city buddy for my solo trip to Mumbai was the best decision! My buddy was verified, extremely polite, and showed me spots I'd never find alone."</p>
               </div>
             ))}
           </div>
           {/* Gradient masks for smooth edge fading */}
           <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
           <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
        </div>
      </section>

      {/* 10. CTA BANNER */}
      <section className="bg-[#ff5a5f] py-20 text-center text-white px-6">
        <h2 className="text-3xl md:text-4xl font-black mb-4">Your next adventure <br/>needs a Buddy.</h2>
        <p className="text-sm text-red-100 max-w-lg mx-auto mb-8">Join over 100,000 people who are already finding companions for every plan, every activity, every day.</p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
           <Link href="/find" className="px-8 py-3 bg-white text-[#ff5a5f] rounded-full text-xs font-bold shadow-lg shadow-red-900/20">Find a Buddy Now</Link>
           <Link href="/signup" className="px-8 py-3 bg-transparent border border-white text-white rounded-full text-xs font-bold hover:bg-white/10">Become a Buddy -&gt;</Link>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-[#374151] text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-8">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-[#ff5a5f] rounded-md flex items-center justify-center text-white"><Search size={12}/></div>
                 <span className="font-extrabold text-lg text-white">Buddy<span className="text-gray-400 font-medium">Search</span></span>
              </div>
              <p className="text-[10px] text-gray-500 pr-4">India's leading social companion platform to find, hire, or become a verified companion for every plan.</p>
              <div className="flex gap-2">
                 {/* Social Icons Placeholder */}
                 <div className="w-6 h-6 rounded bg-gray-700"></div>
                 <div className="w-6 h-6 rounded bg-gray-700"></div>
                 <div className="w-6 h-6 rounded bg-gray-700"></div>
              </div>
           </div>
           
           <div>
              <h4 className="text-white text-xs font-bold mb-4 uppercase">Company</h4>
              <ul className="space-y-2 text-[11px]">
                 <li><a href="#" className="hover:text-[#ff5a5f]">About Us</a></li>
                 <li><a href="#" className="hover:text-[#ff5a5f]">Careers</a></li>
                 <li><a href="#" className="hover:text-[#ff5a5f]">Blog</a></li>
                 <li><a href="#" className="hover:text-[#ff5a5f]">Contact Us</a></li>
              </ul>
           </div>

           <div>
              <h4 className="text-white text-xs font-bold mb-4 uppercase">Product</h4>
              <ul className="space-y-2 text-[11px]">
                 <li><a href="#" className="hover:text-[#ff5a5f]">Find a Buddy</a></li>
                 <li><a href="#" className="hover:text-[#ff5a5f]">Become a Buddy</a></li>
                 <li><a href="#" className="hover:text-[#ff5a5f]">Pricing</a></li>
                 <li><a href="#" className="hover:text-[#ff5a5f]">Trust & Safety</a></li>
              </ul>
           </div>

           <div>
              <h4 className="text-white text-xs font-bold mb-4 uppercase">Legal</h4>
              <ul className="space-y-2 text-[11px]">
                 <li><a href="#" className="hover:text-[#ff5a5f]">Privacy Policy</a></li>
                 <li><a href="#" className="hover:text-[#ff5a5f]">Terms of Service</a></li>
                 <li><a href="#" className="hover:text-[#ff5a5f]">Cookie Policy</a></li>
                 <li><a href="#" className="hover:text-[#ff5a5f]">Guidelines</a></li>
              </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between text-[10px] text-gray-500">
           <p>&copy; 2026 BuddySearch India. All rights reserved.</p>
           <div className="flex gap-4 mt-2 md:mt-0">
              <a href="#">Terms</a> <a href="#">Privacy</a> <a href="#">Cookies</a>
           </div>
        </div>
      </footer>

      {/* Tailwind config for custom animations if not in globals */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
}
