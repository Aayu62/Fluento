import { Injectable, NotFoundException } from '@nestjs/common';
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
    if (!image) throw new NotFoundException('Image not found');

    const result = await this.evaluation.evaluate({
      sessionType: 'image_study',
      userResponse: dto.responseText ?? '',
      contextData: { imageId: dto.imageId, mode: dto.mode, metadata: image?.['metadata'] },
      mode: dto.mode,
    });

    const imageScoreUpdates: Partial<Record<'observation' | 'grammar' | 'vocabulary' | 'expressiveness', number>> = {};
    if (result.scores.observation !== undefined) imageScoreUpdates.observation = result.scores.observation;
    if (result.scores.grammar !== undefined) imageScoreUpdates.grammar = result.scores.grammar;
    if (result.scores.vocabulary !== undefined) imageScoreUpdates.vocabulary = result.scores.vocabulary;
    if (result.scores.expressiveness !== undefined) imageScoreUpdates.expressiveness = result.scores.expressiveness;

    const scoreHistoryEntry = {
      observation: result.scores.observation ?? 0,
      grammar: result.scores.grammar ?? 0,
      vocabulary: result.scores.vocabulary ?? 0,
      expressiveness: result.scores.expressiveness ?? 0,
    };

    const report = await this.db.submitSessionTx(
      userId,
      'image_study',
      dto.imageId,
      result.scores,
      result.feedback,
      result.strengths,
      result.improvements,
      result.recommendations,
      imageScoreUpdates,
      'image_study_completed',
      { imageId: dto.imageId },
      scoreHistoryEntry
    );

    await this.streaks.recordActivity(userId);

    return this.mapReport(report);
  }

  async submitThoughtExercise(
    userId: string,
    dto: ThoughtExerciseSubmissionDto,
  ): Promise<SessionReport> {
    const topic = await this.db.findOne<Record<string, unknown>>('topics', { id: dto.topicId });
    if (!topic) throw new NotFoundException('Topic not found');

    const result = await this.evaluation.evaluate({
      sessionType: 'thought_exercise',
      userResponse: dto.responseText ?? '',
      contextData: { topicId: dto.topicId, mode: dto.mode, prompt: topic?.['prompt'] },
    });

    const thoughtScoreUpdates: Partial<Record<string, number>> = {};
    if (result.scores.fluency !== undefined) thoughtScoreUpdates['fluency'] = result.scores.fluency;
    if (result.scores.grammar !== undefined) thoughtScoreUpdates['grammar'] = result.scores.grammar;
    if (result.scores.vocabulary !== undefined) thoughtScoreUpdates['vocabulary'] = result.scores.vocabulary;
    if (result.scores.clarity !== undefined) thoughtScoreUpdates['clarity'] = result.scores.clarity;
    // argument_strength maps to argumentStrength in SessionScores
    const argScore = result.scores.argumentStrength;
    if (argScore !== undefined) thoughtScoreUpdates['argument_strength'] = argScore;

    const scoreHistoryEntry = {
      fluency:           result.scores.fluency           ?? 0,
      grammar:           result.scores.grammar           ?? 0,
      vocabulary:        result.scores.vocabulary        ?? 0,
      clarity:           result.scores.clarity           ?? 0,
      argument_strength: result.scores.argumentStrength  ?? 0,
    };

    const report = await this.db.submitSessionTx(
      userId,
      'thought_exercise',
      dto.topicId,
      result.scores,
      result.feedback,
      result.strengths,
      result.improvements,
      result.recommendations,
      thoughtScoreUpdates,
      'thought_exercise_completed',
      { topicId: dto.topicId },
      scoreHistoryEntry
    );

    await this.streaks.recordActivity(userId);

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
