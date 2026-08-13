/**
 * The modern reference is only worth showing beside the Rambam if it is
 * itself correct, so it is checked against Meeus's own worked example
 * before being used to characterise anyone else's error.
 */
import { describe, it, expect } from 'vitest';
import {
  modernSunLongitude,
  toJulianDay,
  angularDifference,
  jerusalemSunsetHours,
  meanJerusalemSunsetHours,
} from './modernAstronomy';
import { CONSTANTS } from '../engine/constants';
import { calculateSunMeanLongitude, calculateSunApogee } from '../engine/sunCalculations';
import { trueFromMean } from './maslulTable';
import { daysFromEpoch } from '../engine/epochDays';

/** JS Date for a Julian Day, so Meeus's examples can be entered as JD. */
function fromJulianDay(jd) {
  return new Date((jd - 2440587.5) * 86400000);
}

describe('Meeus example 25.a — 1992 October 13.0 TD', () => {
  it("reproduces the published true geometric longitude of 199.90987°", () => {
    // Meeus, Astronomical Algorithms 2nd ed. p.165: JDE 2448908.5 gives
    // L0 = 201.80720, M = 278.99397, C = -1.89732, Θ = 199.90988.
    const lon = modernSunLongitude(fromJulianDay(2448908.5));
    expect(Math.abs(lon - 199.90988)).toBeLessThan(0.0001);
  });

  it('converts dates to Julian Day correctly', () => {
    // J2000.0 = 2000 January 1.5 TT.
    expect(toJulianDay(new Date(Date.UTC(2000, 0, 1, 12, 0, 0)))).toBeCloseTo(2451545.0, 6);
  });
});

describe('sanity checks against the equinoxes', () => {
  // The sun's tropical longitude is 0° at the March equinox and 180° at
  // the September equinox, by definition of the frame. If the algorithm
  // were sidereal these would be off by the precession since J2000.
  it('reads near 0° at the March 2026 equinox', () => {
    const lon = modernSunLongitude(new Date(Date.UTC(2026, 2, 20, 14, 46, 0)));
    expect(Math.min(lon, 360 - lon)).toBeLessThan(0.05);
  });

  it('reads near 180° at the September 2026 equinox', () => {
    const lon = modernSunLongitude(new Date(Date.UTC(2026, 8, 23, 0, 5, 0)));
    expect(Math.abs(lon - 180)).toBeLessThan(0.05);
  });
});

describe('sunset in Jerusalem, and the KH 14:5 correction', () => {
  // The book's chapter 14 argues that the season correction exists to
  // land the moon's position at sunset, since sunset drifts through the
  // year. That is an editorial reading — the Rambam gives no reason —
  // and the chapter says so. These assertions corroborate it; they are
  // not evidence about his method, and the tolerances are deliberately
  // loose because the claim is qualitative.
  const dayOfYear = (month, day) => Math.round((Date.UTC(2026, month - 1, day) - Date.UTC(2026, 0, 1)) / 86400000) + 1;

  it('is latest near midsummer and earliest near midwinter', () => {
    let latest = 1;
    let earliest = 1;
    for (let d = 1; d <= 365; d++) {
      if (jerusalemSunsetHours(d) > jerusalemSunsetHours(latest)) latest = d;
      if (jerusalemSunsetHours(d) < jerusalemSunsetHours(earliest)) earliest = d;
    }
    expect(Math.abs(latest - dayOfYear(6, 21))).toBeLessThan(20);
    expect(Math.abs(earliest - dayOfYear(12, 21))).toBeLessThan(20);
  });

  it('swings by roughly two and a quarter hours across the year', () => {
    let min = 99;
    let max = 0;
    for (let d = 1; d <= 365; d++) {
      const s = jerusalemSunsetHours(d);
      min = Math.min(min, s);
      max = Math.max(max, s);
    }
    const swingMinutes = (max - min) * 60;
    expect(swingMinutes).toBeGreaterThan(100);
    expect(swingMinutes).toBeLessThan(160);
  });

  it("moves in the same direction as the Rambam's correction, band by band", () => {
    // The substantive check: where sunset is later than average he adds,
    // where it is earlier he subtracts. A band where the signs disagree
    // would sink the explanation the chapter offers.
    const mean = meanJerusalemSunsetHours();
    const sunLongitudeForDay = (d) => (((d - 79) / 365.2422) * 360 + 360) % 360;

    let agreeing = 0;
    let opposing = 0;
    for (let d = 1; d <= 365; d++) {
      const longitude = sunLongitudeForDay(d);
      const row = CONSTANTS.SEASON_CORRECTIONS.find(
        (r) => longitude >= r.sunFrom && longitude < r.sunTo,
      );
      if (!row || row.adjustment === 0) continue;
      const sunsetOffset = jerusalemSunsetHours(d) - mean;
      if (Math.sign(sunsetOffset) === Math.sign(row.adjustment)) agreeing++;
      else opposing++;
    }
    // Not every day agrees — the bands are coarse steps against a smooth
    // curve, and they disagree near the crossings. The claim is that the
    // pattern holds, not that every day does.
    expect(agreeing / (agreeing + opposing)).toBeGreaterThan(0.85);
  });
});

describe("how far the Rambam's sun sits from the modern one", () => {
  // These fixtures are the empirical answer to the frame question. If
  // his longitudes were sidereal, the gap would grow by ~11.8° across
  // this span as precession carries the equinox. It does not: it stays
  // inside a bounded half-degree or so, which is what identifies the
  // frame as tropical and makes the comparison meaningful at all.
  function gapDegrees(date) {
    const N = daysFromEpoch(date);
    const mean = calculateSunMeanLongitude(N).result;
    const apogee = calculateSunApogee(N).result;
    const rambam = trueFromMean(mean, apogee).trueLongitude;
    return angularDifference(rambam, modernSunLongitude(date));
  }

  const SAMPLES = [
    Date.UTC(1178, 2, 30, 16, 0, 0), // the epoch itself
    Date.UTC(1400, 5, 15, 16, 0, 0),
    Date.UTC(1600, 10, 3, 16, 0, 0),
    Date.UTC(1800, 0, 1, 16, 0, 0),
    Date.UTC(2026, 7, 12, 16, 0, 0),
  ];

  it('never drifts beyond about a degree, over 848 years', () => {
    for (const ms of SAMPLES) {
      expect(Math.abs(gapDegrees(new Date(ms)))).toBeLessThan(1);
    }
  });

  it('does not accumulate — the last sample is no worse than the first', () => {
    const first = Math.abs(gapDegrees(new Date(SAMPLES[0])));
    const last = Math.abs(gapDegrees(new Date(SAMPLES[SAMPLES.length - 1])));
    // Precession over this span would be ~11.8°. Nothing like it appears.
    expect(Math.abs(last - first)).toBeLessThan(1);
  });

  it('is a consistent lag rather than a wandering sign', () => {
    // His sun runs behind the real one throughout, which points at a
    // systematic model difference and not at random tabular error.
    for (const ms of SAMPLES) {
      expect(gapDegrees(new Date(ms))).toBeLessThan(0);
    }
  });
});
