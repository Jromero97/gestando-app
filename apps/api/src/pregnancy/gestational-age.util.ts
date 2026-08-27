const DAYS_PER_WEEK = 7;
const FULL_TERM_DAYS = 280; // 40 weeks, Naegele's rule

export interface GestationalAge {
  weeks: number;
  days: number;
  trimester: 1 | 2 | 3;
  totalDaysPregnant: number;
  daysUntilDueDate: number;
  dueDate: Date;
}

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

function trimesterFromWeek(week: number): 1 | 2 | 3 {
  if (week < 14) return 1;
  if (week < 28) return 2;
  return 3;
}

/**
 * Computes gestational age from the LMP if present, otherwise derives an
 * effective LMP from the due date (dueDate - 280 days, Naegele's rule).
 */
export function calculateGestationalAge(
  params: { lastMenstrualPeriod?: Date | null; dueDate: Date },
  referenceDate: Date = new Date(),
): GestationalAge {
  const { lastMenstrualPeriod, dueDate } = params;

  const effectiveLmp = lastMenstrualPeriod ?? new Date(dueDate.getTime() - FULL_TERM_DAYS * 86400000);

  const totalDaysPregnant = daysBetween(effectiveLmp, referenceDate);
  const weeks = Math.floor(totalDaysPregnant / DAYS_PER_WEEK);
  const days = totalDaysPregnant % DAYS_PER_WEEK;

  return {
    weeks,
    days,
    trimester: trimesterFromWeek(weeks),
    totalDaysPregnant,
    daysUntilDueDate: daysBetween(referenceDate, dueDate),
    dueDate,
  };
}
