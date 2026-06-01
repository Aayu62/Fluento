import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { Image, ImageChallenge, ChallengeMode, Difficulty } from '@fluento/shared';

@Injectable()
export class ImagesService {
  constructor(private readonly db: DatabaseService) {}

  async getRandomChallenge(difficulty?: Difficulty): Promise<ImageChallenge> {
    let query = this.db.client
      .from('images')
      .select('*')
      .eq('is_active', true);

    if (difficulty) query = query.eq('difficulty', difficulty);

    // Random row via random ordering
    const { data } = await query.limit(20);
    if (!data || data.length === 0) throw new NotFoundException('No images available');

    const row = data[Math.floor(Math.random() * data.length)] as Record<string, unknown>;
    const image = this.mapImage(row);

    const modes: ChallengeMode[] = ['standard', 'forbidden_words', 'emotion', 'perspective'];
    const mode = modes[Math.floor(Math.random() * modes.length)]!;

    return { image, mode, modeConfig: this.buildModeConfig(mode, image) };
  }

  async getById(id: string): Promise<Image> {
    const row = await this.db.findOne<Record<string, unknown>>('images', { id });
    if (!row) throw new NotFoundException('Image not found');
    return this.mapImage(row);
  }

  private buildModeConfig(
    mode: ChallengeMode,
    image: Image,
  ): ImageChallenge['modeConfig'] {
    if (mode === 'forbidden_words') {
      const words = [
        ...(image.metadata.primaryObjects ?? []).slice(0, 2),
      ].filter(Boolean);
      return { forbiddenWords: words.length > 0 ? words : ['describe', 'show'] };
    }
    if (mode === 'emotion') {
      const emotions = ['peaceful', 'exciting', 'lonely', 'nostalgic', 'joyful'];
      return { emotion: emotions[Math.floor(Math.random() * emotions.length)]! };
    }
    if (mode === 'perspective') {
      const perspectives = ['journalist', 'child', 'travel blogger', 'teacher', 'poet'];
      return { perspective: perspectives[Math.floor(Math.random() * perspectives.length)]! };
    }
    return {};
  }

  private mapImage(row: Record<string, unknown>): Image {
    return {
      id: row['id'] as string,
      imageUrl: row['image_url'] as string,
      difficulty: row['difficulty'] as Image['difficulty'],
      metadata: row['metadata'] as Image['metadata'],
      createdAt: row['created_at'] as string,
    };
  }
}
