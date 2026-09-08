import { StreaksService } from './streaks.service';

describe('StreaksService', () => {
  let service: StreaksService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      findOne: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      client: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ data: [] }),
      },
    };

    service = new StreaksService(mockDb);
  });

  describe('getStreak', () => {
    it('returns default zero streak if user has no streak row', async () => {
      mockDb.findOne.mockResolvedValue(null);

      const res = await service.getStreak('user-1');
      expect(res.currentStreak).toBe(0);
      expect(res.bestStreak).toBe(0);
    });

    it('returns stored streak record', async () => {
      mockDb.findOne.mockResolvedValue({
        current_streak: 7,
        best_streak: 14,
        last_activity_date: '2026-09-07',
      });

      const res = await service.getStreak('user-1');
      expect(res.currentStreak).toBe(7);
      expect(res.bestStreak).toBe(14);
    });
  });

  describe('getStreakCalendar', () => {
    it('returns monthly streak active dates', async () => {
      mockDb.client.lte.mockResolvedValue({
        data: [
          { created_at: '2026-09-01T10:00:00Z' },
          { created_at: '2026-09-05T12:00:00Z' },
        ],
      });

      const res = await service.getStreakCalendar('user-1', 2026, 9);
      expect(res.activeDates.length).toBe(2);
      expect(res.activeDates).toContain('2026-09-01');
      expect(res.activeDates).toContain('2026-09-05');
    });
  });
});
