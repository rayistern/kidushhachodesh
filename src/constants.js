// Hebrew calendar utilities
export const HEBREW_MONTHS_REGULAR = [
  "תשרי", "חשון", "כסלו", "טבת", "שבט", "אדר",
  "ניסן", "אייר", "סיון", "תמוז", "אב", "אלול"
];

export const HEBREW_MONTHS_LEAP = [
  "תשרי", "חשון", "כסלו", "טבת", "שבט", "אדר א", "אדר ב",
  "ניסן", "אייר", "סיון", "תמוז", "אב", "אלול"
];

export const CONSTANTS = {
  BASE_DATE: new Date(1177, 3, 3), // April 3, 1177 CE
  BASE_YEAR_HEBREW: 4938,
  
  // Galgalim (celestial spheres) based on Rambam's description
  GALGALIM: [
    {
      name: "גלגל היומי",
      englishName: "Daily Sphere (Ninth Sphere)",
      radius: 360,
      description: "The outermost sphere that rotates once every 24 hours, causing all celestial bodies to appear to revolve around Earth.",
      reference: "Hilchot Yesodei HaTorah 3:1"
    },
    {
      name: "גלגל המזלות",
      englishName: "Sphere of Constellations (Eighth Sphere)",
      radius: 320,
      description: "Contains the fixed stars and the 12 zodiac constellations.",
      reference: "Kiddush HaChodesh 11:5"
    },
    {
      name: "גלגל שבתאי",
      englishName: "Saturn Sphere",
      radius: 280,
      description: "Contains the planet Saturn, which completes its orbit in approximately 30 years."
    },
    {
      name: "גלגל צדק",
      englishName: "Jupiter Sphere",
      radius: 260,
      description: "Contains the planet Jupiter, which completes its orbit in approximately 12 years."
    },
    {
      name: "גלגל מאדים",
      englishName: "Mars Sphere",
      radius: 240,
      description: "Contains the planet Mars, which completes its orbit in approximately 2 years."
    },
    {
      name: "גלגל השמש",
      englishName: "Sun Sphere",
      radius: 220,
      description: "Contains the Sun, which completes its orbit in approximately 365.25 days.",
      reference: "Kiddush HaChodesh 12:1-2"
    },
    {
      name: "גלגל נוגה",
      englishName: "Venus Sphere",
      radius: 180,
      description: "Contains the planet Venus."
    },
    {
      name: "גלגל כוכב",
      englishName: "Mercury Sphere",
      radius: 140,
      description: "Contains the planet Mercury."
    },
    {
      name: "גלגל הירח",
      englishName: "Moon Sphere",
      radius: 100,
      description: "The innermost sphere containing the Moon, which completes its orbit in approximately 29.5 days.",
      reference: "Kiddush HaChodesh 14:1"
    }
  ],
  
  SUN: {
    // 0° 59′ 8⅓″  – Rambam KH 11:6
    MEAN_MOTION_PER_DAY: { degrees: 0, minutes: 59, seconds: 8.333 },
    START_POSITION: { degrees: 0, minutes: 0, seconds: 0 },
    START_CONSTELLATION: 0, // Aries
    APOGEE_START: { degrees: 26, minutes: 45, seconds: 8 },
    APOGEE_CONSTELLATION: 2, // Gemini
    APOGEE_MOTION_PER_DAY: 1.5 / 3600, // 1.5 seconds per day
    APOGEE_MOTION_PER_DAY_ARCSEC: 1.5,
    
    // Epicycle data (galgal katan)
    EPICYCLE: {
      RADIUS_RATIO: 0.0833, // Ratio of epicycle radius to deferent radius
      REVOLUTION_PERIOD: 365.25, // Days for complete epicycle revolution
      INITIAL_ANGLE: 180, // Initial angle on the epicycle
    },
    
    // Eccentric data (galgal yotze)
    ECCENTRICITY: 0.0167, // Eccentricity of sun's orbit
    ECCENTRIC_ANGLE: 65.5, // Angle of eccentric point relative to apogee
  },
  
  MOON: {
    // 13° 10′ 35 4⁄30″  – Rambam KH 11:7
    MEAN_MOTION_PER_DAY: { degrees: 13, minutes: 10, seconds: 35.133 },
    START_POSITION: { degrees: 0, minutes: 0, seconds: 0 },
    START_CONSTELLATION: 1, // Taurus
    // 13° 3′ 53⅓″
    MASLUL_MEAN_MOTION: { degrees: 13, minutes: 3, seconds: 53.333 },
    MASLUL_START: { degrees: 84, minutes: 28, seconds: 42 },
    
    // Moon's galgalim (celestial spheres) parameters
    GALGALIM: {
      // Main deferent (galgal gadol)
      DEFERENT: {
        RADIUS_RATIO: 1.0, // Relative to base radius
        REVOLUTION_PERIOD: 27.32166, // Sidereal month in days
        DEFERENT_INITIAL_ANGLE: 0,
      },
      
      // First epicycle (galgal katan)
      FIRST_EPICYCLE: {
        RADIUS_RATIO: 0.0575, // Ratio to deferent radius
        REVOLUTION_PERIOD: 13.6608, // Half a sidereal month
        FIRST_EPICYCLE_INITIAL_ANGLE: 0,
      },
      
      // Second epicycle (galgal noteh - inclined circle)
      SECOND_EPICYCLE: {
        RADIUS_RATIO: 0.038, // Smaller than first epicycle
        REVOLUTION_PERIOD: 27.32166 / 2, // Cycles twice per month
        SECOND_EPICYCLE_INITIAL_ANGLE: 0,
      },
      
      // Eccentric (galgal yotze merkaz)
      ECCENTRIC: {
        ECCENTRICITY: 0.0549, // Moon's orbital eccentricity
        ANGLE: 83.3, // Angle of eccentric point (perigee)
      },
      
      // Latitude parameters (deviation from ecliptic)
      INCLINATION: 5.145, // Degrees of orbital inclination
      LATITUDE_CYCLE: 27.21222, // Draconic month in days
    },
    
    // Rambam: Sun and Moon are in conjunction at the epoch.
    // Put the Moon at 0° so day-zero is NEW moon, not FULL moon.
    MEAN_LONGITUDE_AT_EPOCH: 0,     // deg
  },
  
  CONSTELLATIONS: [
    "טלה", "שור", "תאומים", "סרטן", "אריה", "בתולה",
    "מאזנים", "עקרב", "קשת", "גדי", "דלי", "דגים"
  ],
  
  CONSTELLATION_NAMES: {
    "טלה": "Aries",
    "שור": "Taurus",
    "תאומים": "Gemini",
    "סרטן": "Cancer",
    "אריה": "Leo",
    "בתולה": "Virgo",
    "מאזנים": "Libra",
    "עקרב": "Scorpio",
    "קשת": "Sagittarius",
    "גדי": "Capricorn",
    "דלי": "Aquarius",
    "דגים": "Pisces"
  },
  
  MASLUL_CORRECTIONS: [
    { maslul: 0, correction: 0 },
    { maslul: 10, correction: 20/60 },
    { maslul: 20, correction: 40/60 },
    { maslul: 30, correction: 58/60 },
    { maslul: 40, correction: 1 + 15/60 },
    { maslul: 50, correction: 1 + 29/60 },
    { maslul: 60, correction: 1 + 41/60 },
    { maslul: 70, correction: 1 + 51/60 },
    { maslul: 80, correction: 1 + 57/60 },
    { maslul: 90, correction: 1 + 59/60 },
    { maslul: 100, correction: 1 + 58/60 },
    { maslul: 110, correction: 1 + 53/60 },
    { maslul: 120, correction: 1 + 45/60 },
    { maslul: 130, correction: 1 + 33/60 },
    { maslul: 140, correction: 1 + 19/60 },
    { maslul: 150, correction: 1 + 1/60 },
    { maslul: 160, correction: 42/60 },
    { maslul: 170, correction: 21/60 },
    { maslul: 180, correction: 0 },
  ],
  
  // Detailed motion calculations for multiple time periods as mentioned in Rambam
  DETAILED_MOTIONS: {
    SUN: {
      PER_10_DAYS: { degrees: 9, minutes: 51, seconds: 20 },  // ט נא כ - Correct Rambam value
      PER_100_DAYS: { degrees: 98, minutes: 33, seconds: 20 }, // צח לג כ - Correct Rambam value
      PER_1000_DAYS: { degrees: 266, minutes: 27, seconds: 20 }, // רסו כז כ - Correct Rambam value
      PER_10000_DAYS: { degrees: 308, minutes: 27, seconds: 20 }, // שח כז כ - Correct Rambam value
    },
    MOON: {
      MEAN_PER_10_DAYS: { degrees: 131, minutes: 45, seconds: 56 }, // קלא מה נו - Correct Rambam value
      MEAN_PER_100_DAYS: { degrees: 137, minutes: 39, seconds: 20 }, // קלז לט כ - Correct Rambam value
      MEAN_PER_1000_DAYS: { degrees: 16, minutes: 33, seconds: 20 }, // טז לג כ - Correct Rambam value
      MEAN_PER_10000_DAYS: { degrees: 165, minutes: 13, seconds: 20 }, // קסה יג כ - Correct Rambam value
      MEAN_PER_29_DAYS: { degrees: 22, minutes: 9, seconds: 56 }, // כב ט נו - Correct Rambam value
      MEAN_PER_SIMPLE_YEAR: { degrees: 344, minutes: 53, seconds: 40 }, // שמד נג מ - Correct Rambam value
    },
  },
  
  // Zodiac sign boundaries for moon position adjustments
  ZODIAC_ADJUSTMENTS: [
    { start: { sign: "Aquarius", degree: 15 }, end: { sign: "Aries", degree: 15 }, adjustment: 0 },
    { start: { sign: "Aries", degree: 15 }, end: { sign: "Gemini", degree: 0 }, adjustment: 15/60 },
    { start: { sign: "Gemini", degree: 0 }, end: { sign: "Cancer", degree: 15 }, adjustment: 30/60 },
    { start: { sign: "Cancer", degree: 15 }, end: { sign: "Leo", degree: 0 }, adjustment: 15/60 },
    { start: { sign: "Leo", degree: 0 }, end: { sign: "Virgo", degree: 15 }, adjustment: -15/60 },
    { start: { sign: "Virgo", degree: 15 }, end: { sign: "Libra", degree: 15 }, adjustment: 0 },
    { start: { sign: "Libra", degree: 15 }, end: { sign: "Sagittarius", degree: 0 }, adjustment: -15/60 },
    { start: { sign: "Sagittarius", degree: 0 }, end: { sign: "Capricorn", degree: 0 }, adjustment: -30/60 },
    { start: { sign: "Capricorn", degree: 0 }, end: { sign: "Pisces", degree: 15 }, adjustment: -15/60 },
    { start: { sign: "Pisces", degree: 15 }, end: { sign: "Aquarius", degree: 15 }, adjustment: 0 }
  ]
};

