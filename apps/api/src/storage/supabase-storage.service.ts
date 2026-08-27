import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export interface SignedUpload {
  signedUrl: string;
  token: string;
  path: string;
  bucket: string;
}

@Injectable()
export class SupabaseStorageService {
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    // service_role key: only used server-side, never exposed to the client.
    // Docs: https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl
    this.client = createClient(
      config.getOrThrow<string>('SUPABASE_URL'),
      config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
    this.bucket = config.getOrThrow<string>('SUPABASE_STORAGE_BUCKET');
  }

  /**
   * Every upload lives at `${folder}/${userId}/${uuid}` (see generateSignedUpload
   * below), so a user's files can always be found without tracking individual
   * URLs - used to purge storage when an account is deleted (GDPR erasure).
   */
  private static readonly UPLOAD_FOLDERS = ['milestones', 'diary', 'exams', 'misc'];

  async deleteAllForUser(userId: string): Promise<void> {
    for (const folder of SupabaseStorageService.UPLOAD_FOLDERS) {
      const prefix = `${folder}/${userId}`;
      const { data: files, error } = await this.client.storage.from(this.bucket).list(prefix);
      if (error || !files || files.length === 0) continue;

      const paths = files.map((file) => `${prefix}/${file.name}`);
      await this.client.storage.from(this.bucket).remove(paths);
    }
  }

  /**
   * Generates a signed upload URL (fixed 2h expiry, set by Supabase) so the
   * client (Expo) can upload directly to the bucket without exposing the
   * service_role key. folder e.g.: "milestones" | "exams".
   */
  async generateSignedUpload(userId: string, folder: string): Promise<SignedUpload> {
    const path = `${folder}/${userId}/${randomUUID()}`;

    const { data, error } = await this.client.storage.from(this.bucket).createSignedUploadUrl(path);

    if (error || !data) {
      throw new Error(`Failed to generate the signed upload URL: ${error?.message}`);
    }

    return {
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      bucket: this.bucket,
    };
  }
}
