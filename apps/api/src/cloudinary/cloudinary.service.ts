import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface SignedUpload {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

@Injectable()
export class CloudinaryService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Generates the signed parameters so the client (Expo) can upload
   * directly to Cloudinary without exposing the api_secret.
   * Docs: https://cloudinary.com/documentation/signatures
   */
  generateSignedUpload(folder: string): SignedUpload {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = { timestamp, folder };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      cloudinary.config().api_secret as string,
    );

    return {
      timestamp,
      signature,
      apiKey: cloudinary.config().api_key as string,
      cloudName: cloudinary.config().cloud_name as string,
      folder,
    };
  }
}
