/**
 * The modern first-crescent check, pinned against an independent table.
 *
 * The reference times come from a separate Meeus implementation (ch. 49
 * conjunction series, full to its last term; ch. 25/47 longitudes with
 * a binary search for 7°) whose conjunctions were verified against
 * timeanddate.com. This module inverts a moon series truncated at
 * 0.05°, and the moon closes on the sun at ~0.51°/hour, so times may
 * differ by ~6 minutes — the tolerances say 15 to stay clear of flakes,
 * not because the agreement is that loose.
 */
import { describe, it, expect } from 'vitest';
import {
  signedElongation,
  conjunctionNear,
  elongationReaches,
  moonsetUtcHours,
  assessEvening,
  DANJON_LIMIT_DEG,
} from './moonVisibility';
import { sunsetUtcHours } from './localObserver';

const JERUSALEM = { latitude: 31.78, longitude: 35.2137 };
const minutesApart = (a, b) => Math.abs(a.getTime() - b.getTime()) / 60000;

describe('conjunction and the 7° instant, against the independent table', () => {
  // Aug 2026: conjunction 2026-08-12 20:36 IDT = 17:36 UTC; 7° at 09:10 IDT next day.
  it('finds the Av/Elul 2026 conjunction', () => {
    const conj = conjunctionNear(new Date(Date.UTC(2026, 7, 13)));
    expect(minutesApart(conj, new Date(Date.UTC(2026, 7, 12, 17, 36)))).toBeLessThan(15);
  });

  it('finds when that moon opens 7°', () => {
    const conj = conjunctionNear(new Date(Date.UTC(2026, 7, 13)));
    const seven = elongationReaches(conj, DANJON_LIMIT_DEG);
    expect(minutesApart(seven, new Date(Date.UTC(2026, 7, 13, 6, 10)))).toBeLessThan(15);
    // And the elongation there really is 7, by its own reckoning.
    expect(signedElongation(seven)).toBeCloseTo(7, 3);
  });

  // Nov 2026: conjunction 2026-11-09 09:02 IST = 07:02 UTC; 7° at 23:52 IST = 21:52 UTC.
  it('finds a winter conjunction and its 7° instant', () => {
    const conj = conjunctionNear(new Date(Date.UTC(2026, 10, 9)));
    expect(minutesApart(conj, new Date(Date.UTC(2026, 10, 9, 7, 2)))).toBeLessThan(15);
    const seven = elongationReaches(conj, DANJON_LIMIT_DEG);
    expect(minutesApart(seven, new Date(Date.UTC(2026, 10, 9, 21, 52)))).toBeLessThan(15);
  });

  it('returns null when no conjunction is near', () => {
    // Full moon of Aug 2026 is around the 28th; ±4 days finds nothing.
    expect(conjunctionNear(new Date(Date.UTC(2026, 7, 27)))).toBeNull();
  });
});

describe('moonset', () => {
  it('on a first-crescent evening the moon sets after the sun, within hours', () => {
    // Evening of 2026-08-13, the first evening past 7°.
    const eve = new Date(2026, 7, 13);
    const sunset = sunsetUtcHours(eve, JERUSALEM);
    const moonset = moonsetUtcHours(eve, JERUSALEM);
    expect(moonset).toBeGreaterThan(sunset);
    expect(moonset - sunset).toBeLessThan(3);
  });
});

describe('the whole evening, assessed', () => {
  it('the evening OF the Aug 2026 conjunction: no crescent yet', () => {
    // Conjunction 17:36 UTC; Jerusalem sunset that day is ~16:35 UTC.
    const a = assessEvening(new Date(2026, 7, 12), JERUSALEM);
    expect(a.elongationAtSunset).toBeLessThan(0);
    expect(a.verdict).toBe('no-crescent-yet');
  });

  it('the next evening: a sightable crescent, and the numbers cohere', () => {
    const a = assessEvening(new Date(2026, 7, 13), JERUSALEM);
    // ~23h past conjunction at ~0.51°/h: elongation ~11-12° at sunset.
    expect(a.elongationAtSunset).toBeGreaterThan(DANJON_LIMIT_DEG);
    expect(a.elongationAtSunset).toBeLessThan(20);
    expect(a.verdict).toBe('likely');
    expect(a.windowMinutes).toBeGreaterThan(0);
    expect(a.conjunction).not.toBeNull();
    expect(a.sevenDeg.getTime()).toBeGreaterThan(a.conjunction.getTime());
  });

  it('a full-moon evening is not a crescent night', () => {
    const a = assessEvening(new Date(2026, 7, 27), JERUSALEM);
    expect(a.verdict).toBe('not-crescent-night');
  });

  it("holds up on the Rambam's own worked evening, eight centuries back", () => {
    // The night beginning 2 Iyar 4938 — 1178-04-27 civil evening — which
    // KH 17 judges visible. The modern check should at least call it a
    // real crescent evening with a window, not contradict him outright.
    const a = assessEvening(new Date(1178, 3, 27), JERUSALEM);
    expect(['likely', 'challenging']).toContain(a.verdict);
    expect(a.elongationAtSunset).toBeGreaterThan(0);
    expect(a.windowMinutes).toBeGreaterThan(15);
  });
});
