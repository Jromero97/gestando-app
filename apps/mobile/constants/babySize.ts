import i18n from '../i18n';

export interface BabySize {
  comparison: string;
  lengthCm: number;
  weightG: number;
}

/** Reference sizes per week (typical size comparisons used in pregnancy apps). */
const BABY_SIZE_BY_WEEK: Record<number, { lengthCm: number; weightG: number }> = {
  4: { lengthCm: 0.1, weightG: 0 },
  5: { lengthCm: 0.3, weightG: 0 },
  6: { lengthCm: 0.6, weightG: 1 },
  7: { lengthCm: 1.3, weightG: 2 },
  8: { lengthCm: 1.6, weightG: 3 },
  9: { lengthCm: 2.3, weightG: 4 },
  10: { lengthCm: 3.1, weightG: 7 },
  11: { lengthCm: 4.1, weightG: 14 },
  12: { lengthCm: 5.4, weightG: 19 },
  13: { lengthCm: 7.4, weightG: 25 },
  14: { lengthCm: 8.7, weightG: 43 },
  15: { lengthCm: 10.1, weightG: 70 },
  16: { lengthCm: 11.6, weightG: 100 },
  17: { lengthCm: 13, weightG: 140 },
  18: { lengthCm: 14.2, weightG: 190 },
  19: { lengthCm: 15.3, weightG: 240 },
  20: { lengthCm: 25.6, weightG: 300 },
  21: { lengthCm: 26.7, weightG: 360 },
  22: { lengthCm: 27.8, weightG: 430 },
  23: { lengthCm: 28.9, weightG: 500 },
  24: { lengthCm: 30, weightG: 600 },
  25: { lengthCm: 34.6, weightG: 660 },
  26: { lengthCm: 35.6, weightG: 760 },
  27: { lengthCm: 36.6, weightG: 875 },
  28: { lengthCm: 37.6, weightG: 1000 },
  29: { lengthCm: 38.6, weightG: 1150 },
  30: { lengthCm: 39.9, weightG: 1300 },
  31: { lengthCm: 41.1, weightG: 1500 },
  32: { lengthCm: 42.4, weightG: 1700 },
  33: { lengthCm: 43.7, weightG: 1900 },
  34: { lengthCm: 45, weightG: 2150 },
  35: { lengthCm: 46.2, weightG: 2380 },
  36: { lengthCm: 47.4, weightG: 2620 },
  37: { lengthCm: 48.6, weightG: 2860 },
  38: { lengthCm: 49.8, weightG: 3080 },
  39: { lengthCm: 50.7, weightG: 3290 },
  40: { lengthCm: 51.2, weightG: 3460 },
  41: { lengthCm: 51.5, weightG: 3600 },
  42: { lengthCm: 51.7, weightG: 3700 },
};

export function getBabySizeForWeek(week: number): BabySize {
  const clamped = Math.min(Math.max(week, 4), 42);
  const { lengthCm, weightG } = BABY_SIZE_BY_WEEK[clamped];
  return { comparison: i18n.t(`babySize.${clamped}`), lengthCm, weightG };
}
