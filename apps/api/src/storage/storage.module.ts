import { Module } from '@nestjs/common';
import { SupabaseStorageService } from './supabase-storage.service';
import { StorageController } from './storage.controller';

@Module({
  controllers: [StorageController],
  providers: [SupabaseStorageService],
  exports: [SupabaseStorageService],
})
export class StorageModule {}
