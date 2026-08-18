/**
 * Chapters 9-10's numbers. Everything is integer arithmetic in parts
 * and moments, so the pins are exact equalities, not tolerances — and
 * the headline claim, that Rav Adda's year makes the 19-year cycle
 * close to the moment, is computed rather than quoted.
 */
import { describe, it, expect } from 'vitest';
import { bookChapter } from './index';
import {
  SYNODIC_MONTH_PARTS,
  PARTS_PER_HOUR,
  PARTS_PER_DAY,
} from '../../engine/fixedCalendar/constants';
import { shmuelTekufatNisan } from '../../components/book/interactives/SeasonLadder';

const MOMENTS_PER_PART = 76;
const prose = (n) => bookChapter(n).sections.flatMap((s) => s.body).join('\n');

describe("chapter 9 — Shmuel's seasons", () => {
  const body = prose(9);

  it('a season is exactly a quarter of the round year', () => {
    // 365d 6h ÷ 4 = 91d 7½h (KH 9:2).
    const yearParts = 365 * PARTS_PER_DAY + 6 * PARTS_PER_HOUR;
    expect(yearParts / 4).toBe(91 * PARTS_PER_DAY + 7.5 * PARTS_PER_HOUR);
    expect(body).toMatch(/91 days, 7½ hours/);
  });

  it('the weekday pattern repeats every 28 years exactly', () => {
    // 28 × 365.25 = 10227 days = 1461 whole weeks.
    expect((28 * 365.25) % 7).toBe(0);
    expect(body).toMatch(/28 years/);
    const a = shmuelTekufatNisan(4930);
    const b = shmuelTekufatNisan(4930 + 28);
    expect(b).toEqual(a);
  });

  it('a year walks the week by 1 day 6 hours', () => {
    expect(body).toMatch(/1 day 6 hours/);
    expect((365.25 % 7).toFixed(2)).toBe('1.25');
  });

  it('states the anchor: 7-9-642 before the first molad of Nisan', () => {
    expect(body).toMatch(/7 days, 9 hours, 642 parts before the first molad of Nisan/);
  });

  it("the drift claim: his year is ~11 minutes longer than the real one", () => {
    const real = 365.2422 * 24 * 60;
    const shmuel = 365.25 * 24 * 60;
    expect(shmuel - real).toBeGreaterThan(10.5);
    expect(shmuel - real).toBeLessThan(11.5);
    // ~ a day per 128 years.
    expect(24 * 60 / (shmuel - real)).toBeGreaterThan(120);
    expect(24 * 60 / (shmuel - real)).toBeLessThan(135);
    expect(body).toMatch(/day every 128 years/);
  });
});

describe("chapter 10 — Rav Adda's exact fit", () => {
  const body = prose(10);

  // Rav Adda's year, in integer moments (KH 10:1).
  const YEAR_MOMENTS =
    (365 * PARTS_PER_DAY + 5 * PARTS_PER_HOUR + 997) * MOMENTS_PER_PART + 48;

  it('THE claim: nineteen of his years equal 235 months to the moment', () => {
    const nineteenYears = 19 * YEAR_MOMENTS;
    const cycle = 235 * SYNODIC_MONTH_PARTS * MOMENTS_PER_PART;
    expect(nineteenYears).toBe(cycle);
    expect(body).toMatch(/exactly equal, to the moment/);
  });

  it('a season is exactly a quarter: 91d 7h 519p 31m (KH 10:2)', () => {
    const quarter = YEAR_MOMENTS / 4;
    const stated =
      (91 * PARTS_PER_DAY + 7 * PARTS_PER_HOUR + 519) * MOMENTS_PER_PART + 31;
    expect(quarter).toBe(stated);
    expect(body).toMatch(/91 days, 7 hours, 519 parts, 31 moments/);
  });

  it('a year outruns twelve months by 10-21-121-48 (KH 10:1)', () => {
    const lunarYear = 12 * SYNODIC_MONTH_PARTS * MOMENTS_PER_PART;
    const excess = YEAR_MOMENTS - lunarYear;
    const stated =
      (10 * PARTS_PER_DAY + 21 * PARTS_PER_HOUR + 121) * MOMENTS_PER_PART + 48;
    expect(excess).toBe(stated);
    expect(body).toMatch(/10 days, 21 hours, 121 parts, 48 moments/);
  });

  it('a moment is 1/76 of a part — about 1/23 of a second', () => {
    const seconds = 3600 / PARTS_PER_HOUR / MOMENTS_PER_PART;
    expect(1 / seconds).toBeGreaterThan(22);
    expect(1 / seconds).toBeLessThan(23.5);
    expect(prose(10) + bookChapter(10).terms.map((t) => t.gloss).join(' ')).toMatch(/seventy-sixth/);
  });

  it("Rav Adda's drift: ~6½ minutes a year, a day per ~232 years", () => {
    const real = 365.2422;
    const adda = YEAR_MOMENTS / MOMENTS_PER_PART / PARTS_PER_DAY;
    const minutes = (adda - real) * 24 * 60;
    expect(minutes).toBeGreaterThan(6);
    expect(minutes).toBeLessThan(7);
    expect(24 * 60 / minutes).toBeGreaterThan(210);
    expect(24 * 60 / minutes).toBeLessThan(240);
  });

  it('quotes 10:7: both are means, and the true equinox runs about two days ahead', () => {
    expect(body).toMatch(/two days earlier/);
    expect(body).toMatch(/mean\*\* motion .its pretend, perfectly-steady average pace., not its true position/i);
  });
});

