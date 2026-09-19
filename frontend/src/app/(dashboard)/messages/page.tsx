'use client';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Trash2,
  Send,
  CheckCheck,
  X,
  ArrowLeft,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { getSocket } from '@/lib/socket';
import { encodeRateOffer, formatChatTime, parseRateOffer, previewMessage } from '@/lib/messageText';

interface ThreadMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  seen?: boolean;
}

interface ChatRow {
  id: string;
  name: string;
  avatar?: string;
  lastSeen?: string;
  isOnline?: boolean;
  lastMessage: string;
  time: string;
  unreadCount: number;
  otherId?: string;
}

function mapChatRow(raw: any, meId?: string): ChatRow {
  const other = raw.user1Id === meId ? raw.user2 : raw.user1;
  const last = raw.messages?.[0] || raw.lastMessage;
  return {
    id: raw.id,
    name: other?.name || 'Buddy',
    avatar: other?.avatar,
    lastSeen: other?.lastSeen,
    isOnline: other?.isOnline,
    lastMessage: previewMessage(last?.text),
    time: formatChatTime(last?.createdAt || raw.lastMessageAt),
    unreadCount: raw.unreadCount || 0,
    otherId: other?.id,
  };
}

function lastSeenLabel(chat?: ChatRow) {
  if (!chat) return '';
  if (chat.isOnline) return 'Online now';
  if (!chat.lastSeen) return 'Offline';
  const date = new Date(chat.lastSeen);
  if (Number.isNaN(date.getTime())) return 'Offline';
  return `Last seen ${date.toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}`;
}

