/**
 * Chapter 16's claims, checked against the engine and the text.
 *
 * The one that matters most is the folding. Chapters 13 and 15 fold the
 * circle in two; this chapter folds it in four, and a reader who
 * carries the earlier rule over gets a wrong answer for three quarters
 * of the circle. The chapter says so, and these tests make sure that
 * warning is both present and true.
 */
import { describe, it, expect } from 'vitest';
import { bookChapter } from './index';
import { CONSTANTS, GALGAL_NOTEH_INCLINATION_DEG } from '../../engine/constants';
import { calculateNodePosition, calculateMoonLatitude } from '../../engine/moonCalculations';
import { meanLongitudeByPeriodBlocks } from '../../engine/periodBlocks';
import { dmsToDecimal, normalizeDegrees } from '../../engine/dmsUtils';
import { zodiacPosition } from '../../engine/zodiac';

const prose = bookChapter(16)
  .sections.flatMap((s) => s.body)
  .join('\n');

const dms = (d, m = 0, s = 0) => d + m / 60 + s / 3600;
const arcsec = (a, b) => Math.abs(a - b) * 3600;
const latAt = (course) => calculateMoonLatitude(normalizeDegrees(course), 0).result;

describe('KH 16:2-5 — the head, and the flip', () => {
  it("moves at 3' 11\" a day, as the chapter quotes", () => {
    expect(arcsec(dmsToDecimal(CONSTANTS.NODE.DAILY_MOTION), dms(0, 3, 11))).toBeLessThan(0.5);
    expect(prose).toMatch(/3 minutes and 11 seconds/);
  });

  it('starts at the epoch position KH 16:2 states', () => {
    expect(arcsec(dmsToDecimal(CONSTANTS.NODE.START_POSITION), dms(180, 57, 28))).toBeLessThan(1);
  });

  it('reproduces his worked example — the head in Betulah at 27° 30′', () => {
    const head = calculateNodePosition(29).result;
    expect(arcsec(head, dms(177, 30, 23))).toBeLessThan(5);
    const sign = zodiacPosition(head);
    expect(sign.translit).toBe('Betulah');
    expect(arcsec(sign.degreesInto, dms(27, 30))).toBeLessThan(30);
  });

  it('puts the tail exactly opposite, in Dagim', () => {
    const tail = normalizeDegrees(calculateNodePosition(29).result + 180);
    expect(zodiacPosition(tail).translit).toBe('Dagim');
  });

  it('really is a flip — the running total and the position sum to a circle', () => {
    // This is the claim that explains KH 16:3's otherwise baffling
    // instruction. If the engine did not flip, this would fail.
    for (const days of [0, 29, 1000, 309861]) {
      const total = meanLongitudeByPeriodBlocks(
        days,
        CONSTANTS.NODE_PERIOD_BLOCKS,
        CONSTANTS.NODE.DAILY_MOTION,
        dmsToDecimal(CONSTANTS.NODE.START_POSITION),
      ).result;
      const position = calculateNodePosition(days).result;
      expect(normalizeDegrees(total + position), `at ${days} days`).toBeCloseTo(360 % 360, 6);
    }
  });

  it('takes a little over eighteen and a half years for one lap', () => {
    const cycleYears = 360 / dmsToDecimal(CONSTANTS.NODE.DAILY_MOTION) / 365.25;
    expect(cycleYears).toBeGreaterThan(18.4);
    expect(cycleYears).toBeLessThan(18.7);
    expect(prose).toMatch(/eighteen and a half years/);
    // And within a fraction of a percent of the modern nodal period.
    const modernYears = 6798.383 / 365.25;
    expect(Math.abs(cycleYears - modernYears) / modernYears).toBeLessThan(0.005);
  });
});

