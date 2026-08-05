/**
 * Equivalence tests: the animation fast path (`liveLongitudes.js`) must
 * agree with the pipeline's step functions at integer days.
 *
 * Until 2026-08-05 the fast path used `dailyMotion × days` with its own
 * node formula (start − rate·days instead of KH 16:3's 360 − emtza) and
 * no season correction, so the 3D scene / ecliptic ribbon / trails and
 * the true-conjunction finder disagreed with the sidebar by ~2.6° (moon)
 * to ~30° (node). These tests pin the two code paths together so they
 * cannot drift apart again.
 */
import { describe, it, expect } from 'vitest';
import { liveSun, liveMoon, liveAll } from '../liveLongitudes.js';
import {
  calculateSunMeanLongitude,
  calculateSunApogee,
  calculateSunMaslul,
  lookupMaslulCorrection,
  calculateSunTrueLongitude,
} from '../sunCalculations.js';
import {
  calculateMoonMeanLongitude,
  calculateSeasonCorrection,
  calculateMoonMaslul,
  calculateDoubleElongation,
  calculateMaslulHanachon,
  lookupMoonMaslulCorrection,
  calculateMoonTrueLongitude,
  calculateNodePosition,
} from '../moonCalculations.js';
import { normalizeDegrees } from '../dmsUtils.js';

/** Run the pipeline's astronomical chain (steps 2-10) via the step
 *  functions, returning plain numbers for comparison. */
function pipelineNumbers(days) {
  const sunMean = calculateSunMeanLongitude(days).result;
  const apogee = calculateSunApogee(days).result;
  const sunMaslul = calculateSunMaslul(sunMean, apogee).result;
  const sunCorr = lookupMaslulCorrection(sunMaslul);
  const sunTrue = calculateSunTrueLongitude(sunMean, sunMaslul, sunCorr.result).result;

  const moonRaw = calculateMoonMeanLongitude(days).result;
  const season = calculateSeasonCorrection(sunTrue).result;
  const moonMean = normalizeDegrees(moonRaw + season);
  const maslul = calculateMoonMaslul(days).result;
  const merchakKaful = calculateDoubleElongation(moonMean, sunMean).result;
  const hanachon = calculateMaslulHanachon(maslul, merchakKaful);
  const moonCorr = lookupMoonMaslulCorrection(hanachon.result);
  const moonTrue = calculateMoonTrueLongitude(
    moonMean, hanachon.result, moonCorr.result, moonCorr.direction,
  ).result;
  const node = calculateNodePosition(days).result;

  return { sunMean, apogee, sunTrue, moonMean, maslul, hanachon: hanachon.result, moonTrue, node };
}

const EPS = 1e-6; // ≈ 0.0036 arc-seconds

// Broad sweep across ±15 years around the current era, plus the two
// gold dates (Rambam's 2 Iyar example N=29; the 2 Sivan worksheet
// N=309775) and the 3 Nisan 5786 reference.
const SAMPLE_DAYS = [
  29, 309716, 309775,
  ...Array.from({ length: 24 }, (_, i) => 304000 + i * 487),
];

describe('liveAll ≡ pipeline at integer days', () => {
  it.each(SAMPLE_DAYS.map((d) => [d]))('N = %i', (days) => {
    const expected = pipelineNumbers(days);
    const { sun, moon } = liveAll(days);

    expect(sun.meanLongitude, 'sun mean').toBeCloseTo(expected.sunMean, 6);
    expect(sun.apogee, 'sun apogee').toBeCloseTo(expected.apogee, 6);
    expect(sun.trueLongitude, 'sun true').toBeCloseTo(expected.sunTrue, 6);
    expect(moon.meanLongitude, 'moon mean (at re\'iyah)').toBeCloseTo(expected.moonMean, 6);
    expect(moon.maslul, 'moon maslul').toBeCloseTo(expected.maslul, 6);
    expect(moon.maslulHanachon, 'maslul hanachon').toBeCloseTo(expected.hanachon, 6);
    expect(moon.trueLongitude, 'moon true').toBeCloseTo(expected.moonTrue, 6);
    expect(moon.node, 'node (makom rosh)').toBeCloseTo(expected.node, 6);
  });
});

describe('node formula — KH 16:3 (makom rosh = 360 − emtza)', () => {
  it("reproduces the Rambam's 16:5 worked example (N = 29 → Virgo 27°30')", () => {
    const { moon } = liveAll(29);
    // 360 − 182°29'37" = 177°30'23"; displayed to the minute: 177°30'
    expect(Math.abs(moon.node - (177 + 30 / 60))).toBeLessThan(1 / 60);
  });
});

describe('fractional days extend the whole-day base smoothly', () => {
  it('moon mean advances monotonically inside a day (no wrap sample)', () => {
    const n = 309775;
    const at = (f) => liveMoon(n + f, liveSun(n + f).meanLongitude).meanLongitude;
    // Pick a day where the moon mean stays inside [0,360) for the whole day
    const v0 = at(0);
    const v1 = at(0.999);
    if (v1 > v0) {
      expect(at(0.25)).toBeGreaterThan(v0);
      expect(at(0.75)).toBeLessThan(v1);
      // ~13°10' per day
      expect(v1 - v0).toBeGreaterThan(12);
      expect(v1 - v0).toBeLessThan(14);
    }
  });

  it('liveSun at N + 0.5 sits between its integer-day neighbours', () => {
    const n = 305003;
    const a = liveSun(n).meanLongitude;
    const b = liveSun(n + 1).meanLongitude;
    const mid = liveSun(n + 0.5).meanLongitude;
    if (b > a) {
      expect(mid).toBeGreaterThan(a);
      expect(mid).toBeLessThan(b);
    }
  });
});
