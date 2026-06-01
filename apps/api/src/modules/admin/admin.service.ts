import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { CallScenario, Image, Topic } from '@fluento/shared';
import type { CreateTopicDto, CreateScenarioDto } from '@fluento/shared';

@Injectable()
export class AdminService {
  constructor(private readonly db: DatabaseService) {}

  // ─── Scenarios ─────────────────────────────────────────────────────────────

  async createScenario(dto: CreateScenarioDto): Promise<CallScenario> {
    const row = await this.db.insert<Record<string, unknown>>('call_scenarios', {
      title: dto.title,
      category: dto.category,
      persona_name: dto.personaName,
      persona_role: dto.personaRole,
      prompt_template: dto.promptTemplate,
      difficulty: dto.difficulty,
    });
    return this.mapScenario(row);
  }

  async updateScenario(id: string, dto: Partial<CreateScenarioDto>): Promise<CallScenario> {
    const values: Record<string, unknown> = {};
    if (dto.title) values['title'] = dto.title;
    if (dto.category) values['category'] = dto.category;
    if (dto.personaName) values['persona_name'] = dto.personaName;
    if (dto.personaRole) values['persona_role'] = dto.personaRole;
    if (dto.promptTemplate) values['prompt_template'] = dto.promptTemplate;
    if (dto.difficulty) values['difficulty'] = dto.difficulty;

    const row = await this.db.update<Record<string, unknown>>('call_scenarios', { id }, values);
    return this.mapScenario(row);
  }

  async deleteScenario(id: string): Promise<void> {
    await this.db.update('call_scenarios', { id }, { is_active: false });
  }

  // ─── Topics ────────────────────────────────────────────────────────────────

  async createTopic(dto: CreateTopicDto): Promise<Topic> {
    const row = await this.db.insert<Record<string, unknown>>('topics', {
      title: dto.title,
      category: dto.category,
      difficulty: dto.difficulty,
      prompt: dto.prompt,
    });
    return this.mapTopic(row);
  }

  async updateTopic(id: string, dto: Partial<CreateTopicDto>): Promise<Topic> {
    const row = await this.db.update<Record<string, unknown>>('topics', { id }, dto as Record<string, unknown>);
    return this.mapTopic(row);
  }

  async deleteTopic(id: string): Promise<void> {
    await this.db.update('topics', { id }, { is_active: false });
  }

  // ─── Images ────────────────────────────────────────────────────────────────
  // Full image upload + vision processing implemented in Phase 12 (AI Integration)
  // Admin can register an image URL with manually provided metadata for now

  async createImage(imageUrl: string, difficulty: string, metadata: Record<string, unknown>): Promise<Image> {
    const row = await this.db.insert<Record<string, unknown>>('images', {
      image_url: imageUrl,
      difficulty,
      metadata,
    });
    return this.mapImage(row);
  }

  async deleteImage(id: string): Promise<void> {
    const existing = await this.db.findOne('images', { id });
    if (!existing) throw new NotFoundException('Image not found');
    await this.db.update('images', { id }, { is_active: false });
  }

  // ─── Mappers ───────────────────────────────────────────────────────────────

  private mapScenario(row: Record<string, unknown>): CallScenario {
    return {
      id: row['id'] as string,
      title: row['title'] as string,
      category: row['category'] as CallScenario['category'],
      personaName: row['persona_name'] as string,
      personaRole: row['persona_role'] as string,
      promptTemplate: row['prompt_template'] as string,
      difficulty: row['difficulty'] as CallScenario['difficulty'],
    };
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
