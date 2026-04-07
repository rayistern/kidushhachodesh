import { create } from 'zustand';

/**
 * UI store — controls panel visibility and which sub-view is active.
 *
 * Auto-collapse rule: on narrow screens (< md), both side panels default
 * to closed and become overlay drawers. On wide screens, they're pinned
 * open inline. The breakpoint matches Tailwind's `md` (768px).
 */
const isWide = () =>
  typeof window !== 'undefined' && window.innerWidth >= 768;

export const useUIStore = create((set) => ({
  // Which panel is showing in the right area: 'drilldown' | 'rambam'
  rightPanel: 'drilldown',
  setRightPanel: (panel) => set({ rightPanel: panel }),

  // Active Rambam chapter for the text reader
  activeChapter: 12,
  setActiveChapter: (ch) => set({ activeChapter: ch }),

  // Side panels default closed on every viewport so the 3D visualization
  // gets center stage on first load. Header toggles make their existence
  // obvious.
  leftPanelOpen: false,
  rightPanelOpen: false,
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  // Opening one panel always closes the other — both panels are overlay
  // drawers, and stacking them would hide the scene entirely.
  toggleLeftPanel: () =>
    set((s) => ({
      leftPanelOpen: !s.leftPanelOpen,
      rightPanelOpen: false,
    })),
  toggleRightPanel: () =>
    set((s) => ({
      rightPanelOpen: !s.rightPanelOpen,
      leftPanelOpen: false,
    })),
  closeAllPanels: () => set({ leftPanelOpen: false, rightPanelOpen: false }),

  // Track viewport size for the layout to react to
  isWideViewport: isWide(),
  setIsWideViewport: (wide) => set({ isWideViewport: wide }),
}));
