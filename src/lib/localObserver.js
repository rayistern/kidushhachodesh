/**
 * Where the observer actually stands, and when the sun actually sets there.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **modern** — real-world reference, NOT the Rambam
 *  SURFACE CATEGORY: internal lib (comparison only)
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file exists to make a verdict concrete: a clock time to go
 * outside, at the place the reader lives. It is deliberately kept out of
 * `src/engine/` — the engine is the Rambam's method and takes no
 * observer beyond the one he specifies.
 *
 * ── What his method assumes, and what it does not ──
 * KH 11:17 anchors the whole calculation to Jerusalem and "the region
 * within six or seven days' journey of it", which he puts at about 32°
 * north. KH 14:6 asks for the moon's position about a third of an hour
 * after sunset. Neither statement carries a longitude, a clock, or an
 * elevation, because none of those existed as usable inputs — so the
 * method cannot be asked for a local time, and this file does not
 * pretend to derive one from it. It computes real sunset for a real
 * place, and leaves the verdict entirely to the engine.
 *
 * ── The honest limit ──
 * There is no lunar ephemeris in this project, by design. So nothing
 * here is an independent prediction of visibility: it cannot tell you
 * when the moon sets, which is the constraint that actually decides a
 * marginal sighting. What it gives is *when and where to look*, next to
 * the Rambam's own answer about *whether* to expect anything.
 *
 * Sunset uses NOAA's low-accuracy algorithm — good to about a minute,
 * which is far finer than the elevation and refraction uncertainties
 * sitting on top of it.
 */

const DEG = Math.PI / 180;

/**
 * Karmiel, as a default observer.
 *
 * Coordinates from Wikipedia (32°54'49"N 35°17'46"E). Published
 * elevations for the city vary between about 293 m and 330 m — it is
 * built across hills, so there is no single right answer, and the figure
 * matters here only through the horizon dip below. Every field is meant
 * to be editable by the reader.
 */
export const KARMIEL = {
  name: 'Karmiel',
  latitude: 32.9136,
  longitude: 35.2961,
  elevationM: 330,
};

/**
 * The Rambam's own reference, for the comparison column.
 *
 * The latitude is his stated figure (KH 11:17), not the modern surveyed
 * one — comparing his method against a number he did not claim would be
 * testing the wrong thing. The longitude is included only to convert to
 * a clock and is modern; he gives none.
 */
export const RAMBAM_REFERENCE = {
  name: 'Jerusalem, as KH 11:17 puts it',
  latitude: 32,
  longitude: 35.23,
  elevationM: 0,
  note: 'His stated "about 32° north". He gives no longitude and no elevation.',
};

/**
 * How much further past the geometric horizon you can see from a height.
 *
 * The standard dip approximation, 1.76 arcminutes times the square root
 * of the height in metres. This is why KH 18:1's remark about watchers
 * on mountains is a real effect and not a figure of speech: 330 m buys
 * about half a degree, which is more than the whole margin on the
 * borderline nights.
 */
export function horizonDipDegrees(elevationM) {
  if (!elevationM || elevationM <= 0) return 0;
  return (1.76 * Math.sqrt(elevationM)) / 60;
}

/** NOAA's declination and equation of time for a day of the year. */
function solarTerms(dayOfYear) {
  const g = ((2 * Math.PI) / 365) * (dayOfYear - 1);
  const declination =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  const equationOfTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g));
  return { declination, equationOfTime };
}

/** Day of the year, 1-366, for a local date. */
export function dayOfYear(date) {
  const start = Date.UTC(date.getFullYear(), 0, 1);
  const here = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((here - start) / 86400000) + 1;
}

/**
 * Sunset in UTC hours for a place, allowing for its height.
 *
 * Returns null where the sun does not set that day — impossible at these
 * latitudes, but the guard keeps a NaN from reaching the screen if this
 * is ever reused further north.
 */
export function sunsetUtcHours(date, observer) {
  const { latitude, longitude, elevationM } = observer;
  const { declination, equationOfTime } = solarTerms(dayOfYear(date));
  // 90.833° is the sun's semidiameter plus mean refraction; the dip adds
  // the extra depression a raised observer gains.
  const zenith = (90.833 + horizonDipDegrees(elevationM)) * DEG;
  const lat = latitude * DEG;

  const cosHourAngle =
    (Math.cos(zenith) - Math.sin(lat) * Math.sin(declination)) /
    (Math.cos(lat) * Math.cos(declination));
  if (cosHourAngle < -1 || cosHourAngle > 1) return null;
  const hourAngle = Math.acos(cosHourAngle) / DEG;

  // Local solar time, then shifted to UTC by longitude (east positive).
  return 12 + hourAngle / 15 - equationOfTime / 60 - longitude / 15;
}

