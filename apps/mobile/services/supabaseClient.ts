import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Only used for Storage (uploadToSignedUrl); the app's auth is the backend's own JWT.
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  { auth: { persistSession: false } },
);
