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
    expect(prose).toMatch(/There are not four longitudes|not\. It is one number|one number, adjusted four times/i);
    expect(prose).toMatch(/11° 27′ → 10° 27′ → 11° 28′ → 13° 46′/);
    expect(prose).toMatch(/the gap, after two adjustments/);
  });
});

describe('KH 17:22 — the figure that does not support its own conclusion', () => {
  // The chapter tells the reader about this rather than letting them
  // trip over it, so the tests have to establish that the reading given
  // is the correct one.
  it('prints 10° 27′, which is the SECOND longitude, not the first', () => {
    expect(arcsec(at('orechSheni'), dms(10, 27))).toBeLessThan(30);
    expect(arcsec(at('elongation'), dms(11, 27))).toBeLessThan(30);
  });

  it("only the first longitude clears the threshold his conclusion invokes", () => {
    // Arc 11°11' falls in the 11-12 band, which demands a first
    // longitude of at least 11°. 11°27' clears it; 10°27' does not.
    const row = CONSTANTS.KITZEI_HAREIYAH_TABLE.find(
      (r) => at('keshetHaReiyah') > r.kashtFromExclusive && at('keshetHaReiyah') <= r.kashtUpTo,
    );
    expect(row.orechMin).toBe(11);
    expect(at('elongation')).toBeGreaterThanOrEqual(row.orechMin);
    expect(at('orechSheni')).toBeLessThan(row.orechMin);
  });

  it('the engine uses the first longitude, so it reaches his answer', () => {
    expect(steps.moonVisibility.inputs.orechRishon.value).toBeCloseTo(at('elongation'), 9);
    expect(steps.moonVisibility.result).toBe(true);
  });

  it('and the chapter says all of this to the reader', () => {
    expect(prose).toMatch(/ten\* degrees and 27 minutes|\*ten\*/);
    expect(prose).toMatch(/second\*\* longitude|second longitude/);
    expect(prose).toMatch(/slipped in transmission/);
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
    for (const quoted of ['59 minutes', 'a full degree', '34 in Moznayim', '46 in Moznayim']) {
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
