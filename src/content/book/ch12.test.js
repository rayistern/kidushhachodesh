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
import { dmsToDecimal, formatDms, normalizeDegrees } from '../../engine/dmsUtils';
import { calculateSunMeanLongitude, calculateSunApogee } from '../../engine/sunCalculations';
import { roundCourse, trueFromMean } from '../../lib/maslulTable';

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
    expect(body).toMatch(/six lengths from chapter 11/);
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
    expect(body).toMatch(/never needed|never chained/);
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
    expect(body).toMatch(/Drop them and you can still reach every answer/);
    // And says what they ARE for, since "optional" alone invites the
    // reader to think a row got deleted.
    expect(body).toMatch(/a \*\*check\*\*/);
    expect(body).toMatch(/two routes to the same number/);
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

describe('whether the apogee is tracked forward (KH 12:2 / 13:9)', () => {
  const apo = chapter.sections.find((s) => s.id === 'apogee').body.join('\n');

  it('answers the question, and answers it yes', () => {
    expect(apo).toMatch(/\*\*He tracks it\.\*\*/);
    expect(apo).toMatch(/at this time/);
  });

  it("quotes his figure, which is the epoch value plus a hundred days' drift", () => {
    expect(apo).toMatch(/86° 45' 23"/);
    const start = dmsToDecimal(CONSTANTS.SUN.APOGEE_START) +
      CONSTANTS.SUN.APOGEE_CONSTELLATION * 30;
    const moved = dmsToDecimal(CONSTANTS.SUN_APOGEE_PERIOD_BLOCKS.p100);
    expect(formatDms(start + moved)).toBe(formatDms(dmsToDecimal({ degrees: 86, minutes: 45, seconds: 23 })));
  });

  it('gives both forms of the epoch position, since mixing them costs a sign', () => {
    // The 26 vs 86 confusion is what prompted this section.
    expect(apo).toMatch(/26° 45' 8"/);
    expect(apo).toMatch(/86° 45' 8"/);
    expect(apo).toMatch(/costs you a whole sign/);
  });

  it('is right that his own example comes out the same either way', () => {
    const mean = calculateSunMeanLongitude(100).result;
    const moved = calculateSunApogee(100).result;
    const frozen = dmsToDecimal(CONSTANTS.SUN.APOGEE_START) +
      CONSTANTS.SUN.APOGEE_CONSTELLATION * 30;

    const courseMoved = normalizeDegrees(mean - moved);
    const courseFrozen = normalizeDegrees(mean - frozen);
    expect(formatDms(courseMoved)).toMatch(/^18° 52′ 2/);
    expect(formatDms(courseFrozen)).toMatch(/^18° 52′ 17/);
    expect(apo).toMatch(/18° 52' 2"/);
    expect(apo).toMatch(/18° 52' 17"/);

    // Both round to 19, so the true position is identical — which is the
    // claim, and the only reason it is safe to call the term pointless
    // over short spans.
    expect(roundCourse(courseMoved)).toBe(19);
    expect(roundCourse(courseFrozen)).toBe(19);
    expect(formatDms(trueFromMean(mean, moved).trueLongitude))
      .toBe(formatDms(trueFromMean(mean, frozen).trueLongitude));
  });

  it('is right that over centuries it stops being pointless', () => {
    const days = 848 * 365.25;
    const drift = CONSTANTS.SUN.APOGEE_MOTION_PER_DAY * days;
    expect(drift).toBeGreaterThan(12);
    expect(drift).toBeLessThan(13.5);
    expect(apo).toMatch(/thirteen degrees/);
    expect(apo).toMatch(/3rd sign and into the 4th/);

    // "roughly a sixth of a degree" on the true position.
    const mean = calculateSunMeanLongitude(309866).result;
    const moved = calculateSunApogee(309866).result;
    const frozen = dmsToDecimal(CONSTANTS.SUN.APOGEE_START) +
      CONSTANTS.SUN.APOGEE_CONSTELLATION * 30;
    const gap = Math.abs(
      trueFromMean(mean, moved).trueLongitude - trueFromMean(mean, frozen).trueLongitude,
    );
    expect(gap).toBeGreaterThan(0.1);
    expect(gap).toBeLessThan(0.3);
    expect(apo).toMatch(/a sixth of a degree/);
  });

  it("credits the twelve-degree remark to the translator, not the Rambam", () => {
    // The card and this section both used to attribute it to him. It is
    // Touger's footnote 10, and its own wording rules him out: nobody
    // writes "since the Mishneh Torah was written" about their own book.
    expect(apo).toMatch(/the translator's note, not the Rambam's/);
    expect(apo).not.toMatch(/he himself anticipated|a drift he anticipated/);
  });
});
