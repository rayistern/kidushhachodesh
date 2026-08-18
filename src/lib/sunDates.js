/**
 * Turning a sun longitude back into a calendar date.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** — his own true sun, run backwards
 *  SURFACE CATEGORY: internal lib (teaching aid)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 14:5's table is keyed by where the sun is, in degrees. That is
 * exact and it is also unreadable: "the sun between 15° and 60°" tells a
 * reader nothing about when in the year they are. This converts the
 * boundaries into dates so the table can show both.
 *
 * The conversion is the Rambam's own, run in reverse — the same move he
 * makes at KH 13:11, where finding the sun's place on any date is turned
 * round into finding the date of any equinox or solstice. So the dates
 * here are *his* dates, computed from his tables, not looked up. They
 * land within a day of the real seasons because his circle is anchored
 * to the equinoxes, which is checked in ch14.test.js.
 *
 * ── Why a whole day and no finer ──
 * His true longitude is a step function of the day count: KH 12:1 counts
 * whole days and KH 13:9 rounds the course to whole degrees before the
 * table is read. There is nothing between two days to interpolate, so a
 * date is the finest answer his method carries. TekufahFinder learned
 * this the hard way and its header records it.
 */
import { getFullCalculation } from '../engine/pipeline';

/** One year of his true sun longitudes, built once and kept. */
const cache = new Map();

function longitudesFor(year) {
  if (cache.has(year)) return cache.get(year);
  const days = [];
  const d = new Date(year, 0, 1, 12);
  while (d.getFullYear() === year) {
    days.push({
      date: new Date(d),
      longitude: getFullCalculation(d).sun.trueLongitude,
    });
    d.setDate(d.getDate() + 1);
  }
  cache.set(year, days);
  return days;
}

/**
 * The first day of `year` on which his true sun has reached `longitude`.
 *
 * Returns null if it never does, which cannot happen for a real
 * longitude in a real year but keeps a null out of the caller rather
 * than an undefined.
 */
export function dateSunReaches(longitude, year) {
  const target = ((longitude % 360) + 360) % 360;
  const days = longitudesFor(year);
  for (let i = 1; i < days.length; i++) {
    const prev = days[i - 1].longitude;
    const now = days[i].longitude;
    // The sun advances about a degree a day and wraps once, at 0°.
    const wrapped = now < prev;
    const crossed = wrapped
      ? target <= now || target > prev // the wrap step spans 359°→0°
      : prev < target && target <= now;
    if (crossed) return days[i].date;
  }
  return null;
}

/** "5 Apr" — deliberately no year, since these repeat annually. */
export function formatDayMonth(date) {
  if (!date) return '—';
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * A band of longitudes as a date range, for a table row.
 *
 * The ranges shift by a day either way between years — the calendar and
 * the sun do not divide evenly — so callers should present these as
 * approximate. `SeasonBands` prefixes them with "≈".
 */
export function bandDates(fromDeg, toDeg, year) {
  return {
    from: formatDayMonth(dateSunReaches(fromDeg, year)),
    to: formatDayMonth(dateSunReaches(toDeg, year)),
  };
}
