import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCalendarStore } from '../stores/calendarStore';
import { useUIStore } from '../stores/uiStore';

/**
 * One-way sync: URL params → Zustand stores. Mounted once per route
 * inside <AppShell>. Kept intentionally simple — we don't push store
 * changes back into the URL to avoid navigation loops.
 */
export function useRouteSync(preset) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const setDateFromISO = useCalendarStore((s) => s.setDateFromISO);
  const setRightPanel = useUIStore((s) => s.setRightPanel);
  const setRightPanelOpen = useUIStore((s) => s.setRightPanelOpen);
  const setLeftPanelOpen = useUIStore((s) => s.setLeftPanelOpen);
  const setActiveChapter = useUIStore((s) => s.setActiveChapter);

  // Apply preset side effects once per route change.
  useEffect(() => {
    if (preset === 'calculate') {
      if (params.date) setDateFromISO(params.date);
      setRightPanel('drilldown');
      setRightPanelOpen(true);
    } else if (preset === 'learn') {
      if (params.chapter) {
        const ch = parseInt(params.chapter, 10);
        if (ch >= 11 && ch <= 19) setActiveChapter(ch);
      }
      setRightPanel('rambam');
      setRightPanelOpen(true);
    } else if (preset === 'explore') {
      setLeftPanelOpen(false);
      setRightPanelOpen(false);
    }
    // 'home' does nothing — default dashboard.
  }, [preset, params.date, params.chapter]); // eslint-disable-line react-hooks/exhaustive-deps

  return { navigate, location };
}
