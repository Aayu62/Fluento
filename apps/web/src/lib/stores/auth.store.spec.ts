import { useAuthStore } from './auth.store';

// Mock localStorage for node environment
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('useAuthStore (Web)', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('initializes with null user and unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('sets authentication state properly', () => {
    const mockUser = {
      id: 'user-web-1',
      email: 'web@fluento.app',
      fullName: 'Web User',
      createdAt: '2026-09-07T00:00:00Z',
      updatedAt: '2026-09-07T00:00:00Z',
    };

    useAuthStore.getState().setAuth(mockUser, 'mock-access-token');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.id).toBe('user-web-1');
    expect(state.token).toBe('mock-access-token');
  });

  it('clears authentication state on clearAuth', () => {
    const mockUser = {
      id: 'user-web-1',
      email: 'web@fluento.app',
      fullName: 'Web User',
      createdAt: '2026-09-07T00:00:00Z',
      updatedAt: '2026-09-07T00:00:00Z',
    };

    useAuthStore.getState().setAuth(mockUser, 'mock-access-token');
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
  });
});
