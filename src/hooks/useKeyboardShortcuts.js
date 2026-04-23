import { useEffect } from 'react';
import { useCalendarStore } from '../stores/calendarStore';
import { useUIStore } from '../stores/uiStore';

/**
 * Global keyboard shortcuts. Intentionally narrow: only the non-obvious
 * power-user bindings. Date adjust uses [ / ] because they don't conflict
 * with any native browser shortcut.
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e) => {
      // Ignore while typing in inputs
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;

      if (e.key === '[') {
        useCalendarStore.getState().adjustDays(-1);
      } else if (e.key === ']') {
        useCalendarStore.getState().adjustDays(1);
      } else if (e.key === 'Escape') {
        useUIStore.getState().closeAllPanels();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
