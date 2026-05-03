/**
 * Moon visibility calculations per Rambam Hilchot Kiddush HaChodesh,
 * chapter 17 — the full שבע חשבונות הראייה.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** (KH 17, downstream of KH 11-16)
 *  SURFACE CATEGORY: Rambam-surface (every step is a published halacha)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Source text (verbatim Hebrew, Sefaria 2026-05-03):
 *   docs/sources/KH_17_verbatim.md
 *
 * Pipeline (each ↔ a halacha cite):
 *
 *   KH 17:1   אורך ראשון            = moonTrueLon − sunTrueLon (mod 360)
 *   KH 17:2   רוחב ראשון            = signed moon latitude (north +/south −)
 *   KH 17:3-4 early-exit cuts       depend on which half of the ecliptic
 *                                   the moon sits in
 *   KH 17:5   שינוי המראה לאורך     SUBTRACTED → אורך שני
 *   KH 17:7-9 שינוי המראה לרוחב     צפוני SUBTRACT / דרומי ADD → רוחב שני
 *   KH 17:10  מעגל הירח             fraction of רוחב שני by lon band
 *   KH 17:11  signed combine        north+/south− on Capricorn-Gemini half;
 *                                   inverse on Cancer-Sagittarius half
 *                                   → אורך שלישי
 *   KH 17:12a מנת ארוכי וקצרי שקיעה add/subtract fraction of אורך שלישי
 *                                   → אורך רביעי
 *   KH 17:12b מנת גובה המדינה       2/3 × |רוחב ראשון|;
 *                                   צפוני ADD / דרומי SUBTRACT
 *                                   → קשת הראיה
 *   KH 17:15  cutoff thresholds     ≤9° not visible; >14° visible
 *   KH 17:16-21 קיצי הראיה          when 9° < קשת ≤ 14°: lookup against
 *                                   אורך ראשון
 *
 * Test fixture (Rambam's own worked example, KH 17:13-14, 17:22):
 *   2 Iyar of "this year" (the Rambam's example):
 *     sun  = 37°09', moon = 48°36', latitude = 3°53' South
 *     → אורך ראשון = 11°27', אורך שני = 10°27', רוחב שני = 4°03',
 *       מעגל = 1°01', אורך שלישי = 11°28', אורך רביעי = 13°46',
 *       מנת גובה המדינה = 2°35', קשת הראיה = 11°11'
 *     → קשת in 11-12 band, אורך ≥ 11° → ודאי יראה
 *
 * Tolerance note ("אֵין מְדַקְדְּקִין בִּשְׁנִיּוֹת" — KH 17:13):
 *   The Rambam himself rounds intermediate values to whole arc-minutes
 *   in his worked example (e.g. 1/4 × 4°03' = 1.0125° → "1°01'").
 *   Our implementation keeps full precision internally and reports
 *   formatted DMS at the surface, but tests compare to the Rambam's
 *   rounded values within ±1' (one חלק).
 */
import { CONSTANTS } from './constants.js';
import { normalizeDegrees, formatDms } from './dmsUtils.js';

// ─── Helpers ──────────────────────────────────────────────────────

/** Mazal index 0..11 from a longitude in [0, 360). */
function mazalIndex(longitude) {
  return Math.floor(normalizeDegrees(longitude) / 30) % 12;
}

/** Look up the מעגל הירח fraction for a given moon true longitude. */
function lookupMoonCircleFraction(moonTrueLon) {
  const lon = normalizeDegrees(moonTrueLon);
  for (const band of CONSTANTS.MOON_CIRCLE_FRACTIONS) {
    if (lon >= band.from && lon < band.to) return band;
  }
  // Defensive: should never hit — the table tiles [0, 360).
  return { from: 0, to: 360, fraction: 0, phrase: 'unmapped' };
}

/** True iff the moon's true longitude lies in the Capricorn–Gemini half
 *  (270° ≤ lon < 360° OR 0° ≤ lon < 90°). KH 17:3, 17:11. */
function inCapricornGeminiHalf(moonTrueLon) {
  const lon = normalizeDegrees(moonTrueLon);
  return lon >= 270 || lon < 90;
}

