'use client';
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Eye, 
  Bell, 
  Flag, 
  Ban, 
  Send, 
  Smile, 
  CheckCheck, 
  Star, 
  CheckCircle2, 
  Clock, 
  X,
  IndianRupee,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: 'me' | 'them';
  type: 'text' | 'rate_offer';
  content?: string;
  amount?: number;
  currency?: string;
  status?: 'Pending' | 'Accepted' | 'Rejected';
  time: string;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastSeen: string;
  isStar?: boolean;
  isVerified?: boolean;
  lastMessage: string;
  time: string;
  hasOffer?: boolean;
  messages: Message[];
}

const INITIAL_CHATS: Chat[] = [
  {
    id: 'c-sajal',
    name: 'Sajal Srivastav',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    lastSeen: 'Last Seen 1h Ago',
    lastMessage: 'Rate offer',
    time: '01:17 PM',
    hasOffer: true,
    messages: [
      {
        id: 'm-1',
        sender: 'me',
        type: 'rate_offer',
        amount: 200,
        currency: 'INR',
        status: 'Pending',
        time: '01:17 PM'
      }
    ]
  },
  {
    id: 'c-abhishek',
    name: 'Abhishek Prajapati',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    isStar: true,
    lastSeen: 'Online now',
    lastMessage: 'Hello',
    time: '05:11 AM',
    messages: [
      { id: 'm-20', sender: 'them', type: 'text', content: 'Hey there! Are you up for Garba this evening?', time: '05:10 AM' },
      { id: 'm-21', sender: 'me', type: 'text', content: 'Hello! Yes absolutely, let us coordinate timings.', time: '05:11 AM' }
    ]
  },
  {
    id: 'c-saavi',
    name: 'Saavi chavan',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
    lastSeen: 'Last Seen 3h Ago',
    lastMessage: 'hello',
    time: '08:28 PM',
    messages: [
      { id: 'm-30', sender: 'them', type: 'text', content: 'hello', time: '08:28 PM' }
    ]
  },
  {
    id: 'c-siddhi',
    name: 'Siddhi',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300',
    lastSeen: 'Last Seen 12h Ago',
    lastMessage: 'hello can we meet',
    time: '09:27 PM',
    messages: [
      { id: 'm-40', sender: 'them', type: 'text', content: 'hello can we meet', time: '09:27 PM' }
    ]
  }
];

