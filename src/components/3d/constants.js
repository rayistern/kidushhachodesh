// 3D Digital Props System - Constants
// Based on Rambam's Hilchot Kiddush HaChodesh

// Earth Constants
export const EARTH = {
  RADIUS: 2,
  TILT_DEGREES: 23.5,
  ATMOSPHERE_RADIUS: 2.1,
  ROTATION_SPEED: 0.001, // Visual only
};

// Color Palette - Digital Props
export const COLORS = {
  // Earth
  EARTH_BASE: '#1a4d8c',
  EARTH_EMISSIVE: '#0a1a3a',
  ATMOSPHERE: '#4a90d9',
  
  // Sun System
  SUN_GALGAL: '#FFA500',
  SUN_EPICYCLE: '#FFD700',
  SUN_MARKER: '#FFAA00',
  SUN_GLOW: '#FFDD44',
  
  // Moon System
  MOON_GALGAL: '#8080FF',
  MOON_EPICYCLE_1: '#C0C0FF',
  MOON_EPICYCLE_2: '#FF8080',
  MOON_MARKER: '#DDDDDD',
  MOON_GLOW: '#FFFFFF',
  
  // Zodiac
  ZODIAC_RING: '#FFFFFF',
  ZODIAC_WIREFRAME: '#666666',
  
  // Background
  STARFIELD: '#FFFFFF',
  BACKGROUND_GRADIENT_START: '#1a1a2e',
  BACKGROUND_GRADIENT_END: '#0a0a0a',
};

// Galgalim (Celestial Spheres) Dimensions
export const GALGALIM = {
  SUN: {
    DEFERENT: {
      RADIUS: 15,
      OPACITY: 0.08,
      SEGMENTS: 64,
      LABEL_HE: 'גלגל השמש',
      LABEL_EN: "Sun's Deferent",
    },
    EPICYCLE: {
      RADIUS_RATIO: 0.0833,
      TUBE_RADIUS: 0.15,
      REVOLUTION_PERIOD: 365.25,
    },
  },
  
  MOON: {
    DEFERENT: {
      RADIUS: 10,
      OPACITY: 0.08,
      SEGMENTS: 64,
      LABEL_HE: 'גלגל הירח',
      LABEL_EN: "Moon's Deferent",
    },
    FIRST_EPICYCLE: {
      RADIUS_RATIO: 0.0575,
      TUBE_RADIUS: 0.12,
      REVOLUTION_PERIOD: 13.6608,
      LABEL_HE: 'גלגל קטן',
      LABEL_EN: "First Epicycle",
    },
    SECOND_EPICYCLE: {
      RADIUS_RATIO: 0.038,
      TUBE_RADIUS: 0.08,
      REVOLUTION_PERIOD: 13.6608,
      INCLINATION_DEG: 5, // Galgal Noteh inclination
      LABEL_HE: 'גלגל נוטה',
      LABEL_EN: "Second Epicycle (Inclined)",
    },
  },
};

// Zodiac Ring
export const ZODIAC = {
  RADIUS: 25,
  TUBE_RADIUS: 0.05,
  SEGMENTS: 128,
  OPACITY: 0.3,
};

// Camera Presets
export const CAMERA_PRESETS = {
  OVERVIEW: {
    position: [0, 30, 50],
    target: [0, 0, 0],
    fov: 50,
  },
  EARTH: {
    position: [10, 5, 10],
    target: [0, 0, 0],
    fov: 45,
  },
  EARTH_TILT: {
    position: [20, 0, 0],
    target: [0, 0, 0],
    fov: 45,
  },
  SUN_SYSTEM: {
    position: [15, 10, 15],
    target: [12, 0, 0],
    fov: 45,
  },
  MOON_SYSTEM: {
    position: [10, 8, 10],
    target: [8, 0, 0],
    fov: 45,
  },
  ECLIPTIC: {
    position: [0, 40, 0],
    target: [0, 0, 0],
    fov: 60,
  },
};

