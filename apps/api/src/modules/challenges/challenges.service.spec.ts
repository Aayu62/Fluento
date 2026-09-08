import { ChallengesService } from './challenges.service';

describe('ChallengesService', () => {
  let service: ChallengesService;
  let mockDb: any;
  let mockStreaks: any;
  let mockEvaluation: any;

  beforeEach(() => {
    mockDb = {
      findOne: jest.fn(),
      insert: jest.fn(),
      updateRollingScores: jest.fn().mockResolvedValue(undefined),
      logActivity: jest.fn().mockResolvedValue(undefined),
    };

    mockStreaks = {
      recordActivity: jest.fn().mockResolvedValue({ currentStreak: 1 }),
    };

    mockEvaluation = {
      evaluate: jest.fn().mockResolvedValue({
        scores: { observation: 85, grammar: 80, vocabulary: 75, expressiveness: 70 },
        feedback: 'Good observational details.',
        strengths: ['Detail accuracy'],
        improvements: ['Descriptive variety'],
        recommendations: ['Practice emotion mode'],
      }),
    };

    service = new ChallengesService(mockDb, mockStreaks, mockEvaluation);
  });

  describe('submitImageStudy', () => {
    it('submits image study challenge and returns evaluation report', async () => {
      mockDb.findOne.mockResolvedValue({ id: 'img-1', title: 'City Street' });
      mockDb.insert.mockResolvedValue({
        id: 'report-img-1',
        user_id: 'user-1',
        session_type: 'image_study',
        score_json: { observation: 85, grammar: 80 },
        feedback: 'Good observational details.',
        strengths: ['Detail accuracy'],
        improvements: ['Descriptive variety'],
        recommendations: ['Practice emotion mode'],
        created_at: new Date().toISOString(),
      });

      const report = await service.submitImageStudy('user-1', {
        imageId: 'img-1',
        mode: 'forbidden_words',
        responseText: 'A lively city street with people walking.',
      });

      expect(report.id).toBe('report-img-1');
      expect(mockStreaks.recordActivity).toHaveBeenCalledWith('user-1');
    });
  });

  describe('submitThoughtExercise', () => {
    it('submits thought exercise challenge and returns evaluation report', async () => {
      mockDb.findOne.mockResolvedValue({ id: 'topic-1', title: 'Remote Work' });
      mockDb.insert.mockResolvedValue({
        id: 'report-topic-1',
        user_id: 'user-1',
        session_type: 'thought_exercise',
        score_json: { clarity: 88, argumentStrength: 82 },
        feedback: 'Strong logical argument.',
        strengths: ['Clear thesis'],
        improvements: ['Include counterpoints'],
        recommendations: ['Practice debate mode'],
        created_at: new Date().toISOString(),
      });

      const report = await service.submitThoughtExercise('user-1', {
        topicId: 'topic-1',
        mode: 'monologue',
        responseText: 'Remote work enhances productivity when structured properly.',
      });

      expect(report.id).toBe('report-topic-1');
    });
  });
});
