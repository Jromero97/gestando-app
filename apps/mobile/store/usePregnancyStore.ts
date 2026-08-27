import { create } from 'zustand';
import { GestationalAge, Appointment } from '../types/pregnancy';
import { fetchGestationalAge, fetchNextAppointment } from '../services/pregnancyService';
import { getApiErrorMessage } from '../services/apiError';

interface PregnancyState {
  gestationalAge: GestationalAge | null;
  nextAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
  setNextAppointment: (appointment: Appointment) => void;
}

export const usePregnancyStore = create<PregnancyState>((set) => ({
  gestationalAge: null,
  nextAppointment: null,
  isLoading: false,
  error: null,

  loadDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const [gestationalAge, nextAppointment] = await Promise.all([
        fetchGestationalAge(),
        fetchNextAppointment(),
      ]);
      set({ gestationalAge, nextAppointment, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: getApiErrorMessage(err) });
    }
  },

  setNextAppointment: (appointment) => set({ nextAppointment: appointment }),
}));