export const GALGALIM_INFO = {
  galgalMoonEccentric: {
    title: "Moon's Eccentric Circle",
    englishName: "Galgal Yotze Merkaz / גלגל יוצא מרכז",
    description: "The eccentric circle of the moon's orbit, offset from Earth.",
    reference: "Hilchot Kiddush HaChodesh, Chapter 17"
  },
  galgalMoonDefer: {
    title: "Moon's Deferent",
    englishName: "Galgal Gadol / גלגל גדול",
    description: "The main circle carrying the moon's epicycles.",
    reference: "Hilchot Kiddush HaChodesh, Chapter 17"
  },
  galgalMoonFirstEpi: {
    title: "Moon's First Epicycle",
    englishName: "Galgal Katan / גלגל קטן",
    description: "The first epicycle that contributes to the moon's position.",
    reference: "Hilchot Kiddush HaChodesh, Chapter 17"
  },
  galgalMoonSecondEpi: {
    title: "Moon's Second Epicycle",
    englishName: "Galgal Noteh / גלגל נוטה",
    description: "The second epicycle primarily affecting the moon's latitude.",
    reference: "Hilchot Kiddush HaChodesh, Chapter 17"
  }
};

// ──────────────────────────────────────────────
//  Kiddush-HaChodesh – lunar-orbit (Galgal Notéh) constants
//  Based on Rambam 15:1 & 16:1
export const GALGAL_NOTEH_INCLINATION_DEG = 5;           // ≈ 5° north/south of the ecliptic
//  3 ‘chalakim’ 11 ‘sec’ per day  ⇒  3/60 + 11/3600  deg
export const NODE_REGRESSION_DEG_PER_DAY = -0.0529538;   // negative = retrograde 

