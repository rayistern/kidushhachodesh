/**
 * Chapter 17's claims, checked against the engine and the text.
 *
 * This chapter's figures come straight from the pipeline rather than
 * from a chapter-local re-derivation, so the tests run the pipeline too.
 * That means a regression anywhere in chapters 12-16 surfaces here as
 * well — which is the point: KH 17 is where the whole book either
 * agrees with the Rambam or does not.
 */
import { describe, it, expect } from 'vitest';
import { bookChapter } from './index';
import { CONSTANTS } from '../../engine/constants';
import { getFullCalculation } from '../../engine/pipeline';
import { dateFromEpochDays } from '../../engine/epochDays';
import { zodiacPosition } from '../../engine/zodiac';
import {
  calculateOrechSheni,
  calculateRochavSheni,
} from '../../engine/visibilityCalculations';

const prose = bookChapter(17)
  .sections.flatMap((s) => s.body)
  .join('\n');

const dms = (d, m = 0, s = 0) => d + m / 60 + s / 3600;
const arcsec = (a, b) => Math.abs(a - b) * 3600;

const steps = (() => {
  const calc = getFullCalculation(dateFromEpochDays(29));
  return Object.fromEntries(calc.steps.map((s) => [s.id, s]));
})();
const at = (id) => steps[id].result;

describe('KH 17:13-14, 17:22 — the whole chain on his evening', () => {
  // Every figure he states, in the order he states them.
  it.each([
    ['true position of the sun', 'sunTrueLongitude', dms(37, 9), 15],
    ['true position of the moon', 'moonTrueLongitude', dms(48, 36), 15],
    ['first longitude', 'elongation', dms(11, 27), 30],
    ['third longitude', 'orechShlishi', dms(11, 28), 60],
    ['fourth longitude', 'orechRevii', dms(13, 46), 60],
    ['portion of the first latitude', 'mnatGovahHaMedinah', dms(2, 35), 60],
    ['arc of sighting', 'keshetHaReiyah', dms(11, 11), 60],
  ])('%s', (_label, id, stated, toleranceArcsec) => {
    expect(arcsec(at(id), stated)).toBeLessThan(toleranceArcsec);
  });

  it('has the moon southerly at 3° 53′, as chapter 16 found', () => {
    expect(at('moonLatitude')).toBeLessThan(0);
    expect(arcsec(Math.abs(at('moonLatitude')), dms(3, 53))).toBeLessThan(60);
  });

  it('puts both bodies in Shor, where he puts them', () => {
    expect(zodiacPosition(at('sunTrueLongitude')).translit).toBe('Shor');
    expect(zodiacPosition(at('moonTrueLongitude')).translit).toBe('Shor');
  });

  it('reaches his verdict: the moon would have been seen', () => {
    expect(steps.moonVisibility.result).toBe(true);
  });
});

describe("KH 17:6 — his own name for the change in appearance", () => {
  // I first put "parallax" in the glossary's formal column, which reads
  // as though it were the Rambam's word. It is not: at 17:6 he names the
  // thing himself — שינוי המראה, the change in appearance — and his term
  // is both older and more transparent than the modern one.
  const terms = bookChapter(17).terms;
  const entry = terms.find((t) => /change in what you see/i.test(t.plain));

  it('exists, and carries his Hebrew', () => {
    expect(entry, 'the glossary lost the sighting-adjustment entry').toBeTruthy();
    expect(entry.hebrew).toBe('שינוי המראה');
  });

  it('does not present "parallax" as his term', () => {
    expect(entry.formal).not.toMatch(/parallax/i);
    expect(entry.formal).toMatch(/sighting adjustment/i);
    // It may be mentioned in the gloss as the modern name — that is the
    // honest place for it.
    expect(entry.gloss).toMatch(/modern astronomy calls/i);
  });

  it('the prose gives his term before the modern one', () => {
    const shinui = prose.indexOf('שינוי המראה');
    const parallax = prose.toLowerCase().indexOf('parallax');
    expect(shinui, 'his term is not in the prose').toBeGreaterThan(-1);
    expect(parallax, 'the modern term is not in the prose').toBeGreaterThan(-1);
    expect(shinui).toBeLessThan(parallax);
  });

  it("says what it literally means", () => {
    expect(prose).toMatch(/change in appearance/i);
  });
});

