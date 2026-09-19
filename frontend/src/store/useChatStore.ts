import { create } from 'zustand';

export interface Message {
  id: string;
  chatId?: string;
  senderId: string;
  text: string;
  createdAt: string;
  seen: boolean;
}

export interface Chat {
  id: string;
  participants: { id: string; name: string; avatar?: string; isOnline?: boolean; lastSeen?: string }[];
  lastMessage?: Message;
  lastMessageAt?: string | null;
  unreadCount: number;
}

interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  messages: Record<string, Message[]>;
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chatId: string | null) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessageSeen: (chatId: string, messageId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChat: null,
  messages: {},
  setChats: (chats) => set({ chats }),
  setActiveChat: (activeChat) => set({ activeChat }),
  setMessages: (chatId, messages) => set((state) => ({
    messages: { ...state.messages, [chatId]: messages }
  })),
  addMessage: (chatId, message) => set((state) => {
    const existing = state.messages[chatId] || [];
    if (existing.some((item) => item.id === message.id)) {
      return state;
    }
    const nextMessages = [...existing, message];
    return {
      messages: { ...state.messages, [chatId]: nextMessages },
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: message,
              lastMessageAt: message.createdAt,
              unreadCount: chat.id === state.activeChat ? 0 : chat.unreadCount + 1,
            }
          : chat
      ),
    };
  }),
  updateMessageSeen: (chatId, messageId) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: state.messages[chatId]?.map((m) => m.id === messageId ? { ...m, seen: true } : m) || []
    }
  })),
}));
