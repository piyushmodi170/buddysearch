'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  MessageCircle, 
  CheckCircle2, 
  ChevronDown, 
  X, 
  Filter, 
  Loader2, 
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Buddy {
  id: string;
  name: string;
  role: string;
  city: string;
  state?: string;
  location: string;
  image?: string;
  initials?: string;
  verified?: boolean;
  online?: boolean;
  isStar?: boolean;
  interests?: string[];
  bio?: string;
  rating?: number;
  reviewCount?: number;
  availableForRequests?: boolean;
  createdAt?: string;
}

function mapBuddy(user: any): Buddy {
  const interests = (user.interests || [])
    .map((item: any) => item.interest?.label || item.interest?.slug || item)
    .filter((value: any) => typeof value === 'string');
  return {
    id: user.id,
    name: user.name || 'Buddy',
    role: user.role === 'BOTH' ? 'Client & Buddy' : user.role === 'BUDDY' ? 'Buddy' : (user.role || 'Member'),
    city: user.city || '',
    state: user.state,
    location: [user.city, user.state].filter(Boolean).join(', ') || 'India',
    image: user.avatar || user.image,
    initials: (user.name || 'B').slice(0, 2).toUpperCase(),
    verified: Boolean(user.aadhaarVerified || user.verified),
    online: Boolean(user.isOnline || user.online),
    isStar: user.membershipPlan === 'STAR' || user.membershipPlan === 'PREMIUM',
    interests,
    bio: user.bio,
    rating: user.avgRating || user.rating,
    reviewCount: user.reviewCount,
    availableForRequests: user.availableForRequests,
    createdAt: user.createdAt,
  };
}

const LOCATIONS_LIST = ['All Locations', 'Mumbai', 'Pune', 'Navi Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Kolkata', 'Guwahati', 'Coimbatore', 'Baramati', 'Nashik'];
const INTERESTS_LIST = ['All Interests', 'Movies', 'Fitness', 'Travel', 'Photography', 'Food', 'Events', 'Gaming', 'Art', 'Nightlife', 'Shopping', 'Tech', 'Music'];

