import { api } from './api';

interface AuthResponse {
  accessToken: string;
}

export async function login(email: string, password: string): Promise<string> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data.accessToken;
}

export async function register(
  email: string,
  password: string,
  acceptedPrivacyPolicy: boolean,
  consentedToHealthData: boolean,
): Promise<string> {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    email,
    password,
    acceptedPrivacyPolicy,
    consentedToHealthData,
  });
  return data.accessToken;
}
