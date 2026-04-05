/**
 * Astronomical constants from the Rambam's Hilchot Kiddush HaChodesh.
 * This is the single source of truth for all calculations and visualizations.
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
  // Epoch: 3 Nisan 4938 = April 3, 1177 CE
  // At this moment, both Sun and Moon mean longitudes = 0° (conjunction at 0° Aries)
  BASE_DATE: new Date(1177, 3, 3), // April 3, 1177 CE (month is 0-indexed)
  BASE_YEAR_HEBREW: 4938,

  // ═══════════════════════════════════════════════════════════════
  //  GALGALIM (Celestial Spheres) — Rambam's cosmological model
  // ═══════════════════════════════════════════════════════════════
  GALGALIM: [
    {
      id: 'daily',
      name: "גלגל היומי",
      englishName: "Daily Sphere (Ninth Sphere)",
      radius: 360,
      color: '#4466aa',
      description: "The outermost sphere that rotates once every 24 hours, causing all celestial bodies to appear to revolve around Earth.",
      reference: "Hilchot Yesodei HaTorah 3:1"
    },
    {
      id: 'constellations',
      name: "גלגל המזלות",
      englishName: "Sphere of Constellations (Eighth Sphere)",
      radius: 320,
      color: '#aaaa44',
      description: "Contains the fixed stars and the 12 zodiac constellations.",
      reference: "Kiddush HaChodesh 11:5"
    },
    {
      id: 'saturn',
      name: "גלגל שבתאי",
      englishName: "Saturn Sphere",
      radius: 280,
      color: '#887744',
      description: "Contains the planet Saturn (~30 year orbit)."
    },
    {
      id: 'jupiter',
      name: "גלגל צדק",
      englishName: "Jupiter Sphere",
      radius: 260,
      color: '#cc8844',
      description: "Contains the planet Jupiter (~12 year orbit)."
    },
    {
      id: 'mars',
      name: "גלגל מאדים",
      englishName: "Mars Sphere",
      radius: 240,
      color: '#cc4444',
      description: "Contains the planet Mars (~2 year orbit)."
    },
    {
      id: 'sun',
      name: "גלגל השמש",
      englishName: "Sun Sphere",
      radius: 220,
      color: '#ddaa33',
      description: "Contains the Sun (~365.25 day orbit).",
      reference: "Kiddush HaChodesh 12:1-2"
    },
    {
      id: 'venus',
      name: "גלגל נוגה",
      englishName: "Venus Sphere",
      radius: 180,
      color: '#dddd88',
      description: "Contains the planet Venus."
    },
    {
      id: 'mercury',
      name: "גלגל כוכב",
      englishName: "Mercury Sphere",
      radius: 140,
      color: '#aaaaaa',
      description: "Contains the planet Mercury."
    },
    {
      id: 'moon',
      name: "גלגל הירח",
      englishName: "Moon Sphere",
      radius: 100,
      color: '#8899bb',
      description: "The innermost sphere containing the Moon (~29.5 day synodic period).",
      reference: "Kiddush HaChodesh 14:1"
    }
  ],

  // ═══════════════════════════════════════════════════════════════
  //  SUN — Rambam KH chapters 12-13
  // ═══════════════════════════════════════════════════════════════
  SUN: {
    // 0° 59′ 8⅓″ per day — Rambam KH 12:1
    MEAN_MOTION_PER_DAY: { degrees: 0, minutes: 59, seconds: 8.333 },
    START_POSITION: { degrees: 0, minutes: 0, seconds: 0 },
    START_CONSTELLATION: 0, // Aries

    // Apogee (govah) — Rambam KH 12:1
    APOGEE_START: { degrees: 26, minutes: 45, seconds: 8 },
    APOGEE_CONSTELLATION: 2, // Gemini (= +60°)
    APOGEE_MOTION_PER_DAY: 1.5 / 3600, // 1.5 arcseconds per day

    // Eccentric and epicycle parameters for 3D visualization
    ECCENTRICITY: 0.0167,
    ECCENTRIC_ANGLE: 65.5,
    EPICYCLE: {
      RADIUS_RATIO: 0.0833,
      REVOLUTION_PERIOD: 365.25,
      INITIAL_ANGLE: 180,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  //  MOON — Rambam KH chapters 14-17
  // ═══════════════════════════════════════════════════════════════
  MOON: {
    // 13° 10′ 35″ 4⁄30 per day — Rambam KH 14:1
    MEAN_MOTION_PER_DAY: { degrees: 13, minutes: 10, seconds: 35.133 },
    START_POSITION: { degrees: 0, minutes: 0, seconds: 0 },
    START_CONSTELLATION: 1, // Taurus

    // Moon's maslul (anomaly) — Rambam KH 14:2
    // 13° 3′ 53⅓″ per day
    MASLUL_MEAN_MOTION: { degrees: 13, minutes: 3, seconds: 53.333 },
    MASLUL_START: { degrees: 84, minutes: 28, seconds: 42 },

    // Rambam: Sun and Moon in conjunction at epoch → Moon at 0°
    MEAN_LONGITUDE_AT_EPOCH: 0,

    // Galgalim parameters for 3D visualization
    GALGALIM: {
      DEFERENT: {
        RADIUS_RATIO: 1.0,
        REVOLUTION_PERIOD: 27.32166, // Sidereal month
      },
      FIRST_EPICYCLE: {
        RADIUS_RATIO: 0.0575,
        REVOLUTION_PERIOD: 13.6608,
      },
      SECOND_EPICYCLE: {
        RADIUS_RATIO: 0.038,
        REVOLUTION_PERIOD: 13.6608,
      },
      ECCENTRIC: {
        ECCENTRICITY: 0.0549,
        ANGLE: 83.3,
      },
      INCLINATION: 5.145,
      LATITUDE_CYCLE: 27.21222, // Draconic month
    },
  },

  // ═══════════════════════════════════════════════════════════════
  //  ZODIAC
  // ═══════════════════════════════════════════════════════════════
  CONSTELLATIONS: [
    "טלה", "שור", "תאומים", "סרטן", "��ריה", "בתולה",
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
  //  MASLUL CORRECTION TABLE — Rambam KH 13:4 (Sun) / 15:3 (Moon)
  //  Linear interpolation between these points.
  //  For maslul > 180°, use (360 - maslul) and subtract the correction.
  // ═══════════════════════════════════════════════════════════════
  MASLUL_CORRECTIONS: [
    { maslul: 0,   correction: 0 },
    { maslul: 10,  correction: 20 / 60 },
    { maslul: 20,  correction: 40 / 60 },
    { maslul: 30,  correction: 58 / 60 },
    { maslul: 40,  correction: 1 + 15 / 60 },
    { maslul: 50,  correction: 1 + 29 / 60 },
    { maslul: 60,  correction: 1 + 41 / 60 },
    { maslul: 70,  correction: 1 + 51 / 60 },
    { maslul: 80,  correction: 1 + 57 / 60 },
    { maslul: 90,  correction: 1 + 59 / 60 },
    { maslul: 100, correction: 1 + 58 / 60 },
    { maslul: 110, correction: 1 + 53 / 60 },
    { maslul: 120, correction: 1 + 45 / 60 },
    { maslul: 130, correction: 1 + 33 / 60 },
    { maslul: 140, correction: 1 + 19 / 60 },
    { maslul: 150, correction: 1 + 1 / 60 },
    { maslul: 160, correction: 42 / 60 },
    { maslul: 170, correction: 21 / 60 },
    { maslul: 180, correction: 0 },
  ],
};

// Node regression for lunar latitude — Rambam KH 16:1
export const NODE_REGRESSION_DEG_PER_DAY = -0.0529538;
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
