/**
 * The next sighting night — the evening before the next Rosh Chodesh.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **crossing** (fixed calendar → astronomical)
 *  SURFACE CATEGORY: internal lib (teaching aid)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The sighting-chain cards used to carry a "Today" preset. A reader
 * pointed out the obvious: today is usually mid-month, where the doubled
 * gap sits outside the 5°–62° window and the visibility chain answers a
 * question nobody asked. The night the whole book is about is one night
 * a month — the evening after the 29th day, when the court would look
 * for the new moon and Rosh Chodesh hangs on the answer.
 *
 * This walks forward from a given date (inclusive) to the next civil
 * day whose Hebrew date is the 29th. The Hebrew day begins at nightfall,
 * so daysFromEpoch of that civil day names the evening that opens the
 * potential 30th — ליל שלושים, the night of watching. Whether that
 * evening turns out to be Rosh Chodesh itself or the eve of a full
 * month's 30th day is exactly what the sighting would have decided.
 */
import { HDate, daysFromEpoch } from '../engine/epochDays';
import { getFullCalculation } from '../engine/pipeline';

/** Is this evening's doubled gap inside KH 15:2's stated window? */
function questionIsLive(date) {
  const doubled = getFullCalculation(date).moon.doubleElongation;
  return doubled >= 5 && doubled <= 62;
}

export function nextSightingNight(from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12);
  // A Hebrew month is 29 or 30 days, so a 29th always arrives within 31.
  for (let i = 0; i <= 31; i++) {
    if (new HDate(d).getDate() === 29) {
      // The evening after the 29th is the first candidate. But the fixed
      // calendar often places that evening BEFORE the mean conjunction —
      // the moon still trails the sun and the doubled gap sits near 360,
      // outside the 5°-62° window the whole chapter lives in. When that
      // happens the question is live an evening or two later: after the
      // 30th day, or occasionally only on Rosh Chodesh evening itself
      // (measured over two years of months, the crescent's first live
      // evening is the third one about an eighth of the time). That is
      // why Rosh Chodesh can follow a 29th or a 30th, and why this
      // preset picks the first evening the question is live on rather
      // than always the first candidate.
      for (let step = 0; step < 3; step++) {
        const candidate = new Date(d);
        candidate.setDate(candidate.getDate() + step);
        if (step === 2 || questionIsLive(candidate)) {
          return {
            days: daysFromEpoch(candidate),
            date: candidate,
            hebrew: new HDate(candidate).toString(),
          };
        }
      }
    }
    d.setDate(d.getDate() + 1);
  }
  // Unreachable, but a caller should get a loud failure over a quiet one.
  throw new Error('no 29th within 31 days — the Hebrew calendar has no such month');
}
