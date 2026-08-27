const DAY_MS = 24 * 60 * 60 * 1000;
const FULL_TERM_DAYS = 280; // 40 weeks, Naegele's rule

/**
 * Given an ultrasound date and the gestational age measured at that scan
 * (weeks + days), derives the equivalent LMP and due date.
 */
export function datesFromUltrasound(ultrasoundDate: Date, weeksAtScan: number, daysAtScan: number) {
  const gestationalDaysAtScan = weeksAtScan * 7 + daysAtScan;
  const lastMenstrualPeriod = new Date(ultrasoundDate.getTime() - gestationalDaysAtScan * DAY_MS);
  const dueDate = new Date(lastMenstrualPeriod.getTime() + FULL_TERM_DAYS * DAY_MS);
  return { lastMenstrualPeriod, dueDate };
}

export function dueDateFromLmp(lastMenstrualPeriod: Date): Date {
  return new Date(lastMenstrualPeriod.getTime() + FULL_TERM_DAYS * DAY_MS);
}

export function gestationalAgeAt(lastMenstrualPeriod: Date, referenceDate: Date): { weeks: number; days: number } {
  const totalDays = Math.floor((referenceDate.getTime() - lastMenstrualPeriod.getTime()) / DAY_MS);
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7 };
}
