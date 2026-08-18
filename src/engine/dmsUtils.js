/**
 * Degree-Minute-Second utilities for astronomical calculations.
 * The Rambam expresses all angular measurements in DMS format.
 */

/** Convert a {degrees, minutes, seconds} object to decimal degrees */
export function dmsToDecimal(dms) {
  const d = dms.degrees || 0;
  const m = dms.minutes || 0;
  const s = dms.seconds || 0;
  return d + m / 60 + s / 3600;
}

/** Convert decimal degrees to a {degrees, minutes, seconds} object */
export function decimalToDms(decimal) {
  const sign = decimal < 0 ? -1 : 1;
  // Round to the returned precision FIRST — thousandths of an arcsecond —
  // and only then split into degrees/minutes/seconds, exactly as formatDms
  // does. Rounding the seconds after the split could return
  // {degrees: 38, minutes: 17, seconds: 60} for a value a hair under
  // 38°18′ — the same carry bug formatDms had, and this function is a
  // served engine export external consumers format from.
  let thousandths = Math.round(Math.abs(decimal) * 3600 * 1000);
  const degrees = Math.floor(thousandths / 3600000);
  thousandths -= degrees * 3600000;
  const minutes = Math.floor(thousandths / 60000);
  thousandths -= minutes * 60000;
  return {
    degrees: degrees * sign,
    minutes,
    seconds: thousandths / 1000,
  };
}

/** Format decimal degrees as a DMS string like "123° 45′ 6.7″" */
export function formatDms(decimal) {
  const sign = decimal < 0 ? '-' : '';
  // Round to the displayed precision FIRST — tenths of an arcsecond —
  // and only then split into degrees/minutes/seconds. Rounding the
  // seconds after the split let 38.3° print as "38° 17′ 60.0″": the
  // float sat a hair under 38°18′, its seconds rounded up to 60 at one
  // decimal, and nothing carried.
  let tenths = Math.round(Math.abs(decimal) * 36000);
  const degrees = Math.floor(tenths / 36000);
  tenths -= degrees * 36000;
  const minutes = Math.floor(tenths / 600);
  tenths -= minutes * 600;
  return `${sign}${degrees}° ${minutes}′ ${(tenths / 10).toFixed(1)}″`;
}

/** Normalize an angle to [0, 360) */
export function normalizeDegrees(deg) {
  return ((deg % 360) + 360) % 360;
}
