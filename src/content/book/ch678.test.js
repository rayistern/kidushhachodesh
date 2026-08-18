/**
 * Chapters 6-8's numbers, pinned to the engine's fixed-calendar
 * constants and to the calendar in use. The rule-level verification
 * (400 years of Rosh HaShanahs, every dechiyah firing, the year-shape
 * table) lives in lib/fixedYear.test.js; this file pins what the PROSE
 * and the three cards state.
 */
import { describe, it, expect } from 'vitest';
import { bookChapter } from './index';
import {
  BAHARAD,
  SYNODIC_MONTH,
  SYNODIC_MONTH_PARTS,
  PARTS_PER_HOUR,
  PARTS_PER_DAY,
} from '../../engine/fixedCalendar/constants';
import { isHebrewLeapYear } from '../../engine/fixedCalendar/months';
import { moladTishrei, roshHashanah, actualRoshHashanahDay, yearShape } from '../../lib/fixedYear';
import { monthGrid } from '../../components/book/interactives/YearShapeCard';
import { daysBetween, shapeForGap } from '../../components/book/interactives/BetweenDays';

const prose = (n) =>
  bookChapter(n)
    .sections.flatMap((s) => s.body)
    .join('\n');

describe('chapter 6 — the molad arithmetic', () => {
  const body = prose(6);

  it('states his units and interval, which are the engine constants', () => {
    expect(PARTS_PER_HOUR).toBe(1080);
    expect(SYNODIC_MONTH).toEqual({ days: 29, hours: 12, parts: 793 });
    expect(body).toMatch(/1080 parts/);
    expect(body).toMatch(/29 days, 12 hours, and 793 parts/);
  });

  it("1080's divisibility list is exactly as stated — everything but sevenths", () => {
    for (const d of [2, 3, 4, 5, 6, 8, 9, 10]) expect(1080 % d, `by ${d}`).toBe(0);
    expect(1080 % 7).not.toBe(0);
    expect(body).toMatch(/except sevenths/);
  });

  it('the year totals follow from stacking the month', () => {
    // 12 × (29-12-793) = 354d 8h 876p; 13 × = 383d 21h 589p (KH 6:4).
    const stack = (k) => {
      let parts = k * SYNODIC_MONTH_PARTS;
      const days = Math.floor(parts / PARTS_PER_DAY);
      parts -= days * PARTS_PER_DAY;
      const hours = Math.floor(parts / PARTS_PER_HOUR);
      return { days, hours, parts: parts - hours * PARTS_PER_HOUR };
    };
    expect(stack(12)).toEqual({ days: 354, hours: 8, parts: 876 });
    expect(stack(13)).toEqual({ days: 383, hours: 21, parts: 589 });
    expect(body).toMatch(/354 days, 8 hours, 876 parts/);
    expect(body).toMatch(/383 days, 21 hours, 589 parts/);
  });

  it('the weekly leftovers are the stated triples', () => {
    const mod = (k) => {
      let parts = (k * SYNODIC_MONTH_PARTS) % (7 * PARTS_PER_DAY);
      const days = Math.floor(parts / PARTS_PER_DAY);
      parts -= days * PARTS_PER_DAY;
      const hours = Math.floor(parts / PARTS_PER_HOUR);
      return `${days}–${hours}–${parts - hours * PARTS_PER_HOUR}`;
    };
    expect(mod(1)).toBe('1–12–793');
    expect(mod(12)).toBe('4–8–876');
    expect(mod(13)).toBe('5–21–589');
    expect(mod(235)).toBe('2–16–595'); // the 19-year cycle, KH 6:12
    expect(body).toMatch(/4–8–876/);
    expect(body).toMatch(/5–21–589/);
    expect(body).toMatch(/2–16–595/);
  });

  it('his 19-year overshoot: one hour and 485 parts (KH 6:10)', () => {
    // 19 solar years of 365d 6h, minus 235 of his months.
    const solar = 19 * (365 * PARTS_PER_DAY + 6 * PARTS_PER_HOUR);
    const lunar = 235 * SYNODIC_MONTH_PARTS;
    expect(solar - lunar).toBe(PARTS_PER_HOUR + 485);
    expect(body).toMatch(/one hour and 485 parts/);
  });

  it('his worked addition (KH 6:7): 1–17–107 + 1–12–793 = 3–5–900', () => {
    const parts = (17 * 1080 + 107) + (12 * 1080 + 793);
    const carryDays = Math.floor(parts / PARTS_PER_DAY);
    const rest = parts - carryDays * PARTS_PER_DAY;
    expect(1 + 1 + carryDays).toBe(3);
    expect(Math.floor(rest / 1080)).toBe(5);
    expect(rest % 1080).toBe(900);
  });

  it('states BaHaRaD as the engine holds it', () => {
    expect(BAHARAD).toEqual({ dayOfWeek: 2, hours: 5, parts: 204 });
    expect(prose(6)).toMatch(/Monday, 5 hours, 204 parts/);
  });

  it('the leap-year positions are the stated seven', () => {
    const positions = [];
    for (let y = 1; y <= 19; y++) if (isHebrewLeapYear(y)) positions.push(y);
    expect(positions).toEqual([3, 6, 8, 11, 14, 17, 19]);
    expect(prose(6)).toMatch(/3, 6, 8, 11, 14, 17 and 19/);
  });
});

