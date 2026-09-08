import { EvaluationService } from './evaluation.service';

describe('EvaluationService', () => {
  let service: EvaluationService;

  beforeEach(() => {
    service = new EvaluationService();
  });

  describe('evaluate', () => {
    it('returns deterministic fallback scores when AI server is unreachable', async () => {
      const res = await service.evaluate({
        sessionType: 'voice_call',
        userResponse: 'Hello world, I am practicing speaking skills.',
        contextData: { callId: 'call-1' },
      });

      expect(res.scores.fluency).toBeDefined();
      expect(res.scores.grammar).toBeDefined();
      expect(res.scores.vocabulary).toBeDefined();
      expect(res.feedback).toContain('engagement');
      expect(res.strengths.length).toBeGreaterThan(0);
      expect(res.improvements.length).toBeGreaterThan(0);
      expect(res.recommendations.length).toBeGreaterThan(0);
    });

    it('returns image study fallback evaluation correctly', async () => {
      const res = await service.evaluate({
        sessionType: 'image_study',
        userResponse: 'In the image, there is a busy city street with tall skyscrapers.',
        contextData: { imageId: 'img-1' },
      });

      expect(res.scores.observation).toBeDefined();
      expect(res.scores.expressiveness).toBeDefined();
      expect(res.feedback).toContain('identified');
    });

    it('returns thought exercise fallback evaluation correctly', async () => {
      const res = await service.evaluate({
        sessionType: 'thought_exercise',
        userResponse: 'I believe remote work increases productivity because of reduced commute times.',
        contextData: { topicId: 'topic-1' },
      });

      expect(res.scores.clarity).toBeDefined();
      expect(res.scores.argumentStrength).toBeDefined();
    });
  });
});
