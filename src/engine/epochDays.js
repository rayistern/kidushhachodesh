/**
 * Hebrew-native day counter from the Rambam's epoch (3 Nisan 4938 AM).
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **crossing** (fixed-calendar → astronomical)
 * ═══════════════════════════════════════════════════════════════════
 * This file is the SINGLE boundary point between the two computational
 * systems inside Kidush HaChodesh. See docs/OPEN_QUESTIONS.md Q1–Q2.
 *
 *   upstream (what `daysFromEpoch` consumes):
 *     Fixed calendar (KH 6-10) — hebcal's HDate.abs() runs Hillel II's
 *     arithmetic (BaHaRaD + year arithmetic + dehiyot) to locate the
 *     epoch and target dates as specific absolute days.
 *
 *   downstream (what `daysFromEpoch` feeds):
 *     Astronomical pipeline (KH 12-17) — daily motions × this integer
 *     day count → mean longitudes → corrections → true longitudes.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  WHY NOT MEAN-SYNODIC TIME?
 * ═══════════════════════════════════════════════════════════════════
 * KH 12:1 says "count whole days from the epoch" — an integer civil-
 * day count. The user who reported the 309,716 / 309,717 discrepancy
 * on 2026-04-23 had computed mean-synodic-month × 10,488 = 309,716.87
 * days, which is a correct *mean-molad-clock* number but the WRONG
 * input for KH 12:1. Dehiyot (KH 7) introduce ~0.13 of a day of drift
 * between civil-day count and mean-molad time over 848 years.
 *
 * Why this exists mechanically: the Rambam's formulas in KH 12-17 all
 * start with "days since the beginning of the count" — a HEBREW-
 * calendar day count. Any round-trip through the Gregorian or Julian
 * civil calendar is a conversion bug waiting to happen (and was).
 * hebcal's HDate.abs() gives us the Rata Die absolute-day number of
 * any Hebrew date directly; the difference is unambiguous.
 */
import hebcal from 'hebcal';
import { CONSTANTS } from './constants.js';

const { HDate } = hebcal;

const EPOCH_ABS = new HDate(
  CONSTANTS.EPOCH_HEBREW.day,
  CONSTANTS.EPOCH_HEBREW.month,
  CONSTANTS.EPOCH_HEBREW.year,
).abs();

/**
 * Integer Hebrew-calendar days from the Rambam's epoch to the given date.
 * Accepts a JS Date, an HDate, or a millisecond timestamp.
 */
export function daysFromEpoch(date) {
  const hd = date instanceof HDate ? date : new HDate(date instanceof Date ? date : new Date(date));
  return hd.abs() - EPOCH_ABS;
}

export { HDate, EPOCH_ABS };
