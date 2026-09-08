import { CallsService } from './calls.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CallsService', () => {
  let service: CallsService;
  let mockDb: any;
  let mockStreaks: any;
  let mockEvaluation: any;

  beforeEach(() => {
    mockDb = {
      findOne: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      logActivity: jest.fn().mockResolvedValue(undefined),
      updateRollingScores: jest.fn().mockResolvedValue(undefined),
      client: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [] }),
        maybeSingle: jest.fn(),
      },
    };

    mockStreaks = {
      recordActivity: jest.fn().mockResolvedValue({ currentStreak: 1 }),
    };

    mockEvaluation = {
      evaluate: jest.fn().mockResolvedValue({
        scores: { fluency: 85, grammar: 80, vocabulary: 88, coherence: 82, pronunciation: 84 },
        feedback: 'Great speaking flow!',
        strengths: ['Clear articulation'],
        improvements: ['Vary vocabulary'],
        recommendations: ['Practice longer monologues'],
      }),
    };

    service = new CallsService(mockDb, mockStreaks, mockEvaluation);
  });

  describe('scheduleCall', () => {
    it('throws BadRequestException if scheduled time is in the past', async () => {
      const pastTime = new Date(Date.now() - 3600000).toISOString();
      await expect(
        service.scheduleCall('user-1', { scenarioId: 'scenario-1', scheduledTime: pastTime }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if scenario does not exist', async () => {
      const futureTime = new Date(Date.now() + 3600000).toISOString();
      mockDb.findOne.mockResolvedValue(null);

      await expect(
        service.scheduleCall('user-1', { scenarioId: 'non-existent', scheduledTime: futureTime }),
      ).rejects.toThrow(NotFoundException);
    });

    it('successfully schedules call for valid future time', async () => {
      const futureTime = new Date(Date.now() + 3600000).toISOString();
      mockDb.findOne.mockResolvedValue({ id: 'sc-1', is_active: true, title: 'Job Interview' });
      mockDb.insert.mockResolvedValue({
        id: 'call-100',
        user_id: 'user-1',
        scenario_id: 'sc-1',
        scheduled_time: futureTime,
        status: 'scheduled',
      });

      const res = await service.scheduleCall('user-1', { scenarioId: 'sc-1', scheduledTime: futureTime });
      expect(res.id).toBe('call-100');
      expect(res.status).toBe('scheduled');
    });
  });

  describe('startCall', () => {
    it('starts a scheduled call', async () => {
      mockDb.findOne.mockResolvedValue({ id: 'call-1', user_id: 'user-1', status: 'scheduled' });
      mockDb.update.mockResolvedValue({ id: 'call-1', user_id: 'user-1', status: 'active' });

      const res = await service.startCall('user-1', 'call-1');
      expect(res.status).toBe('active');
    });

    it('throws BadRequestException if call is not scheduled', async () => {
      mockDb.findOne.mockResolvedValue({ id: 'call-1', user_id: 'user-1', status: 'completed' });

      await expect(service.startCall('user-1', 'call-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('endCall', () => {
    it('ends an active call and generates evaluation report', async () => {
      mockDb.findOne.mockResolvedValue({
        id: 'call-1',
        user_id: 'user-1',
        status: 'active',
        scenario_id: 'sc-1',
        conversation_history: [{ role: 'user', content: 'Hello interviewer!' }],
      });

      mockDb.insert.mockResolvedValue({
        id: 'report-1',
        user_id: 'user-1',
        session_type: 'voice_call',
        session_id: 'call-1',
        score_json: { fluency: 85, grammar: 80 },
        feedback: 'Great speaking flow!',
        strengths: ['Clear articulation'],
        improvements: ['Vary vocabulary'],
        recommendations: ['Practice longer monologues'],
        created_at: new Date().toISOString(),
      });

      const report = await service.endCall('user-1', 'call-1');
      expect(report.id).toBe('report-1');
      expect(mockStreaks.recordActivity).toHaveBeenCalledWith('user-1');
    });
  });
});
