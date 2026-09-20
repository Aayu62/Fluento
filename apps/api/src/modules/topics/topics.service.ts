import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { Topic, ThoughtExercise, ThoughtExercisePreparation, ThoughtExerciseFormat, TopicCategory, Difficulty } from '@fluento/shared';

@Injectable()
export class TopicsService {
  constructor(private readonly db: DatabaseService) {}

  async getRandomExercise(
    category?: TopicCategory,
    difficulty?: Difficulty,
    format?: ThoughtExerciseFormat,
    preparation?: ThoughtExercisePreparation,
  ): Promise<ThoughtExercise> {
    let query = this.db.client
      .from('topics')
      .select('id');

    if (category) query = query.eq('category', category);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (format) query = query.eq('format', format);

    const { data: ids } = await query;
    if (!ids || ids.length === 0) throw new NotFoundException('No topics available');

    const randomId = ids[Math.floor(Math.random() * ids.length)]!.id;
    const { data: row } = await this.db.client.from('topics').select('*').eq('id', randomId).single();
    if (!row) throw new NotFoundException('Topic not found');

    const topic = this.mapTopic(row);

    const actualPreparation = preparation ?? 'quick_thinking';

    return { topic, preparation: actualPreparation };
  }

  async getAll(limit?: number): Promise<Topic[]> {
    let query = this.db.client.from('topics').select('*');
    if (limit) {
      query = query.limit(limit);
    }
    const { data } = await query;
    if (!data) return [];
    return data.map(this.mapTopic);
  }

  async getById(id: string): Promise<Topic> {
    const row = await this.db.findOne<Record<string, unknown>>('topics', { id });
    if (!row) throw new NotFoundException('Topic not found');
    return this.mapTopic(row);
  }

  private mapTopic(row: Record<string, unknown>): Topic {
    return {
      id: row['id'] as string,
      title: row['title'] as string,
      category: row['category'] as Topic['category'],
      difficulty: row['difficulty'] as Topic['difficulty'],
      prompt: row['prompt'] as string,
      format: row['format'] as Topic['format'],
    };
  }
}
