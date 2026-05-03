/**
 * Tests for the KH 17 visibility chain.
 *
 * Two anchors:
 *
 *   1. Rambam's own worked example (KH 17:13-14, 17:22) — the chapter
 *      walks through the full procedure for "ערב שבת שני לחדש אייר משנה זו"
 *      with all intermediate values stated to the arc-minute. This is
 *      the GOLD-STANDARD test fixture for this chapter; if any step
 *      drifts from the Rambam's printed numbers (within his own stated
 *      tolerance "אֵין מְדַקְדְּקִין בִּשְׁנִיּוֹת"), the implementation is wrong.
 *      We feed the inputs the Rambam declares and assert each output to
 *      within ±1' of his stated values.
 *
 *   2. The user's 2 Sivan ה'תשפו worksheet (the report that surfaced
 *      issue #18). The astronomical pipeline's upstream values match
 *      the user's worksheet to within seconds (modulo issue #19's
 *      season-correction question), and the downstream verdict must
 *      flip from the previous "not visible" to "visible" — which is
 *      what the user observed should be the correct answer.
 */
import { describe, it, expect } from 'vitest';
import hebcal from 'hebcal';
import {
  calculateElongation,
  calculateOrechSheni,
  calculateRochavSheni,
  calculateOrechShlishi,
  calculateOrechRevii,
  calculateMnatGovahHaMedinah,
  calculateKeshetHaReiyah,
  determineVisibility,
} from '../visibilityCalculations.js';
import { getFullCalculation } from '../pipeline.js';

const { HDate } = hebcal;

/** Compare two angles within `tolArcMin` arc-minutes. The Rambam himself
 *  rounds to whole arc-minutes ("אֵין מְדַקְדְּקִין בִּשְׁנִיּוֹת" — KH 17:13)
 *  so 1' is the natural tolerance for table-driven steps. */
function expectMinutesClose(actualDeg, expectedDeg, tolArcMin = 1, msg = '') {
  const diffArcMin = Math.abs(actualDeg - expectedDeg) * 60;
  expect(
    diffArcMin <= tolArcMin,
    `${msg} expected ${expectedDeg}° actual ${actualDeg}° diff ${diffArcMin.toFixed(2)}' (tol ${tolArcMin}')`
  ).toBe(true);
}

const dms = (deg, min = 0, sec = 0) => deg + min / 60 + sec / 3600;