function MessagesPageInner() {
  const searchParams = useSearchParams();
  const me = useAuthStore((state) => state.user);
  const storeChats = useChatStore((state) => state.chats);
  const setChats = useChatStore((state) => state.setChats);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const storeMessages = useChatStore((state) => state.messages);

  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('200');
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const chats: ChatRow[] = useMemo(
    () => (storeChats.length ? storeChats.map((chat: any) => mapChatRow(chat, me?.id)) : []),
    [storeChats, me?.id]
  );

  const loadChats = useCallback(async () => {
    const res = await api.get('/api/chats');
    const data = Array.isArray(res.data?.data) ? res.data.data : [];
    setChats(data);
    return data;
  }, [setChats]);

  const openChat = useCallback(async (chatId: string, join = true) => {
    setActiveChatId(chatId);
    setActiveChat(chatId);
    setMobileThreadOpen(true);
    try {
      const res = await api.get(`/api/chats/${chatId}/messages`, { params: { limit: 100 } });
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      setMessages(chatId, [...rows].reverse());
      await api.put(`/api/chats/${chatId}/seen`).catch(() => undefined);
      if (join) {
        getSocket().emit('join_chat', chatId);
      }
    } catch {
      toast.error('Could not load this conversation');
    }
  }, [setActiveChat, setMessages]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await loadChats();
        if (cancelled) return;
        const userId = searchParams.get('user');
        const chatId = searchParams.get('chat');
        if (userId) {
          const created = await api.post('/api/chats', { userId });
          const chat = created.data?.data;
          if (chat?.id) {
            await loadChats();
            await openChat(chat.id);
          }
        } else if (chatId) {
          await openChat(chatId);
        } else if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches && data[0]?.id) {
          await openChat(data[0].id);
        }
      } catch {
        setChats([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadChats, openChat, searchParams, setChats]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const thread: ThreadMessage[] = activeChatId ? (storeMessages[activeChatId] || []) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length, activeChatId]);

  const sendText = async (text: string) => {
    if (!activeChatId || !text.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/api/chats/${activeChatId}/messages`, { text: text.trim() });
      const msg = res.data?.data;
      if (msg) addMessage(activeChatId, msg);
    } catch {
      toast.error('Message could not be sent');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const text = inputMessage.trim();
    setInputMessage('');
    await sendText(text);
  };

  const handleSendRateOffer = async () => {
    if (!offerAmount || Number(offerAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    await sendText(encodeRateOffer(Number(offerAmount)));
    setShowOfferModal(false);
    toast.success(`Rate offer of ₹${offerAmount} sent`);
  };

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadTotal = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);

  const listPane = (
    <div className={`w-full md:w-80 border-r border-gray-200 flex-col bg-white shrink-0 ${mobileThreadOpen ? 'hidden md:flex' : 'flex'} h-full`}>
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold text-gray-900">Chats</h2>
          {unreadTotal > 0 && (
            <span className="min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
              {unreadTotal}
            </span>
          )}
        </div>
        <button className="text-gray-400 p-1" aria-label="Delete chats" disabled>
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-3 border-b border-gray-100 bg-[#F8F9FA]">
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="animate-spin" size={22} />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <MessageSquare className="mx-auto mb-3 text-gray-300" size={36} />
            <h3 className="font-bold text-gray-900 mb-1">No messages yet</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              When you chat with a buddy, conversations appear here. New accounts start with an empty inbox.
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <button
                type="button"
                key={chat.id}
                onClick={() => openChat(chat.id)}
                className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors border-b border-gray-50 relative ${
                  isActive ? 'bg-red-50/40 border-l-2 border-red-500' : 'hover:bg-gray-50 border-l-2 border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    {chat.avatar ? (
                      <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                    ) : (
                      chat.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5 gap-2">
                    <h4 className="text-sm font-bold truncate text-gray-900">{chat.name}</h4>
                    <span className="text-[10px] text-gray-400 shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate font-medium">{chat.lastMessage}</p>
                </div>
                {chat.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {chat.unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full min-h-0 bg-white md:rounded-2xl md:border md:border-gray-200 md:shadow-sm flex overflow-hidden">
      {listPane}

      <div className={`flex-1 flex-col bg-[#F8F9FA] relative min-w-0 ${mobileThreadOpen || activeChat ? 'flex' : 'hidden md:flex'} h-full`}>
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <MessageSquare className="text-gray-300 mb-3" size={40} />
            <h3 className="font-bold text-gray-900">Select a chat</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">Your real conversations will show here after you message someone.</p>
          </div>
        ) : (
          <>
            <div className="min-h-14 border-b border-gray-200 px-3 sm:px-6 py-2 flex items-center justify-between bg-white shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  className="md:hidden p-2 -ml-1 text-gray-600"
                  onClick={() => {
                    setMobileThreadOpen(false);
                    setActiveChat(null);
                    setActiveChatId(null);
                  }}
                  aria-label="Back to chats"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                  {activeChat.avatar ? (
                    <img src={activeChat.avatar} alt={activeChat.name} className="w-full h-full object-cover" />
                  ) : (
                    activeChat.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-gray-900 text-sm truncate">{activeChat.name}</h3>
                  <span className="text-[11px] text-gray-400 font-medium block leading-tight truncate">{lastSeenLabel(activeChat)}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {thread.length === 0 ? (
                <p className="text-center text-xs text-gray-400 pt-8">No messages in this chat yet. Say hello.</p>
              ) : (
                thread.map((msg) => {
                  const isMe = msg.senderId === me?.id;
                  const amount = parseRateOffer(msg.text);
                  if (amount) {
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} my-2`}>
                        <div className="bg-[#F04438] text-white p-4 rounded-3xl shadow-md max-w-[85%] w-64">
                          <span className="text-[10px] font-extrabold tracking-wider uppercase block text-white/90 mb-1">
                            RATE OFFER
                          </span>
                          <div className="text-2xl font-black mb-2 tracking-tight">
                            ₹{amount} <span className="text-xs font-bold text-white/80">INR</span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="bg-white/20 text-white rounded-full px-3 py-0.5 text-xs font-bold">Pending</span>
                            <span className="text-[10px] text-white/80 font-medium flex items-center gap-1">
                              {formatChatTime(msg.createdAt)}
                              {isMe && <CheckCheck size={14} className="text-white" />}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} my-1`}>
                      <div className={`max-w-[85%] md:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-xs ${
                        isMe
                          ? 'bg-[#F04438] text-white rounded-tr-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
                      }`}>
                        <p className="leading-relaxed font-medium break-words">{msg.text}</p>
                        <span className={`text-[9px] mt-1 block text-right font-semibold ${isMe ? 'text-white/80' : 'text-gray-400'}`}>
                          {formatChatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                onClick={() => setShowOfferModal(true)}
                className="w-9 h-9 rounded-full bg-pink-100 text-red-500 hover:bg-pink-200 flex items-center justify-center font-black text-sm shrink-0"
                title="Send Rate Offer"
              >
                ₹
              </button>
              <input
                type="text"
                placeholder="Type a message.."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sending}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md shrink-0 ${
                  inputMessage.trim() ? 'bg-[#F04438] hover:bg-[#D92D20]' : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </>
        )}
      </div>

      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-sm">Send Rate Offer</h3>
              <button onClick={() => setShowOfferModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Offer Rate (₹ INR)</label>
            <div className="relative mb-4">
              <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">₹</span>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="200"
                className="w-full pl-8 pr-4 py-2 border border-red-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSendRateOffer} className="flex-1 bg-[#F04438] text-white rounded-xl text-xs font-bold py-2.5">
                Send Offer Card
              </button>
              <button onClick={() => setShowOfferModal(false)} className="flex-1 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold py-2.5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center text-gray-400">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <MessagesPageInner />
    </Suspense>
  );
}
