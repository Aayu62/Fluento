import { apiClient } from './client';
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
    apiClient.post<AuthResponse>('/auth/register', dto).then((r) => r.data),

  login: (dto: LoginDto) =>
    apiClient.post<AuthResponse>('/auth/login', dto).then((r) => r.data),

  logout: () => apiClient.post('/auth/logout'),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),

  getMe: () => apiClient.get<MeResponse>('/users/me').then((r) => r.data),

  completeOnboarding: (dto: OnboardingDto) =>
    apiClient.post<UserProfile>('/users/onboarding', dto).then((r) => r.data),
};
