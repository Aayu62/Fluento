import { TopicsService } from './topics.service';
import { NotFoundException } from '@nestjs/common';

describe('TopicsService', () => {
  let service: TopicsService;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      findOne: jest.fn(),
      client: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn(),
      },
    };

    service = new TopicsService(mockDb);
  });

  describe('getRandomExercise', () => {
    it('returns a random exercise prompt', async () => {
      mockDb.client.limit.mockResolvedValue({
        data: [
          {
            id: 'topic-1',
            title: 'Remote Work Debate',
            category: 'opinion',
            difficulty: 'intermediate',
            prompt: 'Is remote work effective?',
            is_active: true,
          },
        ],
      });

      const res = await service.getRandomExercise('opinion');
      expect(res.topic.id).toBe('topic-1');
      expect(res.mode).toBeDefined();
    });

    it('throws NotFoundException if no active topics exist', async () => {
      mockDb.client.limit.mockResolvedValue({ data: [] });

      await expect(service.getRandomExercise()).rejects.toThrow(NotFoundException);
    });
  });

  describe('getById', () => {
    it('returns topic by ID', async () => {
      mockDb.findOne.mockResolvedValue({
        id: 'topic-1',
        title: 'Public Speaking',
        category: 'general',
        difficulty: 'beginner',
        prompt: 'How to manage anxiety?',
      });

      const topic = await service.getById('topic-1');
      expect(topic.id).toBe('topic-1');
      expect(topic.title).toBe('Public Speaking');
    });
  });
});
