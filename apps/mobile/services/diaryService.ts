import { api } from './api';
import { DayData, DayMark, DiaryEntry, DiaryMood, DiaryPhoto, Symptom } from '../types/pregnancy';

/** Days of the month with content, categorized as appointment/photo/symptoms (for the multi-dot calendar) */
export async function fetchMonthMarks(year: number, month: number): Promise<DayMark[]> {
  const { data } = await api.get<DayMark[]>('/diary/month', { params: { year, month } });
  return data;
}

export async function fetchDay(date: string): Promise<DayData> {
  const { data } = await api.get<DayData>('/diary/day', { params: { date } });
  return data;
}

export interface UpsertDiaryEntryInput {
  date: string;
  note?: string;
  photoUrl?: string;
  mood?: DiaryMood;
  symptoms?: Symptom[];
  weightKg?: number;
  babyMovementsCount?: number;
  sleepHours?: number;
  audioUrl?: string;
}

export async function upsertDiaryEntry(input: UpsertDiaryEntryInput): Promise<DiaryEntry> {
  const { data } = await api.put<DiaryEntry>('/diary/day', input);
  return data;
}

export async function addDiaryPhoto(date: string, photoUrl: string, caption?: string): Promise<DiaryPhoto> {
  const { data } = await api.post<DiaryPhoto>('/diary/photos', { date, photoUrl, caption });
  return data;
}

export async function removeDiaryPhoto(photoId: string): Promise<void> {
  await api.delete(`/diary/photos/${photoId}`);
}
