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
import { dmsToDecimal } from '../../engine/dmsUtils';
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

describe('why the gap gets doubled (KH 15:1)', () => {
  const body = bookChapter(15)
    .sections.find((s) => s.id === 'double-elongation')
    .body.join('\n');

  const moonRate = dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY);
  const sunRate = dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY);

  it("gives the commentaries' reason: half the distance to the far point", () => {
    // Supplied by the user from his commentary — המרחק שבין השמש וגלגל
    // ההקפה הוא תמיד חצי מהמרחק שבין נקודת הגובה וגלגל ההקפה — and it
    // supersedes two weaker accounts this section carried before: that
    // doubling tracked a twice-per-lap effect, and that it merely kept
    // the table in whole numbers.
    expect(body).toMatch(/Chitrik edition/);
    expect(body).toMatch(/distance from the sun is always exactly half its distance from the far point/);
    // In chapter 14's vocabulary. "Epicycle" appears nowhere in the book's
    // prose and is defined nowhere — a reader asked what it meant, which
    // is proof it should not have been used.
    expect(body).toMatch(/small circle\\'s distance|small circle's distance/);
    expect(body).not.toMatch(/epicycle/i);
    // "Distance" must be flagged as angular. Doubly confusable here: the
    // far point is NAMED for physical distance from the earth, while the
    // two distances in the lock are degrees round the sky.
    expect(body).toMatch(/degrees apart against the sky/);
    expect(body).toMatch(/Not miles/);
    expect(body).toMatch(/נקודת הגובה/);
    expect(body).toMatch(/not a relabelling/);
  });

  it('holds exactly, at any pair of positions', () => {
    // The relation forces the far point to sit at 2*sun - moon. If that
    // is right, (far point -> epicycle) is 2 x (sun -> epicycle) always.
    const norm = (d) => ((d % 360) + 360) % 360;
    for (const days of [0, 7, 29, 100, 1000, 309866]) {
      const moon = norm(31.2469 + moonRate * days);
      const sun = norm(7.0589 + sunRate * days);
      const gap = norm(moon - sun);
      const farPoint = norm(2 * sun - moon);
      expect(norm(moon - farPoint), `${days} days`).toBeCloseTo(norm(2 * gap), 9);
    }
  });

  it('explains the vanishing at zero by the epicycle sitting on the far point', () => {
    expect(body).toMatch(/sitting \*\*on\*\* the far point/);
    expect(CONSTANTS.DOUBLE_ELONGATION_ADJUSTMENTS[0].adjustment).toBe(0);
    // The same thing is true of the sun at its own govah, which is the
    // parallel the prose draws.
    expect(CONSTANTS.SUN_MASLUL_CORRECTIONS[0].maslul).toBe(0);
    expect(CONSTANTS.SUN_MASLUL_CORRECTIONS[0].correction).toBe(0);
  });

  it('draws the parallel with chapter 13, and the structural proof of it', () => {
    expect(body).toMatch(/same step chapter 13 took/);
    expect(body).toMatch(/gives the sun a govah with its own tables and gives the moon nothing/);

    // That claim is checkable and is the strongest evidence for the whole
    // account: he tracks an apogee for the sun and none for the moon,
    // because doubling supplies the moon's.
    expect(CONSTANTS.SUN.APOGEE_START).toBeTruthy();
    expect(CONSTANTS.SUN.APOGEE_MOTION_PER_DAY).toBeTruthy();
    expect(CONSTANTS.SUN_APOGEE_PERIOD_BLOCKS).toBeTruthy();
    expect(CONSTANTS.MOON.APOGEE_START).toBeUndefined();
    expect(CONSTANTS.MOON.APOGEE_MOTION_PER_DAY).toBeUndefined();
    expect(CONSTANTS.MOON_APOGEE_PERIOD_BLOCKS).toBeUndefined();
  });

  it('quotes the implied backward motion correctly', () => {
    const rate = 2 * sunRate - moonRate;
    expect(rate).toBeLessThan(0); // backwards
    expect(Math.abs(rate)).toBeGreaterThan(11);
    expect(Math.abs(rate)).toBeLessThan(11.5);
    expect(Math.abs(360 / rate)).toBeGreaterThan(31.5);
    expect(Math.abs(360 / rate)).toBeLessThan(33);
    expect(body).toMatch(/about 11 degrees a day/);
    expect(body).toMatch(/roughly 32 days/);
    expect(body).toMatch(/never mentions any of it/);
  });
});


