/**
 * Tekufat Nisan, four ways — his two traditions, his own true sun, and
 * the real sky.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **crossing** — [R] Shmuel/Rav Adda anchors and the
 *  engine's true sun; [M] the real equinox. Surfaces must label rows.
 *  SURFACE CATEGORY: internal lib (teaching aid)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Everything is anchored to the molad of Nisan of year 1 (BaHaRaD + 6
 * months), which both chapters state their anchors against: Shmuel's
 * tekufah 7d 9h 642p before it (KH 9:3), Rav Adda's 9h 642p before it
 * (KH 10:3). Absolute time is Rata Die float days; at 5,786 years the
 * double still carries sub-second precision.
 */
import hebcal from 'hebcal';
import {
  PARTS_PER_DAY,
  PARTS_PER_HOUR,
  SYNODIC_MONTH_PARTS,
} from '../engine/fixedCalendar/constants';
import { getFullCalculation } from '../engine/pipeline';
import { dateFromEpochDays, daysFromEpoch } from '../engine/epochDays';
import { modernSunLongitude } from './modernAstronomy';

const A1 = new hebcal.HDate(1, 'Tishrei', 1).abs();
// BaHaRaD as float R.D. days — the Hebrew day begins at 18:00 of the
// previous civil day.
const MOLAD_TISHREI_1 = A1 - 1 + 18 / 24 + (5 + 204 / 1080) / 24;
const MOLAD_NISAN_1 = MOLAD_TISHREI_1 + (6 * SYNODIC_MONTH_PARTS) / PARTS_PER_DAY;

export const SHMUEL_YEAR_DAYS = 365.25; // exactly — which is the Julian year
export const ADDA_YEAR_DAYS =
  ((365 * PARTS_PER_DAY + 5 * PARTS_PER_HOUR + 997) * 76 + 48) / 76 / PARTS_PER_DAY;

/** Shmuel's tekufat Nisan of a year, as float R.D. days. */
export function shmuelNisanRd(year) {
  return MOLAD_NISAN_1 - (7 + (9 + 642 / 1080) / 24) + (year - 1) * SHMUEL_YEAR_DAYS;
}

/** Rav Adda's tekufat Nisan of a year, as float R.D. days. */
export function addaNisanRd(year) {
  return MOLAD_NISAN_1 - (9 + 642 / 1080) / 24 + (year - 1) * ADDA_YEAR_DAYS;
}

export const rdToDate = (rd) => new Date((rd - 719163) * 86400000);
export const dateToRd = (d) => d.getTime() / 86400000 + 719163;

/**
 * The Rambam's OWN tekufah — his true sun crossing 0°, the third and
 * finest method, KH 13:11. Whole days, because his day count is.
 */
export function rambamTrueNisanRd(year) {
  const guess = daysFromEpoch(rdToDate(shmuelNisanRd(year)));
  let prev = null;
  for (let n = guess - 45; n < guess + 20; n++) {
    const t = getFullCalculation(dateFromEpochDays(n)).sun.trueLongitude;
    if (prev !== null && prev > 300 && t < 60) return dateToRd(dateFromEpochDays(n));
    prev = t;
  }
  return null;
}

/** The real equinox nearest that spring, hourly precision. */
export function realNisanRd(year) {
  let t = rdToDate(shmuelNisanRd(year) - 35).getTime();
  let prev = modernSunLongitude(new Date(t));
  for (let h = 1; h < 24 * 70; h++) {
    const tt = t + h * 3600000;
    const L = modernSunLongitude(new Date(tt));
    if (prev > 300 && L < 60) return dateToRd(new Date(tt));
    prev = L;
  }
  return null;
}
