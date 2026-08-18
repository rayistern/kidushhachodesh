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
  moonDistanceKm,
  yallopFor,
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

describe("the moon's distance (for the crescent's width)", () => {
  it('swings between a plausible perigee and apogee over two months', () => {
    let min = Infinity;
    let max = 0;
    for (let h = 0; h < 60 * 24; h += 6) {
      const d = moonDistanceKm(new Date(Date.UTC(2026, 0, 1) + h * 3600000));
      min = Math.min(min, d);
      max = Math.max(max, d);
    }
    expect(min).toBeGreaterThan(355000);
    expect(min).toBeLessThan(372000);
    expect(max).toBeGreaterThan(400000);
    expect(max).toBeLessThan(407500);
  });
});

describe("Yallop's q-test", () => {
  const JLM = { latitude: 31.78, longitude: 35.2137 };

  it('has nothing to say on the conjunction evening: the moon is down by dusk', () => {
    expect(yallopFor(new Date(2026, 7, 12), JLM)).toBeNull();
  });

  it('the first evening past 7° is band D — the gate passes, the eye fails', () => {
    // THE case that shows why the full check exists: elongation ~11° at
    // sunset clears the Danjon gate ("likely" by the coarse reading),
    // but ARCV ~7.5° against a 0.4' crescent gives q ~ -0.20 — optical
    // aid needed. First naked-eye sighting of this moon is the NEXT
    // evening, which is what the record shows for crescents this young.
    const y = yallopFor(new Date(2026, 7, 13), JLM);
    expect(y.code).toBe('D');
    expect(y.q).toBeGreaterThan(-0.25);
    expect(y.q).toBeLessThan(-0.15);
    expect(assessEvening(new Date(2026, 7, 13), JLM).yallop.code).toBe('D');
  });

  it('one evening later the same moon is band A — easily visible', () => {
    const y = yallopFor(new Date(2026, 7, 14), JLM);
    expect(y.code).toBe('A');
    expect(y.q).toBeGreaterThan(0.216);
  });

  it("the Rambam's worked evening of 1178 comes out visible, as KH 17 says", () => {
    // q = -0.006: band B, visible in perfect conditions — his verdict
    // and the modern criterion agree across eight centuries. (Pinned to
    // B-or-C: the value sits a hair from the band edge, and the moon
    // series is only good to ~0.05 deg.)
    const y = yallopFor(new Date(1178, 3, 27), JLM);
    expect(['B', 'C']).toContain(y.code);
    expect(y.q).toBeGreaterThan(-0.16);
  });
});
