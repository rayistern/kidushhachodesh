/**
 * Tests for the KH 15:3 double-elongation adjustment (maslul hanachon).
 *
 * Two anchors:
 *
 *   1. The verbatim band table of KH 15:3 (Sefaria Torat Emet 363,
 *      pulled 2026-08-05): 5 or close to 5 → nothing; 6-11 → +1;
 *      12-18 → +2; 19-24 → +3; 25-31 → +4; 32-38 → +5; 39-45 → +6;
 *      46-51 → +7; 52-59 → +8; 60-63 → +9. The bands are stated in
 *      whole degrees, and the opening "חמש מעלות או קרוב לחמש" ("five
 *      or CLOSE to five") is the Rambam's own instruction for
 *      fractional values: they belong to the nearest whole degree.
 *      Before 2026-08-05 the lookup tested the raw fractional value
 *      against integer-closed bands, so ~5.8% of dates (any merchak
 *      in a between-band gap like 11°-12°) silently got adjustment 0.
 *
 *   2. The Rambam's own worked example (KH 15:8): merchak kaful
 *      35°56'12" → add 5 to the emtza hamaslul ("תוסיף על אמצע
 *      המסלול חמש מעלות"), plus the surrounding chain values he
 *      states for 2 Iyar of the epoch year (N = 29 days).
 */
import { describe, it, expect } from 'vitest';
import { calculateSunMeanLongitude } from '../sunCalculations.js';
import {
  calculateMoonMeanLongitude,
  calculateMoonMaslul,
  calculateDoubleElongation,
  calculateMaslulHanachon,
  lookupMoonMaslulCorrection,
} from '../moonCalculations.js';

/** Verbatim KH 15:3 bands (plus the documented >63° extrapolation). */
function expectedAdjustment(wholeDegrees) {
  if (wholeDegrees <= 5) return 0;
  if (wholeDegrees <= 11) return 1;
  if (wholeDegrees <= 18) return 2;
  if (wholeDegrees <= 24) return 3;
  if (wholeDegrees <= 31) return 4;
  if (wholeDegrees <= 38) return 5;
  if (wholeDegrees <= 45) return 6;
  if (wholeDegrees <= 51) return 7;
  if (wholeDegrees <= 59) return 8;
  return 9; // 60-63 per the Rambam; beyond 63 extrapolated (source: 'approximated')
}

/** The adjustment actually applied, recovered from the step object. */
function adjustmentFor(merchakKaful) {
  return calculateMaslulHanachon(0, merchakKaful).inputs.adjustment.value;
}

describe('KH 15:3 band table — whole-degree inputs (verbatim)', () => {
  it('matches the Rambam band-for-band at every integer 0-63', () => {
    for (let deg = 0; deg <= 63; deg++) {
      expect(adjustmentFor(deg), `merchak ${deg}°`).toBe(expectedAdjustment(deg));
    }
  });

  it('extrapolates +9 beyond 63° and flags it as approximated', () => {
    const step = calculateMaslulHanachon(0, 75);
    expect(step.inputs.adjustment.value).toBe(9);
    expect(step.source).toBe('approximated');
  });

  it('mirrors merchak > 180° into the 0-180 range', () => {
    // 350° → effective 10° → +1
    expect(adjustmentFor(350)).toBe(1);
  });
});

describe('KH 15:3 — fractional merchak ("או קרוב לחמש")', () => {
  it('never falls through a between-band gap (continuity sweep 0-180°)', () => {
    for (let m = 0; m <= 180; m += 0.1) {
      const merchak = Math.round(m * 10) / 10;
      expect(
        adjustmentFor(merchak),
        `merchak ${merchak}°`,
      ).toBe(expectedAdjustment(Math.round(merchak)));
    }
  });

  it('assigns each former gap value to its nearest whole-degree band', () => {
    // Each pair: [fractional merchak, expected adjustment].
    // 5.4 is "close to five" → nothing; 5.6 is close to six → +1; etc.
    // Exact halves round up (the Rambam gives no ruling on x.5;
    // round-half-up is the conventional reading of קרוב).
    const cases = [
      [5.4, 0], [5.5, 1], [5.6, 1],
      [11.4, 1], [11.5, 2], [11.6, 2],
      [18.5, 3], [24.5, 4], [31.5, 5],
      [38.5, 6], [45.5, 7], [51.5, 8],
      [59.3, 8], [59.5, 9], [59.7, 9],
      [63.4, 9], [63.5, 9],
    ];
    for (const [merchak, expected] of cases) {
      expect(adjustmentFor(merchak), `merchak ${merchak}°`).toBe(expected);
    }
  });
});

describe("KH 15:8-9 — the Rambam's worked example (2 Iyar, N = 29)", () => {
  const N = 29;
  const ARC_SEC = 1 / 3600;

  it("reproduces the Rambam's stated chain to within a few arc-seconds", () => {
    const sunMean = calculateSunMeanLongitude(N).result;
    // "יצא לך אמצעו ל"ה מעלות ול"ח חלקים ול"ג שניות"
    expect(sunMean).toBeCloseTo(35 + 38 / 60 + 33 / 3600, 3);

    // His stated emtza at sha'at re'iyah (53°36'39") is the raw mean
    // plus the +15' season correction he applied for this date.
    const moonRaw = calculateMoonMeanLongitude(N).result;
    expect(Math.abs(moonRaw - (53 + 21 / 60 + 39 / 3600))).toBeLessThan(3 * ARC_SEC);
    const moonReiyah = moonRaw + 15 / 60;

    // "יצא לך אמצעו ק"ג מעלות וכ"א חלקים ומ"ו שניות"
    const maslul = calculateMoonMaslul(N).result;
    expect(Math.abs(maslul - (103 + 21 / 60 + 46 / 3600))).toBeLessThan(3 * ARC_SEC);

    // "יצא לך המרחק הכפול ל"ה מעלות ונ"ו חלקים וי"ב שניות"
    const merchakKaful = calculateDoubleElongation(moonReiyah, sunMean).result;
    expect(Math.abs(merchakKaful - (35 + 56 / 60 + 12 / 3600))).toBeLessThan(4 * ARC_SEC);

    // "לפיכך תוסיף על אמצע המסלול חמש מעלות"
    const hanachon = calculateMaslulHanachon(maslul, merchakKaful);
    expect(hanachon.inputs.adjustment.value).toBe(5);
    expect(Math.abs(hanachon.result - (108 + 21 / 60 + 46 / 3600))).toBeLessThan(4 * ARC_SEC);

    // "נמצאת מנה שלו חמש מעלות וחלק אחד" (he truncates the maslul to
    // 108 before interpolating; we interpolate continuously — both
    // land on 5°1' to the arc-minute)
    const menta = lookupMoonMaslulCorrection(hanachon.result).result;
    expect(Math.abs(menta - (5 + 1 / 60))).toBeLessThan(1 / 60);

    // "ונמצא מקום הירח האמתי... בי"ח מעלות ול"ו חלקים" (Taurus 18°36' = 48°36')
    const moonTrue = moonReiyah - menta;
    expect(Math.abs(moonTrue - (48 + 36 / 60))).toBeLessThan(1 / 60);
  });
});
