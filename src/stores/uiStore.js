import { create } from 'zustand';

/**
 * UI store — controls panel visibility and which sub-view is active.
 */
const isWide = () =>
  typeof window !== 'undefined' && window.innerWidth >= 768;

const BOOKMARK_KEY = 'kh:bookmarks';
const LOCALE_KEY = 'kh:locale';

function loadBookmarks() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(list) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

function loadLocale() {
  if (typeof window === 'undefined') return 'en';
  try { return localStorage.getItem(LOCALE_KEY) || 'en'; } catch { return 'en'; }
}

export const useUIStore = create((set, get) => ({
  // Which panel is showing in the right area: 'drilldown' | 'rambam' | 'walkthrough' | 'visibility'
  rightPanel: 'drilldown',
  setRightPanel: (panel) => set({ rightPanel: panel }),

  // Active Rambam chapter for the text reader
  activeChapter: 12,
  setActiveChapter: (ch) => set({ activeChapter: ch }),

  leftPanelOpen: false,
  rightPanelOpen: false,
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
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

  showDrilldown: () =>
    set((s) => ({
      rightPanel: 'drilldown',
      rightPanelOpen: true,
      leftPanelOpen: s.isWideViewport ? s.leftPanelOpen : false,
    })),

  isWideViewport: isWide(),
  setIsWideViewport: (wide) => set({ isWideViewport: wide }),

  // ── Bookmarks (Phase 4) ──
  // A bookmark is `${chapter}:${halachaIndex}` e.g. "14:3"
  bookmarks: loadBookmarks(),
  toggleBookmark: (ref) => {
    const cur = get().bookmarks;
    const next = cur.includes(ref) ? cur.filter((x) => x !== ref) : [...cur, ref];
    saveBookmarks(next);
    set({ bookmarks: next });
  },
  isBookmarked: (ref) => get().bookmarks.includes(ref),

  // ── i18n locale ──
  locale: loadLocale(),
  setLocale: (l) => {
    try { localStorage.setItem(LOCALE_KEY, l); } catch { /* ignore */ }
    set({ locale: l });
  },
}));
