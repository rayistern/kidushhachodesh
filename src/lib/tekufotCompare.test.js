/**
 * The four-way tekufah comparison, pinned before any card displays it.
 */
import { describe, it, expect } from 'vitest';
import {
  shmuelNisanRd,
  addaNisanRd,
  rambamTrueNisanRd,
  realNisanRd,
  rdToDate,
  SHMUEL_YEAR_DAYS,
  ADDA_YEAR_DAYS,
} from './tekufotCompare';
import { shmuelTekufatNisan } from '../components/book/interactives/SeasonLadder';

describe('internal consistency', () => {
  it("the absolute Shmuel tekufah lands on the weekday the parts arithmetic says", () => {
    // Two independent routes — float R.D. days against integer parts.
    for (const year of [4930, 4938, 5786]) {
      const rd = shmuelNisanRd(year);
      // Hebrew day containing the instant: evening rolls the day forward.
      const civil = Math.floor(rd);
      const intoDay = rd - civil; // 0 = midnight
      const hebrewDayRd = intoDay >= 0.75 ? civil + 1 : civil;
      const weekday = ((hebrewDayRd % 7) + 7) % 7; // R.D. 1 = Monday → 1
      const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbat'];
      expect(names[weekday], `year ${year}`).toBe(shmuelTekufatNisan(year).dayName);
    }
  });

  it("Shmuel's year IS the Julian year, exactly", () => {
    expect(SHMUEL_YEAR_DAYS).toBe(365.25);
  });
});

describe('the four values for 5786', () => {
  it('fall where the sweep found them', () => {
    expect(rdToDate(shmuelNisanRd(5786)).toISOString().slice(0, 10)).toBe('2026-04-08');
    expect(rdToDate(addaNisanRd(5786)).toISOString().slice(0, 10)).toBe('2026-03-27');
    expect(rdToDate(rambamTrueNisanRd(5786)).toISOString().slice(0, 10)).toBe('2026-03-21');
    expect(rdToDate(realNisanRd(5786)).toISOString().slice(0, 10)).toBe('2026-03-20');
  });

  it('gaps against the real sky: ~18.4 / ~7.0 days — and his true sun within a day', () => {
    const real = realNisanRd(5786);
    expect(shmuelNisanRd(5786) - real).toBeGreaterThan(18);
    expect(shmuelNisanRd(5786) - real).toBeLessThan(19);
    expect(addaNisanRd(5786) - real).toBeGreaterThan(6.5);
    expect(addaNisanRd(5786) - real).toBeLessThan(7.5);
    expect(Math.abs(rambamTrueNisanRd(5786) - real)).toBeLessThan(1.5);
  });

  it("in his own era Rav Adda ran about three days past the sky, Shmuel about twelve", () => {
    const real = realNisanRd(4938);
    expect(addaNisanRd(4938) - real).toBeGreaterThan(2.5);
    expect(addaNisanRd(4938) - real).toBeLessThan(4);
    expect(shmuelNisanRd(4938) - real).toBeGreaterThan(11);
    expect(shmuelNisanRd(4938) - real).toBeLessThan(13);
  });

  it('the drift rates are the year-length excesses, compounding as expected', () => {
    // From his era to ours (848 years), Shmuel gains ~11.2 min/yr and
    // Rav Adda ~6.6 — the gap growth must match.
    const growthShmuel = (shmuelNisanRd(5786) - realNisanRd(5786)) - (shmuelNisanRd(4938) - realNisanRd(4938));
    const growthAdda = (addaNisanRd(5786) - realNisanRd(5786)) - (addaNisanRd(4938) - realNisanRd(4938));
    expect(growthShmuel).toBeCloseTo((848 * (SHMUEL_YEAR_DAYS - 365.2422)), 0);
    expect(growthAdda).toBeCloseTo((848 * (ADDA_YEAR_DAYS - 365.2422)), 0);
  });
});
