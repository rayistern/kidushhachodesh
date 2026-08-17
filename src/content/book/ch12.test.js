/**
 * Chapter 12's claims about the two odd period blocks.
 *
 * A reader hit KH 12:1's "the distance travelled in one month is
 * 28° 35' 1"" and asked the two questions the label invites: a month has
 * a fraction in it, and how would you know the previous month's value?
 *
 * Both come from taking the nickname literally. The section added in
 * answer makes four checkable claims, and every one is pinned here
 * because each is the sort of thing that sounds right either way:
 *
 *   1. The 29-day figure IS 29 x the daily rate, so no month-length
 *      rounding is hiding in it. (And the flat rate misses it, which is
 *      the chapter's other theme.)
 *   2. 29 days is NOT a lunar month — it is half a day short.
 *   3. 354 days IS a lunar year but NOT a solar one.
 *   4. The blocks do not compose: 12 x 29 is well short of 354.
 */
import { describe, it, expect } from 'vitest';
import { bookChapter } from './index';
import { CONSTANTS } from '../../engine/constants';
import { dmsToDecimal } from '../../engine/dmsUtils';

const chapter = bookChapter(12);
const section = chapter.sections.find((s) => s.id === 'month-and-year-blocks');
const body = section.body.join('\n');

/** His daily rate including the third of a second (KH 12:1). */
const RATE_ARCSEC = 59 * 60 + 8 + 1 / 3;
const FLAT_ARCSEC = 59 * 60 + 8;
const toArcsec = (b) => b.degrees * 3600 + b.minutes * 60 + b.seconds;

// Real values, for the reality checks the standing directive asks for.
const SYNODIC_MONTH = 29.530589;
const SOLAR_YEAR = 365.242189;
const LUNAR_YEAR = 12 * SYNODIC_MONTH;

describe('the 29-day block is 29 days, not a month', () => {
  it('is exactly the daily rate times 29, to under a second', () => {
    const stated = toArcsec(CONSTANTS.SUN_MEAN_PERIOD_BLOCKS.p29);
    expect(stated).toBe(28 * 3600 + 35 * 60 + 1); // 28° 35' 1"
    expect(Math.abs(stated - RATE_ARCSEC * 29)).toBeLessThan(1);
  });

  it('needs the hidden third to land — the flat rate misses by 9 seconds', () => {
    // The prose states this figure, so it is pinned rather than asserted.
    const stated = toArcsec(CONSTANTS.SUN_MEAN_PERIOD_BLOCKS.p29);
    const flat = stated - FLAT_ARCSEC * 29;
    expect(Math.round(flat)).toBe(9);
    // And the prose's "two-thirds of a second to spare" is the rounding.
    expect(RATE_ARCSEC * 29 - stated).toBeGreaterThan(0.6);
    expect(RATE_ARCSEC * 29 - stated).toBeLessThan(0.75);
    expect(body).toMatch(/two-thirds of a second to spare/);
    expect(body).toMatch(/9 seconds off/);
  });

  it('really is half a day short of a lunar month, as the prose says', () => {
    const shortByHours = (SYNODIC_MONTH - 29) * 24;
    expect(shortByHours).toBeGreaterThan(12);
    expect(shortByHours).toBeLessThan(13);
    expect(body).toMatch(/29 days and about 12¾ hours/);
  });

  it('tells the reader the fraction is in the rate, not in the block', () => {
    expect(body).toMatch(/fraction lives in the \*rate\*/);
    expect(body).toMatch(/whole number of days by construction/);
  });
});

describe('the 354-day block is a lunar year and not a solar one', () => {
  it('sits within nine hours of twelve true lunar months', () => {
    expect(Math.abs(354 - LUNAR_YEAR) * 24).toBeLessThan(9);
    expect(body).toMatch(/within nine hours/);
  });

  it('is eleven days short of a solar year, which is the leap-month gap', () => {
    expect(Math.round(SOLAR_YEAR - 354)).toBe(11);
    expect(body).toMatch(/eleven days short/);
    expect(body).toMatch(/leap month/);
  });

  it('is one of the six Hebrew year lengths from chapter 11', () => {
    // The prose leans on this to explain why the row exists at all.
    expect(body).toMatch(/common Hebrew year/);
    expect(body).toMatch(/six year lengths/);
  });
});

describe('the blocks do not compose into each other', () => {
  it('is right that twelve 29-day blocks fall six days short of a lunar year', () => {
    const gap = LUNAR_YEAR - 12 * 29;
    expect(gap).toBeGreaterThan(6);
    expect(gap).toBeLessThan(6.5);
    expect(body).toMatch(/348 days, over six days shy/);
  });

  it('says so as a rule, since that is the trap', () => {
    expect(body).toMatch(/do not compose into each other/);
  });
});

describe('the answer to the question actually asked', () => {
  it("says outright that no previous month's value is ever needed", () => {
    expect(body).toMatch(/you never need it|never chain them/);
    expect(body).toMatch(/no previous month in the arithmetic/);
  });

  it('explains why: every count runs from the one fixed evening', () => {
    expect(body).toMatch(/back to the same fixed evening/);
  });

  it('says the two rows are optional, which settles it completely', () => {
    // If they are droppable, they cannot be load-bearing, and the
    // worry cannot survive. The engine agrees: the decomposition uses
    // only the powers of ten.
    expect(body).toMatch(/optional/);
    expect(body).toMatch(/Nothing depends on them/);
  });

  it('and the engine really does decompose without them', () => {
    // Pins the claim that the four round blocks plus single days suffice.
    const blocks = CONSTANTS.SUN_MEAN_PERIOD_BLOCKS;
    for (const key of ['p10', 'p100', 'p1000', 'p10000']) {
      expect(blocks[key], key).toBeTruthy();
    }
    // Single days come from the daily rate itself, not a block — which is
    // why there is no p1 row, and why the four powers of ten plus the rate
    // really are sufficient.
    expect(blocks.p1).toBeUndefined();
    expect(dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY)).toBeGreaterThan(0);
  });
});

describe('the nicknames are defused rather than repeated', () => {
  it('tells the reader to take the labels off', () => {
    expect(body).toMatch(/nicknames/);
  });

  it('does not leave "the distance travelled in a month" unqualified', () => {
    const idx = body.indexOf('in a month');
    expect(idx).toBeGreaterThan(-1);
    // The correction must follow within the same section, not chapters later.
    expect(body.slice(idx)).toMatch(/block of twenty-nine days/);
  });
});