describe('the change in appearance always goes the same way', () => {
  // A reader asked whether it moves the moon up or down. The answer is
  // always down — you stand on the surface, displaced from the centre
  // towards your own zenith, so everything appears pushed away from
  // overhead. Both corrections are that one fact split in two, and the
  // chapter now says so. Checked across the whole circle, because "always"
  // is the load-bearing word.
  const SIGNS = [15, 48.6, 100, 150, 200, 250, 300, 350];

  it('never enlarges the gap, in any sign', () => {
    for (const lon of SIGNS) {
      expect(calculateOrechSheni(12, lon).result, `moon at ${lon}°`).toBeLessThan(12);
    }
  });

  it('always pushes the height southward, whichever side it started on', () => {
    for (const lon of SIGNS) {
      for (const lat of [+4, -4]) {
        expect(calculateRochavSheni(lat, lon).result, `${lon}° / ${lat}°`).toBeLessThan(lat);
      }
    }
  });

  it('so it always works against seeing the moon', () => {
    // Smaller gap is harder (the thresholds are minimums), and south is
    // the unhelpful verge — established in chapter 16's tests. Both
    // components of one shift, both unfavourable.
    expect(calculateOrechSheni(12, 48.6).result).toBeLessThan(12);
    expect(calculateRochavSheni(+4, 48.6).result).toBeLessThan(4);
    expect(prose).toMatch(/always works \*\*against\*\* you|always works against you/);
  });

  it('says which way, and why', () => {
    expect(prose).toMatch(/same way: down/i);
    expect(prose).toMatch(/pushed away from overhead|away from overhead/i);
    expect(prose).toMatch(/gap always gets \*smaller\*|gap always gets smaller/);
  });
});

describe('the four longitudes really are one number', () => {
  // The chapter now leads on this, and it is the whole reason the naming
  // is confusing. If the engine's steps were genuinely four independent
  // quantities the claim would be false and the section misleading.
  const RUNNING = ['elongation', 'orechSheni', 'orechShlishi', 'orechRevii', 'keshetHaReiyah'];

  it('each step is a small adjustment of the one before, not a fresh figure', () => {
    for (let i = 1; i < RUNNING.length; i++) {
      const change = Math.abs(at(RUNNING[i]) - at(RUNNING[i - 1]));
      // An adjustment, not a new measurement: never more than a few
      // degrees, and never zero (each step does something).
      expect(change, `${RUNNING[i - 1]} → ${RUNNING[i]}`).toBeGreaterThan(0);
      expect(change, `${RUNNING[i - 1]} → ${RUNNING[i]}`).toBeLessThan(4);
    }
  });

  it('stays in the same neighbourhood throughout', () => {
    // Start and finish are within a degree of each other on his evening,
    // which is what "one number, corrected" looks like from outside.
    const values = RUNNING.map(at);
    expect(Math.max(...values) - Math.min(...values)).toBeLessThan(4);
    expect(Math.abs(at('keshetHaReiyah') - at('elongation'))).toBeLessThan(1);
  });

  it('later steps really do feed off earlier ones', () => {
    // Each engine step names its upstream input, which is the machine
    // form of the same claim.
    expect(steps.orechSheni.inputs.orechRishon.refId).toBe('elongation');
    expect(steps.orechShlishi.inputs.orechSheni.refId).toBe('orechSheni');
    expect(steps.orechRevii.inputs.orechShlishi.refId).toBe('orechShlishi');
  });

  it('and the chapter says so, with his own run of figures', () => {
    expect(prose).toMatch(/There are not four longitudes|one number, adjusted four times/i);
    expect(prose).toMatch(/11° 27′ → 10° 27′ → 11° 28′ → 13° 46′/);
    expect(prose).toMatch(/the gap, after two adjustments/);
  });
});

