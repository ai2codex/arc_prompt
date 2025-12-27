'use client';

import { create } from 'zustand';

import type { SessionUser } from '@/features/auth/types';

type AuthUserState = {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  clearUser: () => void;
};

export const useAuthUserStore = create<AuthUserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export function setAuthUser(user: SessionUser | null) {
  useAuthUserStore.getState().setUser(user);
}

export function clearAuthUser() {
  useAuthUserStore.getState().clearUser();
}