describe('KH 16:9-11 — the height itself', () => {
  it('never exceeds five degrees, and the chapter says so', () => {
    let peak = 0;
    for (let c = 0; c < 360; c += 0.5) peak = Math.max(peak, Math.abs(latAt(c)));
    expect(peak).toBeCloseTo(GALGAL_NOTEH_INCLINATION_DEG, 6);
    expect(peak).toBeCloseTo(5, 6);
    expect(prose).toMatch(/five degrees/);
  });

  it('is nil at both crossings and greatest a quarter-circle from each', () => {
    expect(Math.abs(latAt(0))).toBeLessThan(1e-9);
    expect(Math.abs(latAt(180))).toBeLessThan(1e-9);
    expect(latAt(90)).toBeCloseTo(5, 6);
    expect(latAt(270)).toBeCloseTo(-5, 6);
  });

  it('is northerly under 180° and southerly over it, per KH 16:10', () => {
    for (const c of [1, 45, 90, 179]) expect(latAt(c), `${c}°`).toBeGreaterThan(0);
    for (const c of [181, 225, 270, 359]) expect(latAt(c), `${c}°`).toBeLessThan(0);
  });

  it('quotes the tabulated values it names', () => {
    const at = (d) => TABLE_AT(d);
    expect(arcsec(at(10), dms(0, 52))).toBeLessThan(1);
    expect(arcsec(at(30), dms(2, 30))).toBeLessThan(1);
    expect(arcsec(at(60), dms(4, 20))).toBeLessThan(1);
    expect(arcsec(at(90), dms(5))).toBeLessThan(1);
    for (const quoted of ['52 minutes', '2 degrees 30', '4 degrees 20']) {
      expect(prose, quoted).toContain(quoted);
    }
  });

  it("reproduces his 53° interpolation — 3 minutes a degree, giving 3° 59'", () => {
    expect(arcsec(latAt(53), dms(3, 59))).toBeLessThan(30);
    expect(prose).toMatch(/3 minutes a degree/);
    expect(prose).toMatch(/3 degrees 59/);
  });
});

describe('KH 16:13-18 — the fold is four-way, not two-way', () => {
  it("reproduces all three of the Rambam's folding examples", () => {
    // 150 → 30 → 2°30'; 200 → 20 → 1°43'; 300 → 60 → 4°20'.
    expect(arcsec(Math.abs(latAt(150)), dms(2, 30))).toBeLessThan(1);
    expect(arcsec(Math.abs(latAt(200)), dms(1, 43))).toBeLessThan(1);
    expect(arcsec(Math.abs(latAt(300)), dms(4, 20))).toBeLessThan(1);
  });

  it('has a symmetry the two-way mirror does not', () => {
    // The four-way fold makes the height mirror about BOTH 90 and 180.
    // Chapters 13 and 15 mirror about 180 only. That extra symmetry is
    // exactly what the two extra rules buy, and it is checkable.
    for (const c of [10, 25, 45, 70, 89]) {
      expect(Math.abs(latAt(180 - c)), `${c}° vs ${180 - c}°`).toBeCloseTo(Math.abs(latAt(c)), 9);
      expect(Math.abs(latAt(c + 180)), `${c}° vs ${c + 180}°`).toBeCloseTo(Math.abs(latAt(c)), 9);
    }
  });

  it("sends every course into the quarter-circle he actually tabulates", () => {
    // The table stops at 90. The four-way fold always lands inside it;
    // the two-way rule of chapters 13 and 15 does not, which is the
    // concrete reason it cannot be carried over — for any course between
    // 90 and 270 it points at a row that does not exist.
    const foldTwoWay = (c) => (c > 180 ? 360 - c : c);
    const tabulated = Math.max(...CONSTANTS.MOON_LATITUDE_TABLE.map((r) => r.distance));
    expect(tabulated).toBe(90);

    for (const c of [120, 150, 180, 200, 240]) {
      expect(foldTwoWay(c), `two-way fold of ${c}° runs off the table`).toBeGreaterThan(tabulated);
    }
    // Whereas every course has a real answer under the chapter's own rules.
    for (let c = 0; c < 360; c += 7) {
      expect(Math.abs(latAt(c)), `${c}°`).toBeLessThanOrEqual(5 + 1e-9);
    }
  });

  it('warns the reader in as many words', () => {
    expect(prose).toMatch(/folding rule is not the one you learned|folds in \*four\*/i);
  });
});

describe('KH 16:19 — the whole thing on his evening', () => {
  it('lands on 3° 53′ southerly', () => {
    // The moon's true position at N=29 comes from chapter 15's chain and
    // is pinned there; this checks the latitude built on top of it.
    const head = calculateNodePosition(29).result;
    const moonTrue = 48 + 36 / 60 + 9.6 / 3600; // ch15's answer, pinned in ch15.test.js
    const course = normalizeDegrees(moonTrue - head);
    expect(arcsec(course, dms(231, 6))).toBeLessThan(60);

    const latitude = calculateMoonLatitude(moonTrue, head).result;
    expect(latitude).toBeLessThan(0); // southerly
    expect(arcsec(Math.abs(latitude), dms(3, 53))).toBeLessThan(60);
    expect(prose).toMatch(/3 degrees and 53 minutes/);
    expect(prose).toMatch(/southerly/);
  });
});

/** The tabulated latitude at a whole-degree course, straight from the table. */
function TABLE_AT(distance) {
  const row = CONSTANTS.MOON_LATITUDE_TABLE.find((r) => r.distance === distance);
  return row ? row.latitude : NaN;
}
