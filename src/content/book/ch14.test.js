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

const chapter = bookChapter(14);
const section = (id) => chapter.sections.find((s) => s.id === id);

describe('the season comes from the sun because the zodiac is tropical', () => {
  const body = section('why-sun').body.join('\n');

  it('says the signs are anchored to the seasons, not the stars', () => {
    expect(body).toMatch(/anchored to the seasons themselves, not to the stars/);
    expect(body).toMatch(/one fact written two ways/);
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
