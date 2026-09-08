import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let mockDb: any;
  let mockCalls: any;
  let mockStreaks: any;
  let mockTopics: any;

  beforeEach(() => {
    mockDb = {
      findOne: jest.fn(),
      findMany: jest.fn(),
      client: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [] }),
      },
    };

    mockCalls = {
      getUpcoming: jest.fn().mockResolvedValue([]),
    };

    mockStreaks = {
      getStreak: jest.fn().mockResolvedValue({ currentStreak: 5, bestStreak: 10 }),
    };

    mockTopics = {
      getRandomExercise: jest.fn().mockResolvedValue(null),
    };

    service = new ProgressService(mockDb, mockCalls, mockStreaks, mockTopics);
  });

  describe('getDashboard', () => {
    it('returns formatted dashboard overview', async () => {
      mockDb.findOne.mockResolvedValueOnce({
        fluency: 80,
        grammar: 85,
        vocabulary: 78,
        observation: 70,
        expressiveness: 75,
      });
      mockDb.findMany.mockResolvedValue([]);

      const res = await service.getDashboard('user-1');
      expect(res.streak.currentStreak).toBe(5);
      expect(res.streak.bestStreak).toBe(10);
      expect(res.scores.fluency).toBe(80);
    });
  });
});
