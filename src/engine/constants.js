/**
 * Astronomical constants from the Rambam's Hilchot Kiddush HaChodesh.
 * This is the single source of truth for all calculations and visualizations.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** (KH 11-17)
 *  SURFACE CATEGORY: mostly Rambam-surface
 * ═══════════════════════════════════════════════════════════════════
 * Per docs/OPEN_QUESTIONS.md Q5: the correction tables in this file —
 *   - SUN_MASLUL_CORRECTIONS (KH 13:4)
 *   - MOON_MASLUL_CORRECTIONS (KH 15:4-6)
 *   - MOON_LATITUDE_TABLE (KH 16:9-10)
 *   - DOUBLE_ELONGATION_ADJUSTMENTS (KH 15:3)
 *   - SEASON_CORRECTIONS (KH 14:5)
 * are Rambam-PUBLISHED tables, verbatim. They are the end-user surface,
 * not internal intermediates. UI must present them as tables (which
 * CalculationChain.jsx already does via CorrectionTable), not hide
 * them inside a formula expression.
 *
 * Source key:
 *   [R] = Directly from the Rambam's text (chapter:halacha cited)
 *   [A] = Approximated / interpolated between Rambam's table entries
 *   [D] = Deduced from the model or from external sources (not explicit in the Rambam)
 *   [L] = From Rabbi Losh's teaching (colors, orientations, pedagogical framing)
 */

export const HEBREW_MONTHS_REGULAR = [
  "תשרי", "חשון", "כסלו", "טבת", "שבט", "אדר",
  "ניסן", "אייר", "סיון", "תמוז", "אב", "אלול"
];

export const HEBREW_MONTHS_LEAP = [
  "תשרי", "חשון", "כסלו", "טבת", "שבט", "אדר א", "אדר ב",
  "ניסן", "אייר", "סיון", "תמוז", "אב", "אלול"
];

