import { create } from 'zustand';

export const useVisualizationStore = create((set) => ({
  // Which view mode: '3d' or '2d'
  viewMode: '3d',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Camera preset
  cameraPreset: 'overview',
  setCameraPreset: (preset) => set({ cameraPreset: preset }),

  // Which galgal is highlighted (for drill-down linking)
  highlightedGalgal: null,
  setHighlightedGalgal: (id) => set({ highlightedGalgal: id }),

  // Animation speed multiplier
  animationSpeed: 1,
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),

  // Whether animation is playing
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),

  // Sideways axis mode (Rabbi Losh orientation)
  sidewaysAxis: false,
  toggleSidewaysAxis: () => set((s) => ({ sidewaysAxis: !s.sidewaysAxis })),

  // Show/hide galgalim spheres
  showGalgalim: true,
  toggleGalgalim: () => set((s) => ({ showGalgalim: !s.showGalgalim })),

  // Show/hide orbital discs
  showDiscs: true,
  toggleDiscs: () => set((s) => ({ showDiscs: !s.showDiscs })),

  // Show/hide labels
  showLabels: true,
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
}));
