/**
 * The Rambam's own worked examples as end-to-end fixtures.
 *
 * Coverage map (each example lives with the chapter it tests):
 *   - KH 13:9-10 (sun true longitude, N=100)  → THIS FILE
 *   - KH 15:8-9  (moon true longitude, N=29)  → maslulHanachon.test.js
 *   - KH 16:5    (node, N=29)                 → liveLongitudes.test.js
 *   - KH 16:12   (latitude interpolation 53°) → constantsProvenance.test.js
 *   - KH 17:13-14 (visibility chain, 2 Iyar)  → visibilityChain.test.js
 *
 * Verbatim source for this file: Sefaria Torat Emet 363, pulled
 * 2026-08-05. The Rambam rounds at each display step ("אל תקפיד בכל
 * מסלול על החלקים… אל תפנה אל השניות"); the engine interpolates
 * continuously, so assertions use ±1' — his own stated tolerance.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateSunMeanLongitude,
  calculateSunApogee,
  calculateSunMaslul,
  lookupMaslulCorrection,
  calculateSunTrueLongitude,
} from '../sunCalculations.js';

const dms = (d, m = 0, s = 0) => d + m / 60 + s / 3600;
const ARC_SEC = 1 / 3600;

describe("KH 13:9-10 — the Rambam's sun worked example (14 Tammuz, N = 100)", () => {
  const N = 100;

  it('sun mean = 105°37\'25" (סימנו ק"ה ל"ז כ"ה)', () => {
    const step = calculateSunMeanLongitude(N);
    expect(Math.abs(step.result - dms(105, 37, 25))).toBeLessThan(2 * ARC_SEC);
  });

  it('apogee = 86°45\'23" (פ"ו מ"ה כ"ג) — pins the 0.15"/day rate over 100 days', () => {
    // Epoch apogee 86°45'8" + 100 × 0.15" = 86°45'23". Under the
    // pre-Phase-R 1.5"/day error this would read 86°47'38" — this is
    // the Rambam's own confirmation of the corrected rate.
    const step = calculateSunApogee(N);
    expect(Math.abs(step.result - dms(86, 45, 23))).toBeLessThan(2 * ARC_SEC);
  });

  it('maslul = 18°52\'2" and its menta = 38\' (he rounds the maslul to 19°)', () => {
    const mean = calculateSunMeanLongitude(N).result;
    const apogee = calculateSunApogee(N).result;
    const maslul = calculateSunMaslul(mean, apogee).result;
    expect(Math.abs(maslul - dms(18, 52, 2))).toBeLessThan(3 * ARC_SEC);
    // The Rambam rounds 18°52' → 19° → menta 38'. Continuous
    // interpolation at 18°52' gives 37.7' — inside his ±1' tolerance.
    const menta = lookupMaslulCorrection(maslul).result;
    expect(Math.abs(menta - dms(0, 38))).toBeLessThan(1 / 60);
  });

  it('sun true = Cancer 15° less 35" (104°59\'25")', () => {
    const mean = calculateSunMeanLongitude(N).result;
    const apogee = calculateSunApogee(N).result;
    const maslul = calculateSunMaslul(mean, apogee).result;
    const menta = lookupMaslulCorrection(maslul).result;
    const trueLon = calculateSunTrueLongitude(mean, maslul, menta).result;
    expect(Math.abs(trueLon - dms(104, 59, 25))).toBeLessThan(1 / 60);
  });
});
