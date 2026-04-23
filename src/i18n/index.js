/**
 * i18n scaffold — small translation map keyed by UI string id. Read
 * `uiStore.locale` at call time. Intentionally minimal: no library,
 * no plural rules, no context — just a swap table for the handful of
 * chrome strings we want bilingual.
 */
import { useUIStore } from '../stores/uiStore';

const MESSAGES = {
  en: {
    values: 'Values',
    details: 'Details',
    drilldown: 'Drill-Down',
    visibility: 'Visibility',
    rambam: 'Rambam Text',
    tour: 'Tour',
    explore: 'Explore',
    calculate: 'Calculate',
    learn: 'Learn',
    compare: 'Compare',
    reset: 'Reset',
    snap_to_molad: 'Snap to molad',
  },
  he: {
    values: 'ערכים',
    details: 'פרטים',
    drilldown: 'ירידה לפרטים',
    visibility: 'ראיית הירח',
    rambam: 'טקסט הרמב״ם',
    tour: 'סיור',
    explore: 'חקירה',
    calculate: 'חשבון',
    learn: 'לימוד',
    compare: 'השוואה',
    reset: 'איפוס',
    snap_to_molad: 'יישור למולד',
  },
};

export function t(key) {
  const locale = useUIStore.getState().locale || 'en';
  return (MESSAGES[locale] && MESSAGES[locale][key]) || MESSAGES.en[key] || key;
}

/** React hook variant so components re-render on locale change. */
export function useT() {
  const locale = useUIStore((s) => s.locale);
  return (key) => (MESSAGES[locale] && MESSAGES[locale][key]) || MESSAGES.en[key] || key;
}
