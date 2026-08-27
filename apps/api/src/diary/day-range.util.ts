import { BadRequestException } from '@nestjs/common';

/** Normalizes "YYYY-MM-DD" (or any ISO string) to UTC midnight of that day. */
export function toDayStart(dateStr: string): Date {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(dateStr);
  if (!match) {
    throw new BadRequestException(`Invalid date: ${dateStr}`);
  }
  return new Date(`${match[1]}T00:00:00.000Z`);
}

export function toDayRange(dateStr: string): { start: Date; end: Date } {
  const start = toDayStart(dateStr);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
