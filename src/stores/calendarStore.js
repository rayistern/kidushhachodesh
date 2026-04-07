import { create } from 'zustand';

export const useCalendarStore = create((set) => ({
  currentDate: new Date(),
  setDate: (date) => set({ currentDate: new Date(date) }),
  setDateFromISO: (iso) => {
    if (!iso) return;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) set({ currentDate: d });
  },
  adjustDays: (days) => set((state) => {
    const d = new Date(state.currentDate);
    d.setDate(d.getDate() + days);
    return { currentDate: d };
  }),
}));
