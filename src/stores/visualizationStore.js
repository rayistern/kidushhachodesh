import { create } from 'zustand';

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
}));
