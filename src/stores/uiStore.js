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

  // Side panel visibility — default open on desktop, closed on mobile
  leftPanelOpen: isWide(),
  rightPanelOpen: isWide(),
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  // On mobile, opening one panel closes the other so they don't fight for space.
  toggleLeftPanel: () =>
    set((s) => ({
      leftPanelOpen: !s.leftPanelOpen,
      rightPanelOpen: s.isWideViewport ? s.rightPanelOpen : false,
    })),
  toggleRightPanel: () =>
    set((s) => ({
      rightPanelOpen: !s.rightPanelOpen,
      leftPanelOpen: s.isWideViewport ? s.leftPanelOpen : false,
    })),
  closeAllPanels: () => set({ leftPanelOpen: false, rightPanelOpen: false }),

  /**
   * Open the drill-down drawer focused on a specific step. On mobile this
   * pops the right drawer open and closes the left one. On desktop both
   * stay as they were — the right panel just switches tabs.
   */
  showDrilldown: () =>
    set((s) => ({
      rightPanel: 'drilldown',
      rightPanelOpen: true,
      leftPanelOpen: s.isWideViewport ? s.leftPanelOpen : false,
    })),

  // Track viewport size for the layout to react to
  isWideViewport: isWide(),
  setIsWideViewport: (wide) => set({ isWideViewport: wide }),
}));
