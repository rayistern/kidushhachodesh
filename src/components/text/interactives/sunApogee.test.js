/**
 * The apogee card's two readouts, and the convention bug a reader found.
 *
 * The card showed "Moved since the epoch: 0° 0' 15"" beside "Apogee now
 * stands at: 26° 45' 23"", while chapter 13's own card showed the apogee
 * as 86° 45' 23". Two problems in one:
 *
 *   1. A DMS rendering of a tiny value reads as its largest digit —
 *      "0° 0' 15"" gets taken for fifteen degrees. Hence the explicit
 *      arcsecond column.
 *   2. The position was printed as degrees INTO the sign while chapter 13
 *      consumes the ABSOLUTE longitude. The two pages disagreed by 60°,
 *      the offset of the third sign, with nothing to bridge them.
 *
 * The second is the real defect, and the guard below is the one that
 * matters: whatever this card prints as the apogee's position must be the
 * number chapter 13's subtraction actually uses.
 */
import { describe, it, expect } from 'vitest';
import { CONSTANTS } from '../../../engine/constants';
import { dmsToDecimal, normalizeDegrees, formatDms } from '../../../engine/dmsUtils';
import { zodiacPosition } from '../../../engine/zodiac';
import { calculateSunApogee } from '../../../engine/sunCalculations';

const EPOCH_APOGEE =
  dmsToDecimal(CONSTANTS.SUN.APOGEE_START) + CONSTANTS.SUN.APOGEE_CONSTELLATION * 30;
const RATE = CONSTANTS.SUN.APOGEE_MOTION_PER_DAY;

/** What the card computes for a given day count. */
const cardAt = (days) => ({
  travelled: RATE * days,
  longitude: normalizeDegrees(EPOCH_APOGEE + RATE * days),
});

describe('the position the card shows is the one chapter 13 consumes', () => {
  it('agrees with the engine at every day count, to the second', () => {
    // This is the assertion the bug would have failed: the card was
    // showing zodiacPosition(...).degreesInto, which is 60° short.
    for (const days of [0, 29, 100, 354, 1000, 10000, 309866]) {
      const { longitude } = cardAt(days);
      const engine = calculateSunApogee(days).result;
      expect(Math.abs(longitude - engine), `${days} days`).toBeLessThan(1 / 3600);
    }
  });

  it('is emphatically not the degrees-into-the-sign figure', () => {
    // Guards the specific regression, since both are plausible-looking
    // DMS values and only one is correct here.
    const { longitude } = cardAt(100);
    const into = zodiacPosition(longitude).degreesInto;
    expect(Math.abs(longitude - into)).toBeCloseTo(60, 6);
    expect(formatDms(longitude)).toMatch(/^86°/);
    expect(formatDms(into)).toMatch(/^26°/);
  });

  it("starts where KH 12:2 says, in the 3rd sign", () => {
    const { longitude } = cardAt(0);
    expect(formatDms(longitude)).toBe(formatDms(dmsToDecimal({ degrees: 86, minutes: 45, seconds: 8 })));
    const pos = zodiacPosition(longitude);
    expect(pos.index + 1).toBe(3);
    expect(pos.translit).toBe('Teomim');
  });
});

describe('the movement is small enough to need spelling out', () => {
  it('is 15 arcseconds in a hundred days, matching his published block', () => {
    const { travelled } = cardAt(100);
    expect(travelled * 3600).toBeCloseTo(15, 6);
    expect(dmsToDecimal(CONSTANTS.SUN_APOGEE_PERIOD_BLOCKS.p100) * 3600).toBeCloseTo(15, 6);
  });

  it('renders in DMS as all leading zeros, which is the whole trap', () => {
    // Documents WHY the arcsecond column exists: the DMS form of every
    // interval in the table hides the magnitude behind two zeros.
    for (const key of ['p10', 'p100', 'p1000', 'p10000', 'p29', 'p354']) {
      const value = dmsToDecimal(CONSTANTS.SUN_APOGEE_PERIOD_BLOCKS[key]);
      expect(value, `${key} should be under a degree`).toBeLessThan(1);
      expect(formatDms(value), key).toMatch(/^0°/);
    }
  });

  it('is the exact difference between the two positions the card shows', () => {
    // The reconciliation the footer states: 86°45'8" + 15" = 86°45'23".
    const before = cardAt(0).longitude;
    const after = cardAt(100).longitude;
    expect((after - before) * 3600).toBeCloseTo(15, 6);
    expect(formatDms(after)).toBe(
      formatDms(dmsToDecimal({ degrees: 86, minutes: 45, seconds: 23 })),
    );
  });
});

describe("the rate matches the Rambam's own characterisation", () => {
  it('is about one degree in seventy years, as KH 12:2 says', () => {
    const yearsPerDegree = 1 / (RATE * 365.25);
    expect(yearsPerDegree).toBeGreaterThan(60);
    expect(yearsPerDegree).toBeLessThan(75);
  });

  it('is reproduced by every block he publishes, so the rate is not invented', () => {
    for (const [key, days] of [['p10', 10], ['p100', 100], ['p1000', 1000], ['p10000', 10000]]) {
      const stated = dmsToDecimal(CONSTANTS.SUN_APOGEE_PERIOD_BLOCKS[key]);
      expect(Math.abs(stated - RATE * days) * 3600, key).toBeLessThan(0.6);
    }
  });
});
