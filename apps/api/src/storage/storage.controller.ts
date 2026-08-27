import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { SupabaseStorageService } from './supabase-storage.service';

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class StorageController {
  constructor(private readonly storageService: SupabaseStorageService) {}

  /** Client requests a signature before uploading directly to Supabase Storage. folder e.g.: "milestones" | "exams" */
  @Get('signature')
  getSignedUpload(@CurrentUser() user: RequestUser, @Query('folder') folder: string) {
    return this.storageService.generateSignedUpload(user.userId, folder || 'misc');
  }
}
