import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;

// ─── Onboarding ───────────────────────────────────────────────────────────────

export const OnboardingSchema = z.object({
  goals: z
    .array(
      z.enum([
        'interview_preparation',
        'improve_fluency',
        'sales_practice',
        'general_communication',
      ]),
    )
    .min(1),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
});

export type OnboardingDto = z.infer<typeof OnboardingSchema>;

// ─── Schedule Call ────────────────────────────────────────────────────────────

export const ScheduleCallSchema = z.object({
  scenarioId: z.string().uuid(),
  scheduledTime: z.string().datetime(),
});

export type ScheduleCallDto = z.infer<typeof ScheduleCallSchema>;

export const AddCallTurnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

export type AddCallTurnDto = z.infer<typeof AddCallTurnSchema>;

// ─── Image Study Submission ───────────────────────────────────────────────────

export const ImageSubmissionSchema = z.object({
  imageId: z.string().uuid(),
  mode: z.enum(['standard', 'forbidden_words', 'emotion', 'perspective']),
  responseText: z.string().min(1).optional(),
  audioUrl: z.string().url().optional(),
}).refine((data) => data.responseText ?? data.audioUrl, {
  message: 'Either responseText or audioUrl must be provided',
});

export type ImageSubmissionDto = z.infer<typeof ImageSubmissionSchema>;

// ─── Thought Exercise Submission ──────────────────────────────────────────────

export const ThoughtExerciseSubmissionSchema = z.object({
  topicId: z.string().uuid(),
  mode: z.enum(['monologue', 'quick_thinking', 'debate']),
  responseText: z.string().min(1).optional(),
  audioUrl: z.string().url().optional(),
}).refine((data) => data.responseText ?? data.audioUrl, {
  message: 'Either responseText or audioUrl must be provided',
});

export type ThoughtExerciseSubmissionDto = z.infer<typeof ThoughtExerciseSubmissionSchema>;

// ─── Admin ────────────────────────────────────────────────────────────────────

export const CreateTopicSchema = z.object({
  title: z.string().min(3).max(200),
  category: z.enum(['personal', 'professional', 'opinion', 'general']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  prompt: z.string().min(10),
});

export type CreateTopicDto = z.infer<typeof CreateTopicSchema>;

export const CreateScenarioSchema = z.object({
  title: z.string().min(3).max(200),
  category: z.enum(['interview', 'sales', 'daily_conversation']),
  personaName: z.string().min(1).max(100),
  personaRole: z.string().min(1).max(100),
  promptTemplate: z.string().min(10),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});

export type CreateScenarioDto = z.infer<typeof CreateScenarioSchema>;

// ─── Push Token ───────────────────────────────────────────────────────────────

export const RegisterPushTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android', 'web']),
});

export type RegisterPushTokenDto = z.infer<typeof RegisterPushTokenSchema>;
