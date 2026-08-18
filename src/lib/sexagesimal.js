/**
 * Sexagesimal (degrees/minutes/seconds) arithmetic, traced step by step.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** — [R] KH 11:10-12
 *  SURFACE CATEGORY: internal lib (teaching aid)
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 11:10 gives the addition rule: add like to like, carry at 60 from
 * seconds to minutes and from minutes to degrees, and reduce degrees
 * modulo 360.
 *
 * KH 11:11-12 gives the subtraction rule, including the one step that
 * surprises people: when the subtrahend is larger than the minuend
 * ("even if it is merely one minute greater"), you add a full 360° to
 * the minuend first, then borrow normally. The Rambam works a full
 * example — 100° 20' 30" − 200° 50' 40" = 259° 29' 50" — which is
 * pinned as a test case in sexagesimal.test.js.
 *
 * These functions exist for the *teaching* surface, not the engine.
 * The engine works in decimal degrees throughout (see dmsUtils.js) and
 * carries no sexagesimal intermediate state — the Rambam's hand-
 * calculation procedure and a floating-point pipeline are two routes to
 * the same angle. What this module adds is the visible route: each
 * `steps` entry is one line of the Rambam's own narration, so a reader
 * can follow the borrow chain rather than being handed an answer.
 */

/** Angle below which two DMS values are treated as equal when comparing. */
const TOTAL_SECONDS_IN_CIRCLE = 360 * 3600;

/** Normalize a partial {degrees, minutes, seconds} to filled integers. */
function coerce(dms) {
  return {
    degrees: Math.trunc(dms?.degrees || 0),
    minutes: Math.trunc(dms?.minutes || 0),
    seconds: Math.trunc(dms?.seconds || 0),
  };
}

/** Total seconds of arc — the internal comparison currency. */
export function toArcSeconds(dms) {
  const { degrees, minutes, seconds } = coerce(dms);
  return degrees * 3600 + minutes * 60 + seconds;
}

/** Render a DMS object in the Rambam's symbol notation. */
export function formatSexagesimal(dms) {
  const { degrees, minutes, seconds } = coerce(dms);
  return `${degrees}° ${minutes}' ${seconds}"`;
}

/**
 * Add two DMS angles per KH 11:10.
 *
 * Returns `{ result, steps }` where `steps` narrates the carries in the
 * order the Rambam performs them: seconds, then minutes, then degrees.
 */
