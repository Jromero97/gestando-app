export interface UserProfile {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  heightCm?: number | null;
  prePregnancyWeightKg?: number | null;
  preferredLocale?: string;
}

export interface GestationalAge {
  weeks: number;
  days: number;
  trimester: 1 | 2 | 3;
  totalDaysPregnant: number;
  daysUntilDueDate: number;
  dueDate: string;
}

export type AppointmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  title: string;
  date: string;
  status: AppointmentStatus;
  confirmed: boolean;
  doctorName?: string;
  location?: string;
  notes?: string;
  bloodPressure?: string | null;
  uterineHeightCm?: number | null;
  fetalHeartRateBpm?: number | null;
  estimatedBabyWeightG?: number | null;
  resultsFileUrl?: string | null;
  resultsFileName?: string | null;
}

export type ExamCategory = 'ULTRASOUND' | 'LAB' | 'GENERAL';

export interface Exam {
  id: string;
  title: string;
  date: string;
  category: ExamCategory;
  fileUrl?: string;
  notes?: string;
}

export type PregnancyCount = 'ONE' | 'TWINS' | 'MORE';

export type PregnancyCondition = 'ANEMIA' | 'GESTATIONAL_DIABETES' | 'HYPERTENSION' | 'THYROID' | 'HIGH_RISK';

export interface PregnancyProfile {
  id: string;
  lastMenstrualPeriod: string | null;
  dueDate: string;
  babyName?: string | null;
  notes?: string | null;
  isFirstPregnancy?: boolean | null;
  babyCount?: PregnancyCount | null;
  conditions: PregnancyCondition[];
  primaryDoctorName?: string | null;
  primaryClinicName?: string | null;
  reminderAppointments: boolean;
  reminderWeighIn: boolean;
  reminderDiaryNote: boolean;
  reminderDiaryNoteTime?: string | null;
}

export interface MilestonePhoto {
  id: string;
  weekNumber: number;
  photoUrl: string;
  weight?: number | null;
  bellyCircumference?: number | null;
  notes?: string | null;
  date: string;
}

export type DiaryMood = 'GREAT' | 'GOOD' | 'OKAY' | 'TIRED' | 'BAD';

export type Symptom =
  | 'NAUSEA'
  | 'HEARTBURN'
  | 'BACK_PAIN'
  | 'INSOMNIA'
  | 'CRAVINGS'
  | 'CRAMPS'
  | 'SWELLING'
  | 'DIZZINESS';

export interface DiaryPhoto {
  id: string;
  photoUrl: string;
  caption?: string | null;
}

export interface DiaryEntry {
  id: string;
  date: string;
  note?: string | null;
  photoUrl?: string | null;
  mood?: DiaryMood | null;
  symptoms: Symptom[];
  weightKg?: number | null;
  babyMovementsCount?: number | null;
  sleepHours?: number | null;
  audioUrl?: string | null;
  photos: DiaryPhoto[];
}

export interface DayMark {
  date: string;
  hasAppointment: boolean;
  hasPhoto: boolean;
  hasSymptoms: boolean;
}

export interface DayData {
  date: string;
  appointments: Appointment[];
  exams: Exam[];
  milestones: MilestonePhoto[];
  diaryEntry: DiaryEntry | null;
}
