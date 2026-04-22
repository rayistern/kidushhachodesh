/**
 * Hebrew-native day counter from the Rambam's epoch (3 Nisan 4938 AM).
 *
 * Why this exists: the Rambam's formulas in KH 12-17 all start with
 * "days since the beginning of the count" — a HEBREW-calendar day count.
 * Any round-trip through the Gregorian or Julian civil calendar is a
 * conversion bug waiting to happen (and was). hebcal's HDate.abs() gives
 * us the Rata Die absolute-day number of any Hebrew date directly; the
 * difference is unambiguous.
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
