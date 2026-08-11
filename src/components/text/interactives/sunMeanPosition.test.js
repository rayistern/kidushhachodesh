/**
 * KH 12:1-2 — the Rambam's stated figures as test fixtures.
 *
 * Chapter 12's cards make three checkable claims on screen:
 *
 *   1. 100 days from the epoch puts the sun's mean position at
 *      105° 37' 25", in the sixteenth degree of Sartan (KH 12:2's own
 *      worked example);
 *   2. the operative daily rate is 59' 8⅓" rather than the printed
 *      59' 8", because the flat rate cannot reproduce his own blocks;
 *   3. the apogee moves a flat 0.15" per day, matching every block he
 *      publishes and his "one degree in about seventy years".
 *
 * Each is asserted here against the engine the cards actually call, so
 * a drift in the constants breaks the test rather than quietly
 * falsifying the page.
 */
import { describe, it, expect } from 'vitest';
import { CONSTANTS } from '../../../engine/constants';
import { meanLongitudeByPeriodBlocks, decomposeDays } from '../../../engine/periodBlocks';
import { dmsToDecimal, normalizeDegrees, formatDms } from '../../../engine/dmsUtils';
import { zodiacPosition } from '../../../engine/zodiac';

const EPOCH_MEAN =
  dmsToDecimal(CONSTANTS.SUN.START_POSITION) + CONSTANTS.SUN.START_CONSTELLATION * 30;

function meanAfter(days) {
  return meanLongitudeByPeriodBlocks(
    days,
    CONSTANTS.SUN_MEAN_PERIOD_BLOCKS,
    CONSTANTS.SUN.MEAN_MOTION_PER_DAY,
    EPOCH_MEAN,
  );
}

describe("KH 12:2 — the Rambam's worked example", () => {
  it("puts the sun at 105° 37' 25\" after 100 days", () => {
    const { result } = meanAfter(100);
    expect(formatDms(result)).toBe(`105° 37′ 25.0″`);
  });

  it('locates that in the sixteenth degree of Sartan', () => {
    const pos = zodiacPosition(meanAfter(100).result);
    expect(pos.translit).toBe('Sartan');
    expect(pos.ordinalDegree).toBe(16);
    // "15 degrees and 37 minutes of the sixteenth degree"
    expect(formatDms(pos.degreesInto)).toBe(`15° 37′ 25.0″`);
  });

  it('starts from the epoch position stated in KH 12:2', () => {
    expect(formatDms(EPOCH_MEAN)).toBe(`7° 3′ 32.0″`);
    expect(zodiacPosition(EPOCH_MEAN).translit).toBe('Taleh');
    // Day zero is the epoch itself: no motion, no correction.
    expect(meanAfter(0).result).toBeCloseTo(EPOCH_MEAN, 10);
  });

  it('decomposes 100 days into exactly one 100-block', () => {
    expect(decomposeDays(100)).toEqual({ k: 0, j: 0, i: 1, h: 0, d: 0 });
  });
});

describe('N = 29 — the strongest self-check in the chapter', () => {
  // 29 days is the sighting-to-sighting interval, so the Rambam
  // publishes a dedicated block for it (28° 35' 1", KH 12:1) *and*
  // works a full example at N=29 elsewhere (KH 15:8, where he states
  // the sun's mean position as 35° 38' 33"). The card does not use the
  // 29-day block — it decomposes into 2 tens and 9 singles — so these
  // assertions check that his own table and his own worked example
  // agree with the route the card actually takes.
  it("reproduces KH 15:8's stated sun mean position of 35° 38' 33\"", () => {
    expect(formatDms(meanAfter(29).result)).toBe(`35° 38′ 33.0″`);
  });

  it('agrees with the dedicated 29-day block it does not use', () => {
    const viaBlocks = meanAfter(29).result;
    const viaP29 = normalizeDegrees(
      EPOCH_MEAN + dmsToDecimal(CONSTANTS.SUN_MEAN_PERIOD_BLOCKS.p29),
    );
    // Floating-point only: the daily rate is stored as 8.333", not 25/3.
    expect(Math.abs(viaBlocks - viaP29) * 3600).toBeLessThan(0.01);
  });

  it('decomposes 29 into two tens and nine singles', () => {
    expect(decomposeDays(29)).toEqual({ k: 0, j: 0, i: 0, h: 2, d: 9 });
  });

  it("would miss KH 15:8 by three seconds on the flat daily rate", () => {
    // This is the case that settled the 8 vs 8⅓ question — see the note
    // on CONSTANTS.SUN.MEAN_MOTION_PER_DAY.
    const flat = meanLongitudeByPeriodBlocks(
      29,
      CONSTANTS.SUN_MEAN_PERIOD_BLOCKS,
      { degrees: 0, minutes: 59, seconds: 8 },
      EPOCH_MEAN,
    );
    expect(formatDms(flat.result)).toBe(`35° 38′ 30.0″`);
  });
});

