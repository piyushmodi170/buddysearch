import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  googleId?: string;
  role: 'CLIENT' | 'BUDDY' | 'BOTH';
  avatar?: string;
  bio?: string;
  city?: string;
  state?: string;
  pincode?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  membership?: string;
  membershipPlan?: string;
  membershipExpiry?: string | Date | null;
  onboardingCompleted?: boolean;
  gender?: string;
  isAdmin?: boolean;
  verified?: boolean;
  aadhaarUrl?: string;
  aadhaarVerified?: boolean;
  availableForRequests?: boolean;
  profileCompletion?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (partial) => set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