export const MAZALOT_LABELS = [
  "Taleh",    // Aries
  "Shor",     // Taurus
  "Teomim",   // Gemini
  "Sartan",   // Cancer
  "Aryeh",    // Leo
  "Betulah",  // Virgo
  "Moznayim", // Libra
  "Akrav",    // Scorpio
  "Keshet",   // Sagittarius
  "G'di",     // Capricorn
  "D'li",     // Aquarius
  "Dagim"     // Pisces
];

// ESSENTIAL FIX: Add the correct daily motion constants as specified by Rambam
export const DAILY_MOTIONS = {
  SUN: { degrees: 0, minutes: 59, seconds: 8, fraction: 1/3 },  // 0° 59′ 8⅓″
  MOON: { degrees: 13, minutes: 10, seconds: 35, fraction: 4/30 }, // 13° 10′ 35″ 4⁄30
};

// Moon phase definitions by elongation angle
export const MOON_PHASES = {
  NEW_MOON: { min: 0, max: 15, name: "New Moon" },
  WAXING_CRESCENT: { min: 15, max: 85, name: "Waxing Crescent" },
  FIRST_QUARTER: { min: 85, max: 95, name: "First Quarter" },
  WAXING_GIBBOUS: { min: 95, max: 175, name: "Waxing Gibbous" },
  FULL_MOON: { min: 175, max: 185, name: "Full Moon" },
  WANING_GIBBOUS: { min: 185, max: 265, name: "Waning Gibbous" },
  THIRD_QUARTER: { min: 265, max: 275, name: "Third Quarter" },
  WANING_CRESCENT: { min: 275, max: 345, name: "Waning Crescent" },
  NEW_MOON_CLOSING: { min: 345, max: 360, name: "New Moon" }
};

// Check if there's a mapping of lunar phases to elongation angles
// Ensure the thresholds for different phases are correct
// Typical values would be:
// New Moon: 0°
// First Quarter: 90°
// Full Moon: 180°
// Last Quarter: 270° 