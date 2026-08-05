/**
 * Provenance pins for Rambam-published tables (AUDIT_PLAN.md deliverable 2).
 *
 * Every row of the two moon tables and the double-elongation bands is
 * asserted against the verbatim source readings adjudicated on
 * 2026-08-05 (Sefaria Torat Emet 363 + Touger/Moznaim authentic-mss
 * footnotes; see docs/sources/KH_15_verbatim.md and KH_16_verbatim.md,
 * and OPEN_QUESTIONS.md Q10 for the hybrid-transcription diagnosis).
 * Future "refinements" cannot silently drift these values again.
 *
 * Two of the Rambam's own worked examples are pinned as internal
 * consistency proofs — they are what adjudicated the readings:
 *   - KH 16:12: maslul harochav 53° → מנה 3°59'
 *   - KH 17:13: moon Taurus 18°36', rosh Virgo 27°30' → רוחב ראשון 3°53' South
 */
import { describe, it, expect } from 'vitest';
import { CONSTANTS } from '../constants.js';
import { calculateMoonLatitude, calculateMaslulHanachon } from '../moonCalculations.js';

const dms = (d, m = 0, s = 0) => d + m / 60 + s / 3600;

describe('MOON_MASLUL_CORRECTIONS — KH 15:6 verbatim (19 rows)', () => {
  const expected = [
    [0, 0],
    [10, dms(0, 50)],
    [20, dms(1, 38)],
    [30, dms(2, 24)],
    [40, dms(3, 6)],
    [50, dms(3, 44)],
    [60, dms(4, 16)],
    [70, dms(4, 41)],
    [80, dms(5, 0)],
    [90, dms(5, 5)],
    [100, dms(5, 8)],
    [110, dms(4, 59)],
    [120, dms(4, 40)], // authentic mss (Touger fn. 12); standard prints: 4°20'
    [130, dms(4, 11)],
    [140, dms(3, 33)],
    [150, dms(2, 48)], // authentic mss (Touger fn. 13); standard prints: 3°48'
    [160, dms(1, 56)],
    [170, dms(0, 59)], // Sefaria's 1°59' is a dropped-word corruption
    [180, 0],
  ];

  it('matches the adjudicated reading row-for-row', () => {
    const table = CONSTANTS.MOON_MASLUL_CORRECTIONS;
    expect(table).toHaveLength(expected.length);
    expected.forEach(([maslul, correction], i) => {
      expect(table[i].maslul, `row ${maslul}° key`).toBe(maslul);
      expect(table[i].correction, `row ${maslul}° value`).toBeCloseTo(correction, 10);
    });
  });

  it('falls monotonically from the 100° peak to 0 at 180° (KH 15:6 structure)', () => {
    const table = CONSTANTS.MOON_MASLUL_CORRECTIONS;
    const peakIdx = table.findIndex((r) => r.maslul === 100);
    for (let i = peakIdx + 1; i < table.length; i++) {
      expect(
        table[i].correction,
        `row ${table[i].maslul}° must be below row ${table[i - 1].maslul}°`,
      ).toBeLessThan(table[i - 1].correction);
    }
  });
});

describe('MOON_LATITUDE_TABLE — KH 16:11 verbatim (10 rows)', () => {
  const expected = [
    [0, 0],
    [10, dms(0, 52)],
    [20, dms(1, 43)],
    [30, dms(2, 30)],
    [40, dms(3, 13)],
    [50, dms(3, 50)],
    [60, dms(4, 20)],
    [70, dms(4, 42)],
    [80, dms(4, 55)],
    [90, dms(5, 0)],
  ];

  it('matches the verbatim reading row-for-row', () => {
    const table = CONSTANTS.MOON_LATITUDE_TABLE;
    expect(table).toHaveLength(expected.length);
    expected.forEach(([distance, latitude], i) => {
      expect(table[i].distance, `row ${distance}° key`).toBe(distance);
      expect(table[i].latitude, `row ${distance}° value`).toBeCloseTo(latitude, 10);
    });
  });

  it('grows strictly to the 5° maximum at 90° (KH 16:9 — no early plateau)', () => {
    const table = CONSTANTS.MOON_LATITUDE_TABLE;
    for (let i = 1; i < table.length; i++) {
      expect(
        table[i].latitude,
        `row ${table[i].distance}° must exceed row ${table[i - 1].distance}°`,
      ).toBeGreaterThan(table[i - 1].latitude);
    }
    expect(table[table.length - 1].latitude).toBeCloseTo(5, 10);
  });
});

describe('DOUBLE_ELONGATION_ADJUSTMENTS — KH 15:3 verbatim bands', () => {
  it('states the ten Rambam bands exactly', () => {
    const rambamBands = [
      [0, 5, 0],
      [6, 11, 1],
      [12, 18, 2],
      [19, 24, 3],
      [25, 31, 4],
      [32, 38, 5],
      [39, 45, 6],
      [46, 51, 7],
      [52, 59, 8],
      [60, 63, 9],
    ];
    rambamBands.forEach(([min, max, adj], i) => {
      const row = CONSTANTS.DOUBLE_ELONGATION_ADJUSTMENTS[i];
      expect([row.minElongation, row.maxElongation, row.adjustment], `band ${i}`)
        .toEqual([min, max, adj]);
      expect(row.source, `band ${i} must not be flagged approximated`).toBeUndefined();
    });
    // Rows beyond 63° are extrapolation (KH 15:2 bounds sighting-night
    // merchak at 62°) and must stay flagged.
    CONSTANTS.DOUBLE_ELONGATION_ADJUSTMENTS.slice(rambamBands.length).forEach((row) => {
      expect(row.source).toBe('approximated');
    });
  });
});

describe("Internal consistency — the Rambam's own worked values", () => {
  it("KH 16:12: maslul harochav 53° interpolates to 3°59'", () => {
    // moonTrue 53°, rosh 0° → distance 53°, northern
    const step = calculateMoonLatitude(53, 0);
    expect(Math.abs(step.result - dms(3, 59))).toBeLessThan(1 / 60);
    expect(step.result).toBeGreaterThan(0);
  });

  it("KH 17:13: moon Taurus 18°36', rosh Virgo 27°30' → רוחב ראשון 3°53' South", () => {
    const moonTrue = dms(48, 36);
    const rosh = dms(177, 30);
    const step = calculateMoonLatitude(moonTrue, rosh);
    expect(Math.abs(Math.abs(step.result) - dms(3, 53))).toBeLessThan(1 / 60);
    expect(step.result).toBeLessThan(0); // דרומי
  });

  it("KH 15:8: merchak kaful 35°56'12\" adds exactly 5 to the maslul", () => {
    const step = calculateMaslulHanachon(dms(103, 21, 46), dms(35, 56, 12));
    expect(step.inputs.adjustment.value).toBe(5);
  });
});
