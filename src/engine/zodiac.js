/**
 * Zodiac position of an ecliptic longitude — [R] KH 11:7-9.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical**
 *  SURFACE CATEGORY: internal lib
 * ═══════════════════════════════════════════════════════════════════
 *
 * KH 11:7: the sphere is 360°, divided into twelve constellations of
 * 30° each, counted from the start of Aries.
 *
 * KH 11:8-9 work two examples, and the phrasing of the first is the
 * subtle part. For 70° 30' 40" the Rambam says the star is in Gemini
 * "in the middle of the ELEVENTH degree" — not "at 10.5 degrees". Once
 * two full constellations (60°) are removed, 10°30'40" remain, and a
 * position 10.5° into a sign is inside the eleventh degree, the same
 * way that a child aged 10 is in their eleventh year. `degreesInto` is
 * the measured arc; `ordinalDegree` is the Rambam's ordinal. Confusing
 * the two is an off-by-one that reads as authoritative, so both are
 * returned and the UI labels each.
 *
 * This module lives inside `src/engine/` rather than `src/lib/` because
 * `pipeline.js` imports it, and the engine is *served as source* over
 * /engine/* to external consumers — so every module reachable from the
 * entrypoints has to resolve inside the engine directory. The
 * servedEngineGraph test enforces exactly that, and caught this file
 * when it was first written into src/lib/.
 */
import { CONSTANTS } from './constants.js';

export const SIGN_ARC = 30;

/** Sign glyphs, in the Rambam's order (KH 11:9), Aries first. */
export const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

/**
 * Locate a longitude in the zodiac.
 *
 * The `hebrew` / `english` / `positionInConstellation` keys are the
 * shape `engine/pipeline.js` consumes; the rest are for the teaching
 * surfaces.
 */
export function zodiacPosition(longitude) {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / SIGN_ARC) % 12;
  const degreesInto = normalized - index * SIGN_ARC;

  return {
    index,
    hebrew: CONSTANTS.CONSTELLATIONS[index],
    english: CONSTANTS.CONSTELLATION_NAMES_EN[index],
    symbol: SIGN_SYMBOLS[index],
    positionInConstellation: degreesInto,
    degreesInto,
    // The Rambam's ordinal: a position 10.5° into a sign lies within
    // the eleventh degree of that sign.
    ordinalDegree: Math.floor(degreesInto) + 1,
    normalized,
  };
}

/** Ordinal suffix for the Rambam's "in the Nth degree" phrasing. */
export function ordinalSuffix(n) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
