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
import { bookChapter, hasBookChapter } from './index';
import { CONSTANTS } from '../../engine/constants';
import { getFullCalculation } from '../../engine/pipeline';
import { calculateOrechShlishi, calculateOrechRevii } from '../../engine/visibilityCalculations';
import { nextSightingNight } from '../../lib/sightingNight';
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
    expect(prose).toMatch(/swapped somewhere between the Hebrew and the English/);
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
  // Spread across the slice/stretch/finish sections since; union below.
  const body = bookChapter(17)
    .sections.filter((s) => ['the-slice', 'the-stretch', 'three-more'].includes(s.id))
    .flatMap((s) => s.body)
    .join('\n');

  it('keys the stretch/shrink on the moon, not on the gap', () => {
    // The prose said "which sign the gap now falls in". The engine's
    // adjudicated reading (its own header note on KH 17:14) keys
    // SETTING_TIME_BY_MAZAL on the moon's position — the worked example
    // only reproduces with that reading.
    expect(body).toMatch(/which sign \*\*the moon\*\* is in/);
    expect(body).not.toMatch(/which sign the gap now falls in/);
    // The adjudication itself (the worked example only reproduces when
    // keyed on the moon — see the engine's header on KH 17:14) lives
    // here and in the engine, NOT in the prose: a parenthetical
    // explaining the ambiguity was a reply to this project's own earlier
    // mistake, and the reader flagged it.
    expect(body).not.toMatch(/only comes out right keyed on the moon/);
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

describe("the closing's description of chapters 18 and 19", () => {
  const missing = bookChapter(17).closing.missing.join(' ');

  it('describes what those chapters actually contain', () => {
    expect(missing).toMatch(/stepping back from his own method/);
    expect(missing).toMatch(/which way the crescent leaned/);
  });

  it('does not claim they correct for observers away from Jerusalem', () => {
    // They do not: 18 is limits and court practice, 19 is crescent tilt
    // and height. The east-west passage of 18:13-16 is the nearest thing,
    // and he closes it by saying it has no practical consequence.
    expect(missing).not.toMatch(/observers away from Jerusalem/);
  });

  it('does not claim the book has yet to write them — it has', () => {
    // "Still only in the Rambam's own words" was true when this closing
    // was written and false ever since; derived from the registry so it
    // can never go stale in either direction again.
    expect(missing).not.toMatch(/only in the Rambam's own words/);
    expect(hasBookChapter(18)).toBe(true);
    expect(hasBookChapter(19)).toBe(true);
  });
});

describe('the civil-date gloss on the early-exit halves', () => {
  const body = bookChapter(17)
    .sections.find((s) => s.id === 'early-exit')
    .body.join('\n');

  it('states the month ranges and the crossover honestly', () => {
    expect(body).toMatch(/January through May\*\* always fell in the narrow-window half/);
    expect(body).toMatch(/July through November\*\* always in the wide one/);
    expect(body).toMatch(/June and December\*\* are the crossover months/);
    // And the reason dates are usable at all for a moon-keyed rule.
    expect(body).toMatch(/on a sighting night the moon stands close to the sun/);
  });

  it('is true across four years of sighting nights', () => {
    // The exact computation behind the claim. A bare date range for a
    // moon-keyed rule would be wrong in general; it works only because
    // the sighting night pins the moon near the sun, and this asserts
    // the resulting month map rather than trusting it.
    let d = new Date(2026, 0, 1);
    for (let m = 0; m < 48; m++) {
      const sn = nextSightingNight(d);
      const lon = getFullCalculation(sn.date).moon.trueLongitude;
      const easy = lon >= 270 || lon < 90;
      const month = sn.date.getMonth(); // 0-based
      if (month >= 0 && month <= 4) expect(easy, sn.hebrew).toBe(true);
      if (month >= 6 && month <= 10) expect(easy, sn.hebrew).toBe(false);
      // June (5) and December (11) are allowed either way.
      d = new Date(sn.date);
      d.setDate(d.getDate() + 1);
    }
  });
});

describe('the by-sign tables carry civil months too', () => {
  it('says the trick carries over, with the 1st sign in March-April', () => {
    const body = bookChapter(17)
      .sections.find((s) => s.id === 'by-sign')
      .body.join('\n');
    expect(body).toMatch(/two months at a time/);
    expect(body).toMatch(/March and April\*\*/);
    expect(body).toMatch(/12th in February and March/);
  });

  it('holds: each sign owns two adjacent months, over eight years', () => {
    // The figure's SIGHTING_MONTHS list, recomputed rather than copied.
    // sign k (1-based) pairs months (k+1, k+2) mod 12, 0-based Jan=0:
    // sign 1 = Mar/Apr = (2,3), sign 10 = Dec/Jan = (11,0), etc.
    let d = new Date(2026, 0, 1);
    for (let m = 0; m < 96; m++) {
      const sn = nextSightingNight(d);
      const lon = getFullCalculation(sn.date).moon.trueLongitude;
      const sign = Math.floor(((lon % 360) + 360) % 360 / 30) + 1;
      const month = sn.date.getMonth();
      const allowed = [(sign + 1) % 12, (sign + 2) % 12];
      expect(allowed, `${sn.hebrew}: sign ${sign}, month ${month}`).toContain(month);
      d = new Date(sn.date);
      d.setDate(d.getDate() + 1);
    }
  });
});

describe("the slice's fractions are one shape, not a list", () => {
  const bands = CONSTANTS.MOON_CIRCLE_FRACTIONS;
  const at = (lon) => bands.find((b) => lon >= b.from && lon < b.to).fraction;

  it('peaks at two fifths around the starts of the 1st and 7th signs', () => {
    expect(at(5)).toBe(2 / 5);
    expect(at(175)).toBe(2 / 5);
    expect(at(185)).toBe(2 / 5);
    expect(at(355)).toBe(2 / 5);
    expect(Math.max(...bands.map((b) => b.fraction))).toBe(2 / 5);
  });

  it('vanishes in bands straddling the starts of the 4th and 10th signs', () => {
    // The same two turning points as ch11's climbing/falling halves and
    // ch19's greatest tilt — the prose leans on the coincidence, so the
    // straddle is pinned: the zero band must contain 90° and 270°.
    for (const lon of [86, 90, 94]) expect(at(lon), `${lon}°`).toBe(0);
    for (const lon of [266, 270, 274]) expect(at(lon), `${lon}°`).toBe(0);
  });

  it('shrinks by the stated stages from the peak to nothing', () => {
    const stages = [2 / 5, 1 / 3, 1 / 4, 1 / 5, 1 / 6, 1 / 12, 1 / 24, 0];
    const seen = [];
    for (let lon = 0; lon < 90; lon += 1) {
      const f = at(lon);
      if (seen[seen.length - 1] !== f) seen.push(f);
    }
    expect(seen).toEqual(stages);
  });

  it('mirrors exactly: each half of the circle repeats the other', () => {
    for (let lon = 0; lon < 180; lon += 1) {
      expect(at(lon), `${lon}° vs ${lon + 180}°`).toBe(at(lon + 180));
    }
  });

  it('is keyed on the moon alone, as the prose claims', () => {
    // The bands tile [0,360) with no other input.
    let cursor = 0;
    for (const b of bands) {
      expect(b.from).toBe(cursor);
      cursor = b.to;
    }
    expect(cursor).toBe(360);
  });
});

describe('the slice figure draws the table it claims to', () => {
  it('has a section of its own, pointing at the shape figure', () => {
    const sec = bookChapter(17).sections.find((s) => s.id === 'the-slice');
    expect(sec).toBeTruthy();
    expect(sec.interactive).toBe('slice-shape');
    expect(sec.body.join(' ')).toMatch(/one shape|single shape|seeing whole/);
  });

  it("the staircase the figure plots is the engine's own table", () => {
    // The figure maps every band of MOON_CIRCLE_FRACTIONS with no
    // massaging; this asserts the properties the drawing shows —
    // contiguous bands, symmetric halves, peak 2/5, zero straddling the
    // turning points — hold of the data it reads.
    const bands = CONSTANTS.MOON_CIRCLE_FRACTIONS;
    let cursor = 0;
    for (const b of bands) {
      expect(b.from).toBe(cursor);
      expect(b.fraction).toBeGreaterThanOrEqual(0);
      expect(b.fraction).toBeLessThanOrEqual(2 / 5);
      cursor = b.to;
    }
    expect(cursor).toBe(360);
  });
});

describe("the slice's direction rule, as the figure states it", () => {
  // KH 17:11, from the engine: 10th-through-3rd half (270°-90°) —
  // north subtracts, south adds; 4th-through-9th half — reversed.
  const BASE = 12; // an arbitrary second longitude

  const shlishi = (lon, lat) => calculateOrechShlishi(BASE, lat, lon).result;

  it('holds in all four combinations', () => {
    // 10th-through-3rd half (lon 40): north off, south on.
    expect(shlishi(40, +2)).toBeLessThan(BASE);
    expect(shlishi(40, -2)).toBeGreaterThan(BASE);
    // 4th-through-9th half (lon 130): reversed.
    expect(shlishi(130, +2)).toBeGreaterThan(BASE);
    expect(shlishi(130, -2)).toBeLessThan(BASE);
  });

  it('flips only inside the zero bands, so no applied slice ever reverses', () => {
    // The elegance the figure points at: the halves split at 90° and
    // 270°, and the fraction is zero for 85°-95° and 265°-275°. Walk the
    // whole circle; wherever the direction differs from one degree
    // earlier, the slice at both points must be nothing.
    const dirAt = (lon) => Math.sign(shlishi(lon, +2) - BASE); // north case
    const fracAt = (lon) =>
      CONSTANTS.MOON_CIRCLE_FRACTIONS.find((b) => lon >= b.from && lon < b.to).fraction;
    for (let lon = 1; lon < 360; lon++) {
      if (dirAt(lon) !== 0 && dirAt(lon - 1) !== 0 && dirAt(lon) !== dirAt(lon - 1)) {
        throw new Error(`direction reversed with a live slice at ${lon}°`);
      }
      if (dirAt(lon) !== dirAt(lon - 1)) {
        // Any change must pass through the zero band.
        expect(fracAt(lon) === 0 || fracAt(lon - 1) === 0, `${lon}°`).toBe(true);
      }
    }
  });
});

describe('the adjustments name their outputs where they are made', () => {
  // The prose spread across three sections (the slice, the stretch, the
  // finish), each beside its own figure; the claims hold of their union.
  const body = bookChapter(17)
    .sections.filter((s) => ['the-slice', 'the-stretch', 'three-more'].includes(s.id))
    .flatMap((s) => s.body)
    .join('\n');

  it('leads each adjustment with the longitude it produces', () => {
    // "Two adjustments down: the third longitude" made the reader keep a
    // tally the prose never showed; the ordinal now opens each bullet —
    // the third at the end of the slice section, the fourth beside the
    // stretch's own figure.
    // The ordinal still opens each bullet; the Hebrew name rides along so
    // a reader can find the step in the Rambam's own text (a reader
    // asked for exactly that link).
    expect(body).toMatch(/\*\*The third longitude\*\* — \*\*אורך שלישי\*\* — is the gap after the slice/);
    expect(body).toMatch(/\*\*The fourth longitude\*\* — \*\*אורך רביעי\*\* — is that number stretched or shrunk/);
    // A reader asked whether the fourth was "the same slice". It is not:
    // the slice is a fraction of the HEIGHT, the stretch a fraction of
    // the gap ITSELF — checked against the engine below.
    expect(body).toMatch(/not\* the slice again/);
    expect(body).toMatch(/fraction \*\*of itself\*\*/);
    expect(body).not.toMatch(/Two adjustments down|Three down/);
  });

  it("maps each one to the chain card's own step numbers", () => {
    expect(body).toMatch(/step 7 of the finishing card below/);
    expect(body).toMatch(/step 8/);
  });

  it('defers the slice direction to the figure that shows it', () => {
    expect(body).toMatch(/the rule the figure above shows/);
    expect(body).not.toMatch(/North, subtract; south, add/);
  });

  it('keeps the running tally in the finish, first through fourth', () => {
    const finish = bookChapter(17)
      .sections.find((s) => s.id === 'three-more')
      .body.join('\n');
    expect(finish).toMatch(/the slice made the \*third\*; the stretch, the \*fourth\*/);
  });

  it('gives the stretch its own section and figure, as the slice has', () => {
    const sec = bookChapter(17).sections.find((s) => s.id === 'the-stretch');
    expect(sec).toBeTruthy();
    expect(sec.interactive).toBe('stretch-shape');
  });
});

describe('the third and fourth longitudes take fractions of different things', () => {
  it("the slice's magnitude scales with the height and not with the gap", () => {
    // Double the height: the third-longitude delta doubles. Double the
    // gap: it does not change at all.
    const d = (gap, lat) => calculateOrechShlishi(gap, lat, 40).result - gap;
    expect(d(12, -4)).toBeCloseTo(2 * d(12, -2), 9);
    expect(d(24, -2)).toBeCloseTo(d(12, -2), 9);
  });

  it("the stretch's magnitude scales with the gap and ignores the height entirely", () => {
    // calculateOrechRevii takes no latitude at all — the strongest
    // possible statement that the height is not involved.
    expect(calculateOrechRevii.length).toBe(2);
    const d = (gap) => calculateOrechRevii(gap, 40).result - gap; // moon in the 2nd sign: +1/5
    expect(d(20)).toBeCloseTo(2 * d(10), 9);
    expect(d(10)).toBeCloseTo(2, 9); // a fifth of ten
  });
});

describe('"the stretch" is declared two-way', () => {
  it('warns that the short name covers shrinking too', () => {
    const body = bookChapter(17)
      .sections.find((s) => s.id === 'the-stretch')
      .body.join('\n');
    // A reader hit a night where "the stretch" removed a third of the
    // gap and reasonably asked whether stretching makes things smaller.
    expect(body).toMatch(/it runs both ways/);
    expect(body).toMatch(/On many nights "the stretch" shrinks/);
  });

  it('supports "many nights" without overclaiming: 6 signs stretch, 4 shrink, 2 rest', () => {
    // Checked before writing the prose: stretching is in fact the
    // commoner case sign-for-sign, so the section says the shrink
    // happens on MANY nights, not most. (A draft of this very test
    // asserted the majority the other way round; the numbers refused.)
    const ops = CONSTANTS.SETTING_TIME_BY_MAZAL.map((r) => r.operation);
    expect(ops.filter((o) => o === 'add').length).toBe(6);
    expect(ops.filter((o) => o === 'subtract').length).toBe(4);
    expect(ops.filter((o) => o === 'none').length).toBe(2);
  });
});
