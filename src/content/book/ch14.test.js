/**
 * Chapter 14's answers to two questions a reader put to it.
 *
 *   1. How can he predict visibility without ever knowing what time
 *      sunset is? Because sunset is a POSITION, not a time, and every
 *      KH 17 quantity is measured from the sun rather than the horizon.
 *   2. How does he know the time of year from the sun's position? Because
 *      the twelve signs are anchored to the equinoxes, so the two are one
 *      fact written twice.
 *
 * The second makes a checkable claim — that his true sun reaches each
 * quarter-point of the circle within a day of the real season, eight and
 * a half centuries on. That is exactly the kind of statement that is easy
 * to assert and would be quietly wrong if his frame were sidereal, so it
 * is computed here rather than trusted.
 */
import { describe, it, expect } from 'vitest';
import { bookChapter } from './index';
import { getFullCalculation } from '../../engine/pipeline';
import { CONSTANTS } from '../../engine/constants';
import { dmsToDecimal } from '../../engine/dmsUtils';

const chapter = bookChapter(14);
const section = (id) => chapter.sections.find((s) => s.id === id);

describe('the season comes from the sun because the zodiac is tropical', () => {
  const body = section('why-sun').body.join('\n');

  it('says the signs are anchored to the seasons, not the stars', () => {
    expect(body).toMatch(/anchored to the seasons, not to the stars/);
    expect(body).toMatch(/one fact written two ways/);
    expect(body).toMatch(/13:11/);
  });

  it('reaches each quarter-point within a day of the real season', () => {
    // The claim, computed. If his circle were sidereal this would be
    // about twelve degrees adrift by now and the test would fail.
    const firstCrossing = (target) => {
      let prev = null;
      for (let m = 0; m < 12; m++) {
        for (let d = 1; d <= 31; d++) {
          const dt = new Date(2026, m, d, 12);
          if (dt.getMonth() !== m) continue;
          const lon = getFullCalculation(dt).sun.trueLongitude;
          if (prev !== null) {
            const crossed = target === 0 ? prev > 300 && lon < 60 : prev < target && lon >= target;
            if (crossed) return dt;
          }
          prev = lon;
        }
      }
      return null;
    };

    // [month, day] of the real 2026 seasons.
    const real = { 0: [2, 20], 90: [5, 21], 180: [8, 22], 270: [11, 21] };
    for (const target of [0, 90, 180, 270]) {
      const got = firstCrossing(target);
      expect(got, `${target}°`).toBeTruthy();
      const [rm, rd] = real[target];
      const diffDays = Math.abs(
        (got - new Date(2026, rm, rd, 12)) / 86400000,
      );
      expect(diffDays, `${target}° landed ${got?.toDateString()}`).toBeLessThanOrEqual(1.5);
    }
  });

  it('explains what the star-anchored alternative is, and why it matters', () => {
    // The phrase appeared unexplained in a first draft. It carries the
    // whole weight of the check: without an alternative that would fail,
    // "his sun reaches 0° at the equinox" reads as a tautology.
    expect(body).toMatch(/a fixed \*\*star\*\* instead of to the equinox/);
    expect(body).toMatch(/real test rather than a tautology/);
    // The drift rate quoted is precession, ~50.3 arcsec a year.
    const degreesPerYear = 50.29 / 3600;
    expect(1 / degreesPerYear).toBeGreaterThan(65);
    expect(1 / degreesPerYear).toBeLessThan(75);
    expect(degreesPerYear * 848).toBeGreaterThan(11);
    expect(degreesPerYear * 848).toBeLessThan(13);
    expect(body).toMatch(/a degree every seventy years/);
    expect(body).toMatch(/some twelve degrees/);
  });

  it('quotes the dates the prose states', () => {
    for (const d of ['21 March 2026', '22 June', '23 September', '22 December']) {
      expect(body).toContain(d);
    }
  });

  it('credits 13:11 for his own use of the identity', () => {
    expect(body).toMatch(/13:11/);
  });
});