describe('KH 17:22 — the two figures the English transposes', () => {
  // A first draft of this section claimed the printed 10° 27' was a
  // corruption and that "something has slipped between the numeral and
  // the label". Checking the Torat Emet Hebrew showed otherwise: it
  // reads י"א מעלות וכ"ז חלקים — 11° 27' — and cites the threshold as
  // "more than TEN". The English has both figures the other way round.
  // The Hebrew is sound; the transposition is in the translation.
  it('confirms both numbers are real, differing only in the tens digit', () => {
    // 11°27' is the gap; 10°27' is the gap after its first adjustment.
    // That near-identity is what makes the swap easy and hard to catch.
    expect(arcsec(at('elongation'), dms(11, 27))).toBeLessThan(30);
    expect(arcsec(at('orechSheni'), dms(10, 27))).toBeLessThan(30);
    const minutes = (v) => Math.round((v % 1) * 60);
    expect(minutes(at('elongation'))).toBe(minutes(at('orechSheni')));
  });

  it("the Hebrew's figure is the one the rule needs", () => {
    const row = CONSTANTS.KITZEI_HAREIYAH_TABLE.find(
      (r) => at('keshetHaReiyah') > r.kashtFromExclusive && at('keshetHaReiyah') <= r.kashtUpTo,
    );
    expect(row.orechMin).toBe(11);
    expect(at('elongation')).toBeGreaterThanOrEqual(row.orechMin);
    expect(at('orechSheni')).toBeLessThan(row.orechMin);
  });

  it("and both of the Hebrew's statements about it are true", () => {
    // "the longitude was 11°27'" and "the first longitude was more than
    // ten" — the second is weaker than the rule requires but not wrong.
    expect(at('elongation')).toBeGreaterThan(10);
    expect(at('elongation')).toBeGreaterThan(11);
  });

  it('the engine uses the first longitude, so it reaches his answer', () => {
    expect(steps.moonVisibility.inputs.orechRishon.value).toBeCloseTo(at('elongation'), 9);
    expect(steps.moonVisibility.result).toBe(true);
  });

  it('and the chapter attributes the slip to the translation, not the source', () => {
    expect(prose).toMatch(/The Hebrew has the two figures the other way round/);
    expect(prose).toMatch(/transposed somewhere between the Hebrew and the English/);
    // The retracted claim must not survive anywhere.
    expect(prose).not.toMatch(/slipped in transmission/);
  });
});

describe('KH 17:3-4 — the early exit, and its two regimes', () => {
  it('has the thresholds the chapter quotes', () => {
    const { capricornGemini, cancerSagittarius } = CONSTANTS.EARLY_EXIT_THRESHOLDS;
    expect(capricornGemini.invisibleMax).toBe(9);
    expect(capricornGemini.visibleMin).toBe(15);
    expect(cancerSagittarius.invisibleMax).toBe(10);
    expect(cancerSagittarius.visibleMin).toBe(24);
    for (const quoted of ['nine degrees or less', 'more than fifteen degrees', 'ten degrees', 'twenty-four']) {
      expect(prose, quoted).toContain(quoted);
    }
  });

  it('really does leave a much wider undecided band in one half', () => {
    // The chapter says "nearly two and a half times wider". Check it.
    const { capricornGemini: cg, cancerSagittarius: cs } = CONSTANTS.EARLY_EXIT_THRESHOLDS;
    const ratio = (cs.visibleMin - cs.invisibleMax) / (cg.visibleMin - cg.invisibleMax);
    expect(ratio).toBeGreaterThan(2.2);
    expect(ratio).toBeLessThan(2.5);
    expect(prose).toMatch(/two and a half times wider/);
  });
});

