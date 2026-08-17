/**
 * Structural guards for the book, and the number-pinning rule.
 *
 * These iterate every registered chapter, so chapters 15-19 are covered
 * the moment they are written rather than needing new tests each time.
 *
 * The rule that matters most is in the last describe block: **any
 * degree-minute-second figure appearing in the prose must be declared
 * and checked against the engine.** Without it, a plausible-looking
 * number typed into a sentence would sit on the page unverified, and
 * this book's whole claim is that its numbers are the engine's.
 */
import { describe, it, expect } from 'vitest';
import { BOOK_CHAPTERS, bookChapter, hasBookChapter, writtenChapters } from './index';
import { CHAIN_NODES, chainStatus, nodesForChapter, nodeById } from './chain';
import { figureIds } from '../../components/book/interactives';
import { isValidChapter, HALACHA_COUNTS } from '../khChapters';
import { CONSTANTS } from '../../engine/constants';
import { dmsToDecimal, formatDms } from '../../engine/dmsUtils';
import { zodiacPosition } from '../../engine/zodiac';
import { trueFromMean } from '../../lib/maslulTable';

const chapters = writtenChapters();

describe('the registry', () => {
  it('has at least one chapter written', () => {
    expect(chapters.length).toBeGreaterThan(0);
  });

  it('only registers real chapters of Hilchot Kidush HaChodesh', () => {
    for (const n of chapters) expect(isValidChapter(n)).toBe(true);
  });

  it('agrees with its own accessors', () => {
    for (const n of chapters) expect(hasBookChapter(n)).toBe(true);
    expect(hasBookChapter(99)).toBe(false);
    expect(bookChapter(99)).toBeNull();
  });
});

