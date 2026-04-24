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
        // [R] KH 14:2 — moves 13° 3' 53.33" per day
        DAILY_MOTION: 13 + 3 / 60 + 53.333 / 3600,
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
  //  SEASON CORRECTION — [R] KH 14:5
  //  Adjusts the moon's mean longitude for the time difference between
  //  6:00 PM and actual sunset. The moon moves ~½° per hour, so if
  //  sunset is later (summer), the moon has moved further.
  // ═══════════════════════════════════════════════════════════════
  SEASON_CORRECTIONS: [
    // { sunFrom: degrees, sunTo: degrees, adjustment: chalakim }
    // Each range is defined by the sun's true longitude
    { sunFrom: 315, sunTo: 345, adjustment: 0 },       // Mid-Aquarius to mid-Aries: no adjustment
    { sunFrom: 345, sunTo: 360, adjustment: 15 / 60 }, // Mid-Aries to Aries end: +15'
    { sunFrom: 0,   sunTo: 30,  adjustment: 15 / 60 }, // Aries to Taurus: +15'
    { sunFrom: 30,  sunTo: 60,  adjustment: 15 / 60 }, // Taurus to start of Gemini: +15'
    { sunFrom: 60,  sunTo: 90,  adjustment: 30 / 60 }, // Start of Gemini to mid-Cancer: +30'
    { sunFrom: 90,  sunTo: 120, adjustment: 15 / 60 }, // Mid-Cancer to start of Leo: +15'
    { sunFrom: 120, sunTo: 150, adjustment: -15 / 60 }, // Start of Leo to mid-Virgo: -15'
    { sunFrom: 150, sunTo: 195, adjustment: 0 },        // Mid-Virgo to mid-Libra: no adjustment
    { sunFrom: 195, sunTo: 240, adjustment: -15 / 60 }, // Mid-Libra to start of Sagittarius: -15'
    { sunFrom: 240, sunTo: 270, adjustment: -30 / 60 }, // Start of Sagittarius to start of Capricorn: -30'
    { sunFrom: 270, sunTo: 315, adjustment: -15 / 60 }, // Start of Capricorn to mid-Aquarius: -15'
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
