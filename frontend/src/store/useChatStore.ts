import { create } from 'zustand';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  seen: boolean;
}

export interface Chat {
  id: string;
  participants: { id: string; name: string; avatar: string }[];
  lastMessage?: Message;
  unreadCount: number;
}

interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  messages: Record<string, Message[]>;
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chatId: string | null) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessageSeen: (chatId: string, messageId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChat: null,
  messages: {},
  setChats: (chats) => set({ chats }),
  setActiveChat: (activeChat) => set({ activeChat }),
  addMessage: (chatId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: [...(state.messages[chatId] || []), message]
    }
  })),
  updateMessageSeen: (chatId, messageId) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: state.messages[chatId]?.map(m => m.id === messageId ? { ...m, seen: true } : m) || []
    }
  })),
}));
