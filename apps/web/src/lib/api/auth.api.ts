import { apiClient } from './client';
import axios from 'axios';
import type { RegisterDto, LoginDto, User, UserProfile, OnboardingDto } from '@fluento/shared';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; fullName: string };
}

interface MeResponse {
  user: User;
  profile: UserProfile | null;
}

export const authApi = {
  register: (dto: RegisterDto) =>
    axios.post<AuthResponse>('/api/auth/register', dto).then((r) => r.data),

  login: (dto: LoginDto) =>
    axios.post<AuthResponse>('/api/auth/login', dto).then((r) => r.data),

  syncGoogleAuth: (accessToken: string, refreshToken?: string) =>
    axios.post<{ success: boolean; user: any }>('/api/auth/sync', { accessToken, refreshToken }).then((r) => r.data),

  logout: () => axios.post('/api/auth/logout'),

  refresh: () =>
    axios.post<{ success: boolean }>('/api/auth/refresh').then((r) => r.data),

  getMe: () => apiClient.get<MeResponse>('/users/me').then((r) => r.data),

  completeOnboarding: (dto: OnboardingDto) =>
    apiClient.post<UserProfile>('/users/onboarding', dto).then((r) => r.data),
};
