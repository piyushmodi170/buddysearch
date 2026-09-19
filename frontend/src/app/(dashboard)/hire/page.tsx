'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  User, 
  MapPin, 
  Calendar, 
  ThumbsUp, 
  Send, 
  MoreVertical, 
  Star, 
  CheckCircle2, 
  X, 
  Bell, 
  Clock,
  Check,
  DollarSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

interface HirePost {
  id: string;
  name: string;
  avatar: string;
  isStar?: boolean;
  isVerified?: boolean;
  location: string;
  date: string;
  type: 'I need a buddy' | "I'm a buddy";
  title: string;
  category: string;
  description: string;
  priceType: 'BUDGET' | 'RATE';
  price: number;
}

const HIRE_POSTS: HirePost[] = [
  {
    id: 'hp-sajal',
    name: 'Sajal Srivastav',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    location: 'LUCKNOW, Uttar Pradesh',
    date: '15 Sept',
    type: 'I need a buddy',
    title: 'Need cafe buddy for anytime',
    category: 'Cafe Buddy',
    description: "☕ Café Plan: Small modern café\n⏰ Time: 8 AM–10 PM\n📍 Location: Anywhere where you feel comfortable\n🍔 Anything: Coffee, snacks, Wi-Fi, comfortable seating, music...",
    priceType: 'BUDGET',
    price: 1000
  },
  {
    id: 'hp-pankaj',
    name: 'Pankaj',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    isStar: true,
    location: 'Lucknow, Uttar Pradesh',
    date: '15 Sept',
    type: 'I need a buddy',
    title: 'Movie dinner',
    category: 'Nightout Buddy',
    description: "Normallly we go for chill party n watching movies dinner . Any good vibes positive perosn humble good looking any cute girl",
    priceType: 'BUDGET',
    price: 5000
  },
  {
    id: 'hp-lonewolf',
    name: 'Lonewolf',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    isStar: true,
    location: 'Lucknow, Uttar Pradesh',
    date: '15 Sept',
    type: 'I need a buddy',
    title: 'Chat friend required',
    category: 'Chat Buddy',
    description: "Looking for an empathetic and friendly chat buddy for daily evening catchups and sharing thoughts.",
    priceType: 'BUDGET',
    price: 300
  },
  {
    id: 'hp-abhishek',
    name: 'Abhishek Prajapati',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    isStar: true,
    location: 'Mumbai, Maharashtra',
    date: '16 Sept',
    type: 'I need a buddy',
    title: "Need a Partner For Garba and Dandia so let's Rock",
    category: 'City Explorer Buddy',
    description: "🪔💃 Navratri Alert! 💃🪔\nLooking for a Garba/Dandiya partner for this Navratri! 💃🕺\nSomeone who can match my energy for the fast beats, doesn't mind a little crowd, and wants to dance the night away.",
    priceType: 'BUDGET',
    price: 700
  },
  {
    id: 'hp-manish',
    name: 'Manish Verma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    isVerified: true,
    location: 'Mumbai, Maharashtra',
    date: '16 Sept',
    type: "I'm a buddy",
    title: 'Available for anything you want.',
    category: 'Cafe Buddy',
    description: "Looking for someone to share the little moments and make them special. Whether it's going on walks, shopping, exploring cafés, watching a movie, or simply having great conversations over coffee.",
    priceType: 'RATE',
    price: 1000
  }
];

