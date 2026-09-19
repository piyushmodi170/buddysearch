import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  mobileNavVisible: boolean;
  modals: Record<string, boolean>;
  toggleSidebar: () => void;
  setMobileNavVisible: (visible: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  mobileNavVisible: true,
  modals: {},
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileNavVisible: (visible) => set({ mobileNavVisible: visible }),
  openModal: (modalId) => set((state) => ({ modals: { ...state.modals, [modalId]: true } })),
  closeModal: (modalId) => set((state) => ({ modals: { ...state.modals, [modalId]: false } })),
}));
