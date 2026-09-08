import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let mockSupabase: any;
  let mockUsersService: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        admin: {
          createUser: jest.fn(),
          signOut: jest.fn().mockResolvedValue({ error: null }),
        },
        signInWithPassword: jest.fn(),
        refreshSession: jest.fn(),
      },
    };

    mockUsersService = {
      upsert: jest.fn(),
      findById: jest.fn(),
    };

    service = new AuthService(mockSupabase, mockUsersService);
  });

  describe('register', () => {
    it('successfully registers a user and returns token response', async () => {
      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@fluento.app' } },
        error: null,
      });

      mockUsersService.upsert.mockResolvedValue({
        id: 'user-123',
        email: 'test@fluento.app',
        fullName: 'Test User',
      });

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            access_token: 'access-123',
            refresh_token: 'refresh-123',
          },
        },
        error: null,
      });

      const res = await service.register({
        fullName: 'Test User',
        email: 'test@fluento.app',
        password: 'password123',
      });

      expect(res.accessToken).toBe('access-123');
      expect(res.user.id).toBe('user-123');
    });

    it('throws ConflictException if email already registered', async () => {
      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      });

      await expect(
        service.register({
          fullName: 'Test User',
          email: 'exists@fluento.app',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('logs in user with valid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          session: { access_token: 'access-token-123', refresh_token: 'refresh-token-123' },
          user: { id: 'user-123', email: 'test@fluento.app', user_metadata: { full_name: 'Test User' } },
        },
        error: null,
      });

      mockUsersService.upsert.mockResolvedValue({
        id: 'user-123',
        email: 'test@fluento.app',
        fullName: 'Test User',
      });

      const res = await service.login({ email: 'test@fluento.app', password: 'password123' });
      expect(res.accessToken).toBe('access-token-123');
    });

    it('throws UnauthorizedException on bad credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid credentials' },
      });

      await expect(
        service.login({ email: 'wrong@fluento.app', password: 'badpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
