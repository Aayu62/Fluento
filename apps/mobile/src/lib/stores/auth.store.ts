import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';
import type { User, UserProfile } from '@fluento/shared';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setProfile: (profile: UserProfile) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, token, refreshToken) => set({ user, token, refreshToken, isAuthenticated: true }),
      setProfile: (profile) => set({ profile }),
      clearAuth: async () => {
        // Try to delete push token before clearing
        try {
          const pushTokenStr = await AsyncStorage.getItem('expo_push_token');
          if (pushTokenStr) {
            await apiClient.delete(`/notifications/push-token/${pushTokenStr}`);
            await AsyncStorage.removeItem('expo_push_token');
          }
        } catch (e) {}

        set({ user: null, profile: null, token: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'fluento_auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token, refreshToken: state.refreshToken, user: state.user }),
    }
  )
);
