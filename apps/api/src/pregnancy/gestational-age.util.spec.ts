import { calculateGestationalAge } from './gestational-age.util';

describe('calculateGestationalAge', () => {
  it('computes weeks/days from LMP', () => {
    const lmp = new Date('2026-02-01T00:00:00.000Z');
    const reference = new Date('2026-08-21T00:00:00.000Z'); // 201 days later
    const dueDate = new Date('2026-11-08T00:00:00.000Z');

    const result = calculateGestationalAge({ lastMenstrualPeriod: lmp, dueDate }, reference);

    expect(result.totalDaysPregnant).toBe(201);
    expect(result.weeks).toBe(28);
    expect(result.days).toBe(5);
    expect(result.trimester).toBe(3);
  });

  it('derives an effective LMP from the due date when none is provided', () => {
    const dueDate = new Date('2026-11-08T00:00:00.000Z');
    const reference = new Date('2026-08-21T00:00:00.000Z');

    const withLmp = calculateGestationalAge(
      { lastMenstrualPeriod: new Date(dueDate.getTime() - 280 * 86400000), dueDate },
      reference,
    );
    const withoutLmp = calculateGestationalAge({ lastMenstrualPeriod: null, dueDate }, reference);

    expect(withoutLmp).toEqual(withLmp);
  });

  it('assigns trimester 1 before week 14', () => {
    const dueDate = new Date('2027-01-01T00:00:00.000Z');
    const lmp = new Date(dueDate.getTime() - 280 * 86400000);
    const reference = new Date(lmp.getTime() + 10 * 7 * 86400000); // week 10

    const result = calculateGestationalAge({ lastMenstrualPeriod: lmp, dueDate }, reference);

    expect(result.weeks).toBe(10);
    expect(result.trimester).toBe(1);
  });

  it('assigns trimester 2 between week 14 and 27', () => {
    const dueDate = new Date('2027-01-01T00:00:00.000Z');
    const lmp = new Date(dueDate.getTime() - 280 * 86400000);
    const reference = new Date(lmp.getTime() + 20 * 7 * 86400000);

    const result = calculateGestationalAge({ lastMenstrualPeriod: lmp, dueDate }, reference);

    expect(result.trimester).toBe(2);
  });

  it('computes days remaining until the due date (can be negative if overdue)', () => {
    const reference = new Date('2026-08-21T00:00:00.000Z');
    const dueDate = new Date('2026-08-11T00:00:00.000Z'); // 10 days in the past
    const lmp = new Date(dueDate.getTime() - 280 * 86400000);

    const result = calculateGestationalAge({ lastMenstrualPeriod: lmp, dueDate }, reference);

    expect(result.daysUntilDueDate).toBe(-10);
  });
});
