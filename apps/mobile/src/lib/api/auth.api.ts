import { apiClient } from './client';
import type { RegisterDto, LoginDto } from '@fluento/shared';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; fullName: string };
}

export const authApi = {
  login: (dto: LoginDto) =>
    apiClient.post<AuthResponse>('/auth/login', dto).then((r) => r.data),
  register: (dto: RegisterDto) =>
    apiClient.post<AuthResponse>('/auth/register', dto).then((r) => r.data),
  syncGoogleAuth: (accessToken: string) =>
    apiClient.post<{ success: boolean; user: any }>('/auth/sync', { accessToken }).then((r) => r.data),
};