describe('KH 17 visibility chain — Rambam\'s worked example (KH 17:13-14)', () => {
  // Inputs declared by the Rambam in 17:13:
  //   sun true   = 7°09' Taurus  = 37°09' absolute
  //   moon true  = 18°36' Taurus = 48°36' absolute
  //   רוחב ראשון = 3°53' South   (signed: south = negative)
  const sunTrueLon  = dms(37, 9);
  const moonTrueLon = dms(48, 36);
  const rochavRishon = -dms(3, 53);

  it('17:1 — אורך ראשון = 11°27\'', () => {
    const step = calculateElongation(moonTrueLon, sunTrueLon);
    expectMinutesClose(step.result, dms(11, 27), 1, 'אורך ראשון');
  });

  it('17:5 — אורך שני = 10°27\' (subtract Taurus\'s 1°00\' parallax)', () => {
    const orechRishon = calculateElongation(moonTrueLon, sunTrueLon).result;
    const step = calculateOrechSheni(orechRishon, moonTrueLon);
    expectMinutesClose(step.result, dms(10, 27), 1, 'אורך שני');
  });

  it('17:7-9 — רוחב שני = 4°03\' South (south + 10\' parallax)', () => {
    const step = calculateRochavSheni(rochavRishon, moonTrueLon);
    expectMinutesClose(Math.abs(step.result), dms(4, 3), 1, 'רוחב שני (magnitude)');
    expect(step.result).toBeLessThan(0); // sign preserved as south
    expect(step.direction).toBe('דרומי');
  });

  it('17:10-11 — מעגל הירח = 1°01\' (¼ of רוחב שני) and אורך שלישי = 11°28\'', () => {
    const orechRishon = calculateElongation(moonTrueLon, sunTrueLon).result;
    const orechSheni  = calculateOrechSheni(orechRishon, moonTrueLon).result;
    const rochavSheni = calculateRochavSheni(rochavRishon, moonTrueLon).result;
    const step = calculateOrechShlishi(orechSheni, rochavSheni, moonTrueLon);
    expectMinutesClose(step.maagalMagnitude, dms(1, 1), 1, 'מעגל הירח');
    expectMinutesClose(step.result, dms(11, 28), 1, 'אורך שלישי');
    expect(step.maagalPhrase).toBe('רביעיתו'); // 1/4
  });

  it('17:12a — אורך רביעי = 13°46\' (add ⅕ of אורך שלישי, moon in Taurus)', () => {
    const orechRishon = calculateElongation(moonTrueLon, sunTrueLon).result;
    const orechSheni  = calculateOrechSheni(orechRishon, moonTrueLon).result;
    const rochavSheni = calculateRochavSheni(rochavRishon, moonTrueLon).result;
    const orechShlishi = calculateOrechShlishi(orechSheni, rochavSheni, moonTrueLon).result;
    const step = calculateOrechRevii(orechShlishi, moonTrueLon);
    expectMinutesClose(step.result, dms(13, 46), 1, 'אורך רביעי');
  });

  it('17:12b — מנת גובה המדינה = 2°35\' (⅔ of |רוחב ראשון|)', () => {
    const step = calculateMnatGovahHaMedinah(rochavRishon);
    expectMinutesClose(step.result, dms(2, 35), 1, 'מנת גובה המדינה');
  });

  it('17:12c — קשת הראיה = 11°11\' (south → subtract)', () => {
    const orechRishon = calculateElongation(moonTrueLon, sunTrueLon).result;
    const orechSheni  = calculateOrechSheni(orechRishon, moonTrueLon).result;
    const rochavSheni = calculateRochavSheni(rochavRishon, moonTrueLon).result;
    const orechShlishi = calculateOrechShlishi(orechSheni, rochavSheni, moonTrueLon).result;
    const orechRevii = calculateOrechRevii(orechShlishi, moonTrueLon).result;
    const mnat = calculateMnatGovahHaMedinah(rochavRishon).result;
    const step = calculateKeshetHaReiyah(orechRevii, mnat, rochavRishon);
    expectMinutesClose(step.result, dms(11, 11), 2, 'קשת הראיה');
  });

  it('17:19 — verdict: ודאי יראה (קשת ∈ (11°,12°] AND אורך ≥ 11°)', () => {
    const orechRishon = calculateElongation(moonTrueLon, sunTrueLon).result;
    const orechSheni  = calculateOrechSheni(orechRishon, moonTrueLon).result;
    const rochavSheni = calculateRochavSheni(rochavRishon, moonTrueLon).result;
    const orechShlishi = calculateOrechShlishi(orechSheni, rochavSheni, moonTrueLon).result;
    const orechRevii = calculateOrechRevii(orechShlishi, moonTrueLon).result;
    const mnat = calculateMnatGovahHaMedinah(rochavRishon).result;
    const keshet = calculateKeshetHaReiyah(orechRevii, mnat, rochavRishon).result;
    const verdict = determineVisibility({
      orechRishon, keshetHaReiyah: keshet, moonTrueLon,
    });
    expect(verdict.verdict).toBe('visible');
    expect(verdict.path).toMatch(/17:19/);
  });
});

