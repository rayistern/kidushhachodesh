import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Which panel is showing in the right sidebar: 'drilldown' | 'rambam' | 'none'
  rightPanel: 'drilldown',
  setRightPanel: (panel) => set({ rightPanel: panel }),

  // Active Rambam chapter for the text reader
  activeChapter: 12,
  setActiveChapter: (ch) => set({ activeChapter: ch }),

  // Mobile sidebar open state
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
