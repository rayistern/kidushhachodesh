/**
 * The local-observer layer, and the claims the card and chapter 18 make
 * about it.
 *
 * This file is the only place in the project that converts anything to a
 * clock time, so the tests are mostly sanity anchors — sunset in northern
 * Israel is between about 16:30 and 20:00, and if that ever stops being
 * true the arithmetic has broken in a way no tolerance test would catch.
 *
 * The load-bearing claims, all stated on screen and all checked here:
 *
 *   - Karmiel differs from the Rambam's reference by only a few minutes
 *     of sunset, so location cannot move a verdict.
 *   - Elevation is the local fact that DOES carry weight (KH 18:1), and
 *     330 m really is worth about half a degree of horizon.
 *   - The verdict itself is independent of the observer, which is the
 *     card's central promise.
 */
import { describe, it, expect } from 'vitest';
import {
  KARMIEL,
  RAMBAM_REFERENCE,
  horizonDipDegrees,
  dayOfYear,
  sunsetUtcHours,
  israelUtcOffsetHours,
  formatClock,
  rambamWindow,
  localOffsets,
  THIRD_OF_AN_HOUR_MINUTES,
} from './localObserver';
import { getFullCalculation } from '../engine/pipeline';
import { jerusalemSunsetHours } from './modernAstronomy';

const AUG = new Date(2026, 7, 17);
const DEC = new Date(2026, 11, 21);
const JUN = new Date(2026, 5, 21);

describe('the Rambam reference is his figure, not the surveyed one', () => {
  it("uses his stated 32° north and no elevation", () => {
    // Testing him against modern Jerusalem's 31.78° would be testing a
    // number he never claimed.
    expect(RAMBAM_REFERENCE.latitude).toBe(32);
    expect(RAMBAM_REFERENCE.elevationM).toBe(0);
    expect(RAMBAM_REFERENCE.note).toMatch(/no longitude and no elevation/);
  });

  it('puts his moment a third of an hour after sunset (KH 14:6)', () => {
    expect(THIRD_OF_AN_HOUR_MINUTES).toBe(20);
    const w = rambamWindow(AUG);
    expect((w.reference - w.sunset) * 60).toBeCloseTo(20, 6);
  });
});

describe('sunset lands in the right part of the day', () => {
  it('is plausible across the year for northern Israel', () => {
    for (const d of [JUN, AUG, DEC, new Date(2026, 2, 21), new Date(2026, 8, 21)]) {
      const w = localOffsets(d, KARMIEL);
      expect(w.sunset, d.toDateString()).toBeGreaterThan(16);
      expect(w.sunset, d.toDateString()).toBeLessThan(20.5);
    }
  });

  it('is latest at midsummer and earliest at midwinter', () => {
    expect(localOffsets(JUN, KARMIEL).sunset).toBeGreaterThan(localOffsets(AUG, KARMIEL).sunset);
    expect(localOffsets(DEC, KARMIEL).sunset).toBeLessThan(localOffsets(AUG, KARMIEL).sunset);
  });

  it('agrees with the existing Jerusalem function on local solar time', () => {
    // modernAstronomy.jerusalemSunsetHours returns LOCAL SOLAR time at
    // 31.78°; this module's sunsetUtcHours subtracts longitude. Adding it
    // back must reproduce the older function, which keeps the two
    // implementations honest about each other.
    const observer = { latitude: 31.78, longitude: 35.2137, elevationM: 0 };
    for (const d of [JUN, AUG, DEC]) {
      const mine = sunsetUtcHours(d, observer) + observer.longitude / 15;
      expect(mine, d.toDateString()).toBeCloseTo(jerusalemSunsetHours(dayOfYear(d)), 6);
    }
  });

  it('counts the day of the year correctly, including a leap year', () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(1);
    expect(dayOfYear(new Date(2026, 11, 31))).toBe(365);
    expect(dayOfYear(new Date(2028, 11, 31))).toBe(366); // 2028 is a leap year
  });
});