// ─── KH 17:1 — אורך ראשון ────────────────────────────────────────

/** Elongation — angular distance between moon and sun, mod 360.
 *  KH 17:1: "וְתִגְרַע מְקוֹם הַשֶּׁמֶשׁ הָאֲמִתִּי מִמְּקוֹם הַיָּרֵחַ הָאֲמִתִּי
 *  וְהַנִּשְׁאָר הוּא הַנִּקְרָא אֹרֶךְ רִאשׁוֹן." */
export function calculateElongation(moonTrueLon, sunTrueLon) {
  const result = normalizeDegrees(moonTrueLon - sunTrueLon);
  return {
    id: 'elongation',
    regime: 'astronomical',
    name: 'First Longitude (Elongation)',
    hebrewName: 'אורך ראשון',
    rambamRef: 'KH 17:1',
    source: 'rambam',
    inputs: {
      moonTrueLon: { value: moonTrueLon, label: 'Moon True Longitude', unit: '°', refId: 'moonTrueLongitude' },
      sunTrueLon: { value: sunTrueLon, label: 'Sun True Longitude', unit: '°', refId: 'sunTrueLongitude' },
    },
    formula: '(moonTrueLon − sunTrueLon + 360) mod 360',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

// ─── KH 17:5 — שינוי המראה לאורך → אורך שני ───────────────────────

/** Look up parallax-in-longitude correction (in arc-minutes) for the
 *  moon's mazal, then subtract from אורך ראשון. Returns אורך שני. */
export function calculateOrechSheni(orechRishon, moonTrueLon) {
  const idx = mazalIndex(moonTrueLon);
  const entry = CONSTANTS.PARALLAX_LON_BY_MAZAL[idx];
  const correctionDeg = entry.chalakim / 60;
  const result = orechRishon - correctionDeg;
  return {
    id: 'orechSheni',
    regime: 'astronomical',
    name: 'Second Longitude (after parallax in longitude)',
    hebrewName: 'אורך שני',
    rambamRef: 'KH 17:5',
    source: 'rambam',
    sourceNote: `Moon in מזל ${entry.hebrew} → subtract ${entry.chalakim}′ (KH 17:5 table).`,
    inputs: {
      orechRishon: { value: orechRishon, label: 'אורך ראשון', unit: '°', refId: 'elongation' },
      moonMazal: { value: entry.hebrew, label: 'Moon Mazal' },
      parallaxLonChalakim: { value: entry.chalakim, label: 'שינוי המראה לאורך', unit: 'חלקים' },
    },
    formula: 'orechRishon − (chalakim / 60)',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

// ─── KH 17:7-9 — שינוי המראה לרוחב → רוחב שני ────────────────────

/** Apply parallax-in-latitude. KH 17:7: צפוני subtract / דרומי add.
 *  Latitude convention here: positive = צפוני (north), negative = דרומי (south).
 *  Returns רוחב שני (signed; sign tracks the same north/south convention). */
export function calculateRochavSheni(rochavRishon, moonTrueLon) {
  const idx = mazalIndex(moonTrueLon);
  const entry = CONSTANTS.PARALLAX_LAT_BY_MAZAL[idx];
  const correctionDeg = entry.chalakim / 60;
  // KH 17:7: north → subtract, south → add.
  const result = rochavRishon >= 0
    ? rochavRishon - correctionDeg
    : rochavRishon - correctionDeg; // for south: |rochav| + correction, then re-sign as south
  // Express in signed form: north positive, south negative — both reduce magnitude
  // when correction goes the same way; but Rambam: north reduces magnitude,
  // south INCREASES magnitude. Compute by magnitude + sign:
  const magnitude = rochavRishon >= 0
    ? Math.max(0, rochavRishon - correctionDeg)
    : -(Math.abs(rochavRishon) + correctionDeg);
  const direction = magnitude >= 0 ? 'צפוני' : 'דרומי';
  return {
    id: 'rochavSheni',
    regime: 'astronomical',
    name: 'Second Latitude (after parallax in latitude)',
    hebrewName: 'רוחב שני',
    rambamRef: 'KH 17:7-9',
    source: 'rambam',
    sourceNote: `Moon in מזל ${entry.hebrew} → ${rochavRishon >= 0 ? 'subtract' : 'add'} ${entry.chalakim}′ (KH 17:7-8).`,
    inputs: {
      rochavRishon: { value: rochavRishon, label: 'רוחב ראשון', unit: '°', refId: 'moonLatitude' },
      moonMazal: { value: entry.hebrew, label: 'Moon Mazal' },
      parallaxLatChalakim: { value: entry.chalakim, label: 'שינוי המראה לרוחב', unit: 'חלקים' },
      direction: { value: rochavRishon >= 0 ? 'צפוני' : 'דרומי', label: 'Latitude direction' },
    },
    formula: rochavRishon >= 0
      ? '|rochavRishon| − (chalakim/60), sign preserved'
      : '−(|rochavRishon| + chalakim/60)',
    result: magnitude,
    formatted: `${formatDms(Math.abs(magnitude))} ${direction}`,
    unit: 'degrees',
    direction,
  };
}

// ─── KH 17:10-11 — מעגל הירח → אורך שלישי ────────────────────────

/** Apply the מעגל הירח correction.
 *  KH 17:10: take fraction of |רוחב שני| by moon's longitude band.
 *  KH 17:11: signed combine —
 *    Capricorn-Gemini half: north → subtract from אורך שני, south → add
 *    Cancer-Sagittarius half: inverted (north → add, south → subtract)
 *  If fraction = 0 (no נליזת מעגל), אורך שלישי = אורך שני exactly.
 */
export function calculateOrechShlishi(orechSheni, rochavSheni, moonTrueLon) {
  const band = lookupMoonCircleFraction(moonTrueLon);
  const maagalMagnitude = band.fraction * Math.abs(rochavSheni);
  const isNorth = rochavSheni >= 0;
  const inCapGemHalf = inCapricornGeminiHalf(moonTrueLon);
  // KH 17:11 sign rule:
  //   capGemHalf:    north → subtract, south → add
  //   cancerSagHalf: north → add,      south → subtract
  let signedDelta;
  if (band.fraction === 0) {
    signedDelta = 0;
  } else if (inCapGemHalf) {
    signedDelta = isNorth ? -maagalMagnitude : +maagalMagnitude;
  } else {
    signedDelta = isNorth ? +maagalMagnitude : -maagalMagnitude;
  }
  const result = orechSheni + signedDelta;
  return {
    id: 'orechShlishi',
    regime: 'astronomical',
    name: 'Third Longitude (after מעגל הירח)',
    hebrewName: 'אורך שלישי',
    rambamRef: 'KH 17:10-11',
    source: 'rambam',
    sourceNote: band.fraction === 0
      ? `Moon in [${band.from}°, ${band.to}°): אֵין נְלִיזַת מַעְגָּל → אורך שלישי = אורך שני (KH 17:11 closing).`
      : `Moon in [${band.from}°, ${band.to}°): take ${band.phrase} of |רוחב שני|; ${inCapGemHalf ? 'גדי-תאומים half' : 'סרטן-קשת half'}, רוחב ${isNorth ? 'צפוני' : 'דרומי'} → ${signedDelta >= 0 ? 'add' : 'subtract'}.`,
    inputs: {
      orechSheni: { value: orechSheni, label: 'אורך שני', unit: '°', refId: 'orechSheni' },
      rochavSheni: { value: rochavSheni, label: 'רוחב שני', unit: '°', refId: 'rochavSheni' },
      moonTrueLon: { value: moonTrueLon, label: 'Moon True Longitude', unit: '°', refId: 'moonTrueLongitude' },
      fraction: { value: band.fraction, label: 'fraction of רוחב שני (Rambam phrase)' },
      maagalHaYareach: { value: maagalMagnitude, label: 'מעגל הירח magnitude', unit: '°' },
    },
    formula: 'orechSheni + signedMaagal (sign per KH 17:11)',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
    maagalMagnitude,
    maagalPhrase: band.phrase,
  };
}

// ─── KH 17:12a — אורך רביעי ───────────────────────────────────────

/** Apply the מנת ארוכי וקצרי שקיעה (long/short setting correction)
 *  to אורך שלישי. Keyed on the moon's mazal — Rambam's wording
 *  "האורך הזה במזל שור" in the worked example (KH 17:14) refers
 *  to the moon's actual position, not to אורך שלישי-as-an-arc
 *  (which is an elongation and has no zodiacal location). The
 *  worked example fixes the reading: moon at Taurus 18°36' → +1/5,
 *  which only matches if the table is keyed on the moon. */
export function calculateOrechRevii(orechShlishi, moonTrueLon) {
  const idx = mazalIndex(moonTrueLon);
  const entry = CONSTANTS.SETTING_TIME_BY_MAZAL[idx];
  const delta = entry.fraction * orechShlishi;
  let result;
  let phrase;
  if (entry.operation === 'add') {
    result = orechShlishi + delta;
    phrase = `add ${entry.phrase} (${(entry.fraction).toFixed(4)})`;
  } else if (entry.operation === 'subtract') {
    result = orechShlishi - delta;
    phrase = `subtract ${entry.phrase}`;
  } else {
    result = orechShlishi;
    phrase = 'leave unchanged';
  }
  return {
    id: 'orechRevii',
    regime: 'astronomical',
    name: 'Fourth Longitude (after long/short setting correction)',
    hebrewName: 'אורך רביעי',
    rambamRef: 'KH 17:12',
    source: 'rambam',
    sourceNote: `Moon in מזל ${entry.hebrew}: ${phrase} of אורך שלישי.`,
    inputs: {
      orechShlishi: { value: orechShlishi, label: 'אורך שלישי', unit: '°', refId: 'orechShlishi' },
      moonMazal: { value: entry.hebrew, label: 'Moon mazal' },
      operation: { value: entry.operation, label: 'Operation' },
      fraction: { value: entry.fraction, label: 'Fraction (Rambam phrase: ' + entry.phrase + ')' },
    },
    formula: entry.operation === 'none'
      ? 'orechShlishi (unchanged)'
      : `orechShlishi ${entry.operation === 'add' ? '+' : '−'} ${entry.phrase} × orechShlishi`,
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

// ─── KH 17:12b — מנת גובה המדינה ───────────────────────────────────

/** "תיקח שני שלישיו לעולם" — always 2/3 of |רוחב ראשון|.
 *  Direction (KH 17:12 closing): north → ADD to אורך רביעי,
 *  south → SUBTRACT from אורך רביעי. */
export function calculateMnatGovahHaMedinah(rochavRishon) {
  const fraction = CONSTANTS.GEOGRAPHIC_HEIGHT_FRACTION_OF_ROCHAV_RISHON;
  const magnitude = fraction * Math.abs(rochavRishon);
  return {
    id: 'mnatGovahHaMedinah',
    regime: 'astronomical',
    name: 'Country-Elevation Portion',
    hebrewName: 'מנת גובה המדינה',
    rambamRef: 'KH 17:12-14',
    source: 'rambam',
    sourceNote: 'Always 2/3 of |רוחב ראשון|; Rambam fixes this for ארץ ישראל ("שני שלישיו לעולם").',
    inputs: {
      rochavRishon: { value: rochavRishon, label: 'רוחב ראשון', unit: '°', refId: 'moonLatitude' },
      fraction: { value: fraction, label: 'Fraction (always 2/3)' },
    },
    formula: '(2/3) × |רוחב ראשון|',
    result: magnitude,
    formatted: formatDms(magnitude),
    unit: 'degrees',
  };
}

// ─── KH 17:12c — קשת הראיה ────────────────────────────────────────

/** Combine אורך רביעי and מנת גובה המדינה, signed by latitude direction.
 *  north → add; south → subtract. Result = קשת הראיה. */
export function calculateKeshetHaReiyah(orechRevii, mnatGovahHaMedinah, rochavRishon) {
  const isNorth = rochavRishon >= 0;
  const result = isNorth
    ? orechRevii + mnatGovahHaMedinah
    : orechRevii - mnatGovahHaMedinah;
  return {
    id: 'keshetHaReiyah',
    regime: 'astronomical',
    name: 'Arc of Vision',
    hebrewName: 'קשת הראיה',
    rambamRef: 'KH 17:12 (final), 17:15',
    source: 'rambam',
    sourceNote: `רוחב ${isNorth ? 'צפוני' : 'דרומי'} → ${isNorth ? 'ADD' : 'SUBTRACT'} מנת גובה המדינה ${isNorth ? 'to' : 'from'} אורך רביעי.`,
    inputs: {
      orechRevii: { value: orechRevii, label: 'אורך רביעי', unit: '°', refId: 'orechRevii' },
      mnatGovahHaMedinah: { value: mnatGovahHaMedinah, label: 'מנת גובה המדינה', unit: '°', refId: 'mnatGovahHaMedinah' },
      rochavRishon: { value: rochavRishon, label: 'רוחב ראשון', unit: '°', refId: 'moonLatitude' },
      direction: { value: isNorth ? 'צפוני' : 'דרומי', label: 'Latitude direction' },
    },
    formula: isNorth ? 'orechRevii + mnatGovahHaMedinah' : 'orechRevii − mnatGovahHaMedinah',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

// ─── KH 17:3-4, 17:15-21 — visibility verdict ─────────────────────

/** Final verdict combining the early-exit cuts (KH 17:3-4) and
 *  the קשת/קיצי הראיה comparison (KH 17:15-21).
 *
 *  Returns a CalculationStep whose `result` is one of:
 *    - 'visible'         : ודאי יראה
 *    - 'not-visible'     : ודאי לא יראה
 *    - 'possibly'        : (only when 17:15 says ≤9° and the early-exit didn't fire;
 *                           preserved here for completeness — see KH 17:15 note)
 *  Plus a `path` describing which halacha decided.
 */
export function determineVisibility({
  orechRishon, keshetHaReiyah, moonTrueLon,
}) {
  const half = inCapricornGeminiHalf(moonTrueLon)
    ? CONSTANTS.EARLY_EXIT_THRESHOLDS.capricornGemini
    : CONSTANTS.EARLY_EXIT_THRESHOLDS.cancerSagittarius;

  // Early-exit (KH 17:3-4) — purely on אורך ראשון.
  let path, verdict;
  if (orechRishon <= half.invisibleMax) {
    verdict = 'not-visible';
    path = `Early exit (${half.source}): אורך ראשון = ${orechRishon.toFixed(3)}° ≤ ${half.invisibleMax}° → אינו נראה.`;
  } else if (orechRishon > half.visibleMin) {
    verdict = 'visible';
    path = `Early exit (${half.source}): אורך ראשון = ${orechRishon.toFixed(3)}° > ${half.visibleMin}° → ודאי יראה.`;
  } else {
    // Run the קשת הראיה / קיצי הראיה procedure (KH 17:15-21).
    if (keshetHaReiyah <= 9) {
      verdict = 'not-visible';
      path = `KH 17:15: קשת הראיה ${keshetHaReiyah.toFixed(3)}° ≤ 9° → אינו נראה.`;
    } else if (keshetHaReiyah > 14) {
      verdict = 'visible';
      path = `KH 17:15: קשת הראיה ${keshetHaReiyah.toFixed(3)}° > 14° → ודאי יראה.`;
    } else {
      // 9 < קשת ≤ 14 → קיצי הראיה table.
      const row = CONSTANTS.KITZEI_HAREIYAH_TABLE.find(r =>
        keshetHaReiyah > r.kashtFromExclusive && keshetHaReiyah <= r.kashtUpTo
      );
      // Top-band edge case — Rambam's text "או יתר על י"ד" wraps the >14
      // case into the 13-14 row's threshold; the 17:15 cutoff already
      // catches >14, so `row` is always defined for 9 < kashet ≤ 14.
      if (row && orechRishon >= row.orechMin) {
        verdict = 'visible';
        path = `קיצי הראיה (KH 17:${17 + (row.kashtUpTo - 10)}): קשת ∈ (${row.kashtFromExclusive}°, ${row.kashtUpTo}°] AND אורך ראשון ${orechRishon.toFixed(3)}° ≥ ${row.orechMin}° → ודאי יראה.`;
      } else {
        verdict = 'not-visible';
        path = `קיצי הראיה (KH 17:${17 + (row.kashtUpTo - 10)}): קשת ∈ (${row.kashtFromExclusive}°, ${row.kashtUpTo}°] requires אורך ≥ ${row.orechMin}°; got ${orechRishon.toFixed(3)}° → אינו נראה.`;
      }
    }
  }

  return {
    id: 'moonVisibility',
    regime: 'astronomical',
    name: 'Moon Visibility Verdict',
    hebrewName: 'ראיית הירח',
    rambamRef: 'KH 17:3-4, 17:15-21',
    source: 'rambam',
    sourceNote: path,
    inputs: {
      orechRishon: { value: orechRishon, label: 'אורך ראשון', unit: '°', refId: 'elongation' },
      keshetHaReiyah: { value: keshetHaReiyah, label: 'קשת הראיה', unit: '°', refId: 'keshetHaReiyah' },
      moonTrueLon: { value: moonTrueLon, label: 'Moon True Longitude', unit: '°', refId: 'moonTrueLongitude' },
      half: { value: inCapricornGeminiHalf(moonTrueLon) ? 'גדי-תאומים' : 'סרטן-קשת', label: 'Ecliptic half' },
    },
    formula: 'KH 17:3-4 early exit, else קשת ≤9°/>14° gates, else KH 17:16-21 table',
    result: verdict === 'visible',
    verdict,
    path,
    unit: 'boolean',
  };
}

// ─── Seasonal info (unchanged from prior version) ─────────────────

/** Seasonal info — basic calculation, used by the UI but NOT by the
 *  visibility chain. Kept here to avoid splitting the file. */
export function calculateSeasonalInfo(daysFromBase) {
  const solarYear = 365.25;
  const seasonLen = solarYear / 4;
  const yearPos = (((daysFromBase % solarYear) + solarYear) % solarYear) / solarYear;
  const dayInYear = Math.floor(((daysFromBase % solarYear) + solarYear) % solarYear);
  const seasonIdx = Math.floor(yearPos * 4);
  const seasonArr = ['Spring (אביב)', 'Summer (קיץ)', 'Fall (סתיו)', 'Winter (חורף)'];
  return {
    id: 'seasonalInfo',
    regime: 'astronomical',
    name: 'Season',
    hebrewName: 'תקופה',
    rambamRef: 'KH 9:3',
    result: {
      currentSeason: seasonArr[seasonIdx] || seasonArr[0],
      daysUntilNextSeason: Math.ceil(seasonLen - (dayInYear % seasonLen)),
    },
    unit: '',
  };
}

// ─── DEPRECATED — kept for one release for backward compatibility ─

/** First visibility angle. DEPRECATED: this was the heuristic
 *  (elongation + 0.3·|lat|) used before the full KH 17 chain was
 *  implemented. Retained as a no-op accessor so existing callers
 *  don't crash; will be removed once VisibilityHorizon.jsx and any
 *  other surface migrate to `calculateKeshetHaReiyah`. */
export function calculateFirstVisibilityAngle(elongation, latitude) {
  const result = elongation + 0.3 * Math.abs(latitude);
  return {
    id: 'firstVisibilityAngle',
    regime: 'astronomical',
    name: 'First Visibility Angle (DEPRECATED heuristic)',
    hebrewName: 'זווית הראייה הראשונה (היוריסטיקה ישנה)',
    rambamRef: '— (heuristic; see KH 17:12 for the canonical קשת הראיה)',
    source: 'deduced',
    sourceNote: 'DEPRECATED: superseded by the full KH 17 chain. Do not use as a visibility input.',
    inputs: {
      elongation: { value: elongation, label: 'Elongation', unit: '°', refId: 'elongation' },
      latitude: { value: latitude, label: 'Moon Latitude', unit: '°', refId: 'moonLatitude' },
    },
    formula: 'elongation + 0.3 × |latitude|  (heuristic, NOT in Rambam)',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}
