import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { Topic, ThoughtExercise, ThoughtExerciseMode, TopicCategory, Difficulty } from '@fluento/shared';

@Injectable()
export class TopicsService {
  constructor(private readonly db: DatabaseService) {}

  async getRandomExercise(
    category?: TopicCategory,
    difficulty?: Difficulty,
  ): Promise<ThoughtExercise> {
    let query = this.db.client
      .from('topics')
      .select('*')
      .eq('is_active', true);

    if (category) query = query.eq('category', category);
    if (difficulty) query = query.eq('difficulty', difficulty);

    const { data } = await query.limit(20);
    if (!data || data.length === 0) throw new NotFoundException('No topics available');

    const row = data[Math.floor(Math.random() * data.length)] as Record<string, unknown>;
    const topic = this.mapTopic(row);

    const modes: ThoughtExerciseMode[] = ['monologue', 'quick_thinking', 'debate'];
    const mode = modes[Math.floor(Math.random() * modes.length)]!;

    return { topic, mode };
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
    };
  }
}
