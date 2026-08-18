/**
 * Chapter 19's claims.
 *
 * The chapter's own numbers are pinned in src/lib/khDeclination.test.js,
 * which is where the tilt table and the crescent rule live. This file
 * guards the prose: that it flags the change of reference line, that its
 * quoted figures match, and — the one that matters — that it does not
 * revive the superlative an earlier draft made about the table.
 */
import { describe, it, expect } from 'vitest';
import { bookChapter } from './index';
import { nodesForChapter, nodeById, chainStatus } from './chain';
import { DECLINATION_TABLE, MAX_TILT, declinationAt, moonFromEquator } from '../../lib/khDeclination';

const chapter = bookChapter(19);
const prose = chapter.sections.flatMap((s) => s.body).join('\n');
const allText = [
  prose,
  chapter.subtitle,
  ...(chapter.terms ?? []).flatMap((t) => [t.plain, t.formal, t.gloss]),
  ...(chapter.closing?.have ?? []),
  ...(chapter.closing?.missing ?? []),
].filter(Boolean).join('\n');

describe('the change of reference line', () => {
  it('warns that this chapter measures from the equator, not the sun\'s road', () => {
    expect(prose).toMatch(/measures off \*\*the equator\*\*|measures off the equator/);
    expect(prose).toMatch(/two different lines/);
    // The glossary must say it too, since a reader may start there.
    expect(allText).toMatch(/A \*\*different\*\* reference line/);
  });

  it('says the two tilts are combined, which is the chapter\'s job', () => {
    expect(prose).toMatch(/two tilts added together|two tilts/);
  });
});

describe('the figures the prose quotes', () => {
  it("quotes the table's ends correctly", () => {
    expect(prose).toMatch(/10 degrees along is 4 from the equator/);
    expect(prose).toMatch(/20 is 8/);
    expect(prose).toMatch(/30 is 11½/);
    const at = (lon) => DECLINATION_TABLE.find((r) => r.longitude === lon).tilt;
    expect(at(10)).toBe(4);
    expect(at(20)).toBe(8);
    expect(at(30)).toBe(11.5);
    expect(at(90)).toBe(MAX_TILT);
  });

  it("quotes the maximum tilt as 23½°", () => {
    expect(prose).toMatch(/23½ degrees|23½/);
    expect(MAX_TILT).toBe(23.5);
  });

  it('quotes his worked combination — 18 north, 4 south, 14 north', () => {
    expect(prose).toMatch(/18 degrees north/);
    expect(prose).toMatch(/4 degrees south/);
    expect(prose).toMatch(/14 degrees north of the equator/);

    const tilt = declinationAt(48.6);
    const combined = moonFromEquator(48.6, -3.888).result;
    expect(Math.round(tilt)).toBe(18);
    expect(Math.round(combined)).toBe(14);
  });
});

describe('the accuracy claim, after the correction', () => {
  // An earlier draft said the tilt table was "the most accurate table in
  // the book". It is not — KH 13:4's sun correction is tighter both
  // absolutely and relatively — and the first run of khDeclination's
  // relative-error test is what caught it. The claim is retracted; this
  // makes sure it stays retracted.
  it('does not claim to be the most accurate table in the book', () => {
    expect(allText).not.toMatch(/most accurate table/i);
  });

  it('makes the observation that survives: the apology was unnecessary', () => {
    expect(prose).toMatch(/a fifth of a degree/);
    expect(prose).toMatch(/apology was not needed|apology was unnecessary/i);
  });

  it('still records that he opened by apologising', () => {
    expect(prose).toMatch(/will not be exact/);
  });
});

describe('the ending', () => {
  it('quotes his closing reason and the verse', () => {
    expect(prose).toMatch(/not need to go looking in other books|not need to go looking/i);
    expect(prose).toMatch(/Seek out of the book of God/);
  });

  it('recalls the prophet-or-gentile remark from chapter 17', () => {
    expect(prose).toMatch(/prophet or a gentile/);
  });
});

describe('the chapter in the chain', () => {
  it('owns the last node, and it is the end of the arc', () => {
    const nodes = nodesForChapter(19);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('rules');
    expect(chainStatus(nodeById('rules'), 19)).toBe('current');
    expect(chainStatus(nodeById('rules'), 18)).toBe('ahead');
  });

  it('points the reader at chapters 1-10 rather than nowhere', () => {
    expect(chapter.closing.missing.join(' ')).toMatch(/chapters 1 to 10/);
    expect(chapter.closing.missing.join(' ')).toMatch(/source text/);
  });
});
