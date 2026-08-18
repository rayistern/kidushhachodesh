/**
 * Chapter 18's claims.
 *
 * This chapter computes almost nothing, so most of what needs guarding
 * is the reasoning rather than the arithmetic — in particular the
 * east-west implications, where two of the four statements carry
 * information and two do not, and getting the pair the wrong way round
 * would be a confident, plausible, complete inversion of the halacha.
 *
 * The one real calculation is KH 18:4's worked case, which is the
 * narrowest passing verdict the KH 17 table permits. That it passes by
 * exactly zero is the whole point of the halacha, so it is pinned.
 */
import { describe, it, expect } from 'vitest';
import { bookChapter } from './index';
import { CONSTANTS } from '../../engine/constants';
import { nodesForChapter, nodeById, chainStatus } from './chain';

const chapter = bookChapter(18);
const prose = chapter.sections.flatMap((s) => s.body).join('\n');

describe('KH 18:4 — the narrowest possible yes', () => {
  const ARC = 9 + 5 / 60; // 9° 5'
  const GAP = 13; // exactly

  it('falls in the band that demands a gap of exactly 13°', () => {
    const row = CONSTANTS.KITZEI_HAREIYAH_TABLE.find(
      (r) => ARC > r.kashtFromExclusive && ARC <= r.kashtUpTo,
    );
    expect(row.kashtFromExclusive).toBe(9);
    expect(row.kashtUpTo).toBe(10);
    expect(row.orechMin).toBe(13);
  });

  it('passes by exactly nothing — which is why the halacha uses it', () => {
    const row = CONSTANTS.KITZEI_HAREIYAH_TABLE.find(
      (r) => ARC > r.kashtFromExclusive && ARC <= r.kashtUpTo,
    );
    expect(GAP).toBeGreaterThanOrEqual(row.orechMin);
    expect(GAP - row.orechMin).toBe(0);
    // A hair less and it would fail.
    expect(GAP - 0.01).toBeLessThan(row.orechMin);
  });

  it('is the tightest requirement anywhere in the table', () => {
    // 13° is the largest gap any band demands, and it is demanded of the
    // smallest arcs — so this really is the extreme corner.
    const maxRequired = Math.max(...CONSTANTS.KITZEI_HAREIYAH_TABLE.map((r) => r.orechMin));
    expect(maxRequired).toBe(13);
  });

  it('the chapter states both figures', () => {
    expect(prose).toMatch(/9 degrees 5 minutes/);
    expect(prose).toMatch(/exactly 13 degrees/);
  });
});

describe('KH 18:13-16 — which direction proves what', () => {
  // The asymmetry, stated four ways. Inverting any of these would be a
  // confident and completely wrong claim, so each is asserted against
  // the prose separately.
  it('says a sighting in the EAST settles it', () => {
    expect(prose).toMatch(/Seen anywhere east of the land → certainly seen in the land/);
  });

  it('says a sighting in the WEST settles nothing', () => {
    expect(prose).toMatch(/not\* seen in the land tells you nothing about the west/);
  });

  it('says a FAILURE in the west settles it', () => {
    expect(prose).toMatch(/failure to see it in the west settles it/);
  });

  it('says a failure in the east settles nothing', () => {
    expect(prose).toMatch(/not seen in the east tells you nothing/);
  });

  it('warns that this is the reverse of the natural guess', () => {
    expect(prose).toMatch(/reverse of what an untrained guess would say/);
  });

  it('restricts the whole thing to the land\'s own latitude', () => {
    expect(prose).toMatch(/30 to 35 degrees north/);
  });
});

describe('KH 18:8-9 — the alternation when sighting fails', () => {
  it('states the bounds on full months', () => {
    expect(prose).toMatch(/never fewer than four full months|Never fewer than four full months/i);
    expect(prose).toMatch(/never more than eight/i);
  });

  it('keeps establishing and sanctifying distinct', () => {
    // The distinction is the halachic heart of 18:8 — the court can
    // establish a month by calculation but only sighting sanctifies it.
    expect(prose).toMatch(/\*\*establishing\*\* them without \*\*sanctifying\*\*/);
  });
});

describe('the chapter in the chain', () => {
  it('has its own node, and it is not the verdict', () => {
    const nodes = nodesForChapter(18);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('limits');
    // The verdict belongs to 17, where the engine's own step says it does.
    expect(nodeById('verdict').chapter).toBe(17);
  });

  it('reads as settled once the reader is past it', () => {
    expect(chainStatus(nodeById('limits'), 19)).toBe('settled');
    expect(chainStatus(nodeById('limits'), 18)).toBe('current');
    expect(chainStatus(nodeById('limits'), 17)).toBe('ahead');
  });
});

describe('the chapter is honest about what it invented', () => {
  it('does not dress its confidence bands as the Rambam\'s', () => {
    // HowMarginal groups margins into three bands with advice attached.
    // He gives one case and a principle. The card carries an editor's
    // note saying so; this checks the chapter does not overclaim either.
    expect(prose).not.toMatch(/the Rambam gives three bands|his scale/i);
    expect(prose).toMatch(/confidence level, in a system that had no vocabulary for one/);
  });
});
