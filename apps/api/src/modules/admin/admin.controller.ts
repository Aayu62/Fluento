import { Controller, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateTopicSchema, CreateScenarioSchema, type CreateTopicDto, type CreateScenarioDto } from '@fluento/shared';

class CreateImageBody {
  difficulty!: string;
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, AdminGuard)
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  createImage(@UploadedFile() file: Express.Multer.File, @Body() body: CreateImageBody) {
    return this.adminService.createImage(file, body.difficulty);
  }

  @Delete('images/:id')
  deleteImage(@Param('id') id: string) {
    return this.adminService.deleteImage(id);
  }
}
