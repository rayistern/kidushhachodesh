/**
 * Chapter 15's claims, checked against the engine and the text.
 *
 * The chapter asserts several things a reader cannot verify unaided —
 * how big the moon's correction is next to the sun's, why the doubled
 * gap is bounded, and that the engine reproduces the Rambam's own
 * worked example. All of those are pinned here.
 *
 * The worked-example figures are pinned differently from the rest of
 * the book's numbers: the prose and the calculator quote **what the
 * Rambam states**, and these tests assert the engine lands within a few
 * arcseconds of each. Demanding exact equality would be wrong — he
 * truncates at each display step and the engine does not — and quoting
 * the engine's value instead would misrepresent a book about his text.
 */
import { describe, it, expect } from 'vitest';
import { bookChapter } from './index';
import { CONSTANTS } from '../../engine/constants';
import {
  calculateMoonMeanLongitude,
  calculateSeasonCorrection,
  calculateMoonMaslul,
  calculateDoubleElongation,
  calculateMaslulHanachon,
  lookupMoonMaslulCorrection,
  calculateMoonTrueLongitude,
} from '../../engine/moonCalculations';
import { calculateSunMeanLongitude, calculateSunApogee } from '../../engine/sunCalculations';
import { trueFromMean } from '../../lib/maslulTable';
import { normalizeDegrees } from '../../engine/dmsUtils';
import { zodiacPosition } from '../../engine/zodiac';

const prose = bookChapter(15)
  .sections.flatMap((s) => s.body)
  .join('\n');

const dms = (d, m = 0, s = 0) => d + m / 60 + s / 3600;
const arcsec = (a, b) => Math.abs(a - b) * 3600;

/** The full KH 15 chain at N days, as the card computes it. */
function chain(days) {
  const sunMean = calculateSunMeanLongitude(days).result;
  const sunTrue = trueFromMean(sunMean, calculateSunApogee(days).result).trueLongitude;
  const moonRaw = calculateMoonMeanLongitude(days).result;
  const season = calculateSeasonCorrection(sunTrue).result;
  const moonAtSighting = normalizeDegrees(moonRaw + season);
  const withinPath = calculateMoonMaslul(days).result;
  const elongation = normalizeDegrees(moonAtSighting - sunMean);
  const doubled = calculateDoubleElongation(moonAtSighting, sunMean).result;
  const hanachon = calculateMaslulHanachon(withinPath, doubled);
  const correction = lookupMoonMaslulCorrection(hanachon.result);
  const trueLongitude = calculateMoonTrueLongitude(
    moonAtSighting,
    hanachon.result,
    correction.result,
    correction.direction,
  ).result;
  return {
    sunMean, moonAtSighting, withinPath, elongation, doubled,
    hanachon: hanachon.result, correction: correction.result,
    direction: correction.direction, trueLongitude,
  };
}

describe('KH 15:8-9 — the engine reproduces his worked example', () => {
  const r = chain(29);

  // Each figure he states outright, with the tolerance his own rounding
  // makes necessary.
  it.each([
    ["sun's mean", () => r.sunMean, dms(35, 38, 33), 2],
    ['moon at sighting', () => r.moonAtSighting, dms(53, 36, 39), 2],
    ['moon within its path', () => r.withinPath, dms(103, 21, 46), 3],
    ['elongation', () => r.elongation, dms(17, 58, 6), 2],
    ['double elongation', () => r.doubled, dms(35, 56, 12), 3],
  ])('%s', (_label, actual, stated, tolerance) => {
    expect(arcsec(actual(), stated)).toBeLessThan(tolerance);
  });

  it('awards the +5° nudge he says it earns', () => {
    expect(Math.round(r.hanachon - r.withinPath)).toBe(5);
    // "the correct course will be 108 degrees and 21 minutes"
    expect(Math.floor(r.hanachon)).toBe(108);
  });

  it("subtracts, because the correct course is under 180°", () => {
    expect(r.direction).toBe('subtract');
  });

  it('lands on 18° 36′ into Shor, as KH 15:9 states', () => {
    const pos = zodiacPosition(r.trueLongitude);
    expect(pos.translit).toBe('Shor');
    // He gives 18°36'; the engine differs by well under a minute of arc
    // because it interpolates at the exact course where he truncates.
    expect(arcsec(pos.degreesInto, dms(18, 36))).toBeLessThan(60);
  });
});