/**
 * Israel's UTC offset on a given date: +2 in winter, +3 on daylight time.
 *
 * Israeli daylight time runs from the Friday before the last Sunday of
 * March to the last Sunday of October. Computed rather than looked up,
 * so it stays right without a tz database — but it is a legal rule, not
 * an astronomical one, and has been amended before now.
 */
export function israelUtcOffsetHours(date) {
  const year = date.getFullYear();
  const lastSunday = (month) => {
    // month is 0-based; day 0 of the next month is the last of this one.
    const last = new Date(year, month + 1, 0);
    return new Date(year, month, last.getDate() - last.getDay());
  };
  const marchLastSunday = lastSunday(2);
  // The Friday before it.
  const start = new Date(year, 2, marchLastSunday.getDate() - 2);
  const end = lastSunday(9);
  const d = new Date(year, date.getMonth(), date.getDate());
  return d >= start && d < end ? 3 : 2;
}

/** Format hours-since-midnight as HH:MM. */
export function formatClock(hours) {
  if (hours == null || Number.isNaN(hours)) return '—';
  let h = ((hours % 24) + 24) % 24;
  let m = Math.round((h - Math.floor(h)) * 60);
  let hh = Math.floor(h);
  if (m === 60) {
    m = 0;
    hh = (hh + 1) % 24;
  }
  return `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * KH 14:6's observation moment, made concrete.
 *
 * He asks for the moon's position "about a third of an hour after the
 * setting of the sun". A third of an hour is twenty minutes, and the
 * looseness is his — "כשליש שעה", about a third — so this returns a
 * window rather than an instant.
 */
export const THIRD_OF_AN_HOUR_MINUTES = 20;

/**
 * The base layer: his reference, his moment.
 *
 * Sunset at the Jerusalem of KH 11:17 — his stated 32° north, at ground
 * level, because he specifies no elevation — and the observation moment
 * a third of an hour later per KH 14:6. This is the answer his method
 * actually gives, and it is computed and displayed on its own before any
 * local adjustment touches it.
 */
export function rambamWindow(date) {
  const utc = sunsetUtcHours(date, RAMBAM_REFERENCE);
  if (utc == null) return null;
  const offset = israelUtcOffsetHours(date);
  const sunset = utc + offset;
  return {
    place: RAMBAM_REFERENCE.name,
    utcOffset: offset,
    sunset,
    /** KH 14:6 — "about a third of an hour after the setting of the sun". */
    reference: sunset + THIRD_OF_AN_HOUR_MINUTES / 60,
  };
}

/**
 * The offsets layer: what changes for an observer somewhere else.
 *
 * Returned as *adjustments to* the base rather than a replacement for
 * it, which is the point. Each field is a difference, so a surface can
 * show the Rambam's figure and then what to add to it — never quietly
 * substitute one for the other.
 *
 * `dipMinutes` is separated out from `sunsetShiftMinutes` because the two
 * have completely different standing: the first is a real effect on a
 * real observer that KH 18:1 explicitly discusses, and the second is a
 * geographic correction he never contemplated.
 */
export function localOffsets(date, observer) {
  const base = sunsetUtcHours(date, RAMBAM_REFERENCE);
  const atSeaLevel = sunsetUtcHours(date, { ...observer, elevationM: 0 });
  const withHeight = sunsetUtcHours(date, observer);
  if (base == null || atSeaLevel == null || withHeight == null) return null;

  const offset = israelUtcOffsetHours(date);
  return {
    place: observer.name,
    utcOffset: offset,
    /** Sunset shift from position alone — latitude and longitude. */
    sunsetShiftMinutes: (atSeaLevel - base) * 60,
    /** Extra minutes of sun bought by standing higher up. */
    dipMinutes: (withHeight - atSeaLevel) * 60,
    dipDegrees: horizonDipDegrees(observer.elevationM),
    latitudeDelta: observer.latitude - RAMBAM_REFERENCE.latitude,
    longitudeDelta: observer.longitude - RAMBAM_REFERENCE.longitude,
    /** The two layers combined, as clock times, for the practical line. */
    sunset: withHeight + offset,
    reference: withHeight + offset + THIRD_OF_AN_HOUR_MINUTES / 60,
    /** A span to actually be outside for. A thin crescent shows best
        while the sky is still bright, so this opens at sunset. */
    lookFrom: withHeight + offset,
    lookUntil: withHeight + offset + 45 / 60,
  };
}
