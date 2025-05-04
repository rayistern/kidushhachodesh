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
    MEAN_MOTION_PER_DAY: { degrees: 0, minutes: 59, seconds: 8 },
    START_POSITION: { degrees: 7, minutes: 3, seconds: 32 },
    START_CONSTELLATION: 0, // Aries
    APOGEE_START: { degrees: 26, minutes: 45, seconds: 8 },
    APOGEE_CONSTELLATION: 2, // Gemini
    APOGEE_MOTION_PER_DAY: 1.5 / 3600, // 1.5 seconds per day
    
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
    MEAN_MOTION_PER_DAY: { degrees: 13, minutes: 10, seconds: 35 },
    START_POSITION: { degrees: 1, minutes: 14, seconds: 43 },
    START_CONSTELLATION: 1, // Taurus
    MASLUL_MEAN_MOTION: { degrees: 13, minutes: 3, seconds: 54 },
    MASLUL_START: { degrees: 84, minutes: 28, seconds: 42 },
    
    // Moon's galgalim (celestial spheres) parameters
    GALGALIM: {
      // Main deferent (galgal gadol)
      DEFERENT: {
        RADIUS_RATIO: 1.0, // Relative to base radius
        REVOLUTION_PERIOD: 27.32166, // Sidereal month in days
      },
      
      // First epicycle (galgal katan)
      FIRST_EPICYCLE: {
        RADIUS_RATIO: 0.0575, // Ratio to deferent radius
        REVOLUTION_PERIOD: 13.6608, // Half a sidereal month
        INITIAL_ANGLE: 180,
      },
      
      // Second epicycle (galgal noteh - inclined circle)
      SECOND_EPICYCLE: {
        RADIUS_RATIO: 0.038, // Smaller than first epicycle
        REVOLUTION_PERIOD: 27.32166 / 2, // Cycles twice per month
        INITIAL_ANGLE: 90, // Perpendicular to first epicycle initially
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
      PER_10_DAYS: { degrees: 9, minutes: 54, seconds: 7 },  // ט נד ז
      PER_100_DAYS: { degrees: 98, minutes: 41, seconds: 10 }, // צח מא י
      PER_1000_DAYS: { degrees: 266, minutes: 50, seconds: 40 }, // רסו נ מ
      PER_10000_DAYS: { degrees: 308, minutes: 27, seconds: 20 }, // שח כז כ
    },
    MOON: {
      MEAN_PER_10_DAYS: { degrees: 130, minutes: 36, seconds: 20 }, // קל לו כ
      MEAN_PER_100_DAYS: { degrees: 1306, minutes: 3, seconds: 20 }, // אשו ג כ
      MEAN_PER_1000_DAYS: { degrees: 1048, minutes: 58, seconds: 50 }, // אמח נח נ
      MEAN_PER_10000_DAYS: { degrees: 389, minutes: 48, seconds: 20 }, // שפט מח כ
      MEAN_PER_29_DAYS: { degrees: 18, minutes: 33, seconds: 40 }, // יח לג מ
      MEAN_PER_SIMPLE_YEAR: { degrees: 358, minutes: 38, seconds: 20 }, // שנח לח כ
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