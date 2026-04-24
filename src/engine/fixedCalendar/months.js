/**
 * Month-counting helpers for the fixed calendar.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **fixed-calendar** (KH 6-10)
 * ═══════════════════════════════════════════════════════════════════
 *
 * All month counts here are elapsed mean synodic months — the
 * quantity that multiplies into the molad interval. They do NOT
 * consult dehiyot; this is the "mean" reckoning. Per docs/
 * OPEN_QUESTIONS.md Q2, these numbers belong strictly to the
 * fixed-calendar regime and must not be mixed with the astronomical
 * day-count coming out of `daysFromEpoch`.
 */
import {
  LEAP_YEARS_IN_CYCLE,
  YEARS_IN_CYCLE,
  MONTHS_IN_CYCLE,
  HEBCAL_MONTH,
} from './constants.js';

/**
 * Is Hebrew year Y a leap year?
 *
 * Standard Metonic rule equivalent to KH 6:11's list: years 3, 6, 8,
 * 11, 14, 17, 19 in each 19-year cycle have 13 months (Adar I + Adar
 * II). Expressed algebraically: `(7Y + 1) mod 19 < 7`.
 */
export function isHebrewLeapYear(year) {
  return (((7 * year) + 1) % YEARS_IN_CYCLE) < 7;
}

/**
 * Number of months in Hebrew year Y (12 or 13).
 */
export function monthsInYear(year) {
  return isHebrewLeapYear(year) ? 13 : 12;
}

/**
 * Integer count of mean moladot from molad Tishrei of year 1 (= BaHaRaD)
 * up to molad Tishrei of the given year (exclusive — i.e., elapsed
 * moladot before Tishrei of year Y begins).
 *
 * Uses the 19-year cycle (235 months per cycle) for efficiency; the
 * remainder iterates at most 18 times.
 */
export function monthsFromYear1ToTishrei(year) {
  if (year < 1) throw new Error(`Hebrew year must be >= 1, got ${year}`);
  const fullCycles = Math.floor((year - 1) / YEARS_IN_CYCLE);
  const remainder = (year - 1) % YEARS_IN_CYCLE;
  let months = fullCycles * MONTHS_IN_CYCLE;
  for (let i = 1; i <= remainder; i++) {
    months += monthsInYear(i + fullCycles * YEARS_IN_CYCLE);
  }
  return months;
}

/**
 * Position of a hebcal-numbered month within its Hebrew year, where
 * Tishrei = 0, Cheshvan = 1, ..., Elul = last (11 in non-leap, 12 in
 * leap).
 *
 * Why this exists: hebcal numbers months starting from Nisan (= 1),
 * but the Hebrew year begins in Tishrei. So Nisan of year Y is the
 * SIXTH or SEVENTH month of year Y's molad sequence, not the first.
 */
export function monthPositionInYear(hebcalMonth, year) {
  const { TISHREI, NISAN, ADAR_I, ADAR_II } = HEBCAL_MONTH;
  if (hebcalMonth >= TISHREI) {
    // Tishrei .. Adar (or Adar I if leap)
    // Position: Tishrei = 0, Cheshvan = 1, ..., Adar = 5, Adar II = 6
    return hebcalMonth - TISHREI;
  }
  // Nisan (=1) .. Elul (=6): the back half of the year
  // In a non-leap year, Adar = index 5, then Nisan = index 6.
  // In a leap year, Adar II = index 6, then Nisan = index 7.
  const leap = isHebrewLeapYear(year);
  const nisanOffset = leap ? 7 : 6;
  return nisanOffset + (hebcalMonth - NISAN);
}

/**
 * Integer count of mean moladot from BaHaRaD (molad Tishrei year 1)
 * up to and INCLUDING the molad of the given Hebrew date's month.
 *
 * e.g., the molad of Nisan 5786 is number `monthsFromYear1ToTishrei(5786)
 * + 6 = X`, which when multiplied by the synodic interval gives the
 * molad instant.
 *
 * Note: "up to the molad of month X" means BaHaRaD is molad #0, and
 * the Nth molad is BaHaRaD + N × SYNODIC_MONTH. This function returns
 * N for the given date's month.
 */
export function monthsSinceBaharad(hDate) {
  const year = hDate.getFullYear();
  const hebcalMonth = hDate.getMonth();
  return monthsFromYear1ToTishrei(year) + monthPositionInYear(hebcalMonth, year);
}