describe('the glossary agrees with the prose about the doubling', () => {
  it('carries the Chitrik account, not the superseded twice-a-lap one', () => {
    // The prose was corrected to the far-point geometry; the glossary
    // kept the old "happens twice in each lap" reason and disagreed with
    // the section it summarises. A reader may meet either first.
    const term = bookChapter(15).terms.find((t) => t.formal === 'the double elongation');
    expect(term.gloss).toMatch(/twice its distance from the sun/);
    expect(term.gloss).not.toMatch(/twice\*\* in each lap|twice in each lap/);
    expect(term.gloss).not.toMatch(/epicycle/i);
  });
});

describe('why the one-to-two lock holds', () => {
  const body = bookChapter(15)
    .sections.find((s) => s.id === 'double-elongation')
    .body.join('\n');

  it('gives both ingredients: common zero, fixed 2:1 growth', () => {
    expect(body).toMatch(/both distances start at zero together/);
    expect(body).toMatch(/twice as fast from the far point as from the sun/);
    expect(body).toMatch(/backwards/);
  });

  it('is right that the rates really are exactly two to one', () => {
    const sun = dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY);
    const moon = dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY);
    const far = 2 * sun - moon;
    expect((moon - far) / (moon - sun)).toBeCloseTo(2, 12);
    // And the backward speed the prose quotes.
    expect(far).toBeLessThan(0);
    expect(Math.abs(far)).toBeGreaterThan(11);
    expect(Math.abs(far)).toBeLessThan(11.5);
  });

  it('says the march is built in, not discovered', () => {
    // The direction of the logic matters: the model chooses the far
    // point's speed so the lock holds, encoding the observed pattern —
    // the lock is not derived from anything deeper.
    expect(body).toMatch(/not a coincidence; it is built in/);
  });
});

describe('nothing in the section requires guessing (reader sweep)', () => {
  const chapter15 = bookChapter(15);
  const all = chapter15.sections.flatMap((s) => s.body).join('\n');

  it('uses one name for the far point, not an unannounced synonym', () => {
    // A draft called it "the high point of the big circle" in the same
    // paragraph that everywhere else says "far point" — two names, one
    // thing, and the reader left to guess they were the same.
    expect(all).not.toMatch(/high point of the big circle/);
    expect(all).toMatch(/same kind of far point the sun had in chapter 12/);
  });

  it('does not reference "the table" before any table has appeared', () => {
    expect(all).toMatch(/short table of nudges coming two sections below/);
  });

  it('gives the days-to-degrees conversion the bounds depend on', () => {
    // "Two and a half days" became "thirty-one degrees" with no bridge.
    // The bridge is the separation rate, and it checks out: moon 13.18
    // minus sun 0.99 is 12.19 a day, so 2.5 days is 30.5 degrees and a
    // few hours is a couple of degrees.
    expect(all).toMatch(/twelve degrees a day\*\* — its thirteen, less the sun/);
    const sun = dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY);
    const moon = dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY);
    expect(moon - sun).toBeGreaterThan(12);
    expect(moon - sun).toBeLessThan(12.5);
    expect(2.5 * (moon - sun)).toBeGreaterThan(30);
    expect(2.5 * (moon - sun)).toBeLessThan(31.5);
  });

  it("no longer says chapter 14's sun told you the time of sunset", () => {
    // Chapter 14's own section is at pains to say no clock is ever used;
    // this opener contradicted it.
    expect(all).not.toMatch(/told you what time sunset was/);
    expect(all).toMatch(/stood in for the time of year/);
  });
});