// Animation Constants
export const ANIMATION = {
  DAY_PER_SECOND: 0.5, // Half a day per second of animation
  CAMERA_TRANSITION_SPEED: 0.05,
  ORBIT_SPEED_MULTIPLIER: 0.1,
  GLOW_PULSE_SPEED: 2,
};

// Material Properties
export const MATERIALS = {
  GALGAL: {
    transmission: 0.9,
    roughness: 0.1,
    metalness: 0.1,
    thickness: 0.5,
    ior: 1.5, // Index of refraction (glass-like)
  },
  EPICYCLE: {
    roughness: 0.4,
    metalness: 0.6,
    emissiveIntensity: 0.3,
  },
  EARTH: {
    roughness: 0.6,
    metalness: 0.1,
    distort: 0.1,
    speed: 0.5,
  },
};

// Starfield
export const STARS = {
  COUNT: 5000,
  RADIUS: 100,
  DEPTH: 50,
  FACTOR: 4,
  SATURATION: 0,
  FADE: true,
};

// Responsive Breakpoints
export const RESPONSIVE = {
  DESKTOP: {
    minWidth: 1024,
    segments: 64,
    starCount: 5000,
    enableGlow: true,
  },
  TABLET: {
    minWidth: 768,
    segments: 32,
    starCount: 3000,
    enableGlow: true,
  },
  MOBILE: {
    minWidth: 0,
    segments: 16,
    starCount: 1000,
    enableGlow: false,
  },
};

// Hebrew Labels for Constellations
export const MAZALOT_3D = [
  { he: 'טלה', en: 'Aries', angle: 0 },
  { he: 'שור', en: 'Taurus', angle: 30 },
  { he: 'תאומים', en: 'Gemini', angle: 60 },
  { he: 'סרטן', en: 'Cancer', angle: 90 },
  { he: 'אריה', en: 'Leo', angle: 120 },
  { he: 'בתולה', en: 'Virgo', angle: 150 },
  { he: 'מאזנים', en: 'Libra', angle: 180 },
  { he: 'עקרב', en: 'Scorpio', angle: 210 },
  { he: 'קשת', en: 'Sagittarius', angle: 240 },
  { he: 'גדי', en: 'Capricorn', angle: 270 },
  { he: 'דלי', en: 'Aquarius', angle: 300 },
  { he: 'דגים', en: 'Pisces', angle: 330 },
];

// Tooltip Content
export const TOOLTIP_CONTENT = {
  EARTH: {
    title: 'Earth (ארץ)',
    description: 'The center of the geocentric model. Axial tilt: 23.5°',
    reference: 'Hilchot Yesodei HaTorah 3:1',
  },
  SUN_DEFERENT: {
    title: "Sun's Deferent (גלגל גדול)",
    description: 'The main circle carrying the sun\'s epicycle.',
    reference: 'Hilchot Kiddush HaChodesh 13:1',
  },
  SUN_EPICYCLE: {
    title: "Sun's Epicycle (גלגל קטן)",
    description: 'The small circle that corrects the sun\'s position.',
    reference: 'Hilchot Kiddush HaChodesh 13:2',
  },
  MOON_DEFERENT: {
    title: "Moon's Deferent (גלגל גדול)",
    description: 'The main circle carrying the moon\'s epicycles.',
    reference: 'Hilchot Kiddush HaChodesh 17:1',
  },
  MOON_EPICYCLE_1: {
    title: "Moon's First Epicycle (גלגל קטן)",
    description: 'Corrects the moon\'s longitude position.',
    reference: 'Hilchot Kiddush HaChodesh 17:2',
  },
  MOON_EPICYCLE_2: {
    title: "Moon's Second Epicycle (גלגל נוטה)",
    description: 'Creates the moon\'s latitude (inclined 5°).',
    reference: 'Hilchot Kiddush HaChodesh 17:3',
  },
};

// Mouse Interaction
export const INTERACTION = {
  HOVER_RADIUS: 2,
  CLICK_RADIUS: 1,
  DRAG_THRESHOLD: 5,
  ZOOM_MIN: 5,
  ZOOM_MAX: 100,
};
