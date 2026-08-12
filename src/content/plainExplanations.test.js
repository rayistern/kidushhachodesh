/**
 * The plain-language notes sit directly beneath halachot, in a reader
 * for a religious text. Two things therefore have to hold: the numbers
 * they quote must match the halacha they sit under, and they must never
 * appear without attribution.
 *
 * The attribution half is asserted in TextChapter.test.jsx, where the
 * rendering lives. This file guards the content.
 */
import { describe, it, expect } from 'vitest';
import { PLAIN_EXPLANATIONS, explanationsForChapter, hasExplanations } from './plainExplanations';
import { trueFromMean, correctionWithTrace } from '../lib/maslulTable';
import { formatDms } from '../engine/dmsUtils';

const dms = (d, m = 0, s = 0) => d + m / 60 + s / 3600;

describe('coverage', () => {
  it('explains every halacha of chapter 13, and nothing that is not there', () => {
    const keys = Object.keys(explanationsForChapter(13)).map(Number).sort((a, b) => a - b);
    // Sefaria serves 11 halachot for KH 13.
    expect(keys).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('reports which chapters have notes', () => {
    expect(hasExplanations(13)).toBe(true);
    expect(hasExplanations(1)).toBe(false);
    expect(explanationsForChapter(99)).toEqual({});
  });

  it('has no empty or placeholder notes', () => {
    for (const [chapter, byHalacha] of Object.entries(PLAIN_EXPLANATIONS)) {
      for (const [halacha, note] of Object.entries(byHalacha)) {
        expect(note.trim().length, `${chapter}:${halacha}`).toBeGreaterThan(80);
        expect(note).not.toMatch(/TODO|TKTK|FIXME|lorem/i);
      }
    }
  });
});

describe('the numbers quoted match the halachot they sit under', () => {
  const ch13 = explanationsForChapter(13);

  it("13:4 — quotes the table's peak correctly", () => {
    expect(ch13[4]).toContain(`1 degree and 59 minutes`);
    expect(formatDms(correctionWithTrace(90).correction)).toBe(`1° 59′ 0.0″`);
  });

  it("13:6 — quotes the 300° fold and its answer", () => {
    expect(ch13[6]).toContain(`1°41'`);
    expect(formatDms(correctionWithTrace(300).correction)).toBe(`1° 41′ 0.0″`);
  });

  it("13:7 — quotes the 65° interpolation the halacha works", () => {
    expect(ch13[7]).toContain(`1°46'`);
    expect(formatDms(correctionWithTrace(65).correction)).toBe(`1° 46′ 0.0″`);
  });

  it("13:8 — quotes the 67° interpolation", () => {
    expect(ch13[8]).toContain(`1°48'`);
    expect(formatDms(correctionWithTrace(67).correction)).toBe(`1° 48′ 0.0″`);
  });

  it("13:9 — quotes every figure of the worked example", () => {
    const r = trueFromMean(dms(105, 37, 25), dms(86, 45, 23));
    expect(ch13[9]).toContain(`105°37'25"`);
    expect(ch13[9]).toContain(`86°45'23"`);
    expect(ch13[9]).toContain(`18°52'2"`);
    expect(formatDms(r.rawCourse)).toBe(`18° 52′ 2.0″`);
    // It says the course rounds to 19° and yields 38 minutes.
    expect(ch13[9]).toContain(`19°`);
    expect(ch13[9]).toContain(`38 minutes`);
    expect(r.course).toBe(19);
    expect(formatDms(r.correction)).toBe(`0° 38′ 0.0″`);
  });

  it("13:10 — quotes the result and the constellation", () => {
    const r = trueFromMean(dms(105, 37, 25), dms(86, 45, 23));
    expect(ch13[10]).toContain(`104°59'25"`);
    expect(ch13[10]).toContain('Sartan');
    expect(formatDms(r.trueLongitude)).toBe(`104° 59′ 25.0″`);
  });
});

describe('the notes stay inside what the halachot actually say', () => {
  const ch13 = explanationsForChapter(13);

  it('13:2 — gets the direction of the correction the right way round', () => {
    // Under 180° subtract, over 180° add. Reversing this would be a
    // plausible-sounding error that changes every answer.
    expect(ch13[2]).toMatch(/less than half a circle[^.]*take the fix away/is);
    expect(ch13[2]).toMatch(/more than half a circle[^.]*add/is);
  });

  it('13:3 — names both courses that need no correction', () => {
    expect(ch13[3]).toMatch(/half a circle/i);
    expect(ch13[3]).toMatch(/whole one|whole circle/i);
  });

  it('13:9 — states the rounding rule in the direction the halacha gives', () => {
    expect(ch13[9]).toMatch(/more than half a degree.*one more degree/is);
  });
});
