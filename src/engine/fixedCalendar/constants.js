/**
 * Fixed-calendar constants — Rambam KH 6.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **fixed-calendar** (KH 6-10)
 *  SURFACE CATEGORY: Rambam-published values
 * ═══════════════════════════════════════════════════════════════════
 * Every number in this file is the Rambam's own, verbatim. See the
 * per-constant citation.
 *
 * The fixed calendar is a separate computational system from the
 * astronomical pipeline (KH 11-17). See docs/OPEN_QUESTIONS.md Q2.
 * These constants MUST NOT be used inside astronomical computations.
 * The only legitimate crossing point is `daysFromEpoch` — see Q1.
 */

// [R] KH 6:8 — "Molad Tishrei of year 1 of creation — the night of
// Monday, 5 hours and 204 parts into the day." BaHaRaD = ב'ה'רד =
// day 2, hour 5, part 204, using the Hebrew convention that the day
// starts at 6 PM the previous civil evening.
export const BAHARAD = Object.freeze({
  dayOfWeek: 2,   // 2 = Monday (Sunday = 1)
  hours: 5,       // hours past the start of the Hebrew day (6 PM civil)
  parts: 204,     // chalakim within the hour (1080 chalakim = 1 hour)
});

// [R] KH 6:3 — "The duration of the mean synodic month is 29 days,
// 12 hours, and 793 parts."
export const SYNODIC_MONTH = Object.freeze({
  days: 29,
  hours: 12,
  parts: 793,
});

// Unit conversions (fixed by the Rambam's own definitions — KH 6:2)
export const PARTS_PER_HOUR = 1080;
export const HOURS_PER_DAY = 24;
export const PARTS_PER_DAY = PARTS_PER_HOUR * HOURS_PER_DAY; // 25,920

// Synodic month in fractional days. Used for converting day-count.
// NOT the primary representation — that's d/h/p — but convenient
// for arithmetic interoperability with the astronomical pipeline.
export const SYNODIC_MONTH_DAYS =
  SYNODIC_MONTH.days
  + SYNODIC_MONTH.hours / HOURS_PER_DAY
  + SYNODIC_MONTH.parts / PARTS_PER_DAY;

// BaHaRaD expressed as parts-since-day-1-00:00. Useful when adding
// integer-parts of month-interval to step forward in time without
// floating-point drift.
export const BAHARAD_PARTS_OFFSET =
  (BAHARAD.dayOfWeek - 1) * PARTS_PER_DAY
  + BAHARAD.hours * PARTS_PER_HOUR
  + BAHARAD.parts;

// Synodic month in parts — exact integer, no float drift.
export const SYNODIC_MONTH_PARTS =
  SYNODIC_MONTH.days * PARTS_PER_DAY
  + SYNODIC_MONTH.hours * PARTS_PER_HOUR
  + SYNODIC_MONTH.parts;

// Parts in a week — for reducing molad times to day-of-week.
export const PARTS_PER_WEEK = 7 * PARTS_PER_DAY;

// [R] KH 6:11 — "Every 19 years contain 235 months: 12 years of 12
// months and 7 years of 13 months. The leap years are the 3rd, 6th,
// 8th, 11th, 14th, 17th, and 19th of the cycle."
export const LEAP_YEARS_IN_CYCLE = Object.freeze([3, 6, 8, 11, 14, 17, 19]);
export const YEARS_IN_CYCLE = 19;
export const MONTHS_IN_CYCLE = 235; // 12 × 12 + 13 × 7

// Hebrew month numbering: hebcal uses 1 = Nisan, 7 = Tishrei. The
// calendrical year starts at Tishrei, so Tishrei is the zeroth month
// of a new Hebrew year even though its hebcal index is 7.
export const HEBCAL_MONTH = Object.freeze({
  NISAN: 1,
  IYAR: 2,
  SIVAN: 3,
  TAMUZ: 4,
  AV: 5,
  ELUL: 6,
  TISHREI: 7,
  CHESHVAN: 8,
  KISLEV: 9,
  TEVET: 10,
  SHVAT: 11,
  ADAR_I: 12,  // Adar in non-leap years; Adar I in leap years
  ADAR_II: 13, // only in leap years
});

export const HEBREW_DAY_NAMES = Object.freeze([
  'Sunday',   // 1
  'Monday',   // 2
  'Tuesday',  // 3
  'Wednesday',// 4
  'Thursday', // 5
  'Friday',   // 6
  'Saturday', // 7
]);

export const HEBREW_DAY_NAMES_HEBREW = Object.freeze([
  'יום א',
  'יום ב',
  'יום ג',
  'יום ד',
  'יום ה',
  'יום ו',
  'שבת',
]);
