import { File } from 'expo-file-system';
import { api } from './api';
import { supabase } from './supabaseClient';

interface SignedUpload {
  signedUrl: string;
  token: string;
  path: string;
  bucket: string;
}

/**
 * Uploads a local file (uri from expo-image-picker, expo-audio or
 * expo-document-picker) to Supabase Storage.
 * Flow: request a signed upload URL from the backend -> read the local
 * file's bytes (File.bytes(), the modern expo-file-system API) -> upload
 * with uploadToSignedUrl.
 * folder e.g.: "milestones" | "exams" | "diary"
 */
export async function uploadFile(
  localUri: string,
  folder: 'milestones' | 'exams' | 'diary',
  contentType: string = 'image/jpeg',
): Promise<string> {
  const { data: signed } = await api.get<SignedUpload>('/uploads/signature', { params: { folder } });

  const fileBytes = await new File(localUri).bytes();

  const { error } = await supabase.storage
    .from(signed.bucket)
    .uploadToSignedUrl(signed.path, signed.token, fileBytes, { contentType });

  if (error) {
    throw new Error(`Failed to upload the file: ${error.message}`);
  }

  const { data: publicUrl } = supabase.storage.from(signed.bucket).getPublicUrl(signed.path);
  return publicUrl.publicUrl;
}
