import { useAuthStore } from './auth.store';

describe('useAuthStore (Mobile)', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('initializes with unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('sets authentication state', () => {
    const mockUser = {
      id: 'mobile-user-1',
      email: 'mobile@fluento.app',
      fullName: 'Mobile User',
      createdAt: '2026-09-07T00:00:00Z',
      updatedAt: '2026-09-07T00:00:00Z',
    };

    useAuthStore.getState().setAuth(mockUser, 'mobile-token-123');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.id).toBe('mobile-user-1');
    expect(state.token).toBe('mobile-token-123');
  });

  it('clears state on clearAuth', () => {
    const mockUser = {
      id: 'mobile-user-1',
      email: 'mobile@fluento.app',
      fullName: 'Mobile User',
      createdAt: '2026-09-07T00:00:00Z',
      updatedAt: '2026-09-07T00:00:00Z',
    };

    useAuthStore.getState().setAuth(mockUser, 'mobile-token-123');
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
  });
});
