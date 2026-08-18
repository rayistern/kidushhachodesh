/**
 * The Rambam's correction table, followed the way he follows it.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** — [R] KH 13:4-9
 *  SURFACE CATEGORY: internal lib (teaching aid)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 13:4 tabulates the correction (מנת המסלול) at ten-degree steps
 * from 0° to 180°. Three rules turn that table into an answer for any
 * course:
 *
 *   13:5-6  a course past 180° is mirrored — look up 360 − course.
 *   13:7-8  between two rows, interpolate proportionally. His own
 *           examples: a course of 65° falls midway between 60° (1°41')
 *           and 70° (1°51'), giving 1°46'; a course of 67° gives 1°48'.
 *   13:9    the minutes of the course itself are discarded — under
 *           thirty they are dropped, over thirty they become another
 *           degree. The lookup argument is always a whole number.
 *
 * That last rule is why this module exists rather than the card simply
 * calling the engine. `engine/sunCalculations.lookupMaslulCorrection`
 * interpolates at the exact course, which is the more precise thing to
 * do and is what the dashboard wants — but it is not what the Rambam
 * instructs, and it does not land on the figure he prints in KH 13:10.
 * At his worked example the two routes differ by about 16 arcseconds,
 * comfortably inside the tolerance he sets in that same halacha ("one
 * need not pay attention to the seconds at all"). The teaching surface
 * follows the text; the engine keeps the precision. Both are pinned in
 * maslulTable.test.js.
 */
import { CONSTANTS } from '../engine/constants.js';

/**
 * KH 13:9 — reduce a course to the whole degrees the table is read
 * with. Minutes under thirty are dropped; thirty or more carry.
 */
export function roundCourse(courseDegrees) {
  const whole = Math.floor(courseDegrees);
  const minutes = (courseDegrees - whole) * 60;
  return minutes >= 30 ? whole + 1 : whole;
}

/**
 * Correction for a whole-degree course, with the reasoning exposed.
 *
 * Returns `{ correction, mirrored, effective, lo, hi, perDegree,
 * exact }` — `exact` when the course lands on a tabulated row, in
 * which case no interpolation was needed.
 */
export function correctionWithTrace(courseDegrees) {
  const table = CONSTANTS.SUN_MASLUL_CORRECTIONS;

  // KH 13:5-6 — past half a circle the table is read backwards.
  const mirrored = courseDegrees > 180;
  const effective = mirrored ? 360 - courseDegrees : courseDegrees;

  // KH 13:3 — at 0°, 180° and 360° there is no correction at all.
  if (effective <= 0 || effective >= 180) {
    return {
      correction: 0,
      mirrored,
      effective,
      lo: null,
      hi: null,
      perDegree: 0,
      exact: true,
    };
  }

  for (let i = 0; i < table.length - 1; i++) {
    const lo = table[i];
    const hi = table[i + 1];
    if (effective >= lo.maslul && effective <= hi.maslul) {
      if (effective === lo.maslul) {
        return { correction: lo.correction, mirrored, effective, lo, hi, perDegree: 0, exact: true };
      }
      if (effective === hi.maslul) {
        return { correction: hi.correction, mirrored, effective, lo, hi, perDegree: 0, exact: true };
      }
      // KH 13:7 — spread the difference evenly across the ten degrees.
      const perDegree = (hi.correction - lo.correction) / (hi.maslul - lo.maslul);
      return {
        correction: lo.correction + (effective - lo.maslul) * perDegree,
        mirrored,
        effective,
        lo,
        hi,
        perDegree,
        exact: false,
      };
    }
  }

  return { correction: 0, mirrored, effective, lo: null, hi: null, perDegree: 0, exact: true };
}

/**
 * KH 13:2-3 — which way the correction is applied. Under half a circle
 * it is taken off the mean position; over, it is added on.
 */
export function correctionDirection(courseDegrees) {
  if (courseDegrees === 0 || courseDegrees === 180 || courseDegrees === 360) return 'none';
  return courseDegrees < 180 ? 'subtract' : 'add';
}

/**
 * The full KH 13:1-2 procedure from a mean position and an apogee.
 *
 * Every intermediate is returned, because the intermediates are what
 * the chapter is teaching — the answer alone would hide the method.
 */
export function trueFromMean(meanLongitude, apogee) {
  const rawCourse = ((meanLongitude - apogee) % 360 + 360) % 360;
  const course = roundCourse(rawCourse);
  const trace = correctionWithTrace(course);
  const direction = correctionDirection(course);

  const applied =
    direction === 'add' ? trace.correction : direction === 'subtract' ? -trace.correction : 0;

  return {
    rawCourse,
    course,
    direction,
    ...trace,
    trueLongitude: ((meanLongitude + applied) % 360 + 360) % 360,
  };
}
