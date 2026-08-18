/**
 * KH 19:7-14 — the tilt table, the fold, and the crescent rule.
 *
 * The headline claim of chapter 19 is a numeric one: that the table he
 * opens by apologising for is accurate to about a fifth of a degree.
 * That is checkable against real geometry, and this file checks it —
 * the module's own header promised as much, and for one commit it was
 * promising a file that did not exist.
 *
 * The true tilt of a point on the ecliptic is
 *
 *   δ = arcsin( sin ε · sin λ )
 *
 * with ε the obliquity. He states ε as "approximately twenty-three and
 * a half degrees" (KH 19:4, 19:6), so that is what the comparison uses —
 * not the modern 23.44°, which would be testing him against a figure he
 * did not claim.
 */
import { describe, it, expect } from 'vitest';
import {
  DECLINATION_TABLE,
  MAX_TILT,
  declinationAt,
  foldForDeclination,
  moonFromEquator,
  crescentDirection,
} from './khDeclination';
import { CONSTANTS } from '../engine/constants';

const DEG = Math.PI / 180;
/** The true tilt, at his stated obliquity. */
const trueTilt = (longitude) =>
  Math.asin(Math.sin(MAX_TILT * DEG) * Math.sin(longitude * DEG)) / DEG;

describe('KH 19:7 — the table he apologised for', () => {
  it('matches real geometry to within a fifth of a degree at every row', () => {
    let worst = 0;
    for (const { longitude, tilt } of DECLINATION_TABLE) {
      worst = Math.max(worst, Math.abs(tilt - trueTilt(longitude)));
    }
    expect(worst).toBeLessThan(0.22);
  });

  it('is good to about two percent of what it tabulates', () => {
    // An earlier draft asserted this was "the most accurate table in the
    // book". It is not, and the first run of this test caught it: the
    // relative error peaks at 2.02% (at 20°), where KH 13:4's sun
    // correction peaks at 1.91% and is twenty times tighter in absolute
    // terms. The apology being unnecessary is the real observation; the
    // ranking was invention.
    let worstFraction = 0;
    for (const { longitude, tilt } of DECLINATION_TABLE) {
      if (tilt === 0) continue;
      worstFraction = Math.max(worstFraction, Math.abs(tilt - trueTilt(longitude)) / tilt);
    }
    expect(worstFraction).toBeLessThan(0.025);
    expect(worstFraction).toBeGreaterThan(0.015);
  });

  it('is beaten by the sun-correction table, which the prose must not deny', () => {
    let declAbs = 0;
    for (const { longitude, tilt } of DECLINATION_TABLE) {
      declAbs = Math.max(declAbs, Math.abs(tilt - trueTilt(longitude)));
    }
    const ecc = Math.tan((1 + 59 / 60) * DEG);
    let sunAbs = 0;
    for (const { maslul, correction } of CONSTANTS.SUN_MASLUL_CORRECTIONS) {
      if (correction === 0) continue;
      const rad = maslul * DEG;
      const model = Math.abs(maslul - Math.atan2(Math.sin(rad), ecc + Math.cos(rad)) / DEG);
      sunAbs = Math.max(sunAbs, Math.abs(correction - model));
    }
    expect(sunAbs).toBeLessThan(declAbs);
  });

  it('runs from nothing to his stated 23½° maximum', () => {
    expect(DECLINATION_TABLE[0].tilt).toBe(0);
    expect(DECLINATION_TABLE[DECLINATION_TABLE.length - 1].tilt).toBe(MAX_TILT);
    expect(MAX_TILT).toBe(23.5);
  });

  it('is tabulated every ten degrees, to ninety', () => {
    const points = DECLINATION_TABLE.map((r) => r.longitude);
    expect(points).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
  });
});

describe('KH 19:8 — sharing out between rows', () => {
  it("reproduces both of his worked interpolations", () => {
    // "Five degrees will be inclined 2 degrees" and "twenty-three will be
    // inclined nine degrees."
    expect(declinationAt(5)).toBeCloseTo(2, 6);
    expect(declinationAt(23)).toBeCloseTo(9.05, 1);
  });
});

