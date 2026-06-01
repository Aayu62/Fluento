import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { StreaksService } from '../streaks/streaks.service';
import { EvaluationService } from '../evaluation/evaluation.service';
import type { SessionReport } from '@fluento/shared';
import type { ImageSubmissionDto, ThoughtExerciseSubmissionDto } from '@fluento/shared';

@Injectable()
export class ChallengesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly streaks: StreaksService,
    private readonly evaluation: EvaluationService,
  ) {}

  async submitImageStudy(
    userId: string,
    dto: ImageSubmissionDto,
  ): Promise<SessionReport> {
    const image = await this.db.findOne<Record<string, unknown>>('images', { id: dto.imageId });

    const result = await this.evaluation.evaluate({
      sessionType: 'image_study',
      userResponse: dto.responseText ?? '',
      contextData: { imageId: dto.imageId, mode: dto.mode, metadata: image?.['metadata'] },
      mode: dto.mode,
    });

    const report = await this.db.insert<Record<string, unknown>>('session_reports', {
      user_id: userId,
      session_type: 'image_study',
      score_json: result.scores,
      feedback: result.feedback,
      strengths: result.strengths,
      improvements: result.improvements,
      recommendations: result.recommendations,
    });

    await this.db.updateRollingScores(userId, {
      observation: result.scores.observation,
      grammar: result.scores.grammar,
      vocabulary: result.scores.vocabulary,
      expressiveness: result.scores.expressiveness,
    });

    await this.db.insert('score_history', {
      user_id: userId,
      session_type: 'image_study',
      observation: result.scores.observation,
      grammar: result.scores.grammar,
      vocabulary: result.scores.vocabulary,
      expressiveness: result.scores.expressiveness,
    });

    await this.streaks.recordActivity(userId);
    await this.db.logActivity(userId, 'image_study_completed', { imageId: dto.imageId });

    return this.mapReport(report);
  }

  async submitThoughtExercise(
    userId: string,
    dto: ThoughtExerciseSubmissionDto,
  ): Promise<SessionReport> {
    const topic = await this.db.findOne<Record<string, unknown>>('topics', { id: dto.topicId });

    const result = await this.evaluation.evaluate({
      sessionType: 'thought_exercise',
      userResponse: dto.responseText ?? '',
      contextData: { topicId: dto.topicId, mode: dto.mode, prompt: topic?.['prompt'] },
    });

    const report = await this.db.insert<Record<string, unknown>>('session_reports', {
      user_id: userId,
      session_type: 'thought_exercise',
      score_json: result.scores,
      feedback: result.feedback,
      strengths: result.strengths,
      improvements: result.improvements,
      recommendations: result.recommendations,
    });

    await this.db.updateRollingScores(userId, {
      fluency: result.scores.fluency,
      grammar: result.scores.grammar,
      vocabulary: result.scores.vocabulary,
    });

    await this.db.insert('score_history', {
      user_id: userId,
      session_type: 'thought_exercise',
      fluency: result.scores.fluency,
      grammar: result.scores.grammar,
      vocabulary: result.scores.vocabulary,
    });

    await this.streaks.recordActivity(userId);
    await this.db.logActivity(userId, 'thought_exercise_completed', { topicId: dto.topicId });

    return this.mapReport(report);
  }

  private mapReport(row: Record<string, unknown>): SessionReport {
    return {
      id: row['id'] as string,
      userId: row['user_id'] as string,
      sessionType: row['session_type'] as SessionReport['sessionType'],
      sessionId: row['session_id'] as string | undefined,
      scoreJson: row['score_json'] as SessionReport['scoreJson'],
      feedback: row['feedback'] as string,
      strengths: (row['strengths'] as string[]) ?? [],
      improvements: (row['improvements'] as string[]) ?? [],
      recommendations: (row['recommendations'] as string[]) ?? [],
      createdAt: row['created_at'] as string,
    };
  }
}
