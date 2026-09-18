import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fluento_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const originalRequest = (error as any).config;

    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('fluento_refresh');
      if (!refreshToken) {
        processQueue(new Error('No refresh token'), null);
        isRefreshing = false;
        localStorage.removeItem('fluento_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        localStorage.setItem('fluento_token', newAccessToken);
        localStorage.setItem('fluento_refresh', newRefreshToken);
        
        // Also update cookie for middleware
        const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
        document.cookie = `fluento_token=${newAccessToken}; expires=${expires}; path=/; SameSite=Lax`;

        apiClient.defaults.headers['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

        processQueue(null, newAccessToken);
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem('fluento_token');
        localStorage.removeItem('fluento_refresh');
        document.cookie = `fluento_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
