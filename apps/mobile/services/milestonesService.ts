import { api } from './api';
import { MilestonePhoto } from '../types/pregnancy';

export async function fetchMilestones(): Promise<MilestonePhoto[]> {
  const { data } = await api.get<MilestonePhoto[]>('/milestones');
  return data;
}

export interface CreateMilestoneInput {
  weekNumber: number;
  photoUrl: string;
  weight?: number;
  bellyCircumference?: number;
  notes?: string;
}

export async function createMilestone(input: CreateMilestoneInput): Promise<MilestonePhoto> {
  const { data } = await api.post<MilestonePhoto>('/milestones', input);
  return data;
}

export async function deleteMilestone(id: string): Promise<void> {
  await api.delete(`/milestones/${id}`);
}
