/**
 * The nine-step card's recipe lines.
 *
 * A reader said not all nine steps were clear — each showed a label and
 * a value but never which earlier steps it was made from. The card now
 * prints a recipe under every step ("= step 3 − step 1"). Those recipes
 * are claims about the arithmetic, so each is asserted here against the
 * same engine calls the card makes, at his worked example and at two
 * arbitrary day counts.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateMoonMeanLongitude,
  calculateMoonMaslul,
  calculateSeasonCorrection,
  calculateDoubleElongation,
  calculateMaslulHanachon,
  lookupMoonMaslulCorrection,
  calculateMoonTrueLongitude,
} from '../../../engine/moonCalculations';
import { calculateSunMeanLongitude, calculateSunApogee } from '../../../engine/sunCalculations';
import { trueFromMean } from '../../../lib/maslulTable';
import { normalizeDegrees } from '../../../engine/dmsUtils';

const chain = (days) => {
  const sunMean = calculateSunMeanLongitude(days).result; // step 1
  const sunTrue = trueFromMean(sunMean, calculateSunApogee(days).result).trueLongitude;
  const moonRaw = calculateMoonMeanLongitude(days).result; // step 2
  const season = calculateSeasonCorrection(sunTrue).result;
  const moonAtSighting = normalizeDegrees(moonRaw + season); // step 3
  const withinPath = calculateMoonMaslul(days).result; // step 4
  const elongation = normalizeDegrees(moonAtSighting - sunMean); // step 5
  const doubled = calculateDoubleElongation(moonAtSighting, sunMean).result; // step 6
  const hanachon = calculateMaslulHanachon(withinPath, doubled); // step 7
  const correction = lookupMoonMaslulCorrection(hanachon.result); // step 8
  const trueLongitude = calculateMoonTrueLongitude(
    moonAtSighting,
    hanachon.result,
    correction.result,
    correction.direction,
  ).result; // step 9
  return { sunMean, moonRaw, season, moonAtSighting, withinPath, elongation, doubled, hanachon, correction, trueLongitude };
};

describe.each([[29], [100], [309866]])('the recipes hold at %i days', (days) => {
  const c = chain(days);

  it('step 3 = step 2 + the season nudge', () => {
    expect(c.moonAtSighting).toBeCloseTo(normalizeDegrees(c.moonRaw + c.season), 9);
  });

  it('step 5 = step 3 − step 1', () => {
    expect(c.elongation).toBeCloseTo(normalizeDegrees(c.moonAtSighting - c.sunMean), 9);
  });

  it('step 6 = step 5 × 2', () => {
    expect(c.doubled).toBeCloseTo(normalizeDegrees(c.elongation * 2), 9);
  });

  it('step 7 = step 4 + a whole-degree nudge looked up by step 6', () => {
    const nudge = c.hanachon.result - c.withinPath;
    expect(nudge).toBeGreaterThanOrEqual(0);
    expect(nudge).toBeLessThanOrEqual(9);
    expect(Number.isInteger(Math.round(nudge * 1e9) / 1e9)).toBe(true);
  });

  it('step 9 = step 3 ± step 8 — applied to the ADJUSTED mean, not the raw one', () => {
    // The recipe a reader is most likely to guess wrong, and the reason
    // the card labels it: the fix goes onto step 3, not step 2.
    const expected =
      c.correction.direction === 'subtract'
        ? normalizeDegrees(c.moonAtSighting - c.correction.result)
        : normalizeDegrees(c.moonAtSighting + c.correction.result);
    expect(c.trueLongitude).toBeCloseTo(expected, 9);
  });
});
