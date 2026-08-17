/**
 * Chapter 11's claims.
 *
 * Three of them were added in answer to a reader's questions, and all
 * three assert something checkable rather than merely explanatory. Each
 * is the kind of claim that is easy to write confidently and wrong:
 *
 *   1. That the belt's "climbing" and "falling" halves are EXACTLY the
 *      halves KH 17:3-4 splits its thresholds on. If that is off by a
 *      sign the explanation is worse than no explanation, because it
 *      sounds authoritative. Pinned against the engine's own constant.
 *   2. That "average" is not an average of measurements. Guarded as a
 *      warning that must stay present, since the plain-English reading
 *      of the word is the trap.
 *   3. That Hebrew years come in six lengths and all six occur within
 *      twenty years — which is why the day count cannot be obtained by
 *      multiplication, and therefore why it comes from KH 6-8.
 */
import { describe, it, expect } from 'vitest';
import { bookChapter } from './index';
import { declinationAt } from '../../lib/khDeclination';
import { CONSTANTS } from '../../engine/constants';
import { HDate, daysFromEpoch } from '../../engine/epochDays';

const chapter = bookChapter(11);
const section = (id) => chapter.sections.find((s) => s.id === id);
const prose = chapter.sections.flatMap((s) => s.body).join('\n');

describe('why stretches of the belt lean differently (KH 11:9)', () => {
  const body = section('why-name-them').body.join('\n');

  it('gives the tilted-ring reason rather than asserting the fact', () => {
    expect(body).toMatch(/tilted ring/);
    expect(body).toMatch(/climbing/);
    expect(body).toMatch(/falling/);
  });

  it('names the two turning points the prose claims, and they are right', () => {
    expect(body).toMatch(/4th sign \(Sartan\)/);
    expect(body).toMatch(/10th \(G'di\)/);
    expect(body).toMatch(/23½ degrees north/);
    // The high and low points of the road really are there.
    expect(declinationAt(90)).toBeCloseTo(23.5, 6);
    expect(declinationAt(270)).toBeCloseTo(-23.5, 6);
    // ...and nowhere between them is more extreme.
    for (let lon = 0; lon < 360; lon += 5) {
      expect(Math.abs(declinationAt(lon))).toBeLessThanOrEqual(23.5 + 1e-9);
    }
  });

  it('has the climbing half climbing and the falling half falling', () => {
    // The claim is directional, so test it directionally: walking
    // forward along the belt, is the road gaining or losing north?
    const gains = (a) => declinationAt((a + 5) % 360) > declinationAt(a);
    // 270 -> 90, through 0: the claimed climbing half.
    for (const lon of [270, 300, 330, 0, 30, 60, 85]) {
      expect(gains(lon), `${lon}° should be climbing`).toBe(true);
    }
    // 90 -> 270, through 180: the claimed falling half.
    for (const lon of [90, 120, 150, 180, 210, 240, 265]) {
      expect(gains(lon), `${lon}° should be falling`).toBe(false);
    }
  });

  it("matches KH 17:3-4's split exactly, which is the whole point of the passage", () => {
    // The prose claims the two threshold sets ARE the two halves. If the
    // engine's split ever moved, the explanation would become a
    // confident falsehood — so it is asserted, not assumed.
    const { capricornGemini, cancerSagittarius } = CONSTANTS.EARLY_EXIT_THRESHOLDS;
    expect(capricornGemini.source).toBe('KH 17:3');
    expect(cancerSagittarius.source).toBe('KH 17:4');

    // The engine's own half-selection rule, restated: 270-90 vs 90-270.
    const climbingHalf = (lon) => lon >= 270 || lon < 90;
    for (let lon = 0; lon < 360; lon += 1) {
      const gaining = declinationAt((lon + 0.5) % 360) > declinationAt(lon % 360);
      // Away from the two turning points, gaining north and being in the
      // 270-90 half must be the same statement.
      if (Math.min(Math.abs(lon - 90), Math.abs(lon - 270)) > 1) {
        expect(gaining, `${lon}°`).toBe(climbingHalf(lon));
      }
    }
  });

  it('says he never explains the split, so the reader knows this is editorial', () => {
    expect(body).toMatch(/never explains the split/);
  });
});

describe('what "average" means (KH 11:13)', () => {
  const body = section('mean-vs-true').body.join('\n');

  it('warns against the ordinary English sense, which is the trap', () => {
    expect(body).toMatch(/not\*\* mean an average of several measurements|average of several measurements/);
    expect(body).toMatch(/nothing is being averaged/);
  });

  it('gives the actual definition — a steady rate, times days, from a start', () => {
    expect(body).toMatch(/speed times days, plus where it stood at the start/);
    expect(body).toMatch(/pretending the motion is perfectly even/);
  });

  it('says it is knowingly wrong, which is what makes the corrections make sense', () => {
    expect(body).toMatch(/known in advance to be wrong|knows to be wrong/);
  });

  it('is echoed in the glossary, since a reader may start there', () => {
    const term = chapter.terms.find((t) => t.plain === 'average place');
    expect(term).toBeTruthy();
    expect(term.gloss).toMatch(/Not\*\* an average of measurements/);
    expect(term.gloss).toMatch(/fixed daily rate/);
  });
});

describe('where the day count comes from (KH 11:16)', () => {
  const body = section('starting-point').body.join('\n');

  it('answers the question rather than leaving the count unexplained', () => {
    expect(body).toMatch(/how are you supposed to know that number/i);
  });

  it('points at the calendar chapters, not at the astronomy', () => {
    expect(body).toMatch(/chapters 6 to 8/);
    expect(body).toMatch(/molad/);
    expect(body).toMatch(/seam/);
  });

  it('states the six year lengths, and they are the real ones', () => {
    expect(body).toMatch(/353, 354, 355, 383, 384 and 385 days/);
    const lengths = new Set();
    for (let y = 4939; y < 5790; y++) {
      lengths.add(new HDate(1, 'Tishrei', y + 1).abs() - new HDate(1, 'Tishrei', y).abs());
    }
    expect([...lengths].sort((a, b) => a - b)).toEqual([353, 354, 355, 383, 384, 385]);
  });

  it('is right that all six turn up within twenty years, which kills multiplication', () => {
    // This is the load-bearing claim: if some lengths were rare, "just
    // multiply by 365-ish" would be nearly fine and the passage would be
    // overstating. Check a few independent windows, not one lucky one.
    for (const start of [4939, 5100, 5400, 5700]) {
      const seen = new Set();
      for (let y = start; y < start + 20; y++) {
        seen.add(new HDate(1, 'Tishrei', y + 1).abs() - new HDate(1, 'Tishrei', y).abs());
      }
      expect(seen.size, `the twenty years from ${start}`).toBe(6);
    }
  });

  it('describes the modern count in the round terms the prose uses', () => {
    expect(body).toMatch(/three hundred thousand days/);
    expect(body).toMatch(/eight hundred and fifty years/);
    // Loosely pinned on purpose: the prose says "a little over" and "some",
    // and this figure grows by one every day.
    const days = daysFromEpoch(new Date(2026, 7, 17, 12));
    expect(days).toBeGreaterThan(300_000);
    expect(days).toBeLessThan(320_000);
    expect(days / 365.2468).toBeGreaterThan(840);
    expect(days / 365.2468).toBeLessThan(860);
  });
});

describe('the chapter still holds together', () => {
  it('keeps the sign names anchored to numbers in the new prose too', () => {
    // The number-first convention, restated here because this chapter is
    // the one that declares it.
    for (const match of prose.matchAll(/\b(Sartan|G'di|Taleh|Shor|Teomim)(?![a-z])/g)) {
      const window = prose.slice(Math.max(0, match.index - 90), match.index + 30);
      expect(window, `"${match[0]}" needs a number nearby`).toMatch(
        /\b(1st|2nd|3rd|[4-9]th|1[0-2]th)\b|start of the|twelve|order|names|lamb|Aries|ayil/,
      );
    }
  });
});
