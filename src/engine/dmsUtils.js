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
  const abs = Math.abs(decimal);
  const degrees = Math.floor(abs);
  const minRaw = (abs - degrees) * 60;
  const minutes = Math.floor(minRaw);
  const seconds = (minRaw - minutes) * 60;
  return {
    degrees: degrees * sign,
    minutes,
    seconds: Math.round(seconds * 1000) / 1000,
  };
}

/** Format decimal degrees as a DMS string like "123° 45′ 6.7″" */
export function formatDms(decimal) {
  const dms = decimalToDms(decimal);
  const sign = dms.degrees < 0 ? '-' : '';
  return `${sign}${Math.abs(dms.degrees)}° ${dms.minutes}′ ${dms.seconds.toFixed(1)}″`;
}

/** Normalize an angle to [0, 360) */
export function normalizeDegrees(deg) {
  return ((deg % 360) + 360) % 360;
}
