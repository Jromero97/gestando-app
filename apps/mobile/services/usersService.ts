import { api } from './api';
import { UserProfile } from '../types/pregnancy';

export async function fetchMe(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/users/me');
  return data;
}

export interface UpdateMeInput {
  firstName?: string;
  lastName?: string;
  heightCm?: number;
  prePregnancyWeightKg?: number;
  preferredLocale?: string;
}

export async function updateMe(input: UpdateMeInput): Promise<UserProfile> {
  const { data } = await api.patch<UserProfile>('/users/me', input);
  return data;
}

export async function deleteMe(password: string): Promise<void> {
  await api.delete('/users/me', { data: { password } });
}

export async function withdrawHealthDataConsent(password: string): Promise<void> {
  await api.delete('/users/me/health-data', { data: { password } });
}