export default function MessagesPage() {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>('c-sajal');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  // Rate offer modal inside chat
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('200');

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  // Read proposal state passed from Hire Page if available
  useEffect(() => {
    const activeProposalStr = localStorage.getItem('buddysearch_active_proposal');
    if (activeProposalStr) {
      try {
        const propData = JSON.parse(activeProposalStr);
        if (propData && propData.amount) {
          // Add new offer message to active chat
          const newMsg: Message = {
            id: `m-prop-${Date.now()}`,
            sender: 'me',
            type: 'rate_offer',
            amount: Number(propData.amount),
            currency: 'INR',
            status: 'Pending',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChats(prev => prev.map(c => {
            if (c.id === 'c-sajal') {
              return {
                ...c,
                lastMessage: 'Rate offer',
                time: newMsg.time,
                messages: [...c.messages, newMsg]
              };
            }
            return c;
          }));
        }
      } catch (err) {
        console.warn('Failed parsing active proposal');
      } finally {
        localStorage.removeItem('buddysearch_active_proposal');
      }
    }
  }, []);

  // Send Text Message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'me',
      type: 'text',
      content: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          lastMessage: inputMessage.trim(),
          time: newMsg.time,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    setInputMessage('');
  };

  // Send Rate Offer from Chat
  const handleSendRateOffer = () => {
    if (!offerAmount || Number(offerAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const newMsg: Message = {
      id: `m-offer-${Date.now()}`,
      sender: 'me',
      type: 'rate_offer',
      amount: Number(offerAmount),
      currency: 'INR',
      status: 'Pending',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          lastMessage: 'Rate offer',
          time: newMsg.time,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    setShowOfferModal(false);
    toast.success(`Rate offer of ₹${offerAmount} sent!`);
  };

  // Filtered Chats Sidebar
  const filteredChats = chats.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-6rem)] bg-white rounded-2xl border border-gray-200 shadow-sm flex overflow-hidden">
      
      {/* 1. LEFT CHATS SIDEBAR */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white shrink-0">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-gray-900">Chats</h2>
            <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
              {chats.length}
            </span>
          </div>
          <button className="text-gray-400 hover:text-red-500 p-1 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-gray-100 bg-[#F8F9FA]">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Chat Items List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;

            return (
              <div 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors border-b border-gray-50 relative ${
                  isActive ? 'bg-red-50/40 border-l-2 border-red-500' : 'hover:bg-gray-50 border-l-2 border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                    <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                  </div>
                  {chat.isStar && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 border border-white">
                      <Star size={9} className="fill-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={`text-xs font-bold truncate ${isActive ? 'text-gray-900' : 'text-gray-800'}`}>
                      {chat.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 shrink-0">{chat.time}</span>
                  </div>

                  <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 font-medium">
                    <span className="text-gray-400 text-[10px]">✔</span>
                    {chat.hasOffer && <span className="text-xs">💰</span>}
                    <span>{chat.lastMessage}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-[#F8F9FA] relative">
        
        {/* Top Chat Header matching Reference Image */}
        <div className="h-14 border-b border-gray-200 px-6 flex items-center justify-between bg-white shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shrink-0">
              <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm">{activeChat.name}</h3>
              <span className="text-[11px] text-gray-400 font-medium block leading-tight">{activeChat.lastSeen}</span>
            </div>
          </div>

          {/* Action Icon Buttons */}
          <div className="flex items-center gap-3 text-gray-400">
            <button className="p-1.5 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <Search size={16} />
            </button>
            <button className="p-1.5 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <Eye size={16} />
            </button>
            <button className="p-1.5 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={16} />
            </button>
            <button className="p-1.5 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <Flag size={16} />
            </button>
            <button className="p-1.5 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <Ban size={16} />
            </button>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          
          {/* Centered Date Divider */}
          <div className="text-center">
            <span className="text-[11px] font-bold text-gray-400 bg-white/70 backdrop-blur-xs px-3 py-1 rounded-full border border-gray-200">
              Today
            </span>
          </div>

          {activeChat.messages.map((msg) => {
            const isMe = msg.sender === 'me';

            if (msg.type === 'rate_offer') {
              return (
                <div key={msg.id} className="flex justify-end my-2">
                  
                  {/* RED RATE OFFER BUBBLE CARD matching Screenshot 1 */}
                  <div className="bg-[#F04438] text-white p-4 rounded-3xl shadow-md max-w-xs w-64 relative overflow-hidden">
                    <span className="text-[10px] font-extrabold tracking-wider uppercase block text-white/90 mb-1">
                      RATE OFFER
                    </span>

                    <div className="text-2xl font-black mb-2 tracking-tight">
                      ₹{msg.amount} <span className="text-xs font-bold text-white/80">{msg.currency || 'INR'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="bg-white/20 text-white rounded-full px-3 py-0.5 text-xs font-bold backdrop-blur-xs">
                        {msg.status || 'Pending'}
                      </span>
                      <span className="text-[10px] text-white/80 font-medium flex items-center gap-1">
                        {msg.time}
                        <CheckCheck size={14} className="text-white" />
                      </span>
                    </div>
                  </div>

                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} my-1`}>
                <div className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl text-xs shadow-xs ${
                  isMe 
                    ? 'bg-[#F04438] text-white rounded-tr-xs' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs'
                }`}>
                  <p className="leading-relaxed font-medium">{msg.content}</p>
                  <span className={`text-[9px] mt-1 block text-right font-semibold ${isMe ? 'text-white/80' : 'text-gray-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. INPUT FOOTER BAR */}
        <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
          
          {/* Rate Offer Button (Pink ₹ button) */}
          <button
            onClick={() => setShowOfferModal(true)}
            className="w-9 h-9 rounded-full bg-pink-100 text-red-500 hover:bg-pink-200 flex items-center justify-center font-black text-sm shrink-0 transition-colors shadow-xs"
            title="Send Rate Offer"
          >
            ₹
          </button>

          {/* Emoji Picker Button (Yellow 😄 button) */}
          <button
            onClick={() => setInputMessage(prev => prev + ' 😊')}
            className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center font-bold text-base shrink-0 transition-colors shadow-xs"
            title="Add Emoji"
          >
            😄
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder="Type a message.."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-400 transition-all"
          />

          {/* Red Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all shadow-md shrink-0 ${
              inputMessage.trim() ? 'bg-[#F04438] hover:bg-[#D92D20]' : 'bg-red-300 cursor-not-allowed'
            }`}
          >
            <Send size={15} />
          </button>
        </div>

      </div>

      {/* 4. SEND RATE OFFER MODAL INSIDE CHAT */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                <span className="text-red-500 font-bold">₹</span> Send Rate Offer
              </h3>
              <button onClick={() => setShowOfferModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Offer Rate (₹ INR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="200"
                    className="w-full pl-8 pr-4 py-2 border border-red-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSendRateOffer}
                  className="flex-1 bg-[#F04438] hover:bg-[#D92D20] text-white rounded-xl text-xs font-bold py-2.5 shadow-sm"
                >
                  Send Offer Card
                </button>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-bold py-2.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