describe('chapter 7 — the postponements', () => {
  const body = prose(7);

  it('quotes the thresholds the rules use, to the part', () => {
    expect(body).toMatch(/9 hours 204 parts/);
    expect(body).toMatch(/15 hours 589 parts/);
    expect(body).toMatch(/9–203 or 15–588/);
  });

  it('"about six years in every ten" meet a postponement — measured', () => {
    let moved = 0;
    const span = 400;
    for (let y = 5600; y < 5600 + span; y++) if (roshHashanah(y).applied.length > 0) moved++;
    expect(moved / span).toBeGreaterThan(0.5);
    expect(moved / span).toBeLessThan(0.7);
  });

  it('"roughly four years out of ten" untouched — the complement', () => {
    let clean = 0;
    for (let y = 5600; y < 6000; y++) if (roshHashanah(y).applied.length === 0) clean++;
    expect(clean / 400).toBeGreaterThan(0.3);
    expect(clean / 400).toBeLessThan(0.5);
  });

  it('the stacked case of 7:3 lands two days past the molad', () => {
    for (let y = 5600; y < 6000; y++) {
      const m = moladTishrei(y);
      if (m.day === 7 && m.hours >= 18) {
        expect(roshHashanah(y).day).toBe(2);
        return;
      }
    }
    throw new Error('no such year found in span');
  });
});

describe('chapter 8 — the shape of the year', () => {
  const body = prose(8);

  it('states the between-days table and it holds (via fixedYear.test)', () => {
    expect(body).toMatch(/two days between means a lacking year/);
    expect(body).toMatch(/four, five, six/);
  });

  it("his 8:9 example: Thursday to Monday is three between — in order", () => {
    // Not tied to a specific year; the counting itself.
    const between = ((2 - 5 - 1) % 7 + 7) % 7; // Thu(5) → Mon(2)
    expect(between).toBe(3);
    expect(body).toMatch(/Friday, Shabbat, Sunday between/);
  });

  it("the card's month grid always sums to the year's true length", () => {
    for (let y = 5780; y < 5820; y++) {
      const shape = yearShape(y);
      const total = monthGrid(shape).reduce((a, [, n]) => a + n, 0);
      expect(total, `year ${y}`).toBe(shape.length);
    }
  });

  it('the fixed months of the pattern never vary across 100 years', () => {
    for (let y = 5750; y < 5850; y++) {
      const grid = Object.fromEntries(monthGrid(yearShape(y)));
      expect(grid.Tishrei).toBe(30);
      expect(grid.Tevet).toBe(29);
      expect(grid.Nisan).toBe(30);
      expect(grid.Elul).toBe(29);
    }
  });

  it('closes the ch11 loop: three shapes × leap-or-not = the six lengths', () => {
    const seen = new Set();
    for (let y = 5600; y < 6000; y++) seen.add(yearShape(y).length);
    expect([...seen].sort((a, b) => a - b)).toEqual([353, 354, 355, 383, 384, 385]);
    expect(body).toMatch(/353, 354, 355, 383, 384, 385/);
  });
});