export const CONSTANTS = {
  // [R] Epoch: 3 Nisan 4938 AM — KH 11:16 ("mi-techilat leil chamishi,
  // shlishi l'Nisan, 4938 l'yetzira"). Hebrew-native; do NOT convert to
  // a JS Date for day-count arithmetic — the Rambam's day counter is a
  // Hebrew-calendar day count, and any Gregorian/Julian round-trip is a
  // conversion bug waiting to happen (we lived it). Day-count is:
  //   HDate(input).abs() - HDate(3, 'Nisan', 4938).abs()
  EPOCH_HEBREW: { year: 4938, month: 'Nisan', day: 3 },
  BASE_YEAR_HEBREW: 4938,

  // [display-only] Proleptic Gregorian rendering of the epoch, for UI
  // that shows "epoch = March 30 1178 CE". NEVER subtract this from
  // another Date to get a day count — use EPOCH_HEBREW for that.
  BASE_DATE_DISPLAY: new Date(Date.UTC(1178, 2, 30)),

  // ═══════════════════════════════════════════════════════════════
  //  GALGALIM (Celestial Spheres) — Rambam's cosmological model
  //  [R] Structure from KH 11; [L] Colors from Rabbi Losh's props
  // ═══════════════════════════════════════════════════════════════
  GALGALIM: [
    {
      id: 'daily',
      name: "גלגל היומי",
      englishName: "Daily Sphere (Ninth Sphere)",
      radius: 360,
      color: '#4466aa',
      description: "The outermost sphere — rotates ~361°/day east-to-west, carrying all inner spheres with it.",
      reference: "Hilchot Yesodei HaTorah 3:1",
      source: 'rambam',
    },
    {
      id: 'constellations',
      name: "גלגל המזלות",
      englishName: "Sphere of Constellations (Eighth Sphere)",
      radius: 320,
      color: '#aaaa44',
      description: "Contains the fixed stars and the 12 zodiac constellations. The kav hamazalos (ecliptic belt) is tilted ~23.5° from the equator.",
      reference: "KH 11:5",
      source: 'rambam',
    },
    {
      id: 'saturn',
      name: "גלגל שבתאי",
      englishName: "Saturn Sphere",
      radius: 280,
      color: '#887744',
      description: "Contains the planet Saturn (~30 year orbit).",
      source: 'rambam',
    },
    {
      id: 'jupiter',
      name: "גלגל צדק",
      englishName: "Jupiter Sphere",
      radius: 260,
      color: '#cc8844',
      description: "Contains the planet Jupiter (~12 year orbit).",
      source: 'rambam',
    },
    {
      id: 'mars',
      name: "גלגל מאדים",
      englishName: "Mars Sphere",
      radius: 240,
      color: '#cc4444',
      description: "Contains the planet Mars (~2 year orbit).",
      source: 'rambam',
    },
    {
      id: 'sun',
      name: "גלגל השמש",
      englishName: "Sun Sphere",
      radius: 220,
      color: '#ddaa33',
      description: "Contains the Sun. Comprised of TWO sub-galgalim: the blue (outer, centered on Earth) and the red (inner, off-center — creating the govah).",
      reference: "KH 12:1-2",
      source: 'rambam',
      teachingNote: "Rabbi Losh: Blue = outer galgal (moves ~1°/70yr). Red = inner galgal (carries the sun, off-center). The offset between Earth's center and the red's center is what creates the emtzoi/amiti difference.",
    },
    {
      id: 'venus',
      name: "גלגל נוגה",
      englishName: "Venus Sphere",
      radius: 180,
      color: '#dddd88',
      description: "Contains the planet Venus.",
      source: 'rambam',
    },
    {
      id: 'mercury',
      name: "גלגל כוכב",
      englishName: "Mercury Sphere",
      radius: 140,
      color: '#aaaaaa',
      description: "Contains the planet Mercury.",
      source: 'rambam',
    },
    {
      id: 'moon',
      name: "גלגל הירח",
      englishName: "Moon Sphere",
      radius: 100,
      color: '#8899bb',
      description: "The innermost sphere containing the Moon. Comprised of FOUR sub-galgalim: red (domeh), blue (noteh), green (yoitzeh), and the galgal katan (small circle).",
      reference: "KH 14:1",
      source: 'rambam',
      teachingNote: "Rabbi Losh's colors: Red (domeh) = aligned with ecliptic. Blue (noteh) = tilted 5° off ecliptic. Green (yoitzeh) = off-center, has its own govah. Galgal katan = the small epicycle on which the moon actually sits.",
    }
  ],

  // ═══════════════════════════════════════════════════════════════
  //  SUN — Rambam KH chapters 12-13
  // ═══════════════════════════════════════════════════════════════
  SUN: {
    // [R] 0° 59' 8 1/3" per day — KH 12:1
    MEAN_MOTION_PER_DAY: { degrees: 0, minutes: 59, seconds: 8.333 },
    // [R] KH 12:2 — "7 degrees, 3 minutes, 32 seconds in the constellation
    // of Aries" at the epoch (beginning of Thursday night, 3 Nisan 4938).
    START_POSITION: { degrees: 7, minutes: 3, seconds: 32 },
    START_CONSTELLATION: 0, // Aries

    // [R] Apogee (govah) at epoch — KH 12:2
    APOGEE_START: { degrees: 26, minutes: 45, seconds: 8 },
    APOGEE_CONSTELLATION: 2, // Gemini (= +60°)
    // [R] KH 12:2 — "1.5 sheniot PER 10 DAYS" = 0.15"/day.
    // Prior code was 1.5"/day, 10× too fast. This matches the
    // Rambam's 100-day (15"), 1000-day (2'30"), 10000-day (25')
    // tables. Cross-check: 1°/~70 years (his "approximately")
    // = 1°/(70 × 365.25 days) ≈ 0.14"/day. Fix surfaced by user
    // report 2026-04-23 (their govah calc matched 0.15"/day rate).
    // See docs/OPEN_QUESTIONS.md Q7.
    APOGEE_MOTION_PER_DAY: 0.15 / 3600,

    // [D] 3D visualization parameters — deduced from the Rambam's correction table magnitudes
    ECCENTRICITY: 0.0167,
    ECCENTRIC_ANGLE: 65.5,
  },

  // ═══════════════════════════════════════════════════════════════
  //  MOON — Rambam KH chapters 14-17
  // ═══════════════════════════════════════════════════════════════
  MOON: {
    // [R] 13° 10' 35" per day — KH 14:1 (Rambam states this as 35 flat;
    // his 10-day table in KH 14:2 of 131°45'50" implies exactly this rate).
    // Prior code had 35.133", an undocumented deviation — see
    // docs/OPEN_QUESTIONS.md Q7 (2026-04-24 finding).
    MEAN_MOTION_PER_DAY: { degrees: 13, minutes: 10, seconds: 35 },
    START_POSITION: { degrees: 1, minutes: 14, seconds: 43 }, // [R] KH 14:4 — 1°14'43" in Taurus
    START_CONSTELLATION: 1, // Taurus

    // [R] Moon's maslul (anomaly) — KH 14:3
    // 13° 3' 54" per day (Sefaria text: "י"ג מַעֲלוֹת וּשְׁלֹשָׁה חֲלָקִים
    // וְנ"ד שְׁנִיּוֹת"). His 10-day table of 130°39'0" (KH 14:3) is
    // 13°3'54" × 10 exactly. Prior code had 53.333", an undocumented
    // deviation — see docs/OPEN_QUESTIONS.md Q7.
    MASLUL_MEAN_MOTION: { degrees: 13, minutes: 3, seconds: 54 },
    // [R] Maslul at epoch — KH 14:4: 84° 28' 42"
    MASLUL_START: { degrees: 84, minutes: 28, seconds: 42 },

    // [R] KH 14:4 — Mean longitude at epoch
    MEAN_LONGITUDE_AT_EPOCH: 1 + 14 / 60 + 43 / 3600, // 1°14'43" in Taurus = 31°14'43" absolute

    // [D] Galgalim parameters for 3D visualization
    GALGALIM: {
      // [L] Rabbi Losh's four galgalim of the moon
      RED_DOMEH: {
        description: "Outermost moon galgal — aligned with kav hamazalos (ecliptic)",
        // [R] Combined with blue, moves 11°12' per day mi'mizrach l'maarav — from class transcription
        DAILY_MOTION: -(11 + 12 / 60), // negative = eastward regression
        color: '#cc4444',
      },
      BLUE_NOTEH: {
        description: "Second moon galgal — tilted 5° off the ecliptic, creating rosh/zanav",
        // The blue is carried by the red; its own tilt creates the latitude
        INCLINATION: 5, // [R] KH 16:1 — 5° max latitude
        color: '#4488cc',
      },
      GREEN_YOITZEH: {
        description: "Third moon galgal — off-center (has its own govah), holds the galgal katan",
        // [R] Moves 24°23' per day mi'maarav l'mizrach — from class transcription
        DAILY_MOTION: 24 + 23 / 60,
        // [D] Eccentricity deduced from the max correction magnitude (~5°)
        ECCENTRICITY: 0.0549,
        color: '#44aa44',
      },
      GALGAL_KATAN: {
        description: "The small epicycle — moon sits on its edge, 5° radius",
        // [R] KH 14:3 — moves 13° 3' 54" per day (matches MOON.MASLUL_MEAN_MOTION)
        DAILY_MOTION: 13 + 3 / 60 + 54 / 3600,
        // [R] KH 15:9 — diameter is 10°, so radius is 5° (the Rambam writes 5°5' from our perspective)
        RADIUS_DEGREES: 5,
        color: '#dddd44',
      },
      LATITUDE_CYCLE: 27.21222, // [D] Draconic month — deduced, not explicit in the Rambam
    },
  },

  // [R] Ascending node (rosh) — KH 16:2
  NODE: {
    // [R] KH 16:2 — moves 3'11" per day backwards (achoranim)
    DAILY_MOTION: { degrees: 0, minutes: 3, seconds: 11 },
    // [R] KH 16:3 — position at epoch: 180° 57' 28" from Aries
    START_POSITION: { degrees: 180, minutes: 57, seconds: 28 },
  },

  // ═══════════════════════════════════════════════════════════════
  //  PERIOD-BLOCK TABLES — [R] KH 12:1, 12:2, 14:2, 14:3, 16:2
  // ═══════════════════════════════════════════════════════════════
  // The Rambam publishes per-period motion for 10, 100, 1000, 10000,
  // 29, and 354 days. Per docs/OPEN_QUESTIONS.md Q4, these are the
  // AUTHORITATIVE end-user surface — the student decomposes N days
  // into these blocks and sums, not `dailyMotion × N`.
  //
  // Each block is [degrees, minutes, seconds] as given in the text,
  // already reduced mod 360 where the Rambam gives "she'erit" (the
  // remainder after subtracting whole revolutions). Values are
  // verbatim from Sefaria Mishneh_Torah,_Sanctification_of_the_New_Month.
  //
  // Per Q7 (2026-04-24): some of these tables imply slightly different
  // daily rates (e.g. 1000-day / 1000 differs from 10-day / 10 by
  // sub-arcsecond). That is the Rambam's own rounding and we preserve
  // it. The student's arithmetic with these tables reproduces his
  // published examples exactly.

  // [R] KH 12:1 — Sun mean motion
  SUN_MEAN_PERIOD_BLOCKS: {
    p10:    { degrees: 9,   minutes: 51, seconds: 23 },
    p100:   { degrees: 98,  minutes: 33, seconds: 53 },
    p1000:  { degrees: 265, minutes: 38, seconds: 50 },
    p10000: { degrees: 136, minutes: 28, seconds: 20 },
    p29:    { degrees: 28,  minutes: 35, seconds: 1  },
    p354:   { degrees: 348, minutes: 55, seconds: 15 },
  },

  // [R] KH 12:2 — Sun apogee (govah) motion
  // Rambam gives "1.5 sheniot per 10 days" = 0°0'1.5".
  // Note his text says 4 sheniot "ve'od" ("and a bit more") for 29 days,
  // indicating fractional values are implicit. We preserve stated values.
  SUN_APOGEE_PERIOD_BLOCKS: {
    p10:    { degrees: 0, minutes: 0,  seconds: 1.5 },
    p100:   { degrees: 0, minutes: 0,  seconds: 15  },
    p1000:  { degrees: 0, minutes: 2,  seconds: 30  },
    p10000: { degrees: 0, minutes: 25, seconds: 0   },
    p29:    { degrees: 0, minutes: 0,  seconds: 4   },  // "4 sheniot ve'od"
    p354:   { degrees: 0, minutes: 0,  seconds: 53  },
  },

  // [R] KH 14:2 — Moon mean motion (emtza hayareach)
  MOON_MEAN_PERIOD_BLOCKS: {
    p10:    { degrees: 131, minutes: 45, seconds: 50 },
    p100:   { degrees: 237, minutes: 38, seconds: 23 },
    p1000:  { degrees: 216, minutes: 23, seconds: 50 },
    p10000: { degrees: 3,   minutes: 58, seconds: 20 },
    p29:    { degrees: 22,  minutes: 6,  seconds: 56 },
    p354:   { degrees: 344, minutes: 26, seconds: 43 },
  },

  // [R] KH 14:3 — Moon maslul (anomaly) motion
  // Note 14:3 omits the 354-day value; it's given in KH 14:4 as 305°0'13".
  MOON_MASLUL_PERIOD_BLOCKS: {
    p10:    { degrees: 130, minutes: 39, seconds: 0  },
    p100:   { degrees: 226, minutes: 29, seconds: 53 },
    p1000:  { degrees: 104, minutes: 58, seconds: 50 },
    p10000: { degrees: 329, minutes: 48, seconds: 20 },
    p29:    { degrees: 18,  minutes: 53, seconds: 4  },
    p354:   { degrees: 305, minutes: 0,  seconds: 13 },
  },

  // [R] KH 16:2 — Node (rosh) motion
  NODE_PERIOD_BLOCKS: {
    p10:    { degrees: 0,   minutes: 31, seconds: 47 },
    p100:   { degrees: 5,   minutes: 17, seconds: 43 },
    p1000:  { degrees: 52,  minutes: 57, seconds: 10 },
    p10000: { degrees: 169, minutes: 31, seconds: 40 },
    p29:    { degrees: 1,   minutes: 32, seconds: 9  },
    p354:   { degrees: 18,  minutes: 44, seconds: 42 },
  },

  // ═══════════════════════════════════════════════════════════════
  //  ZODIAC
  // ═══════════════════════════════════════════════════════════════
  CONSTELLATIONS: [
    "טלה", "שור", "תאומים", "סרטן", "אריה", "בתולה",
    "מאזנים", "עקרב", "קשת", "גדי", "דלי", "דגים"
  ],

  CONSTELLATION_NAMES_EN: [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ],

  CONSTELLATION_MAP: {
    "טלה": "Aries", "שור": "Taurus", "תאומים": "Gemini",
    "סרטן": "Cancer", "אריה": "Leo", "בתולה": "Virgo",
    "מאזנים": "Libra", "עקרב": "Scorpio", "קשת": "Sagittarius",
    "גדי": "Capricorn", "דלי": "Aquarius", "דגים": "Pisces"
  },

  // ═══════════════════════════════════════════════════════════════
  //  SUN MASLUL CORRECTION TABLE — [R] KH 13:4
  //  Linear interpolation between these points → marked [A]
  //  For maslul > 180°, use (360 - maslul) and ADD the correction.
  // ═══════════════════════════════════════════════════════════════
  SUN_MASLUL_CORRECTIONS: [
    { maslul: 0,   correction: 0 },
    { maslul: 10,  correction: 20 / 60 },          // 0° 20'
    { maslul: 20,  correction: 40 / 60 },          // 0° 40'
    { maslul: 30,  correction: 58 / 60 },          // 0° 58'
    { maslul: 40,  correction: 1 + 15 / 60 },     // 1° 15'
    { maslul: 50,  correction: 1 + 29 / 60 },     // 1° 29'
    { maslul: 60,  correction: 1 + 41 / 60 },     // 1° 41'
    { maslul: 70,  correction: 1 + 51 / 60 },     // 1° 51'
    { maslul: 80,  correction: 1 + 57 / 60 },     // 1° 57'
    { maslul: 90,  correction: 1 + 59 / 60 },     // 1° 59'
    { maslul: 100, correction: 1 + 58 / 60 },     // 1° 58'
    { maslul: 110, correction: 1 + 53 / 60 },     // 1° 53'
    { maslul: 120, correction: 1 + 45 / 60 },     // 1° 45'
    { maslul: 130, correction: 1 + 33 / 60 },     // 1° 33'
    { maslul: 140, correction: 1 + 19 / 60 },     // 1° 19'
    { maslul: 150, correction: 1 + 1 / 60 },      // 1° 01'
    { maslul: 160, correction: 42 / 60 },          // 0° 42'
    { maslul: 170, correction: 21 / 60 },          // 0° 21'
    { maslul: 180, correction: 0 },
  ],

  // Keep backward-compatible alias
  get MASLUL_CORRECTIONS() { return this.SUN_MASLUL_CORRECTIONS; },

  // ═══════════════════════════════════════════════════════════════
  //  MOON MASLUL CORRECTION TABLE — [R] KH 15:4-6
  //  This is the menaseh for the maslul hanachon (corrected course).
  //  DIFFERENT from the sun's table — peaks at ~5°5' near 90-100°.
  //  For maslul hanachon > 180°, subtract from 360° and ADD correction.
  // ═══════════════════════════════════════════════════════════════
  MOON_MASLUL_CORRECTIONS: [
    { maslul: 0,   correction: 0 },
    { maslul: 10,  correction: 52 / 60 },          // 0° 52'
    { maslul: 20,  correction: 1 + 43 / 60 },     // 1° 43'
    { maslul: 30,  correction: 2 + 30 / 60 },     // 2° 30'
    { maslul: 40,  correction: 3 + 13 / 60 },     // 3° 13'
    { maslul: 50,  correction: 3 + 44 / 60 },     // 3° 44'
    { maslul: 60,  correction: 4 + 16 / 60 },     // 4° 16'
    { maslul: 70,  correction: 4 + 41 / 60 },     // 4° 41'
    { maslul: 80,  correction: 5 + 0 / 60 },      // 5° 00'
    { maslul: 90,  correction: 5 + 5 / 60 },      // 5° 05'
    { maslul: 100, correction: 5 + 8 / 60 },      // 5° 08'
    { maslul: 110, correction: 4 + 59 / 60 },     // 4° 59'
    { maslul: 120, correction: 4 + 40 / 60 },     // 4° 40'
    { maslul: 130, correction: 4 + 11 / 60 },     // 4° 11'
    { maslul: 140, correction: 3 + 33 / 60 },     // 3° 33'
    { maslul: 150, correction: 2 + 48 / 60 },     // 2° 48'
    { maslul: 160, correction: 2 + 5 / 60 },      // 2° 05'
    { maslul: 170, correction: 59 / 60 },          // 0° 59'
    { maslul: 180, correction: 0 },
  ],

  // ═══════════════════════════════════════════════════════════════
  //  DOUBLE ELONGATION ADJUSTMENT — [R] KH 15:3
  //  The merchak kaful (double elongation) adjusts the emtza hamaslul
  //  to produce the maslul hanachon (corrected course).
  //  This accounts for the nekudah hanichaches (prosneusis point).
  // ═══════════════════════════════════════════════════════════════
  DOUBLE_ELONGATION_ADJUSTMENTS: [
    { minElongation: 0,  maxElongation: 5,   adjustment: 0 },
    { minElongation: 6,  maxElongation: 11,  adjustment: 1 },
    { minElongation: 12, maxElongation: 18,  adjustment: 2 },
    { minElongation: 19, maxElongation: 24,  adjustment: 3 },
    { minElongation: 25, maxElongation: 31,  adjustment: 4 },
    { minElongation: 32, maxElongation: 38,  adjustment: 5 },
    { minElongation: 39, maxElongation: 45,  adjustment: 6 },
    { minElongation: 46, maxElongation: 51,  adjustment: 7 },
    { minElongation: 52, maxElongation: 59,  adjustment: 8 },
    { minElongation: 60, maxElongation: 63,  adjustment: 9 },
    // Beyond 63°: the Rambam only specifies up to 63° because that is the
    // max merchak kaful for new-moon visibility calculations.
    // For general computation, we extrapolate:
    { minElongation: 64, maxElongation: 90,  adjustment: 9, source: 'approximated' },
    { minElongation: 91, maxElongation: 180, adjustment: 9, source: 'approximated' },
  ],

  // ═══════════════════════════════════════════════════════════════
  //  MOON LATITUDE TABLE — [R] KH 16:9-10
  //  Given the moon's angular distance from the ascending node (rosh),
  //  this table gives the latitude (rochav) north or south of the ecliptic.
  //  0-90° from rosh = northward; 90-180° = returning; 180-270° = southward; 270-360° = returning north.
  // ═══════════════════════════════════════════════════════════════
  MOON_LATITUDE_TABLE: [
    { distance: 0,   latitude: 0 },
    { distance: 10,  latitude: 52 / 60 },          // 0° 52'
    { distance: 20,  latitude: 1 + 43 / 60 },     // 1° 43'
    { distance: 30,  latitude: 2 + 30 / 60 },     // 2° 30'
    { distance: 40,  latitude: 3 + 13 / 60 },     // 3° 13'
    { distance: 50,  latitude: 3 + 44 / 60 },     // 3° 44'
    { distance: 60,  latitude: 4 + 16 / 60 },     // 4° 16'
    { distance: 70,  latitude: 4 + 41 / 60 },     // 4° 41'
    { distance: 80,  latitude: 5 + 0 / 60 },      // 5° 00'
    { distance: 90,  latitude: 5 + 0 / 60 },      // 5° 00'
  ],

  // ═══════════════════════════════════════════════════════════════
  //  VISIBILITY CHAIN — KH 17 — full Rambam procedure
  //  Source text quoted verbatim in docs/sources/KH_17_verbatim.md
  //  (Sefaria pull, 2026-05-03). Each table is keyed by the mazal
  //  (zodiacal sign / 30° band) of the relevant longitude as the
  //  Rambam states it. Tables are reproduced cell-for-cell — no
  //  smoothing, no closed-form fits — per docs/OPEN_QUESTIONS.md
  //  and the project's primary-source-fidelity discipline.
  // ═══════════════════════════════════════════════════════════════

  // ─── KH 17:5 — שינוי המראה לאורך (parallax in longitude) ───
  // Always SUBTRACTED from אורך ראשון. Keyed on the mazal (Aries=0,
  // Taurus=1, …, Pisces=11) containing the moon's true longitude.
  // Values in arc-minutes (חלקים).
  // Bracketed alternative readings in Sefaria preserved here as comments;
  // primary value uses the bracketed (corrected) reading where it appears.
  PARALLAX_LON_BY_MAZAL: [
    { mazalIdx: 0,  hebrew: 'טלה',     chalakim: 59 },         // Aries
    { mazalIdx: 1,  hebrew: 'שור',     chalakim: 60 },         // Taurus — "מַעֲלָה אַחַת" = 60'
    { mazalIdx: 2,  hebrew: 'תאומים',  chalakim: 58 },         // Gemini
    { mazalIdx: 3,  hebrew: 'סרטן',    chalakim: 52, variant: 43 }, // Cancer (Sefaria bracketed [נ"ב]; mss מ"ג)
    { mazalIdx: 4,  hebrew: 'אריה',    chalakim: 43 },         // Leo
    { mazalIdx: 5,  hebrew: 'בתולה',   chalakim: 37 },         // Virgo
    { mazalIdx: 6,  hebrew: 'מאזנים',  chalakim: 34 },         // Libra
    { mazalIdx: 7,  hebrew: 'עקרב',    chalakim: 34 },         // Scorpio
    { mazalIdx: 8,  hebrew: 'קשת',     chalakim: 36 },         // Sagittarius
    { mazalIdx: 9,  hebrew: 'גדי',     chalakim: 44 },         // Capricorn
    { mazalIdx: 10, hebrew: 'דלי',     chalakim: 53 },         // Aquarius
    { mazalIdx: 11, hebrew: 'דגים',    chalakim: 58 },         // Pisces
  ],

  // ─── KH 17:8 — שינוי המראה לרוחב (parallax in latitude) ───
  // Sign rule (KH 17:7): רוחב צפוני → SUBTRACT chalakim from רוחב ראשון;
  //                      רוחב דרומי → ADD chalakim to רוחב ראשון.
  // Result = רוחב שני. Values in arc-minutes (חלקים).
  PARALLAX_LAT_BY_MAZAL: [
    { mazalIdx: 0,  hebrew: 'טלה',     chalakim: 9  },
    { mazalIdx: 1,  hebrew: 'שור',     chalakim: 10 },
    { mazalIdx: 2,  hebrew: 'תאומים',  chalakim: 16 },
    { mazalIdx: 3,  hebrew: 'סרטן',    chalakim: 27 },
    { mazalIdx: 4,  hebrew: 'אריה',    chalakim: 38 },
    { mazalIdx: 5,  hebrew: 'בתולה',   chalakim: 44 },
    { mazalIdx: 6,  hebrew: 'מאזנים',  chalakim: 46 },
    { mazalIdx: 7,  hebrew: 'עקרב',    chalakim: 45 },
    { mazalIdx: 8,  hebrew: 'קשת',     chalakim: 44 },
    { mazalIdx: 9,  hebrew: 'גדי',     chalakim: 36 },
    { mazalIdx: 10, hebrew: 'דלי',     chalakim: 27, variant: 24 }, // Sefaria bracketed [כ"ז]; mss כ"ד
    { mazalIdx: 11, hebrew: 'דגים',    chalakim: 12 },
  ],

  // ─── KH 17:10 — מעגל הירח (galgal correction) ───
  // Take this fraction of רוחב שני. Keyed by absolute longitude bands;
  // the Rambam pairs symmetric ranges (Aries↔Libra, etc.). Bands are
  // closed-open: lon ∈ [from, to). Sign of result is determined by KH 17:11.
  // The "no נליזת מעגל" zero band straddles the solstices — if hit, the
  // chain skips the מעגל step (אורך שלישי = אורך שני).
  MOON_CIRCLE_FRACTIONS: [
    // [from°, to°)              fraction          source-phrase
    { from: 0,   to: 20,  fraction: 2/5,  phrase: 'שני חמישיותיו' }, // 0° טלה – 20°
    { from: 20,  to: 40,  fraction: 1/3,  phrase: 'שלישיתו' },     // 20° טלה – 10° שור
    { from: 40,  to: 50,  fraction: 1/4,  phrase: 'רביעיתו' },     // 10°-20° שור
    { from: 50,  to: 60,  fraction: 1/5,  phrase: 'חמישיתו' },     // 20°-30° שור
    { from: 60,  to: 70,  fraction: 1/6,  phrase: 'שתותו' },       // 0°-10° תאומים
    { from: 70,  to: 80,  fraction: 1/12, phrase: 'חצי שתותו' },   // 10°-20° תאומים
    { from: 80,  to: 85,  fraction: 1/24, phrase: 'רבע שתותו' },   // 20°-25° תאומים
    { from: 85,  to: 95,  fraction: 0,    phrase: 'אין נליזת מעגל' }, // 25° תאומים – 5° סרטן
    { from: 95,  to: 100, fraction: 1/24, phrase: 'רבע שתותו' },   // 5°-10° סרטן
    { from: 100, to: 110, fraction: 1/12, phrase: 'חצי שתותו' },   // 10°-20° סרטן
    { from: 110, to: 120, fraction: 1/6,  phrase: 'שתותו' },       // 20°-30° סרטן
    { from: 120, to: 130, fraction: 1/5,  phrase: 'חמישיתו' },     // 0°-10° אריה
    { from: 130, to: 140, fraction: 1/4,  phrase: 'רביעיתו' },     // 10°-20° אריה
    { from: 140, to: 160, fraction: 1/3,  phrase: 'שלישיתו' },     // 20° אריה – 10° בתולה
    { from: 160, to: 180, fraction: 2/5,  phrase: 'שני חמישיותיו' }, // 10°-30° בתולה
    // ─ symmetric Libra-half (180°-360°) repeats the pattern ─
    { from: 180, to: 200, fraction: 2/5,  phrase: 'שני חמישיותיו' }, // 0°-20° מאזנים
    { from: 200, to: 220, fraction: 1/3,  phrase: 'שלישיתו' },     // 20° מאזנים – 10° עקרב
    { from: 220, to: 230, fraction: 1/4,  phrase: 'רביעיתו' },     // 10°-20° עקרב
    { from: 230, to: 240, fraction: 1/5,  phrase: 'חמישיתו' },     // 20°-30° עקרב
    { from: 240, to: 250, fraction: 1/6,  phrase: 'שתותו' },       // 0°-10° קשת
    { from: 250, to: 260, fraction: 1/12, phrase: 'חצי שתותו' },   // 10°-20° קשת
    { from: 260, to: 265, fraction: 1/24, phrase: 'רבע שתותו' },   // 20°-25° קשת
    { from: 265, to: 275, fraction: 0,    phrase: 'אין נליזת מעגל' }, // 25° קשת – 5° גדי
    { from: 275, to: 280, fraction: 1/24, phrase: 'רבע שתותו' },   // 5°-10° גדי
    { from: 280, to: 290, fraction: 1/12, phrase: 'חצי שתותו' },   // 10°-20° גדי
    { from: 290, to: 300, fraction: 1/6,  phrase: 'שתותו' },       // 20°-30° גדי
    { from: 300, to: 310, fraction: 1/5,  phrase: 'חמישיתו' },     // 0°-10° דלי
    { from: 310, to: 320, fraction: 1/4,  phrase: 'רביעיתו' },     // 10°-20° דלי
    { from: 320, to: 340, fraction: 1/3,  phrase: 'שלישיתו' },     // 20° דלי – 10° דגים
    { from: 340, to: 360, fraction: 2/5,  phrase: 'שני חמישיותיו' }, // 10°-30° דגים
  ],

  // ─── KH 17:12 — מנת ארוכי וקצרי שקיעה (long/short setting correction) ───
  // Applied to אורך שלישי. Keyed by the mazal of אורך שלישי itself.
  // operation ∈ {'add','subtract','none'}; fraction is what to add/subtract.
  SETTING_TIME_BY_MAZAL: [
    { mazalIdx: 0,  hebrew: 'טלה',    operation: 'add',      fraction: 1/6, phrase: 'שתותו' },     // Aries
    { mazalIdx: 1,  hebrew: 'שור',    operation: 'add',      fraction: 1/5, phrase: 'חמישיתו' },   // Taurus
    { mazalIdx: 2,  hebrew: 'תאומים', operation: 'add',      fraction: 1/6, phrase: 'שתותו' },     // Gemini
    { mazalIdx: 3,  hebrew: 'סרטן',   operation: 'none',     fraction: 0,   phrase: 'תניח כמות שהוא' }, // Cancer
    { mazalIdx: 4,  hebrew: 'אריה',   operation: 'subtract', fraction: 1/5, phrase: 'חמישיתו' },   // Leo
    { mazalIdx: 5,  hebrew: 'בתולה',  operation: 'subtract', fraction: 1/3, phrase: 'שלישיתו' },   // Virgo
    { mazalIdx: 6,  hebrew: 'מאזנים', operation: 'subtract', fraction: 1/3, phrase: 'שלישיתו' },   // Libra
    { mazalIdx: 7,  hebrew: 'עקרב',   operation: 'subtract', fraction: 1/5, phrase: 'חמישיתו' },   // Scorpio
    { mazalIdx: 8,  hebrew: 'קשת',    operation: 'none',     fraction: 0,   phrase: 'תניח כמות שהוא' }, // Sagittarius
    { mazalIdx: 9,  hebrew: 'גדי',    operation: 'add',      fraction: 1/6, phrase: 'שתותו' },     // Capricorn
    { mazalIdx: 10, hebrew: 'דלי',    operation: 'add',      fraction: 1/5, phrase: 'חמישיתו' },   // Aquarius
    { mazalIdx: 11, hebrew: 'דגים',   operation: 'add',      fraction: 1/6, phrase: 'שתותו' },     // Pisces
  ],

  // ─── KH 17:13 — מנת גובה המדינה ───
  // Always 2/3 of רוחב ראשון. The Rambam fixes this for ארץ ישראל;
  // a future generalization could parameterize by latitude. Kept as a
  // single constant to match the source text.
  GEOGRAPHIC_HEIGHT_FRACTION_OF_ROCHAV_RISHON: 2 / 3,

  // ─── KH 17:15-21 — קיצי הראיה (visibility outcome thresholds) ───
  // After קשת הראיה is computed:
  //   ≤ 9°  → not visible (KH 17:15 — variant readings; we use "not visible")
  //   > 14° → certainly visible (KH 17:15)
  //   9° < קשת ≤ 14° → look up in KITZEI_HAREIYAH_TABLE below.
  // Each row: kashtUpTo = upper end (inclusive) of the קשת band;
  //           orechMin = the minimum אורך ראשון required for "ודאי יראה".
  KITZEI_HAREIYAH_TABLE: [
    { kashtFromExclusive: 9,  kashtUpTo: 10, orechMin: 13 }, // KH 17:17
    { kashtFromExclusive: 10, kashtUpTo: 11, orechMin: 12 }, // KH 17:18
    { kashtFromExclusive: 11, kashtUpTo: 12, orechMin: 11 }, // KH 17:19
    { kashtFromExclusive: 12, kashtUpTo: 13, orechMin: 10 }, // KH 17:20
    { kashtFromExclusive: 13, kashtUpTo: 14, orechMin:  9 }, // KH 17:21
  ],

  // ─── KH 17:3-4 — early-exit thresholds based on אורך ראשון alone ───
  // capricornGemini: moon true longitude ∈ [270, 360) ∪ [0, 90)  (Capricorn–Gemini half)
  // cancerSagittarius: moon true longitude ∈ [90, 270)            (Cancer–Sagittarius half)
  EARLY_EXIT_THRESHOLDS: {
    capricornGemini:   { invisibleMax: 9,  visibleMin: 15, source: 'KH 17:3' },
    cancerSagittarius: { invisibleMax: 10, visibleMin: 24, source: 'KH 17:4' },
  },

  // ═══════════════════════════════════════════════════════════════
  //  SEASON CORRECTION — [R] KH 14:5 (verbatim Sefaria text)
  //  Adjusts the moon's mean longitude for the time difference between
  //  6:00 PM and actual sunset (the actual reference time of the
  //  Rambam's calculation, per KH 14:6: "כשליש שעה אחר שקיעת החמה").
  //
  //  Source text quoted verbatim in docs/sources/KH_14_verbatim.md.
  //  Boundaries are stated in the Rambam by mazal halves (חצי X /
  //  תחילת X); their absolute-degree mappings:
  //    מחצי דגים = 345°   חצי טלה = 15°
  //    תחילת תאומים = 60° תחילת אריה = 120°
  //    חצי בתולה = 165°   חצי מאזנים = 195°
  //    תחילת קשת = 240°   תחילת דלי = 300°
  //    חצי דגים = 345°
  //
  //  HISTORY (2026-05-03): the prior table placed +30' at 60°-90°.
  //  That value was shipped from the original rebuild without source
  //  verification, despite its [R] tag (per feedback_r_tags memory:
  //  "[R] tags can hide undocumented drift; verify verbatim"). The
  //  Sefaria text shows +15' uniformly from 15° → 165° on the
  //  additive side, with NO +30' band. The asymmetric -30' band
  //  exists only on the subtractive side at 240°-300°. Switched to
  //  Sefaria's reading per the user's "true to source text" directive
  //  on 2026-05-03; resolves issue #19.
  // ═══════════════════════════════════════════════════════════════
  SEASON_CORRECTIONS: [
    // { sunFrom°, sunTo°, adjustment in degrees, sourcePhrase }
    { sunFrom: 345, sunTo: 360, adjustment: 0,      sourcePhrase: 'מחצי דגים עד חצי טלה (no change)' },
    { sunFrom: 0,   sunTo: 15,  adjustment: 0,      sourcePhrase: 'מחצי דגים עד חצי טלה (no change)' },
    { sunFrom: 15,  sunTo: 60,  adjustment: 15/60,  sourcePhrase: 'מחצי טלה עד תחילת תאומים (+15ʹ)' },
    { sunFrom: 60,  sunTo: 120, adjustment: 15/60,  sourcePhrase: 'מתחילת תאומים עד תחילת אריה (+15ʹ)' },
    { sunFrom: 120, sunTo: 165, adjustment: 15/60,  sourcePhrase: 'מתחילת אריה עד חצי בתולה (+15ʹ)' },
    { sunFrom: 165, sunTo: 195, adjustment: 0,      sourcePhrase: 'מחצי בתולה עד חצי מאזנים (no change)' },
    { sunFrom: 195, sunTo: 240, adjustment: -15/60, sourcePhrase: 'מחצי מאזנים עד תחילת קשת (-15ʹ)' },
    { sunFrom: 240, sunTo: 300, adjustment: -30/60, sourcePhrase: 'מתחילת קשת עד תחילת דלי (-30ʹ)' },
    { sunFrom: 300, sunTo: 345, adjustment: -15/60, sourcePhrase: 'מתחילת דלי עד חצי דגים (-15ʹ)' },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  ADDITIONAL EXPORTS
// ═══════════════════════════════════════════════════════════════

// [R] Node regression for lunar latitude — KH 16:2
export const NODE_REGRESSION_DEG_PER_DAY = -(3 / 60 + 11 / 3600); // -3'11"/day (backwards)

// [R] Galgal noteh inclination — KH 16:1
export const GALGAL_NOTEH_INCLINATION_DEG = 5;

// Moon phase definitions by elongation angle
export const MOON_PHASES = [
  { min: 0, max: 15, name: "New Moon", hebrewName: "מולד" },
  { min: 15, max: 85, name: "Waxing Crescent", hebrewName: "סהר הולך וגדל" },
  { min: 85, max: 95, name: "First Quarter", hebrewName: "רבע ראשון" },
  { min: 95, max: 175, name: "Waxing Gibbous", hebrewName: "גיבוס הולך וגדל" },
  { min: 175, max: 185, name: "Full Moon", hebrewName: "ירח מלא" },
  { min: 185, max: 265, name: "Waning Gibbous", hebrewName: "גיבוס הולך ופוחת" },
  { min: 265, max: 275, name: "Third Quarter", hebrewName: "רבע אחרון" },
  { min: 275, max: 345, name: "Waning Crescent", hebrewName: "סהר הולך ופוחת" },
  { min: 345, max: 360, name: "New Moon", hebrewName: "מולד" },
];

/**
 * Source type labels for the UI.
 * Each CalculationStep has a `source` field using one of these keys.
 */
export const SOURCE_TYPES = {
  rambam: {
    label: 'Rambam',
    hebrewLabel: 'רמב"ם',
    color: '#4ea1f7', // blue
    icon: 'R',
    description: 'Value directly specified in the Rambam\'s Hilchot Kiddush HaChodesh',
  },
  approximated: {
    label: 'Interpolated',
    hebrewLabel: 'קירוב',
    color: '#f7b84e', // amber
    icon: '~',
    description: 'Value interpolated between entries in the Rambam\'s table, or rounded per his instruction',
  },
  deduced: {
    label: 'Deduced',
    hebrewLabel: 'נלמד',
    color: '#b74ef7', // purple
    icon: 'D',
    description: 'Not explicitly in the Rambam — deduced from the model or borrowed from astronomical sources',
  },
  losh: {
    label: 'Rabbi Losh',
    hebrewLabel: 'הרב לוש',
    color: '#4ef7a1', // green
    icon: 'L',
    description: 'From Rabbi Yosef Losh\'s teaching tradition — colors, orientations, pedagogical framing',
  },
};
