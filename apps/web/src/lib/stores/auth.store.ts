import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserProfile } from '@fluento/shared';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setProfile: (profile: UserProfile) => void;
  clearAuth: () => void;
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) => {
        setCookie('fluento_token', token);
        if (refreshToken) {
          localStorage.setItem('fluento_refresh', refreshToken);
        }
        set({ user, token, isAuthenticated: true });
      },

      setProfile: (profile) => set({ profile }),

      clearAuth: () => {
        deleteCookie('fluento_token');
        localStorage.removeItem('fluento_token');
        localStorage.removeItem('fluento_refresh');
        set({ user: null, profile: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'fluento_auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
