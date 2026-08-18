/**
 * KH 13's worked examples, which are unusually complete — he gives the
 * interpolation twice (13:7, 13:8) and then chains a full calculation
 * from chapter 12's answer through to a position in the constellations
 * (13:9-10). All of it is pinned here.
 */
import { describe, it, expect } from 'vitest';
import {
  roundCourse,
  correctionWithTrace,
  correctionDirection,
  trueFromMean,
} from './maslulTable';
import { formatDms } from '../engine/dmsUtils';
import { zodiacPosition } from '../engine/zodiac';
import { lookupMaslulCorrection } from '../engine/sunCalculations';

const dms = (d, m = 0, s = 0) => d + m / 60 + s / 3600;

describe('KH 13:7-8 — interpolating between rows', () => {
  it("gives 1° 46' for a course of 65°, as he works it", () => {
    const { correction, lo, hi, perDegree } = correctionWithTrace(65);
    expect(formatDms(correction)).toBe(`1° 46′ 0.0″`);
    expect(lo.maslul).toBe(60);
    expect(hi.maslul).toBe(70);
    // "there are ten minutes between these measures... a degree will
    // bring an increase of a minute"
    expect(perDegree * 60).toBeCloseTo(1, 10);
  });

  it("gives 1° 48' for a course of 67°, as he works it", () => {
    expect(formatDms(correctionWithTrace(67).correction)).toBe(`1° 48′ 0.0″`);
  });

  it('returns tabulated rows without interpolating', () => {
    expect(correctionWithTrace(90).exact).toBe(true);
    expect(formatDms(correctionWithTrace(90).correction)).toBe(`1° 59′ 0.0″`);
  });
});

describe('KH 13:5-6 — mirroring a course past 180°', () => {
  it('reads 200° as 160°, giving 42 minutes', () => {
    const t = correctionWithTrace(200);
    expect(t.mirrored).toBe(true);
    expect(t.effective).toBe(160);
    expect(formatDms(t.correction)).toBe(`0° 42′ 0.0″`);
  });

  it("reads 300° as 60°, giving 1° 41'", () => {
    const t = correctionWithTrace(300);
    expect(t.effective).toBe(60);
    expect(formatDms(t.correction)).toBe(`1° 41′ 0.0″`);
  });
});

describe('KH 13:2-3 — direction, and the two courses with no correction', () => {
  it('subtracts under half a circle and adds over it', () => {
    expect(correctionDirection(19)).toBe('subtract');
    expect(correctionDirection(200)).toBe('add');
  });

  it('has no correction at all at 0°, 180° and 360°', () => {
    for (const course of [0, 180, 360]) {
      expect(correctionDirection(course)).toBe('none');
      expect(correctionWithTrace(course).correction).toBe(0);
    }
  });
});

describe('KH 13:9 — the course is read to whole degrees', () => {
  it('drops minutes under thirty and carries thirty or more', () => {
    expect(roundCourse(dms(18, 52, 2))).toBe(19); // his own example
    expect(roundCourse(dms(18, 29))).toBe(18);
    expect(roundCourse(dms(18, 30))).toBe(19);
  });
});

describe('KH 13:9-10 — the full worked example, chained from chapter 12', () => {
  // Mean and apogee are the figures he states, which the engine
  // reproduces exactly (see rambamWorkedExamples.test.js).
  const MEAN = dms(105, 37, 25);
  const APOGEE = dms(86, 45, 23);

  it("finds a course of 18° 52' 2\"", () => {
    expect(formatDms(trueFromMean(MEAN, APOGEE).rawCourse)).toBe(`18° 52′ 2.0″`);
  });

  it('rounds that to 19° and finds a correction of 38 minutes', () => {
    const r = trueFromMean(MEAN, APOGEE);
    expect(r.course).toBe(19);
    expect(formatDms(r.correction)).toBe(`0° 38′ 0.0″`);
    expect(r.direction).toBe('subtract');
  });

  it("lands on 104° 59' 25\" — Sartan, fifteen degrees less 35 seconds", () => {
    const { trueLongitude } = trueFromMean(MEAN, APOGEE);
    expect(formatDms(trueLongitude)).toBe(`104° 59′ 25.0″`);
    const pos = zodiacPosition(trueLongitude);
    expect(pos.translit).toBe('Sartan');
    // "fifteen degrees less 35 seconds" = 14° 59' 25" into the sign.
    expect(formatDms(pos.degreesInto)).toBe(`14° 59′ 25.0″`);
  });

  it('differs from the engine by about 16 arcseconds, and that is expected', () => {
    // The engine interpolates at the exact course rather than rounding
    // it first, which is more precise but is not the text's method.
    // KH 13:10 discards seconds outright, so the gap is inside his own
    // stated tolerance. Documented on maslulTable.js.
    const viaText = trueFromMean(MEAN, APOGEE).trueLongitude;
    const viaEngine = MEAN - lookupMaslulCorrection(MEAN - APOGEE).result;
    const gapArcsec = Math.abs(viaText - viaEngine) * 3600;
    expect(gapArcsec).toBeGreaterThan(10);
    expect(gapArcsec).toBeLessThan(20);
    // The gap is under the 30" that KH 13:10 treats as worth carrying
    // into the minutes at all. Note this does NOT mean the two agree to
    // the displayed minute: here they straddle a boundary, 104°59'25"
    // against 104°59'41", so rounding sends them to 104°59' and 105°00'.
    // A sub-threshold difference can still cross a boundary, and the
    // card says which figure is the Rambam's rather than implying the
    // two are interchangeable.
    expect(gapArcsec).toBeLessThan(30);
    expect(Math.round(viaText * 60)).not.toBe(Math.round(viaEngine * 60));
  });
});
