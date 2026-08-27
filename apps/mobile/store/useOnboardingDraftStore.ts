import { create } from 'zustand';
import { PregnancyCondition, PregnancyCount } from '../types/pregnancy';

interface OnboardingDraft {
  dueDate: Date;
  lastMenstrualPeriod: Date | null;
  babyName: string;
  isFirstPregnancy?: boolean;
  babyCount?: PregnancyCount;
  conditions: PregnancyCondition[];
  primaryDoctorName: string;
  primaryClinicName: string;
  reminderAppointments: boolean;
  reminderWeighIn: boolean;
  reminderDiaryNote: boolean;
  reminderDiaryNoteTime: string;
}

interface OnboardingDraftState extends OnboardingDraft {
  setDates: (dueDate: Date, lastMenstrualPeriod: Date | null) => void;
  setBabyName: (babyName: string) => void;
  setPregnancyDetails: (details: {
    isFirstPregnancy?: boolean;
    babyCount?: PregnancyCount;
    conditions?: PregnancyCondition[];
  }) => void;
  toggleCondition: (condition: PregnancyCondition) => void;
  setMedicalTeam: (primaryDoctorName: string, primaryClinicName: string) => void;
  setReminders: (reminders: Partial<Pick<OnboardingDraft, 'reminderAppointments' | 'reminderWeighIn' | 'reminderDiaryNote' | 'reminderDiaryNoteTime'>>) => void;
  reset: () => void;
}

const DEFAULT_DRAFT: OnboardingDraft = {
  dueDate: new Date(),
  lastMenstrualPeriod: null,
  babyName: '',
  isFirstPregnancy: undefined,
  babyCount: undefined,
  conditions: [],
  primaryDoctorName: '',
  primaryClinicName: '',
  reminderAppointments: true,
  reminderWeighIn: true,
  reminderDiaryNote: false,
  reminderDiaryNoteTime: '21:00',
};

/** In-memory only (not persisted): holds wizard steps 2-4 until the final submit on step 4. */
export const useOnboardingDraftStore = create<OnboardingDraftState>((set, get) => ({
  ...DEFAULT_DRAFT,

  setDates: (dueDate, lastMenstrualPeriod) => set({ dueDate, lastMenstrualPeriod }),
  setBabyName: (babyName) => set({ babyName }),
  setPregnancyDetails: (details) => set(details),
  toggleCondition: (condition) => {
    const { conditions } = get();
    set({
      conditions: conditions.includes(condition)
        ? conditions.filter((c) => c !== condition)
        : [...conditions, condition],
    });
  },
  setMedicalTeam: (primaryDoctorName, primaryClinicName) => set({ primaryDoctorName, primaryClinicName }),
  setReminders: (reminders) => set(reminders),
  reset: () => set(DEFAULT_DRAFT),
}));