describe('why no clock is needed', () => {
  const body = section('no-clock').body.join('\n');

  it('makes the central point: sunset is a position, not a time', () => {
    expect(body).toMatch(/Sunset is not really a time\. It is a position/);
    expect(body).toMatch(/stands on the horizon/);
  });

  it('explains that KH 17 measures everything from the sun', () => {
    expect(body).toMatch(/measured \*\*from the sun\*\*/);
    expect(body).toMatch(/hour drops out/);
  });

  it('states the residual problem the chapter actually solves', () => {
    expect(body).toMatch(/The moon \*\*moves\*\*/);
    expect(body).toMatch(/half a degree an hour/);
  });

  it('keeps the sunset reading labelled as the book\'s, not his', () => {
    // The same caveat the card carries. He states the table and gives no
    // reason for it; this book supplies the reason.
    expect(body).toMatch(/this book's reading|gives no reason/);
  });
});

describe('the prose renders with the markup the book actually has', () => {
  it('contains no markdown table, which would print as literal pipes', () => {
    // markup.js handles bold and italic only. A pipe table was written
    // here first and would have rendered as a run of pipes and \n.
    for (const s of chapter.sections) {
      for (const para of s.body) {
        expect(para, `${s.id}`).not.toMatch(/\|\s*---/);
        expect(para, `${s.id} has a newline the renderer will not break`).not.toContain('\n');
      }
    }
  });
});

describe('the two month-lengths, and what may be claimed about them', () => {
  const body = section('two-speeds').body.join('\n');
  const TROPICAL = 27.321582;
  const SIDEREAL = 27.321662;
  const ANOMALISTIC = 27.554550;
  const period = (dms) => 360 / dmsToDecimal(dms);

  it('reproduces both periods from his stated rates', () => {
    expect(period(CONSTANTS.MOON.MEAN_MOTION_PER_DAY)).toBeCloseTo(27.3216, 4);
    expect(period(CONSTANTS.MOON.MASLUL_MEAN_MOTION)).toBeCloseTo(27.5545, 4);
    expect(body).toMatch(/27 days and 8 hours/);
    expect(body).toMatch(/27 days and 13 hours/);
  });

  it('leads with his own framing — laps of the two circles', () => {
    expect(body).toMatch(/One full lap of the big circle|one full lap of the big circle/i);
    expect(body).toMatch(/lap of the small circle/);
  });

  it('marks the near-and-far reading as following from his model, not from him', () => {
    // A reader asked whether "closest approach to closest approach" was
    // his or modern. He never mentions the moon's distance in this
    // chapter; the reading follows from the geometry of a small circle
    // that does not enclose the earth. One sentence, not an essay — an
    // earlier draft answered the question with three paragraphs of
    // argument, which is a reply and not book prose.
    expect(body).toMatch(/follows from his model rather than from anything he says/);
    expect(body).toMatch(/never mentions the moon's distance/);
    expect(body).not.toMatch(/modern gloss|not a quotation/);
  });

  it('does not claim the first lap returns to the same star', () => {
    // His frame is tropical, so a sidereal gloss would contradict the
    // rest of the book. The prose simply says "the same point of it" and
    // makes no claim either way, which is the honest position: see below
    // for why his numbers cannot settle it.
    expect(body).not.toMatch(/same star/);
    expect(body).toMatch(/back to the same point of it/);
  });

  it("could not have settled sidereal versus tropical anyway", () => {
    // Kept as a numeric fact even though the prose no longer discusses
    // it, because it is the reason the prose stays silent: the two
    // months are ~7s apart and his figure sits between them.
    expect((SIDEREAL - TROPICAL) * 86400).toBeGreaterThan(6);
    expect((SIDEREAL - TROPICAL) * 86400).toBeLessThan(8);
    const his = period(CONSTANTS.MOON.MEAN_MOTION_PER_DAY);
    expect(his).toBeGreaterThan(TROPICAL);
    expect(his).toBeLessThan(SIDEREAL);
  });

  it('is right that the second rate matches the anomalistic month closely', () => {
    const his = period(CONSTANTS.MOON.MASLUL_MEAN_MOTION);
    expect(Math.abs(his - ANOMALISTIC) * 86400).toBeLessThan(2);
  });
});
