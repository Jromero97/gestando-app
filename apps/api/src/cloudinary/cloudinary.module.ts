// [DEPRECATED 2026-08-21 - Cloudinary unavailable in the user's country - j.romeroc97@gmail.com]
// replaced by StorageModule (Supabase Storage), see src/storage/storage.module.ts
import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';

@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
