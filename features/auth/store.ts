'use client';

import { create } from 'zustand';

type AuthModalState = {
  open: boolean;
  message: string | null;
  openModal: (message?: string | null) => void;
  closeModal: () => void;
};

export const useAuthModalStore = create<AuthModalState>((set) => ({
  open: false,
  message: null,
  openModal: (message) => set({ open: true, message: message ?? null }),
  closeModal: () => set({ open: false, message: null }),
}));

export function openAuthModal(message?: string | null) {
  useAuthModalStore.getState().openModal(message);
}

export function closeAuthModal() {
  useAuthModalStore.getState().closeModal();
}