describe("KH 12:1 — the daily rate the printed text rounds", () => {
  const FLAT = { degrees: 0, minutes: 59, seconds: 8 };
  const gap = (rate, days, key) =>
    Math.abs(
      (normalizeDegrees(dmsToDecimal(rate) * days) -
        dmsToDecimal(CONSTANTS.SUN_MEAN_PERIOD_BLOCKS[key])) *
        3600,
    );

  it("beats the flat 59' 8\" on every block the Rambam publishes", () => {
    // The 354-day row is the exception the card names in prose: a
    // regular year is not a round number of blocks and he rounded it
    // on its own terms, so the flat rate happens to sit closer there.
    for (const [key, days] of [['p10', 10], ['p100', 100], ['p1000', 1000], ['p10000', 10000], ['p29', 29]]) {
      expect(gap(CONSTANTS.SUN.MEAN_MOTION_PER_DAY, days, key)).toBeLessThan(gap(FLAT, days, key));
    }
  });

  it("stays within half an arcminute across the table, where the flat rate drifts most of a degree", () => {
    let worstOperative = 0;
    let worstFlat = 0;
    for (const [key, days] of [['p10', 10], ['p100', 100], ['p1000', 1000], ['p10000', 10000]]) {
      worstOperative = Math.max(worstOperative, gap(CONSTANTS.SUN.MEAN_MOTION_PER_DAY, days, key));
      worstFlat = Math.max(worstFlat, gap(FLAT, days, key));
    }
    expect(worstOperative).toBeLessThan(30); // arcseconds
    expect(worstFlat).toBeGreaterThan(3000); // nearly a degree
  });

  it("reproduces the ten-day figure that gives the third away", () => {
    // 59'8" x 10 = 9°51'20"; the Rambam prints 9°51'23".
    expect(formatDms(normalizeDegrees(dmsToDecimal(FLAT) * 10))).toBe(`9° 51′ 20.0″`);
    expect(formatDms(dmsToDecimal(CONSTANTS.SUN_MEAN_PERIOD_BLOCKS.p10))).toBe(`9° 51′ 23.0″`);
  });
});

describe('KH 12:2 — the apogee', () => {
  it('stands at 26° 45\' 8" in Teomim at the epoch', () => {
    const longitude =
      dmsToDecimal(CONSTANTS.SUN.APOGEE_START) + CONSTANTS.SUN.APOGEE_CONSTELLATION * 30;
    expect(formatDms(dmsToDecimal(CONSTANTS.SUN.APOGEE_START))).toBe(`26° 45′ 8.0″`);
    expect(zodiacPosition(longitude).translit).toBe('Teomim');
  });

  it('moves at the flat rate every published block agrees on', () => {
    for (const [key, days] of [['p10', 10], ['p100', 100], ['p1000', 1000], ['p10000', 10000]]) {
      const published = dmsToDecimal(CONSTANTS.SUN_APOGEE_PERIOD_BLOCKS[key]);
      const computed = CONSTANTS.SUN.APOGEE_MOTION_PER_DAY * days;
      expect(Math.abs(computed - published) * 3600).toBeLessThan(0.01);
    }
  });

  it('works out to about one degree in seventy years, as stated', () => {
    const yearsPerDegree = 1 / (CONSTANTS.SUN.APOGEE_MOTION_PER_DAY * 365.25);
    expect(yearsPerDegree).toBeGreaterThan(60);
    expect(yearsPerDegree).toBeLessThan(80);
  });
});
