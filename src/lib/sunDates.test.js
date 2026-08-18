/**
 * Sun longitude → calendar date, and the season table read as dates.
 *
 * KH 14:5's bands are keyed in degrees, which is exact and tells a reader
 * nothing about when in the year they are. These dates come from running
 * his own true sun backwards — the move he makes himself at KH 13:11 —
 * so the table can show both.
 *
 * The check that matters is the last one: read as dates, his −30′ band
 * must straddle midwinter and his +15′ run must cover summer. If it did
 * not, the whole sunset reading this book offers would be wrong, and no
 * amount of curve-fitting elsewhere would rescue it.
 */
import { describe, it, expect } from 'vitest';
import { dateSunReaches, formatDayMonth, bandDates } from './sunDates';
import { CONSTANTS } from '../engine/constants';

const YEAR = 2026;
const dayOf = (date) =>
  Math.round((date - new Date(date.getFullYear(), 0, 1)) / 86400000) + 1;

describe('finding the date his sun reaches a longitude', () => {
  it('puts the four quarter-points on the seasons', () => {
    expect(formatDayMonth(dateSunReaches(0, YEAR))).toBe('21 Mar');
    expect(formatDayMonth(dateSunReaches(90, YEAR))).toBe('22 Jun');
    expect(formatDayMonth(dateSunReaches(180, YEAR))).toBe('23 Sep');
    expect(formatDayMonth(dateSunReaches(270, YEAR))).toBe('22 Dec');
  });

  it('advances through the year between the two wraps', () => {
    // Only between 0° and 360°: a calendar year starts with the sun near
    // 280°, so day-of-year is NOT monotonic in longitude across the whole
    // year — 320° falls in February, before 10° falls in March. A first
    // version of this test assumed otherwise and duly failed.
    let last = 0;
    for (const lon of [10, 45, 90, 135, 200, 260]) {
      const day = dayOf(dateSunReaches(lon, YEAR));
      expect(day, `${lon}°`).toBeGreaterThan(last);
      last = day;
    }
    // The wrap is at 0°, and a calendar year opens with the sun near
    // 280° — so longitudes above that are reached in Jan-Mar, BEFORE the
    // list above. Two earlier versions of this test got the order wrong.
    for (const lon of [300, 320, 350]) {
      expect(dayOf(dateSunReaches(lon, YEAR)), `${lon}°`).toBeLessThan(
        dayOf(dateSunReaches(10, YEAR)),
      );
    }
  });

  it('handles the wrap at 0° rather than returning nothing', () => {
    for (const lon of [0, 1, 359, 359.5]) {
      expect(dateSunReaches(lon, YEAR), `${lon}°`).toBeTruthy();
    }
  });

  it('normalises a longitude outside 0–360', () => {
    expect(formatDayMonth(dateSunReaches(360, YEAR))).toBe(
      formatDayMonth(dateSunReaches(0, YEAR)),
    );
    expect(formatDayMonth(dateSunReaches(-90, YEAR))).toBe(
      formatDayMonth(dateSunReaches(270, YEAR)),
    );
  });

  it('formats without a year, since the bands repeat annually', () => {
    expect(formatDayMonth(new Date(2026, 3, 5))).toBe('5 Apr');
    expect(formatDayMonth(null)).toBe('—');
  });

  it('is stable across years to within a day or two', () => {
    // The dates are shown as approximate for exactly this reason.
    for (const lon of [0, 90, 180, 270]) {
      const a = dayOf(dateSunReaches(lon, 2026));
      const b = dayOf(dateSunReaches(lon, 2031));
      expect(Math.abs(a - b), `${lon}°`).toBeLessThanOrEqual(2);
    }
  });
});

