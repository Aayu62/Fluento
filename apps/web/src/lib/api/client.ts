import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
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
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post('/api/auth/refresh');

        processQueue(null);
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
