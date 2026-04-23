/**
 * Guided walkthroughs (D4) — rich, layman-friendly tours that drive
 * the 3D scene, the calculation chain, and (optionally) jump the
 * Rambam reader to the source halacha.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** content
 *  SURFACE CATEGORY: pedagogical script (not Rambam-published)
 * ═══════════════════════════════════════════════════════════════════
 * Every `stepId` in this file refers to an astronomical-pipeline step.
 * Per roadmap R3: if a fixed-calendar tour is added (e.g. "How does
 * Rosh Chodesh get set by the fixed calendar?"), its stepId references
 * must target fixed-calendar steps exclusively — never mix regimes
 * within one tour. Scope each tour to one regime.
 *
 * Each step shape:
 *   text         — plain-language explanation (2-4 sentences)
 *   stepId       — calculation step to select + pulse
 *   cameraPreset — 'overview' | 'sun' | 'moon' | 'losh'
 *   scene        — optional declarative scene actions:
 *     animationDays  : number       jump the time scrubber to this offset
 *     speed          : number       set animation speed (days/sec)
 *     play           : boolean      play or pause
 *     ghosts         : boolean      toggle "mean-position ghost" markers
 *     trails         : boolean      toggle position trails
 *     solo           : galgalId|null  isolate one galgal (or null for "show all")
 *     showAll        : true         reset galgal visibility
 *   rambam       — optional cross-link the user can click:
 *     chapter, halacha, label
 */