export default function FindPage() {
  const [activeTab, setActiveTab] = useState<string>('for-you');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [selectedInterest, setSelectedInterest] = useState<string>('All Interests');
  
  // Dropdown UI Toggles
  const [showLocDropdown, setShowLocDropdown] = useState(false);
  const [showIntDropdown, setShowIntDropdown] = useState(false);

  // Selected Buddy Modal State
  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null);

  // API Data State
  const [apiBuddies, setApiBuddies] = useState<Buddy[]>([]);
  const [loading, setLoading] = useState(false);

  const filterTabs = [
    { id: 'for-you', label: 'For You' },
    { id: 'near-you', label: 'Near You - Mumbai' },
    { id: 'new-joiners', label: 'New Joiners' },
    { id: 'trending', label: 'Trending' },
    { id: 'all-india', label: 'All India' },
  ];

  // Fetch API Data whenever tab or filter changes
  useEffect(() => {
    fetchBuddiesFromApi();
  }, [activeTab, selectedLocation, selectedInterest]);

  const fetchBuddiesFromApi = async () => {
    setLoading(true);
    try {
      const cityFilter = selectedLocation !== 'All Locations' ? selectedLocation : (activeTab === 'near-you' ? 'Mumbai' : undefined);
      const res = await api.get('/api/users/discover', {
        params: {
          tab: activeTab,
          search: searchQuery || undefined,
          city: cityFilter
        }
      });
      setApiBuddies((res.data?.data?.data || []).map(mapBuddy));
    } catch (err) {
      setApiBuddies([]);
    } finally {
      setLoading(false);
    }
  };

  // Master Filtered Dataset Calculation
  const filteredBuddies = useMemo(() => {
    let dataset = apiBuddies;

    // Filter by Search Input
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      dataset = dataset.filter(b => 
        b.name.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.role.toLowerCase().includes(q) ||
        (b.interests && b.interests.some(i => i.toLowerCase().includes(q)))
      );
    }

    // Filter by Selected Location Dropdown
    if (selectedLocation !== 'All Locations') {
      dataset = dataset.filter(b => b.city.toLowerCase() === selectedLocation.toLowerCase() || b.location.toLowerCase().includes(selectedLocation.toLowerCase()));
    }

    // Filter by Selected Interest Dropdown
    if (selectedInterest !== 'All Interests') {
      dataset = dataset.filter(b => b.interests && b.interests.includes(selectedInterest));
    }

    // Filter by Active Tab
    switch (activeTab) {
      case 'near-you':
        return dataset.filter(b => b.city === 'Mumbai' || b.location.includes('Mumbai') || b.city === 'Pune' || b.city === 'Navi Mumbai');
      case 'new-joiners':
        return [...dataset].sort((a, b) => new Date(b.createdAt || '2026-09-01').getTime() - new Date(a.createdAt || '2026-09-01').getTime());
      case 'trending':
        return [...dataset].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'all-india':
        return dataset;
      case 'for-you':
      default:
        return dataset;
    }
  }, [apiBuddies, activeTab, searchQuery, selectedLocation, selectedInterest]);

  // Render Individual Buddy Card
  const renderBuddyCard = (buddy: Buddy) => (
    <div 
      key={buddy.id} 
      onClick={() => setSelectedBuddy(buddy)}
      className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer aspect-[3/4] bg-gray-900 border border-gray-100"
    >
      {/* Photo Cover or Initials Avatar */}
      {buddy.image ? (
        <img 
          src={buddy.image} 
          alt={buddy.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center text-3xl font-extrabold text-white tracking-widest">
          {buddy.initials || buddy.name.slice(0, 2).toUpperCase()}
        </div>
      )}

      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        {buddy.isStar || buddy.verified ? (
          <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-md font-bold text-xs">
            {buddy.verified ? <CheckCircle2 size={16} className="text-white fill-blue-600" /> : <Star size={14} className="fill-amber-950" />}
          </div>
        ) : <div />}

        {buddy.online && (
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
        )}
      </div>

      {/* Bottom Gradient Card Info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
        <div className="pr-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-base text-white leading-tight drop-shadow-sm">{buddy.name}</h3>
            {buddy.verified && (
              <CheckCircle2 size={15} className="text-emerald-400 fill-emerald-400/20 shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-gray-300 font-medium mt-0.5">{buddy.role}</p>
          <p className="text-[11px] text-red-300 font-medium mt-1 flex items-center gap-1">
            <MapPin size={12} className="shrink-0 text-red-400" />
            <span className="truncate">{buddy.location}</span>
          </p>
        </div>

        {/* Message Circle Button */}
        <Link 
          href={`/messages?user=${buddy.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toast.success(`Opening chat with ${buddy.name}`);
          }} 
          className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        >
          <MessageCircle size={18} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search Input Bar */}
        <div className="relative w-full lg:w-96">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, interest or location..." 
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white text-gray-800 placeholder-gray-400 font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown Filters & Actions */}
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          
          {/* Location Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowLocDropdown(!showLocDropdown);
                setShowIntDropdown(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border rounded-xl transition-all ${
                selectedLocation !== 'All Locations' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              <MapPin size={14} className="text-red-500" />
              <div className="text-left">
                <span className="text-[9px] text-gray-400 block uppercase font-bold leading-none">Location</span>
                <span className="text-xs font-bold text-gray-800">{selectedLocation}</span>
              </div>
              <ChevronDown size={14} className="text-gray-400 ml-1" />
            </button>

            {/* Location Dropdown Menu */}
            {showLocDropdown && (
              <div className="absolute top-full mt-2 left-0 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                {LOCATIONS_LIST.map(loc => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setShowLocDropdown(false);
                      toast.success(`Filter applied: ${loc}`);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition-colors ${
                      selectedLocation === loc ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interests Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowIntDropdown(!showIntDropdown);
                setShowLocDropdown(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border rounded-xl transition-all ${
                selectedInterest !== 'All Interests' ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              <Star size={14} className="text-amber-500" />
              <div className="text-left">
                <span className="text-[9px] text-gray-400 block uppercase font-bold leading-none">Interests</span>
                <span className="text-xs font-bold text-gray-800">{selectedInterest}</span>
              </div>
              <ChevronDown size={14} className="text-gray-400 ml-1" />
            </button>

            {/* Interests Dropdown Menu */}
            {showIntDropdown && (
              <div className="absolute top-full mt-2 left-0 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                {INTERESTS_LIST.map(interest => (
                  <button
                    key={interest}
                    onClick={() => {
                      setSelectedInterest(interest);
                      setShowIntDropdown(false);
                      toast.success(`Filter applied: ${interest}`);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-amber-50 hover:text-amber-700 transition-colors ${
                      selectedInterest === interest ? 'bg-amber-50 text-amber-700 font-bold' : 'text-gray-700'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset / View All Button */}
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedLocation('All Locations');
              setSelectedInterest('All Interests');
              setSearchQuery('');
              setActiveTab('for-you');
              toast.success('Filters reset');
            }}
            className="border-red-400 text-red-500 hover:bg-red-50 text-xs font-bold shrink-0 rounded-xl"
          >
            View All &gt;
          </Button>
        </div>
      </div>

      {/* Filter Tabs Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              toast.success(`Showing ${tab.label}`);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm shrink-0 border ${
              activeTab === tab.id
                ? 'bg-red-500 text-white border-red-500 ring-2 ring-red-400/30'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER DYNAMIC SECTIONS */}
      {filteredBuddies.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <Globe size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No buddies found</h3>
          <p className="text-xs text-gray-500 mb-4">Try clearing your search or location filter.</p>
          <Button 
            size="sm"
            onClick={() => {
              setSelectedLocation('All Locations');
              setSelectedInterest('All Interests');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">People on BuddySearch</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredBuddies.map(renderBuddyCard)}
          </div>
        </section>
      )}

      {/* RICH BUDDY DETAILS MODAL */}
      {selectedBuddy && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedBuddy(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 relative animate-in zoom-in-95"
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedBuddy(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header Photo */}
            <div className="relative h-64 bg-gray-900">
              {selectedBuddy.image ? (
                <img src={selectedBuddy.image} alt={selectedBuddy.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center text-4xl font-extrabold text-white">
                  {selectedBuddy.initials || selectedBuddy.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black">{selectedBuddy.name}</h2>
                  {selectedBuddy.verified && (
                    <CheckCircle2 size={20} className="text-emerald-400 fill-emerald-400/20" />
                  )}
                </div>
                <p className="text-xs text-red-300 font-semibold flex items-center gap-1 mt-1">
                  <MapPin size={14} className="text-red-400" />
                  {selectedBuddy.location}
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold bg-red-100 text-red-600 px-3 py-1 rounded-full border border-red-200">
                  {selectedBuddy.role}
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Available
                </span>
              </div>

              {/* Bio */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">About</h4>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {selectedBuddy.bio || 'This member has not added a bio yet.'}
                </p>
              </div>

              {/* Interests */}
              {selectedBuddy.interests && selectedBuddy.interests.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBuddy.interests.map(interest => (
                      <span key={interest} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Now Button */}
              <div className="pt-2">
                <Link href={`/messages?user=${selectedBuddy.id}`}>
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                    <MessageCircle size={18} /> Chat Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