describe('the calendar chapters own their chain nodes', () => {
  it('nodes molad / rosh-hashanah / year-shape exist for 6 / 7 / 8', async () => {
    const { nodeById } = await import('./chain');
    expect(nodeById('molad').chapter).toBe(6);
    expect(nodeById('rosh-hashanah').chapter).toBe(7);
    expect(nodeById('year-shape').chapter).toBe(8);
  });
});

describe('the reality checks chapter 6 states', () => {
  it('his month differs from the modern mean synodic month by under a second', () => {
    const his = 29 + 12 / 24 + 793 / PARTS_PER_DAY;
    const modern = 29.530589;
    expect(Math.abs(his - modern) * 86400).toBeLessThan(1);
    expect(prose(6)).toMatch(/well under a second/);
  });

  it('a part is 3⅓ seconds and the cycle overshoot is about 87 minutes', () => {
    expect(3600 / PARTS_PER_HOUR).toBeCloseTo(3.333, 3);
    expect(60 + 485 / 18).toBeCloseTo(86.9, 1); // 1h 485p in minutes
    expect(prose(6)).toMatch(/about 87 minutes/);
  });
});

describe('the leap-year derivation the cards show (KH 6:11)', () => {
  it('position-in-cycle by division matches the engine for 400 years', () => {
    // The cards derive leapness as ((year−1) mod 19)+1 ∈ the seven
    // positions; the engine has its own isHebrewLeapYear. They must be
    // the same fact.
    const LEAP_POSITIONS = new Set([3, 6, 8, 11, 14, 17, 19]);
    for (let y = 5600; y < 6000; y++) {
      const pos = ((y - 1) % 19) + 1;
      expect(LEAP_POSITIONS.has(pos), `year ${y}, position ${pos}`).toBe(isHebrewLeapYear(y));
    }
  });

  it('the prose teaches the division', () => {
    expect(prose(6)).toMatch(/divide the year number by nineteen and keep what is left over/);
    expect(prose(6)).toMatch(/nothing left over counts as position 19/);
  });
});

describe('the between-days card (KH 8:7-9)', () => {
  it("counts exclusively: his Thursday-to-Monday is three", () => {
    expect(daysBetween(5, 2)).toBe(3);
    expect(daysBetween(5, 5)).toBe(6); // same weekday a year on: six between
    expect(daysBetween(2, 3)).toBe(0); // adjacent days: none between
  });

  it('its shape table matches KH 8:7-8', () => {
    expect(shapeForGap(2, false)).toBe('lacking');
    expect(shapeForGap(3, false)).toBe('in order');
    expect(shapeForGap(4, false)).toBe('complete');
    expect(shapeForGap(4, true)).toBe('lacking');
    expect(shapeForGap(5, true)).toBe('in order');
    expect(shapeForGap(6, true)).toBe('complete');
  });

  it('"cannot occur" is honest: 400 real years use only the tabled gaps', () => {
    // Every consecutive pair of actual Rosh HaShanahs must land on a gap
    // the card labels with a shape; and every gap the card calls
    // impossible must never appear.
    for (let y = 5600; y < 6000; y++) {
      const gap = daysBetween(actualRoshHashanahDay(y), actualRoshHashanahDay(y + 1));
      const leap = yearShape(y).leap;
      expect(shapeForGap(gap, leap), `year ${y}: gap ${gap}, leap ${leap}`).not.toBeNull();
      expect(shapeForGap(gap, leap)).toBe(
        { lacking: 'lacking', 'in-order': 'in order', complete: 'complete' }[yearShape(y).kind],
      );
    }
  });
});
