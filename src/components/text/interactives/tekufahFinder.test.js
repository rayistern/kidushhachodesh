/**
 * KH 13:11 — finding the day the sun reaches a season's longitude.
 *
 * The card prints two columns side by side and invites the reader to
 * compare them, so both have to be right, and the claim about *why*
 * one is coarser than the other has to be true.
 */
import { describe, it, expect } from 'vitest';
import { calculateSunMeanLongitude, calculateSunApogee } from '../../../engine/sunCalculations';
import { trueFromMean } from '../../../lib/maslulTable';
import { daysFromEpoch, dateFromEpochDays } from '../../../engine/epochDays';
import { modernSunLongitude } from '../../../lib/modernAstronomy';

const offsetTo = (lon, target) => ((lon - target + 540) % 360) - 180;

function rambamLongitude(days) {
  const mean = calculateSunMeanLongitude(days).result;
  const apogee = calculateSunApogee(days).result;
  return trueFromMean(mean, apogee).trueLongitude;
}

function findRambamDay(target, from) {
  let prev = offsetTo(rambamLongitude(from), target);
  for (let d = from + 1; d <= from + 400; d++) {
    const cur = offsetTo(rambamLongitude(d), target);
    if (prev < 0 && cur >= 0) return d;
    prev = cur;
  }
  return null;
}

const START_2026 = daysFromEpoch(new Date(2026, 0, 1, 12));

describe("the Rambam's true longitude changes only once a day", () => {
  it('is constant across fractional days — which is why no instant can be found', () => {
    // This is the fact that made a first draft's bisected clock time
    // meaningless. The period-block decomposition floors the day count
    // and KH 13:9 rounds the course, so the function is a staircase.
    const base = 309717;
    const atNoon = rambamLongitude(base + 0.5);
    const atStart = rambamLongitude(base);
    expect(atNoon).toBe(atStart);
    expect(rambamLongitude(base + 0.99)).toBe(atStart);
    expect(rambamLongitude(base + 1)).not.toBe(atStart);
  });

  it('steps by roughly a degree a day, so a day is the finest resolution', () => {
    const step = rambamLongitude(309718) - rambamLongitude(309717);
    expect(step).toBeGreaterThan(0.9);
    expect(step).toBeLessThan(1.1);
  });
});

describe('the seasons of 2026', () => {
  const SEASONS = [0, 90, 180, 270];

  it('finds a crossing day for each quarter of the circle', () => {
    for (const target of SEASONS) {
      const day = findRambamDay(target, START_2026);
      expect(day, `target ${target}`).not.toBeNull();
      // The day found must be the first at or past the target...
      expect(offsetTo(rambamLongitude(day), target)).toBeGreaterThanOrEqual(0);
      // ...and the day before must still be short of it.
      expect(offsetTo(rambamLongitude(day - 1), target)).toBeLessThan(0);
    }
  });

  it('lands within a day or two of the real thing', () => {
    // 2026 actuals (UTC): Mar 20, Jun 21, Sep 23, Dec 21. His solar
    // model trails reality by about half a degree, and the sun covers
    // about a degree a day, so a discrepancy of a day is expected and
    // more than two would signal a real fault.
    const ACTUAL = ['2026-03-20', '2026-06-21', '2026-09-23', '2026-12-21'];
    SEASONS.forEach((target, i) => {
      const day = findRambamDay(target, START_2026);
      const found = dateFromEpochDays(day).toISOString().slice(0, 10);
      const gap = Math.abs(
        (Date.parse(found) - Date.parse(ACTUAL[i])) / 86400000,
      );
      expect(gap, `${target}° → ${found} vs ${ACTUAL[i]}`).toBeLessThanOrEqual(2);
    });
  });
});

describe('the modern reference, by contrast, is continuous', () => {
  it('resolves the March 2026 equinox to the right minutes', () => {
    // Published: 2026-03-20 14:46 UTC. The reference is accurate to
    // ~0.01°, which at ~1°/day is about a quarter of an hour.
    const off = (ms) => offsetTo(modernSunLongitude(new Date(ms)), 0);
    let a = Date.UTC(2026, 2, 15);
    let b = Date.UTC(2026, 2, 25);
    for (let i = 0; i < 60; i++) {
      const mid = (a + b) / 2;
      if (off(mid) < 0) a = mid;
      else b = mid;
    }
    const found = new Date((a + b) / 2);
    expect(found.toISOString().slice(0, 10)).toBe('2026-03-20');
    const minutesOff = Math.abs(found.getTime() - Date.UTC(2026, 2, 20, 14, 46)) / 60000;
    expect(minutesOff).toBeLessThan(30);
  });
});
