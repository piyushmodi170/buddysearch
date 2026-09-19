'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Sparkles, 
  MessageCircle, 
  Flame, 
  CheckCircle2, 
  ChevronDown, 
  X, 
  Filter, 
  Loader2, 
  Heart, 
  ShieldCheck, 
  UserCheck, 
  Globe,
  SlidersHorizontal
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

// Full Rich Dataset of Buddies across India
const MASTER_BUDDIES: Buddy[] = [
  { 
    id: 'b-1', 
    name: 'Priyanka Gaikwad', 
    role: 'Client & Buddy', 
    city: 'Mumbai', 
    state: 'Maharashtra',
    location: 'Mumbai, Maharashtra', 
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600', 
    verified: true, 
    online: true, 
    isStar: true,
    interests: ['Movies', 'Fitness', 'Travel', 'Photography'],
    bio: 'Love exploring new cafes, watching sci-fi movies and weekend photowalks across Mumbai.',
    rating: 4.9,
    reviewCount: 18,
    availableForRequests: true,
    createdAt: '2026-09-01'
  },
  { 
    id: 'b-2', 
    name: 'Ishwari Jadhav', 
    role: 'Client & Buddy', 
    city: 'Pune', 
    state: 'Maharashtra',
    location: 'Pune, Maharashtra', 
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600', 
    verified: true, 
    online: true, 
    isStar: true,
    interests: ['Food', 'Cafes', 'Music', 'Shopping'],
    bio: 'Food lover and cafe hopper in Pune. Always up for good coffee and long conversations.',
    rating: 4.8,
    reviewCount: 14,
    availableForRequests: true,
    createdAt: '2026-09-05'
  },
  { 
    id: 'b-3', 
    name: 'Sahil Jadhav', 
    role: 'Client & Buddy', 
    city: 'Mumbai', 
    state: 'Maharashtra',
    location: 'Mumbai, Maharashtra', 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600', 
    verified: true, 
    online: true, 
    isStar: true,
    interests: ['Fitness', 'Outdoor', 'Tech', 'Gaming'],
    bio: 'Fitness enthusiast and techie. Looking for gym partners and gaming buddies in Mumbai.',
    rating: 4.7,
    reviewCount: 12,
    availableForRequests: true,
    createdAt: '2026-09-10'
  },
  { 
    id: 'b-4', 
    name: 'Zee', 
    role: 'Client & Buddy', 
    city: 'Mumbai', 
    state: 'Maharashtra',
    location: 'Mumbai, Maharashtra', 
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600', 
    verified: true, 
    online: true, 
    isStar: true,
    interests: ['Nightlife', 'Clubbing', 'Music', 'Events'],
    bio: 'Nightlife enthusiast. Explore Mumbai sea face, rooftop lounges and music festivals.',
    rating: 4.9,
    reviewCount: 22,
    availableForRequests: true,
    createdAt: '2026-08-20'
  },
  { 
    id: 'b-5', 
    name: 'Aniruddha', 
    role: 'Client & Buddy', 
    city: 'Navi Mumbai', 
    state: 'Maharashtra',
    location: 'Navi Mumbai, Maharashtra', 
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600', 
    verified: true, 
    online: true, 
    isStar: true,
    interests: ['Travel', 'Roadtrips', 'Photography'],
    bio: 'Passionate traveller and photographer. Exploring scenic spots and weekend getaways.',
    rating: 4.6,
    reviewCount: 9,
    availableForRequests: true,
    createdAt: '2026-09-12'
  },
  { 
    id: 'b-6', 
    name: 'Bharati Mahale', 
    role: 'Buddy', 
    city: 'Nashik', 
    state: 'Maharashtra',
    location: 'Nashik, Maharashtra', 
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=600', 
    verified: false, 
    online: true, 
    interests: ['Art', 'Reading', 'Nature'],
    bio: 'Art and book lover. Enjoy peaceful nature walks and cultural discussions.',
    rating: 4.5,
    reviewCount: 6,
    availableForRequests: true,
    createdAt: '2026-09-15'
  },
  { 
    id: 'b-7', 
    name: 'Vaibhav Jadhav', 
    role: 'Buddy', 
    city: 'Baramati', 
    state: 'Maharashtra',
    location: 'Baramati, Maharashtra', 
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
    online: true, 
    interests: ['Sports', 'Cricket', 'Gaming'],
    bio: 'Sports freak and casual gamer.',
    rating: 4.3,
    reviewCount: 4,
    availableForRequests: true,
    createdAt: '2026-09-16'
  },
  { 
    id: 'b-8', 
    name: 'Vishakha Sojwal', 
    role: 'Buddy', 
    city: 'Mumbai', 
    state: 'Maharashtra',
    location: 'Mumbai, Maharashtra', 
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600', 
    verified: true, 
    online: true, 
    interests: ['Shopping', 'Fashion', 'Events'],
    bio: 'Fashion enthusiast and shopping buddy. Love discovering local fashion flea markets.',
    rating: 4.9,
    reviewCount: 15,
    availableForRequests: true,
    createdAt: '2026-09-14'
  },
  { 
    id: 'b-9', 
    name: 'Sulakshna Nivate', 
    role: 'Buddy', 
    city: 'Mumbai', 
    state: 'Maharashtra',
    location: 'Mumbai, Maharashtra', 
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    online: true, 
    interests: ['Cooking', 'Food', 'Movies'],
    bio: 'Home chef and movie buff.',
    rating: 4.4,
    reviewCount: 5,
    availableForRequests: true,
    createdAt: '2026-09-16'
  },

  { 
    id: 'b-10', 
    name: 'Harshini', 
    role: 'Buddy', 
    city: 'Coimbatore', 
    state: 'Tamil Nadu',
    location: 'Coimbatore, Tamil Nadu', 
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600', 
    online: true, 
    interests: ['Music', 'Dance', 'Travel'],
    bio: 'Classical music lover and nature explorer.',
    rating: 4.7,
    reviewCount: 11,
    availableForRequests: true,
    createdAt: '2026-09-15'
  },
  { 
    id: 'b-11', 
    name: 'Nandini Singha', 
    role: 'Buddy', 
    city: 'Guwahati', 
    state: 'Assam',
    location: 'Guwahati, Assam', 
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600', 
    online: true, 
    interests: ['Photography', 'Travel', 'Crafts'],
    bio: 'Capturing landscapes and exploring Northeast India.',
    rating: 4.8,
    reviewCount: 16,
    availableForRequests: true,
    createdAt: '2026-09-13'
  },
  { 
    id: 'b-12', 
    name: 'Suman Das', 
    role: 'Buddy', 
    city: 'Kolkata', 
    state: 'West Bengal',
    location: 'Kolkata, West Bengal', 
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600', 
    online: true, 
    interests: ['Food', 'Cafes', 'Reading'],
    bio: 'Kolkata street food tour guide and book lover.',
    rating: 4.6,
    reviewCount: 8,
    availableForRequests: true,
    createdAt: '2026-09-02'
  },
  { 
    id: 'b-13', 
    name: 'Daisy Kalita', 
    role: 'Buddy', 
    city: 'Guwahati', 
    state: 'Assam',
    location: 'Guwahati, Assam', 
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600', 
    verified: true, 
    online: true, 
    interests: ['Fashion', 'Events', 'Music'],
    bio: 'Event organiser and style blogger.',
    rating: 4.9,
    reviewCount: 20,
    availableForRequests: true,
    createdAt: '2026-08-28'
  },
  { 
    id: 'b-14', 
    name: 'Pubali Saikia', 
    role: 'Buddy', 
    city: 'Assam', 
    state: 'Assam',
    location: 'Assam, India', 
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=600', 
    verified: true, 
    online: true, 
    interests: ['Travel', 'Culture', 'Food'],
    bio: 'Exploring traditional crafts and tea gardens.',
    rating: 4.8,
    reviewCount: 13,
    availableForRequests: true,
    createdAt: '2026-09-08'
  }
];

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
      const res = await api.get('/api/user/discover', {
        params: {
          tab: activeTab,
          search: searchQuery || undefined,
          city: cityFilter
        }
      });
      if (res.data?.data?.data && Array.isArray(res.data.data.data) && res.data.data.data.length > 0) {
        setApiBuddies(res.data.data.data);
      }
    } catch (err) {
      console.warn('API discover note, using rich local dataset fallback');
    } finally {
      setLoading(false);
    }
  };

  // Master Filtered Dataset Calculation
  const filteredBuddies = useMemo(() => {
    let dataset = MASTER_BUDDIES;

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
        return [...dataset].sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
      case 'all-india':
        return dataset;
      case 'for-you':
      default:
        return dataset;
    }
  }, [activeTab, searchQuery, selectedLocation, selectedInterest]);

  // Spotlight Buddies (Stars / High Ratings)
  const spotlightBuddies = useMemo(() => {
    return filteredBuddies.filter(b => b.isStar || (b.rating && b.rating >= 4.7)).slice(0, 5);
  }, [filteredBuddies]);

  // Near You Buddies
  const nearYouBuddies = useMemo(() => {
    return filteredBuddies.filter(b => b.city === 'Mumbai' || b.location.includes('Mumbai') || b.city === 'Pune' || b.city === 'Nashik').slice(0, 5);
  }, [filteredBuddies]);

  // Recently Joined Buddies
  const recentlyJoinedBuddies = useMemo(() => {
    return filteredBuddies.slice(5, 10);
  }, [filteredBuddies]);

  // Most Active Buddies
  const mostActiveBuddies = useMemo(() => {
    return filteredBuddies.slice(7, 12);
  }, [filteredBuddies]);

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
        <>
          {/* SECTION 1: Spotlight — Star buddies */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500" size={18} />
                Spotlight — Star buddies
              </h2>
              <span className="text-xs font-bold text-red-500 hover:underline cursor-pointer">
                View All ({spotlightBuddies.length}) &gt;
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(spotlightBuddies.length > 0 ? spotlightBuddies : filteredBuddies.slice(0, 5)).map(renderBuddyCard)}
            </div>
          </section>

          {/* SECTION 2: Near you */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="text-red-500" size={18} />
                Near you {selectedLocation !== 'All Locations' ? `- ${selectedLocation}` : ''}
              </h2>
              <span className="text-xs font-bold text-red-500 hover:underline cursor-pointer">
                View All &gt;
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(nearYouBuddies.length > 0 ? nearYouBuddies : filteredBuddies.slice(0, 5)).map(renderBuddyCard)}
            </div>
          </section>

          {/* SECTION 3: Recently Joined */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={18} />
                Recently Joined
              </h2>
              <span className="text-xs font-bold text-red-500 hover:underline cursor-pointer">
                View All &gt;
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(recentlyJoinedBuddies.length > 0 ? recentlyJoinedBuddies : filteredBuddies.slice(0, 5)).map(renderBuddyCard)}
            </div>
          </section>

          {/* SECTION 4: Most Active */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Flame className="text-red-500 fill-red-500" size={18} />
                Most Active
              </h2>
              <span className="text-xs font-bold text-red-500 hover:underline cursor-pointer">
                View All &gt;
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(mostActiveBuddies.length > 0 ? mostActiveBuddies : filteredBuddies.slice(0, 5)).map(renderBuddyCard)}
            </div>
          </section>
        </>
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
                  {selectedBuddy.bio || 'Love exploring new cafes, outdoor activities and meeting friendly people in the city.'}
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
