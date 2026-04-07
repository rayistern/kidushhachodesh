import { create } from 'zustand';

// Module-level timer so the pulse auto-clears across rapid clicks.
let pulseTimer = null;

/**
 * Map of calculation step IDs → array of galgal IDs that contribute to that
 * step. Used by D2 (Click value highlights chain) so that tapping a value
 * in the sidebar pulses every galgal that participates in producing it.
 *
 * Keep this in sync with the steps emitted by the calculation engine.
 */
export const STEP_CONTRIBUTORS = {
  // Sun
  sunMeanLongitude: ['sun-blue', 'sun-red'],
  sunApogee: ['sun-blue'],
  sunMaslul: ['sun-red'],
  sunMaslulCorrection: ['sun-red'],
  sunTrueLongitude: ['sun-blue', 'sun-red'],

  // Moon
  moonMeanLongitude: ['moon-blue'],
  doubleElongation: ['sun-blue', 'moon-blue'],
  moonMaslul: ['moon-green', 'moon-katan'],
  maslulHanachon: ['moon-green', 'moon-katan'],
  moonTrueLongitude: ['moon-red', 'moon-blue', 'moon-green', 'moon-katan'],
  nodePosition: ['moon-red'],
  moonLatitude: ['moon-red', 'moon-blue'],

  // Visibility (sun and moon together)
  elongation: ['sun-red', 'moon-katan'],
  moonVisibility: ['sun-red', 'moon-katan'],
};

/**
 * Visualization store — controls camera, animation, and display toggles
 * for the 3D scene of the Rambam's mechanical model.
 *
 * Animation model:
 *   - `animationDays` is an OFFSET (in days) added to the calendar `currentDate`
 *     when computing positions in the scene. It is what the time-scrubber controls.
 *   - When `isPlaying` is true, the scene's useFrame loop advances `animationDays`
 *     by `animationSpeed` days per real-world second.
 *   - The calculation engine is NOT re-run on every frame. The mechanism
 *     components compute positions directly from days-since-epoch + offset
 *     using the same formulas as the engine. The sidebar still shows the
 *     calendar-date calculation; the 3D scene shows the live animated state.
 */
export const useVisualizationStore = create((set, get) => ({
  // ── View mode ──
  viewMode: '3d', // '3d' or '2d'
  setViewMode: (mode) => set({ viewMode: mode }),

  // ── Camera presets ──
  // 'overview' | 'sun' | 'moon' | 'losh'  (Rabbi Losh = sideways/equatorial view)
  cameraPreset: 'overview',
  setCameraPreset: (preset) => set({ cameraPreset: preset }),

  // ── Drill-down highlighting ──
  highlightedGalgal: null,
  setHighlightedGalgal: (id) => set({ highlightedGalgal: id }),

  // Pulsing galgalim — temporary highlight set used by D2 (sidebar value
  // click → pulse every galgal that contributes to that step). Auto-clears
  // after a few seconds so the scene doesn't stay frozen in pulse mode.
  pulsingGalgalim: [],
  pulseGalgalim: (ids) => {
    set({ pulsingGalgalim: ids || [] });
    if (typeof window !== 'undefined') {
      if (pulseTimer) clearTimeout(pulseTimer);
      pulseTimer = setTimeout(() => {
        set({ pulsingGalgalim: [] });
        pulseTimer = null;
      }, 2500);
    }
  },
  pulseStep: (stepId) => {
    const ids = STEP_CONTRIBUTORS[stepId] || [];
    set({ pulsingGalgalim: ids });
    if (typeof window !== 'undefined') {
      if (pulseTimer) clearTimeout(pulseTimer);
      pulseTimer = setTimeout(() => {
        set({ pulsingGalgalim: [] });
        pulseTimer = null;
      }, 2500);
    }
  },

  // ── Animation ──
  // Days offset from currentDate. 0 = the calendar date selected in sidebar.
  animationDays: 0,
  setAnimationDays: (days) => set({ animationDays: days }),
  resetAnimation: () => set({ animationDays: 0, isPlaying: false }),
  advanceAnimation: (deltaDays) =>
    set((s) => ({ animationDays: s.animationDays + deltaDays })),

  // Days per real-world second. Presets: 1, 30, 365, 3650.
  animationSpeed: 30,
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),

  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  togglePlaying: () => set((s) => ({ isPlaying: !s.isPlaying })),

  // ── Display toggles ──
  // Default sideways: looking at the ecliptic edge-on with east at the top.
  // This is Rabbi Losh's preferred orientation — the sun moves "up" through
  // the zodiac as it ages, not "around" a north-pole-down map.
  sidewaysAxis: true,
  toggleSidewaysAxis: () => set((s) => ({ sidewaysAxis: !s.sidewaysAxis })),

  showGalgalim: true,
  toggleGalgalim: () => set((s) => ({ showGalgalim: !s.showGalgalim })),

  showDiscs: true,
  toggleDiscs: () => set((s) => ({ showDiscs: !s.showDiscs })),

  showLabels: true,
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),

  // Show the radius lines from Earth → eccentric → body
  showRadii: true,
  toggleRadii: () => set((s) => ({ showRadii: !s.showRadii })),

  // Show "ghost" bodies at the emtzoi (mean longitude) position. The
  // gap to the solid body is the maslul correction made visible.
  showGhosts: false,
  toggleGhosts: () => set((s) => ({ showGhosts: !s.showGhosts })),

  // Show fading trails behind the sun and moon. trailDays is the
  // span of calendar days the trail covers (centered backward from now).
  showTrails: false,
  toggleTrails: () => set((s) => ({ showTrails: !s.showTrails })),
  trailDays: 30,
  setTrailDays: (d) => set({ trailDays: d }),

  // Per-galgal visibility for the V3 isolation toggles. Default all on.
  // Keys: 'sun-blue', 'sun-red', 'moon-red', 'moon-blue', 'moon-green',
  //       'moon-katan'
  galgalVisible: {
    'sun-blue': true,
    'sun-red': true,
    'moon-red': true,
    'moon-blue': true,
    'moon-green': true,
    'moon-katan': true,
  },
  toggleGalgalVisible: (id) =>
    set((s) => ({
      galgalVisible: {
        ...s.galgalVisible,
        [id]: !s.galgalVisible[id],
      },
    })),
  soloGalgal: (id) =>
    set((s) => {
      // If the only-visible galgal is already this one, restore all.
      const allOff = Object.entries(s.galgalVisible).every(
        ([k, v]) => (k === id ? v : !v),
      );
      if (allOff) {
        const all = {};
        Object.keys(s.galgalVisible).forEach((k) => (all[k] = true));
        return { galgalVisible: all };
      }
      const next = {};
      Object.keys(s.galgalVisible).forEach((k) => (next[k] = k === id));
      return { galgalVisible: next };
    }),
  resetGalgalVisibility: () =>
    set((s) => {
      const all = {};
      Object.keys(s.galgalVisible).forEach((k) => (all[k] = true));
      return { galgalVisible: all };
    }),
}));