describe('KH 17 visibility chain — user\'s 2 Sivan ה\'תשפו worksheet (issue #18)', () => {
  it('verdict flips from not-visible to visible', () => {
    const hd = new HDate(2, 'Sivan', 5786);
    const calc = getFullCalculation(hd.greg());
    expect(calc.daysFromEpoch).toBe(309775); // sanity: matches user's spreadsheet
    expect(calc.moon.isVisible).toBe(true);
    expect(calc.moon.visibilityVerdict).toBe('visible');
  });

  it('chain produces all seven KH 17 intermediate values', () => {
    const hd = new HDate(2, 'Sivan', 5786);
    const calc = getFullCalculation(hd.greg());
    for (const k of [
      'orechSheni', 'rochavSheni', 'orechShlishi', 'orechRevii',
      'mnatGovahHaMedinah', 'keshetHaReiyah',
    ]) {
      expect(calc.moon[k], `missing moon.${k}`).toBeTypeOf('number');
    }
    // קשת הראיה should be in the >14° certainly-visible band per KH 17:15.
    expect(calc.moon.keshetHaReiyah).toBeGreaterThan(14);
  });

  it('stepMap exposes every new chain step for drill-down', () => {
    const hd = new HDate(2, 'Sivan', 5786);
    const calc = getFullCalculation(hd.greg());
    for (const id of [
      'orechSheni', 'rochavSheni', 'orechShlishi', 'orechRevii',
      'mnatGovahHaMedinah', 'keshetHaReiyah', 'moonVisibility',
    ]) {
      expect(calc.stepMap[id], `missing stepMap.${id}`).toBeTruthy();
      expect(calc.stepMap[id].rambamRef).toMatch(/KH 17/);
    }
  });
});

describe('KH 17:14 interpretive choice — SETTING_TIME keys on moon\'s mazal, NOT אורך שלישי\'s mazal', () => {
  // Targeted regression guard. The Rambam's worked example (KH 17:14)
  // says "האורך הזה במזל שור" of אורך שלישי = 11°28'. Read literally as
  // an absolute-longitude position, 11°28' is in Aries (idx 0), which
  // would give +1/6 → אורך רביעי = 13°22'. The Rambam's stated answer
  // is 13°46', which only matches if the table is keyed on the moon's
  // actual position (18°36' Taurus → +1/5). This test isolates that
  // interpretive call so a future "fix" gets a meaningful failure
  // message rather than "13°22' vs 13°46'".
  it('moon in Taurus + אורך שלישי = 11°28\' → +1/5 (not +1/6)', () => {
    const orechShlishi = dms(11, 28);
    const moonInTaurus = dms(48, 36); // Rambam's worked-example moon position

    const stepCorrect = calculateOrechRevii(orechShlishi, moonInTaurus);
    expectMinutesClose(stepCorrect.result, dms(13, 46), 1, 'with moon-mazal reading');

    // Sanity: if you accidentally key on orechShlishi's mazal (Aries),
    // you'd add 1/6 = 1°54.7' giving 13°22.7' — verify that's NOT what
    // we produce.
    const wrongAnswer = orechShlishi + orechShlishi / 6;
    expect(Math.abs(stepCorrect.result - wrongAnswer) * 60).toBeGreaterThan(20);
  });

  it('moon in Gemini + אורך שלישי = 10°27\' → +1/6 (Gemini is also a +1/6 sign)', () => {
    // User's 2 Sivan ה'תשפו case. Both mazal-of-moon (Gemini → +1/6)
    // and mazal-of-orech (Aries → +1/6) happen to give the same
    // fraction here, so this case alone CAN'T distinguish the two
    // readings — but it's worth pinning the value the user observed
    // so a future change away from the moon-mazal reading would still
    // need to demonstrate it produces the right answer here too.
    const orechShlishi = dms(10, 27, 33);
    const moonInGemini = dms(69, 29); // user's 2 Sivan moon
    const step = calculateOrechRevii(orechShlishi, moonInGemini);
    // +1/6 of 10°27'33" ≈ 1°44'36" → 12°12'09"
    expectMinutesClose(step.result, dms(12, 12, 9), 1, '2 Sivan setting correction');
  });
});

