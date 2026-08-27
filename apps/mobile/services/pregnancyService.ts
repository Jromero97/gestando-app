import { api } from './api';
import { Appointment, GestationalAge } from '../types/pregnancy';

export async function fetchGestationalAge(): Promise<GestationalAge> {
  const { data } = await api.get<GestationalAge>('/pregnancy/gestational-age');
  return data;
}

export async function fetchNextAppointment(): Promise<Appointment | null> {
  const { data } = await api.get<{ items: Appointment[] }>('/appointments', {
    params: { page: 1, limit: 1, fromDate: new Date().toISOString() },
  });
  return data.items[0] ?? null;
}