export default function HirePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'All' | 'I need a buddy' | "I'm a buddy">('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  
  // Interactive States
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>(['hp-sajal']);
  const [showToast, setShowToast] = useState<boolean>(true);

  // Modal States
  const [counterPost, setCounterPost] = useState<HirePost | null>(null);
  const [counterOfferAmount, setCounterOfferAmount] = useState<string>('');
  const [counterNote, setCounterNote] = useState<string>('');

  const [requestPost, setRequestPost] = useState<HirePost | null>(null);
  const [requestNote, setRequestNote] = useState<string>('');

  // PWA Prompt
  const [showPWA, setShowPWA] = useState(true);

  // Toggle see more
  const toggleExpand = (id: string) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter(i => i !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  // Toggle Like
  const handleLike = (id: string) => {
    if (likedIds.includes(id)) {
      setLikedIds(likedIds.filter(i => i !== id));
    } else {
      setLikedIds([...likedIds, id]);
      toast.success('Post liked!');
    }
  };

  // Send Direct Request
  const handleSendDirectRequest = (postId: string, name: string) => {
    if (!pendingIds.includes(postId)) {
      setPendingIds([...pendingIds, postId]);
    }
    setShowToast(true);
    setRequestPost(null);
    setRequestNote('');
    toast.success('Request sent successfully!');
  };

  // Send Proposal (Counter)
  const handleSendCounterProposal = () => {
    if (!counterOfferAmount || Number(counterOfferAmount) <= 0) {
      toast.error('Please enter a valid rate');
      return;
    }
    if (counterPost && !pendingIds.includes(counterPost.id)) {
      setPendingIds([...pendingIds, counterPost.id]);
    }
    localStorage.setItem('buddysearch_active_proposal', JSON.stringify({
      amount: counterOfferAmount,
      name: counterPost?.name
    }));
    setShowToast(true);
    setCounterPost(null);
    setCounterOfferAmount('');
    setCounterNote('');
    toast.success(`Proposal sent to ${counterPost?.name}! Opening chat...`);
    router.push('/messages');
  };


  // Filter Posts
  const filteredPosts = HIRE_POSTS.filter(post => {
    if (activeTab !== 'All' && post.type !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.name.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto pb-24 relative">
      
      {/* 1. TOP SEARCH BAR */}
      <div className="bg-[#F8F9FA] border border-gray-200 rounded-2xl p-2.5 shadow-sm mb-4">
        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-red-400 transition-all">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-200">
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'} 
              alt="User Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <input 
            type="text" 
            placeholder="What kind of buddy do you need?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
          />
        </div>

        {/* 2. FILTER TABS */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            onClick={() => setActiveTab('All')}
            className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'All'
                ? 'bg-[#2B3445] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All
          </button>

          <button
            onClick={() => setActiveTab('I need a buddy')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'I need a buddy'
                ? 'bg-[#2B3445] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Search size={13} />
            I need a buddy
          </button>

          <button
            onClick={() => setActiveTab("I'm a buddy")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "I'm a buddy"
                ? 'bg-[#2B3445] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <User size={13} />
            I'm a buddy
          </button>
        </div>
      </div>

      {/* 3. CARDS FEED */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isExpanded = expandedIds.includes(post.id);
          const isLiked = likedIds.includes(post.id);
          const isPending = pendingIds.includes(post.id);

          return (
            <Card key={post.id} className="p-5 border border-gray-200 shadow-sm rounded-2xl hover:shadow-md transition-all bg-white">
              
              {/* User Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200">
                      <img src={post.avatar} alt={post.name} className="w-full h-full object-cover" />
                    </div>
                    {post.isStar && (
                      <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 border border-white shadow-sm">
                        <Star size={10} className="fill-white" />
                      </div>
                    )}
                    {post.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border border-white shadow-sm">
                        <CheckCircle2 size={10} className="fill-white" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{post.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-0.5">
                      <MapPin size={12} className="text-gray-400" />
                      <span>{post.location}</span>
                      <span>·</span>
                      <Calendar size={12} className="text-gray-400" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                    post.type === 'I need a buddy'
                      ? 'bg-red-50 text-red-500 border-red-200'
                      : 'bg-pink-50 text-pink-600 border-pink-200'
                  }`}>
                    {post.type}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Title & Category */}
              <div className="mb-2">
                <h3 className="text-base font-bold text-gray-900 leading-snug">{post.title}</h3>
                <span className="text-xs font-semibold text-red-500 block mt-1">
                  {post.category}
                </span>
              </div>

              {/* Description */}
              <div className="text-xs text-gray-600 leading-relaxed mb-4">
                <p className={`whitespace-pre-line ${!isExpanded ? 'line-clamp-2' : ''}`}>
                  {post.description}
                </p>
                {post.description.length > 80 && (
                  <button 
                    onClick={() => toggleExpand(post.id)}
                    className="text-red-500 font-bold hover:underline text-xs mt-1 inline-block"
                  >
                    {isExpanded ? 'See less' : 'See more'}
                  </button>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                
                {/* Price Display */}
                <div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider block uppercase">
                    {post.priceType}
                  </span>
                  <span className="text-base font-extrabold text-gray-900">
                    ₹{post.price.toLocaleString()}
                  </span>
                </div>

                {/* Counter & Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCounterPost(post);
                      setCounterOfferAmount(String(post.price));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <Search size={13} className="text-gray-500" />
                    <span>₹ Counter</span>
                  </button>

                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold transition-all ${
                      isLiked 
                        ? 'bg-red-50 border-red-300 text-red-500' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <ThumbsUp size={14} className={isLiked ? 'fill-red-500' : ''} />
                    {isLiked && <span>1</span>}
                  </button>

                  {/* Send Request vs Pending Button State */}
                  {isPending ? (
                    <div className="border border-amber-300 bg-amber-50/70 text-amber-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-600" />
                      <span>Pending...</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleSendDirectRequest(post.id, post.name)}
                      className="bg-[#F04438] hover:bg-[#D92D20] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <Send size={13} />
                      Send Request
                    </Button>
                  )}
                </div>

              </div>
            </Card>
          );
        })}
      </div>

      {/* 4. FLOATING PWA INSTALL PROMPT & SUCCESS TOAST */}
      <div className="fixed bottom-6 right-6 space-y-3 z-50">
        
        {/* Request Sent Toast Notification */}
        {showToast && (
          <div className="bg-[#E6F4EA] border border-emerald-300 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 w-80">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check size={12} />
              </div>
              <span>Request sent successfully!</span>
            </div>
            <button onClick={() => setShowToast(false)} className="text-emerald-600 hover:text-emerald-800">
              <X size={14} />
            </button>
          </div>
        )}

        {/* PWA Prompt Card */}
        {showPWA && (
          <div className="w-80 bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-md font-extrabold text-lg shrink-0">
                  🔍
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-xs">Add BuddySearch to your Home Screen</h5>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Faster access, offline support & chat notifications</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPWA(false)} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2 mt-4">
              <button 
                onClick={() => {
                  toast.success('App added to Home Screen!');
                  setShowPWA(false);
                }}
                className="w-full bg-[#F04438] hover:bg-[#D92D20] text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all"
              >
                Add to Home Screen
              </button>

              <button 
                onClick={() => {
                  toast.success('Notifications enabled!');
                  setShowPWA(false);
                }}
                className="w-full bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Bell size={13} />
                Enable Notifications Only
              </button>

              <button 
                onClick={() => setShowPWA(false)}
                className="w-full text-center text-[11px] text-gray-400 hover:text-gray-600 font-medium pt-1 block"
              >
                Not Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. COUNTER OFFER MODAL ("Counter This Price") */}
      {counterPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold text-lg">₹</span>
                <h3 className="font-extrabold text-gray-900 text-base">Counter This Price</h3>
              </div>
              <button onClick={() => setCounterPost(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {/* Client's Budget Green Banner */}
            <div className="bg-[#E6F4EA] border border-emerald-200 text-emerald-800 rounded-2xl p-3.5 mb-4 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                ₹
              </div>
              <span className="text-xs font-semibold">
                Client's budget: <span className="font-extrabold text-sm text-emerald-900">₹{counterPost.price.toLocaleString()}</span>
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Your Rate (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={counterOfferAmount}
                    onChange={(e) => setCounterOfferAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full pl-8 pr-4 py-2.5 border border-red-300 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5 flex items-center gap-1">
                  <span>💬</span> Note (optional)
                </label>
                <textarea
                  rows={3}
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder="E.g. I can do this in 2 hours, experienced in this area..."
                  className="w-full p-3 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleSendCounterProposal} 
                  className="flex-1 bg-[#F04438] hover:bg-[#D92D20] text-white rounded-2xl text-xs font-bold py-3 shadow-md"
                >
                  Send Proposal
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCounterPost(null)} 
                  className="flex-1 border-red-300 text-red-500 hover:bg-red-50 rounded-2xl text-xs font-bold py-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