export const WALKTHROUGHS = {
  'moon-tonight': {
    title: 'Why is the moon there tonight?',
    hebrewTitle: 'מדוע הירח שם הלילה?',
    summary: 'A 9-step layman tour from the sun’s plain motion to whether tonight’s new moon can be sighted at sunset. Watch the 3D model do the work.',
    steps: [
      {
        text:
          'Welcome. We’re going to figure out where the moon is in the sky tonight — the same calculation Beis Din used to declare Rosh Chodesh. Start simple: imagine the sun moving steadily through the 12 mazalot, one full lap a year. That steady, averaged motion is called its "mean longitude". Watch the blue galgal carry it forward.',
        stepId: 'sunMeanLongitude',
        cameraPreset: 'sun',
        scene: { animationDays: 0, speed: 30, play: true, ghosts: false, trails: false, showAll: true },
        rambam: { chapter: 12, halacha: 1, label: 'Read KH 12:1 — the mean motion of the sun' },
      },
      {
        text:
          'But the sun doesn’t actually move at a constant speed. It speeds up and slows down depending on where it is in the year — because the orbit isn’t a perfect circle around the earth. The Rambam models this with a second, slightly off-center red galgal. The point on that red galgal furthest from us is called the "apogee" or *govah*.',
        stepId: 'sunApogee',
        cameraPreset: 'sun',
        scene: { ghosts: true, solo: 'sun-red' },
        rambam: { chapter: 12, halacha: 2, label: 'Read KH 12:2 — the apogee' },
      },
      {
        text:
          'Now turn on ghosts: the faint sphere is where the sun *would* be if it moved evenly, and the solid one is where it actually is. The gap between them — sometimes pulling east, sometimes west, never more than ~2° — is the *maslul* correction. That correction is what makes the true sun "true".',
        stepId: 'sunMaslulCorrection',
        cameraPreset: 'sun',
        scene: { ghosts: true, showAll: true, animationDays: 90, speed: 90 },
        rambam: { chapter: 13, halacha: 7, label: 'Read KH 13:7-8 — the sun maslul table' },
      },
      {
        text:
          'OK, the sun is set. Now the moon. The moon is much trickier — it has FOUR galgalim, not two. We start with the "mean moon": the simplest, idealized position. It moves about 13° per day, twelve times faster than the sun.',
        stepId: 'moonMeanLongitude',
        cameraPreset: 'moon',
        scene: { ghosts: false, solo: 'moon-blue', speed: 30, animationDays: 0, play: true },
        rambam: { chapter: 14, halacha: 1, label: 'Read KH 14:1 — the moon’s mean motion' },
      },
      {
        text:
          'The moon also has its own correction — but here’s the wrinkle: how big the correction is depends on how far the moon has pulled ahead of the sun. The Rambam calls this gap the "double elongation" (*merchak kaful*). Twice the moon-minus-sun distance. Watch the scrubber jump forward two weeks; both bodies move, the gap grows.',
        stepId: 'doubleElongation',
        cameraPreset: 'overview',
        scene: { showAll: true, animationDays: 14, speed: 1, play: false, ghosts: false },
        rambam: { chapter: 15, halacha: 1, label: 'Read KH 15:1-2 — double elongation' },
      },
      {
        text:
          'The double elongation feeds into the moon’s small inner sphere — the *galgal katan* (green) — which carries a tiny epicycle (yellow). That little wobble is the moon’s biggest correction, up to about 5°. The "corrected course" is the moon’s anomaly *after* this adjustment.',
        stepId: 'maslulHanachon',
        cameraPreset: 'moon',
        scene: { solo: 'moon-green', ghosts: true },
        rambam: { chapter: 15, halacha: 3, label: 'Read KH 15:3 — the corrected course' },
      },
      {
        text:
          'Combine all four moon galgalim and you get the moon’s *true longitude* — where it actually appears against the mazalot tonight. Toggle the ghosts off and on to see how big the difference is between the simple mean position and the true one.',
        stepId: 'moonTrueLongitude',
        cameraPreset: 'moon',
        scene: { showAll: true, ghosts: true, trails: true, speed: 30, play: true },
        rambam: { chapter: 15, halacha: 4, label: 'Read KH 15:4 — the moon’s true longitude' },
      },
      {
        text:
          'But we’re not done. The moon’s orbit is *tilted* about 5° relative to the sun’s path. So even when it’s lined up east-west with the sun, it can be a bit north or south. That tilt comes from the head of the dragon (*rosh ha-tli*), the point where the moon’s tilted orbit crosses the ecliptic. We need that latitude before Beis Din can decide if the new moon is visible.',
        stepId: 'moonLatitude',
        cameraPreset: 'moon',
        scene: { solo: 'moon-red', ghosts: false, trails: false },
        rambam: { chapter: 16, halacha: 9, label: 'Read KH 16:9-10 — moon latitude' },
      },
      {
        text:
          'Final step. Beis Din needs the moon to be (1) east of the sun by enough degrees, AND (2) not too far north or south, AND (3) above the horizon long enough after sunset to actually be spotted. The arc of vision (*keshes ha-re’iyah*) combines all of these. If it clears the threshold tonight — Rosh Chodesh is declared.',
        stepId: 'moonVisibility',
        cameraPreset: 'overview',
        scene: { showAll: true, ghosts: false, trails: false, animationDays: 0, play: false },
        rambam: { chapter: 17, halacha: 1, label: 'Read KH 17:1 — the four conditions of visibility' },
      },
    ],
  },

  'sun-only': {
    title: 'How does the sun work?',
    hebrewTitle: 'איך עובדת השמש?',
    summary: 'A 4-step deep-dive on just the sun — the mean motion, the apogee, the maslul, and the true longitude.',
    steps: [
      {
        text:
          'The sun’s motion through the mazalot looks steady from earth — but it isn’t quite. Start with the idealized version: a constant 59 minutes 8 seconds per day, all the way around in a year. That’s the "mean longitude".',
        stepId: 'sunMeanLongitude',
        cameraPreset: 'sun',
        scene: { showAll: true, solo: 'sun-blue', speed: 30, play: true, animationDays: 0, ghosts: false },
        rambam: { chapter: 12, halacha: 1, label: 'KH 12:1' },
      },
      {
        text:
          'The Rambam fixes the imperfection with a second sphere whose center is OFFSET from the earth — eccentric. The far point of that offset (where the sun appears slowest from our view) is the *apogee*, or *govah*. It drifts about 1.5° per century, so it’s practically fixed.',
        stepId: 'sunApogee',
        cameraPreset: 'sun',
        scene: { showAll: true, solo: 'sun-red', ghosts: true },
        rambam: { chapter: 12, halacha: 2, label: 'KH 12:2' },
      },
      {
        text:
          'The angle from the apogee to the mean sun is the *maslul* — the sun’s anomaly. The Rambam gives a table (KH 13:7-8) that turns this angle into a correction in degrees: subtract for the first half of the cycle, add for the second.',
        stepId: 'sunMaslul',
        cameraPreset: 'sun',
        scene: { showAll: true, ghosts: true, animationDays: 91, play: false },
        rambam: { chapter: 13, halacha: 7, label: 'KH 13:7-8 — sun table' },
      },
      {
        text:
          'Add (or subtract) the correction from the mean position and you get the sun’s *true* longitude. The gap is never more than about 2° — but it’s the difference between calendar arithmetic and the real sky.',
        stepId: 'sunTrueLongitude',
        cameraPreset: 'sun',
        scene: { showAll: true, ghosts: true, speed: 365, play: true },
        rambam: { chapter: 13, halacha: 11, label: 'KH 13:11' },
      },
    ],
  },

  'visibility': {
    title: 'Will the new moon be sighted tonight?',
    hebrewTitle: 'האם יראה הירח הערב?',
    summary: 'A focused tour of KH chapter 17 — the four conditions Beis Din checks at sunset on the 30th.',
    steps: [
      {
        text:
          'On the 30th of every month, Beis Din watched the western horizon at sunset. They needed to see a thin crescent. But not every month is visible — sometimes the moon is too close to the sun, or too low, or too far north. Let’s walk through the four conditions.',
        stepId: 'moonVisibility',
        cameraPreset: 'overview',
        scene: { showAll: true, animationDays: 0, play: false, ghosts: false, trails: false },
        rambam: { chapter: 17, halacha: 1, label: 'KH 17:1' },
      },
      {
        text:
          'First condition: the *elongation* — how far the moon is east of the sun. If it’s under about 9°, the moon is still drowned in twilight. The Rambam computes this as the difference of true longitudes.',
        stepId: 'elongation',
        cameraPreset: 'overview',
        scene: { ghosts: false },
        rambam: { chapter: 17, halacha: 3, label: 'KH 17:3' },
      },
      {
        text:
          'Second: the moon’s *latitude* — how far north or south of the sun’s path it is tonight. A southern moon needs MORE elongation to be seen than a northern one (it’s lower in the sky).',
        stepId: 'moonLatitude',
        cameraPreset: 'moon',
        scene: { solo: 'moon-red' },
        rambam: { chapter: 17, halacha: 4, label: 'KH 17:4' },
      },
      {
        text:
          'Third: the *first visibility angle* — Rambam combines elongation and latitude into a single number representing how high above the horizon the moon will be when the sun has dropped 9.5° below it.',
        stepId: 'firstVisibilityAngle',
        cameraPreset: 'overview',
        scene: { showAll: true },
        rambam: { chapter: 17, halacha: 6, label: 'KH 17:6' },
      },
      {
        text:
          'Fourth: compare that angle to the threshold table. If it clears the bar, the moon WILL be visible — Beis Din can declare Rosh Chodesh on the testimony of two witnesses. If not, the previous month is *meubar* (full 30 days).',
        stepId: 'moonVisibility',
        cameraPreset: 'overview',
        scene: { showAll: true },
        rambam: { chapter: 17, halacha: 9, label: 'KH 17:9' },
      },
    ],
  },
};

/** Lookup walkthrough id from a calc step id, for cross-link "Take a tour from this step". */
export function tourForStep(stepId) {
  if (!stepId) return null;
  if (stepId.startsWith('sun')) return 'sun-only';
  if (stepId === 'moonVisibility' || stepId === 'firstVisibilityAngle' || stepId === 'elongation') return 'visibility';
  return 'moon-tonight';
}
