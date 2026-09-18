import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
});

export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

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

      // We need to fetch the refresh token from the auth store somehow, 
      // but since it's a zustand store, we can dynamically import it or use AsyncStorage directly.
      // Let's use AsyncStorage directly to avoid circular dependency
      let refreshToken = null;
      try {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        const authDataStr = await AsyncStorage.getItem('fluento_auth');
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          refreshToken = authData?.state?.refreshToken;
        }
      } catch (e) {
        // Ignore
      }

      if (!refreshToken) {
        processQueue(new Error('No refresh token'), null);
        isRefreshing = false;
        setAuthToken(null);
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' } }
        );

        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        try {
          const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
          const authDataStr = await AsyncStorage.getItem('fluento_auth');
          if (authDataStr) {
            const authData = JSON.parse(authDataStr);
            authData.state.token = newAccessToken;
            authData.state.refreshToken = newRefreshToken;
            await AsyncStorage.setItem('fluento_auth', JSON.stringify(authData));
          }
        } catch (e) {
          // Ignore
        }

        setAuthToken(newAccessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

        processQueue(null, newAccessToken);
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        setAuthToken(null);
        
        try {
          const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
          const authDataStr = await AsyncStorage.getItem('fluento_auth');
          if (authDataStr) {
            const authData = JSON.parse(authDataStr);
            authData.state.token = null;
            authData.state.refreshToken = null;
            authData.state.isAuthenticated = false;
            await AsyncStorage.setItem('fluento_auth', JSON.stringify(authData));
          }
        } catch(e) {}

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
