import { create } from 'zustand';
import type { User, UserProfile } from '@fluento/shared';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setProfile: (profile: UserProfile) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  profile: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
  setProfile: (profile) => set({ profile }),
  clearAuth: () => set({ user: null, profile: null, token: null, isAuthenticated: false }),
}));
