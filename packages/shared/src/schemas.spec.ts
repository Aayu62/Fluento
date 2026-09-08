import {
  RegisterSchema,
  LoginSchema,
  OnboardingSchema,
  ScheduleCallSchema,
  ImageSubmissionSchema,
  ThoughtExerciseSubmissionSchema,
  RegisterPushTokenSchema,
} from './schemas/index';

describe('Shared Zod Schemas', () => {
  describe('RegisterSchema', () => {
    it('validates a valid registration payload', () => {
      const valid = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
      };
      const parsed = RegisterSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('fails when email is invalid or password is too short', () => {
      const invalid = {
        fullName: 'A',
        email: 'invalid-email',
        password: 'short',
      };
      const parsed = RegisterSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('LoginSchema', () => {
    it('validates a valid login payload', () => {
      const valid = { email: 'user@fluento.app', password: 'secretpassword' };
      const parsed = LoginSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('rejects empty password', () => {
      const invalid = { email: 'user@fluento.app', password: '' };
      const parsed = LoginSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('OnboardingSchema', () => {
    it('validates valid onboarding data', () => {
      const valid = {
        goals: ['interview_preparation', 'improve_fluency'],
        skillLevel: 'intermediate',
      };
      const parsed = OnboardingSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });
  });

  describe('ScheduleCallSchema', () => {
    it('validates schedule call payload', () => {
      const valid = {
        scenarioId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        scheduledTime: '2026-09-08T10:00:00Z',
      };
      const parsed = ScheduleCallSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });
  });

  describe('ImageSubmissionSchema', () => {
    it('validates image study response with text', () => {
      const valid = {
        imageId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        mode: 'forbidden_words',
        responseText: 'This is a description without forbidden words.',
      };
      const parsed = ImageSubmissionSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('fails when neither responseText nor audioUrl is provided', () => {
      const invalid = {
        imageId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        mode: 'standard',
      };
      const parsed = ImageSubmissionSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('ThoughtExerciseSubmissionSchema', () => {
    it('validates thought exercise response', () => {
      const valid = {
        topicId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        mode: 'monologue',
        responseText: 'My perspective on work-life balance...',
      };
      const parsed = ThoughtExerciseSubmissionSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });
  });

  describe('RegisterPushTokenSchema', () => {
    it('validates push token payload', () => {
      const valid = {
        token: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
        platform: 'ios',
      };
      const parsed = RegisterPushTokenSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });
  });
});
