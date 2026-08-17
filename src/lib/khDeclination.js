/**
 * KH 19's tilt-from-the-equator table.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** — [R] KH 19:7-9
 *  SURFACE CATEGORY: internal lib (teaching aid)
 * ═══════════════════════════════════════════════════════════════════
 *
 * This lives in `src/lib/` rather than `src/engine/` because the engine
 * implements KH 11-17 and nothing else. Chapter 19 answers a different
 * question — which way the crescent pointed, and how high it stood —
 * and the Rambam says himself that it has no bearing on the verdict. So
 * the engine has no step for it, and adding one would widen a
 * deliberately bounded surface.
 *
 * ── The table ──
 * KH 19:7 gives how far a point on the sun's road lies from the
 * equator, every ten degrees from the start of Taleh. Modern astronomy
 * calls this the *declination*; he does not name it, describing it as
 * how much a degree "is inclined" from the equator.
 *
 * KH 19:8 interpolates between rows, and KH 19:9 folds the circle in
 * four, explicitly by reference to the moon's-latitude method of
 * chapter 16 — the same fold, for the same reason: the quantity rises
 * and falls twice around the circle.
 *
 * ── On its accuracy ──
 * He opens the chapter warning that his statements here "will not be
 * exact, because this knowledge is of no consequence regarding the
 * actual sighting". The table is nonetheless correct to within about a
 * fifth of a degree of arcsin(sin ε · sin λ) at every row — pinned in
 * khDeclination.test.js. The one table he apologises for is the most
 * accurate one in the book.
 */

/** [R] KH 19:7 — degrees along the sun's road → degrees from the equator. */
export const DECLINATION_TABLE = [
  { longitude: 0, tilt: 0 },
  { longitude: 10, tilt: 4 },
  { longitude: 20, tilt: 8 },
  { longitude: 30, tilt: 11.5 },
  { longitude: 40, tilt: 15 },
  { longitude: 50, tilt: 18 },
  { longitude: 60, tilt: 20 },
  { longitude: 70, tilt: 22 },
  { longitude: 80, tilt: 23 },
  { longitude: 90, tilt: 23.5 },
];

/** The greatest tilt, at the start of Sartan and of G'di (KH 19:4, 19:6). */
export const MAX_TILT = 23.5;

/**
 * KH 19:9's four-way fold — which rule applies, and where it lands.
 *
 * Identical in shape to the moon's-latitude fold of KH 16:13-18, which
 * he points at explicitly. North for the first half of the circle,
 * south for the second.
 */
export function foldForDeclination(longitude) {
  const n = ((longitude % 360) + 360) % 360;
  if (n <= 90) return { folded: n, north: true, rule: 'as it stands', ref: 'KH 19:7' };
  if (n <= 180) return { folded: 180 - n, north: true, rule: `180° − ${n}°`, ref: 'KH 19:9' };
  if (n <= 270) return { folded: n - 180, north: false, rule: `${n}° − 180°`, ref: 'KH 19:9' };
  return { folded: 360 - n, north: false, rule: `360° − ${n}°`, ref: 'KH 19:9' };
}

/**
 * How far from the equator a point on the sun's road lies, signed:
 * positive north, negative south.
 */
export function declinationAt(longitude) {
  const { folded, north } = foldForDeclination(longitude);
  const table = DECLINATION_TABLE;

  let value = 0;
  for (let i = 0; i < table.length - 1; i++) {
    const lo = table[i];
    const hi = table[i + 1];
    if (folded >= lo.longitude && folded <= hi.longitude) {
      // KH 19:8 — "take an average between the two figures", the same
      // proportional sharing-out used for the sun and the moon.
      const t = (folded - lo.longitude) / (hi.longitude - lo.longitude);
      value = lo.tilt + t * (hi.tilt - lo.tilt);
      break;
    }
  }
  return north ? value : -value;
}

/**
 * KH 19:10 — the moon's own distance from the equator: the tilt of the
 * degree it stands on, combined with its height off the sun's road.
 *
 * Same direction, add. Opposite directions, subtract the smaller from
 * the larger and keep the larger's direction. Both arguments are signed
 * north-positive, which makes that one addition — but the halacha is
 * phrased as two cases and the returned `sameDirection` flag lets a
 * teaching surface show which one applied.
 */
export function moonFromEquator(moonLongitude, moonLatitude) {
  const tilt = declinationAt(moonLongitude);
  return {
    tilt,
    latitude: moonLatitude,
    sameDirection: Math.sign(tilt) === Math.sign(moonLatitude),
    result: tilt + moonLatitude,
  };
}

/**
 * KH 19:12-14 — where the moon appears and which way its horns point.
 *
 * The band of two to three degrees either side of the equator is his
 * ("on the equator or within two or three degrees"), which is why this
 * returns a `dueWest` case rather than treating zero as a knife edge.
 */
export function crescentDirection(fromEquator) {
  if (Math.abs(fromEquator) <= 3) {
    return { appears: 'due west', horns: 'due east', ref: 'KH 19:12' };
  }
  if (fromEquator > 0) {
    return { appears: 'north-west', horns: 'south-east', ref: 'KH 19:13' };
  }
  return { appears: 'south-west', horns: 'north-east', ref: 'KH 19:14' };
}