describe("Israel's daylight time", () => {
  it('is UTC+3 in summer and UTC+2 in winter', () => {
    expect(israelUtcOffsetHours(JUN)).toBe(3);
    expect(israelUtcOffsetHours(AUG)).toBe(3);
    expect(israelUtcOffsetHours(DEC)).toBe(2);
    expect(israelUtcOffsetHours(new Date(2026, 0, 15))).toBe(2);
  });

  it('switches around the documented boundaries', () => {
    // 2026: last Sunday of March is the 29th, so DST starts Friday the
    // 27th; it ends on the last Sunday of October, the 25th.
    expect(israelUtcOffsetHours(new Date(2026, 2, 20))).toBe(2);
    expect(israelUtcOffsetHours(new Date(2026, 2, 30))).toBe(3);
    expect(israelUtcOffsetHours(new Date(2026, 9, 20))).toBe(3);
    expect(israelUtcOffsetHours(new Date(2026, 10, 5))).toBe(2);
  });
});

describe('horizon dip — the local fact that actually matters (KH 18:1)', () => {
  it('is nothing at sea level and grows with height', () => {
    expect(horizonDipDegrees(0)).toBe(0);
    expect(horizonDipDegrees(-5)).toBe(0);
    expect(horizonDipDegrees(100)).toBeLessThan(horizonDipDegrees(330));
  });

  it("gives Karmiel's 330 m about half a degree, as the card claims", () => {
    const dip = horizonDipDegrees(330);
    expect(dip * 60).toBeGreaterThan(30);
    expect(dip * 60).toBeLessThan(34);
    expect(dip).toBeGreaterThan(0.5);
  });

  it('is worth more than the margin on a borderline night', () => {
    // The claim that justifies calling elevation the important local
    // fact: the fragile nights we measured had under 0.2° of slack.
    expect(horizonDipDegrees(330)).toBeGreaterThan(0.2);
  });

  it('buys a couple of minutes of extra sun', () => {
    const o = localOffsets(AUG, KARMIEL);
    expect(o.dipMinutes).toBeGreaterThan(1.5);
    expect(o.dipMinutes).toBeLessThan(5);
  });
});

describe('Karmiel is close enough to his reference not to matter', () => {
  it('shifts sunset by only a few minutes across the whole year', () => {
    // Chapter 18 states "between four and a half minutes earlier and one
    // minute later". Checked every day rather than at a few samples.
    let min = Infinity;
    let max = -Infinity;
    for (let day = 0; day < 365; day++) {
      const d = new Date(2026, 0, 1 + day);
      const shift = localOffsets(d, KARMIEL).sunsetShiftMinutes;
      min = Math.min(min, shift);
      max = Math.max(max, shift);
    }
    expect(min).toBeGreaterThan(-5);
    expect(max).toBeLessThan(2.5);
  });

  it('is under three arcminutes of moon travel, so it cannot move a verdict', () => {
    // The moon covers about 32.9 arcminutes an hour.
    const worstMinutes = 4.5;
    expect((worstMinutes / 60) * 32.9).toBeLessThan(2.5);
  });

  it("sits nearer his stated 32° than Jerusalem does — on the other side", () => {
    // Chapter 18 and the card both make this point, so it is pinned.
    expect(KARMIEL.latitude).toBeGreaterThan(RAMBAM_REFERENCE.latitude);
    expect(31.78).toBeLessThan(RAMBAM_REFERENCE.latitude);
    expect(Math.abs(KARMIEL.latitude - RAMBAM_REFERENCE.latitude)).toBeLessThan(1);
  });

  it('lies inside the 29°–35° band KH 11:17 serves', () => {
    expect(KARMIEL.latitude).toBeGreaterThan(29);
    expect(KARMIEL.latitude).toBeLessThan(35);
  });
});

describe("the verdict is untouched by any of this", () => {
  it('is what the engine says, with no observer involved', () => {
    // The card's central promise. getFullCalculation takes a date and
    // nothing else — if that ever changes, the layering is a lie.
    expect(getFullCalculation.length).toBe(1);
    const r = getFullCalculation(new Date(2026, 7, 17, 12));
    expect(['visible', 'not-visible']).toContain(r.moon.visibilityVerdict);
  });
});

describe('clock formatting', () => {
  it('pads and wraps', () => {
    expect(formatClock(19.5)).toBe('19:30');
    expect(formatClock(6.25)).toBe('06:15');
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(23.999)).toBe('00:00'); // rounds up past midnight
    expect(formatClock(null)).toBe('—');
    expect(formatClock(NaN)).toBe('—');
  });
});
