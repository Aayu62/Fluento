import { Controller, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateTopicSchema, CreateScenarioSchema, type CreateTopicDto, type CreateScenarioDto } from '@fluento/shared';

class CreateImageBody {
  imageUrl!: string;
  difficulty!: string;
  metadata!: Record<string, unknown>;
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Scenarios
  @Post('scenarios')
  createScenario(@Body(new ZodValidationPipe(CreateScenarioSchema)) dto: CreateScenarioDto) {
    return this.adminService.createScenario(dto);
  }

  @Put('scenarios/:id')
  updateScenario(@Param('id') id: string, @Body() dto: Partial<CreateScenarioDto>) {
    return this.adminService.updateScenario(id, dto);
  }

  @Delete('scenarios/:id')
  deleteScenario(@Param('id') id: string) {
    return this.adminService.deleteScenario(id);
  }

  // Topics
  @Post('topics')
  createTopic(@Body(new ZodValidationPipe(CreateTopicSchema)) dto: CreateTopicDto) {
    return this.adminService.createTopic(dto);
  }

  @Put('topics/:id')
  updateTopic(@Param('id') id: string, @Body() dto: Partial<CreateTopicDto>) {
    return this.adminService.updateTopic(id, dto);
  }

  @Delete('topics/:id')
  deleteTopic(@Param('id') id: string) {
    return this.adminService.deleteTopic(id);
  }

  // Images
  @Post('images')
  createImage(@Body() body: CreateImageBody) {
    return this.adminService.createImage(body.imageUrl, body.difficulty, body.metadata);
  }

  @Delete('images/:id')
  deleteImage(@Param('id') id: string) {
    return this.adminService.deleteImage(id);
  }
}
