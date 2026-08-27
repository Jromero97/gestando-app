import { ConfigService } from '@nestjs/config';
import { SupabaseStorageService } from './supabase-storage.service';

const createSignedUploadUrlMock = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        createSignedUploadUrl: createSignedUploadUrlMock,
      })),
    },
  })),
}));

describe('SupabaseStorageService', () => {
  const configMock = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        SUPABASE_URL: 'https://project.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
        SUPABASE_STORAGE_BUCKET: 'gestando-media',
      };
      return values[key];
    }),
  } as unknown as ConfigService;

  beforeEach(() => jest.clearAllMocks());

  it('generates a signed upload URL with a path scoped by user and folder', async () => {
    createSignedUploadUrlMock.mockResolvedValue({
      data: { signedUrl: 'https://signed.example/upload', token: 'tok-1', path: 'milestones/user-1/uuid' },
      error: null,
    });

    const service = new SupabaseStorageService(configMock);
    const result = await service.generateSignedUpload('user-1', 'milestones');

    expect(result).toEqual({
      signedUrl: 'https://signed.example/upload',
      token: 'tok-1',
      path: 'milestones/user-1/uuid',
      bucket: 'gestando-media',
    });
    expect(createSignedUploadUrlMock).toHaveBeenCalledWith(expect.stringMatching(/^milestones\/user-1\//));
  });

  it('throws an error when Supabase Storage fails', async () => {
    createSignedUploadUrlMock.mockResolvedValue({ data: null, error: { message: 'bucket not found' } });

    const service = new SupabaseStorageService(configMock);

    await expect(service.generateSignedUpload('user-1', 'exams')).rejects.toThrow('bucket not found');
  });
});
