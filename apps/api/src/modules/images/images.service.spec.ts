import { ImagesService } from './images.service';
import { NotFoundException } from '@nestjs/common';

describe('ImagesService', () => {
  let service: ImagesService;
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

    service = new ImagesService(mockDb);
  });

  describe('getRandomChallenge', () => {
    it('returns a random image study challenge', async () => {
      mockDb.client.limit.mockResolvedValue({
        data: [
          {
            id: 'img-1',
            image_url: 'https://example.com/cafe.jpg',
            difficulty: 'intermediate',
            metadata: { primaryObjects: ['coffee', 'barista'] },
            created_at: new Date().toISOString(),
          },
        ],
      });

      const res = await service.getRandomChallenge();
      expect(res.image.id).toBe('img-1');
      expect(res.mode).toBeDefined();
    });

    it('throws NotFoundException when no images exist', async () => {
      mockDb.client.limit.mockResolvedValue({ data: [] });

      await expect(service.getRandomChallenge()).rejects.toThrow(NotFoundException);
    });
  });

  describe('getById', () => {
    it('returns image by ID', async () => {
      mockDb.findOne.mockResolvedValue({
        id: 'img-1',
        image_url: 'https://example.com/cafe.jpg',
        difficulty: 'intermediate',
        metadata: {},
        created_at: new Date().toISOString(),
      });

      const img = await service.getById('img-1');
      expect(img.id).toBe('img-1');
    });
  });
});
