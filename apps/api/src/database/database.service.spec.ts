import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
    };

    service = new DatabaseService(mockSupabase);
  });

  describe('client getter', () => {
    it('returns underlying supabase client instance', () => {
      expect(service.client).toBe(mockSupabase);
    });
  });

  describe('logActivity', () => {
    it('logs activity to activity_log table', async () => {
      mockSupabase.insert.mockResolvedValue({ error: null });

      await service.logActivity('user-1', 'test_event', { key: 'val' });
      expect(mockSupabase.from).toHaveBeenCalledWith('activity_log');
    });
  });
});
