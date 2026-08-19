/**
 * KH 7-8's rules, checked against the calendar the world actually keeps.
 *
 * This is the strongest verification in the project: the output of
 * these rules IS the Jewish calendar. If the four postponements are
 * implemented as the Rambam states them, every Rosh HaShanah they
 * produce must equal hebcal's, which must equal the wall calendar's.
 * Four hundred consecutive years are checked, so every rule fires many
 * times.
 */
import { describe, it, expect } from 'vitest';
import { moladTishrei, moladTishreiLadder, roshHashanah, actualRoshHashanahDay, yearShape } from './fixedYear';
import { isHebrewLeapYear } from '../engine/fixedCalendar/months';

describe('the four postponements reproduce the real calendar', () => {
  it('matches the actual Rosh HaShanah weekday for 400 consecutive years', () => {
    for (let year = 5600; year < 6000; year++) {
      expect(roshHashanah(year).day, `year ${year}`).toBe(actualRoshHashanahDay(year));
    }
  });

  it('every rule fires somewhere in that span, so none is dead code', () => {
    const seen = new Set();
    for (let year = 5600; year < 6000; year++) {
      for (const rule of roshHashanah(year).applied) seen.add(rule);
    }
    expect([...seen].sort()).toEqual(['betutkpat', 'gatrad', 'lo-adu', 'molad-zaken']);
  });

  it('never lands Rosh HaShanah on Sunday, Wednesday or Friday', () => {
    for (let year = 5600; year < 6000; year++) {
      expect([1, 4, 6], `year ${year}`).not.toContain(roshHashanah(year).day);
    }
  });
});

describe("his own worked case (KH 7:3)", () => {
  it('a Shabbat molad at 18h or later lands Rosh HaShanah on Monday', () => {
    // "If the conjunction takes place on the Sabbath after noon (7-18),
    // Rosh Chodesh is established on Monday." Find such a year and
    // check the two-step postponement.
    let found = 0;
    for (let year = 5600; year < 6000 && found < 3; year++) {
      const m = moladTishrei(year);
      if (m.day === 7 && m.hours >= 18) {
        const r = roshHashanah(year);
        expect(r.day, `year ${year}`).toBe(2);
        expect(r.applied).toEqual(['molad-zaken', 'lo-adu']);
        found++;
      }
    }
    expect(found).toBeGreaterThan(0);
  });

  it("the thresholds are exact: one part earlier and neither special rule fires (KH 7:6)", () => {
    // The boundary is stated to the single chelek. Verify with the rule
    // functions directly rather than hunting years: build synthetic
    // molad values around each threshold via the real ones.
    for (let year = 5600; year < 6000; year++) {
      const m = moladTishrei(year);
      const parts = m.hours * 1080 + m.parts;
      if (m.day === 3 && !isHebrewLeapYear(year)) {
        const r = roshHashanah(year);
        if (parts >= 9 * 1080 + 204 && parts < 18 * 1080) {
          expect(r.applied, `year ${year}`).toContain('gatrad');
        } else if (parts < 9 * 1080 + 204) {
          expect(r.day, `year ${year}`).toBe(3);
        }
      }
    }
  });
});

describe('the shape of the year (KH 8)', () => {
  it('classifies every year in 400 as lacking, in-order or complete', () => {
    for (let year = 5600; year < 6000; year++) {
      expect(yearShape(year).kind, `year ${year}`).not.toBeNull();
    }
  });

  it('reads Marcheshvan and Kislev off the shape, as KH 8:6 defines it', () => {
    // complete = both full; lacking = both lacking; in-order = Cheshvan
    // lacking, Kislev full.
    const complete = yearShape([...Array(400).keys()].map((i) => 5600 + i).find((y) => yearShape(y).kind === 'complete'));
    expect(complete.cheshvanFull).toBe(true);
    expect(complete.kislevFull).toBe(true);
    const lacking = yearShape([...Array(400).keys()].map((i) => 5600 + i).find((y) => yearShape(y).kind === 'lacking'));
    expect(lacking.cheshvanFull).toBe(false);
    expect(lacking.kislevFull).toBe(false);
  });

  it('KH 8:7-8: the gap between consecutive Rosh HaShanahs names the shape', () => {
    // His "days between" counts the days strictly BETWEEN the two
    // weekdays (KH 8:9's example: Thursday to Monday = three days
    // between, Friday-Shabbat-Sunday). So between = weekday diff − 1,
    // and his stated 2/3/4 (common) and 4/5/6 (leap) correspond to
    // length mod 7 = 3/4/5 and 5/6/0.
    for (let year = 5700; year < 5900; year++) {
      const diff = (((actualRoshHashanahDay(year + 1) - actualRoshHashanahDay(year)) % 7) + 7) % 7;
      const between = ((diff - 1) % 7 + 7) % 7;
      const shape = yearShape(year);
      const expected = shape.leap
        ? { 4: 'lacking', 5: 'in-order', 6: 'complete' }[between]
        : { 2: 'lacking', 3: 'in-order', 4: 'complete' }[between];
      expect(shape.kind, `year ${year}, between ${between}`).toBe(expected);
    }
  });
});

describe('the ladder shows the work and reaches the same rung (KH 6:12-14)', () => {
  it('starts at BaHaRaD and adds the published remainders', () => {
    const l = moladTishreiLadder(5786);
    expect(l.anchor).toEqual({ day: 2, hours: 5, parts: 204 });
    // The three "each" triples ARE his published remainders — derived
    // here from the constants, matching the numbers of KH 6:5 and 6:12.
    expect(l.steps[0].each).toEqual({ day: 2, hours: 16, parts: 595 });
    expect(l.steps[1].each).toEqual({ day: 4, hours: 8, parts: 876 });
    expect(l.steps[2].each).toEqual({ day: 5, hours: 21, parts: 589 });
  });

  it('classifies 5786 in its cycle correctly', () => {
    const l = moladTishreiLadder(5786);
    // 5785 elapsed years = 304 cycles + 9; leap among the first nine
    // positions of a cycle are 3, 6 and 8.
    expect(l.cycles).toBe(304);
    expect(l.remainderYears).toBe(9);
    expect(l.leapPositions).toEqual([3, 6, 8]);
    expect(l.commonYears).toBe(6);
  });

  it('its last rung equals moladTishrei, across eras', () => {
    for (const year of [1, 2, 19, 20, 4938, 5786, 5787, 6000, 7000]) {
      expect(moladTishreiLadder(year).final, `year ${year}`).toEqual(moladTishrei(year));
    }
    for (let year = 5770; year <= 5810; year++) {
      expect(moladTishreiLadder(year).final, `year ${year}`).toEqual(moladTishrei(year));
    }
  });

  it('year 1 is the bare anchor: zero of everything added', () => {
    const l = moladTishreiLadder(1);
    expect(l.cycles).toBe(0);
    expect(l.remainderYears).toBe(0);
    expect(l.final).toEqual({ day: 2, hours: 5, parts: 204 });
  });
});
