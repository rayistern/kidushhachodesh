import { create } from 'zustand';

export const useCalendarStore = create((set) => ({
  currentDate: new Date(),
  setDate: (date) => set({ currentDate: new Date(date) }),
  adjustDays: (days) => set((state) => {
    const d = new Date(state.currentDate);
    d.setDate(d.getDate() + days);
    return { currentDate: d };
  }),
}));
