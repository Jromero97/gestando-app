import { Controller, Query, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from './cloudinary.service';

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /** Client requests a signature before uploading directly to Cloudinary. folder e.g.: "milestones" | "exams" */
  @Get('signature')
  getSignedUpload(@Query('folder') folder: string) {
    return this.cloudinaryService.generateSignedUpload(folder || 'misc');
  }
}
