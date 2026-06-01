// ─── User ────────────────────────────────────────────────────────────────────

export type UserGoal =
  | 'interview_preparation'
  | 'improve_fluency'
  | 'sales_practice'
  | 'general_communication';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  goals: UserGoal[];
  skillLevel: SkillLevel;
  onboardingCompleted: boolean;
}

// ─── Scores ──────────────────────────────────────────────────────────────────

export interface CommunicationScores {
  fluency: number;
  grammar: number;
  vocabulary: number;
  observation: number;
  expressiveness: number;
}

export interface UserScores extends CommunicationScores {
  id: string;
  userId: string;
  updatedAt: string;
}

export interface ScoreHistoryEntry extends CommunicationScores {
  id: string;
  userId: string;
  sessionType: SessionType;
  recordedAt: string;
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export interface UserStreak {
  userId: string;
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string | null;
}

// ─── Call Scenarios ───────────────────────────────────────────────────────────

export type CallCategory = 'interview' | 'sales' | 'daily_conversation';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface CallScenario {
  id: string;
  title: string;
  category: CallCategory;
  personaName: string;
  personaRole: string;
  promptTemplate: string;
  difficulty: Difficulty;
}

// ─── Scheduled Calls ─────────────────────────────────────────────────────────

export type CallStatus = 'scheduled' | 'active' | 'completed' | 'missed' | 'cancelled';

export interface ScheduledCall {
  id: string;
  userId: string;
  scenarioId: string;
  scenario?: CallScenario;
  scheduledTime: string;
  status: CallStatus;
}

// ─── Session Reports ─────────────────────────────────────────────────────────

export type SessionType = 'voice_call' | 'image_study' | 'thought_exercise';

export interface SessionScores {
  fluency?: number | undefined;
  grammar?: number | undefined;
  vocabulary?: number | undefined;
  observation?: number | undefined;
  expressiveness?: number | undefined;
  confidence?: number | undefined;
  clarity?: number | undefined;
  argumentStrength?: number | undefined;
}

export interface SessionReport {
  id: string;
  userId: string;
  sessionType: SessionType;
  sessionId?: string | undefined;
  scoreJson: SessionScores;
  feedback: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  createdAt: string;
}

// ─── Images ───────────────────────────────────────────────────────────────────

export type ChallengeMode = 'standard' | 'forbidden_words' | 'emotion' | 'perspective';

export interface ImageMetadata {
  sceneType: string;
  primaryObjects: string[];
  secondaryObjects: string[];
  activities: string[];
  relationships: Array<{ subject: string; relation: string; object: string }>;
  atmosphere: string[];
  referenceDescription: string;
  advancedDescription: string;
}

export interface Image {
  id: string;
  imageUrl: string;
  difficulty: Difficulty;
  metadata: ImageMetadata;
  createdAt: string;
}

export interface ImageChallenge {
  image: Image;
  mode: ChallengeMode;
  modeConfig: ForbiddenWordsConfig | EmotionConfig | PerspectiveConfig | Record<string, never>;
}

export interface ForbiddenWordsConfig {
  forbiddenWords: string[];
}

export interface EmotionConfig {
  emotion: string;
}

export interface PerspectiveConfig {
  perspective: string;
}

// ─── Topics ───────────────────────────────────────────────────────────────────

export type TopicCategory = 'personal' | 'professional' | 'opinion' | 'general';
export type ThoughtExerciseMode = 'monologue' | 'quick_thinking' | 'debate';

export interface Topic {
  id: string;
  title: string;
  category: TopicCategory;
  difficulty: Difficulty;
  prompt: string;
}

export interface ThoughtExercise {
  topic: Topic;
  mode: ThoughtExerciseMode;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export type ProgressRange = 'daily' | 'weekly' | 'monthly' | 'all_time';

export interface ProgressDataPoint {
  date: string;
  scores: CommunicationScores;
}

export interface ProgressHistory {
  range: ProgressRange;
  dataPoints: ProgressDataPoint[];
  personalBests: CommunicationScores;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardData {
  scores: UserScores;
  streak: UserStreak;
  upcomingCall: ScheduledCall | null;
  recentSessions: SessionReport[];
  recommendedChallenge: ImageChallenge | ThoughtExercise | null;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface PushToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
