/**
 * Regression tests for the period-block engine rework (Q4 / issue #7).
 *
 * Two purposes:
 *
 * 1. Pin the expected numeric values for the canonical reference date
 *    (3 Nisan 5786 = 2026-03-21, the date the user who started Phase R
 *    was asking about). Any future change to the mean-motion math will
 *    now be visible as a test diff.
 *
 * 2. Cross-check against the user's hand-computed WhatsApp values
 *    (reported 2026-04-23). Their day count was 309,716 (one less
 *    than ours — they used ⌊10,488 × mean synodic⌋; see Q1). So all
 *    comparisons are offset by ONE DAY of each body's mean motion.
 *    If our engine is correct, the residuals should be arc-seconds,
 *    not arc-minutes.
 */
import { describe, it, expect } from 'vitest';
import hebcal from 'hebcal';
import { getFullCalculation } from '../pipeline.js';
import { decomposeDays, sumPeriodBlocks } from '../periodBlocks.js';
import { CONSTANTS } from '../constants.js';
import { dmsToDecimal } from '../dmsUtils.js';

const { HDate } = hebcal;

// Helper: approximate DMS equality — compare two decimal degrees with
// a given arc-second tolerance.
function expectDegreesClose(actualDeg, expectedDeg, tolArcsec, msg = '') {
  const diffArcsec = Math.abs(actualDeg - expectedDeg) * 3600;
  if (diffArcsec > tolArcsec) {
    throw new Error(
      `${msg}: actual ${actualDeg.toFixed(6)}° differs from ${expectedDeg.toFixed(6)}° by ${diffArcsec.toFixed(1)}" (tol ${tolArcsec}")`,
    );
  }
}

describe('decomposeDays', () => {
  it('309,717 = 30×10000 + 9×1000 + 7×100 + 1×10 + 7', () => {
    expect(decomposeDays(309717)).toEqual({ k: 30, j: 9, i: 7, h: 1, d: 7 });
  });
  it('0 = all zeros', () => {
    expect(decomposeDays(0)).toEqual({ k: 0, j: 0, i: 0, h: 0, d: 0 });
  });
  it('99999 = 9 × 10000 + 9 × 1000 + 9 × 100 + 9 × 10 + 9', () => {
    expect(decomposeDays(99999)).toEqual({ k: 9, j: 9, i: 9, h: 9, d: 9 });
  });
});

describe('sumPeriodBlocks — 10-day table matches daily × 10 for sun', () => {
  it('10 × daily sun motion ≈ 10-day block value', () => {
    const daily = dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY);
    const block10 = dmsToDecimal(CONSTANTS.SUN_MEAN_PERIOD_BLOCKS.p10);
    // Rambam's 9°51'23" vs 10 × 59'8 1/3" = 591' 83.33" = 9°51'23.33"
    expectDegreesClose(block10, 10 * daily, 1, 'sun 10-day vs 10×daily');
  });

  it('10 × daily moon motion ≈ moon 10-day block', () => {
    const daily = dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY);
    const block10 = dmsToDecimal(CONSTANTS.MOON_MEAN_PERIOD_BLOCKS.p10);
    expectDegreesClose(block10, 10 * daily, 1, 'moon 10-day vs 10×daily');
  });

  it('10 × daily moon-maslul motion ≈ moon-maslul 10-day block', () => {
    const daily = dmsToDecimal(CONSTANTS.MOON.MASLUL_MEAN_MOTION);
    const block10 = dmsToDecimal(CONSTANTS.MOON_MASLUL_PERIOD_BLOCKS.p10);
    expectDegreesClose(block10, 10 * daily, 1, 'moon-maslul 10-day vs 10×daily');
  });
});

describe('pipeline — 3 Nisan 5786 canonical values (Q4 rework baseline)', () => {
  const r = getFullCalculation(new HDate(3, 'Nisan', 5786));

  // Pinned by hand-calculation against the Rambam's KH 12-16 tables.
  // If these change, either the Rambam's values in constants.js moved
  // or the period-block algorithm changed. Both warrant scrutiny.
  it('daysFromEpoch = 309717', () => {
    expect(r.daysFromEpoch).toBe(309717);
  });
  it('sun mean ≈ 358° 45\' 34"', () => {
    expectDegreesClose(r.sun.meanLongitude, 358 + 45/60 + 34/3600, 5, 'sun mean');
  });
  it('sun apogee ≈ 99° 39\' 26"', () => {
    // PRIOR code produced 215°48' — that was wrong (1.5"/day should be
    // 1.5"/10d per KH 12:2). See Q7 in OPEN_QUESTIONS.md.
    expectDegreesClose(r.sun.apogee, 99 + 39/60 + 26/3600, 5, 'sun apogee');
  });
  it('moon mean ≈ 25° 27\' 49"', () => {
    expectDegreesClose(r.moon.meanLongitude, 25 + 27/60 + 49/3600, 5, 'moon mean');
  });
  it('moon maslul ≈ 131° 3\' 41"', () => {
    expectDegreesClose(r.moon.maslul, 131 + 3/60 + 41/3600, 5, 'moon maslul');
  });
  it('node (makom rosh) ≈ 338° 39\' 57"', () => {
    expectDegreesClose(r.moon.nodePosition, 338 + 39/60 + 57/3600, 5, 'node');
  });
});

describe('cross-check against user WhatsApp report (2026-04-23)', () => {
  // The user reported these values with a day count of 309,716
  // (floor of 10,488 × synodic month). Ours uses 309,717 (integer
  // civil-day count — see Q1). So comparisons are offset by ONE DAY
  // of each body's mean motion. See docs/OPEN_QUESTIONS.md Q1/Q7.
  const r = getFullCalculation(new HDate(3, 'Nisan', 5786));
  const TOL_ARCSEC = 15; // allow for rounding in the user's hand computation

  it('sun mean: user 357°46\'24" ≈ ours − 1 day of sun motion (59\'8")', () => {
    const userDeg = 357 + 46/60 + 24/3600;
    const oneDay = dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY);
    expectDegreesClose(r.sun.meanLongitude - oneDay, userDeg, TOL_ARCSEC, 'sun mean vs user');
  });

  it('sun apogee: user 99°39\'27" ≈ ours (one-day drift negligible)', () => {
    expectDegreesClose(r.sun.apogee, 99 + 39/60 + 27/3600, TOL_ARCSEC, 'sun apogee vs user');
  });

  it('moon maslul: user 117°59\'47" ≈ ours − 1 day (13°3\'54")', () => {
    const userDeg = 117 + 59/60 + 47/3600;
    const oneDay = dmsToDecimal(CONSTANTS.MOON.MASLUL_MEAN_MOTION);
    expectDegreesClose(r.moon.maslul - oneDay, userDeg, TOL_ARCSEC, 'moon maslul vs user');
  });

  it('rosh (emtza pre-flip): user 21°16\'52" ≈ ours − 1 day (3\'11")', () => {
    const userDeg = 21 + 16/60 + 52/3600;
    const oneDay = dmsToDecimal(CONSTANTS.NODE.DAILY_MOTION);
    const ourEmtza = (360 - r.moon.nodePosition + 360) % 360;
    expectDegreesClose(ourEmtza - oneDay, userDeg, TOL_ARCSEC, 'rosh vs user');
  });
});
