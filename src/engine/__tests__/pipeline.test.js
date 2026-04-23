import { describe, it, expect } from 'vitest';
import { getFullCalculation } from '../pipeline';
import { moladsAround, findTrueConjunction, MOLAD_INTERVAL_DAYS } from '../moladTimeline';

/**
 * Smoke tests — we're not asserting exact Rambam table values here
 * (that would require committing to a specific epoch reference), just
 * that the engine is pure, stable, and internally consistent.
 */
describe('engine/pipeline getFullCalculation', () => {
  const date = new Date('2026-04-07');

  it('returns steps + stepMap + sun + moon + visibility + season', () => {
    const r = getFullCalculation(date);
    expect(r.steps.length).toBeGreaterThan(10);
    expect(r.stepMap).toBeTruthy();
    expect(r.sun).toBeTruthy();
    expect(r.moon).toBeTruthy();
    expect(typeof r.moon.isVisible).toBe('boolean');
    expect(r.season).toBeTruthy();
  });

  it('days-from-epoch is an integer', () => {
    const r = getFullCalculation(date);
    expect(Number.isFinite(r.daysFromEpoch)).toBe(true);
    expect(Math.round(r.daysFromEpoch)).toBe(r.daysFromEpoch);
  });

  it('longitudes are normalized to [0, 360)', () => {
    const r = getFullCalculation(date);
    for (const v of [
      r.sun.meanLongitude,
      r.sun.trueLongitude,
      r.moon.meanLongitude,
      r.moon.trueLongitude,
      r.moon.nodePosition,
    ]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(360);
    }
  });

  it('is deterministic — same input, same output', () => {
    const a = getFullCalculation(date);
    const b = getFullCalculation(date);
    expect(a.sun.trueLongitude).toBe(b.sun.trueLongitude);
    expect(a.moon.trueLongitude).toBe(b.moon.trueLongitude);
  });

  it('stepMap contains core IDs used by STEP_CONTRIBUTORS', () => {
    const r = getFullCalculation(date);
    for (const id of [
      'sunMeanLongitude',
      'sunTrueLongitude',
      'moonMeanLongitude',
      'moonTrueLongitude',
      'doubleElongation',
      'moonLatitude',
    ]) {
      expect(r.stepMap[id], `missing step ${id}`).toBeTruthy();
    }
  });
});

describe('engine/moladTimeline', () => {
  it('MOLAD_INTERVAL_DAYS ≈ 29.530594', () => {
    expect(MOLAD_INTERVAL_DAYS).toBeCloseTo(29.530594, 5);
  });

  it('moladsAround returns 2*count+1 entries centred on anchor', () => {
    const list = moladsAround(10000, 5);
    expect(list.length).toBe(11);
    // Adjacent moladot are ~29.53 days apart
    const gaps = list.slice(1).map((m, i) => m.daysFromEpoch - list[i].daysFromEpoch);
    for (const g of gaps) expect(g).toBeCloseTo(MOLAD_INTERVAL_DAYS, 4);
  });

  it('findTrueConjunction stays within ±18h of the mean molad', () => {
    const mean = 10000;
    const t = findTrueConjunction(mean);
    expect(Math.abs(t - mean)).toBeLessThanOrEqual(18 / 24 + 1e-6);
  });
});