export function addSexagesimal(a, b) {
  const A = coerce(a);
  const B = coerce(b);
  const steps = [];

  let seconds = A.seconds + B.seconds;
  let carryToMinutes = 0;
  if (seconds >= 60) {
    carryToMinutes = Math.floor(seconds / 60);
    steps.push({
      label: 'Seconds',
      detail: `${A.seconds}" + ${B.seconds}" = ${seconds}". Sixty seconds make a minute, so carry ${carryToMinutes}' and keep ${seconds % 60}".`,
    });
    seconds %= 60;
  } else {
    steps.push({
      label: 'Seconds',
      detail: `${A.seconds}" + ${B.seconds}" = ${seconds}". Under sixty — nothing to carry.`,
    });
  }

  let minutes = A.minutes + B.minutes + carryToMinutes;
  let carryToDegrees = 0;
  if (minutes >= 60) {
    carryToDegrees = Math.floor(minutes / 60);
    steps.push({
      label: 'Minutes',
      detail: `${A.minutes}' + ${B.minutes}'${carryToMinutes ? ` + ${carryToMinutes}' carried` : ''} = ${minutes}'. Sixty minutes make a degree, so carry ${carryToDegrees}° and keep ${minutes % 60}'.`,
    });
    minutes %= 60;
  } else {
    steps.push({
      label: 'Minutes',
      detail: `${A.minutes}' + ${B.minutes}'${carryToMinutes ? ` + ${carryToMinutes}' carried` : ''} = ${minutes}'. Under sixty — nothing to carry.`,
    });
  }

  const rawDegrees = A.degrees + B.degrees + carryToDegrees;
  const degrees = ((rawDegrees % 360) + 360) % 360;
  if (rawDegrees >= 360) {
    steps.push({
      label: 'Degrees',
      detail: `${A.degrees}° + ${B.degrees}°${carryToDegrees ? ` + ${carryToDegrees}° carried` : ''} = ${rawDegrees}°. A full circle is 360°, so subtract it: ${degrees}°.`,
    });
  } else {
    steps.push({
      label: 'Degrees',
      detail: `${A.degrees}° + ${B.degrees}°${carryToDegrees ? ` + ${carryToDegrees}° carried` : ''} = ${degrees}°. Under a full circle — nothing to drop.`,
    });
  }

  return { result: { degrees, minutes, seconds }, steps };
}

/**
 * Subtract `b` from `a` per KH 11:11-12.
 *
 * When `b` exceeds `a` a full circle is added to `a` first — the
 * Rambam's explicit instruction, and the step most often skipped.
 * Returns `{ result, steps, addedCircle }`.
 */
export function subtractSexagesimal(a, b) {
  const A = coerce(a);
  const B = coerce(b);
  const steps = [];

  // KH 11:11 — the borrow-a-circle rule fires on the whole angle, not
  // on the degrees alone. 100°20' minus 100°50' still needs it.
  const addedCircle = toArcSeconds(B) > toArcSeconds(A);
  let degrees = A.degrees;
  if (addedCircle) {
    degrees += 360;
    steps.push({
      label: 'A full circle first',
      detail: `${formatSexagesimal(B)} is greater than ${formatSexagesimal(A)}, so add 360° to the first number before subtracting: ${degrees}° ${A.minutes}' ${A.seconds}".`,
    });
  }

  let minutes = A.minutes;
  let seconds = A.seconds;

  if (seconds < B.seconds) {
    minutes -= 1;
    seconds += 60;
    steps.push({
      label: 'Seconds',
      detail: `${B.seconds}" cannot be taken from ${A.seconds}", so convert one minute into sixty seconds: ${A.seconds} + 60 = ${seconds}". Then ${seconds} − ${B.seconds} = ${seconds - B.seconds}".`,
    });
  } else {
    steps.push({
      label: 'Seconds',
      detail: `${A.seconds}" − ${B.seconds}" = ${seconds - B.seconds}". No conversion needed.`,
    });
  }
  seconds -= B.seconds;

  if (minutes < B.minutes) {
    const before = minutes;
    degrees -= 1;
    minutes += 60;
    steps.push({
      label: 'Minutes',
      detail: `${B.minutes}' cannot be taken from ${before}', so convert one degree into sixty minutes: ${before} + 60 = ${minutes}'. Then ${minutes} − ${B.minutes} = ${minutes - B.minutes}'.`,
    });
  } else {
    steps.push({
      label: 'Minutes',
      detail: `${minutes}' − ${B.minutes}' = ${minutes - B.minutes}'.`,
    });
  }
  minutes -= B.minutes;

  steps.push({
    label: 'Degrees',
    detail: `${degrees}° − ${B.degrees}° = ${degrees - B.degrees}°.`,
  });
  degrees -= B.degrees;

  // A subtraction can still land outside [0,360) when the inputs
  // themselves were unnormalized; fold it back so the result is always
  // a real position on the circle.
  degrees = ((degrees % 360) + 360) % 360;

  return { result: { degrees, minutes, seconds }, steps, addedCircle };
}

/** Decimal degrees → DMS, truncated (the Rambam's tables are integral). */
export function decimalToSexagesimal(decimal) {
  const wrapped = ((decimal % 360) + 360) % 360;
  const totalSeconds = Math.round(wrapped * 3600) % TOTAL_SECONDS_IN_CIRCLE;
  return {
    degrees: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** DMS → decimal degrees. */
export function sexagesimalToDecimal(dms) {
  return toArcSeconds(dms) / 3600;
}