describe('the two places the sun enters, which must not be swapped', () => {
  it("takes the season nudge from the sun's TRUE position and the elongation from its MEAN", () => {
    // KH 14:5 reads the true longitude; KH 15:1 subtracts the mean. Using
    // the same one for both would be an easy, silent, wrong simplification
    // — and at N=29 the two differ by a degree and a half, so this test
    // would catch it.
    const days = 29;
    const sunMean = calculateSunMeanLongitude(days).result;
    const sunTrue = trueFromMean(sunMean, calculateSunApogee(days).result).trueLongitude;
    expect(arcsec(sunTrue, sunMean)).toBeGreaterThan(3600);

    const moonRaw = calculateMoonMeanLongitude(days).result;
    const viaTrue = normalizeDegrees(moonRaw + calculateSeasonCorrection(sunTrue).result);
    // The stated value follows from the TRUE longitude, not the mean.
    expect(arcsec(viaTrue, dms(53, 36, 39))).toBeLessThan(2);
  });

  it('says so in the prose, so the reader is warned too', () => {
    expect(prose).toMatch(/sun/i);
    const closing = bookChapter(15).closing;
    expect(closing.missing.join(' ')).toMatch(/five degrees/i);
  });
});

describe("the chapter's claims about the moon's table", () => {
  const moonPeak = Math.max(...CONSTANTS.MOON_MASLUL_CORRECTIONS.map((r) => r.correction));
  const sunPeak = Math.max(...CONSTANTS.SUN_MASLUL_CORRECTIONS.map((r) => r.correction));

  it("peaks at 5° 8', and the prose quotes it", () => {
    expect(arcsec(moonPeak, dms(5, 8))).toBeLessThan(1);
    expect(prose).toContain("5° 8'");
  });

  it("peaks at 100°, later than the sun's 90°", () => {
    const moonAt = CONSTANTS.MOON_MASLUL_CORRECTIONS.find((r) => r.correction === moonPeak);
    const sunAt = CONSTANTS.SUN_MASLUL_CORRECTIONS.find((r) => r.correction === sunPeak);
    expect(moonAt.maslul).toBe(100);
    expect(sunAt.maslul).toBe(90);
    expect(prose).toMatch(/100 degrees rather than 90/);
  });

  it("is about two and a half times the sun's, as claimed", () => {
    const ratio = moonPeak / sunPeak;
    expect(ratio).toBeGreaterThan(2.4);
    expect(ratio).toBeLessThan(2.7);
    expect(prose).toMatch(/two and a half times/);
    expect(prose).toContain("1° 59'");
    expect(arcsec(sunPeak, dms(1, 59))).toBeLessThan(1);
  });
});

describe('KH 15:2 — why the doubled gap is bounded', () => {
  it('quotes the bounds the halacha states', () => {
    expect(prose).toMatch(/\b5 degrees\b/);
    expect(prose).toMatch(/\b62\b/);
  });

  it("stops the nudge table at 63°, just past the bound", () => {
    // The chapter argues he never tabulates beyond 63 because he never
    // needs to. Anything past that in the engine is flagged as
    // extrapolation rather than his.
    const stated = CONSTANTS.DOUBLE_ELONGATION_ADJUSTMENTS.filter(
      (r) => r.source !== 'approximated',
    );
    expect(Math.max(...stated.map((r) => r.maxElongation))).toBe(63);
  });

  it('the elongations that bound produces really are a sighting window', () => {
    // 5° and 62° doubled means 2.5° to 31° of actual separation. At the
    // moon's ~12.2°/day gain on the sun that is a few hours to about two
    // and a half days past conjunction — which is the claim the prose
    // makes about why the bound holds.
    const gainPerDay = 13.176 - 0.986;
    expect(2.5 / gainPerDay).toBeLessThan(0.3);
    expect(31 / gainPerDay).toBeGreaterThan(2.4);
    expect(31 / gainPerDay).toBeLessThan(2.7);
    expect(prose).toMatch(/two and a half days/);
  });
});