describe('every written chapter is structurally sound', () => {
  it.each(chapters)('chapter %i', (n) => {
    const content = bookChapter(n);
    expect(content.chapter).toBe(n);
    expect(content.title?.length).toBeGreaterThan(3);
    expect(content.sections.length).toBeGreaterThan(0);

    const ids = content.sections.map((s) => s.id);
    expect(new Set(ids).size, 'section ids must be unique').toBe(ids.length);

    for (const section of content.sections) {
      expect(section.heading?.length, `${n}:${section.id} heading`).toBeGreaterThan(3);
      expect(section.body.length, `${n}:${section.id} body`).toBeGreaterThan(0);
      const prose = section.body.join(' ');
      expect(prose.length, `${n}:${section.id} too short`).toBeGreaterThan(150);
      expect(prose).not.toMatch(/TODO|TKTK|FIXME|lorem/i);
      // A stray `${` means a template literal was half-written and the
      // sentence will render with visible braces.
      expect(prose, `${n}:${section.id} unclosed interpolation`).not.toContain('${');
    }
  });

  it.each(chapters)('chapter %i points only at figures that exist', (n) => {
    const known = figureIds();
    for (const section of bookChapter(n).sections) {
      if (!section.interactive) continue;
      expect(known, `${n}:${section.id} → ${section.interactive}`).toContain(section.interactive);
    }
  });

  it('has no orphan figures — everything registered is used somewhere', () => {
    const used = new Set(
      chapters.flatMap((n) => bookChapter(n).sections.map((s) => s.interactive).filter(Boolean)),
    );
    for (const id of figureIds()) expect([...used], `figure "${id}" is never used`).toContain(id);
  });

  it.each(chapters)('chapter %i cites halachot that exist', (n) => {
    for (const section of bookChapter(n).sections) {
      if (!section.source) continue;
      const match = /KH (\d+):(\d+)/.exec(section.source);
      expect(match, `${section.source} is not a parseable reference`).toBeTruthy();
      const [, ch, halacha] = match.map(Number);
      expect(isValidChapter(ch)).toBe(true);
      expect(Number(halacha)).toBeLessThanOrEqual(HALACHA_COUNTS[ch]);
    }
  });

  it.each(chapters)('chapter %i links its sections to real chain nodes', (n) => {
    for (const section of bookChapter(n).sections) {
      if (!section.nodeId) continue;
      expect(nodeById(section.nodeId), `unknown node ${section.nodeId}`).toBeTruthy();
    }
  });

  it.each(chapters)('chapter %i — any glossary is well formed', (n) => {
    const terms = bookChapter(n).terms;
    if (!terms) return;
    expect(terms.length).toBeGreaterThan(0);
    const plains = terms.map((t) => t.plain);
    expect(new Set(plains).size, 'plain names must be unique').toBe(plains.length);
    for (const term of terms) {
      // The plain name is the point — it must not just restate the
      // formal one, or the glossary is doing nothing.
      expect(term.plain?.length, `${n}: missing plain name`).toBeGreaterThan(2);
      expect(term.formal?.length, `${n}: missing formal name`).toBeGreaterThan(2);
      expect(term.plain.toLowerCase()).not.toBe(term.formal.toLowerCase());
      expect(term.gloss?.length, `${n}: ${term.plain} has no gloss`).toBeGreaterThan(40);
      expect(term.gloss).not.toContain('${');
    }
  });

  it.each(chapters)('chapter %i — every glossary word is actually used', (n) => {
    // A term nobody says is a term nobody needed. This checks the
    // chapter genuinely talks about each thing it glosses, keyed on the
    // distinctive word rather than the exact phrase — prose naturally
    // varies ("where the arm of the ride is pointing" for "where the arm
    // is pointing"), and demanding a verbatim match would push the
    // writing around to satisfy the test rather than the reader.
    const STOPWORDS = new Set([
      'the', 'a', 'an', 'of', 'to', 'in', 'on', 'off', 'at', 'is', 'it',
      'you', 'your', 'how', 'far', 'past', 'where', 'what', 'from', 'and',
      'or', 'up', 'down', 'above', 'below', 'sit', 'sits',
    ]);
    const content = bookChapter(n);
    if (!content.terms) return;
    const prose = content.sections.flatMap((s) => s.body).join('\n').toLowerCase();
    for (const term of content.terms) {
      const keyword = term.plain
        .toLowerCase()
        .replace(/[^a-z\s'-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w && !STOPWORDS.has(w))
        .sort((a, b) => b.length - a.length)[0];
      expect(keyword, `${n}: "${term.plain}" is all stopwords`).toBeTruthy();
      expect(prose, `${n}: the prose never mentions "${keyword}"`).toContain(keyword);
    }
  });

  it.each(chapters)('chapter %i names signs by number, not name alone', (n) => {
    // A reader said the transliterated sign names made the book sound
    // foreign, and they were right: twelve unfamiliar words are twelve
    // things to hold before a sentence can be read. The book now leads
    // with the position — "the 2nd sign (Shor)" — because the position is
    // the fact the calculations use and the name is a label on it.
    //
    // So a bare sign name in the prose has to be accompanied by an
    // ordinal somewhere in the same paragraph, or it is asking the reader
    // to remember. The chapters that deliberately discuss the naming
    // itself (11's "why bother naming the twelve") are the exception and
    // say so in their own words.
    const NAMES = [
      'Taleh', 'Shor', 'Teomim', 'Sartan', 'Aryeh', 'Betulah',
      'Moznayim', 'Akrav', 'Keshet', "G'di", "D'li", 'Dagim',
    ];
    const ORDINAL = /\b(1st|2nd|3rd|[4-9]th|1[0-2]th)\b|\bnineteenth degree\b|names themselves|familiar English names/;

    for (const section of bookChapter(n).sections) {
      const prose = section.body.join(' ');
      // A trailing lookahead, not \b — "Shor" must not match "Short",
      // and two of the names contain an apostrophe so \b cannot close them.
      const namesUsed = NAMES.filter((name) =>
        new RegExp(`\\b${name}(?![a-z])`).test(prose),
      );
      if (namesUsed.length === 0) continue;
      expect(
        ORDINAL.test(prose),
        `${n}:${section.id} names ${namesUsed.join('/')} with no position to anchor it`,
      ).toBe(true);
    }
  });

  it('offers the sign reference only where signs are discussed', () => {
    // On a chapter that never mentions a sign it would be furniture.
    const withStrip = chapters.filter((n) => bookChapter(n).signStrip);
    expect(withStrip).toEqual([11, 17, 19]);
    for (const n of withStrip) {
      const prose = bookChapter(n).sections.flatMap((s) => s.body).join(' ');
      expect(prose, `chapter ${n} has the strip but discusses no signs`).toMatch(
        /\bsign\b|\bsigns\b/,
      );
    }
  });

  it.each(chapters)('chapter %i does not address a reader who asked a question', (n) => {
    // Several sections of this book were written in reply to a specific
    // question, and the reply's register is easy to leave behind. A
    // published chapter cannot say "your instinct is right" — no reader
    // stated an instinct, so the sentence lands as though written for
    // somebody else.
    //
    // Ordinary second person is fine and used throughout ("you will be
    // able to", "you may notice"). What is banned is language presuming
    // an earlier exchange.
    const CHAT_REGISTER = [
      /your instinct/i,
      /you asked/i,
      /your question/i,
      /as you (noticed|mentioned|said|pointed out)/i,
      /good question/i,
      /to answer your/i,
      /as (we|I) discussed/i,
    ];
    const content = bookChapter(n);
    const everything = [
      ...content.sections.flatMap((s) => [s.heading, ...s.body]),
      content.subtitle,
      content.recap?.thisChapter,
      content.recap?.byTheEnd,
      ...(content.recap?.settled ?? []),
      ...(content.closing?.have ?? []),
      ...(content.closing?.missing ?? []),
      ...(content.terms ?? []).flatMap((t) => [t.plain, t.gloss]),
    ]
      .filter(Boolean)
      .join('\n');

    for (const pattern of CHAT_REGISTER) {
      expect(everything, `chapter ${n} slips into reply-to-a-question register`).not.toMatch(
        pattern,
      );
    }
  });

  it.each(chapters)('chapter %i has a recap and a closing', (n) => {
    const content = bookChapter(n);
    expect(content.recap.thisChapter?.length).toBeGreaterThan(20);
    expect(content.closing.have.length).toBeGreaterThan(0);
  });
});

describe('the chain', () => {
  it('has unique ids and never runs backwards through the chapters', () => {
    const ids = CHAIN_NODES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (let i = 1; i < CHAIN_NODES.length; i++) {
      expect(CHAIN_NODES[i].chapter).toBeGreaterThanOrEqual(CHAIN_NODES[i - 1].chapter);
    }
  });

  it('covers every astronomical chapter', () => {
    for (let ch = 11; ch <= 19; ch++) {
      expect(nodesForChapter(ch).length, `chapter ${ch} has no node`).toBeGreaterThan(0);
    }
  });

  it('gives chapter 14 three nodes, because that is the confusion', () => {
    // The reader's difficulty is that KH 14 looks like one topic and is
    // three quantities. Collapsing them would hide the whole point.
    expect(nodesForChapter(14).map((n) => n.id)).toEqual(['moon-mean', 'moon-anomaly', 'season']);
  });

  it('marks settled, current and ahead from position alone', () => {
    const at = (id) => chainStatus(nodeById(id), 14);
    expect(at('sun-true')).toBe('settled');
    expect(at('moon-mean')).toBe('current');
    expect(at('moon-true')).toBe('ahead');
  });

  it('marks a single node as "here" without disturbing the rest', () => {
    expect(chainStatus(nodeById('season'), 14, 'season')).toBe('here');
    expect(chainStatus(nodeById('moon-mean'), 14, 'season')).toBe('current');
  });
});

describe('every figure in the prose is pinned to the engine', () => {
  // Declared numbers, per chapter, each with what it must equal. Any
  // degree-minute-second figure in any chapter's prose that is not
  // declared here fails the sweep below — so a plausible-looking number
  // cannot be typed into a sentence and left unverified.
  const FLAT_DAILY = { degrees: 0, minutes: 59, seconds: 8 };

  const dms = (d, m = 0, sec = 0) => d + m / 60 + sec / 3600;

  const PINNED = {
    11: {
      // Chapter 13's worked answer, quoted here to show he gives the
      // position as a number AND as a place in the signs.
      "104° 59' 25\"": () =>
        formatDms(trueFromMean(dms(105, 37, 25), dms(86, 45, 23)).trueLongitude),
    },
    12: {
      "9° 51' 23\"": () => formatDms(dmsToDecimal(CONSTANTS.SUN_MEAN_PERIOD_BLOCKS.p10)),
      // Deliberately the WRONG value — the chapter shows what the flat
      // printed rate would give, to expose the missing third of a second.
      "9° 51' 20\"": () => formatDms(dmsToDecimal(FLAT_DAILY) * 10),
      "7° 3' 32\"": () => formatDms(dmsToDecimal(CONSTANTS.SUN.START_POSITION)),
      "26° 45' 8\"": () => formatDms(dmsToDecimal(CONSTANTS.SUN.APOGEE_START)),
      // The two blocks he nicknames "a month" and "a year". Pinned here
      // as figures; that they are NOT a month and a year is checked in
      // ch12.test.js against the real synodic month and solar year.
      "28° 35' 1\"": () => formatDms(dmsToDecimal(CONSTANTS.SUN_MEAN_PERIOD_BLOCKS.p29)),
      "348° 55' 15\"": () => formatDms(dmsToDecimal(CONSTANTS.SUN_MEAN_PERIOD_BLOCKS.p354)),
    },
    14: {
      "13° 10' 35\"": () => formatDms(dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY)),
      "13° 3' 54\"": () => formatDms(dmsToDecimal(CONSTANTS.MOON.MASLUL_MEAN_MOTION)),
      "1° 14' 43\"": () => formatDms(dmsToDecimal(CONSTANTS.MOON.START_POSITION)),
      "84° 28' 42\"": () => formatDms(dmsToDecimal(CONSTANTS.MOON.MASLUL_START)),
    },
  };

  const proseOf = (n) =>
    bookChapter(n)
      .sections.flatMap((s) => s.body)
      .join('\n');

  it.each(chapters)('chapter %i — declared figures match the engine', (n) => {
    for (const [written, expected] of Object.entries(PINNED[n] || {})) {
      // The prose writes 13° 10' 35"; formatDms writes 13° 10′ 35.0″.
      const normalised = written.replace(/'/g, '′').replace(/"/g, '″').replace(/(\d)″/, '$1.0″');
      expect(expected(), `chapter ${n} prose says ${written}`).toBe(normalised);
    }
  });

  it.each(chapters)('chapter %i — no undeclared degree-minute-second figure', (n) => {
    const found = proseOf(n).match(/\d+°\s?\d+'\s?\d+"/g) || [];
    for (const figure of found) {
      expect(
        Object.keys(PINNED[n] || {}),
        `chapter ${n}: "${figure}" appears in the prose but is not pinned`,
      ).toContain(figure);
    }
  });

  it('the sweep actually finds figures, or it proves nothing', () => {
    const total = chapters.reduce(
      (sum, n) => sum + (proseOf(n).match(/\d+°\s?\d+'\s?\d+"/g) || []).length,
      0,
    );
    expect(total).toBeGreaterThan(5);
  });

  it('KH 11 — the claim that chapter 17 looks corrections up by sign holds', () => {
    // The "why bother naming the twelve" section rests on this being
    // true of the engine, and quotes the range. If the table were keyed
    // on degrees rather than signs the whole argument would collapse.
    const table = CONSTANTS.PARALLAX_LON_BY_MAZAL;
    expect(table).toHaveLength(12);
    for (let i = 0; i < 12; i++) expect(table[i].mazalIdx).toBe(i);

    const values = table.map((row) => row.chalakim);
    // "running from about 34 minutes at the lowest to a full degree at
    // the highest"
    expect(Math.min(...values)).toBe(34);
    expect(Math.max(...values)).toBe(60);
    expect(proseOf(11)).toContain('34 minutes');
    expect(proseOf(11)).toContain('a full degree');
  });

  it("KH 11 — gets Taleh right, and does not call it a ram", () => {
    // טלה is a lamb; אַיִל is a ram. "Aries" arrives via Latin and is not
    // a translation of the Hebrew, which is the point the section makes.
    const prose = proseOf(11);
    expect(prose).toContain('Taleh is a lamb');
    expect(prose).not.toMatch(/Taleh \(the Ram\)/);
  });

  it('every declared figure is still somewhere in its chapter', () => {
    // Guards the other direction: a PINNED entry left behind after the
    // sentence quoting it was rewritten would otherwise sit there
    // passing forever while checking nothing.
    for (const [chapter, figures] of Object.entries(PINNED)) {
      const prose = proseOf(Number(chapter));
      for (const written of Object.keys(figures)) {
        expect(prose, `chapter ${chapter} pins "${written}" but no longer quotes it`).toContain(
          written,
        );
      }
    }
  });

  it("places the moon's epoch position in the sign the prose names", () => {
    const longitude =
      dmsToDecimal(CONSTANTS.MOON.START_POSITION) + CONSTANTS.MOON.START_CONSTELLATION * 30;
    expect(zodiacPosition(longitude).translit).toBe('Shor');
    expect(proseOf(14)).toContain('Shor');
  });

  it('quotes the gap between the two rates correctly', () => {
    const gapArcmin =
      (dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY) -
        dmsToDecimal(CONSTANTS.MOON.MASLUL_MEAN_MOTION)) *
      60;
    // The prose says "about 6 and a half minutes of arc a day".
    expect(gapArcmin).toBeGreaterThan(6);
    expect(gapArcmin).toBeLessThan(7);
    expect(proseOf(14)).toMatch(/6 and a half minutes of arc/);
  });

  it('quotes the two circuit lengths correctly', () => {
    const circuit = (rate) => 360 / dmsToDecimal(rate);
    const sidereal = circuit(CONSTANTS.MOON.MEAN_MOTION_PER_DAY);
    const anomalistic = circuit(CONSTANTS.MOON.MASLUL_MEAN_MOTION);
    // "27 days and 8 hours" / "27 days and 13 hours"
    expect(Math.floor(sidereal)).toBe(27);
    expect(Math.round((sidereal % 1) * 24)).toBe(8);
    expect(Math.floor(anomalistic)).toBe(27);
    expect(Math.round((anomalistic % 1) * 24)).toBe(13);
    expect(proseOf(14)).toContain('27 days and 8 hours');
    expect(proseOf(14)).toContain('27 days and 13 hours');
  });
});