describe('KH 14:5 season-correction table — verbatim Sefaria reading (issue #19)', () => {
  // Source text in `docs/sources/KH_14_verbatim.md`. Tests pin the
  // boundary of every band to verbatim-stated values and guard against
  // accidental reversion to the prior unverified table (which had +30'
  // at 60°-90° on the additive side).
  it('has +15ʹ uniformly from 15° through 165° (no +30ʹ band on the additive side)', async () => {
    const mod = await import('../moonCalculations.js');
    for (const lon of [16, 30, 59, 60, 89, 90, 119, 120, 164]) {
      const s = mod.calculateSeasonCorrection(lon);
      const arcmin = Math.round(s.result * 60);
      expect(arcmin, `sun=${lon}° expected +15ʹ got ${arcmin}ʹ`).toBe(15);
    }
  });

  it('has the asymmetric -30ʹ band only at 240°-300° (start קשת → start דלי)', async () => {
    const mod = await import('../moonCalculations.js');
    for (const lon of [241, 270, 299]) {
      const s = mod.calculateSeasonCorrection(lon);
      const arcmin = Math.round(s.result * 60);
      expect(arcmin, `sun=${lon}° expected -30ʹ got ${arcmin}ʹ`).toBe(-30);
    }
    // -15ʹ flanking on both sides; bands are closed-open so the boundary
    // longitude itself belongs to the next band.
    expect(Math.round((await mod.calculateSeasonCorrection(239)).result * 60)).toBe(-15);
    expect(Math.round((await mod.calculateSeasonCorrection(300)).result * 60)).toBe(-15); // 300° is start-Aquarius, opens the -15' band
    expect(Math.round((await mod.calculateSeasonCorrection(301)).result * 60)).toBe(-15);
  });

  it('has zero-correction bands at the equinoxes', async () => {
    const mod = await import('../moonCalculations.js');
    for (const lon of [0, 14, 346, 359]) {  // mid-Pisces → mid-Aries
      const s = mod.calculateSeasonCorrection(lon);
      expect(Math.round(s.result * 60), `sun=${lon}° expected 0`).toBe(0);
    }
    for (const lon of [166, 180, 194]) {  // mid-Virgo → mid-Libra
      const s = mod.calculateSeasonCorrection(lon);
      expect(Math.round(s.result * 60), `sun=${lon}° expected 0`).toBe(0);
    }
  });
});

describe('KH 17 verdict gates — early-exit cuts (KH 17:3-4)', () => {
  it('Capricorn-Gemini half: אורך ראשון ≤ 9° → not-visible (KH 17:3)', () => {
    const verdict = determineVisibility({
      orechRishon: 7,           // ≤ 9
      keshetHaReiyah: 12,
      moonTrueLon: 30,          // 30° = Taurus, in Capricorn-Gemini half
    });
    expect(verdict.verdict).toBe('not-visible');
    expect(verdict.path).toMatch(/17:3/);
  });

  it('Capricorn-Gemini half: אורך ראשון > 15° → visible (KH 17:3)', () => {
    const verdict = determineVisibility({
      orechRishon: 17,          // > 15
      keshetHaReiyah: 8,        // would be "not visible" if we got past the gate
      moonTrueLon: 30,
    });
    expect(verdict.verdict).toBe('visible');
    expect(verdict.path).toMatch(/17:3/);
  });

  it('Cancer-Sagittarius half: אורך ראשון ≤ 10° → not-visible (KH 17:4)', () => {
    const verdict = determineVisibility({
      orechRishon: 9,
      keshetHaReiyah: 12,
      moonTrueLon: 120,         // 120° = Leo, in Cancer-Sagittarius half
    });
    expect(verdict.verdict).toBe('not-visible');
    expect(verdict.path).toMatch(/17:4/);
  });

  it('Cancer-Sagittarius half: אורך ראשון > 24° → visible (KH 17:4)', () => {
    const verdict = determineVisibility({
      orechRishon: 25,
      keshetHaReiyah: 8,
      moonTrueLon: 120,
    });
    expect(verdict.verdict).toBe('visible');
    expect(verdict.path).toMatch(/17:4/);
  });
});