describe('the season table, read as dates', () => {
  const rows = CONSTANTS.SEASON_CORRECTIONS.map((row) => ({
    ...row,
    ...bandDates(row.sunFrom, row.sunTo, YEAR),
    arcmin: row.adjustment * 60,
  }));

  it('gives every band a readable range', () => {
    for (const row of rows) {
      expect(row.from, `${row.sunFrom}°`).toMatch(/^\d{1,2} [A-Z][a-z]{2}$/);
      expect(row.to, `${row.sunTo}°`).toMatch(/^\d{1,2} [A-Z][a-z]{2}$/);
    }
  });

  it('straddles midwinter with the −30′ band', () => {
    // The load-bearing check. 240°–300° should run from late November to
    // late January, with the solstice inside it.
    const winter = rows.find((row) => row.arcmin === -30);
    expect(winter.sunFrom).toBe(240);
    expect(winter.sunTo).toBe(300);
    expect(winter.from).toMatch(/Nov/);
    expect(winter.to).toMatch(/Jan/);

    const solstice = dayOf(dateSunReaches(270, YEAR));
    const start = dayOf(dateSunReaches(240, YEAR));
    const end = dayOf(dateSunReaches(300, YEAR));
    expect(solstice).toBeGreaterThan(start);
    expect(end).toBeLessThan(start); // wraps into the new year
  });

  it('straddles midsummer with the +30′ band', () => {
    // The mirror of the winter check. 60°-120° should run from late May
    // to late July with the June solstice inside it — which is the
    // reading adopted from the Yemenite manuscripts.
    const summer = rows.find((row) => row.arcmin === 30);
    expect(summer.sunFrom).toBe(60);
    expect(summer.sunTo).toBe(120);
    expect(summer.from).toMatch(/May/);
    expect(summer.to).toMatch(/Jul/);

    const solstice = dayOf(dateSunReaches(90, YEAR));
    expect(solstice).toBeGreaterThan(dayOf(dateSunReaches(60, YEAR)));
    expect(solstice).toBeLessThan(dayOf(dateSunReaches(120, YEAR)));
  });

  it('flanks it with +15′, covering the rest of the warm half', () => {
    const additive = rows.filter((row) => row.arcmin === 15);
    expect(additive).toHaveLength(2);
    expect(additive[0].from).toMatch(/Apr/);
    expect(additive[additive.length - 1].to).toMatch(/Sep/);
  });

  it('leaves the two zero bands on the equinoxes', () => {
    const zeros = rows.filter((row) => row.arcmin === 0);
    const spans = zeros.map((row) => `${row.from}–${row.to}`).join(' ');
    expect(spans).toMatch(/Mar/);
    expect(spans).toMatch(/Sep/);
  });
});

describe('the table is symmetric under the adopted reading', () => {
  it('reaches 30′ in both directions', () => {
    const arcmin = CONSTANTS.SEASON_CORRECTIONS.map((row) => row.adjustment * 60);
    expect(Math.min(...arcmin)).toBe(-30);
    expect(Math.max(...arcmin)).toBe(30);
  });

  it('mirrors band for band, which is the structural case for it', () => {
    // Sefaria's printed reading gives +15/+15/+15 against -15/-30/-15,
    // lopsided for no stated reason. The Yemenite reading makes each
    // additive band the exact negative of the one 180° opposite.
    const at = (lon) => {
      const row = CONSTANTS.SEASON_CORRECTIONS.find(
        (r) => r.sunFrom <= lon && lon < r.sunTo,
      );
      return row.adjustment * 60;
    };
    for (const lon of [30, 90, 140, 170]) {
      // Summed rather than negated: the zero bands give -0, and
      // Object.is(-0, +0) is false.
      expect(at(lon) + at(lon + 180), `${lon}° vs ${lon + 180}°`).toBe(0);
    }
  });

  it('still has nothing bigger than half a degree, per KH 14:5', () => {
    for (const row of CONSTANTS.SEASON_CORRECTIONS) {
      expect(Math.abs(row.adjustment)).toBeLessThanOrEqual(0.5);
    }
  });
});