describe('KH 17:5, 17:8 — the tables read by sign', () => {
  it('are twelve rows each, in the order of the signs', () => {
    for (const table of [CONSTANTS.PARALLAX_LON_BY_MAZAL, CONSTANTS.PARALLAX_LAT_BY_MAZAL]) {
      expect(table).toHaveLength(12);
      table.forEach((row, i) => expect(row.mazalIdx).toBe(i));
    }
  });

  it('quote the values the chapter names', () => {
    const lon = CONSTANTS.PARALLAX_LON_BY_MAZAL.map((r) => r.chalakim);
    expect(lon[0]).toBe(59); // Taleh
    expect(lon[1]).toBe(60); // Shor — "a full degree"
    expect(lon[2]).toBe(58); // Teomim
    expect(Math.min(...lon)).toBe(34); // Moznayim / Akrav
    const lat = CONSTANTS.PARALLAX_LAT_BY_MAZAL.map((r) => r.chalakim);
    expect(lat[0]).toBe(9);
    expect(lat[1]).toBe(10);
    expect(Math.max(...lat)).toBe(46); // Moznayim
    // The prose names the signs by number now, with the name in
    // brackets, so it quotes "34 in the 7th" rather than "34 in Moznayim".
    for (const quoted of ['59 minutes in the 1st sign', 'a full degree in the 2nd', '34 in the 7th', '46 in the 7th']) {
      expect(prose, quoted).toContain(quoted);
    }
  });

  it('run in opposite phase, as the figure claims', () => {
    // Where the longitude correction is largest the latitude one is
    // smallest, and the reverse. That is the claim the card makes about
    // them being two parts of one shift, so it is checked rather than
    // asserted.
    const lon = CONSTANTS.PARALLAX_LON_BY_MAZAL.map((r) => r.chalakim);
    const lat = CONSTANTS.PARALLAX_LAT_BY_MAZAL.map((r) => r.chalakim);
    const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    const [mLon, mLat] = [mean(lon), mean(lat)];
    const cov = lon.reduce((sum, v, i) => sum + (v - mLon) * (lat[i] - mLat), 0);
    const sd = (a, m) => Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0));
    const correlation = cov / (sd(lon, mLon) * sd(lat, mLat));
    expect(correlation).toBeLessThan(-0.8);
  });
});

describe('KH 17:15-21 — the trade between the two numbers', () => {
  it('steps down by exactly one degree per band', () => {
    // The chapter's claim: as the required arc rises by a degree, the
    // required gap falls by one. That is the pattern the plot shows.
    const rows = CONSTANTS.KITZEI_HAREIYAH_TABLE;
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].kashtUpTo - rows[i - 1].kashtUpTo).toBe(1);
      expect(rows[i - 1].orechMin - rows[i].orechMin).toBe(1);
    }
    // The prose states the same trade in words rather than arithmetic.
    expect(prose).toMatch(/The bigger one gets, the less is asked of the other/);
  });

  it('covers the whole band between the two flat cutoffs', () => {
    const rows = CONSTANTS.KITZEI_HAREIYAH_TABLE;
    expect(Math.min(...rows.map((r) => r.kashtFromExclusive))).toBe(9);
    expect(Math.max(...rows.map((r) => r.kashtUpTo))).toBe(14);
  });
});

describe('the fourth-longitude step, corrected in review', () => {
  const body = bookChapter(17)
    .sections.find((s) => s.id === 'three-more')
    .body.join('\n');

  it('keys the stretch/shrink on the moon, not on the gap', () => {
    // The prose said "which sign the gap now falls in". The engine's
    // adjudicated reading (its own header note on KH 17:14) keys
    // SETTING_TIME_BY_MAZAL on the moon's position — the worked example
    // only reproduces with that reading.
    expect(body).toMatch(/which sign \*\*the moon\*\* is in/);
    expect(body).not.toMatch(/which sign the gap now falls in/);
    expect(body).toMatch(/only comes out right keyed on the moon/);
  });

  it('lists the actual set of fractions, including subtract-a-third', () => {
    // The old list omitted 1/3 — Betulah and Moznayim both subtract it.
    expect(body).toMatch(/subtract a fifth or a third/);
    const ops = CONSTANTS.SETTING_TIME_BY_MAZAL;
    const subtractions = ops.filter((r) => r.operation === 'subtract').map((r) => r.fraction);
    expect(subtractions).toContain(1 / 3);
    expect(subtractions).toContain(1 / 5);
    const additions = ops.filter((r) => r.operation === 'add').map((r) => r.fraction);
    expect(new Set(additions)).toEqual(new Set([1 / 6, 1 / 5]));
  });

  it('states the final fraction as the fixed two thirds, with its direction', () => {
    // "A fraction of it" was vague; KH 17:13 fixes 2/3 for the land of
    // Israel, and the engine applies north → add, south → subtract.
    expect(body).toMatch(/two thirds\*\* of it, always two thirds/);
    expect(body).toMatch(/north adds, south takes away/);
    expect(CONSTANTS.GEOGRAPHIC_HEIGHT_FRACTION_OF_ROCHAV_RISHON).toBeCloseTo(2 / 3, 9);
  });
});