describe('the shared card', () => {
  it("Shmuel's tekufah steps 1d6h per year on the weekday clock", () => {
    const a = shmuelTekufatNisan(5000);
    const b = shmuelTekufatNisan(5001);
    const toParts = (t) => t.dayIndex * PARTS_PER_DAY + t.hours * PARTS_PER_HOUR + t.parts;
    const step =
      ((toParts(b) - toParts(a)) % (7 * PARTS_PER_DAY) + 7 * PARTS_PER_DAY) % (7 * PARTS_PER_DAY);
    expect(step).toBe(1 * PARTS_PER_DAY + 6 * PARTS_PER_HOUR);
  });
});

describe("KH 10:7's two days IS chapter 13's correction at its peak", () => {
  it('his mean sun crosses the spring point two days after his true sun', async () => {
    const { getFullCalculation } = await import('../../engine/pipeline');
    const { dateFromEpochDays } = await import('../../engine/epochDays');
    let meanDay = null;
    let trueDay = null;
    let prevM = null;
    let prevT = null;
    for (let n = 300; n < 460; n++) {
      const c = getFullCalculation(dateFromEpochDays(n));
      if (prevM !== null && prevM > 300 && c.sun.meanLongitude < 60 && meanDay === null) meanDay = n;
      if (prevT !== null && prevT > 300 && c.sun.trueLongitude < 60 && trueDay === null) trueDay = n;
      prevM = c.sun.meanLongitude;
      prevT = c.sun.trueLongitude;
    }
    expect(meanDay - trueDay).toBe(2);
    // Because the correction is at its maximum there: the spring point
    // stands ~90° from the far point.
    const c = getFullCalculation(dateFromEpochDays(trueDay));
    expect(c.sun.maslulCorrection).toBeGreaterThan(1.9);
    expect(prose(10)).toMatch(/two days of the sun's travel/);
  });
});

describe('chapter 9 answers whether the tekufot are used', () => {
  it('says nothing downstream consumes them, and where each survives', () => {
    const body = prose(9);
    expect(body).toMatch(/nothing consumes them/);
    expect(body).toMatch(/nineteen-year cycle \*is\* his year/);
    expect(body).toMatch(/supersedes both with the true sun \(13:11\)/);
    expect(body).toMatch(/blessing of the sun/);
    expect(body).toMatch(/sixty days after his autumn tekufah/);
  });

  it('is true that nothing in the engine consumes a tekufah', async () => {
    // The verdict pipeline and the fixed calendar know nothing of
    // chapters 9-10; the claim is structural, so it is asserted
    // structurally: no engine module exports anything tekufah-named.
    const mods = await Promise.all([
      import('../../engine/pipeline'),
      import('../../engine/fixedCalendar/index'),
      import('../../engine/sunCalculations'),
      import('../../engine/moonCalculations'),
    ]);
    // /tekuf/ only: the engine legitimately exports
    // calculateSeasonCorrection, which is KH 14:5's sunset nudge — a
    // different "season" from chapters 9-10's tekufot.
    for (const m of mods) {
      for (const key of Object.keys(m)) {
        expect(key.toLowerCase()).not.toMatch(/tekuf/);
      }
    }
  });
});
