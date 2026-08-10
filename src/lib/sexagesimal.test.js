/**
 * KH 11:8-12 — the Rambam's own worked examples as test cases.
 *
 * These are the only examples he spells out arithmetically in the
 * chapter, which makes them the natural regression fixtures: if the
 * calculators on the chapter-11 page ever stop reproducing his stated
 * answers, the teaching surface is lying about the text it sits under.
 */
import { describe, it, expect } from 'vitest';
import {
  addSexagesimal,
  subtractSexagesimal,
  formatSexagesimal,
  decimalToSexagesimal,
  sexagesimalToDecimal,
} from './sexagesimal';
import { zodiacPosition } from '../engine/zodiac';
import { CONSTANTS } from '../engine/constants';

describe('KH 11:12 — the worked subtraction', () => {
  it("reproduces the Rambam's 100°20'30\" − 200°50'40\" = 259°29'50\"", () => {
    const { result, addedCircle } = subtractSexagesimal(
      { degrees: 100, minutes: 20, seconds: 30 },
      { degrees: 200, minutes: 50, seconds: 40 },
    );
    expect(formatSexagesimal(result)).toBe(`259° 29' 50"`);
    expect(addedCircle).toBe(true);
  });

  it('narrates every stage the Rambam narrates', () => {
    const { steps } = subtractSexagesimal(
      { degrees: 100, minutes: 20, seconds: 30 },
      { degrees: 200, minutes: 50, seconds: 40 },
    );
    expect(steps.map((s) => s.label)).toEqual([
      'A full circle first',
      'Seconds',
      'Minutes',
      'Degrees',
    ]);
  });

  it('adds a circle when the subtrahend is greater by merely one minute (KH 11:11)', () => {
    const { addedCircle, result } = subtractSexagesimal(
      { degrees: 100, minutes: 20, seconds: 0 },
      { degrees: 100, minutes: 21, seconds: 0 },
    );
    expect(addedCircle).toBe(true);
    expect(formatSexagesimal(result)).toBe(`359° 59' 0"`);
  });

  it('does not add a circle when subtraction is straightforward', () => {
    const { addedCircle, result } = subtractSexagesimal(
      { degrees: 200, minutes: 50, seconds: 40 },
      { degrees: 100, minutes: 20, seconds: 30 },
    );
    expect(addedCircle).toBe(false);
    expect(formatSexagesimal(result)).toBe(`100° 30' 10"`);
  });
});

describe('KH 11:10 — addition carries at sixty, degrees at 360', () => {
  it('carries seconds into minutes and minutes into degrees', () => {
    const { result } = addSexagesimal(
      { degrees: 10, minutes: 40, seconds: 50 },
      { degrees: 5, minutes: 30, seconds: 20 },
    );
    // 70" -> 1'10" ; 40+30+1 = 71' -> 1°11'
    expect(formatSexagesimal(result)).toBe(`16° 11' 10"`);
  });

  it('drops a full circle once the sum passes 360°', () => {
    const { result } = addSexagesimal(
      { degrees: 350, minutes: 0, seconds: 0 },
      { degrees: 20, minutes: 0, seconds: 0 },
    );
    expect(formatSexagesimal(result)).toBe(`10° 0' 0"`);
  });
});

describe('KH 11:8-9 — locating a longitude in the constellations', () => {
  it("places 70°30'40\" in Gemini, within the eleventh degree", () => {
    const pos = zodiacPosition(sexagesimalToDecimal({ degrees: 70, minutes: 30, seconds: 40 }));
    expect(pos.english).toBe('Gemini');
    // Two full signs (60°) removed leaves 10°30'40".
    expect(formatSexagesimal(decimalToSexagesimal(pos.degreesInto))).toBe(`10° 30' 40"`);
    // The Rambam's ordinal: 10.5° into the sign is the ELEVENTH degree.
    expect(pos.ordinalDegree).toBe(11);
  });

  it('places 320° in Aquarius, in its twentieth degree', () => {
    const pos = zodiacPosition(320);
    expect(pos.english).toBe('Aquarius');
    expect(pos.degreesInto).toBe(20);
    // Exactly on the boundary: 20° into the sign begins the 21st degree.
    expect(pos.ordinalDegree).toBe(21);
  });

  it('counts from the start of Aries and wraps a full circle', () => {
    expect(zodiacPosition(0).english).toBe('Aries');
    expect(zodiacPosition(360).english).toBe('Aries');
    expect(zodiacPosition(-1).english).toBe('Pisces');
    expect(zodiacPosition(359.99).index).toBe(11);
  });
});

describe('KH 11:13-15 — the eccentric really is the model behind KH 13:4', () => {
  // The MeanVsTrueMotion card tells the reader that the displaced
  // circle of KH 11:13-15 reproduces the sun-correction table of
  // KH 13:4. That is a factual claim printed on the page, so it is
  // pinned here: if the geometry or the constant ever drifts, the
  // claim fails loudly instead of quietly becoming false.
  const DEG = Math.PI / 180;
  const ECCENTRICITY = Math.tan((1 + 59 / 60) * DEG);

  it("stays within one arcminute of the Rambam's tabulated corrections", () => {
    let worst = 0;
    for (const { maslul, correction } of CONSTANTS.SUN_MASLUL_CORRECTIONS) {
      const rad = maslul * DEG;
      const trueAngle = Math.atan2(Math.sin(rad), ECCENTRICITY + Math.cos(rad)) / DEG;
      const modelled = Math.abs(maslul - trueAngle);
      worst = Math.max(worst, Math.abs(modelled - correction) * 60);
    }
    expect(worst).toBeLessThan(1);
  });

  it('peaks at the table\'s own maximum of 1°59\' when the maslul is 90°', () => {
    const trueAngle = Math.atan2(Math.sin(90 * DEG), ECCENTRICITY + Math.cos(90 * DEG)) / DEG;
    expect(Math.abs(90 - trueAngle) * 60).toBeCloseTo(119, 0); // 1°59' = 119'
  });

  it('vanishes at apogee and perigee, where the two rays coincide', () => {
    for (const maslul of [0, 180]) {
      const rad = maslul * DEG;
      const trueAngle = Math.atan2(Math.sin(rad), ECCENTRICITY + Math.cos(rad)) / DEG;
      expect(Math.abs(maslul - trueAngle)).toBeLessThan(1e-9);
    }
  });
});

describe('round-tripping', () => {
  it('survives decimal → DMS → decimal', () => {
    for (const deg of [0, 12.5, 70.511111, 199.999, 359.5]) {
      const back = sexagesimalToDecimal(decimalToSexagesimal(deg));
      expect(Math.abs(back - deg)).toBeLessThan(1 / 3600);
    }
  });
});