describe('KH 19:9 — the same four-way fold as chapter 16', () => {
  it('crosses the equator exactly at Taleh and Moznayim', () => {
    expect(Math.abs(declinationAt(0))).toBeLessThan(1e-9);
    expect(Math.abs(declinationAt(180))).toBeLessThan(1e-9);
  });

  it('is north for the first half of the circle and south for the second', () => {
    for (const lon of [10, 45, 90, 135, 170]) expect(declinationAt(lon), `${lon}°`).toBeGreaterThan(0);
    for (const lon of [190, 225, 270, 315, 350]) expect(declinationAt(lon), `${lon}°`).toBeLessThan(0);
  });

  it('peaks at the starts of Sartan and G\'di, as KH 19:4 says', () => {
    expect(declinationAt(90)).toBeCloseTo(MAX_TILT, 6);
    expect(declinationAt(270)).toBeCloseTo(-MAX_TILT, 6);
  });

  it('mirrors about both 90 and 180 — the mark of a four-way fold', () => {
    for (const c of [10, 25, 45, 70, 89]) {
      expect(Math.abs(declinationAt(180 - c))).toBeCloseTo(Math.abs(declinationAt(c)), 9);
      expect(Math.abs(declinationAt(c + 180))).toBeCloseTo(Math.abs(declinationAt(c)), 9);
    }
  });

  it('names which rule it applied, for the figure to display', () => {
    expect(foldForDeclination(45).rule).toBe('as it stands');
    expect(foldForDeclination(120).folded).toBe(60);
    expect(foldForDeclination(200).folded).toBe(20);
    expect(foldForDeclination(300).folded).toBe(60);
    expect(foldForDeclination(200).north).toBe(false);
  });

  it('never sends a lookup outside the quarter he tabulates', () => {
    for (let lon = 0; lon < 360; lon += 3) {
      const { folded } = foldForDeclination(lon);
      expect(folded, `${lon}°`).toBeGreaterThanOrEqual(0);
      expect(folded, `${lon}°`).toBeLessThanOrEqual(90);
    }
  });
});

describe('KH 19:10-11 — combining the two tilts', () => {
  // His worked evening: the moon in the nineteenth degree of Shor, whose
  // tilt is "approximately 18 degrees" north, with the moon "approximately
  // four degrees" south — giving 14 degrees north.
  const MOON_LONGITUDE = 48.6; // 18°36' into Shor
  const MOON_LATITUDE = -3.888; // 3°53' south

  it("puts the moon's degree about 18° north, as he states", () => {
    expect(declinationAt(MOON_LONGITUDE)).toBeGreaterThan(17.5);
    expect(declinationAt(MOON_LONGITUDE)).toBeLessThan(18.5);
  });

  it('reaches his 14° north', () => {
    const { result, sameDirection } = moonFromEquator(MOON_LONGITUDE, MOON_LATITUDE);
    expect(sameDirection).toBe(false); // one north, one south
    expect(result).toBeGreaterThan(13.5);
    expect(result).toBeLessThan(14.5);
  });

  it('adds when both point the same way', () => {
    const { sameDirection, result } = moonFromEquator(MOON_LONGITUDE, +4);
    expect(sameDirection).toBe(true);
    expect(result).toBeGreaterThan(declinationAt(MOON_LONGITUDE));
  });

  it('keeps the larger figure\'s direction when they oppose', () => {
    // Moon well south of the road, on a barely-tilted degree: the moon's
    // own height should win and the answer come out south.
    const { result } = moonFromEquator(5, -4);
    expect(result).toBeLessThan(0);
  });
});

describe('KH 19:12-14 — which way the horns point', () => {
  it('points them due east when the moon is on the equator', () => {
    for (const d of [0, 2, -2, 3, -3]) {
      expect(crescentDirection(d).horns, `${d}°`).toBe('due east');
      expect(crescentDirection(d).appears).toBe('due west');
    }
  });

  it('reverses them: north-west moon, south-east horns', () => {
    const north = crescentDirection(14);
    expect(north.appears).toBe('north-west');
    expect(north.horns).toBe('south-east');
  });

  it('and the other way for a southerly moon', () => {
    const south = crescentDirection(-14);
    expect(south.appears).toBe('south-west');
    expect(south.horns).toBe('north-east');
  });

  it('always points the horns opposite to where the moon leans', () => {
    // The reversal is the thing a reader takes for an error, so it is
    // asserted as a rule rather than in two examples.
    for (const d of [5, 12, 20, 29]) {
      expect(crescentDirection(d).appears).toContain('north');
      expect(crescentDirection(d).horns).toContain('south');
      expect(crescentDirection(-d).appears).toContain('south');
      expect(crescentDirection(-d).horns).toContain('north');
    }
  });

  it("uses his own two-to-three degree band rather than a knife edge", () => {
    expect(crescentDirection(3).horns).toBe('due east');
    expect(crescentDirection(3.5).horns).not.toBe('due east');
  });
});
