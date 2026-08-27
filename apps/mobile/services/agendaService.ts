import { api } from './api';
import { Appointment, AppointmentStatus, Exam, ExamCategory } from '../types/pregnancy';

interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const { data } = await api.get<Page<Appointment>>('/appointments', { params: { page: 1, limit: 50 } });
  return data.items;
}

export interface CreateAppointmentInput {
  title: string;
  date: string;
  doctorName?: string;
  location?: string;
  notes?: string;
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const { data } = await api.post<Appointment>('/appointments', input);
  return data;
}

export async function deleteAppointment(id: string): Promise<void> {
  await api.delete(`/appointments/${id}`);
}

export async function updateAppointment(id: string, input: CreateAppointmentInput): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}`, input);
  return data;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}`, { status });
  return data;
}

export async function confirmAppointment(id: string): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}`, { confirmed: true });
  return data;
}

export interface AppointmentResultsInput {
  bloodPressure?: string;
  uterineHeightCm?: number;
  fetalHeartRateBpm?: number;
  estimatedBabyWeightG?: number;
  resultsFileUrl?: string;
  resultsFileName?: string;
}

export async function updateAppointmentResults(id: string, input: AppointmentResultsInput): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}`, input);
  return data;
}

export async function fetchExams(): Promise<Exam[]> {
  const { data } = await api.get<Page<Exam>>('/exams', { params: { page: 1, limit: 50 } });
  return data.items;
}

export interface CreateExamInput {
  title: string;
  date: string;
  category: ExamCategory;
  notes?: string;
}

export async function createExam(input: CreateExamInput): Promise<Exam> {
  const { data } = await api.post<Exam>('/exams', input);
  return data;
}

export async function deleteExam(id: string): Promise<void> {
  await api.delete(`/exams/${id}`);
}
