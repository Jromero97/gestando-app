import { api } from './api';
import { PregnancyCondition, PregnancyCount, PregnancyProfile } from '../types/pregnancy';

export async function fetchProfile(): Promise<PregnancyProfile | null> {
  try {
    const { data } = await api.get<PregnancyProfile>('/pregnancy/profile');
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export interface UpsertProfileInput {
  dueDate: string;
  lastMenstrualPeriod?: string;
  babyName?: string;
  notes?: string;
  isFirstPregnancy?: boolean;
  babyCount?: PregnancyCount;
  conditions?: PregnancyCondition[];
  primaryDoctorName?: string;
  primaryClinicName?: string;
  reminderAppointments?: boolean;
  reminderWeighIn?: boolean;
  reminderDiaryNote?: boolean;
  reminderDiaryNoteTime?: string;
}

export async function upsertProfile(input: UpsertProfileInput): Promise<PregnancyProfile> {
  const { data } = await api.put<PregnancyProfile>('/pregnancy/profile', input);
  return data;
}
